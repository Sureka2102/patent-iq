from app.graph.state import AgentState
from app.services.report_service import generate_pdf_report
from app.utils.llm import call_llm
from app.core.logging import logger

FINAL_ASSESSMENT_PROMPT = """Provide a final 2-3 sentence assessment verdict for this project:

Novelty Score: {novelty_score}/100
Patentability Score: {patentability_score}/100
Key Innovations: {innovations}

Give a clear, professional verdict on whether this project is worth pursuing for patent protection."""


def report_generation_agent(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
    logger.info(f"[ReportGenerator] Generating report for project {state['project_id']}")

    final_assessment = call_llm(FINAL_ASSESSMENT_PROMPT.format(
        novelty_score=state.get("novelty_score", 0),
        patentability_score=state.get("patentability_score", 0),
        innovations=state.get("innovations", ""),
    ))

    report_data = {
        "summary": state.get("summary", ""),
        "features": state.get("features", ""),
        "innovations": state.get("innovations", ""),
        "similarity_analysis": state.get("similarity_analysis", ""),
        "novelty_score": state.get("novelty_score", 0),
        "patentability_score": state.get("patentability_score", 0),
        "novelty_reasoning": state.get("novelty_reasoning", ""),
        "recommendations": state.get("recommendations", ""),
        "final_assessment": final_assessment,
    }

    report_path = generate_pdf_report(state["project_id"], report_data)
    logger.info(f"[ReportGenerator] Report saved to {report_path}")
    return {**state, "report_path": report_path, "final_assessment": final_assessment}
