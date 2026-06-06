from shapely.geometry import Polygon
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.kml.parser import parse_and_save_kml
from app.models.all_models import KMLZone
from app.schemas.kml_schema import KMLZoneResponse

router = APIRouter()

@router.post("/upload")
async def upload_kml(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads and parses a KML file to extract geographic zones."""
    if not file.filename.endswith('.kml'):
        raise HTTPException(status_code=400, detail="Only .kml files are supported")
    
    content = await file.read()
    try:
        zones = parse_and_save_kml(content, file.filename, db)
        return {"message": f"Successfully parsed and saved {len(zones)} zones.", "zones_added": [z.zone_name for z in zones]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing KML: {str(e)}")

@router.post("/inject-default")
def inject_default_zone(db: Session = Depends(get_db)):
    """Failsafe: Injects a default hardcoded zone directly into PostGIS."""
    existing = db.query(KMLZone).filter(KMLZone.zone_name == "Zone_Alpha_Mumbai").first()
    if existing:
        return {"message": "Default zone already exists!"}
    
    # Create a perfectly formatted 2D polygon
    poly = Polygon([
        (72.8777, 19.0760),
        (72.8800, 19.0760),
        (72.8800, 19.0780),
        (72.8777, 19.0780),
        (72.8777, 19.0760)
    ])
    
    # Convert exactly to PostGIS format
    wkt_poly = f"SRID=4326;{poly.wkt}"
    
    new_zone = KMLZone(zone_name="Zone_Alpha_Mumbai", polygon_coordinates=wkt_poly)
    db.add(new_zone)
    db.commit()
    
    return {"message": "Default Mumbai Zone injected successfully!", "zone_name": new_zone.zone_name}
@router.get("/list", response_model=list[KMLZoneResponse])
def list_kml_zones(db: Session = Depends(get_db)):
    """Retrieves a list of all parsed KML zones."""
    return db.query(KMLZone).all()

@router.delete("/{id}")
def delete_kml_zone(id: str, db: Session = Depends(get_db)):
    """Deletes a specific KML zone by ID."""
    zone = db.query(KMLZone).filter(KMLZone.zone_id == id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    db.delete(zone)
    db.commit()
    return {"message": "Zone deleted successfully"}