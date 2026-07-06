import fitz  # PyMuPDF
from docx import Document
from pptx import Presentation
from pathlib import Path
from typing import TypedDict


class ParsedDocument(TypedDict):
    raw_text: str
    page_count: int


def _extract_pdf(path: str) -> ParsedDocument:
    doc = fitz.open(path)
    text = "\n".join(page.get_text() for page in doc)
    return {"raw_text": text.strip(), "page_count": doc.page_count}


def _extract_docx(path: str) -> ParsedDocument:
    doc = Document(path)
    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return {"raw_text": text.strip(), "page_count": len(doc.sections)}


def _extract_pptx(path: str) -> ParsedDocument:
    prs = Presentation(path)
    slides_text = []
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                slides_text.append(shape.text_frame.text)
    text = "\n".join(slides_text)
    return {"raw_text": text.strip(), "page_count": len(prs.slides)}


def extract_document(file_path: str) -> ParsedDocument:
    ext = Path(file_path).suffix.lower()
    extractors = {".pdf": _extract_pdf, ".docx": _extract_docx, ".pptx": _extract_pptx}
    extractor = extractors.get(ext)
    if not extractor:
        raise ValueError(f"Unsupported file type: {ext}")
    return extractor(file_path)
