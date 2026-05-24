from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ROLE_HIERARCHY = {
    "SUPER_ADMIN": 5,
    "ADMIN": 4,
    "OWNER": 3,
    "AGENT": 2,
    "CUSTOMER": 1,
}

def _get_user_from_token(token: str, db: Session) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(
        User.id == user_id,
        User.is_deleted == False,
        User.is_active == True,
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or deactivated")
    return user

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    return _get_user_from_token(token, db)

def require_roles(*roles: str):
    """Dependency factory — usage: Depends(require_roles('SUPER_ADMIN','ADMIN'))"""
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(roles)}",
            )
        return current_user
    return _check

def require_min_role(min_role: str):
    """Allow all roles >= min_role in hierarchy"""
    min_level = ROLE_HIERARCHY.get(min_role, 0)
    def _check(current_user: User = Depends(get_current_user)) -> User:
        user_level = ROLE_HIERARCHY.get(current_user.role, 0)
        if user_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Minimum role required: {min_role}",
            )
        return current_user
    return _check

# Shorthand dependencies
require_super_admin = require_roles("SUPER_ADMIN")
require_admin       = require_roles("SUPER_ADMIN", "ADMIN")
require_owner       = require_roles("SUPER_ADMIN", "ADMIN", "OWNER")
