from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import EmailStr


class User(Document):
    name: str
    email: EmailStr
    password_hash: str
    created_at: datetime = None

    def __init__(self, **data):
        if "created_at" not in data:
            data["created_at"] = datetime.now(timezone.utc)
        super().__init__(**data)

    class Settings:
        name = "users"
        indexes = ["email"]
