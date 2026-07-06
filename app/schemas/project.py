from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: str
    title: str
    document_path: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisReportOut(BaseModel):
    id: str
    project_id: str
    summary: Optional[str] = None
    novelty_score: Optional[float] = None
    patentability_score: Optional[float] = None
    report_path: Optional[str] = None
    page_count: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisRunResponse(BaseModel):
    project_id: str
    status: str
    message: str
