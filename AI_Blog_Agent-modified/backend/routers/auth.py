"""
Auth Router — simple username/password login, no JWT needed for demo.
Session stored in a simple dict (upgrade to Redis for production).
"""
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hashlib, secrets

from database import get_db
from models import User, UserRole

router = APIRouter(prefix="/auth", tags=["Auth"])

# Simple in-memory session store {token: user_id}
_sessions: dict[str, int] = {}


def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def get_token(request: Request) -> str | None:
    return request.cookies.get("session") or request.headers.get("X-Session-Token")


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = get_token(request)
    if not token or token not in _sessions:
        raise HTTPException(401, "Not authenticated")
    uid = _sessions[token]
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")
    return user


async def get_optional_user(request: Request, db: AsyncSession = Depends(get_db)) -> User | None:
    token = get_token(request)
    if not token or token not in _sessions:
        return None
    uid = _sessions.get(token)
    if not uid:
        return None
    result = await db.execute(select(User).where(User.id == uid))
    return result.scalar_one_or_none()


# ─── Role-based dependency guards ────────────────────────────────────────────

async def require_user(user: User = Depends(get_current_user)) -> User:
    """Must be logged in (USER or ADMIN). Guests are rejected with 401."""
    return user  # get_current_user already raises 401 if not logged in


async def require_admin(user: User = Depends(get_current_user)) -> User:
    """Must be logged in AND be an ADMIN. Raises 403 otherwise."""
    if user.role != UserRole.admin:
        raise HTTPException(403, "Admin access required")
    return user


# ─── Auth routes ──────────────────────────────────────────────────────────────

@router.post("/register")
async def register(body: dict, db: AsyncSession = Depends(get_db)):
    username = body.get("username", "").strip()
    password = body.get("password", "")

    if not username or not password:
        raise HTTPException(400, "Username and password required")
    if len(password) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")

    existing = await db.execute(select(User).where(User.username == username))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Username already taken")

    user = User(
        username=username,
        password_hash=_hash(password),
        role=UserRole.user,  # ✅ FIXED: always 'user' — only admins can promote
    )
    db.add(user)
    await db.flush()
    return {"id": user.id, "username": user.username, "role": user.role}


@router.post("/login")
async def login(body: dict, response: Response, db: AsyncSession = Depends(get_db)):
    username = body.get("username", "").strip()
    password = body.get("password", "")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user or user.password_hash != _hash(password):
        raise HTTPException(401, "Invalid username or password")

    token = secrets.token_hex(32)
    _sessions[token] = user.id
    response.set_cookie("session", token, httponly=True, samesite="lax")
    return {"token": token, "id": user.id, "username": user.username, "role": user.role}


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = get_token(request)
    if token:
        _sessions.pop(token, None)
    response.delete_cookie("session")
    return {"ok": True}


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "role": user.role}


# ─── Admin-only: user management ─────────────────────────────────────────────

@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),  # 🔒 ADMIN only
):
    """List all registered users. Admin only."""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        {"id": u.id, "username": u.username, "role": u.role, "created_at": u.created_at}
        for u in users
    ]


@router.patch("/users/{user_id}/role")
async def set_user_role(
    user_id: int,
    body: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),  # 🔒 ADMIN only
):
    """Promote or demote a user's role. Admin only."""
    new_role = body.get("role")
    if new_role not in ("user", "admin"):
        raise HTTPException(400, "Role must be 'user' or 'admin'")

    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(404, "User not found")

    if target.id == admin.id and new_role != "admin":
        raise HTTPException(400, "You cannot demote yourself")

    target.role = UserRole.admin if new_role == "admin" else UserRole.user
    await db.flush()
    return {"id": target.id, "username": target.username, "role": target.role}
