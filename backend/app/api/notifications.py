from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if role:
        query = query.filter((Notification.target_role == role) | (Notification.target_role.is_(None)))
    return query.order_by(Notification.created_at.desc()).all()

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found.")
    n.read = True
    db.commit()
    return {"message": "Notification marked read", "id": notification_id}
