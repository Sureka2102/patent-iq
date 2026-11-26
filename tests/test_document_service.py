import pytest
from unittest.mock import patch, MagicMock
import fitz
from docx import Document
from pptx import Presentation
from app.services.document_service import extract_document


def test_unsupported_extension():
    with pytest.raises(ValueError, match="Unsupported"):
        extract_document("file.txt")


def test_pdf_extraction():
    mock_page = MagicMock()
    mock_page.get_text.return_value = "Hello PDF"
    mock_doc = MagicMock()
    mock_doc.__iter__ = MagicMock(return_value=iter([mock_page]))
    mock_doc.page_count = 1
    mock_doc.__enter__.return_value = mock_doc

    with patch("fitz.open", return_value=mock_doc):
        result = extract_document("test.pdf")

    assert result["page_count"] == 1
    assert "Hello PDF" in result["raw_text"]


def test_docx_and_pptx_extract_text(tmp_path):
    docx_path = tmp_path / "sample.docx"
    doc = Document()
    doc.add_paragraph("DOCX technical description")
    doc.save(docx_path)

    pptx_path = tmp_path / "sample.pptx"
    presentation = Presentation()
    slide = presentation.slides.add_slide(presentation.slide_layouts[6])
    slide.shapes.add_textbox(0, 0, 3000000, 300000).text = "PPTX technical description"
    presentation.save(pptx_path)

    assert "DOCX technical description" in extract_document(str(docx_path))["raw_text"]
    assert "PPTX technical description" in extract_document(str(pptx_path))["raw_text"]
    assert extract_document(str(docx_path))["page_count"] == 0
    assert extract_document(str(pptx_path))["page_count"] == 0


def test_scanned_or_unreadable_pdf_is_rejected(tmp_path):
    path = tmp_path / "empty.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.save(path)
    doc.close()

    with pytest.raises(ValueError, match="no selectable text"):
        extract_document(str(path))
