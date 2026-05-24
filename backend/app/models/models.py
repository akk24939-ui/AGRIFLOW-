import uuid
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.db import Base


class User(Base):
    __tablename__ = "users"
    id                    = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name             = Column(String(255), nullable=False)
    username              = Column(String(100), unique=True, nullable=False, index=True)
    email                 = Column(String(255), unique=True, nullable=False, index=True)
    phone                 = Column(String(20), nullable=True)
    password_hash         = Column(Text, nullable=False)
    role                  = Column(String(50), nullable=False, default="CUSTOMER")
    land_id               = Column(String(100), nullable=True, index=True)
    is_active             = Column(Boolean, default=True)
    is_deleted            = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    last_login            = Column(DateTime(timezone=True), nullable=True)
    created_at            = Column(DateTime(timezone=True), server_default=func.now())
    updated_at            = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by            = Column(String(100), nullable=True)


class Land(Base):
    __tablename__ = "lands"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    land_id     = Column(String(100), unique=True, nullable=False, index=True)  # MANUAL: TN-CH-001
    land_name   = Column(String(255), nullable=True)
    district    = Column(String(255), nullable=True)
    village     = Column(String(255), nullable=True)
    owner_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by  = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class LoginLog(Base):
    __tablename__ = "login_logs"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    login_time   = Column(DateTime(timezone=True), server_default=func.now())
    logout_time  = Column(DateTime(timezone=True), nullable=True)
    ip_address   = Column(Text, nullable=True)
    user_agent   = Column(Text, nullable=True)
    login_status = Column(String(50), nullable=False)   # SUCCESS / FAILED
    failed_reason= Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    action       = Column(String(100), nullable=False)
    performed_by = Column(String(100), nullable=False)
    target_user  = Column(String(100), nullable=True)
    ip_address   = Column(Text, nullable=True)
    details      = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class Task(Base):
    __tablename__ = "tasks"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    land_id     = Column(UUID(as_uuid=True), ForeignKey("lands.id"), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority    = Column(String(50), default="MEDIUM")
    category    = Column(String(100), nullable=True)
    notes       = Column(Text, nullable=True)
    status      = Column(String(50), default="PENDING")   # PENDING / IN_PROGRESS / COMPLETED
    start_date  = Column(DateTime(timezone=True), nullable=True)
    deadline    = Column(DateTime(timezone=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class TaskMedia(Base):
    __tablename__ = "task_media"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    task_id     = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    file_url    = Column(Text, nullable=False)
    file_type   = Column(String(50), nullable=True)   # image/pdf/video
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class Complaint(Base):
    __tablename__ = "complaints"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    land_id     = Column(UUID(as_uuid=True), ForeignKey("lands.id"), nullable=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(String(50), default="OPEN")  # OPEN / IN_REVIEW / RESOLVED / CLOSED
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ComplaintMessage(Base):
    __tablename__ = "complaint_messages"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    complaint_id  = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    sender_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    message       = Column(Text, nullable=False)
    attachment_url= Column(Text, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
