# System Architecture — Placement Intelligence Platform

## High-Level Architecture
┌─────────────────────────────────────────────────────────────────┐

│                         USER'S BROWSER                          │

│                                                                 │

│   ┌─────────────────────────────────────────────────────────┐   │

│   │              Next.js 14 Frontend (React)                │   │

│   │                  Vercel (Deployed)                      │   │

│   │                                                         │   │

│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │

│   │  │ Landing  │ │Dashboard │ │  Resume  │ │Interview │  │   │

│   │  │   Page   │ │   Page   │ │  Scorer  │ │  Module  │  │   │

│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │

│   │                                                         │   │

│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │

│   │  │   Gap    │ │Placement │ │   AI     │               │   │

│   │  │Analyser  │ │Analytics │ │ Roadmap  │               │   │

│   │  └──────────┘ └──────────┘ └──────────┘               │   │

│   └─────────────────────────────────────────────────────────┘   │

└───────────────────────────┬─────────────────────────────────────┘

│ HTTPS API calls (axios)

│

┌───────────────────────────▼─────────────────────────────────────┐

│                    FastAPI Backend (Python)                      │

│                    Render (Deployed)                            │

│                                                                 │

│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │

│  │   /users    │  │  /resume    │  │    /jobs    │            │

│  │   routes    │  │   routes    │  │   routes    │            │

│  └─────────────┘  └─────────────┘  └─────────────┘            │

│                                                                 │

│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │

│  │  /gap-      │  │  /roadmap   │  │  /interview │            │

│  │  analysis   │  │   routes    │  │   routes    │            │

│  └─────────────┘  └─────────────┘  └─────────────┘            │

│                                                                 │

│  ┌──────────────────────────────────────────────────────────┐  │

│  │                    Services Layer                        │  │

│  │  resume_service │ gap_service │ ai_service │ user_service│  │

│  └──────────────────────────────────────────────────────────┘  │

└──────┬──────────────────────────┬────────────────────┬─────────┘

│                          │                    │

▼                          ▼                    ▼

┌─────────────┐          ┌───────────────┐    ┌──────────────┐

│  Supabase   │          │  OpenAI API   │    │    Clerk     │

│ PostgreSQL  │          │   GPT-4o      │    │    Auth      │

│             │          │               │    │              │

│ • users     │          │ • Roadmap gen │    │ • Sign up    │

│ • resumes   │          │ • Interview   │    │ • Sign in    │

│ • jobs      │          │ • Feedback    │    │ • JWT tokens │

│ • skills    │          │ • Gap summary │    │ • User mgmt  │

│ • gap_      │          └───────────────┘    └──────────────┘

│   analyses  │

│ • mock_     │          ┌───────────────┐

│   interviews│          │   Supabase    │

│ • placement │          │   Storage     │

│   _history  │          │               │

└─────────────┘          │ • Resume PDFs │

│ • Profile pics│

└───────────────┘

## Request Flow Examples

### Flow 1: Student uploads resume
Student clicks Upload

→ Next.js sends PDF to FastAPI POST /api/resume/upload

→ FastAPI saves PDF to Supabase Storage

→ FastAPI extracts text using PyMuPDF

→ FastAPI scores ATS compatibility

→ FastAPI saves result to resumes table

→ Next.js displays score to student

### Flow 2: Student runs gap analysis
Student pastes job description

→ Next.js sends JD to FastAPI POST /api/gap-analysis

→ FastAPI extracts skills from JD

→ FastAPI fetches student's resume skills

→ FastAPI compares and calculates match %

→ FastAPI saves to gap_analyses table

→ Next.js displays matched/missing skills

### Flow 3: AI generates roadmap
Student clicks Generate Roadmap

→ Next.js sends profile + gap data to FastAPI POST /api/roadmap

→ FastAPI builds prompt with student profile + skill gaps

→ FastAPI calls OpenAI GPT-4o API

→ GPT-4o returns personalised week-by-week plan

→ FastAPI streams response back to Next.js

→ Next.js displays roadmap in real time

### Flow 4: Mock interview session
Student starts mock interview

→ Next.js calls FastAPI POST /api/interview/start

→ FastAPI calls OpenAI to generate first question

→ Student types answer

→ Next.js sends answer to FastAPI POST /api/interview/answer

→ FastAPI calls OpenAI to evaluate answer + generate next question

→ Loop continues until session ends

→ FastAPI saves full transcript to mock_interviews table

→ Next.js displays final feedback report

## Technology Decisions

| Layer | Technology | Why chosen |
|---|---|---|
| Frontend | Next.js 14 | SSR, file-based routing, Vercel deployment |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, recruiter-friendly UI |
| Backend | FastAPI (Python) | Fast, auto-generates API docs, great for AI/ML |
| Database | Supabase PostgreSQL | Free tier, real PostgreSQL, built-in storage |
| Auth | Clerk | Easiest auth setup, free tier, works with Next.js |
| AI | OpenAI GPT-4o | Best LLM for structured output and instructions |
| PDF parsing | PyMuPDF | Fast, accurate text extraction from PDFs |
| Deployment | Vercel + Render | Free tiers, auto-deploy from GitHub |

## Database Relationships
users (1) ──────── (many) resumes

users (1) ──────── (many) jobs

users (1) ──────── (many) gap_analyses

users (1) ──────── (many) mock_interviews

resumes (1) ─────── (many) gap_analyses

jobs (1) ──────────(many) gap_analyses

jobs (1) ──────────(many) mock_interviews

skills ─────────────────── (standalone lookup table)

placement_history ──────── (standalone, added by coordinators)

## Environment Variables

### Backend (.env)
DATABASE_URL        → Supabase PostgreSQL connection string

SUPABASE_URL        → Supabase project URL

SUPABASE_ANON_KEY   → Supabase public API key

OPENAI_API_KEY      → OpenAI API key for GPT-4o

CLERK_SECRET_KEY    → Clerk backend secret

SECRET_KEY          → JWT signing secret

ENVIRONMENT         → development / production

### Frontend (.env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  → Clerk frontend key

CLERK_SECRET_KEY                   → Clerk backend key

NEXT_PUBLIC_API_URL                → FastAPI backend URL