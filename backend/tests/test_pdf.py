import io
import pytest
from pypdf import PdfWriter
from backend.app.services.pdf_service import extract_text_from_pdf, parse_pdf_text_to_job

def test_extract_text_and_parse_pdf():
    # Create an in-memory PDF
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    # Empty page should raise ValueError
    with pytest.raises(Exception):
        extract_text_from_pdf(pdf_bytes)

def test_parse_pdf_text_to_job():
    sample_text = (
        "Senior Cloud Architect\n"
        "About Us: We are an international tech consulting firm.\n"
        "Requirements: 5+ years AWS and Kubernetes experience.\n"
        "Benefits: Competitive salary and flexible remote work."
    )
    job = parse_pdf_text_to_job(sample_text, "cloud_architect.pdf")
    assert job["title"] == "Senior Cloud Architect"
    assert "Requirements" in sample_text
    assert job["company_name"] == "Extracted from PDF"
