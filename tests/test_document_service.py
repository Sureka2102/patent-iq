import pytest
from unittest.mock import patch, MagicMock
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

    with patch("fitz.open", return_value=mock_doc):
        result = extract_document("test.pdf")

    assert result["page_count"] == 1
    assert "Hello PDF" in result["raw_text"]
