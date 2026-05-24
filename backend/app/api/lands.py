import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import Land, User, AuditLog
from app.schemas.schemas import LandCreate, LandUpdate, LandResponse
from app.core.dependencies import require_admin, require_owner, get_current_user

router = APIRouter(prefix="/api/admin/lands", tags=["Admin - Lands"])

def _audit(db, action, by, details=""):
    db.add(AuditLog(id=uuid.uuid4(), action=action, performed_by=by,
                    target_user="-", details=details))


@router.get("", response_model=List[LandResponse])
def list_lands(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Land)
    
    if current_user.role == "OWNER":
        q = q.filter(Land.owner_id == current_user.id)
    elif current_user.role == "CUSTOMER":
        # Customer sees their own lands where they are the customer_id
        q = q.filter(Land.customer_id == current_user.id)
    elif current_user.role in ("AGENT", "WORKER"):
        q = q.filter(Land.land_id == current_user.land_id)

    if search:
        s = f"%{search}%"
        q = q.filter(Land.land_id.ilike(s) | Land.land_name.ilike(s) | Land.district.ilike(s))
    lands = q.order_by(Land.created_at.desc()).all()
    return [_fmt(l) for l in lands]


@router.get("/{land_id}", response_model=LandResponse)
def get_land(land_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    land = db.query(Land).filter(Land.id == land_id).first()
    if not land:
        raise HTTPException(404, "Land not found")
    return _fmt(land)


@router.post("", response_model=LandResponse, status_code=201)
def create_land(
    payload: LandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    # Land ID is MANUAL — check uniqueness
    if db.query(Land).filter(Land.land_id == payload.land_id).first():
        raise HTTPException(400, f"Land ID '{payload.land_id}' already exists. Land IDs must be unique.")

    # Automatically set owner_id if current user is owner
    owner_id = None
    if current_user.role == "OWNER":
        owner_id = current_user.id
    elif getattr(payload, "owner_id", None) and payload.owner_id != "":
        owner_id = uuid.UUID(payload.owner_id)

    land = Land(
        id=uuid.uuid4(),
        land_id=payload.land_id,   # e.g. TN-CH-001 — entered manually by admin
        land_name=payload.land_name,
        district=payload.district,
        village=payload.village,
        owner_id=owner_id,
        customer_id=None,
        created_by=current_user.id
    )
    db.add(land)
    _audit(db, "LAND_CREATED", current_user.username,
           f"Land {payload.land_id} — {payload.land_name} — {payload.district}")
    db.commit()
    db.refresh(land)
    return _fmt(land)


@router.put("/{land_id}", response_model=LandResponse)
def update_land(
    land_id: str,
    payload: LandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    land = db.query(Land).filter(Land.id == land_id).first()
    if not land:
        raise HTTPException(404, "Land not found")

    if current_user.role == "OWNER" and land.owner_id != current_user.id:
        raise HTTPException(403, "Not authorized to update this land")

    # Land ID itself cannot be changed after creation
    update_data = payload.dict(exclude_none=True)

    if "owner_id" in update_data and update_data["owner_id"]:
        # Only SUPER_ADMIN/ADMIN can change the owner
        if current_user.role in ("SUPER_ADMIN", "ADMIN"):
            owner = db.query(User).filter(User.id == update_data["owner_id"]).first()
            if not owner:
                raise HTTPException(400, "Owner user not found")
            land.owner_id = uuid.UUID(update_data.pop("owner_id"))
        else:
            update_data.pop("owner_id")

    if "customer_id" in update_data and update_data["customer_id"]:
        cust = db.query(User).filter(User.id == update_data["customer_id"]).first()
        if not cust:
            raise HTTPException(400, "Customer user not found")
        land.customer_id = uuid.UUID(update_data.pop("customer_id"))

    for field, val in update_data.items():
        setattr(land, field, val)

    _audit(db, "LAND_UPDATED", current_user.username, f"Land {land.land_id} updated")
    db.commit()
    db.refresh(land)
    return _fmt(land)


@router.delete("/{land_id}")
def delete_land(
    land_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    land = db.query(Land).filter(Land.id == land_id).first()
    if not land:
        raise HTTPException(404, "Land not found")

    if current_user.role == "OWNER" and land.owner_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete this land")

    _audit(db, "LAND_DELETED", current_user.username, f"Land {land.land_id} deleted")
    db.delete(land)
    db.commit()
    return {"message": f"Land {land.land_id} deleted"}


def _fmt(l: Land) -> dict:
    return {
        "id": str(l.id), "land_id": l.land_id, "land_name": l.land_name,
        "district": l.district, "village": l.village,
        "owner_id": str(l.owner_id) if l.owner_id else None,
        "customer_id": str(l.customer_id) if l.customer_id else None,
        "created_at": l.created_at,
    }
