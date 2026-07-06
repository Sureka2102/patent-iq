import os
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from app.core.config import settings


def _para(text: str, style) -> Paragraph:
    safe = str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, style)


def generate_pdf_report(project_id: str, data: dict) -> str:
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    report_path = str(Path(settings.REPORTS_DIR) / f"report_{project_id}.pdf")

    doc = SimpleDocTemplate(report_path, pagesize=A4, leftMargin=inch, rightMargin=inch, topMargin=inch, bottomMargin=inch)
    styles = getSampleStyleSheet()
    heading1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=colors.HexColor("#1a237e"), fontSize=18)
    heading2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=colors.HexColor("#283593"), fontSize=13)
    body = styles["BodyText"]
    body.leading = 16

    story = []

    # Title
    story.append(_para("PatentIQ – Novelty Assessment Report", heading1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1a237e")))
    story.append(Spacer(1, 12))

    # Scores table
    novelty = data.get("novelty_score", 0)
    patentability = data.get("patentability_score", 0)
    score_data = [
        ["Metric", "Score"],
        ["Novelty Score", f"{novelty:.1f} / 100"],
        ["Patentability Score", f"{patentability:.1f} / 100"],
    ]
    tbl = Table(score_data, colWidths=[3 * inch, 2 * inch])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#e8eaf6"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 16))

    sections = [
        ("Executive Summary", data.get("summary", "N/A")),
        ("Extracted Features", data.get("features", "N/A")),
        ("Detected Innovations", data.get("innovations", "N/A")),
        ("Similarity Analysis", data.get("similarity_analysis", "N/A")),
        ("Novelty Assessment Reasoning", data.get("novelty_reasoning", "N/A")),
        ("Recommendations", data.get("recommendations", "N/A")),
        ("Final Assessment", data.get("final_assessment", "N/A")),
    ]

    for title, content in sections:
        story.append(_para(title, heading2))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#9fa8da")))
        story.append(Spacer(1, 6))
        story.append(_para(str(content), body))
        story.append(Spacer(1, 14))

    doc.build(story)
    return report_path
