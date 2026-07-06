import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient
from app.models.user import User
from app.models.project import Project, AnalysisReport


@pytest_asyncio.fixture(autouse=True)
async def setup_mongo():
    client = AsyncMongoMockClient()
    await init_beanie(database=client["test_db"], document_models=[User, Project, AnalysisReport])
    yield


@pytest_asyncio.fixture
async def client(setup_mongo):
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
