from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import SolutionProposal, Challenge, Notification
from app.schemas.schemas import SolutionProposalCreate, SolutionProposalOut
from app.core.sockets import broadcast_event

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.post("", response_model=SolutionProposalOut)
async def create_proposal(prop_in: SolutionProposalCreate, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == prop_in.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    uni_id = ch.assigned_university_id or "hei-bit-mesra"

    proposal = SolutionProposal(
        challenge_id=prop_in.challenge_id,
        university_id=uni_id,
        title=prop_in.title,
        abstract=prop_in.abstract,
        proposed_methodology=prop_in.proposed_methodology,
        technology_stack=prop_in.technology_stack,
        faculty_lead_name=prop_in.faculty_lead_name,
        student_members=prop_in.student_members,
        estimated_cost_inr=prop_in.estimated_cost_inr,
        duration_months=prop_in.duration_months,
        status="SUBMITTED"
    )
    db.add(proposal)
    
    # Update challenge status
    ch.status = "PROPOSAL_SUBMITTED"
    ch.updated_at = datetime.now(timezone.utc)
    
    # Create Notification for Industry / CSR Partners
    notif = Notification(
        title="New University Solution Proposal Submitted",
        message=f"Proposal '{proposal.title}' submitted for {ch.title} (Budget: ₹{proposal.estimated_cost_inr:,.2f})",
        notification_type="PROPOSAL_SUBMITTED",
        target_role="INDUSTRY_PARTNER",
        challenge_id=ch.id
    )
    db.add(notif)
    db.commit()
    db.refresh(proposal)

    await broadcast_event("PROPOSAL_SUBMITTED", {
        "proposal_id": proposal.id,
        "challenge_id": ch.id,
        "title": proposal.title,
        "budget_inr": proposal.estimated_cost_inr,
        "status": ch.status
    })

    return proposal

@router.get("", response_model=List[SolutionProposalOut])
def list_proposals(challenge_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SolutionProposal)
    if challenge_id:
        query = query.filter(SolutionProposal.challenge_id == challenge_id)
    return query.order_by(SolutionProposal.submitted_at.desc()).all()

@router.get("/{proposal_id}", response_model=SolutionProposalOut)
def get_proposal(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(SolutionProposal).filter(SolutionProposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    return prop
