import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, LoginLog, AuditLog
from app.schemas.schemas import LoginRequest, TokenResponse, RefreshRequest
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

MAX_FAILED = 20  # lock after 20 failed attempts

def _log_login(db, user_id, ip, ua, status_val, reason=None):
    db.add(LoginLog(
        id=uuid.uuid4(), user_id=user_id,
        ip_address=ip, user_agent=ua,
        login_status=status_val, failed_reason=reason,
    ))

def _client_info(request: Request):
    ip = request.headers.get("X-Forwarded-For", "")
    if not ip:
        ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("User-Agent", "")
    return ip.split(",")[0].strip(), ua


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip, ua = _client_info(request)

    user = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.username)
    ).first()

    if not user:
        db.add(LoginLog(id=uuid.uuid4(), ip_address=ip, user_agent=ua,
                        login_status="FAILED", failed_reason="User not found"))
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.is_deleted:
        _log_login(db, user.id, ip, ua, "FAILED", "Account deleted")
        db.commit()
        raise HTTPException(status_code=403, detail="Account has been deleted")

    if not user.is_active:
        _log_login(db, user.id, ip, ua, "FAILED", "Account disabled")
        db.commit()
        raise HTTPException(status_code=403, detail="Account is disabled")

    if user.failed_login_attempts >= MAX_FAILED:
        _log_login(db, user.id, ip, ua, "FAILED", "Account locked")
        db.commit()
        raise HTTPException(status_code=423, detail="Account locked due to too many failed attempts. Contact admin.")

    if not verify_password(payload.password, user.password_hash):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        _log_login(db, user.id, ip, ua, "FAILED", "Wrong password")
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # SUCCESS
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    _log_login(db, user.id, ip, ua, "SUCCESS")
    db.add(AuditLog(
        id=uuid.uuid4(), action="USER_LOGIN", performed_by=user.username,
        target_user=user.username, ip_address=ip,
        details=f"Login from {ua[:80]}",
    ))
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id), "role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == data["sub"], User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id), "role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # JWT is stateless; client should discard the token
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "land_id": current_user.land_id,
        "is_active": current_user.is_active,
    }
