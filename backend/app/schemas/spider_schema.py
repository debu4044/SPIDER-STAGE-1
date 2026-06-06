from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class SpiderTransmissionSchema(BaseModel):
    transmission_id: UUID
    event_id: Optional[UUID]
    transmission_time: datetime
    status: str
    response: Optional[str]

    class Config:
        from_attributes = True