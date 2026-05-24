from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import require_admin

router = APIRouter(prefix="/api/v1/admin", tags=["Admin - Logs"])


@router.get("/login-logs", response_model=List[schemas.LoginLogResponse])
def get_login_logs(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip:  int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    q = db.query(models.LoginLog).order_by(models.LoginLog.login_time.desc())
    if status:
        q = q.filter(models.LoginLog.status == status)
    if search:
        s = f"%{search}%"
        q = q.filter(models.LoginLog.user_name.ilike(s) | models.LoginLog.ip_address.ilike(s))
    return [schemas.LoginLogResponse.model_validate(l) for l in q.offset(skip).limit(limit).all()]


@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    search: Optional[str] = Query(None),
    skip:  int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    q = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc())
    if search:
        s = f"%{search}%"
        q = q.filter(
            models.AuditLog.action.ilike(s) |
            models.AuditLog.target_user.ilike(s) |
            models.AuditLog.performed_by.ilike(s)
        )
    return [schemas.AuditLogResponse.model_validate(l) for l in q.offset(skip).limit(limit).all()]


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    def count_role(role): return db.query(models.User).filter(models.User.role == role, models.User.is_deleted == False).count()
    def count_status(s):  return db.query(models.User).filter(models.User.status == s, models.User.is_deleted == False).count()

    return schemas.DashboardStats(
        total_customers  = count_role("CUSTOMER"),
        total_owners     = count_role("OWNER"),
        total_workers    = count_role("WORKER"),
        total_admins     = count_role("ADMIN"),
        active_lands     = db.query(models.Land).filter(models.Land.status == "ACTIVE").count(),
        total_users      = db.query(models.User).filter(models.User.is_deleted == False).count(),
        active_users     = count_status("ACTIVE"),
        disabled_users   = count_status("DISABLED"),
        failed_logins    = db.query(models.LoginLog).filter(models.LoginLog.status == "FAILED").count(),
        total_audit_logs = db.query(models.AuditLog).count(),
    )
