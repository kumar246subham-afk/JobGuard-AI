import pytest
import pandas as pd
from backend.app.ml.preprocessor import (
    clean_html,
    normalize_text,
    TextCombiner,
    StructuredFeatureExtractor
)

def test_clean_html():
    raw = "<p>Join our <b>dynamic</b> team! Click <a href='https://example.com'>here</a>.</p>"
    cleaned = clean_html(raw)
    assert "<p>" not in cleaned
    assert "<b>" not in cleaned
    assert "url" in cleaned
    assert "dynamic team" in cleaned

def test_normalize_text():
    raw = "<h1>URGENT HIRING!!</h1> Email: hr@scam.com & earn $$$"
    norm = normalize_text(raw)
    assert "urgent hiring" in norm
    assert "email" in norm
    assert "scam.com" not in norm  # replaced with 'email'

def test_text_combiner():
    combiner = TextCombiner()
    df = pd.DataFrame([{
        "title": "Data Analyst Intern",
        "company_profile": "Leading analytics consultancy.",
        "description": "Assist with data cleaning and dashboard generation.",
        "requirements": "Python, SQL, communication skills.",
        "benefits": "Competitive stipend and mentorship."
    }])
    transformed = combiner.transform(df)
    assert len(transformed) == 1
    assert "analyst" in transformed[0]
    assert "python" in transformed[0]
    assert "stipend" in transformed[0]

def test_structured_feature_extractor():
    extractor = StructuredFeatureExtractor()
    df = pd.DataFrame([{
        "has_company_logo": 1,
        "has_questions": 1,
        "telecommuting": 0,
        "company_profile": "Established organization with long standing presence.",
        "requirements": "3+ years engineering experience with cloud architecture.",
        "benefits": "Healthcare, 401k, paid time off.",
        "description": "Full job description text with detailed duties and responsibilities."
    }])
    feats = extractor.transform(df)
    assert feats.shape == (1, 7)
    assert feats[0][0] == 1.0  # has_logo
    assert feats[0][1] == 1.0  # has_questions
    assert feats[0][2] == 0.0  # telecommuting
    assert feats[0][3] == 1.0  # has_cp
