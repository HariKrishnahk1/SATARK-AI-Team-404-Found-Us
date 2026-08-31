from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.models.models import Challenge, AIAnalysis, AuditLog, Notification, Department, User
from app.schemas.schemas import ChallengeCreate, ChallengeOut, ChallengeValidateRequest, AIAnalysisOut
from app.ai.engine import ai_engine
from app.core.sockets import broadcast_event

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("", response_model=ChallengeOut)
async def create_challenge(challenge_in: ChallengeCreate, db: Session = Depends(get_db)):
    # Run AI Analysis automatically on submission
    ai_res = ai_engine.analyze_challenge(
        description=challenge_in.citizen_description,
        title=challenge_in.title,
        location=challenge_in.address
    )

    # Calculate SLA Deadline based on AI Severity (Critical = 24h, High = 72h, Medium = 168h, Low = 336h)
    hours = 72
    if ai_res["severity"] == "CRITICAL":
        hours = 24
    elif ai_res["severity"] == "HIGH":
        hours = 72
    elif ai_res["severity"] == "MEDIUM":
        hours = 168
    else:
        hours = 336

    sla_deadline = datetime.now(timezone.utc) + timedelta(hours=hours)

    db_challenge = Challenge(
        title=challenge_in.title,
        citizen_description=challenge_in.citizen_description,
        image_url=challenge_in.image_url or "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop",
        latitude=challenge_in.latitude,
        longitude=challenge_in.longitude,
        address=challenge_in.address,
        district=challenge_in.district,
        category=ai_res["domain"],
        sub_category=ai_res.get("sub_category"),
        severity=ai_res["severity"],
        priority=ai_res["priority"],
        priority_score=ai_res["priority_score"],
        ai_confidence=94.0,
        ai_reason=ai_res["reasoning"],
        ai_reasoning_points=[ai_res["reasoning"]],
        recommended_disciplines=ai_res["recommended_disciplines"],
        status="AI_ANALYZED",
        sla_deadline=sla_deadline,
        override_logs=[],
        comments=[]
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)

    # Save AI Analysis details
    db_analysis = AIAnalysis(
        challenge_id=db_challenge.id,
        domain=ai_res["domain"],
        category=ai_res["category"],
        sub_category=ai_res.get("sub_category"),
        keywords=ai_res.get("keywords", []),
        severity=ai_res["severity"],
        priority=ai_res["priority"],
        priority_score=ai_res["priority_score"],
        reasoning=ai_res["reasoning"],
        recommended_disciplines=ai_res["recommended_disciplines"],
        recommended_solution_directions=ai_res["recommended_solution_directions"],
        vector_embedding=ai_res.get("embedding")
    )
    db.add(db_analysis)

    # Create notification for government super admin / department head
    notif = Notification(
        title="New Societal Challenge Submitted",
        message=f"[{db_challenge.district}] {db_challenge.title} - AI Priority Score: {db_challenge.priority_score}",
        notification_type="NEW_COMPLAINT",
        target_role="SUPER_ADMIN",
        challenge_id=db_challenge.id
    )
    db.add(notif)
    db.commit()

    # Emit Socket.io real-time event to Admin Command Centre
    await broadcast_event("NEW_CHALLENGE", {
        "id": db_challenge.id,
        "title": db_challenge.title,
        "district": db_challenge.district,
        "priority": db_challenge.priority,
        "priority_score": db_challenge.priority_score,
        "category": db_challenge.category,
        "created_at": db_challenge.created_at.isoformat()
    })

    return db_challenge

@router.get("", response_model=List[ChallengeOut])
def list_challenges(
    district: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Challenge)
    if district:
        query = query.filter(Challenge.district == district)
    if category:
        query = query.filter(Challenge.category == category)
    if priority:
        query = query.filter(Challenge.priority == priority)
    if status:
        query = query.filter(Challenge.status == status)

    return query.order_by(Challenge.created_at.desc()).all()

@router.get("/{challenge_id}", response_model=ChallengeOut)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    return ch

@router.post("/{challenge_id}/validate", response_model=ChallengeOut)
async def validate_challenge(
    challenge_id: str,
    val_req: ChallengeValidateRequest,
    db: Session = Depends(get_db)
):
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    # Record overrides if admin changed AI values
    logs = ch.override_logs or []
    if val_req.severity and val_req.severity != ch.severity:
        logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": "admin-01",
            "user_name": "Department Admin",
            "field": "severity",
            "old_value": ch.severity,
            "new_value": val_req.severity,
            "reason": val_req.override_reason or "Government validation adjustment"
        })
        ch.severity = val_req.severity

    if val_req.priority and val_req.priority != ch.priority:
        logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": "admin-01",
            "user_name": "Department Admin",
            "field": "priority",
            "old_value": ch.priority,
            "new_value": val_req.priority,
            "reason": val_req.override_reason or "Government validation adjustment"
        })
        ch.priority = val_req.priority

    if val_req.department_id:
        ch.department_id = val_req.department_id

    ch.override_logs = logs
    ch.status = "GOVERNMENT_VALIDATED"
    ch.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ch)

    # Emit Socket.io update event
    await broadcast_event("CHALLENGE_VALIDATED", {
        "id": ch.id,
        "status": ch.status,
        "title": ch.title,
        "district": ch.district
    })

    return ch

@router.post("/{challenge_id}/duplicates")
def detect_duplicates(challenge_id: str, db: Session = Depends(get_db)):
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    all_challenges = db.query(Challenge).all()
    ch_dict_list = [
        {
            "id": c.id,
            "title": c.title,
            "citizen_description": c.citizen_description,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "district": c.district
        }
        for c in all_challenges
    ]

    target_dict = {
        "id": ch.id,
        "title": ch.title,
        "citizen_description": ch.citizen_description,
        "latitude": ch.latitude,
        "longitude": ch.longitude,
        "district": ch.district
    }

    duplicates = ai_engine.detect_duplicates(target_dict, ch_dict_list)
    return {"challenge_id": challenge_id, "duplicates": duplicates}
