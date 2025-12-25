import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

# Find .env in the project root
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, ".env")
load_dotenv(env_path)

# PostgreSQL Setup
POSTGRES_URL = os.getenv("POSTGRES_URL")
if not POSTGRES_URL:
    print("Warning: POSTGRES_URL not found in .env, using default.")
    POSTGRES_URL = "postgresql://postgres:postgres@localhost:5432/genetic_db"

try:
    engine = create_engine(POSTGRES_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Error creating SQLAlchemy engine: {e}")
    raise e

Base = declarative_base()

# MongoDB Setup
MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    print("Warning: MONGO_URL not found in .env, using default.")
    MONGO_URL = "mongodb://localhost:27017"

try:
    mongo_client = MongoClient(MONGO_URL)
    mongo_db = mongo_client["genetic_data"]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise e

# MongoDB Collections
genomic_collection = mongo_db["genomic_sequences"]
research_logs_collection = mongo_db["research_logs"]
sensor_metadata_collection = mongo_db["sensor_metadata"]

# PostgreSQL Models (Relational / Structured)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    role = Column(String(20)) # Admin, Researcher, User
    created_at = Column(DateTime, default=datetime.utcnow)

class CropInfo(Base):
    __tablename__ = "crop_info"
    crop_id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), index=True)
    variety = Column(String(100))
    origin_region = Column(String(100))
    description = Column(Text)

class GeneticTrait(Base):
    __tablename__ = "genetic_traits"
    trait_id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crop_info.crop_id"))
    gene_code = Column(String(50), index=True)
    category = Column(String(50))
    trait_name = Column(String(100))
    description = Column(Text)

class SoilCondition(Base):
    __tablename__ = "soil_conditions"
    soil_id = Column(Integer, primary_key=True, index=True)
    region = Column(String(100))
    soil_type = Column(String(50))
    ph_level = Column(Float)
    nitrogen_content = Column(Float)
    phosphorus_content = Column(Float)
    observation_date = Column(DateTime, default=datetime.utcnow)

class ClimateData(Base):
    __tablename__ = "climate_data"
    climate_id = Column(Integer, primary_key=True, index=True)
    region = Column(String(100))
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    observation_date = Column(DateTime, default=datetime.utcnow)

class PerformanceIndicator(Base):
    __tablename__ = "performance_indicators"
    performance_id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crop_info.crop_id"))
    yield_value = Column(Float)
    growth_rate = Column(Float)
    disease_resistance = Column(String(50))
    water_efficiency = Column(Float)

class ResearchAnalysis(Base):
    __tablename__ = "research_analysis"
    analysis_id = Column(Integer, primary_key=True, index=True)
    trait_id = Column(Integer, ForeignKey("genetic_traits.trait_id"))
    crop_id = Column(Integer, ForeignKey("crop_info.crop_id"))
    performance_id = Column(Integer, ForeignKey("performance_indicators.performance_id"))
    correlation_score = Column(Float)
    method = Column(String(100))
    remarks = Column(Text)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    table_name = Column(String(50))
    operation = Column(String(20)) # INSERT, UPDATE, DELETE
    record_id = Column(Integer)
    action_time = Column(DateTime, default=datetime.utcnow)
    details = Column(Text)

class ParentsReference(Base):
    __tablename__ = "parents_references"
    reference_id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crop_info.crop_id"))
    mother_seed_id = Column(Integer)
    father_seed_id = Column(Integer)
    crossing_type = Column(String(50))
    observation = Column(Text)

# Supplementary for existing functionality
class PredictionRecord(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    n = Column(Float)
    p = Column(Float)
    k = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    ph = Column(Float)
    rainfall = Column(Float)
    recommended_crop = Column(String(50))
    confidence = Column(Float)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
