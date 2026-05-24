import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import verify_password, create_access_token, create_refresh_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

def _get_client_info(request: Request):
    ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    ua = request.headers.get("User-Agent", "")
    device  = "Mobile" if any(m in ua for m in ["Android","iPhone","iPad"]) else "Desktop"
    browser = "Chrome" if "Chrome" in ua else "Firefox" if "Firefox" in ua else "Safari" if "Safari" in ua else "Unknown"
    return ip, device, browser

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip, device, browser = _get_client_info(request)
    log_id = str(uuid.uuid4())

    user = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.username)
    ).first()

    def _fail(reason: str):
        db.add(models.LoginLog(
            id=log_id, user_id=user.id if user else "unknown",
            user_name=payload.username, ip_address=ip,
            device=device, browser=browser, status="FAILED", failed_reason=reason,
        ))
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        db.commit()
        raise HTTPException(status_code=401, detail=reason)

    if not user:
        _fail("User not found")
    if user.is_deleted or user.status == "DELETED":
        _fail("Account deleted")
    if user.status == "DISABLED":
        _fail("Account disabled")
    if not verify_password(payload.password, user.password_hash):
        _fail("Invalid password")

    # Success
    user.last_login = datetime.utcnow()
    user.failed_login_attempts = 0
    db.add(models.LoginLog(
        id=log_id, user_id=user.id, user_name=user.username,
        ip_address=ip, device=device, browser=browser, status="SUCCESS",
    ))
    db.add(models.AuditLog(
        id=str(uuid.uuid4()), action="USER_LOGIN", performed_by=user.username,
        target_user=user.username, ip_address=ip,
        details=f"Login from {device} / {browser}",
    ))
    db.commit()
    db.refresh(user)

    return schemas.TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
        user=schemas.UserResponse.model_validate(user),
    )

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserResponse.model_validate(current_user)
