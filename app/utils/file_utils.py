import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.core.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx"}


def validate_and_save_upload(file: UploadFile, user_id: int) -> tuple[str, str]:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported. Allowed: {ALLOWED_EXTENSIONS}")

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    content = file.file.read()
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
    file_path = str(Path(settings.UPLOAD_DIR) / filename)

    with open(file_path, "wb") as f:
        f.write(content)

    stem = Path(file.filename).stem
    title = stem.replace("_", " ").replace("-", " ").title()
    return file_path, title
