from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import inspect, text
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def connect_db():
    from app.models.user import User
    from app.models.project import Project, AnalysisReport
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_add_analysis_error_column)


def _add_analysis_error_column(connection):
    columns = {column["name"] for column in inspect(connection).get_columns("projects")}
    if "analysis_error" not in columns:
        connection.execute(text("ALTER TABLE projects ADD COLUMN analysis_error TEXT"))


async def close_db():
    await engine.dispose()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
