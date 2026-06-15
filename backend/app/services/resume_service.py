
import pdfplumber  # replaces PyMuPDF
import re
from typing import Dict, List, Any
# Keywords that ATS systems look for in each section
SECTION_KEYWORDS = {
    "contact": ["email", "phone", "linkedin", "github", "portfolio", "@"],
    "education": ["b.tech", "b.e", "bachelor", "university", "college", "cgpa", "gpa", "degree", "engineering"],
    "experience": ["internship", "experience", "worked", "developer", "engineer", "role", "company", "organization"],
    "skills": ["python", "java", "javascript", "react", "node", "sql", "machine learning", "docker", "git", "aws"],
    "projects": ["project", "built", "developed", "created", "implemented", "github", "deployed"],
    "achievements": ["award", "winner", "rank", "achievement", "certificate", "hackathon", "competition"],
}

TOP_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "sql", "react", "node.js",
    "next.js", "fastapi", "django", "spring", "machine learning", "deep learning",
    "tensorflow", "pytorch", "docker", "kubernetes", "aws", "git", "postgresql",
    "mongodb", "redis", "linux", "data structures", "algorithms", "system design",
    "nlp", "computer vision", "langchain", "openai", "rest api", "graphql"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file using pdfplumber."""
    try:
        import io
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Could not read PDF: {str(e)}")

def check_sections(text: str) -> Dict[str, bool]:
    """Check which sections are present in the resume."""
    text_lower = text.lower()
    found = {}
    for section, keywords in SECTION_KEYWORDS.items():
        found[section] = any(kw in text_lower for kw in keywords)
    return found

def extract_skills_found(text: str) -> List[str]:
    """Find which top skills are mentioned in the resume."""
    text_lower = text.lower()
    return [skill for skill in TOP_SKILLS if skill in text_lower]

def calculate_ats_score(text: str) -> Dict[str, Any]:
    """
    Calculate ATS score based on:
    - Sections present (40 points)
    - Skills mentioned (30 points)
    - Length and content (20 points)
    - Formatting signals (10 points)
    """
    text_lower = text.lower()
    sections = check_sections(text)
    skills_found = extract_skills_found(text)
    score_breakdown = {}
    suggestions = []
    missing_keywords = []

    # 1. SECTIONS SCORE (40 points total)
    section_score = 0
    section_weights = {
        "contact": 10,
        "education": 8,
        "skills": 8,
        "projects": 7,
        "experience": 5,
        "achievements": 2,
    }
    for section, weight in section_weights.items():
        if sections[section]:
            section_score += weight
        else:
            suggestions.append(f"Add a clear '{section.capitalize()}' section — ATS systems look for this heading explicitly")
            missing_keywords.append(section)

    score_breakdown["sections"] = min(section_score, 40)

    # 2. SKILLS SCORE (30 points total)
    skills_score = min(len(skills_found) * 2, 30)
    score_breakdown["skills"] = skills_score
    if len(skills_found) < 8:
        suggestions.append(f"Add more technical skills — you have {len(skills_found)} detected skills, aim for at least 10-15")

    # 3. CONTENT LENGTH SCORE (20 points)
    word_count = len(text.split())
    if word_count < 200:
        content_score = 5
        suggestions.append("Resume is too short — add more detail to your projects and experience sections")
    elif word_count < 400:
        content_score = 12
        suggestions.append("Resume could use more detail — describe your project impact and technologies used")
    elif word_count <= 800:
        content_score = 20
    else:
        content_score = 15
        suggestions.append("Resume may be too long — keep it to 1 page for freshers, 2 pages maximum")
    score_breakdown["content"] = content_score

    # 4. FORMATTING SCORE (10 points)
    formatting_score = 0
    if "@" in text:
        formatting_score += 3  # has email
    if any(word in text_lower for word in ["github.com", "linkedin.com"]):
        formatting_score += 3  # has links
    if len(text.split("\n")) > 20:
        formatting_score += 4  # has proper line breaks
    score_breakdown["formatting"] = min(formatting_score, 10)

    # Calculate total
    total = sum(score_breakdown.values())

    # Add general suggestions
    if total < 50:
        suggestions.append("Consider using a standard resume template — ATS systems prefer clean, simple formatting")
    if "github" not in text_lower:
        suggestions.append("Add your GitHub profile URL — tech recruiters always check this")
        missing_keywords.append("github")
    if "linkedin" not in text_lower:
        suggestions.append("Add your LinkedIn URL — many ATS systems extract this automatically")
        missing_keywords.append("linkedin")

    return {
        "ats_score": total,
        "score_breakdown": score_breakdown,
        "skills_found": skills_found,
        "missing_keywords": list(set(missing_keywords)),
        "suggestions": suggestions[:6],  # max 6 suggestions
        "word_count": word_count,
        "sections_found": sections,
    }