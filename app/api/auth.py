from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserProfile
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserProfile, status_code=201)
async def register(payload: RegisterRequest):
    existing = await User.find_one(User.email == payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    await user.insert()
    return UserProfile(id=str(user.id), name=user.name, email=user.email)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await User.find_one(User.email == payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    user_id = decode_token(payload.refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(id=str(current_user.id), name=current_user.name, email=current_user.email)
