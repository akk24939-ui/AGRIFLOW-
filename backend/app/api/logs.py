from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import LoginLog, AuditLog, User, Land, Task
from app.schemas.schemas import LoginLogResponse, AuditLogResponse, DashboardStats
from app.core.dependencies import require_admin, get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin - Logs & Stats"])


@router.get("/login-logs", response_model=List[LoginLogResponse])
def get_login_logs(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip:  int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(LoginLog).order_by(LoginLog.login_time.desc())
    
    # RBAC: Agents only see their own logs
    if current_user.role not in ("SUPER_ADMIN", "ADMIN", "OWNER"):
        q = q.filter(LoginLog.user_id == current_user.id)
        
    if status:
        q = q.filter(LoginLog.login_status == status.upper())
    if search:
        s = f"%{search}%"
        q = q.filter(LoginLog.ip_address.ilike(s))
    logs = q.offset(skip).limit(limit).all()
    return [
        {
            "id": str(l.id),
            "user_id": str(l.user_id) if l.user_id else None,
            "login_time": l.login_time,
            "logout_time": l.logout_time,
            "ip_address": l.ip_address,
            "user_agent": l.user_agent,
            "login_status": l.login_status,
            "failed_reason": l.failed_reason,
            "created_at": l.created_at,
        }
        for l in logs
    ]


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    search: Optional[str] = Query(None),
    skip:  int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(AuditLog).order_by(AuditLog.created_at.desc())

    # RBAC: Agents only see their own audit logs
    if current_user.role not in ("SUPER_ADMIN", "ADMIN", "OWNER"):
        q = q.filter(AuditLog.performed_by == current_user.username)

    if search:
        s = f"%{search}%"
        q = q.filter(
            AuditLog.action.ilike(s) | AuditLog.performed_by.ilike(s) |
            AuditLog.target_user.ilike(s)
        )
    logs = q.offset(skip).limit(limit).all()
    return [
        {
            "id": str(l.id), "action": l.action, "performed_by": l.performed_by,
            "target_user": l.target_user, "ip_address": l.ip_address,
            "details": l.details, "created_at": l.created_at,
        }
        for l in logs
    ]


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    def role_count(r, base_q):
        return base_q.filter(User.role == r, User.is_deleted == False).count()

    # Base Queries
    user_q = db.query(User).filter(User.is_deleted == False)
    land_q = db.query(Land)
    task_q = db.query(Task)
    audit_q = db.query(AuditLog)
    login_q = db.query(LoginLog)

    # Scoping for OWNER
    if current_user.role == "OWNER":
        land_q = land_q.filter(Land.owner_id == current_user.id)
        task_q = task_q.filter(Task.assigned_by == current_user.id)
        user_q = user_q.filter(User.created_by == current_user.username)
        audit_q = audit_q.filter(AuditLog.performed_by == current_user.username)
        login_q = login_q.filter(LoginLog.user_id == current_user.id)
    
    # Scoping for AGENT/WORKER/CUSTOMER
    elif current_user.role in ["AGENT", "WORKER", "CUSTOMER"]:
        land_q = land_q.filter(Land.land_id == current_user.land_id)
        task_q = task_q.filter(Task.assigned_to == current_user.id)
        user_q = user_q.filter(User.id == current_user.id)
        audit_q = audit_q.filter(AuditLog.performed_by == current_user.username)
        login_q = login_q.filter(LoginLog.user_id == current_user.id)

    return DashboardStats(
        total_users     = user_q.count(),
        total_admins    = role_count("ADMIN", user_q) + role_count("SUPER_ADMIN", user_q),
        total_owners    = role_count("OWNER", user_q),
        total_customers = role_count("CUSTOMER", user_q),
        total_agents    = role_count("AGENT", user_q),
        total_lands     = land_q.count(),
        active_lands    = land_q.count(),
        total_tasks     = task_q.count(),
        pending_tasks   = task_q.filter(Task.status == "PENDING").count(),
        completed_tasks = task_q.filter(Task.status == "COMPLETED").count(),
        failed_logins   = login_q.filter(LoginLog.login_status == "FAILED").count(),
        total_audit     = audit_q.count(),
    )
