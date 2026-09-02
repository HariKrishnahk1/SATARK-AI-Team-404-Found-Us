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

from app.schemas.schemas import PrototypeSubmitRequest, OfficerAssignRequest, FieldReportSubmitRequest

@router.post("/prototype")
async def submit_prototype(proto_in: PrototypeSubmitRequest, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == proto_in.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    ch.status = "PROTOTYPE_BUILT"
    ch.updated_at = datetime.now(timezone.utc)
    
    # Record prototype fabrication comment/log
    proto_log = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_name": proto_in.student_team_lead or "Student Innovator Team",
        "action": "PROTOTYPE_SUBMITTED",
        "title": proto_in.prototype_title,
        "specs": proto_in.fabrication_specs,
        "materials": proto_in.materials_used,
        "cost_inr": proto_in.fabrication_cost_inr,
        "testing_metrics": proto_in.testing_metrics
    }
    existing_comments = list(ch.comments or [])
    existing_comments.append(proto_log)
    ch.comments = existing_comments

    # Multi-portal notifications for Govt, HEI, and Industry
    n1 = Notification(
        title="New Prototype Ready for Field Trial Assignment",
        message=f"Student team led by {proto_in.student_team_lead} completed prototype '{proto_in.prototype_title}' for challenge '{ch.title}'. Assign Field Officer for Pilot Trial.",
        notification_type="PROTOTYPE_SUBMITTED",
        target_role="SUPER_ADMIN",
        challenge_id=ch.id
    )
    n2 = Notification(
        title="Student Prototype Fabrication Completed",
        message=f"Prototype '{proto_in.prototype_title}' fabrication successfully completed and submitted for pilot verification.",
        notification_type="PROTOTYPE_SUBMITTED",
        target_role="HEI_COORDINATOR",
        challenge_id=ch.id
    )
    n3 = Notification(
        title="Sponsored Prototype Ready for Pilot Verification",
        message=f"Industry sponsored prototype '{proto_in.prototype_title}' is ready for government pilot trial verification.",
        notification_type="PROTOTYPE_SUBMITTED",
        target_role="INDUSTRY_PARTNER",
        challenge_id=ch.id
    )
    db.add_all([n1, n2, n3])
    db.commit()
    db.refresh(ch)

    await broadcast_event("PROTOTYPE_SUBMITTED", {
        "challenge_id": ch.id,
        "title": ch.title,
        "prototype_title": proto_in.prototype_title,
        "status": "PROTOTYPE_BUILT"
    })

    return {"message": "Prototype submitted successfully!", "challenge": ch, "log": proto_log}

@router.post("/assign-officer")
async def assign_field_officer(off_in: OfficerAssignRequest, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == off_in.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    ch.status = "PILOT_DEPLOYMENT"
    ch.updated_at = datetime.now(timezone.utc)

    assign_log = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_name": "Government Command Centre",
        "action": "FIELD_OFFICER_ASSIGNED",
        "officer_name": off_in.officer_name,
        "designation": off_in.designation,
        "notes": off_in.assignment_notes
    }
    existing_comments = list(ch.comments or [])
    existing_comments.append(assign_log)
    ch.comments = existing_comments

    n1 = Notification(
        title="Pilot Field Trial Assigned",
        message=f"Field Officer {off_in.officer_name} assigned to conduct field trial check for challenge '{ch.title}'.",
        notification_type="OFFICER_ASSIGNED",
        target_role="OFFICER",
        challenge_id=ch.id
    )
    n2 = Notification(
        title="Government Pilot Trial Initiated",
        message=f"Government assigned Officer {off_in.officer_name} to verify field prototype performance for '{ch.title}'.",
        notification_type="OFFICER_ASSIGNED",
        target_role="HEI_COORDINATOR",
        challenge_id=ch.id
    )
    db.add_all([n1, n2])
    db.commit()

    await broadcast_event("OFFICER_ASSIGNED", {
        "challenge_id": ch.id,
        "title": ch.title,
        "officer_name": off_in.officer_name,
        "status": "PILOT_DEPLOYMENT"
    })

    return {"message": f"Officer {off_in.officer_name} assigned for pilot trial.", "challenge": ch}

@router.post("/field-report")
async def submit_field_report(rep_in: FieldReportSubmitRequest, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == rep_in.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    ch.status = "RESOLVED"
    ch.updated_at = datetime.now(timezone.utc)

    # Upsert InnovationOutcome
    outcome = db.query(InnovationOutcome).filter(InnovationOutcome.challenge_id == rep_in.challenge_id).first()
    if not outcome:
        outcome = InnovationOutcome(challenge_id=rep_in.challenge_id)
        db.add(outcome)

    outcome.pilot_deployment_location = rep_in.deployment_location or ch.address
    outcome.beneficiaries_count = rep_in.estimated_beneficiaries
    outcome.social_impact_summary = f"Field Verification by {rep_in.officer_name}: {rep_in.inspection_metrics}. {rep_in.field_notes or ''}"
    if rep_in.solved_image_proof:
        outcome.solved_image_url = rep_in.solved_image_proof
    if rep_in.verification_pdf_proof:
        outcome.verification_pdf_url = rep_in.verification_pdf_proof

    report_log = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_name": rep_in.officer_name,
        "action": "FIELD_REPORT_SUBMITTED",
        "verification_status": rep_in.verification_status,
        "inspection_metrics": rep_in.inspection_metrics,
        "notes": rep_in.field_notes,
        "solved_image_proof": rep_in.solved_image_proof,
        "verification_pdf_proof": rep_in.verification_pdf_proof
    }
    existing_comments = list(ch.comments or [])
    existing_comments.append(report_log)
    ch.comments = existing_comments

    # Dispatched resolution notification across all portals
    n_res = Notification(
        title="Field Verification Approved — Solution Deployed & Resolved!",
        message=f"Verification report for '{ch.title}' submitted by {rep_in.officer_name}. Solution is fully deployed and marked RESOLVED.",
        notification_type="FIELD_REPORT_APPROVED",
        challenge_id=ch.id
    )
    db.add(n_res)
    db.commit()

    await broadcast_event("FIELD_REPORT_APPROVED", {
        "challenge_id": ch.id,
        "title": ch.title,
        "officer_name": rep_in.officer_name,
        "status": "RESOLVED",
        "solved_image_proof": rep_in.solved_image_proof,
        "verification_pdf_proof": rep_in.verification_pdf_proof
    })

    return {
        "message": "Field verification report submitted. Challenge marked RESOLVED & DEPLOYED!",
        "challenge": ch,
        "solved_image_proof": rep_in.solved_image_proof,
        "verification_pdf_proof": rep_in.verification_pdf_proof
    }

