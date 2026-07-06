from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

_client: AsyncIOMotorClient = None


def get_client() -> AsyncIOMotorClient:
    return _client


async def connect_db():
    global _client
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    from app.models.user import User
    from app.models.project import Project, AnalysisReport
    await init_beanie(
        database=_client[settings.MONGODB_DB_NAME],
        document_models=[User, Project, AnalysisReport],
    )


async def close_db():
    if _client:
        _client.close()
