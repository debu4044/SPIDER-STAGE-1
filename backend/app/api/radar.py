from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import RadarEvent
from app.schemas.radar_schema import RadarEventSchema
from app.services.scenarios.scheduler import start_scenario, stop_all_scenarios # IMPORT NEW ENGINE

router = APIRouter()

engine_state = {
    "is_running": False,
    "active_scenario": None
}

# --- Radar Master Controls ---

@router.post("/start")
def start_radar():
    """Starts the master radar engine (Defaults to Random Mode)."""
    if engine_state["is_running"]:
        raise HTTPException(status_code=400, detail="Radar is already running")
    
    engine_state["is_running"] = True
    engine_state["active_scenario"] = "RANDOM"
    start_scenario("RANDOM", rate=5) # 5 events per second
    
    return {"message": "Radar simulator started", "status": "RUNNING"}

@router.post("/stop")
def stop_radar():
    """Stops the master radar engine."""
    engine_state["is_running"] = False
    engine_state["active_scenario"] = None
    stop_all_scenarios()
    
    return {"message": "Radar simulator stopped", "status": "STOPPED"}

@router.get("/events", response_model=list[RadarEventSchema])
def get_recent_events(limit: int = 50, db: Session = Depends(get_db)):
    """Fetches the latest radar events."""
    events = db.query(RadarEvent).order_by(RadarEvent.timestamp.desc()).limit(limit).all()
    
    # Safely map the DB model to match the exact JSON Schema requirements
    return [
        {
            "event_id": event.event_id,
            "subsystem": "RADAR",
            "event_type": event.event_type,
            "track_id": event.track_id,
            "severity": event.severity,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "speed": event.speed,
            "direction": event.direction,
            "zone": event.zone_name, # Maps the DB column to the expected JSON key
            "timestamp": event.timestamp
        }
        for event in events
    ]
# --- Scenario Specific Controls ---

@router.post("/scenario/day")
def trigger_scenario_day():
    engine_state["is_running"] = True
    engine_state["active_scenario"] = "DAY"
    start_scenario("DAY", rate=5) # 5 Events/sec
    return {"message": "Scenario 7 (Day) started"}

@router.post("/scenario/night")
def trigger_scenario_night():
    engine_state["is_running"] = True
    engine_state["active_scenario"] = "NIGHT"
    start_scenario("NIGHT", rate=10) # 10 Events/sec
    return {"message": "Scenario 7 (Night) started"}