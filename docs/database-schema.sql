-- =============================================
-- PLACEMENT INTELLIGENCE PLATFORM
-- Database Schema
-- Run this in Supabase SQL Editor to set up DB
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coordinator', 'admin')),
    college TEXT,
    branch TEXT,
    graduation_year TEXT,
    cgpa TEXT,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    parsed_text TEXT,
    ats_score INTEGER,
    score_breakdown JSONB,
    missing_keywords TEXT[],
    suggestions TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_description TEXT NOT NULL,
    required_skills TEXT[],
    preferred_skills TEXT[],
    experience_level TEXT,
    job_type TEXT DEFAULT 'fulltime',
    location TEXT,
    package_lpa TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    aliases TEXT[],
    is_technical BOOLEAN DEFAULT TRUE,
    demand_score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gap_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    match_percentage INTEGER,
    matched_skills TEXT[],
    missing_skills TEXT[],
    bonus_skills TEXT[],
    priority_gaps JSONB,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    interview_type TEXT DEFAULT 'technical',
    difficulty TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'in_progress',
    total_questions INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    overall_score INTEGER,
    duration_minutes INTEGER,
    transcript JSONB,
    feedback JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS placement_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    package_lpa DECIMAL(5,2),
    placement_year INTEGER NOT NULL,
    branch TEXT,
    eligible_branches TEXT[],
    min_cgpa DECIMAL(3,1),
    bond_years INTEGER DEFAULT 0,
    job_type TEXT DEFAULT 'fulltime',
    sector TEXT,
    skills_tested TEXT[],
    selection_process TEXT[],
    students_placed INTEGER DEFAULT 0,
    college TEXT,
    added_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);