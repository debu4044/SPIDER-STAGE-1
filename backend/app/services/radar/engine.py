import random
import math
import uuid
from datetime import datetime
from shapely.geometry import Point, Polygon
from app.models.all_models import RadarEvent

class Target:
    def __init__(self, target_type: str, zone_name: str, boundary_polygon: Polygon):
        self.track_id = f"TRK-{uuid.uuid4().hex[:6].upper()}"
        self.target_type = target_type
        self.zone_name = zone_name
        self.boundary = boundary_polygon
        
        # Determine speed based on constraints (1-8 km/h for Human, 10-80 km/h for Vehicle)
        if target_type == "Human Track":
            self.speed = random.uniform(1.0, 8.0)  
            self.severity = "LOW"
        else:
            self.speed = random.uniform(10.0, 80.0) 
            self.severity = "MEDIUM"
            
        self.heading = random.uniform(0, 360)
        
        # Spawn randomly inside the polygon
        min_lon, min_lat, max_lon, max_lat = self.boundary.bounds
        while True:
            self.longitude = random.uniform(min_lon, max_lon)
            self.latitude = random.uniform(min_lat, max_lat)
            if self.boundary.contains(Point(self.longitude, self.latitude)):
                break

    def move(self):
        """Calculates the next geographical coordinate based on speed and heading."""
        # Convert speed from km/h to degrees per second
        speed_km_sec = self.speed / 3600.0
        
        heading_rad = math.radians(self.heading)
        delta_lat = (speed_km_sec * math.cos(heading_rad)) / 111.32
        delta_lon = (speed_km_sec * math.sin(heading_rad)) / (111.32 * math.cos(math.radians(self.latitude)))
        
        new_lat = self.latitude + delta_lat
        new_lon = self.longitude + delta_lon
        
        # Boundary Validation: If target exits, reverse direction (Re-route)
        new_point = Point(new_lon, new_lat)
        if not self.boundary.contains(new_point):
            self.heading = (self.heading + 180) % 360 
            return "Zone Exit" 
            
        self.latitude = new_lat
        self.longitude = new_lon
        return "Move"

    def to_db_event(self, event_type: str = None) -> RadarEvent:
        """Converts the current state to a SQLAlchemy database model."""
        return RadarEvent(
            event_id=uuid.uuid4(),  # <--- ADD THIS EXACT LINE
            event_type=event_type or self.target_type,
            track_id=self.track_id,
            latitude=self.latitude,
            longitude=self.longitude,
            speed=round(self.speed, 2),
            direction=round(self.heading, 2),
            severity=self.severity,
            zone_name=self.zone_name,
            timestamp=datetime.utcnow()
        )
        