from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, users, resume

app = FastAPI(
    title="Placement Intelligence Platform API",
    description="""
    Backend API for the AI-powered student placement preparation platform.
    
    ## Features
    * Resume upload and ATS scoring
    * Skill gap analysis  
    * Placement history analytics
    * AI personalised roadmap generation
    * AI mock interview sessions
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(users.router, prefix="/api")
app.include_router(resume.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print("Placement Intelligence Platform API started")
    print(f"Environment: {settings.ENVIRONMENT}")
    print("Docs available at: http://localhost:8000/docs")
    print("=" * 50)