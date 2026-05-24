import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import require_admin

router = APIRouter(prefix="/api/v1/admin/lands", tags=["Admin - Lands"])

def _gen_land_id(db: Session, state: str = "TN") -> str:
    year = datetime.utcnow().year
    count = db.query(models.Land).count() + 1
    return f"AGR-{state}-{year}-{str(count).zfill(4)}"


@router.get("", response_model=List[schemas.LandResponse])
def list_lands(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    q = db.query(models.Land)
    if search:
        s = f"%{search}%"
        q = q.filter(models.Land.land_id.ilike(s) | models.Land.name.ilike(s) | models.Land.location.ilike(s))
    if status:
        q = q.filter(models.Land.status == status)
    return [schemas.LandResponse.model_validate(l) for l in q.all()]


@router.post("", response_model=schemas.LandResponse, status_code=201)
def create_land(
    payload: schemas.LandCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    land_id = _gen_land_id(db, payload.state)
    location = f"{payload.location}, {payload.state}" if payload.location else payload.state
    land = models.Land(
        id=str(uuid.uuid4()),
        land_id=land_id,
        name=payload.name,
        location=location,
        area=payload.area,
        assigned_to=payload.assigned_to,
        status="ACTIVE",
    )
    db.add(land)
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="LAND_CREATED",
        performed_by=admin.username, target_user="-",
        details=f"Land {land_id} — {payload.name} created",
    ))
    db.commit()
    db.refresh(land)
    return schemas.LandResponse.model_validate(land)


@router.put("/{land_id}", response_model=schemas.LandResponse)
def update_land(
    land_id: str,
    payload: schemas.LandUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    land = db.query(models.Land).filter(models.Land.id == land_id).first()
    if not land:
        raise HTTPException(404, "Land not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(land, field, val)
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="LAND_UPDATED",
        performed_by=admin.username, target_user="-",
        details=f"Land {land.land_id} updated",
    ))
    db.commit()
    db.refresh(land)
    return schemas.LandResponse.model_validate(land)
