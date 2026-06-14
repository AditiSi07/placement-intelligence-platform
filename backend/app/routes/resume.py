from fastapi import APIRouter

router = APIRouter(prefix="/resume", tags=["resume"])

@router.get("/test")
def test_resume_route():
    """Test that resume route is working"""
    return {"message": "Resume route is working. Full implementation coming in Week 3."}