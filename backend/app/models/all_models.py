import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.database import Base

class RadarEvent(Base):
    """Stores all generated radar events[cite: 118, 119]."""
    __tablename__ = "radar_events"
    
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # [cite: 121]
    event_type = Column(String, index=True) # [cite: 122]
    track_id = Column(String, index=True) # [cite: 123]
    latitude = Column(Float) # [cite: 124]
    longitude = Column(Float) # [cite: 125]
    speed = Column(Float) # [cite: 126]
    direction = Column(Float) # [cite: 127]
    severity = Column(String) # [cite: 128]
    zone_name = Column(String) # [cite: 129]
    timestamp = Column(DateTime, default=datetime.datetime.utcnow) # [cite: 130]

class KMLZone(Base):
    """Stores parsed geographical boundaries from KML files[cite: 131, 132]."""
    __tablename__ = "kml_zones"
    
    zone_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # [cite: 133]
    zone_name = Column(String, unique=True, index=True) # [cite: 134]
    polygon_coordinates = Column(Geometry(geometry_type='POLYGON', srid=4326)) # [cite: 135]

class SpiderTransmission(Base):
    """Logs the transmission status to the SPIDER Security Center[cite: 136, 137]."""
    __tablename__ = "spider_transmissions"
    
    transmission_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # [cite: 138]
    event_id = Column(UUID(as_uuid=True), ForeignKey("radar_events.event_id")) # [cite: 139]
    transmission_time = Column(DateTime, default=datetime.datetime.utcnow) # [cite: 140]
    status = Column(String) # [cite: 141]
    response = Column(Text) # [cite: 142]

class SystemLog(Base):
    """Stores general system logging and errors[cite: 143, 144]."""
    __tablename__ = "system_logs"
    
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # [cite: 145]
    log_level = Column(String) # [cite: 146]
    message = Column(Text) # [cite: 147]
    timestamp = Column(DateTime, default=datetime.datetime.utcnow) # [cite: 148]