from app.api import spider
from app.api import radar
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import kml # Import the new KML router

app = FastAPI(
    title="SimCore Backend",
    description="Stage-1 Prototype of Security Event & Alert Data Simulator",
    version="1.0.0"
)

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the API routes
app.include_router(kml.router, prefix="/api/kml", tags=["KML Engine"])
app.include_router(radar.router, prefix="/api/radar", tags=["Radar Simulator"])
app.include_router(spider.router, prefix="/api/spider", tags=["SPIDER Network"])
@app.get("/")
async def root():
    return {"message": "SimCore API is running"}