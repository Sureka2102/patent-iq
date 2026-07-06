from app.graph.state import AgentState
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are a patent strategy consultant. Based on this project analysis, provide actionable recommendations:

1. Feature Improvement Suggestions (3-5 specific improvements to strengthen novelty)
2. Innovation Opportunities (2-3 areas where the project could introduce new innovations)
3. Patentability Improvements (3-5 specific steps to improve patent filing prospects)
4. Prior Art Concerns (any areas that may face prior art challenges)

Novelty Score: {novelty_score}/100
Patentability Score: {patentability_score}/100
Innovations Detected: {innovations}
Similarity Analysis: {similarity}

Be specific and actionable. Format with clear numbered sections."""


def recommendation_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[RecommendationAgent] Generating recommendations for project {state['project_id']}")

    recommendations = call_llm(PROMPT.format(
        novelty_score=state.get("novelty_score", 0),
        patentability_score=state.get("patentability_score", 0),
        innovations=state.get("innovations", ""),
        similarity=state.get("similarity_analysis", ""),
    ))
    return {**state, "recommendations": recommendations}
