from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.kml.parser import parse_and_save_kml
from app.models.all_models import KMLZone

router = APIRouter()

@router.post("/upload")
async def upload_kml(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads a KML file and dynamically sets it as the simulation area."""
    if not file.filename.endswith('.kml') and not file.filename.endswith('.xml'):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be .kml")
    
    contents = await file.read()
    try:
        zones = parse_and_save_kml(contents, file.filename, db)
        return {
            "message": f"Successfully parsed and saved {len(zones)} active zones.",
            "zones_processed": [z.zone_name for z in zones]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse KML: {str(e)}")

@router.get("/list")
def list_zones(db: Session = Depends(get_db)):
    """Returns all available geographic zones in the database."""
    zones = db.query(KMLZone).all()
    return [{"id": z.id, "zone_name": z.zone_name} for z in zones]