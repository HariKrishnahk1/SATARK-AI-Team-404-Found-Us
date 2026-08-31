from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import University, Challenge, Notification
from app.schemas.schemas import UniversityMatchOut
from app.ai.engine import ai_engine
from app.core.sockets import broadcast_event

router = APIRouter(prefix="/universities", tags=["Universities"])

@router.get("")
def list_universities(db: Session = Depends(get_db)):
    unis = db.query(University).all()
    return unis

@router.get("/recommendations/{challenge_id}")
def recommend_universities(challenge_id: str, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    challenge_dict = {
        "id": ch.id,
        "title": ch.title,
        "district": ch.district,
        "recommended_disciplines": ch.recommended_disciplines or ["Civil Engineering", "Environmental Engineering"]
    }
    matches = ai_engine.recommend_universities(challenge_dict)
    return {"challenge_id": challenge_id, "recommended_universities": matches}

@router.post("/assign")
async def assign_university(challenge_id: str, university_id: str, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    uni = db.query(University).filter(University.id == university_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found.")

    ch.assigned_university_id = uni.id
    ch.status = "HEI_ASSIGNED"
    ch.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Notify HEI Coordinator
    notif = Notification(
        title="New Challenge Routed to HEI",
        message=f"[{ch.district}] {ch.title} assigned to {uni.name}",
        notification_type="HEI_ASSIGNED",
        target_role="HEI_COORDINATOR",
        challenge_id=ch.id
    )
    db.add(notif)
    db.commit()

    await broadcast_event("HEI_ASSIGNED", {
        "challenge_id": ch.id,
        "university_id": uni.id,
        "university_name": uni.name,
        "status": ch.status
    })

    return {"message": f"Assigned challenge to {uni.name} successfully.", "challenge": ch}
