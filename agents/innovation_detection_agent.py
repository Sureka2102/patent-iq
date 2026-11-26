from app.graph.state import AgentState
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are an innovation and patent analyst. Review the following project document and identify:

1. Novel Components (things that appear technically new or unique)
2. Unique Technical Contributions
3. Innovation Claims (what the project claims to do better or differently than existing solutions)
4. Potential Patent-Worthy Ideas

Document summary: {summary}

Full text (first 4000 chars): {text}

Return structured plain text with clear section headers. Be specific and technical."""


def innovation_detection_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[InnovationDetector] Detecting innovations for project {state['project_id']}")
    innovations = call_llm(PROMPT.format(summary=state.get("summary", ""), text=state["raw_text"][:4000]))
    return {**state, "innovations": innovations}
