import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, require_admin

router = APIRouter(prefix="/api/v1/admin/users", tags=["Admin - Users"])


@router.get("", response_model=List[schemas.UserResponse])
def list_users(
    search: Optional[str] = Query(None),
    role:   Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip:   int = Query(0, ge=0),
    limit:  int = Query(50, le=200),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    q = db.query(models.User)
    if search:
        s = f"%{search}%"
        q = q.filter(
            models.User.full_name.ilike(s) |
            models.User.email.ilike(s) |
            models.User.username.ilike(s) |
            models.User.land_id.ilike(s)
        )
    if role:
        q = q.filter(models.User.role == role)
    if status:
        q = q.filter(models.User.status == status)
    return [schemas.UserResponse.model_validate(u) for u in q.offset(skip).limit(limit).all()]


@router.post("", response_model=schemas.UserResponse, status_code=201)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(400, "Username already taken")
    if payload.land_id:
        land = db.query(models.Land).filter(models.Land.land_id == payload.land_id).first()
        if not land:
            raise HTTPException(400, f"Land ID {payload.land_id} does not exist")

    user = models.User(
        id=str(uuid.uuid4()),
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        land_id=payload.land_id,
        status=payload.status,
        created_by_admin=admin.username,
    )
    db.add(user)
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="USER_CREATED",
        performed_by=admin.username, target_user=user.username,
        details=f"User {user.username} created with role {user.role}",
    ))
    db.commit()
    db.refresh(user)
    return schemas.UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: str,
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(user, field, val)
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="USER_UPDATED",
        performed_by=admin.username, target_user=user.username,
        details=f"Fields updated: {list(payload.model_dump(exclude_none=True).keys())}",
    ))
    db.commit()
    db.refresh(user)
    return schemas.UserResponse.model_validate(user)


@router.put("/{user_id}/change-password")
def change_password(
    user_id: str,
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.password_hash = hash_password(payload.new_password)
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="PASSWORD_CHANGED",
        performed_by=admin.username, target_user=user.username,
        details="Password changed by Admin. Sessions invalidated.",
    ))
    db.commit()
    return {"message": f"Password updated for {user.username}"}


@router.delete("/{user_id}")
def soft_delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_deleted = True
    user.status = "DELETED"
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="USER_DELETED",
        performed_by=admin.username, target_user=user.username,
        details="Soft deleted (is_deleted=true). Recoverable by Super Admin.",
    ))
    db.commit()
    return {"message": f"User {user.username} soft-deleted successfully"}


@router.put("/{user_id}/toggle-status")
def toggle_status(
    user_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    new_status = "DISABLED" if user.status == "ACTIVE" else "ACTIVE"
    user.status = new_status
    db.add(models.AuditLog(
        id=str(uuid.uuid4()),
        action="USER_DISABLED" if new_status == "DISABLED" else "USER_ENABLED",
        performed_by=admin.username, target_user=user.username,
        details=f"Status changed to {new_status}",
    ))
    db.commit()
    return {"message": f"User status changed to {new_status}", "status": new_status}
