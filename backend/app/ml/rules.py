import re
from typing import Dict, List, Any, Tuple

# Suspicious keyword & pattern categories for Job & Internship scams
SCAM_PATTERNS = {
    "monetary_demands": {
        "category": "Upfront Payment or Fees",
        "severity": "high",
        "patterns": [
            r"\b(registration|processing|application|training|onboarding|equipment)\s+fee\b",
            r"\bsecurity\s+deposit\b",
            r"\bpay\s+(\$|₹|rs|inr|usd)?\s*\d+\s*(to\s+apply|to\s+register|for\s+materials|for\s+laptop)\b",
            r"\brefundable\s+deposit\b",
            r"\bbank\s+transfer\s+required\b",
            r"\bcrypto(currency)?\s+payment\b",
            r"\bgift\s+card\b",
            r"\bwestern\s+union|moneygram\b"
        ],
        "description": "Legitimate employers and internships never ask candidates to pay registration, equipment, or training fees."
    },
    "guaranteed_offers": {
        "category": "Guaranteed Hiring / No Interview",
        "severity": "high",
        "patterns": [
            r"\b100%\s*(guaranteed|placement|job\s+offer)\b",
            r"\bno\s+interview\s+needed\b",
            r"\bdirect\s+selection\s+without\s+interview\b",
            r"\binstant\s+offer\s+letter\b",
            r"\bguaranteed\s+hiring\b",
            r"\beveryone\s+gets\s+selected\b"
        ],
        "description": "Legitimate jobs require technical evaluations or interviews. Direct guaranteed selections without assessment are common scam hallmarks."
    },
    "unrealistic_compensation": {
        "category": "Unrealistic Compensation / Easy Money",
        "severity": "medium",
        "patterns": [
            r"\bearn\s+(\$|₹|rs)?\s*\d{3,}\s*(per\s+day|daily|per\s+hour\s+for\s+students)\b",
            r"\bearn\s+up\s+to\s+\$?\d{5,}\s*with\s+no\s+experience\b",
            r"\bwork\s+(1|2)\s+hours?\s+(a\s+day|daily)\s+and\s+earn\b",
            r"\btyping\s+jobs?\s*-\s*earn\b",
            r"\bcopy\s+paste\s+work\b",
            r"\bform\s+filling\s+job\b",
            r"\bquick\s+rich|get\s+rich\b"
        ],
        "description": "Claims of very high earnings for negligible work (e.g. simple typing or 1 hour/day) often signal data entry/task scams."
    },
    "sensitive_info_requests": {
        "category": "Premature Sensitive Information Request",
        "severity": "high",
        "patterns": [
            r"\bsend\s+(your\s+)?(passport|ssn|social\s+security|aadhaar|pan\s+card|bank\s+account|otp)\b",
            r"\bcredit\s+card\s+details\b",
            r"\bshare\s+net\s*banking\s+credentials\b"
        ],
        "description": "Sensitive identity and banking details should never be shared prior to receiving a formal verified offer letter and secure employee portal."
    },
    "unprofessional_communication": {
        "category": "Unprofessional Contact Channels",
        "severity": "medium",
        "patterns": [
            r"\bcontact\s+(me|us)\s+on\s+(telegram|whatsapp|signal)\b",
            r"\btelegram\s*:\s*@\w+",
            r"\bwhatsapp\s+only\b",
            r"\b(gmail|yahoo|hotmail|outlook)\.com\b"
        ],
        "description": "Reputable firms communicate via verified corporate email domains, not exclusively through Telegram, WhatsApp, or generic public email accounts."
    },
    "artificial_urgency": {
        "category": "Extreme Urgency & Pressure",
        "severity": "low",
        "patterns": [
            r"\bhurry\s*!\s*only\s+\d+\s+seats?\s+left\b",
            r"\boffer\s+expires\s+in\s+\d+\s+hours?\b",
            r"\bapply\s+immediately\s+or\s+miss\s+out\b",
            r"\blimited\s+slots?\s+available\b"
        ],
        "description": "Artificial scarcity and rush tactics are often employed to prevent candidates from verifying the employer's credibility."
    }
}

def analyze_rules(job_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str], float]:
    """
    Evaluates rule-based suspicious patterns across text fields.
    Returns:
        indicators: structured list of triggered indicators
        warning_signs: list of short warning strings
        rule_risk_score: 0.0 to 100.0 numerical risk based on rules
    """
    text_corpus = " ".join([
        str(job_data.get("title") or ""),
        str(job_data.get("company_profile") or ""),
        str(job_data.get("description") or ""),
        str(job_data.get("requirements") or ""),
        str(job_data.get("benefits") or "")
    ]).lower()

    indicators = []
    warning_signs = []
    raw_score = 0.0

    severity_weights = {
        "high": 35.0,
        "medium": 18.0,
        "low": 8.0
    }

    for key, spec in SCAM_PATTERNS.items():
        found = False
        matched_sample = []
        for pat in spec["patterns"]:
            matches = re.findall(pat, text_corpus)
            if matches:
                found = True
                matched_sample.append(pat.replace(r"\b", "").replace(r"\s+", " "))
        
        if found:
            raw_score += severity_weights[spec["severity"]]
            indicators.append({
                "category": spec["category"],
                "indicator": f"Triggered pattern matching: {', '.join(matched_sample[:2])}",
                "severity": spec["severity"],
                "description": spec["description"]
            })
            warning_signs.append(f"{spec['category']}: {spec['description']}")

    # Check missing essential fields
    if not job_data.get("company_profile") or len(str(job_data.get("company_profile")).strip()) < 20:
        raw_score += 10.0
        indicators.append({
            "category": "Missing Company Profile",
            "indicator": "No company background provided",
            "severity": "medium",
            "description": "Job posting omits organizational history and verified business context."
        })
        warning_signs.append("Missing Company Profile: Job posting does not detail organizational background.")

    if not job_data.get("requirements") or len(str(job_data.get("requirements")).strip()) < 15:
        raw_score += 8.0
        indicators.append({
            "category": "Vague Requirements",
            "indicator": "No concrete technical or educational requirements specified",
            "severity": "low",
            "description": "Vague postings with virtually zero skill prerequisites frequently indicate high-churn or misleading postings."
        })

    # Logo flag
    has_logo = job_data.get("has_company_logo", 0)
    if has_logo == 0:
        raw_score += 5.0

    # Cap score at 100
    rule_risk_score = min(round(raw_score, 1), 100.0)

    return indicators, warning_signs, rule_risk_score


def generate_company_checklist(job_data: Dict[str, Any]) -> Dict[str, Dict[str, str]]:
    """
    Evaluates company transparency checklist.
    Never claims external company verification without reliable evidence.
    """
    company_name = job_data.get("company_name")
    company_profile = job_data.get("company_profile")
    website_url = job_data.get("website_url")
    has_logo = job_data.get("has_company_logo", 0)

    checklist = {}

    # 1. Company Name
    if company_name and len(str(company_name).strip()) > 1:
        checklist["company_name"] = {
            "field": "Company Name",
            "status": "provided",
            "details": f"Specified as '{company_name.strip()}'."
        }
    else:
        checklist["company_name"] = {
            "field": "Company Name",
            "status": "missing",
            "details": "Company name is absent or unspecified in this ad."
        }

    # 2. Company Profile
    if company_profile and len(str(company_profile).strip()) >= 30:
        checklist["company_profile"] = {
            "field": "Company Profile",
            "status": "provided",
            "details": "Detailed company profile information is provided."
        }
    elif company_profile and len(str(company_profile).strip()) > 0:
        checklist["company_profile"] = {
            "field": "Company Profile",
            "status": "unverified",
            "details": "Company profile is very brief and lacks substantial background."
        }
    else:
        checklist["company_profile"] = {
            "field": "Company Profile",
            "status": "missing",
            "details": "No company profile or organizational background provided."
        }

    # 3. Official Website
    if website_url and len(str(website_url).strip()) > 4:
        checklist["website_url"] = {
            "field": "Official Website",
            "status": "provided",
            "details": f"Website link provided ({website_url.strip()}). Note: Domain registration legitimacy requires manual verification."
        }
    else:
        checklist["website_url"] = {
            "field": "Official Website",
            "status": "missing",
            "details": "No official website link provided in the posting."
        }

    # 4. Company Logo
    if has_logo in (1, "1", True):
        checklist["company_logo"] = {
            "field": "Company Logo",
            "status": "provided",
            "details": "Job ad contains an associated corporate logo."
        }
    else:
        checklist["company_logo"] = {
            "field": "Company Logo",
            "status": "unverified",
            "details": "No corporate logo attached. Legitimate companies usually include brand assets."
        }

    # 5. External Verification Status
    checklist["verification_status"] = {
        "field": "Third-Party Verification",
        "status": "unverified",
        "details": "Verification status is unverified. JobGuard AI does not perform intrusive background checks on external corporate registries."
    }

    return checklist


def get_safety_recommendations(risk_level: str, is_internship: bool = False) -> List[str]:
    """
    Returns actionable, student-focused safety guidance.
    """
    recs = [
        "Never pay registration fees, security deposits, training charges, or equipment costs for any job or internship.",
        "Verify the company on official government corporate registries (e.g., MCA in India, SEC/State registers in US) and LinkedIn.",
        "Ensure email correspondence originates from the company's verified domain (e.g., recruiter@company.com rather than @gmail.com).",
        "Inspect company website domain age using whois tools before submitting personal documents.",
        "Never share sensitive personal documents (Aadhaar, SSN, PAN, Passport, Bank details) during the preliminary application stage."
    ]

    if is_internship:
        recs.append("Check with your college training & placement cell (TPO) before accepting unverified remote internship offers.")

    if risk_level == "HIGH":
        recs.insert(0, "Exercise extreme caution: Multiple red flags were detected that correlate strongly with known employment scams.")
    elif risk_level == "MEDIUM":
        recs.insert(0, "Proceed with caution: Request a formal interview on a corporate platform and clarify company details before moving forward.")
    else:
        recs.insert(0, "Posting appears consistent with typical listings, but always practice standard verification before accepting offers.")

    return recs
