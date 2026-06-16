from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

if "your_supabase" in DATABASE_URL or "not_set" in DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    print("WARNING: Using local SQLite.")
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=3,
        max_overflow=5,
        pool_timeout=30,
        pool_recycle=300,        # recycle connections every 5 minutes
        pool_pre_ping=True,      # test connection before using it
    )
    print("Connected to Supabase PostgreSQL database.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False