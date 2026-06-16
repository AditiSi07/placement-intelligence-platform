from typing import List, Dict, Any

# Master skill list with aliases for matching
SKILL_ALIASES = {
    "python": ["python", "python3", "py"],
    "javascript": ["javascript", "js", "es6", "es2015"],
    "typescript": ["typescript", "ts"],
    "java": ["java", "java8", "java11", "java17"],
    "c++": ["c++", "cpp", "c plus plus"],
    "c": ["c language", " c,", ",c,", "(c)"],
    "sql": ["sql", "mysql", "postgresql", "sqlite", "pl/sql"],
    "react": ["react", "reactjs", "react.js"],
    "node.js": ["node", "nodejs", "node.js"],
    "next.js": ["next", "nextjs", "next.js"],
    "fastapi": ["fastapi", "fast api"],
    "django": ["django", "django rest"],
    "spring boot": ["spring", "springboot", "spring boot"],
    "express.js": ["express", "expressjs"],
    "machine learning": ["machine learning", "ml", "sklearn", "scikit-learn"],
    "deep learning": ["deep learning", "dl", "neural network"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch", "torch"],
    "nlp": ["nlp", "natural language processing", "text processing"],
    "computer vision": ["computer vision", "cv", "image processing", "opencv"],
    "langchain": ["langchain", "lang chain"],
    "openai": ["openai", "gpt", "chatgpt", "gpt-4", "gpt4"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis", "redis cache"],
    "mysql": ["mysql"],
    "docker": ["docker", "dockerfile", "containerization", "containers"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "git": ["git", "github", "gitlab", "version control"],
    "linux": ["linux", "ubuntu", "bash", "shell scripting"],
    "ci/cd": ["ci/cd", "github actions", "jenkins", "devops pipeline"],
    "data structures": ["data structures", "dsa", "linked list", "tree", "graph"],
    "algorithms": ["algorithms", "algo", "dynamic programming", "recursion"],
    "system design": ["system design", "hld", "lld", "microservices", "architecture"],
    "dbms": ["dbms", "database management", "normalization", "indexing"],
    "operating systems": ["operating systems", "os concepts", "process management"],
    "computer networks": ["computer networks", "networking", "tcp/ip", "http", "rest api"],
    "html/css": ["html", "css", "html5", "css3", "tailwind", "bootstrap"],
    "graphql": ["graphql", "graph ql"],
    "rest api": ["rest", "restful", "rest api", "api design"],
    "agile": ["agile", "scrum", "jira", "sprint"],
    "communication": ["communication", "presentation", "verbal"],
    "problem solving": ["problem solving", "analytical", "critical thinking"],
}

SKILL_IMPORTANCE = {
    "python": "high", "javascript": "high", "java": "high",
    "react": "high", "node.js": "high", "sql": "high",
    "data structures": "high", "algorithms": "high", "git": "high",
    "machine learning": "high", "system design": "high",
    "typescript": "medium", "docker": "medium", "aws": "medium",
    "postgresql": "medium", "mongodb": "medium", "django": "medium",
    "fastapi": "medium", "next.js": "medium", "linux": "medium",
    "deep learning": "medium", "nlp": "medium", "rest api": "medium",
    "kubernetes": "low", "graphql": "low", "redis": "low",
    "langchain": "low", "openai": "low", "ci/cd": "low",
}

def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from any text (resume or JD) using alias matching."""
    text_lower = text.lower()
    found_skills = []
    for skill, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            if alias in text_lower:
                found_skills.append(skill)
                break
    return list(set(found_skills))

def calculate_gap(
    resume_text: str,
    jd_text: str,
    company_name: str = "",
    job_title: str = ""
) -> Dict[str, Any]:
    """
    Compare resume skills vs job description skills.
    Returns match %, matched skills, missing skills, priority gaps.
    """
    resume_skills = set(extract_skills_from_text(resume_text))
    jd_skills = set(extract_skills_from_text(jd_text))

    if not jd_skills:
        return {
            "error": "Could not extract skills from job description. Try adding more specific technical requirements."
        }

    # Calculate matches
    matched = resume_skills & jd_skills
    missing = jd_skills - resume_skills
    bonus = resume_skills - jd_skills  # skills you have beyond JD requirements

    # Match percentage
    match_pct = round((len(matched) / len(jd_skills)) * 100) if jd_skills else 0

    # Priority gaps — categorise missing skills by importance
    priority_gaps = []
    for skill in missing:
        importance = SKILL_IMPORTANCE.get(skill, "medium")
        priority_gaps.append({
            "skill": skill,
            "importance": importance
        })

    # Sort by importance: high → medium → low
    importance_order = {"high": 0, "medium": 1, "low": 2}
    priority_gaps.sort(key=lambda x: importance_order.get(x["importance"], 1))

    # Generate recommendation text
    if match_pct >= 80:
        recommendation = f"Excellent match! You have {match_pct}% of the required skills for {job_title} at {company_name}. Focus on the remaining {len(missing)} skills to make your application even stronger."
    elif match_pct >= 60:
        recommendation = f"Good match at {match_pct}%. You have a solid foundation for {job_title} at {company_name}. Prioritise learning the high-importance missing skills before applying."
    elif match_pct >= 40:
        recommendation = f"Moderate match at {match_pct}%. You'll need to build {len(missing)} more skills for {job_title} at {company_name}. Start with the high-priority skills and give yourself 4-6 weeks of focused preparation."
    else:
        recommendation = f"Low match at {match_pct}% for {job_title} at {company_name}. This is a significant skill gap. Consider building foundational skills first and targeting this role in your next placement cycle."

    return {
        "match_percentage": match_pct,
        "matched_skills": sorted(list(matched)),
        "missing_skills": sorted(list(missing)),
        "bonus_skills": sorted(list(bonus)),
        "priority_gaps": priority_gaps,
        "recommendation": recommendation,
        "jd_skills_total": len(jd_skills),
        "resume_skills_total": len(resume_skills),
    }