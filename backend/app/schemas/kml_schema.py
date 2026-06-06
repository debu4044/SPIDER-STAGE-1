from pydantic import BaseModel
from uuid import UUID

class KMLZoneResponse(BaseModel):
    zone_id: UUID
    zone_name: str
    
    class Config:
        from_attributes = True