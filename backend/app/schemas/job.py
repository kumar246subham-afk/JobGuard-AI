from typing import Optional
from pydantic import BaseModel, Field

class JobInput(BaseModel):
    title: str = Field(..., min_length=2, max_length=300, description="Job title")
    company_name: Optional[str] = Field(None, max_length=200, description="Hiring organization name")
    company_profile: Optional[str] = Field(None, description="Overview of the company")
    description: str = Field(..., min_length=10, description="Detailed job description")
    requirements: Optional[str] = Field(None, description="Job requirements and qualifications")
    benefits: Optional[str] = Field(None, description="Perks and benefits offered")
    location: Optional[str] = Field(None, max_length=200, description="Job location (City, State, Country)")
    employment_type: Optional[str] = Field(None, description="Full-time, Part-time, Contract, etc.")
    required_experience: Optional[str] = Field(None, description="Entry level, Mid-Senior, etc.")
    required_education: Optional[str] = Field(None, description="Bachelor's, Master's, High School, etc.")
    industry: Optional[str] = Field(None, description="Industry sector")
    function: Optional[str] = Field(None, description="Job function")
    website_url: Optional[str] = Field(None, description="Company or job website URL")
    telecommuting: Optional[int] = Field(0, description="1 if remote/telecommuting, 0 otherwise")
    has_company_logo: Optional[int] = Field(0, description="1 if company logo is present, 0 otherwise")
    has_questions: Optional[int] = Field(0, description="1 if screening questions are present, 0 otherwise")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Software Engineer Intern",
                "company_name": "TechCorp Innovations",
                "company_profile": "We are a fast-growing cloud solutions provider.",
                "description": "Looking for passionate engineering students to join our summer internship program.",
                "requirements": "Proficiency in Python, basic algorithms, git version control.",
                "benefits": "Mentorship, monthly stipend, flexible working hours.",
                "location": "San Francisco, CA, US",
                "employment_type": "Internship",
                "required_experience": "Entry level",
                "required_education": "Bachelor's Degree",
                "industry": "Information Technology",
                "function": "Engineering",
                "website_url": "https://techcorp-sample.example.com",
                "telecommuting": 1,
                "has_company_logo": 1,
                "has_questions": 1
            }
        }
    }
