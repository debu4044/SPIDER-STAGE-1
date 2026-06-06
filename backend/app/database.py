from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Update 'postgres' and 'password' with your actual local PostgreSQL credentials
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:702073@localhost:5432/simcore"

# Create the engine (no connection limits set yet, but can be added for scale)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our models to inherit
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()