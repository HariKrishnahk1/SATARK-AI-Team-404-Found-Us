from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Challenge, ProjectMilestone, InnovationOutcome, Notification
from app.schemas.schemas import MilestoneCreate, MilestoneUpdate, ImpactReportCreate
from app.core.sockets import broadcast_event

router = APIRouter(prefix="/projects", tags=["Project Lifecycle & Impact"])

@router.patch("/{challenge_id}/status")
async def update_project_status(challenge_id: str, new_status: str, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    ch.status = new_status
    ch.updated_at = datetime.now(timezone.utc)
    db.commit()

    await broadcast_event("STATUS_UPDATED", {
        "challenge_id": ch.id,
        "title": ch.title,
        "new_status": new_status
    })

    return {"message": f"Updated status to {new_status}", "challenge_id": challenge_id, "status": new_status}

@router.post("/milestones")
async def create_milestone(m_in: MilestoneCreate, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == m_in.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    milestone = ProjectMilestone(
        challenge_id=m_in.challenge_id,
        title=m_in.title,
        description=m_in.description,
        target_date=m_in.target_date,
        deliverables=m_in.deliverables,
        assigned_members=m_in.assigned_members,
        status="PENDING"
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    return milestone

@router.patch("/milestones/{milestone_id}")
async def update_milestone(milestone_id: str, m_up: MilestoneUpdate, db: Session = Depends(get_db)):
    m = db.query(ProjectMilestone).filter(ProjectMilestone.id == milestone_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    if m_up.status:
        m.status = m_up.status
    if m_up.completion_percentage is not None:
        m.completion_percentage = m_up.completion_percentage

    db.commit()
    db.refresh(m)

    await broadcast_event("MILESTONE_UPDATED", {
        "milestone_id": m.id,
        "title": m.title,
        "status": m.status,
        "completion_percentage": m.completion_percentage
    })

    return m

@router.post("/impact")
async def record_impact(imp_in: ImpactReportCreate, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == imp_in.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    outcome = db.query(InnovationOutcome).filter(InnovationOutcome.challenge_id == imp_in.challenge_id).first()
    if not outcome:
        outcome = InnovationOutcome(challenge_id=imp_in.challenge_id)
        db.add(outcome)

    outcome.patent_filed = imp_in.patent_filed
    outcome.patent_app_no = imp_in.patent_app_no
    outcome.startup_incubated = imp_in.startup_incubated
    outcome.startup_name = imp_in.startup_name
    outcome.pilot_deployment_location = imp_in.pilot_deployment_location
    outcome.beneficiaries_count = imp_in.beneficiaries_count
    outcome.environmental_impact = imp_in.environmental_impact
    outcome.social_impact_summary = imp_in.social_impact_summary
    outcome.cost_efficiency_notes = imp_in.cost_efficiency_notes

    ch.status = "RESOLVED"
    ch.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Broadcast notification to citizen and public portals
    notif = Notification(
        title="Societal Challenge Resolved!",
        message=f"Challenge '{ch.title}' has been successfully resolved and deployed with measurable impact.",
        notification_type="RESOLUTION_SUBMITTED",
        challenge_id=ch.id
    )
    db.add(notif)
    db.commit()

    await broadcast_event("PROJECT_RESOLVED", {
        "challenge_id": ch.id,
        "title": ch.title,
        "beneficiaries": outcome.beneficiaries_count,
        "status": ch.status
    })

    return outcome
