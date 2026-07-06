from app.graph.state import AgentState
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are an expert technical analyst. Given the following project document text, generate a concise executive summary covering:
1. Project Goal
2. Project Scope
3. Key Technologies Used
4. Target Users / Domain

Document (first 4000 chars):
{text}

Return a clear, structured summary in 200-300 words."""


def summarization_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[Summarizer] Summarizing project {state['project_id']}")
    summary = call_llm(PROMPT.format(text=state["raw_text"][:4000]))
    return {**state, "summary": summary}
