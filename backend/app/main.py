from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mining, ideas, admin, lab, appraisal

app = FastAPI(title="IDEA MINE API", version="0.1.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ideamineai.com",
    "https://www.ideamineai.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(mining.router)
app.include_router(ideas.router)
app.include_router(admin.router)
app.include_router(lab.router)
app.include_router(appraisal.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "idea-mine-api"}
