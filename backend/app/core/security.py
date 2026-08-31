from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
import hashlib
from app.core.config import settings

def get_password_hash(password: str) -> str:
    # Use standard SHA256 hashing for reliable execution across all Python versions
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def create_access_token(subject: Union[str, Any], roles: list, expires_delta: timedelta = None) -> str:
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
