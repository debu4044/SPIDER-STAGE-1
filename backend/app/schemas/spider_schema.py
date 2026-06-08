from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class SpiderDeliveryLogSchema(BaseModel):
    transmission_id: UUID
    event_id: Optional[UUID]
    target_ip: Optional[str]
    target_port: Optional[int]
    protocol: Optional[str]
    transmission_time: datetime
    status: str
    retry_count: Optional[int]
    response_code: Optional[str]

    class Config:
        from_attributes = True