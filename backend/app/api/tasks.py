import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import Task, Land, User, AuditLog, TaskMedia
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.core.dependencies import get_current_user, require_admin, require_owner

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

def _audit(db, action, by, details=""):
    db.add(AuditLog(id=uuid.uuid4(), action=action, performed_by=by,
                    target_user="-", details=details))


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    status: Optional[str] = Query(None),
    land_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Task)
    # RBAC filtering
    if current_user.role in ("AGENT", "WORKER"):
        q = q.filter(Task.assigned_to == current_user.id)
    elif current_user.role == "CUSTOMER":
        # Customers see all tasks that are linked to lands they own
        customer_lands = db.query(Land.id).filter(Land.customer_id == current_user.id).all()
        land_ids = [l[0] for l in customer_lands]
        if land_ids:
            q = q.filter(Task.land_id.in_(land_ids))
        else:
            # If customer has no lands, they see no tasks
            q = q.filter(Task.id == uuid.uuid4()) # force empty result
    elif current_user.role == "OWNER":
        q = q.filter(Task.assigned_by == current_user.id)
    if status:
        q = q.filter(Task.status == status.upper())
    if land_id:
        q = q.filter(Task.land_id == land_id)
    tasks = q.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return [_fmt(t, db) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return _fmt(task, db)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    land_uuid = None
    if payload.land_id:
        # Frontend sends land_id display string (e.g. "TN-PNN-01"), not UUID
        land = db.query(Land).filter(Land.land_id == payload.land_id).first()
        if not land:
            # Fallback: try as UUID in case it's the primary key
            try:
                land = db.query(Land).filter(Land.id == payload.land_id).first()
            except Exception:
                pass
        if not land:
            raise HTTPException(400, f"Land '{payload.land_id}' not found")
        land_uuid = land.id

    assigned_uuid = None
    if payload.assigned_to:
        agent = db.query(User).filter(User.id == payload.assigned_to,
                                       User.is_active == True).first()
        if not agent:
            raise HTTPException(400, "Assigned user not found")
        assigned_uuid = agent.id

    # Parse dates from string (HTML date input sends "2026-05-23")
    from datetime import datetime as dt
    def _parse_date(val):
        if not val:
            return None
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
            try:
                return dt.strptime(val, fmt)
            except ValueError:
                continue
        return None

    task = Task(
        id=uuid.uuid4(),
        title=payload.title,
        description=payload.description,
        land_id=land_uuid,
        assigned_to=assigned_uuid,
        assigned_by=current_user.id,
        priority=payload.priority.upper() if payload.priority else "MEDIUM",
        category=payload.category,
        notes=payload.notes,
        status=payload.status.upper(),
        start_date=_parse_date(payload.start_date),
        deadline=_parse_date(payload.deadline),
    )
    db.add(task)
    _audit(db, "TASK_CREATED", current_user.username, payload.title)
    db.commit()
    db.refresh(task)
    return _fmt(task, db)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    # Agents can only update status
    if current_user.role == "AGENT":
        if payload.status:
            task.status = payload.status.upper()
        db.commit()
        db.refresh(task)
        return _fmt(task, db)
    # Others can update all fields
    for field, val in payload.dict(exclude_none=True).items():
        if field == "status" and val:
            val = val.upper()
        setattr(task, field, val)
    _audit(db, "TASK_UPDATED", current_user.username, task.title)
    db.commit()
    db.refresh(task)
    return _fmt(task, db)


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    _audit(db, "TASK_DELETED", current_user.username, task.title)
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}


@router.post("/{task_id}/media", status_code=201)
async def upload_media(
    task_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    # Only Agent or Admin/Owner can upload
    if current_user.role not in ["SUPER_ADMIN", "ADMIN", "OWNER"] and task.assigned_to != current_user.id:
        raise HTTPException(403, "You do not have permission to upload media for this task")

    import os
    import shutil
    
    os.makedirs("uploads", exist_ok=True)
    ext = file.filename.split('.')[-1] if '.' in file.filename else ''
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    media = TaskMedia(
        id=uuid.uuid4(),
        task_id=task.id,
        uploaded_by=current_user.id,
        file_url=f"/uploads/{filename}",
        file_type=file.content_type,
    )
    db.add(media)
    _audit(db, "MEDIA_UPLOADED", current_user.username, f"Uploaded {file.filename} to Task {task.title}")
    db.commit()
    db.refresh(media)
    
    return {
        "id": str(media.id),
        "task_id": str(media.task_id),
        "uploaded_by": str(media.uploaded_by),
        "file_url": media.file_url,
        "file_type": media.file_type,
        "uploaded_at": media.uploaded_at
    }

@router.get("/{task_id}/media")
def get_task_media(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    media = db.query(TaskMedia).filter(TaskMedia.task_id == task_id).order_by(TaskMedia.uploaded_at.desc()).all()
    return [{
        "id": str(m.id),
        "task_id": str(m.task_id),
        "uploaded_by": str(m.uploaded_by),
        "file_url": m.file_url,
        "file_type": m.file_type,
        "uploaded_at": m.uploaded_at
    } for m in media]

def _fmt(t: Task, db: Session = None) -> dict:
    land_display = None
    if t.land_id:
        if db:
            land = db.query(Land).filter(Land.id == t.land_id).first()
            land_display = land.land_id if land else str(t.land_id)
        else:
            land_display = str(t.land_id)
    return {
        "id": str(t.id), "title": t.title, "description": t.description,
        "priority": t.priority, "category": t.category, "notes": t.notes,
        "status": t.status, "start_date": t.start_date, "deadline": t.deadline, 
        "created_at": t.created_at,
        "land_id": land_display,
        "assigned_to": str(t.assigned_to) if t.assigned_to else None,
        "assigned_by": str(t.assigned_by) if t.assigned_by else None,
    }
