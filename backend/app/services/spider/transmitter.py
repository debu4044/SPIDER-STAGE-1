import random
from sqlalchemy.orm import Session
from app.models.all_models import RadarEvent, SpiderTransmission

def transmit_event(db: Session, event: RadarEvent):
    """Mocks the SPIDER network transmission to an external C2 system."""
    
    # Simulate network reliability (95% success rate)
    is_success = random.random() < 0.95
    
    # Create the transmission log
    transmission = SpiderTransmission(
        event_id=event.event_id,
        status="SUCCESS" if is_success else "FAILED",
        response="200 OK: External System Accepted" if is_success else "503: Network Timeout / Node Offline"
    )
    
    db.add(transmission)
    return transmission