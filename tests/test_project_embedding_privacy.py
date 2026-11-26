import importlib

from app.core.config import settings
from app.services import embedding_service


def test_similarity_prompt_contains_only_same_users_other_projects(monkeypatch, tmp_path):
    similarity_module = importlib.import_module("app.agents.similarity_analysis_agent")
    monkeypatch.setattr(settings, "CHROMA_DB_PATH", str(tmp_path / "chroma"))
    embedding_service._get_chroma_collection.cache_clear()
    monkeypatch.setattr(embedding_service, "embed_text", lambda text: [0.1, 0.2])
    monkeypatch.setattr(similarity_module, "store_document", embedding_service.store_document)
    monkeypatch.setattr(similarity_module, "query_similar", embedding_service.query_similar)
    monkeypatch.setattr(similarity_module, "search_patents", lambda text: [])
    captured_prompts = []
    monkeypatch.setattr(
        similarity_module,
        "call_llm",
        lambda prompt: captured_prompts.append(prompt) or "No patent records matched.",
    )

    embedding_service.store_document("alice-prior", "ALICE_PRIVATE_TEXT", "alice")
    embedding_service.store_document("bob-project", "BOB_PRIVATE_TEXT", "bob")
    legacy_collection = embedding_service._get_chroma_collection()
    legacy_collection.upsert(
        ids=["legacy-project"],
        embeddings=[[0.1, 0.2]],
        documents=["LEGACY_PRIVATE_TEXT"],
        metadatas=[{"project_id": "legacy-project"}],
    )

    state = {
        "project_id": "alice-current",
        "user_id": "alice",
        "file_path": "unused.pdf",
        "raw_text": "ALICE_CURRENT_TEXT",
        "page_count": 1,
        "summary": "summary",
        "features": "features",
        "innovations": "innovations",
        "similar_documents": [],
        "similarity_analysis": "",
        "novelty_score": 0.0,
        "novelty_reasoning": "",
        "patentability_score": 0.0,
        "recommendations": "",
        "final_assessment": "",
        "report_path": "",
        "error": None,
    }

    result = similarity_module.similarity_analysis_agent(state)
    prompt = captured_prompts[0]

    assert "ALICE_PRIVATE_TEXT" in prompt
    assert "BOB_PRIVATE_TEXT" not in prompt
    assert "LEGACY_PRIVATE_TEXT" not in prompt
    assert "ALICE_CURRENT_TEXT" not in prompt
    assert all(match["id"] != "alice-current" for match in result["similar_documents"])
    embedding_service._get_chroma_collection.cache_clear()
