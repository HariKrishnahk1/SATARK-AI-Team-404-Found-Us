from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User
from app.schemas.schemas import LoginRequest, UserRegister, Token, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered.")

    db_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.upper(),
        department_id=user_in.department_id,
        designation=user_in.designation,
        institution_name=user_in.institution_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_req.email).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    
    access_token = create_access_token(subject=user.id, roles=[user.role])
    user_out = UserOut.model_validate(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_out
    }
