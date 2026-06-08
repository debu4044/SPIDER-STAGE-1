import xml.etree.ElementTree as ET
from shapely.geometry import Polygon
from sqlalchemy.orm import Session
from app.models.all_models import KMLZone

def parse_and_save_kml(kml_content: bytes, filename: str, db: Session):
    """
    Parses raw KML/XML content, extracts polygons, and saves to PostGIS.
    Bypasses library strictness by using raw native ElementTree parsing.
    """
    # Parse the raw XML
    root = ET.fromstring(kml_content)
    
    # Strip restrictive XML namespaces to make tag searching bulletproof
    for elem in root.iter():
        if '}' in elem.tag:
            elem.tag = elem.tag.split('}', 1)[1]

    zones = []
    
    # KML files hold their data inside <Placemark> tags
    for placemark in root.findall('.//Placemark'):
        name_tag = placemark.find('name')
        # If the Placemark doesn't have a name, use the filename
        zone_name = name_tag.text if name_tag is not None else filename.split('.')[0]
        
        coords_tag = placemark.find('.//coordinates')
        if coords_tag is not None:
            # Clean up the raw text block of coordinates
            raw_coords = coords_tag.text.strip().split()
            
            # Format is typically: lon,lat,altitude
            points = []
            for point in raw_coords:
                parts = point.split(',')
                if len(parts) >= 2:
                    lon, lat = float(parts[0]), float(parts[1])
                    points.append((lon, lat))
            
            # A valid polygon needs at least 3 points
            if len(points) >= 3:
                poly = Polygon(points)
                # Convert mathematically to PostGIS Well-Known Text (WKT)
                wkt_poly = f"SRID=4326;{poly.wkt}"
                
                # Check if this zone already exists to update it, or create new
                existing_zone = db.query(KMLZone).filter(KMLZone.zone_name == zone_name).first()
                if existing_zone:
                    existing_zone.polygon_coordinates = wkt_poly
                    zones.append(existing_zone)
                else:
                    new_zone = KMLZone(zone_name=zone_name, polygon_coordinates=wkt_poly)
                    db.add(new_zone)
                    zones.append(new_zone)
    
    db.commit()
    return zones