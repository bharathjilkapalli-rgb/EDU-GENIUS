import os
import io
from pathlib import Path
from typing import Tuple

async def extract_text_from_file(file_path: str, filename: str) -> Tuple[str, int]:
    """Extract text from PDF, DOCX, or TXT files. Returns (text, word_count)."""
    ext = Path(filename).suffix.lower()
    text = ""

    if ext == ".pdf":
        text = await _extract_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        text = await _extract_docx(file_path)
    elif ext in [".txt", ".md"]:
        text = await _extract_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    text = _clean_text(text)
    word_count = len(text.split())
    return text, word_count

async def _extract_pdf(file_path: str) -> str:
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        return "\n".join(text_parts)
    except ImportError:
        try:
            import PyPDF2
            text_parts = []
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text_parts.append(page.extract_text() or "")
            return "\n".join(text_parts)
        except ImportError:
            raise ImportError("Install pdfplumber or PyPDF2: pip install pdfplumber")

async def _extract_docx(file_path: str) -> str:
    try:
        import docx
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except ImportError:
        raise ImportError("Install python-docx: pip install python-docx")

async def _extract_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def _clean_text(text: str) -> str:
    """Clean extracted text."""
    import re
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 3000, overlap: int = 200) -> list:
    """Split text into overlapping chunks for processing."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks
