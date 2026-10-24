import asyncio
import os
import logging
import json
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from dotenv import load_dotenv

# Load local settings before modules read DATABASE_URL or other configuration.
load_dotenv()

from models import EventFormRequest, EventPlanResponse
from ai_service import generate_event_plan
import auth_store

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(_app):
    auth_store.initialize()
    yield


app = FastAPI(
    title="CelebratAI Event Planner API",
    description="AI-powered celebration and event planning backend",
    version="1.0.0",
    lifespan=lifespan,
)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def current_user(authorization: str | None):
    scheme, _, token = (authorization or "").partition(" ")
    user = auth_store.user_for_token(token) if scheme.lower() == "bearer" else None
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in to continue.")
    return user


@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    email = request.email.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    result = auth_store.register(request.name, email, request.password)
    if not result:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    return result


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    result = auth_store.login(request.email, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return result


@app.get("/api/auth/me")
async def get_current_user(authorization: str | None = Header(default=None)):
    return {"user": current_user(authorization)}


@app.post("/api/auth/logout", status_code=204)
async def logout(authorization: str | None = Header(default=None)):
    current_user(authorization)
    _, _, token = (authorization or "").partition(" ")
    auth_store.delete_session(token)
    return Response(status_code=204)


@app.get("/api/plans")
async def get_saved_plan(authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    records = auth_store.list_plans(user["id"])
    if records:
        return {"plans": [{"id": row["id"], "plan": json.loads(row["plan_json"]), "updatedAt": row["updated_at"]} for row in records]}
    # Compatibility for a plan that predates account history.
    stored = auth_store.get_plan(user["id"])
    return {"plans": [{"id": auth_store.create_plan(user["id"], stored), "plan": json.loads(stored), "updatedAt": ""}] if stored else []}


@app.post("/api/plans")
async def post_saved_plan(plan: EventPlanResponse, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    return {"id": auth_store.create_plan(user["id"], plan.model_dump_json())}


@app.put("/api/plans/{plan_id}")
async def put_saved_plan(plan_id: int, plan: EventPlanResponse, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    if not auth_store.update_plan(user["id"], plan_id, plan.model_dump_json()):
        raise HTTPException(status_code=404, detail="Event plan not found.")
    return {"saved": True}


@app.delete("/api/plans/{plan_id}", status_code=204)
async def delete_saved_plan(plan_id: int, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    if not auth_store.delete_plan(user["id"], plan_id):
        raise HTTPException(status_code=404, detail="Event plan not found.")
    return Response(status_code=204)

# CORS configuration
origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "CelebratAI Event Planner API"}


@app.post("/api/generate-plan", response_model=EventPlanResponse)
async def create_event_plan(request: EventFormRequest):
    """
    Generate a personalized AI event plan.
    
    Accepts event details and returns a complete structured plan
    including budget breakdown, timeline, vendor checklist, and theme ideas.
    """
    try:
        plan = await asyncio.to_thread(generate_event_plan, request)
        return plan
    except ValidationError as e:
        logger.exception("AI returned a plan that failed validation")
        raise HTTPException(status_code=502, detail="The AI service returned an invalid plan. Please try again.")
    except ValueError as e:
        error_msg = str(e)
        logger.warning("AI generation could not complete: %s", error_msg)
        if "GEMINI_API_KEY" in error_msg:
            raise HTTPException(
                status_code=503,
                detail="AI service is not configured. Please set the GEMINI_API_KEY environment variable."
            )
        if "quota" in error_msg.lower() or "rate" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="AI service rate limit reached. Please wait a moment and try again."
            )
        raise HTTPException(status_code=503, detail="The AI service is temporarily unavailable. Please try again.")
    except Exception as e:
        logger.exception("Unexpected error while generating an event plan")
        err_str = str(e)
        if "quota" in err_str.lower() or "429" in err_str or "resourceexhausted" in err_str.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini AI rate limit reached. Please wait a moment and click Generate again."
            )
        raise HTTPException(status_code=502, detail="The AI service could not generate a plan. Please try again.")
