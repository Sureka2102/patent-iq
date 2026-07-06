from functools import lru_cache
from typing import List
import chromadb
from sentence_transformers import SentenceTransformer
from app.core.config import settings


@lru_cache
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(settings.EMBEDDING_MODEL)


@lru_cache
def _get_chroma_collection():
    client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
    return client.get_or_create_collection("patent_documents")


def embed_text(text: str) -> List[float]:
    return _get_model().encode(text).tolist()


def store_document(project_id: str, text: str, metadata: dict = None):
    collection = _get_chroma_collection()
    embedding = embed_text(text[:8000])  # truncate for embedding
    collection.upsert(
        ids=[str(project_id)],
        embeddings=[embedding],
        documents=[text[:8000]],
        metadatas=[metadata or {"project_id": project_id}],
    )


def query_similar(text: str, n_results: int = 5) -> List[dict]:
    collection = _get_chroma_collection()
    embedding = embed_text(text[:8000])
    count = collection.count()
    if count == 0:
        return []
    results = collection.query(query_embeddings=[embedding], n_results=min(n_results, count))
    similar = []
    for i, doc_id in enumerate(results["ids"][0]):
        similar.append({
            "id": doc_id,
            "document": results["documents"][0][i][:300],
            "distance": results["distances"][0][i] if results.get("distances") else None,
        })
    return similar
