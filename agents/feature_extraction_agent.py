from app.graph.state import AgentState
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are a technical feature extraction expert. Analyze the following project document and extract:

1. Problem Statement
2. Objectives (bullet list)
3. Key Features (bullet list)
4. Technology Stack
5. Architecture Details

Document (first 5000 chars):
{text}

Return structured plain text with clear section headers."""


def feature_extraction_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[FeatureExtractor] Extracting features for project {state['project_id']}")
    features = call_llm(PROMPT.format(text=state["raw_text"][:5000]))
    return {**state, "features": features}
