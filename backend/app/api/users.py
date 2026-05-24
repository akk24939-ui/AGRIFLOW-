import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse, ChangePasswordRequest
from app.core.security import hash_password
from app.core.dependencies import get_current_user, require_admin, require_super_admin, require_owner

router = APIRouter(prefix="/api/admin/users", tags=["Admin - Users"])

ROLE_CREATE_RULES = {
    "SUPER_ADMIN": ["SUPER_ADMIN", "ADMIN", "OWNER", "CUSTOMER", "AGENT", "WORKER"],
    "ADMIN": ["OWNER", "CUSTOMER", "AGENT", "WORKER"],
    "OWNER": ["AGENT", "WORKER", "CUSTOMER"],
}

def _audit(db, action, by, target, details="", ip=""):
    db.add(AuditLog(id=uuid.uuid4(), action=action, performed_by=by,
                    target_user=target, details=details, ip_address=ip))


@router.get("", response_model=List[UserResponse])
def list_users(
    search: Optional[str] = Query(None),
    role:   Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip:   int = Query(0, ge=0),
    limit:  int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    q = db.query(User).filter(User.is_deleted == False)
    
    # Owners can only see users they created
    if current_user.role == "OWNER":
        q = q.filter(User.created_by == current_user.username)
    if search:
        s = f"%{search}%"
        q = q.filter(
            User.full_name.ilike(s) | User.email.ilike(s) |
            User.username.ilike(s) | User.land_id.ilike(s) | User.phone.ilike(s)
        )
    if role:
        q = q.filter(User.role == role)
    if status == "active":
        q = q.filter(User.is_active == True)
    elif status == "disabled":
        q = q.filter(User.is_active == False)
    users = q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return [_fmt(u) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db),
             current_user: User = Depends(require_owner)):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(404, "User not found")
    return _fmt(user)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    # RBAC — check if admin can create this role
    allowed = ROLE_CREATE_RULES.get(current_user.role, [])
    if payload.role not in allowed:
        raise HTTPException(403, f"You cannot create users with role {payload.role}")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(400, "Username already taken")

    if payload.role == "CUSTOMER" and not payload.land_id:
        raise HTTPException(400, "Customer creation requires a valid Land ID assignment")

    new_user = User(
        id=uuid.uuid4(),
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        land_id=payload.land_id,
        created_by=current_user.username,
    )
    db.add(new_user)
    db.flush() # Force insert user first to prevent foreign key violation on Land table
    
    # If a customer is created, link them to the specified land
    if payload.role == "CUSTOMER" and payload.land_id:
        from app.models.models import Land
        land = db.query(Land).filter(Land.land_id == payload.land_id).first()
        if land:
            land.customer_id = new_user.id
            
    _audit(db, "USER_CREATED", current_user.username, payload.username,
           f"Role={payload.role}, Land={payload.land_id}")
    db.commit()
    db.refresh(new_user)
    return _fmt(new_user)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(404, "User not found")
    # Block non-super_admin from editing SUPER_ADMIN
    if user.role == "SUPER_ADMIN" and current_user.role != "SUPER_ADMIN":
        raise HTTPException(403, "Cannot modify SUPER_ADMIN")
    if current_user.role == "OWNER" and user.role in ["ADMIN", "SUPER_ADMIN", "OWNER"]:
        raise HTTPException(403, "Owners can only modify agents, workers, and customers")
    for field, val in payload.dict(exclude_none=True).items():
        setattr(user, field, val)
    _audit(db, "USER_UPDATED", current_user.username, user.username,
           str(payload.dict(exclude_none=True)))
    db.commit()
    db.refresh(user)
    return _fmt(user)


@router.put("/{user_id}/change-password")
def change_password(
    user_id: str,
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "SUPER_ADMIN" and current_user.role != "SUPER_ADMIN":
        raise HTTPException(403, "Cannot change SUPER_ADMIN password")
    user.password_hash = hash_password(payload.new_password)
    _audit(db, "PASSWORD_CHANGED", current_user.username, user.username,
           "Password changed by Admin. Re-login required.")
    db.commit()
    return {"message": f"Password updated for {user.username}"}


@router.put("/{user_id}/toggle-status")
def toggle_status(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "SUPER_ADMIN":
        raise HTTPException(403, "Cannot disable SUPER_ADMIN")
    user.is_active = not user.is_active
    action = "USER_ENABLED" if user.is_active else "USER_DISABLED"
    _audit(db, action, current_user.username, user.username,
           f"is_active set to {user.is_active}")
    user.failed_login_attempts = 0  # reset on re-enable
    db.commit()
    return {"message": f"User {'enabled' if user.is_active else 'disabled'}", "is_active": user.is_active}


@router.put("/{user_id}/unlock")
def unlock_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.failed_login_attempts = 0
    _audit(db, "USER_UNLOCKED", current_user.username, user.username, "Failed attempts reset")
    db.commit()
    return {"message": f"User {user.username} unlocked"}


@router.delete("/{user_id}")
def soft_delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "SUPER_ADMIN":
        raise HTTPException(403, "Cannot delete SUPER_ADMIN")
    if user.role == "ADMIN" and current_user.role != "SUPER_ADMIN":
        raise HTTPException(403, "Only SUPER_ADMIN can delete ADMIN users")
    user.is_deleted = True
    user.is_active = False
    _audit(db, "USER_DELETED", current_user.username, user.username,
           "Soft deleted. Recoverable by SUPER_ADMIN.")
    db.commit()
    return {"message": f"User {user.username} deleted (recoverable soft delete)"}


def _fmt(u: User) -> dict:
    """Convert UUID fields to strings for Pydantic v1 orm_mode."""
    return {
        "id": str(u.id), "full_name": u.full_name, "username": u.username,
        "email": u.email, "phone": u.phone, "role": u.role, "land_id": u.land_id,
        "is_active": u.is_active, "is_deleted": u.is_deleted,
        "failed_login_attempts": u.failed_login_attempts or 0,
        "last_login": u.last_login, "created_at": u.created_at, "created_by": u.created_by,
    }
