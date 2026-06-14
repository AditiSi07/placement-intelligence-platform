# Local Development Setup Guide

## Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | nodejs.org |
| Python | 3.12 | python.org |
| Git | Any | git-scm.com |

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/placement-intelligence-platform.git
cd placement-intelligence-platform
```

## Backend setup

```bash
cd backend
py -3.12 -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Fill in your real values in .env

# Start backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

## Frontend setup

```bash
cd frontend
npm install

# Create your .env.local file
cp .env.example .env.local
# Fill in your real values in .env.local

npm run dev
```

Frontend runs at: http://localhost:3000

## Database setup

1. Create a free Supabase project at supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the contents of docs/database-schema.sql
4. Copy your connection string into backend/.env

## Services you need accounts for (all free)

| Service | Purpose | URL |
|---|---|---|
| Supabase | Database + Storage | supabase.com |
| Clerk | Authentication | clerk.com |
| OpenAI | AI features | platform.openai.com |
| Vercel | Frontend deployment | vercel.com |
| Render | Backend deployment | render.com |