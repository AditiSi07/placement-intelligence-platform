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
def generate_interview_question(
    target_company: str,
    target_role: str,
    interview_type: str,
    difficulty: str,
    question_number: int,
    previous_questions: list,
    skills_to_test: list,
) -> str:
    """Generate the next interview question."""
    client = get_groq_client()

    prev_q_str = "\n".join(previous_questions) if previous_questions else "None yet"
    skills_str = ", ".join(skills_to_test) if skills_to_test else "general software engineering"

    type_instructions = {
        "technical": "Ask a technical coding or concept question about data structures, algorithms, or system design",
        "hr": "Ask a behavioural or HR question about teamwork, challenges, strengths, weaknesses, or career goals",
        "aptitude": "Ask a logical reasoning, quantitative aptitude, or verbal reasoning question",
        "mixed": "Mix between technical, HR, and aptitude questions progressively"
    }

    instruction = type_instructions.get(interview_type, type_instructions["technical"])

    prompt = f"""You are conducting a {difficulty} difficulty {interview_type} interview for {target_role} at {target_company}.

Skills being tested: {skills_str}
Question number: {question_number}
Previous questions asked: {prev_q_str}

{instruction}. 

Rules:
- Ask exactly ONE question
- Do not repeat previous questions
- For question 1-2: warm up questions
- For question 3-5: medium difficulty
- For question 6+: harder questions
- Output ONLY the question, nothing else
- No preamble like "Here's your question:" — just the question directly"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=300,
    )

    return response.choices[0].message.content.strip()


def evaluate_answer(
    question: str,
    answer: str,
    target_role: str,
    interview_type: str,
    difficulty: str,
) -> dict:
    """Evaluate a student's answer and return score + feedback."""
    client = get_groq_client()

    if not answer or len(answer.strip()) < 5:
        return {
            "score": 0,
            "feedback": "No answer provided.",
            "strengths": [],
            "improvements": ["Please provide a detailed answer"]
        }

    prompt = f"""You are evaluating an interview answer for a {target_role} position.

Question: {question}
Candidate's Answer: {answer}
Interview Type: {interview_type}
Difficulty: {difficulty}

Evaluate this answer and respond in this EXACT JSON format:
{{
    "score": <number 1-10>,
    "feedback": "<2-3 sentence overall feedback>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "ideal_answer_hint": "<one sentence hint about what a perfect answer would include>"
}}

Scoring guide:
- 9-10: Excellent, complete, well-structured answer
- 7-8: Good answer with minor gaps
- 5-6: Adequate but missing key points
- 3-4: Partial answer, significant gaps
- 1-2: Incorrect or very incomplete

Output ONLY the JSON, nothing else."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500,
    )

    import json
    try:
        content = response.choices[0].message.content.strip()
        # Clean up if model adds markdown
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception:
        return {
            "score": 5,
            "feedback": "Answer received and evaluated.",
            "strengths": ["Attempted the question"],
            "improvements": ["Provide more detail in your answer"],
            "ideal_answer_hint": "Focus on specific examples and technical depth"
        }


def generate_final_feedback(
    target_company: str,
    target_role: str,
    transcript: list,
    overall_score: float,
) -> dict:
    """Generate comprehensive end-of-interview feedback."""
    client = get_groq_client()

    qa_summary = "\n".join([
        f"Q{i+1}: {item['question']}\nA: {item['answer'][:200]}...\nScore: {item['score']}/10"
        for i, item in enumerate(transcript)
    ])

    prompt = f"""You conducted a mock interview for {target_role} at {target_company}.

Interview Summary:
{qa_summary}

Overall Score: {overall_score:.1f}/10

Generate comprehensive feedback in this EXACT JSON format:
{{
    "overall_assessment": "<3-4 sentence overall assessment of the candidate>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "areas_to_improve": ["<area 1>", "<area 2>", "<area 3>"],
    "recommended_topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
    "readiness": "<one of: Ready, Almost Ready, Needs More Prep, Not Ready>",
    "next_steps": "<2-3 sentences on what to do next>"
}}

Output ONLY the JSON."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=600,
    )

    import json
    try:
        content = response.choices[0].message.content.strip()
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception:
        return {
            "overall_assessment": f"You completed the mock interview with a score of {overall_score:.1f}/10.",
            "strengths": ["Completed the interview", "Attempted all questions"],
            "areas_to_improve": ["Technical depth", "Communication clarity", "Specific examples"],
            "recommended_topics": ["Data Structures", "System Design", "Communication skills"],
            "readiness": "Needs More Prep",
            "next_steps": "Review the topics covered and practice more mock interviews."
        }