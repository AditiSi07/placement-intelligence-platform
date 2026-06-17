from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, users, resume, gap_analysis, placement, roadmap, interview

app = FastAPI(
    title="Placement Intelligence Platform API",
    description="Backend API for the AI-powered student placement preparation platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Allow both local dev and production frontend
origins = [
    "http://localhost:3000",
    "https://placement-intelligence-platform.vercel.app",
    settings.ALLOWED_ORIGINS,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(users.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(gap_analysis.router, prefix="/api")
app.include_router(placement.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(interview.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    from app.database import Base, engine
    from app.models import user, resume as resume_model
    from app.models import gap_analysis as gap_model
    from app.models import placement_history as placement_model
    from app.models import roadmap as roadmap_model
    from app.models import mock_interview as interview_model
    Base.metadata.create_all(bind=engine)
    print("=" * 50)
    print("Placement Intelligence Platform API started")
    print(f"Environment: {settings.ENVIRONMENT}")
    print("Docs available at: /docs")
    print("=" * 50)