# Local Development Setup Guide

## Prerequisites
- Node.js 18+
- Python 3.10+
- Git

## Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your .env values

uvicorn main:app --reload
```
Backend runs at: http://localhost:8000

## Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your .env.local values

npm run dev
```
Frontend runs at: http://localhost:3000

## API Docs
Once backend is running, visit: http://localhost:8000/docs