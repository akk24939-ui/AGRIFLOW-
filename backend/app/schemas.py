from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str
    username:  str
    email:     EmailStr
    phone:     str
    role:      str = "CUSTOMER"
    land_id:   Optional[str] = None
    password:  str
    status:    str = "ACTIVE"

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Minimum 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain uppercase")
        if not re.search(r"[0-9]", v):
            raise ValueError("Must contain a number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Must contain a special character")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None
    role:      Optional[str] = None
    land_id:   Optional[str] = None
    status:    Optional[str] = None


class UserResponse(BaseModel):
    id:                    str
    full_name:             str
    username:              str
    email:                 str
    phone:                 str
    role:                  str
    land_id:               Optional[str]
    status:                str
    is_deleted:            bool
    created_at:            Optional[datetime]
    last_login:            Optional[datetime]
    created_by_admin:      Optional[str]
    failed_login_attempts: int

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Minimum 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain uppercase")
        if not re.search(r"[0-9]", v):
            raise ValueError("Must contain a number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Must contain a special character")
        return v


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user:          UserResponse


# ─── Land Schemas ─────────────────────────────────────────────────────────────

class LandCreate(BaseModel):
    name:        str
    location:    Optional[str] = None
    area:        Optional[str] = None
    assigned_to: Optional[str] = None
    state:       str = "TN"


class LandUpdate(BaseModel):
    name:        Optional[str] = None
    location:    Optional[str] = None
    area:        Optional[str] = None
    assigned_to: Optional[str] = None
    status:      Optional[str] = None


class LandResponse(BaseModel):
    id:          str
    land_id:     str
    name:        str
    location:    Optional[str]
    area:        Optional[str]
    assigned_to: Optional[str]
    status:      str
    created_at:  Optional[datetime]

    class Config:
        from_attributes = True


# ─── Log Schemas ──────────────────────────────────────────────────────────────

class LoginLogResponse(BaseModel):
    id:            str
    user_id:       str
    user_name:     str
    login_time:    Optional[datetime]
    logout_time:   Optional[datetime]
    ip_address:    Optional[str]
    device:        Optional[str]
    browser:       Optional[str]
    status:        str
    failed_reason: Optional[str]

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id:           str
    action:       str
    performed_by: str
    target_user:  Optional[str]
    timestamp:    Optional[datetime]
    ip_address:   Optional[str]
    details:      Optional[str]

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_customers:  int
    total_owners:     int
    total_workers:    int
    total_admins:     int
    active_lands:     int
    total_users:      int
    active_users:     int
    disabled_users:   int
    failed_logins:    int
    total_audit_logs: int
