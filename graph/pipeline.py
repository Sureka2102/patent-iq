from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.agents import (
    document_parser_agent,
    summarization_agent,
    feature_extraction_agent,
    innovation_detection_agent,
    similarity_analysis_agent,
    novelty_assessment_agent,
    recommendation_agent,
    report_generation_agent,
)


def _should_continue(state: AgentState) -> str:
    return "end" if state.get("error") else "continue"


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("document_parser", document_parser_agent)
    graph.add_node("summarizer", summarization_agent)
    graph.add_node("feature_extractor", feature_extraction_agent)
    graph.add_node("innovation_detector", innovation_detection_agent)
    graph.add_node("similarity_analyzer", similarity_analysis_agent)
    graph.add_node("novelty_assessor", novelty_assessment_agent)
    graph.add_node("recommendation_agent", recommendation_agent)
    graph.add_node("report_generator", report_generation_agent)

    graph.set_entry_point("document_parser")

    pipeline = [
        ("document_parser", "summarizer"),
        ("summarizer", "feature_extractor"),
        ("feature_extractor", "innovation_detector"),
        ("innovation_detector", "similarity_analyzer"),
        ("similarity_analyzer", "novelty_assessor"),
        ("novelty_assessor", "recommendation_agent"),
        ("recommendation_agent", "report_generator"),
    ]

    for src, dst in pipeline:
        graph.add_conditional_edges(src, _should_continue, {"continue": dst, "end": END})

    graph.add_edge("report_generator", END)
    return graph


def get_compiled_graph():
    return build_graph().compile()
