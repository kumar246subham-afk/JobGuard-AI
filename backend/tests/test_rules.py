import pytest
from backend.app.ml.rules import (
    analyze_rules,
    generate_company_checklist,
    get_safety_recommendations
)

def test_analyze_rules_detects_scam_patterns():
    scam_job = {
        "title": "Data Entry Operator - Work from Home",
        "company_name": "",
        "company_profile": "",
        "description": "Earn $500 daily for simple typing work. Registration fee of $50 required. 100% guaranteed job offer. Contact on Telegram: @scamrecruiter",
        "requirements": "",
        "benefits": "",
        "has_company_logo": 0
    }
    indicators, warnings, risk_score = analyze_rules(scam_job)
    
    assert len(indicators) > 0
    assert len(warnings) > 0
    assert risk_score >= 50.0  # Should be flagged with high risk
    
    # Check that fee and telegram/guarantee were captured
    categories = [ind["category"] for ind in indicators]
    assert "Upfront Payment or Fees" in categories
    assert "Guaranteed Hiring / No Interview" in categories
    assert "Unprofessional Contact Channels" in categories

def test_analyze_rules_legitimate_job():
    legit_job = {
        "title": "Frontend Engineer",
        "company_name": "Acme Software Corp",
        "company_profile": "Acme is a global SaaS company founded in 2012 providing enterprise software.",
        "description": "We are seeking a React developer to design high-performance user interfaces.",
        "requirements": "Strong JavaScript, TypeScript, React, and CSS knowledge.",
        "benefits": "Medical, dental, vision insurance, and 401(k) matching.",
        "has_company_logo": 1
    }
    indicators, warnings, risk_score = analyze_rules(legit_job)
    # Legitimate job shouldn't trigger payment or guaranteed scam patterns
    categories = [ind["category"] for ind in indicators]
    assert "Upfront Payment or Fees" not in categories
    assert "Guaranteed Hiring / No Interview" not in categories
    assert risk_score < 20.0

def test_generate_company_checklist():
    job_info = {
        "company_name": "Stripe",
        "company_profile": "Stripe is a financial infrastructure platform for businesses.",
        "website_url": "https://stripe.com",
        "has_company_logo": 1
    }
    checklist = generate_company_checklist(job_info)
    assert checklist["company_name"]["status"] == "provided"
    assert checklist["company_profile"]["status"] == "provided"
    assert checklist["website_url"]["status"] == "provided"
    assert checklist["company_logo"]["status"] == "provided"
    assert checklist["verification_status"]["status"] == "unverified"

def test_safety_recommendations():
    recs = get_safety_recommendations("HIGH", is_internship=True)
    assert len(recs) >= 5
    assert any("Never pay registration fees" in r for r in recs)
    assert any("TPO" in r for r in recs)
