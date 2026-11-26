from typing import Optional, List, Any
from typing_extensions import TypedDict


class AgentState(TypedDict):
    project_id: str
    user_id: str
    file_path: str
    raw_text: str
    page_count: int
    summary: str
    features: str
    innovations: str
    similar_documents: List[dict]
    similarity_analysis: str
    novelty_score: float
    novelty_reasoning: str
    patentability_score: float
    recommendations: str
    final_assessment: str
    report_path: str
    error: Optional[str]
