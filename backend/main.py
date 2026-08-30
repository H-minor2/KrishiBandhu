from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.advisory.router import router as advisory_router
from api.distress.router import router as distress_router

app = FastAPI(
    title="KrishiBandhu Unified Backend API",
    description="Unified backend covering distress dashboard and agricultural advisory.",
    version="2.0.0"
)

# Set up CORS so the frontend can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to match your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(advisory_router, tags=["Advisory"])
app.include_router(distress_router, tags=["Distress"])

@app.get("/")
def read_root():
    return {"message": "Welcome to KrishiBandhu Unified API. Try /docs for the swagger UI."}
