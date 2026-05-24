from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database.db import get_db
from app.models.models import User, Complaint, ComplaintMessage, Land
from app.schemas.schemas import ComplaintCreate, ComplaintResponse, ComplaintMessageCreate, ComplaintMessageResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

def _fmt_complaint(c, db, user_map=None):
    """Format complaint for response — always attach messages."""
    msgs = db.query(ComplaintMessage).filter(ComplaintMessage.complaint_id == c.id).order_by(ComplaintMessage.created_at.asc()).all()
    return {
        "id": str(c.id),
        "customer_id": str(c.customer_id),
        "land_id": str(c.land_id) if c.land_id else None,
        "title": c.title,
        "description": c.description,
        "status": c.status,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
        "messages": [
            {
                "id": str(m.id),
                "complaint_id": str(m.complaint_id),
                "sender_id": str(m.sender_id),
                "message": m.message,
                "attachment_url": m.attachment_url,
                "created_at": m.created_at,
            } for m in msgs
        ]
    }

@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "CUSTOMER":
        raise HTTPException(status_code=403, detail="Only customers can create complaints.")

    complaint = Complaint(
        id=uuid.uuid4(),
        customer_id=current_user.id,
        land_id=payload.land_id,
        title=payload.title,
        description=payload.description,
        status="OPEN"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return _fmt_complaint(complaint, db)

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Complaint)
    if current_user.role == "CUSTOMER":
        q = q.filter(Complaint.customer_id == current_user.id)
    elif current_user.role in ("AGENT", "WORKER"):
        # Agent sees complaints linked to their assigned lands
        agent_land_ids_raw = (current_user.land_id or "").split(",")
        agent_land_ids = [s.strip() for s in agent_land_ids_raw if s.strip()]
        if agent_land_ids:
            land_uuids = db.query(Land.id).filter(Land.land_id.in_(agent_land_ids)).all()
            land_uuids = [l[0] for l in land_uuids]
            q = q.filter(Complaint.land_id.in_(land_uuids))
        else:
            q = q.filter(Complaint.id == uuid.uuid4())  # empty result
    elif current_user.role == "OWNER":
        # Owner sees complaints for lands they own
        owner_land_uuids = db.query(Land.id).filter(Land.owner_id == current_user.id).all()
        owner_land_uuids = [l[0] for l in owner_land_uuids]
        if owner_land_uuids:
            q = q.filter(Complaint.land_id.in_(owner_land_uuids))
        else:
            q = q.filter(Complaint.id == uuid.uuid4())
    # ADMIN / SUPER_ADMIN see all
    complaints = q.order_by(Complaint.created_at.desc()).all()
    return [_fmt_complaint(c, db) for c in complaints]

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role == "CUSTOMER" and complaint.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint")
    return _fmt_complaint(complaint, db)

@router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["OWNER", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Only Owner/Admin can update complaint status")
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    new_status = body.get("status", "").upper()
    valid = ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"]
    if new_status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    complaint.status = new_status
    db.commit()
    return _fmt_complaint(complaint, db)

@router.post("/{complaint_id}/messages", response_model=ComplaintMessageResponse, status_code=201)
def add_message(
    complaint_id: str,
    payload: ComplaintMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Customers can only message their own complaints
    if current_user.role == "CUSTOMER" and complaint.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    msg = ComplaintMessage(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        sender_id=current_user.id,
        message=payload.message
    )
    db.add(msg)

    # auto update status
    if current_user.role in ["OWNER", "ADMIN", "SUPER_ADMIN"] and complaint.status == "OPEN":
        complaint.status = "IN_REVIEW"
    elif current_user.role == "CUSTOMER" and complaint.status == "RESOLVED":
        complaint.status = "OPEN"  # Reopen if customer replies after resolve

    db.commit()
    db.refresh(msg)
    return {
        "id": str(msg.id),
        "complaint_id": str(msg.complaint_id),
        "sender_id": str(msg.sender_id),
        "message": msg.message,
        "attachment_url": msg.attachment_url,
        "created_at": msg.created_at,
    }

