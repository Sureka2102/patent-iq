from app.graph.state import AgentState
from app.services.embedding_service import store_document, query_similar
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are a similarity analysis expert. Based on these similar documents found in the database:

{similar_docs}

And the current project summary:
{summary}

Provide a similarity analysis describing:
1. How similar this project is to existing work
2. Key overlapping concepts
3. What differentiates this project

Keep it concise (150-200 words)."""


def similarity_analysis_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[SimilarityAnalyzer] Running similarity analysis for project {state['project_id']}")

    # Store current document in ChromaDB
    store_document(state["project_id"], state["raw_text"], {"title": f"project_{state['project_id']}"})

    # Query similar documents
    similar = query_similar(state["raw_text"])
    # Filter out self
    similar = [s for s in similar if s["id"] != state["project_id"]]

    if similar:
        similar_text = "\n".join([f"- Document {s['id']}: {s['document'][:200]}" for s in similar])
    else:
        similar_text = "No similar documents found in the database yet."

    analysis = call_llm(PROMPT.format(similar_docs=similar_text, summary=state.get("summary", "")))
    return {**state, "similar_documents": similar, "similarity_analysis": analysis}
