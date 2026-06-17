# PlacementIQ — AI-Powered Student Placement Platform

> Helping engineering students get placed at their dream companies using AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-blue)](https://placement-intelligence-platform-murex.vercel.app)
[![Backend API](https://img.shields.io/badge/API%20Docs-Swagger-green)](https://placement-iq-api.onrender.com/docs)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Made with](https://img.shields.io/badge/Made%20with-Next.js%20%2B%20FastAPI-black)](https://github.com)

---

## The Problem

Every year, thousands of engineering students apply for campus placements with:
- Resumes full of formatting errors that ATS systems reject instantly
- No idea which skills they're missing for their target companies
- Zero structured interview practice
- Placement cells running on Excel sheets and WhatsApp groups

**PlacementIQ solves all of this in one platform.**

---

## Features

| Feature | Description | Status |
|---|---|---|
| ATS Resume Scorer | Upload PDF → instant ATS score + improvement tips | 🔨 Week 3 |
| Skill Gap Analyser | Paste any JD → see exactly what skills you're missing | 🔨 Week 4 |
| Placement Analytics | Company-wise placement history, packages, eligibility | 🔨 Week 5 |
| AI Roadmap Generator | Personalised week-by-week learning plan via GPT-4o | 🔨 Week 6 |
| AI Mock Interviews | Practice with AI interviewer + detailed feedback | 🔨 Week 7 |

---

## Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4)
![shadcn/ui](https://img.shields.io/badge/shadcn-ui-black)

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688)
![Python](https://img.shields.io/badge/Python-3.12-3776AB)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red)
![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063)

### Database & Storage
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E)
![Redis](https://img.shields.io/badge/Redis-Sessions-DC382D)

### AI & ML
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991)
![PyMuPDF](https://img.shields.io/badge/PyMuPDF-PDF%20Parsing-blue)
![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C)

### Auth & Deployment
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7)

---

## System Architecture
┌─────────────────────────────────────────┐

│         Next.js Frontend (Vercel)        │

│  Landing │ Dashboard │ Resume │ Interview│

└─────────────────┬───────────────────────┘

│ HTTPS API calls

▼

┌─────────────────────────────────────────┐

│          FastAPI Backend (Render)        │

│  /users │ /resume │ /gap │ /interview   │

└────┬──────────────┬──────────────┬──────┘

│              │              │

▼              ▼              ▼

┌─────────┐  ┌──────────┐  ┌──────────┐

│Supabase │  │ OpenAI   │  │  Clerk   │

│PostgreSQL│  │ GPT-4o   │  │  Auth   │

└─────────┘  └──────────┘  └──────────┘

See [docs/architecture.md](docs/architecture.md) for the full detailed diagram.

---

## Database Schema

7 tables designed for production scale:
users              → student and coordinator profiles

resumes            → uploaded PDFs + ATS scores

jobs               → job descriptions for analysis

skills             → master skill taxonomy (40+ skills)

gap_analyses       → resume vs JD comparison results

mock_interviews    → AI interview sessions + transcripts

placement_history  → company-wise college placement data

See [docs/database-schema.sql](docs/database-schema.sql) to set up the database.

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.12
- Git

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/placement-intelligence-platform.git
cd placement-intelligence-platform
```

### 2. Backend setup
```bash
cd backend
py -3.12 -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
cp .env.example .env
# Fill in your .env values (see Environment Variables below)

uvicorn main:app --reload --port 8000
```
→ API running at https://placement-iq-api.onrender.com  
→ API docs at https://placement-iq-api.onrender.com/docs

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your .env.local values

npm run dev
```
→ App running at http://localhost:3000

### 4. Database setup
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run [docs/database-schema.sql](docs/database-schema.sql)
3. Add your connection string to `backend/.env`

---

## Environment Variables

### Backend (`backend/.env`)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

SUPABASE_URL=https://xxx.supabase.co

SUPABASE_ANON_KEY=eyJ...

OPENAI_API_KEY=sk-...

CLERK_SECRET_KEY=sk_...

SECRET_KEY=your_random_secret

ENVIRONMENT=development

### Frontend (`frontend/.env.local`)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

CLERK_SECRET_KEY=sk_...

NEXT_PUBLIC_API_URL=https://placement-iq-api.onrender.com

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

---

## Project Structure
placement-intelligence-platform/

├── frontend/                  # Next.js 14 app

│   └── src/

│       ├── app/               # Pages (App Router)

│       ├── components/        # Reusable UI components

│       └── lib/               # API client, utilities

│

├── backend/                   # FastAPI app

│   ├── main.py                # Entry point

│   └── app/

│       ├── routes/            # API endpoints

│       ├── models/            # Database models

│       ├── schemas/           # Request/response shapes

│       ├── services/          # Business logic

│       └── utils/             # Helper functions

│

└── docs/                      # Documentation

├── architecture.md        # System design

├── database-schema.sql    # DB setup script

└── setup-guide.md         # Dev environment guide

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check + DB status |
| GET | `/api/users/me` | Get current user profile |
| POST | `/api/resume/upload` | Upload and score resume |
| POST | `/api/gap-analysis` | Run skill gap analysis |
| GET | `/api/placement/companies` | Browse company data |
| POST | `/api/roadmap/generate` | Generate AI roadmap |
| POST | `/api/interview/start` | Start mock interview |

Full API documentation: https://placement-iq-api.onrender.com/docs

---

## Development Progress

- [x] Week 1 — Project setup, database schema, architecture
- [x] Week 2 — Authentication with Clerk
- [x] Week 3 — Resume upload and ATS scorer
- [x] Week 4 — Skill gap analyser
- [x] Week 5 — Placement analytics dashboard
- [x] Week 6 — AI roadmap generator
- [x] Week 7 — AI mock interview module
- [x] Week 8 — Testing and mobile responsiveness
- [x] Week 9 — Deployment to Vercel + Render
- [x] Week 10 — Documentation and launch

---

## Developer

**[Aditi Singh]**  
3rd Year B.Tech — [Computer Science] — [VIT Bhopal]  
[www.linkedin.com/in/aditisingh07102007] | [https://github.com/AditiSi07] | [aditiajit4@gmail.com]

---

## License

MIT License — feel free to use this project as inspiration for your own.