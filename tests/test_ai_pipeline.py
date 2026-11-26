import importlib

import fitz
import pytest

from app.core.config import settings
from app.graph.pipeline import get_compiled_graph


def _make_pdf(path):
    document = fitz.open()
    document.new_page().insert_text((72, 72), "A technical project using adaptive battery control.")
    document.save(path)
    document.close()


def test_eight_node_pipeline_passes_state_in_order(monkeypatch, tmp_path):
    names = [
        "summarization_agent",
        "feature_extraction_agent",
        "innovation_detection_agent",
        "similarity_analysis_agent",
        "novelty_assessment_agent",
        "recommendation_agent",
        "report_generation_agent",
    ]
    modules = {
        name: importlib.import_module(f"app.agents.{name}")
        for name in names
    }
    calls = []

    responses = {
        "summarization_agent": "summary result",
        "feature_extraction_agent": "feature result",
        "innovation_detection_agent": "innovation result",
        "similarity_analysis_agent": "No local patent match.",
        "novelty_assessment_agent": "NOVELTY_SCORE: 75\nPATENTABILITY_SCORE: 65\nreasoning",
        "recommendation_agent": "recommendations result",
        "report_generation_agent": "final assessment result",
    }
    for name, module in modules.items():
        monkeypatch.setattr(
            module,
            "call_llm",
            lambda prompt, node=name: calls.append(node) or responses[node],
        )

    monkeypatch.setattr(modules["similarity_analysis_agent"], "store_document", lambda *args, **kwargs: None)
    monkeypatch.setattr(modules["similarity_analysis_agent"], "query_similar", lambda *args, **kwargs: [])
    monkeypatch.setattr(modules["similarity_analysis_agent"], "search_patents", lambda *args, **kwargs: [])
    monkeypatch.setattr(
        modules["report_generation_agent"],
        "generate_pdf_report",
        lambda project_id, data: str(tmp_path / "report.pdf"),
    )
    pdf_path = tmp_path / "project.pdf"
    _make_pdf(pdf_path)

    result = get_compiled_graph().invoke({
        "project_id": "project-1",
        "user_id": "user-1",
        "file_path": str(pdf_path),
        "raw_text": "",
        "page_count": 0,
        "summary": "",
        "features": "",
        "innovations": "",
        "similar_documents": [],
        "similarity_analysis": "",
        "novelty_score": 0.0,
        "novelty_reasoning": "",
        "patentability_score": 0.0,
        "recommendations": "",
        "final_assessment": "",
        "report_path": "",
        "error": None,
    })

    assert calls == names
    assert result["page_count"] == 1
    assert result["novelty_score"] == 75
    assert result["patentability_score"] == 65
    assert result["recommendations"] == "recommendations result"
    assert result["report_path"] == str(tmp_path / "report.pdf")
    assert "does not establish novelty" in result["similarity_analysis"]


def test_pipeline_stops_on_groq_failure(monkeypatch, tmp_path):
    summarizer = importlib.import_module("app.agents.summarization_agent")
    monkeypatch.setattr(
        settings,
        "GROQ_API_KEY",
        "test-key",
    )
    from app.utils import llm

    monkeypatch.setattr(
        llm,
        "_get_llm",
        lambda: type("FailingLLM", (), {"invoke": lambda self, messages: (_ for _ in ()).throw(RuntimeError("provider down"))})(),
    )
    monkeypatch.setattr(summarizer, "call_llm", llm.call_llm)
    pdf_path = tmp_path / "project.pdf"
    _make_pdf(pdf_path)
    state = {
        "project_id": "project-1",
        "user_id": "user-1",
        "file_path": str(pdf_path),
        "raw_text": "",
        "page_count": 0,
        "summary": "",
        "features": "",
        "innovations": "",
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

    with pytest.raises(llm.LLMProviderError):
        get_compiled_graph().invoke(state)


def test_missing_groq_key_fails_before_network_call(monkeypatch):
    from app.utils import llm

    monkeypatch.setattr(settings, "GROQ_API_KEY", "")
    monkeypatch.setattr(llm, "_get_llm", lambda: pytest.fail("LLM should not be constructed"))

    with pytest.raises(llm.LLMConfigurationError, match="GROQ_API_KEY"):
        llm.call_llm("test")


def test_score_parser_rejects_malformed_and_out_of_range_scores():
    novelty = importlib.import_module("app.agents.novelty_assessment_agent")

    assert novelty._extract_score("NOVELTY_SCORE: 0", "NOVELTY_SCORE") == 0
    assert novelty._extract_score("PATENTABILITY_SCORE: 100", "PATENTABILITY_SCORE") == 100
    with pytest.raises(ValueError):
        novelty._extract_score("NOVELTY_SCORE: 101", "NOVELTY_SCORE")
    with pytest.raises(ValueError):
        novelty._extract_score("no score", "NOVELTY_SCORE")
