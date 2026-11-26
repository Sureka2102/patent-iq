import fitz
import pytest

from app.services import patent_search_service


def _make_pdf(text="Patent document describing a thermal battery system"):
    document = fitz.open()
    document.new_page().insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


async def _auth_headers(client):
    await client.post(
        "/api/auth/register",
        json={"name": "Patent User", "email": "patent@test.com", "password": "pass123"},
    )
    login = await client.post(
        "/api/auth/login",
        json={"email": "patent@test.com", "password": "pass123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.mark.asyncio
async def test_patent_upload_persists_and_searches_real_pdf_text(client, monkeypatch):
    monkeypatch.setattr(patent_search_service, "embed_texts", lambda texts: [[0.1, 0.2] for _ in texts])
    monkeypatch.setattr(patent_search_service, "embed_text", lambda text: [0.1, 0.2])
    headers = await _auth_headers(client)

    upload = await client.post(
        "/api/patents/upload",
        headers=headers,
        data={
            "title": "Thermal battery system",
            "publication_number": "US-TEST-1",
            "jurisdiction": "US",
            "source_url": "https://example.org/patent",
        },
        files={"file": ("thermal.pdf", _make_pdf(), "application/pdf")},
    )

    assert upload.status_code == 201
    record = upload.json()
    assert record["publication_number"] == "US-TEST-1"
    assert (await client.get("/api/patents", headers=headers)).json()[0]["id"] == record["id"]

    matches = patent_search_service.search_patents("thermal battery", limit=1)
    assert len(matches) == 1
    assert matches[0]["id"] == record["id"]
    assert "thermal battery" in matches[0]["excerpt"].lower()


@pytest.mark.asyncio
async def test_patent_upload_rejects_scanned_pdf(client):
    headers = await _auth_headers(client)
    document = fitz.open()
    document.new_page()
    content = document.tobytes()
    document.close()

    response = await client.post(
        "/api/patents/upload",
        headers=headers,
        files={"file": ("scanned.pdf", content, "application/pdf")},
    )

    assert response.status_code == 400
    assert "OCR" in response.json()["detail"]
