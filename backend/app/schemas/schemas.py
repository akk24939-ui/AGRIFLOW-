from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator, model_validator
import re


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str


# ─── User ────────────────────────────────────────────────────────────────────

def _validate_strong_password(v: str) -> str:
    if len(v) < 6:
        raise ValueError("Minimum 6 characters required")
    return v

VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "OWNER", "CUSTOMER", "AGENT"]


class UserCreate(BaseModel):
    full_name: str
    username:  str
    email:     EmailStr
    phone:     Optional[str] = None
    password:  str
    role:      str = "CUSTOMER"
    land_id:   Optional[str] = None

    @field_validator("password")
    @classmethod
    def strong_password(cls, v): return _validate_strong_password(v)

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in VALID_ROLES:
            raise ValueError(f"Role must be one of: {VALID_ROLES}")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None
    role:      Optional[str] = None
    land_id:   Optional[str] = None
    is_active: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    new_password:     str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v): return _validate_strong_password(v)


class UserResponse(BaseModel):
    id:                    str
    full_name:             str
    username:              str
    email:                 str
    phone:                 Optional[str]
    role:                  str
    land_id:               Optional[str]
    is_active:             bool
    is_deleted:            bool
    failed_login_attempts: int
    last_login:            Optional[datetime]
    created_at:            Optional[datetime]
    created_by:            Optional[str]

    model_config = {"from_attributes": True}


# ─── Land ────────────────────────────────────────────────────────────────────

class LandCreate(BaseModel):
    land_id:     str     # MANUAL — admin types TN-CH-001
    land_name:   Optional[str] = None
    district:    Optional[str] = None
    village:     Optional[str] = None
    owner_id:    Optional[str] = None
    customer_id: Optional[str] = None

    @field_validator("land_id")
    @classmethod
    def validate_land_id(cls, v):
        if not re.match(r"^[A-Za-z0-9\-]{3,20}$", v):
            raise ValueError("Land ID must be 3-20 characters long and contain only letters, numbers, and dashes")
        return v.upper()


class LandUpdate(BaseModel):
    land_name:   Optional[str] = None
    district:    Optional[str] = None
    village:     Optional[str] = None
    owner_id:    Optional[str] = None
    customer_id: Optional[str] = None


class LandResponse(BaseModel):
    id:          str
    land_id:     str
    land_name:   Optional[str]
    district:    Optional[str]
    village:     Optional[str]
    owner_id:    Optional[str]
    customer_id: Optional[str]
    created_at:  Optional[datetime]

    model_config = {"from_attributes": True}


# ─── Task ────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    land_id:     Optional[str] = None
    assigned_to: Optional[str] = None
    priority:    Optional[str] = "MEDIUM"
    category:    Optional[str] = None
    notes:       Optional[str] = None
    start_date:  Optional[str] = None
    deadline:    Optional[str] = None
    status:      str = "PENDING"


class TaskUpdate(BaseModel):
    title:       Optional[str] = None
    description: Optional[str] = None
    land_id:     Optional[str] = None
    assigned_to: Optional[str] = None
    priority:    Optional[str] = None
    category:    Optional[str] = None
    notes:       Optional[str] = None
    start_date:  Optional[str] = None
    deadline:    Optional[str] = None
    status:      Optional[str] = None


class TaskResponse(BaseModel):
    id:          str
    title:       str
    description: Optional[str]
    land_id:     Optional[str]
    assigned_to: Optional[str]
    assigned_by: Optional[str]
    priority:    Optional[str]
    category:    Optional[str]
    notes:       Optional[str]
    status:      str
    start_date:  Optional[datetime]
    deadline:    Optional[datetime]
    created_at:  Optional[datetime]

    model_config = {"from_attributes": True}


# ─── Logs ────────────────────────────────────────────────────────────────────

class LoginLogResponse(BaseModel):
    id:            str
    user_id:       Optional[str]
    login_time:    Optional[datetime]
    logout_time:   Optional[datetime]
    ip_address:    Optional[str]
    user_agent:    Optional[str]
    login_status:  str
    failed_reason: Optional[str]
    created_at:    Optional[datetime]

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id:           str
    action:       str
    performed_by: str
    target_user:  Optional[str]
    ip_address:   Optional[str]
    details:      Optional[str]
    created_at:   Optional[datetime]

    model_config = {"from_attributes": True}


class ComplaintMessageResponse(BaseModel):
    id:             str
    complaint_id:   str
    sender_id:      str
    message:        str
    attachment_url: Optional[str]
    created_at:     Optional[datetime]

    model_config = {"from_attributes": True}


class ComplaintResponse(BaseModel):
    id:          str
    customer_id: Optional[str]
    land_id:     Optional[str]
    title:       str
    description: Optional[str]
    status:      str
    created_at:  Optional[datetime]
    updated_at:  Optional[datetime]
    messages:    List[ComplaintMessageResponse] = []

    model_config = {"from_attributes": True}


class ComplaintCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    land_id:     Optional[str] = None


class ComplaintMessageCreate(BaseModel):
    message: str


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_users:     int
    total_admins:    int
    total_owners:    int
    total_customers: int
    total_agents:    int
    total_lands:     int
    active_lands:    int
    total_tasks:     int
    pending_tasks:   int
    completed_tasks: int
    failed_logins:   int
    total_audit:     int
