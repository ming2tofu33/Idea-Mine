from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mining, ideas, admin, lab, appraisal

app = FastAPI(title="IDEA MINE API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mining.router)
app.include_router(ideas.router)
app.include_router(admin.router)
app.include_router(lab.router)
app.include_router(appraisal.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "idea-mine-api"}
