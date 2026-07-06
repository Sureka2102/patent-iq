from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from beanie import PydanticObjectId
from app.models.user import User
from app.models.project import Project, AnalysisReport
from app.schemas.project import AnalysisRunResponse
from app.api.deps import get_current_user
from app.graph.pipeline import get_compiled_graph
from app.graph.state import AgentState
from app.core.logging import logger

router = APIRouter(prefix="/analysis", tags=["Analysis"])


async def _run_pipeline(project_id: str, file_path: str):
    graph = get_compiled_graph()
    initial_state: AgentState = {
        "project_id": project_id,
        "file_path": file_path,
        "raw_text": "",
        "page_count": 0,
        "summary": "",
        "features": "",
        "innovations": "",
        "similar_documents": [],
        "similarity_analysis": "",
        "novelty_score": 0.0,
        "novelty_reasoning": "",
        "patentability_score": 0.0,
        "recommendations": "",
        "final_assessment": "",
        "report_path": "",
        "error": None,
    }
    try:
        project = await Project.get(PydanticObjectId(project_id))
        project.status = "processing"
        await project.save()

        final_state = graph.invoke(initial_state)

        project = await Project.get(PydanticObjectId(project_id))
        if final_state.get("error"):
            project.status = "failed"
            await project.save()
            return

        report = AnalysisReport(
            project_id=project_id,
            summary=final_state.get("summary"),
            novelty_score=final_state.get("novelty_score"),
            patentability_score=final_state.get("patentability_score"),
            report_path=final_state.get("report_path"),
            page_count=final_state.get("page_count"),
        )
        await report.insert()
        project.status = "completed"
        await project.save()

    except Exception as e:
        logger.error(f"Pipeline error for project {project_id}: {e}")
        try:
            project = await Project.get(PydanticObjectId(project_id))
            project.status = "failed"
            await project.save()
        except Exception:
            pass


@router.post("/run/{project_id}", response_model=AnalysisRunResponse)
async def run_analysis(
    project_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    project = await Project.get(PydanticObjectId(project_id))
    if not project or project.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Project not found")
    if project.status == "processing":
        raise HTTPException(status_code=409, detail="Analysis already in progress")

    background_tasks.add_task(_run_pipeline, project_id, project.document_path)
    return AnalysisRunResponse(project_id=project_id, status="processing", message="Analysis pipeline started")
