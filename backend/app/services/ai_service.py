from groq import Groq
from app.config import settings

def get_groq_client():
    return Groq(api_key=settings.GROQ_API_KEY)

def generate_roadmap(
    student_name: str,
    branch: str,
    graduation_year: str,
    cgpa: str,
    current_skills: list,
    missing_skills: list,
    target_company: str,
    target_role: str,
    weeks_available: int = 8,
) -> str:
    """
    Generate a personalised week-by-week learning roadmap
    using Groq's Llama 3.3 70B model.
    """
    client = get_groq_client()

    current_skills_str = ", ".join(current_skills) if current_skills else "Not specified"
    missing_skills_str = ", ".join(missing_skills) if missing_skills else "None identified"

    prompt = f"""You are an expert career coach and technical mentor for engineering students in India.

Generate a detailed, personalised week-by-week placement preparation roadmap for this student:

STUDENT PROFILE:
- Name: {student_name}
- Branch: {branch}
- Graduation Year: {graduation_year}
- CGPA: {cgpa}
- Target Company: {target_company}
- Target Role: {target_role}
- Weeks Available: {weeks_available} weeks

CURRENT SKILLS (already knows):
{current_skills_str}

SKILLS TO LEARN (gap identified):
{missing_skills_str}

Create a {weeks_available}-week roadmap with this exact structure for each week:

WEEK [N]: [WEEK TITLE]
Goal: [One clear goal for this week]
Topics:
- [Topic 1 with specific subtopics]
- [Topic 2 with specific subtopics]
- [Topic 3 with specific subtopics]
Resources:
- [Free resource 1 — name and where to find it]
- [Free resource 2 — name and where to find it]
Daily Plan: [How to split the week — e.g. Mon-Wed: theory, Thu-Fri: practice]
Milestone: [What the student should be able to do by end of this week]

---

Rules:
1. Only recommend FREE resources (YouTube, GeeksforGeeks, LeetCode free tier, NeetCode, etc.)
2. Be specific to {target_company}'s known interview pattern
3. Prioritise the most critical missing skills first
4. Include DSA practice throughout if target is a product company
5. Keep it realistic for a student with {weeks_available} weeks
6. End with a final week focused on mock interviews and revision

Generate the complete roadmap now:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert placement coach for Indian engineering students. You give specific, actionable, realistic advice. Always recommend free resources."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=3000,
    )

    return response.choices[0].message.content

def generate_quick_tips(
    target_company: str,
    target_role: str,
    missing_skills: list,
) -> str:
    """Generate quick 5 tips for a specific company and role."""
    client = get_groq_client()

    missing_str = ", ".join(missing_skills[:5]) if missing_skills else "general skills"

    prompt = f"""Give exactly 5 specific, actionable tips for a student preparing for {target_role} at {target_company}.
Their main skill gaps are: {missing_str}

Format each tip as:
TIP [N]: [Title]
[2-3 sentences of specific advice]

Be direct and practical. No generic advice."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.6,
        max_tokens=800,
    )

    return response.choices[0].message.content