from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from typing import Optional
from app.services.resume_service import extract_text_from_pdf, calculate_ats_score
from app.database import SessionLocal
from app.models.resume import Resume
from app.models.user import User
import uuid

router = APIRouter(prefix="/resume", tags=["resume"])

@router.get("/test")
def test_resume_route():
    return {"message": "Resume route working"}

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    clerk_user_id: Optional[str] = Header(None),
    clerk_user_email: Optional[str] = Header(None)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted.")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    try:
        extracted_text = extract_text_from_pdf(file_bytes)

        if len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Please use a text-based PDF."
            )

        analysis = calculate_ats_score(extracted_text)

        resume_id = None
        if clerk_user_id:
            db = SessionLocal()
            try:
                print(f"Saving resume for user: {clerk_user_id}")

                # ── NEW: ensure user exists in DB before saving resume ──
                existing_user = db.query(User).filter(User.id == clerk_user_id).first()
                if not existing_user:
                    print(f"User not in DB yet — auto-creating: {clerk_user_id}")
                    new_user = User(
                        id=clerk_user_id,
                        email=clerk_user_email or f"{clerk_user_id}@placeholder.com",
                        full_name="",
                        role="student",
                        profile_complete=False,
                    )
                    db.add(new_user)
                    db.commit()
                    print("User auto-created successfully")
                # ── END NEW ──

                # Mark old resumes inactive
                old_resumes = db.query(Resume).filter(
                    Resume.user_id == clerk_user_id
                ).all()
                for r in old_resumes:
                    r.is_active = False

                # Save new resume
                resume_id = str(uuid.uuid4())
                new_resume = Resume(
                    id=resume_id,
                    user_id=clerk_user_id,
                    file_name=file.filename,
                    file_url="local",
                    file_size=len(file_bytes),
                    parsed_text=extracted_text[:5000],
                    ats_score=analysis["ats_score"],
                    score_breakdown=analysis["score_breakdown"],
                    missing_keywords=analysis["missing_keywords"],
                    suggestions=analysis["suggestions"],
                    is_active=True,
                )
                db.add(new_resume)
                db.commit()
                db.refresh(new_resume)
                print(f"Resume saved successfully with ID: {resume_id}")

            except Exception as db_error:
                db.rollback()
                print(f"DATABASE ERROR: {str(db_error)}")
            finally:
                db.close()
        else:
            print("No clerk_user_id in header — resume not saved to DB")

        return {
            "success": True,
            "resume_id": resume_id,
            "file_name": file.filename,
            "analysis": analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/latest/{clerk_user_id}")
def get_latest_resume(clerk_user_id: str):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(
            Resume.user_id == clerk_user_id,
        ).order_by(Resume.created_at.desc()).first()

        if not resume:
            print(f"No resume found for user: {clerk_user_id}")
            return {"resume": None}

        print(f"Found resume: {resume.file_name}")
        return {
            "resume": {
                "id": str(resume.id),
                "file_name": resume.file_name,
                "ats_score": resume.ats_score,
                "score_breakdown": resume.score_breakdown,
                "missing_keywords": resume.missing_keywords,
                "suggestions": resume.suggestions,
                "parsed_text": resume.parsed_text or "",
                "created_at": resume.created_at.isoformat() if resume.created_at else None,
            }
        }
    finally:
        db.close()