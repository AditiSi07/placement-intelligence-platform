import csv
import io
from typing import List, Dict, Any

def parse_placement_csv(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Parse a CSV file of placement records."""
    try:
        content = file_bytes.decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        records = []

        for row in reader:
            # Clean and parse each row
            record = {
                "company_name": row.get("company_name", "").strip(),
                "job_title": row.get("job_title", "").strip(),
                "package_lpa": float(row.get("package_lpa", 0) or 0),
                "placement_year": int(row.get("placement_year", 2024) or 2024),
                "branch": row.get("branch", "").strip(),
                "eligible_branches": [
                    b.strip() for b in row.get("eligible_branches", "").split(",")
                    if b.strip()
                ],
                "min_cgpa": float(row.get("min_cgpa", 0) or 0),
                "bond_years": int(row.get("bond_years", 0) or 0),
                "job_type": row.get("job_type", "fulltime").strip(),
                "sector": row.get("sector", "IT").strip(),
                "skills_tested": [
                    s.strip() for s in row.get("skills_tested", "").split(",")
                    if s.strip()
                ],
                "selection_process": [
                    s.strip() for s in row.get("selection_process", "").split(",")
                    if s.strip()
                ],
                "students_placed": int(row.get("students_placed", 0) or 0),
                "college": row.get("college", "").strip(),
            }

            if record["company_name"]:
                records.append(record)

        return records
    except Exception as e:
        raise Exception(f"Error parsing CSV: {str(e)}")

def get_analytics_summary(records: List[Dict]) -> Dict[str, Any]:
    """Generate summary statistics from placement records."""
    if not records:
        return {}

    packages = [r["package_lpa"] for r in records if r["package_lpa"] > 0]
    total_students = sum(r["students_placed"] for r in records)

    # Sector breakdown
    sectors = {}
    for r in records:
        sector = r["sector"]
        sectors[sector] = sectors.get(sector, 0) + r["students_placed"]

    # Top companies by package
    sorted_by_package = sorted(records, key=lambda x: x["package_lpa"], reverse=True)
    top_companies = [
        {"company": r["company_name"], "package": r["package_lpa"]}
        for r in sorted_by_package[:5]
    ]

    return {
        "total_companies": len(records),
        "total_students_placed": total_students,
        "avg_package": round(sum(packages) / len(packages), 2) if packages else 0,
        "highest_package": max(packages) if packages else 0,
        "lowest_package": min(packages) if packages else 0,
        "sector_breakdown": sectors,
        "top_companies_by_package": top_companies,
    }