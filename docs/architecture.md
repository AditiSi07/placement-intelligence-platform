# System Architecture

## Overview
The platform has three main layers:
1. Frontend (Next.js) — what the user sees
2. Backend (FastAPI) — business logic and AI calls
3. Database (Supabase/PostgreSQL) — data storage

## Request Flow
User browser → Next.js frontend → FastAPI backend → Supabase DB
                                                   → OpenAI API

## Services Used
- Clerk: handles user login/signup
- Supabase: PostgreSQL database + file storage
- OpenAI: GPT-4o for roadmap and mock interview
- Vercel: hosts the frontend
- Render: hosts the FastAPI backend

## Database Tables (to be created in Week 1)
- users
- resumes
- jobs
- skills
- gap_analyses
- mock_interviews
- placement_history