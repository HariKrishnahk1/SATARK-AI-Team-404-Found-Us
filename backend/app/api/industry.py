from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import IndustrySponsorship, SolutionProposal, Challenge, Notification
from app.schemas.schemas import SponsorshipCreate, SponsorshipOut
from app.core.sockets import broadcast_event

router = APIRouter(prefix="/industry", tags=["Industry & CSR"])

@router.post("/sponsorships", response_model=SponsorshipOut)
async def pledge_sponsorship(spon_in: SponsorshipCreate, db: Session = Depends(get_db)):
    prop = db.query(SolutionProposal).filter(SolutionProposal.id == spon_in.proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    sponsorship = IndustrySponsorship(
        proposal_id=spon_in.proposal_id,
        organization_name=spon_in.organization_name,
        partner_type=spon_in.partner_type,
        contact_person=spon_in.contact_person,
        funding_pledged_inr=spon_in.funding_pledged_inr,
        mentorship_provided=spon_in.mentorship_provided,
        prototyping_support=spon_in.prototyping_support,
        equipment_support=spon_in.equipment_support,
        is_demo_data=True
    )
    db.add(sponsorship)

    # Update proposal and challenge status
    prop.status = "FUNDED"
    ch = db.query(Challenge).filter(Challenge.id == prop.challenge_id).first()
    if ch:
        ch.status = "INDUSTRY_SPONSORED"
        ch.updated_at = datetime.now(timezone.utc)

    # Notify University
    notif = Notification(
        title="CSR / Industry Sponsorship Pledged!",
        message=f"{spon_in.organization_name} pledged ₹{spon_in.funding_pledged_inr:,.2f} CSR funding for proposal '{prop.title}'",
        notification_type="SPONSORSHIP_PLEDGED",
        target_role="HEI_COORDINATOR",
        challenge_id=ch.id if ch else None
    )
    db.add(notif)
    db.commit()
    db.refresh(sponsorship)

    await broadcast_event("SPONSORSHIP_PLEDGED", {
        "sponsorship_id": sponsorship.id,
        "proposal_id": prop.id,
        "organization_name": sponsorship.organization_name,
        "funding_inr": sponsorship.funding_pledged_inr,
        "status": ch.status if ch else "FUNDED"
    })

    return sponsorship

@router.get("/sponsorships", response_model=List[SponsorshipOut])
def list_sponsorships(db: Session = Depends(get_db)):
    spons = db.query(IndustrySponsorship).order_by(IndustrySponsorship.pledged_at.desc()).all()
    return spons
