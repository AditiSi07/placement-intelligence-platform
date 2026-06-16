from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.gap_service import calculate_gap, extract_skills_from_text
from app.database import SessionLocal
from app.models.gap_analysis import GapAnalysis
import uuid

router = APIRouter(prefix="/gap-analysis", tags=["gap-analysis"])

class GapAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    company_name: Optional[str] = "the company"
    job_title: Optional[str] = "this role"
    clerk_user_id: Optional[str] = None

@router.get("/test")
def test_gap_route():
    return {"message": "Gap analysis route working"}

@router.post("/analyse")
def analyse_gap(request: GapAnalysisRequest):
    """
    Compare resume skills vs job description and return gap analysis.
    """
    if len(request.resume_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short. Please upload your resume first using the Resume Scorer."
        )

    if len(request.job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please paste the complete job description."
        )

    try:
        result = calculate_gap(
            resume_text=request.resume_text,
            jd_text=request.job_description,
            company_name=request.company_name,
            job_title=request.job_title,
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Save to database if user is logged in
        if request.clerk_user_id:
            db = SessionLocal()
            try:
                new_analysis = GapAnalysis(
                    id=str(uuid.uuid4()),
                    user_id=request.clerk_user_id,
                    match_percentage=result["match_percentage"],
                    matched_skills=result["matched_skills"],
                    missing_skills=result["missing_skills"],
                    bonus_skills=result["bonus_skills"],
                    priority_gaps=result["priority_gaps"],
                    recommendation=result["recommendation"],
                )
                db.add(new_analysis)
                db.commit()
            except Exception as db_error:
                db.rollback()
            finally:
                db.close()

        return {"success": True, "analysis": result}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{clerk_user_id}")
def get_gap_history(clerk_user_id: str):
    """Get last 5 gap analyses for a user."""
    db = SessionLocal()
    try:
        analyses = db.query(GapAnalysis).filter(
            GapAnalysis.user_id == clerk_user_id
        ).order_by(GapAnalysis.created_at.desc()).limit(5).all()

        return {
            "analyses": [
                {
                    "id": str(a.id),
                    "match_percentage": a.match_percentage,
                    "matched_skills": a.matched_skills,
                    "missing_skills": a.missing_skills,
                    "recommendation": a.recommendation,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                }
                for a in analyses
            ]
        }
    finally:
        db.close()