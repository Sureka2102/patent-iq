import re
from app.graph.state import AgentState
from app.utils.llm import call_llm
from app.core.logging import logger

PROMPT = """You are an AI patent research assistant. Estimate novelty using the supplied project details and matching local patent records. This is a preliminary research estimate, not a legal opinion.

1. NOVELTY_SCORE: A score from 0-100 (integer) representing how novel this project is
2. PATENTABILITY_SCORE: A score from 0-100 (integer) representing patentability potential
3. REASONING: Explain the scores using the retrieved prior-art evidence (150-200 words)
4. STRENGTHS: List 3-5 strong novel aspects
5. WEAKNESSES: List 3-5 areas lacking novelty or patentability

Summary: {summary}
Features: {features}
Innovations: {innovations}
Local patent corpus search and uploaded-project comparison: {similarity}

Do not invent patents, facts, or citations. Distinguish novelty from non-obviousness. The local patent corpus may be incomplete, and an empty search result is not proof that the project is novel; explain search limitations and uncertainty.

IMPORTANT: Start your response with exactly:
NOVELTY_SCORE: <number>
PATENTABILITY_SCORE: <number>

Then continue with the rest."""


def _extract_score(text: str, key: str) -> float:
    match = re.search(rf"{key}:\s*(\d+(?:\.\d+)?)", text, re.IGNORECASE)
    if not match:
        raise ValueError(f"The model response did not contain a valid {key}.")
    score = float(match.group(1))
    if not 0 <= score <= 100:
        raise ValueError(f"The model returned an out-of-range {key}.")
    return score


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
