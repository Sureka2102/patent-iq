from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field
from bson import ObjectId


class Project(Document):
    user_id: str
    title: str
    document_path: str
    status: str = "uploaded"  # uploaded | processing | completed | failed
    created_at: datetime = None

    def __init__(self, **data):
        if "created_at" not in data:
            data["created_at"] = datetime.now(timezone.utc)
        super().__init__(**data)

    class Settings:
        name = "projects"
        indexes = ["user_id"]


class AnalysisReport(Document):
    project_id: str
    summary: Optional[str] = None
    novelty_score: Optional[float] = None
    patentability_score: Optional[float] = None
    report_path: Optional[str] = None
    page_count: Optional[int] = None
    created_at: datetime = None

    def __init__(self, **data):
        if "created_at" not in data:
            data["created_at"] = datetime.now(timezone.utc)
        super().__init__(**data)

    class Settings:
        name = "analysis_reports"
        indexes = ["project_id"]
