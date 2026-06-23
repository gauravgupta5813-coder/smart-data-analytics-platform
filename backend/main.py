from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.upload import router as upload_router
from routers.analysis import router as analysis_router
from routers.visualization import router as visualization_router
from routers.ml import router as ml_router

app = FastAPI(
    title="Data Analytics Dashboard"
)

app.mount(
    "/charts",
    StaticFiles(directory="charts"),
    name="charts"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-data-analytics-platform.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(visualization_router)
app.include_router(ml_router)

@app.get("/")
def home():
    return {"message": "Data Analytics Dashboard API"}

@app.get("/test")
def test():
    return {"status": "latest deployment"}