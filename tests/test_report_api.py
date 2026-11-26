import uuid

import fitz
import pytest

from app.models.project import AnalysisReport
from app.services.report_service import generate_pdf_report


def _make_pdf():
    document = fitz.open()
    document.new_page().insert_text((72, 72), "A report test project.")
    content = document.tobytes()
    document.close()
    return content


async def _register(client, email):
    await client.post(
        "/api/auth/register",
        json={"name": "Report User", "email": email, "password": "pass123"},
    )
    login = await client.post("/api/auth/login", json={"email": email, "password": "pass123"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.mark.asyncio
async def test_report_retrieval_download_and_owner_check(client, test_session_factory):
    owner_headers = await _register(client, "report-owner@test.com")
    upload = await client.post(
        "/api/projects/upload",
        headers=owner_headers,
        files={"file": ("report.pdf", _make_pdf(), "application/pdf")},
    )
    project_id = upload.json()["id"]
    report_path = generate_pdf_report(project_id, {
        "summary": "Test summary",
        "features": "Test features",
        "innovations": "Test innovations",
        "similarity_analysis": "No patent matches.",
        "novelty_score": 72,
        "patentability_score": 64,
        "novelty_reasoning": "Preliminary reasoning",
        "recommendations": "Test recommendations",
        "final_assessment": "Preliminary assessment",
    })
    async with test_session_factory() as session:
        session.add(AnalysisReport(
            id=str(uuid.uuid4()),
            project_id=project_id,
            summary="Test summary",
            features="Test features",
            innovations="Test innovations",
            similarity_analysis="No patent matches.",
            novelty_score=72,
            patentability_score=64,
            novelty_reasoning="Preliminary reasoning",
            recommendations="Test recommendations",
            final_assessment="Preliminary assessment",
            report_path=report_path,
            page_count=1,
        ))
        await session.commit()

    report = await client.get(f"/api/reports/{project_id}", headers=owner_headers)
    download = await client.get(f"/api/reports/download/{project_id}", headers=owner_headers)

    assert report.status_code == 200
    assert report.json()["novelty_score"] == 72
    assert report.json()["report_path"] == "report_" + project_id + ".pdf"
    assert download.status_code == 200
    assert download.content.startswith(b"%PDF-")

    other_headers = await _register(client, "report-other@test.com")
    assert (await client.get(f"/api/reports/{project_id}", headers=other_headers)).status_code == 404
    assert (await client.get(f"/api/reports/download/{project_id}", headers=other_headers)).status_code == 404

