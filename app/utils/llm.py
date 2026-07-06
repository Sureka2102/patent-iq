from functools import lru_cache
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from app.core.config import settings


@lru_cache
def _get_llm() -> ChatGroq:
    return ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0.3,
        api_key=settings.GROQ_API_KEY,
    )


def call_llm(prompt: str) -> str:
    llm = _get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content
