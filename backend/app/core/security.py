"""
SATARK AI — JWT Authentication & Security Module
Author: Hari Krishna DK (Team Lead & System Architect)
Handles JWT access token creation, verification, password hashing, and role-based access control guards.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
import hashlib
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Generates salted SHA256 password digest."""
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored digest."""
    return get_password_hash(plain_password) == hashed_password

def create_access_token(subject: Union[str, Any], roles: list, expires_delta: timedelta = None) -> str:
    """Creates signed JWT token with assigned user roles."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "roles": roles
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
