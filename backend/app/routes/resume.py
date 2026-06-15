from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from typing import Optional
from app.services.resume_service import extract_text_from_pdf, calculate_ats_score
from app.database import SessionLocal
from app.models.resume import Resume
import uuid

router = APIRouter(prefix="/resume", tags=["resume"])

@router.get("/test")
def test_resume_route():
    return {"message": "Resume route working"}

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    clerk_user_id: Optional[str] = Header(None)
):
    """
    Upload a PDF resume and get an ATS score instantly.
    """
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted. Please upload a PDF resume."
        )

    # Validate file size (max 5MB)
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size too large. Maximum allowed size is 5MB."
        )

    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_bytes)

        if len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF. It may be image-based or scanned. Please use a text-based PDF."
            )

        # Calculate ATS score
        analysis = calculate_ats_score(extracted_text)

        # Save to database if user is logged in
        if clerk_user_id:
            db = SessionLocal()
            try:
                # Mark previous resumes as inactive
                db.query(Resume).filter(
                    Resume.user_id == clerk_user_id,
                    Resume.is_active == True
                ).update({"is_active": False})

                # Save new resume
                new_resume = Resume(
                    id=str(uuid.uuid4()),
                    user_id=clerk_user_id,
                    file_name=file.filename,
                    file_url="local",
                    file_size=len(file_bytes),
                    parsed_text=extracted_text[:5000],  # store first 5000 chars
                    ats_score=analysis["ats_score"],
                    score_breakdown=analysis["score_breakdown"],
                    missing_keywords=analysis["missing_keywords"],
                    suggestions=analysis["suggestions"],
                    is_active=True,
                )
                db.add(new_resume)
                db.commit()
                resume_id = new_resume.id
            except Exception as db_error:
                db.rollback()
                resume_id = None
            finally:
                db.close()
        else:
            resume_id = None

        return {
            "success": True,
            "resume_id": resume_id,
            "file_name": file.filename,
            "analysis": analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@router.get("/latest/{clerk_user_id}")
def get_latest_resume(clerk_user_id: str):
    """Get the most recent resume analysis for a user."""
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(
            Resume.user_id == clerk_user_id,
            Resume.is_active == True
        ).first()

        if not resume:
            return {"resume": None}

        return {
            "resume": {
                "id": str(resume.id),
                "file_name": resume.file_name,
                "ats_score": resume.ats_score,
                "score_breakdown": resume.score_breakdown,
                "missing_keywords": resume.missing_keywords,
                "suggestions": resume.suggestions,
                "created_at": resume.created_at.isoformat() if resume.created_at else None,
            }
        }
    finally:
        db.close()