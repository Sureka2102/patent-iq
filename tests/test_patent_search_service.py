import fitz
import pytest

from app.core.config import settings
from app.services import patent_search_service as service
from app.services import embedding_service


class FakeCollection:
    def __init__(self):
        self.records = {}

    def upsert(self, ids, documents, embeddings, metadatas):
        for record_id, document, embedding, metadata in zip(ids, documents, embeddings, metadatas):
            self.records[record_id] = {
                "document": document,
                "embedding": embedding,
                "metadata": metadata,
            }

    def count(self, where=None):
        return len(self._select(where=where))

    def get(self, ids=None, where=None, limit=None, offset=0, include=None):
        if ids is not None:
            records = [(record_id, self.records[record_id]) for record_id in ids if record_id in self.records]
        else:
            records = self._select(where=where)
        records = records[offset:]
        if limit is not None:
            records = records[:limit]
        return {
            "ids": [record_id for record_id, _ in records],
            "metadatas": [record["metadata"] for _, record in records],
        }

    def query(self, query_embeddings, n_results, include=None, where=None):
        records = self._select(where=where)[:n_results]
        return {
            "ids": [[record_id for record_id, _ in records]],
            "documents": [[record["document"] for _, record in records]],
            "metadatas": [[record["metadata"] for _, record in records]],
            "distances": [[0.2 for _ in records]],
        }

    def delete(self, ids):
        for record_id in ids:
            self.records.pop(record_id, None)

    def _select(self, where=None):
        records = list(self.records.items())
        if not where:
            return records
        if "$and" in where:
            return [record for record in records if all(self._matches(record[1]["metadata"], item) for item in where["$and"])]
        return [record for record in records if self._matches(record[1]["metadata"], where)]

    @staticmethod
    def _matches(metadata, condition):
        for key, expected in condition.items():
            if key == "$and":
                if not all(FakeCollection._matches(metadata, item) for item in expected):
                    return False
            elif isinstance(expected, dict) and "$ne" in expected:
                if metadata.get(key) == expected["$ne"]:
                    return False
            elif metadata.get(key) != expected:
                return False
        return True


def _make_pdf(text="Patent document with readable text"):
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


def test_index_patent_pdf_stores_file_and_chroma_metadata(monkeypatch, tmp_path):
    collection = FakeCollection()
    monkeypatch.setattr(settings, "PATENT_UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(service, "_get_corpus_collection", lambda: collection)
    monkeypatch.setattr(service, "embed_texts", lambda texts: [[0.1, 0.2] for _ in texts])

    record = service.index_patent_pdf(
        _make_pdf(),
        "patent.pdf",
        title="Sample patent",
        publication_number="US1234567A1",
        jurisdiction="US",
        source_url="https://example.com/patent",
    )

    stored = collection.records[f"{record['id']}:00000"]
    assert record["title"] == "Sample patent"
    assert stored["metadata"]["publication_number"] == "US1234567A1"
    assert stored["metadata"]["source"] == "Manual PDF upload"
    assert stored["metadata"]["chunk_index"] == 0
    assert (tmp_path / f"{record['id']}.pdf").exists()
    assert "Patent document" in stored["document"]
    assert len(service.list_patent_records()) == 1


def test_search_returns_corpus_source_and_details(monkeypatch):
    collection = FakeCollection()
    collection.records["patent-id"] = {
        "document": "A patent about thermal battery storage.",
        "embedding": [0.1],
        "metadata": {
            "title": "Thermal battery",
            "publication_number": "EP123A1",
            "jurisdiction": "EP",
            "source": "Manual PDF upload",
            "source_url": "https://example.com/EP123A1",
            "filename": "thermal.pdf",
        },
    }
    monkeypatch.setattr(service, "_get_corpus_collection", lambda: collection)
    monkeypatch.setattr(service, "embed_text", lambda text: [0.1])

    matches = service.search_patents("thermal battery")

    assert matches[0]["publication_number"] == "EP123A1"
    assert matches[0]["source"] == "Manual PDF upload"
    assert matches[0]["source_url"] == "https://example.com/EP123A1"
    assert "thermal battery" in matches[0]["excerpt"]


def test_search_returns_requested_number_of_distinct_patents(monkeypatch):
    collection = FakeCollection()
    for index in range(4):
        collection.records[f"patent-{index}:00000"] = {
            "document": f"Battery patent {index}",
            "embedding": [0.1],
            "metadata": {"patent_id": f"patent-{index}", "title": f"Patent {index}"},
        }
    monkeypatch.setattr(service, "_get_corpus_collection", lambda: collection)
    monkeypatch.setattr(service, "embed_text", lambda text: [0.1])

    matches = service.search_patents("battery", limit=2)

    assert len(matches) == 2
    assert len({match["id"] for match in matches}) == 2


def test_failed_reindex_does_not_delete_existing_patent(monkeypatch, tmp_path):
    collection = FakeCollection()
    content = _make_pdf()
    record = service.index_patent_pdf
    patent_id = __import__("hashlib").sha256(content).hexdigest()
    existing_id = f"{patent_id}:00000"
    collection.records[existing_id] = {
        "document": "Existing indexed patent",
        "embedding": [0.1, 0.2],
        "metadata": {"patent_id": patent_id, "chunk_index": 0},
    }
    monkeypatch.setattr(settings, "PATENT_UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(service, "_get_corpus_collection", lambda: collection)
    monkeypatch.setattr(service, "embed_texts", lambda texts: (_ for _ in ()).throw(RuntimeError("embedding unavailable")))

    with pytest.raises(service.PatentSearchError, match="could not be indexed"):
        record(content, "patent.pdf")

    assert existing_id in collection.records


def test_project_vectors_are_scoped_to_owner_and_exclude_self(monkeypatch):
    collection = FakeCollection()
    monkeypatch.setattr(embedding_service, "_get_chroma_collection", lambda: collection)
    monkeypatch.setattr(embedding_service, "embed_text", lambda text: [0.1])
    embedding_service.store_document("project-a", "private A", "user-a")
    embedding_service.store_document("project-b", "private B", "user-b")
    collection.records["legacy-project"] = {
        "document": "legacy private text",
        "embedding": [0.1],
        "metadata": {"project_id": "legacy-project"},
    }

    user_a = embedding_service.query_similar("query", user_id="user-a")
    user_b = embedding_service.query_similar("query", user_id="user-b", exclude_project_id="project-b")

    assert [match["id"] for match in user_a] == ["project-a"]
    assert user_b == []


def test_rejects_non_pdf_and_scanned_pdf(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "PATENT_UPLOAD_DIR", str(tmp_path))

    with pytest.raises(service.PatentCorpusError, match="Only PDF"):
        service.index_patent_pdf(b"content", "patent.docx")

    with pytest.raises(service.PatentCorpusError, match="selectable text"):
        service.index_patent_pdf(_make_pdf(""), "scanned.pdf")


def test_chunking_includes_later_claim_text():
    text = ("background details " * 120) + " claims: unique polymer actuator mechanism"

    chunks = service._chunk_text(text)

    assert len(chunks) > 1
    assert any("unique polymer actuator mechanism" in chunk for chunk in chunks)
