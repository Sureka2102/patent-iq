import fitz
import pytest


def _make_pdf(text="Test project with readable text"):
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


async def _register_and_login(client, email):
    await client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": email, "password": "pass123"},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "pass123"},
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.mark.asyncio
async def test_project_upload_and_list_are_owner_scoped(client):
    first_user = await _register_and_login(client, "first@test.com")
    upload = await client.post(
        "/api/projects/upload",
        headers=first_user,
        files={"file": ("project.pdf", _make_pdf(), "application/pdf")},
    )

    assert upload.status_code == 201
    project = upload.json()
    assert project["status"] == "uploaded"
    assert "\\" not in project["document_path"]
    assert "/" not in project["document_path"]
    assert (await client.get("/api/projects", headers=first_user)).json()[0]["id"] == project["id"]

    second_user = await _register_and_login(client, "second@test.com")
    assert (await client.get("/api/projects", headers=second_user)).json() == []
    assert (await client.post(
        f"/api/analysis/run/{project['id']}",
        headers=second_user,
    )).status_code == 404


@pytest.mark.asyncio
async def test_project_upload_rejects_invalid_and_oversized_files(client, monkeypatch):
    headers = await _register_and_login(client, "upload@test.com")

    invalid = await client.post(
        "/api/projects/upload",
        headers=headers,
        files={"file": ("project.pdf", b"not a pdf", "application/pdf")},
    )
    assert invalid.status_code == 400

    from app.core.config import settings

    monkeypatch.setattr(settings, "MAX_FILE_SIZE_MB", 1)
    oversized = await client.post(
        "/api/projects/upload",
        headers=headers,
        files={"file": ("large.pdf", b"%PDF-" + b"x" * (1024 * 1024), "application/pdf")},
    )
    assert oversized.status_code == 413


@pytest.mark.asyncio
async def test_uploaded_project_analysis_report_and_pdf_workflow(
    client, test_session_factory, tmp_path, monkeypatch
):
    headers = await _register_and_login(client, "workflow@test.com")
    upload = await client.post(
        "/api/projects/upload",
        headers=headers,
        files={"file": ("project.pdf", _make_pdf(), "application/pdf")},
    )
    assert upload.status_code == 201
    project_id = upload.json()["id"]

    from app.api import analysis
    from app.services.report_service import generate_pdf_report

    def invoke(state):
        assert state["user_id"]
        report_data = {
            "summary": "Mocked summary for an isolated workflow test.",
            "features": "Mocked extracted feature.",
            "innovations": "Mocked innovation.",
            "similarity_analysis": (
                "No patent records are indexed; no match does not establish novelty."
            ),
            "novelty_score": 75,
            "patentability_score": 65,
            "novelty_reasoning": "Mocked preliminary reasoning.",
            "recommendations": "Mocked recommendation.",
            "final_assessment": "Mocked preliminary assessment.",
        }
        report_path = generate_pdf_report(project_id, report_data)
        return {
            **state,
            **report_data,
            "report_path": report_path,
            "page_count": 1,
            "error": None,
        }

    class MockGraph:
        def invoke(self, state):
            return invoke(state)

    monkeypatch.setattr(analysis, "get_compiled_graph", lambda: MockGraph())
    monkeypatch.setattr(analysis, "AsyncSessionLocal", test_session_factory)

    started = await client.post(
        f"/api/analysis/run/{project_id}",
        headers=headers,
    )
    assert started.status_code == 200
    assert started.json()["status"] == "processing"

    projects = await client.get("/api/projects", headers=headers)
    assert projects.status_code == 200
    assert projects.json()[0]["status"] == "completed"

    report = await client.get(f"/api/reports/{project_id}", headers=headers)
    assert report.status_code == 200
    assert report.json()["novelty_score"] == 75
    assert report.json()["similarity_analysis"].startswith("No patent records")

    pdf = await client.get(
        f"/api/reports/download/{project_id}",
        headers=headers,
    )
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")
