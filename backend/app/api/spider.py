from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import SpiderDeliveryLog
from app.schemas.spider_schema import SpiderDeliveryLogSchema

router = APIRouter()

@router.get("/logs", response_model=list[SpiderDeliveryLogSchema])
def get_transmission_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Fetches the latest SPIDER network transmissions."""
    logs = db.query(SpiderDeliveryLog).order_by(SpiderDeliveryLog.transmission_time.desc()).limit(limit).all()
    return logs