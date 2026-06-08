import socket
import threading
import time
import httpx
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.all_models import RadarEvent, SpiderDeliveryLog

# Stage 2 SPIDER Target Configuration
TARGET_IP = "127.0.0.1" 
HTTP_PORT = 8080
UDP_PORT = 5005
HTTP_ENDPOINT = f"http://{TARGET_IP}:{HTTP_PORT}/api/events"

def send_udp_radar(event: RadarEvent, log_id: str):
    """Sends raw radar tracks via UDP Socket in the strict 21-index CSV format."""
    db = SessionLocal()
    log = db.query(SpiderDeliveryLog).filter(SpiderDeliveryLog.transmission_id == log_id).first()
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        target_type_id = 2 if "Human" in event.event_type else 10
        event_time = int(event.timestamp.timestamp())
        
        # Format: DeviceId, DeviceType, Lat, Lon, Height, Bearing, FOVStart, FOVEnd, TrackId, TargetLat, TargetLon, TargetRange, TargetBearing, TargetType, Confidence, EventTime, EventId, Other, Speed, Elevation, Altitude
        csv_payload = f"3,9,27.22,77.40,0,273,0,360,{event.track_id},{event.latitude},{event.longitude},5000,{event.direction},{target_type_id},99,{event_time},0,0,{event.speed},0,0"
        
        sock.sendto(csv_payload.encode(), (TARGET_IP, UDP_PORT))
        
        log.status = "SUCCESS"
        log.response_code = "UDP Packet Sent"
    except Exception as e:
        log.status = "FAILED"
        log.response_code = f"UDP Err: {str(e)}"
    finally:
        db.commit()
        db.close()

def send_http_alert(event: RadarEvent, log_id: str):
    """Sends security alerts via HTTP POST with a 3-attempt/5-sec retry mechanism."""
    db = SessionLocal()
    log = db.query(SpiderDeliveryLog).filter(SpiderDeliveryLog.transmission_id == log_id).first()

    payload = {
        "eventId": str(event.event_id),
        "eventType": event.event_type,
        "severity": event.severity,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "timestamp": event.timestamp.isoformat()
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            # 2-second timeout so the thread doesn't hang indefinitely
            with httpx.Client(timeout=2.0) as client:
                response = client.post(HTTP_ENDPOINT, json=payload)
                
            if response.status_code in [200, 201]:
                log.status = "SUCCESS"
                log.response_code = f"HTTP {response.status_code} OK"
                break
            else:
                raise Exception(f"HTTP {response.status_code}")
                
        except Exception as e:
            log.retry_count += 1
            log.status = "RETRIED" if attempt < max_retries - 1 else "FAILED"
            log.response_code = "Connection Refused" if "ConnectError" in str(type(e)) else str(e)
            db.commit()
            
            # The mandated 5-second interval between retries
            if attempt < max_retries - 1:
                time.sleep(5) 

    db.commit()
    db.close()

def transmit_event(event: RadarEvent):
    """Main routing function. Sorts events into UDP (Radar) or HTTP (Alerts)."""
    db = SessionLocal() # Open an isolated session
    
    try:
        is_radar_track = "Track" in event.event_type or "Zone" in event.event_type
        
        # Create the log immediately so it appears on the dashboard as PENDING
        log = SpiderDeliveryLog(
            event_id=event.event_id,
            target_ip=TARGET_IP,
            target_port=UDP_PORT if is_radar_track else HTTP_PORT,
            protocol="UDP" if is_radar_track else "HTTP",
            status="PENDING",
            response_code="Initiating connection...",
            retry_count=0
        )
        db.add(log)
        db.commit() 
        log_id = log.transmission_id
        
        # Spin off the actual transmission into background threads
        if is_radar_track:
            threading.Thread(target=send_udp_radar, args=(event, log_id)).start()
        else:
            threading.Thread(target=send_http_alert, args=(event, log_id)).start()
            
    finally:
        db.close() # Close the session safely