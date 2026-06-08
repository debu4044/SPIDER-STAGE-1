from pydantic import BaseModel
from typing import Dict

class ScenarioCreateSchema(BaseModel):
    name: str
    severity: str
    buffer: int
    rate: int
    sensors: Dict[str, bool]