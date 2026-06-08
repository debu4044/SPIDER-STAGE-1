import random
import uuid
from datetime import datetime
from shapely import wkb
from shapely.geometry import Point
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.all_models import KMLZone, RadarEvent
from app.services.radar.engine import Target
from app.services.spider.transmitter import transmit_event

# Stage 2 Sensor Subsystems
STATIC_SENSORS = {
    "PIDS": ["Fence Climb", "Fence Cut", "Fence Touch", "Digging", "Sensor Fault"],
    "ACS": ["Access Granted", "Access Denied", "Door Forced Open", "Controller Offline"],
    "VIDEO_ANALYTICS": ["Human Detection", "Vehicle Detection", "Line Crossing", "Loitering"],
    "CCTV_HEALTH": ["Camera Offline", "Video Loss", "Storage Full"]
}

scheduler = BackgroundScheduler()
active_targets = []

def get_random_point_in_polygon(polygon: Point):
    min_lon, min_lat, max_lon, max_lat = polygon.bounds
    while True:
        lon = random.uniform(min_lon, max_lon)
        lat = random.uniform(min_lat, max_lat)
        if polygon.contains(Point(lon, lat)):
            return lat, lon

def generate_events_job(rate: int, scenario_type: str):
    db: Session = SessionLocal()
    try:
        zones = db.query(KMLZone).all()
        if not zones: return
        zone = random.choice(zones)
        polygon = wkb.loads(bytes(zone.polygon_coordinates.data))

        new_events = []

        # 1. Spawn targets
        while len(active_targets) < rate:
            target_type = "Human Track" if random.random() > 0.4 else "Vehicle Track"
            new_target = Target(target_type=target_type, zone_name=zone.zone_name, boundary_polygon=polygon)
            active_targets.append(new_target)
            new_events.append(new_target.to_db_event(event_type="Zone Entry"))

        # 2. Move targets
        for target in active_targets:
            move_status = target.move()
            if move_status == "Zone Exit":
                new_events.append(target.to_db_event(event_type="Zone Exit"))
                if random.random() > 0.5:
                    active_targets.remove(target)
            else:
                new_events.append(target.to_db_event())

        # 3. Spawn Static Alerts
        if random.random() > 0.6:
            subsystem = random.choice(list(STATIC_SENSORS.keys()))
            event_type = random.choice(STATIC_SENSORS[subsystem])
            lat, lon = get_random_point_in_polygon(polygon)
            
            static_alert = RadarEvent(
                event_id=uuid.uuid4(),
                event_type=f"[{subsystem}] {event_type}",
                track_id=f"ALR-{uuid.uuid4().hex[:6].upper()}",
                latitude=lat,
                longitude=lon,
                speed=0.0,
                direction=0.0,
                severity=random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
                zone_name=zone.zone_name,
                timestamp=datetime.utcnow()
            )
            new_events.append(static_alert)

        # STRICT ORDER OF OPERATIONS:
        # Step A: Save ALL physical events to PostgreSQL First
        if new_events:
            db.add_all(new_events)
            db.commit()

            # Step B: Trigger Transmissions now that DB is secure
            for event in new_events:
                transmit_event(event)

    finally:
        db.close()

def start_scenario(scenario_name: str, rate: int):
    scheduler.remove_all_jobs()
    active_targets.clear()
    scheduler.add_job(generate_events_job, 'interval', seconds=1, args=[rate, scenario_name], id="scenario_loop")
    if not scheduler.running:
        scheduler.start()

def stop_all_scenarios():
    scheduler.remove_all_jobs()
    active_targets.clear()