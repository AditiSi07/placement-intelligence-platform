from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.services.ai_service import (
    generate_interview_question,
    evaluate_answer,
    generate_final_feedback
)
from app.database import SessionLocal
from app.models.mock_interview import MockInterview

router = APIRouter(prefix="/interview", tags=["interview"])

class StartInterviewRequest(BaseModel):
    clerk_user_id: str
    target_company: Optional[str] = "a tech company"
    target_role: Optional[str] = "Software Engineer"
    interview_type: Optional[str] = "technical"
    difficulty: Optional[str] = "medium"
    total_questions: Optional[int] = 5
    skills_to_test: Optional[List[str]] = []

class AnswerRequest(BaseModel):
    interview_id: str
    question: str
    answer: str
    question_number: int
    target_role: Optional[str] = "Software Engineer"
    interview_type: Optional[str] = "technical"
    difficulty: Optional[str] = "medium"

class NextQuestionRequest(BaseModel):
    interview_id: str
    target_company: Optional[str] = "a tech company"
    target_role: Optional[str] = "Software Engineer"
    interview_type: Optional[str] = "technical"
    difficulty: Optional[str] = "medium"
    question_number: int
    previous_questions: Optional[List[str]] = []
    skills_to_test: Optional[List[str]] = []

class EndInterviewRequest(BaseModel):
    interview_id: str
    clerk_user_id: str
    target_company: Optional[str] = "a tech company"
    target_role: Optional[str] = "Software Engineer"
    transcript: List[dict]

@router.get("/test")
def test_interview_route():
    return {"message": "Interview route working"}

@router.post("/start")
def start_interview(request: StartInterviewRequest):
    """Start a new mock interview session."""
    db = SessionLocal()
    try:
        # Generate the first question
        first_question = generate_interview_question(
            target_company=request.target_company,
            target_role=request.target_role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            question_number=1,
            previous_questions=[],
            skills_to_test=request.skills_to_test,
        )

        # Save interview to DB
        new_interview = MockInterview(
            user_id=request.clerk_user_id,
            target_company=request.target_company,
            target_role=request.target_role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            status="in_progress",
            total_questions=request.total_questions,
            questions_answered=0,
            transcript=[],
        )
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)

        return {
            "success": True,
            "interview_id": str(new_interview.id),
            "first_question": first_question,
            "total_questions": request.total_questions,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/answer")
def submit_answer(request: AnswerRequest):
    """Submit an answer and get evaluation."""
    try:
        evaluation = evaluate_answer(
            question=request.question,
            answer=request.answer,
            target_role=request.target_role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
        )
        return {
            "success": True,
            "evaluation": evaluation,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/next-question")
def get_next_question(request: NextQuestionRequest):
    """Get the next interview question."""
    try:
        question = generate_interview_question(
            target_company=request.target_company,
            target_role=request.target_role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            question_number=request.question_number,
            previous_questions=request.previous_questions,
            skills_to_test=request.skills_to_test,
        )
        return {"success": True, "question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/end")
def end_interview(request: EndInterviewRequest):
    """End the interview and generate final feedback."""
    db = SessionLocal()
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="No transcript provided")

        # Calculate overall score
        scores = [item.get("score", 0) for item in request.transcript]
        overall_score = sum(scores) / len(scores) if scores else 0

        # Generate final feedback
        feedback = generate_final_feedback(
            target_company=request.target_company,
            target_role=request.target_role,
            transcript=request.transcript,
            overall_score=overall_score,
        )

        # Update interview in DB
        interview = db.query(MockInterview).filter(
            MockInterview.id == request.interview_id
        ).first()

        if interview:
            interview.status = "completed"
            interview.questions_answered = len(request.transcript)
            interview.overall_score = round(overall_score * 10)
            interview.transcript = request.transcript
            interview.feedback = feedback
            interview.completed_at = datetime.now()
            db.commit()

        return {
            "success": True,
            "overall_score": round(overall_score, 1),
            "feedback": feedback,
            "total_questions": len(request.transcript),
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/history/{clerk_user_id}")
def get_interview_history(clerk_user_id: str):
    """Get past interview sessions for a user."""
    db = SessionLocal()
    try:
        interviews = db.query(MockInterview).filter(
            MockInterview.user_id == clerk_user_id,
            MockInterview.status == "completed"
        ).order_by(MockInterview.started_at.desc()).limit(10).all()

        return {
            "interviews": [
                {
                    "id": str(i.id),
                    "target_company": i.target_company,
                    "target_role": i.target_role,
                    "interview_type": i.interview_type,
                    "difficulty": i.difficulty,
                    "overall_score": i.overall_score,
                    "questions_answered": i.questions_answered,
                    "feedback": i.feedback,
                    "started_at": i.started_at.isoformat() if i.started_at else None,
                }
                for i in interviews
            ]
        }
    finally:
        db.close()