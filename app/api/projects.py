from fastapi import APIRouter, UploadFile, File, Depends
from typing import List
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectOut
from app.api.deps import get_current_user
from app.utils.file_utils import validate_and_save_upload

router = APIRouter(prefix="/projects", tags=["Projects"])


def _project_out(p: Project) -> ProjectOut:
    return ProjectOut(id=str(p.id), title=p.title, document_path=p.document_path, status=p.status, created_at=p.created_at)


@router.post("/upload", response_model=ProjectOut, status_code=201)
async def upload_project(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    file_path, title = validate_and_save_upload(file, str(current_user.id))
    project = Project(user_id=str(current_user.id), title=title, document_path=file_path)
    await project.insert()
    return _project_out(project)


@router.get("", response_model=List[ProjectOut])
async def list_projects(current_user: User = Depends(get_current_user)):
    projects = await Project.find(Project.user_id == str(current_user.id)).sort(-Project.created_at).to_list()
    return [_project_out(p) for p in projects]
