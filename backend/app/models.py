from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, Enum as SAEnum
from sqlalchemy.sql import func
import enum
from app.database import Base


class RoleEnum(str, enum.Enum):
    ADMIN    = "ADMIN"
    OWNER    = "OWNER"
    CUSTOMER = "CUSTOMER"
    WORKER   = "WORKER"


class StatusEnum(str, enum.Enum):
    ACTIVE   = "ACTIVE"
    DISABLED = "DISABLED"
    DELETED  = "DELETED"


class User(Base):
    __tablename__ = "users"

    id                  = Column(String, primary_key=True, index=True)
    full_name           = Column(String(200), nullable=False)
    username            = Column(String(100), unique=True, nullable=False, index=True)
    email               = Column(String(200), unique=True, nullable=False, index=True)
    phone               = Column(String(20), nullable=False)
    password_hash       = Column(String(300), nullable=False)
    role                = Column(SAEnum(RoleEnum), nullable=False, default=RoleEnum.CUSTOMER)
    land_id             = Column(String(30), nullable=True, index=True)
    status              = Column(SAEnum(StatusEnum), nullable=False, default=StatusEnum.ACTIVE)
    is_deleted          = Column(Boolean, default=False, nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())
    last_login          = Column(DateTime(timezone=True), nullable=True)
    created_by_admin    = Column(String(100), nullable=True)
    failed_login_attempts = Column(Integer, default=0)


class Land(Base):
    __tablename__ = "lands"

    id         = Column(String, primary_key=True, index=True)
    land_id    = Column(String(30), unique=True, nullable=False, index=True)
    name       = Column(String(200), nullable=False)
    location   = Column(String(300), nullable=True)
    area       = Column(String(50), nullable=True)
    assigned_to = Column(String, nullable=True)   # FK to users.id (soft ref)
    status     = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LoginLog(Base):
    __tablename__ = "login_logs"

    id            = Column(String, primary_key=True, index=True)
    user_id       = Column(String, nullable=False, index=True)
    user_name     = Column(String(100), nullable=False)
    login_time    = Column(DateTime(timezone=True), server_default=func.now())
    logout_time   = Column(DateTime(timezone=True), nullable=True)
    ip_address    = Column(String(50), nullable=True)
    device        = Column(String(100), nullable=True)
    browser       = Column(String(100), nullable=True)
    status        = Column(String(20), nullable=False)   # SUCCESS / FAILED
    failed_reason = Column(String(200), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id            = Column(String, primary_key=True, index=True)
    action        = Column(String(100), nullable=False)
    performed_by  = Column(String(100), nullable=False)
    target_user   = Column(String(100), nullable=True)
    timestamp     = Column(DateTime(timezone=True), server_default=func.now())
    ip_address    = Column(String(50), nullable=True)
    details       = Column(Text, nullable=True)
