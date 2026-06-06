from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class RadarEventSchema(BaseModel):
    event_id: Optional[UUID] = None
    subsystem: str = "RADAR"
    event_type: str
    track_id: str
    severity: str
    latitude: float
    longitude: float
    speed: float
    direction: float
    zone: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True