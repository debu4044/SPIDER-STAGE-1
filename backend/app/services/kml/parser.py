from fastkml import kml
from shapely.geometry import Polygon
from sqlalchemy.orm import Session
from app.models.all_models import KMLZone

def parse_and_save_kml(file_contents: bytes, filename: str, db: Session):
    """Parses a KML file, extracts polygons, and saves them to PostGIS."""
    k = kml.KML()
    k.from_string(file_contents)
    
    zones_added = []
    
    def get_features(obj):
        """Safely extracts features whether they are a method or a property."""
        f = getattr(obj, 'features', [])
        return f() if callable(f) else f

    def extract_polygons(feature):
        polygons = []
        # Check if the feature has geometry
        if getattr(feature, 'geometry', None):
            geom = feature.geometry
            if geom.geom_type == 'Polygon':
                polygons.append((feature.name, geom))
        
        # Recursively check for nested folders/features
        for sub_feature in get_features(feature):
            polygons.extend(extract_polygons(sub_feature))
        return polygons

    # The main KML document is usually the first feature
    all_polygons = []
    for f in get_features(k):
        all_polygons.extend(extract_polygons(f))
    
    for name, poly in all_polygons:
        # Convert shapely polygon to Extended Well-Known Text (EWKT) for PostGIS
        wkt_poly = f"SRID=4326;{poly.wkt}"
        zone_name = name if name else f"Zone_{filename}"
        
        # Check if zone name already exists to prevent duplication crashes
        existing = db.query(KMLZone).filter(KMLZone.zone_name == zone_name).first()
        if not existing:
            new_zone = KMLZone(zone_name=zone_name, polygon_coordinates=wkt_poly)
            db.add(new_zone)
            zones_added.append(new_zone)
            
    db.commit()
    return zones_added