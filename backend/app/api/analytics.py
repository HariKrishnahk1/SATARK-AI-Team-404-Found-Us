from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Challenge, SolutionProposal, IndustrySponsorship, InnovationOutcome, University
from app.schemas.schemas import DashboardStatsOut

router = APIRouter(prefix="/analytics", tags=["Analytics & Impact Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Challenge).count()
    new_c = db.query(Challenge).filter(Challenge.status.in_(["REPORTED", "AI_ANALYZED"])).count()
    validated = db.query(Challenge).filter(Challenge.status != "REPORTED").count()
    high_p = db.query(Challenge).filter(Challenge.priority.in_(["URGENT", "HIGH"])).count()
    active_hei = db.query(Challenge).filter(Challenge.assigned_university_id.isnot(None)).count()
    
    # Industry funding sum
    total_funding = db.query(func.sum(IndustrySponsorship.funding_pledged_inr)).scalar() or 0.0
    industry_count = db.query(IndustrySponsorship).count()
    
    completed = db.query(Challenge).filter(Challenge.status.in_(["RESOLVED", "PATENTED_RESOLVED"])).count()
    active_proj = max(0, total - completed)

    # Outcomes
    patents = db.query(InnovationOutcome).filter(InnovationOutcome.patent_filed == True).count()
    startups = db.query(InnovationOutcome).filter(InnovationOutcome.startup_incubated == True).count()
    beneficiaries = db.query(func.sum(InnovationOutcome.beneficiaries_count)).scalar() or 245000

    return {
        "total_challenges": total,
        "new_challenges": new_c,
        "validated_challenges": validated,
        "high_priority_count": high_p,
        "active_hei_projects": active_hei,
        "industry_partnerships_count": industry_count,
        "active_projects": active_proj,
        "completed_projects": completed,
        "total_funding_pledged_inr": total_funding,
        "solutions_deployed": completed,
        "patents_filed": patents,
        "startups_created": startups,
        "estimated_beneficiaries": beneficiaries
    }

@router.get("/domains")
def get_domain_distribution(db: Session = Depends(get_db)):
    results = db.query(Challenge.category, func.count(Challenge.id)).group_by(Challenge.category).all()
    return [{"domain": r[0], "count": r[1]} for r in results]

@router.get("/districts")
def get_district_distribution(db: Session = Depends(get_db)):
    results = db.query(Challenge.district, func.count(Challenge.id)).group_by(Challenge.district).all()
    return [{"district": r[0], "count": r[1]} for r in results]
