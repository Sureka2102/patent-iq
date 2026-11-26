from app.graph.state import AgentState
from app.services.embedding_service import store_document, query_similar
from app.services.patent_search_service import search_patents
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are a patent prior-art research assistant. Assess the project using only the supplied local patent records and uploaded-project matches.

Matching records from the local patent corpus:
{patent_results}

Previously uploaded project matches (not patent records):
{uploaded_matches}

Current project summary:
{summary}

Explain the strongest overlaps and differences. Do not invent patents, facts, or citations. If no patent search results were returned, state that explicitly and do not treat an empty search as proof of novelty.

Keep it concise (150-200 words)."""


def similarity_analysis_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[SimilarityAnalyzer] Running similarity analysis for project {state['project_id']}")

    # Keep user-uploaded project matches separate from patent search results.
    store_document(
        state["project_id"],
        state["raw_text"],
        state["user_id"],
        {"title": f"project_{state['project_id']}"},
    )
    uploaded_matches = query_similar(
        state["raw_text"],
        user_id=state["user_id"],
        exclude_project_id=state["project_id"],
    )
    patent_results = search_patents(
        "\n".join((state.get("summary", ""), state.get("features", ""), state.get("innovations", "")))
    )

    patent_text = "\n".join(
        f"- {item.get('publication_number') or item['id']} — {item['title']}. "
        f"Jurisdiction: {item.get('jurisdiction') or 'not supplied'}. "
        f"Source: {item.get('source') or 'Local patent corpus'}. "
        f"Source URL: {item.get('source_url') or 'not supplied'}. "
        f"Document excerpt: {item.get('excerpt', '')[:700]}"
        for item in patent_results
    ) or "The local patent corpus contains no matching records."
    uploaded_text = "\n".join(
        f"- Uploaded project {item['id']}: {item['document'][:200]}"
        for item in uploaded_matches
    ) or "No similar user-uploaded projects were found."

    analysis = call_llm(PROMPT.format(
        patent_results=patent_text,
        uploaded_matches=uploaded_text,
        summary=state.get("summary", ""),
    ))
    if patent_results:
        citations = "\n\nMatching records from the local patent corpus:\n" + "\n".join(
            "\n".join(filter(None, [
                f"[{index}] {item.get('publication_number') or item['id']} — {item['title']}",
                f"Jurisdiction: {item.get('jurisdiction')}" if item.get("jurisdiction") else None,
                f"Source: {item.get('source') or 'Local patent corpus'}",
                f"File: {item.get('filename')}" if item.get("filename") else None,
                f"Source URL: {item['source_url']}" if item.get("source_url") else None,
                f"Excerpt: {item.get('excerpt', '')[:500]}",
            ]))
            for index, item in enumerate(patent_results, start=1)
        )
    else:
        citations = "\n\nNo local patent records matched this project. This does not establish novelty."

    return {
        **state,
        "similar_documents": patent_results + uploaded_matches,
        "similarity_analysis": analysis + citations,
    }
