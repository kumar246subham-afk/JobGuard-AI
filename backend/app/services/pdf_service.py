import io
from typing import Dict, Any
from pypdf import PdfReader
from fastapi import UploadFile, HTTPException
from ..config import settings
from ..utils.logger import logger

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text content from PDF file bytes in memory using pypdf.
    Does not write to disk to protect user privacy and avoid temporary file leaks.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(text)
        
        full_text = "\n".join(pages_text).strip()
        if not full_text:
            raise ValueError("The uploaded PDF appears to be empty or contains only non-selectable scanned images.")
        
        return full_text
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to read PDF document: {str(e)}")

def parse_pdf_text_to_job(raw_text: str, filename: str) -> Dict[str, Any]:
    """
    Heuristically partitions raw extracted PDF text into structured job fields
    for downstream ML and heuristic scoring.
    """
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    
    title = lines[0] if lines else filename.replace(".pdf", "").replace("_", " ")
    if len(title) > 120:
        title = title[:120]

    # Look for common section headers
    description = raw_text
    requirements = ""
    benefits = ""
    company_profile = ""

    # Simple heuristic splitting
    lower_text = raw_text.lower()
    
    req_idx = lower_text.find("requirement")
    if req_idx == -1:
        req_idx = lower_text.find("qualifications")

    ben_idx = lower_text.find("benefit")
    if ben_idx == -1:
        ben_idx = lower_text.find("perks")

    about_idx = lower_text.find("about us")
    if about_idx == -1:
        about_idx = lower_text.find("company overview")

    if about_idx != -1 and req_idx != -1 and about_idx < req_idx:
        company_profile = raw_text[about_idx:req_idx][:500]
    
    if req_idx != -1:
        end_idx = ben_idx if (ben_idx != -1 and ben_idx > req_idx) else (req_idx + 800)
        requirements = raw_text[req_idx:end_idx]

    if ben_idx != -1:
        benefits = raw_text[ben_idx:ben_idx + 600]

    return {
        "title": title,
        "company_name": "Extracted from PDF",
        "company_profile": company_profile or "Profile extracted from uploaded document.",
        "description": description[:4000],
        "requirements": requirements or "Refer to PDF description.",
        "benefits": benefits or "Not explicitly detailed in document.",
        "location": "Unspecified / See PDF",
        "employment_type": "Full-time",
        "required_experience": "Unspecified",
        "required_education": "Unspecified",
        "industry": "General",
        "function": "General",
        "website_url": None,
        "telecommuting": 0,
        "has_company_logo": 0,
        "has_questions": 0
    }

async def process_pdf_upload(file: UploadFile) -> Dict[str, Any]:
    """
    Validates file extension, size limit, and extracts job information.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only .pdf files are accepted."
        )

    content = await file.read()
    if len(content) > settings.MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_PDF_SIZE_BYTES // (1024 * 1024)} MB."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty (0 bytes)."
        )

    extracted_text = extract_text_from_pdf(content)
    job_data = parse_pdf_text_to_job(extracted_text, file.filename)
    job_data["_extracted_char_count"] = len(extracted_text)
    return job_data
