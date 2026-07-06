import re
from app.graph.state import AgentState
from app.services.document_service import extract_document
from app.core.logging import logger


def document_parser_agent(state: AgentState) -> AgentState:
    logger.info(f"[DocumentParser] Processing project {state['project_id']}")
    try:
        result = extract_document(state["file_path"])
        raw = result["raw_text"]
        # Basic cleaning
        raw = re.sub(r"\n{3,}", "\n\n", raw)
        raw = re.sub(r"[ \t]{2,}", " ", raw)
        return {**state, "raw_text": raw.strip(), "page_count": result["page_count"]}
    except Exception as e:
        logger.error(f"[DocumentParser] Error: {e}")
        return {**state, "error": str(e)}
