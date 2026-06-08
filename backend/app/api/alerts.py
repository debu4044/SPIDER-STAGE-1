from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import random
from datetime import datetime
from shapely import wkb
from shapely.geometry import Point

from app.database import get_db
from app.models.all_models import RadarEvent, KMLZone
from app.services.spider.transmitter import transmit_event

router = APIRouter()

class AlertPayload(BaseModel):
    subsystem: str
    event_type: str
    severity: str
    count: int = 1

@router.post("/trigger")
def trigger_manual_alert(payload: AlertPayload, db: Session = Depends(get_db)):
    """Manually injects specific alerts into the KML zone and transmits them."""
    # 1. Grab the active KML boundary
    zone = db.query(KMLZone).first()
    if not zone:
        raise HTTPException(status_code=400, detail="No active KML Geography found. Upload a map first.")
    
    polygon = wkb.loads(bytes(zone.polygon_coordinates.data))
    min_lon, min_lat, max_lon, max_lat = polygon.bounds

    generated = 0
    # 2. Bulk Generation Loop
    for _ in range(payload.count):
        # Calculate a mathematically valid point inside the XML polygon
        while True:
            lon = random.uniform(min_lon, max_lon)
            lat = random.uniform(min_lat, max_lat)
            if polygon.contains(Point(lon, lat)):
                break

        formatted_event = f"[{payload.subsystem}] {payload.event_type}" if payload.subsystem != "RADAR" else payload.event_type
        
        # 3. Create the Database Record
        alert = RadarEvent(
            event_id=uuid.uuid4(),
            event_type=formatted_event,
            track_id=f"MAN-{uuid.uuid4().hex[:6].upper()}", # 'MAN' for Manual
            latitude=lat,
            longitude=lon,
            speed=0.0 if payload.subsystem != "RADAR" else random.uniform(5.0, 80.0),
            direction=0.0 if payload.subsystem != "RADAR" else random.uniform(0, 360),
            severity=payload.severity,
            zone_name=zone.zone_name,
            timestamp=datetime.utcnow()
        )
        db.add(alert)
        db.commit()
        
        # 4. Fire the SPIDER Network Transmitter Instantly
        transmit_event(alert)
        generated += 1
        
    return {"message": f"Successfully injected {generated} {payload.severity} alerts into the simulation network."}