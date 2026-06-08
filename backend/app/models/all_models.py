from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
import uuid
from datetime import datetime
from app.database import Base

# --- GEOGRAPHY ---
class KMLZone(Base):
    __tablename__ = "kml_zones"
    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String, unique=True, index=True)
    polygon_coordinates = Column(Geometry(geometry_type='POLYGON', srid=4326))

class KMLExport(Base):
    __tablename__ = "kml_exports"
    export_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String)

# --- SUBSYSTEMS & SENSORS ---
class Sensor(Base):
    __tablename__ = "sensors"
    sensor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subsystem = Column(String, index=True) # RADAR, PIDS, ACS, VA, CCTV
    name = Column(String)
    ip_address = Column(String, nullable=True)
    status = Column(String, default="ONLINE")

# --- SCENARIO BUILDER ---
class ScenarioDefinition(Base):
    __tablename__ = "scenario_definitions"
    scenario_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True)
    is_custom = Column(Boolean, default=True)
    sensors_included = Column(JSON) # List of subsystems
    severity_level = Column(String)
    buffer_zone_meters = Column(Integer, default=0)
    duration_seconds = Column(Integer, nullable=True)
    active_kml_id = Column(Integer, ForeignKey("kml_zones.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScenarioExecution(Base):
    __tablename__ = "scenario_executions"
    execution_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenario_definitions.scenario_id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(String) # RUNNING, COMPLETED, ABORTED

class AlertTemplate(Base):
    __tablename__ = "alert_templates"
    template_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    subsystem = Column(String)
    event_type = Column(String)
    default_severity = Column(String)

# --- EVENTS & TELEMETRY ---
class RadarEvent(Base):
    __tablename__ = "radar_events"
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, index=True)
    track_id = Column(String, index=True)
    severity = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float)
    direction = Column(Float)
    zone_name = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SpiderDeliveryLog(Base):
    __tablename__ = "spider_delivery_log"
    transmission_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("radar_events.event_id"), nullable=True)
    target_ip = Column(String)
    target_port = Column(Integer)
    protocol = Column(String) # HTTP or UDP
    transmission_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String) # SENT, FAILED, PENDING, RETRIED
    retry_count = Column(Integer, default=0)
    response_code = Column(String, nullable=True)