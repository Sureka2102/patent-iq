import re
from app.graph.state import AgentState
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are a patent examiner and novelty assessment expert. Based on the following analysis, provide:

1. NOVELTY_SCORE: A score from 0-100 (integer) representing how novel this project is
2. PATENTABILITY_SCORE: A score from 0-100 (integer) representing patentability potential
3. REASONING: Explain the scores with specific reasoning (150-200 words)
4. STRENGTHS: List 3-5 strong novel aspects
5. WEAKNESSES: List 3-5 areas lacking novelty or patentability

Summary: {summary}
Features: {features}
Innovations: {innovations}
Similarity Analysis: {similarity}

IMPORTANT: Start your response with exactly:
NOVELTY_SCORE: <number>
PATENTABILITY_SCORE: <number>

Then continue with the rest."""


def _extract_score(text: str, key: str) -> float:
    match = re.search(rf"{key}:\s*(\d+(?:\.\d+)?)", text, re.IGNORECASE)
    return float(match.group(1)) if match else 50.0


def novelty_assessment_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[NoveltyAssessor] Assessing novelty for project {state['project_id']}")

    response = call_llm(PROMPT.format(
        summary=state.get("summary", ""),
        features=state.get("features", ""),
        innovations=state.get("innovations", ""),
        similarity=state.get("similarity_analysis", ""),
    ))

    novelty_score = _extract_score(response, "NOVELTY_SCORE")
    patentability_score = _extract_score(response, "PATENTABILITY_SCORE")

    return {**state, "novelty_score": novelty_score, "patentability_score": patentability_score, "novelty_reasoning": response}
