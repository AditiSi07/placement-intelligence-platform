from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Query
from typing import Optional
from app.services.placement_service import parse_placement_csv, get_analytics_summary
from app.database import SessionLocal
from app.models.placement_history import PlacementHistory

router = APIRouter(prefix="/placement", tags=["placement"])

@router.get("/test")
def test_placement_route():
    return {"message": "Placement route working"}

@router.post("/upload-csv")
async def upload_placement_csv(
    file: UploadFile = File(...),
    clerk_user_id: Optional[str] = Header(None)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted.")

    file_bytes = await file.read()

    try:
        records = parse_placement_csv(file_bytes)
        if not records:
            raise HTTPException(status_code=400, detail="No valid records found in CSV.")

        db = SessionLocal()
        saved_count = 0
        try:
            for record in records:
                new_record = PlacementHistory(
                    company_name=record["company_name"],
                    job_title=record["job_title"],
                    package_lpa=record["package_lpa"],
                    placement_year=record["placement_year"],
                    branch=record["branch"],
                    eligible_branches=record["eligible_branches"],
                    min_cgpa=record["min_cgpa"],
                    bond_years=record["bond_years"],
                    job_type=record["job_type"],
                    sector=record["sector"],
                    skills_tested=record["skills_tested"],
                    selection_process=record["selection_process"],
                    students_placed=record["students_placed"],
                    college=record["college"],
                    added_by=clerk_user_id,
                )
                db.add(new_record)
                saved_count += 1
            db.commit()
            print(f"Saved {saved_count} placement records")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            db.close()

        return {
            "success": True,
            "records_imported": saved_count,
            "message": f"Successfully imported {saved_count} placement records"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/companies")
def get_companies(
    sector: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    min_package: Optional[float] = Query(None),
    max_package: Optional[float] = Query(None),
    year: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
):
    db = SessionLocal()
    try:
        query = db.query(PlacementHistory)

        if sector:
            query = query.filter(PlacementHistory.sector == sector)
        if year:
            query = query.filter(PlacementHistory.placement_year == year)
        if min_package:
            query = query.filter(PlacementHistory.package_lpa >= min_package)
        if max_package:
            query = query.filter(PlacementHistory.package_lpa <= max_package)
        if search:
            query = query.filter(
                PlacementHistory.company_name.ilike(f"%{search}%")
            )

        records = query.order_by(
            PlacementHistory.package_lpa.desc()
        ).all()

        if branch:
            records = [
                r for r in records
                if r.eligible_branches and branch in r.eligible_branches
            ]

        return {
            "companies": [
                {
                    "id": str(r.id),
                    "company_name": r.company_name,
                    "job_title": r.job_title,
                    "package_lpa": r.package_lpa,
                    "placement_year": r.placement_year,
                    "sector": r.sector,
                    "eligible_branches": r.eligible_branches,
                    "min_cgpa": r.min_cgpa,
                    "bond_years": r.bond_years,
                    "skills_tested": r.skills_tested,
                    "selection_process": r.selection_process,
                    "students_placed": r.students_placed,
                    "college": r.college,
                }
                for r in records
            ],
            "total": len(records)
        }
    finally:
        db.close()

@router.get("/analytics")
def get_analytics():
    db = SessionLocal()
    try:
        records = db.query(PlacementHistory).all()
        data = [
            {
                "company_name": r.company_name,
                "package_lpa": r.package_lpa or 0,
                "sector": r.sector or "IT",
                "students_placed": r.students_placed or 0,
                "placement_year": r.placement_year,
            }
            for r in records
        ]
        summary = get_analytics_summary(data)
        return {"analytics": summary, "total_records": len(records)}
    finally:
        db.close()

@router.get("/eligible/{clerk_user_id}")
def get_eligible_companies(clerk_user_id: str):
    from app.models.user import User
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == clerk_user_id).first()
        if not user:
            return {"companies": [], "message": "User profile not found"}

        user_cgpa = float(user.cgpa or 0)
        user_branch = user.branch or ""

        all_records = db.query(PlacementHistory).all()
        eligible = []

        for r in all_records:
            cgpa_ok = user_cgpa >= (r.min_cgpa or 0)
            branch_ok = (
                not r.eligible_branches or
                user_branch in r.eligible_branches or
                r.eligible_branches == []
            )
            if cgpa_ok and branch_ok:
                eligible.append({
                    "id": str(r.id),
                    "company_name": r.company_name,
                    "job_title": r.job_title,
                    "package_lpa": r.package_lpa,
                    "sector": r.sector,
                    "min_cgpa": r.min_cgpa,
                    "eligible_branches": r.eligible_branches,
                    "skills_tested": r.skills_tested,
                    "selection_process": r.selection_process,
                })

        eligible.sort(key=lambda x: x["package_lpa"], reverse=True)
        return {"companies": eligible, "total": len(eligible)}
    finally:
        db.close()