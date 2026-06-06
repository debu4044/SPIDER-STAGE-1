from app.services.spider.transmitter import transmit_event
from shapely import wkb
import random
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.all_models import KMLZone
from app.services.radar.engine import Target

# Initialize the robust background scheduler
scheduler = BackgroundScheduler()
active_targets = []

def generate_events_job(rate: int, scenario_type: str):
    """The core high-speed loop that runs every second."""
    db: Session = SessionLocal()
    try:
        # 1. Get available boundaries
        zones = db.query(KMLZone).all()
        if not zones:
            print("No KML Zones available. Cannot spawn targets.")
            return

        # 2. Spawn targets if we don't have enough to meet the rate
        while len(active_targets) < rate:
            zone = random.choice(zones)
            # Scenario 7: Day mode has less vehicles, Night mode has more uncertainty
            target_type = "Human Track" if random.random() > 0.4 else "Vehicle Track"
            
            # --- THE FIX: Decode the PostGIS binary back into a Shapely Polygon ---
            polygon = wkb.loads(bytes(zone.polygon_coordinates.data))
            
            new_target = Target(
                target_type=target_type, 
                zone_name=zone.zone_name, 
                boundary_polygon=polygon 
            )
            # ----------------------------------------------------------------------
            
            active_targets.append(new_target)
            
            # Log Zone Entry
            db.add(new_target.to_db_event(event_type="Zone Entry"))

        # 3. Move existing targets and generate tracks
        events_to_save = []
        for target in active_targets:
            move_status = target.move()
            
            if move_status == "Zone Exit":
                event = target.to_db_event(event_type="Zone Exit")
                events_to_save.append(event)
                transmit_event(db, event) # SPIDER TRANSMISSION
                
                if random.random() > 0.5:
                    active_targets.remove(target)
            else:
                event = target.to_db_event()
                events_to_save.append(event)
                transmit_event(db, event) # SPIDER TRANSMISSION
                
                if scenario_type == "NIGHT" and random.random() > 0.8:
                    lost_event = target.to_db_event(event_type="Track Lost")
                    events_to_save.append(lost_event)
                    transmit_event(db, lost_event) # SPIDER TRANSMISSION
        # 4. Bulk save to PostgreSQL for high performance
        if events_to_save:
            db.bulk_save_objects(events_to_save)
            db.commit()

    finally:
        db.close()

def start_scenario(scenario_name: str, rate: int):
    """Starts a specific scenario loop."""
    scheduler.remove_all_jobs()
    active_targets.clear()
    
    # Run the generator every 1 second
    scheduler.add_job(
        generate_events_job, 
        'interval', 
        seconds=1, 
        args=[rate, scenario_name],
        id="scenario_loop"
    )
    
    if not scheduler.running:
        scheduler.start()

def stop_all_scenarios():
    """Stops the engine and clears targets."""
    scheduler.remove_all_jobs()
    active_targets.clear()