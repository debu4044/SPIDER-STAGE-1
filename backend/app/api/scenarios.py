from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import ScenarioDefinition
from app.schemas.scenario_schema import ScenarioCreateSchema

router = APIRouter()

@router.post("/create")
def create_scenario(payload: ScenarioCreateSchema, db: Session = Depends(get_db)):
    """Receives custom scenario parameters from the UI and saves them to PostGIS."""
    try:
        # Check if a scenario with this name already exists
        existing = db.query(ScenarioDefinition).filter(ScenarioDefinition.name == payload.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="A scenario with this name already exists.")

        new_scenario = ScenarioDefinition(
            name=payload.name,
            is_custom=True,
            sensors_included=payload.sensors,
            severity_level=payload.severity,
            buffer_zone_meters=payload.buffer
        )
        
        db.add(new_scenario)
        db.commit()
        
        return {"message": "Scenario locked into PostgreSQL!", "scenario_name": new_scenario.name}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")