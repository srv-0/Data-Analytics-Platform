from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, analyze, predict, insights

app = FastAPI(title="ML Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://data-analytics-platform-six.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predict"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])

@app.get("/")
def root():
    return {"status": "ML Analytics API running"}
