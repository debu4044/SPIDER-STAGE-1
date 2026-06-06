from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import SpiderTransmission
from app.schemas.spider_schema import SpiderTransmissionSchema

router = APIRouter()

@router.get("/logs", response_model=list[SpiderTransmissionSchema])
def get_transmission_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Fetches the latest SPIDER network transmissions."""
    logs = db.query(SpiderTransmission).order_by(SpiderTransmission.transmission_time.desc()).limit(limit).all()
    return logs