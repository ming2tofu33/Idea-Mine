import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mining, ideas, admin, lab, appraisal, ore

app = FastAPI(title="IDEA MINE API", version="0.1.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "https://ideamineai.com",
    "https://www.ideamineai.com",
]

ALLOWED_ORIGIN_REGEX = os.environ.get(
    "CORS_ALLOW_ORIGIN_REGEX",
    r"^https://[a-zA-Z0-9-]+\.vercel\.app$|^http://(localhost|127\.0\.0\.1):\d+$",
)

# 환경변수로 추가 origin 허용 (쉼표 구분)
extra_origins = os.environ.get("CORS_EXTRA_ORIGINS", "")
if extra_origins:
    ALLOWED_ORIGINS.extend(o.strip() for o in extra_origins.split(",") if o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(mining.router)
app.include_router(ideas.router)
app.include_router(admin.router)
app.include_router(lab.router)
app.include_router(appraisal.router)
app.include_router(ore.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "idea-mine-api"}
