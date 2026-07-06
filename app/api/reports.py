from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from beanie import PydanticObjectId
from app.models.user import User
from app.models.project import Project, AnalysisReport
from app.schemas.project import AnalysisReportOut
from app.api.deps import get_current_user
import os

router = APIRouter(prefix="/reports", tags=["Reports"])


async def _get_report(project_id: str, user_id: str) -> AnalysisReport:
    project = await Project.get(PydanticObjectId(project_id))
    if not project or project.user_id != user_id:
        raise HTTPException(status_code=404, detail="Project not found")
    report = await AnalysisReport.find_one(AnalysisReport.project_id == project_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not generated yet")
    return report


def _report_out(r: AnalysisReport) -> AnalysisReportOut:
    return AnalysisReportOut(
        id=str(r.id),
        project_id=r.project_id,
        summary=r.summary,
        novelty_score=r.novelty_score,
        patentability_score=r.patentability_score,
        report_path=r.report_path,
        page_count=r.page_count,
        created_at=r.created_at,
    )


@router.get("/{project_id}", response_model=AnalysisReportOut)
async def get_report(project_id: str, current_user: User = Depends(get_current_user)):
    report = await _get_report(project_id, str(current_user.id))
    return _report_out(report)


@router.get("/download/{project_id}")
async def download_report(project_id: str, current_user: User = Depends(get_current_user)):
    report = await _get_report(project_id, str(current_user.id))
    if not report.report_path or not os.path.exists(report.report_path):
        raise HTTPException(status_code=404, detail="PDF report file not found")
    return FileResponse(
        path=report.report_path,
        media_type="application/pdf",
        filename=f"patentiq_report_{project_id}.pdf",
    )
