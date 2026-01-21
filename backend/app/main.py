from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
import sys
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Add backend directory to sys.path to allow resolving 'app' module (required for joblib unpickling)
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
import joblib
import pandas as pd
import numpy as np
import os
import io
from datetime import datetime
import httpx

from .database import (
    get_db, init_db, User, CropInfo, GeneticTrait, 
    SoilCondition, ClimateData, PerformanceIndicator, 
    ResearchAnalysis, AuditLog, ParentsReference, 
    PredictionRecord, genomic_collection, research_logs_collection
)
from .models import LGBWrapper

app = FastAPI(title="Genetic Crop Recommendation API")

# CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Encoder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "lgbm_crop_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "data", "processed", "label_encoder.pkl")

model = None
encoder = None

from passlib.context import CryptContext
from pydantic import BaseModel
import re

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class UserSignup(BaseModel):
    username: str
    full_name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

@app.on_event("startup")
def startup_event():
    global model, encoder
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    if os.path.exists(ENCODER_PATH):
        encoder = joblib.load(ENCODER_PATH)
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization failed: {e}. Ensure PostgreSQL is running.")

@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validation for Admin username
    if user.role == "admin":
        if not re.match(r"^AD-\d{3}$", user.username):
            raise HTTPException(status_code=400, detail="Admin username must be in the format 'AD-###' (e.g. AD-123)")
    elif len(user.username) < 6:
        raise HTTPException(status_code=400, detail="Username must be at least 6 characters")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user": {"username": new_user.username, "role": new_user.role}}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email, User.role == user.role).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "user": {
            "id": db_user.user_id,
            "username": db_user.username,
            "name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role
        }
    }

@app.get("/")
def read_root():
    return {"message": "Genetic Crop Recommendation API is running"}

@app.post("/predict")
def predict_crop(data: dict, db: Session = Depends(get_db)):
    if model is None or encoder is None:
        raise HTTPException(status_code=500, detail="Model or Encoder not loaded")
    
    try:
        # Extract features
        features = [
            data.get('N'), data.get('P'), data.get('K'),
            data.get('temperature'), data.get('humidity'),
            data.get('ph'), data.get('rainfall')
        ]
        
        # Validation
        if None in features:
            raise HTTPException(status_code=400, detail="Missing features in input data")
            
        X = np.array([features])
        
        # Predict
        probs = model.predict_proba(X)
        pred_idx = np.argmax(probs, axis=1)[0]
        confidence = float(np.max(probs)) * 100
        
        # Encode label back
        crop_name = encoder.inverse_transform([pred_idx])[0]
        
        # Log to PostgreSQL
        new_pred = PredictionRecord(
            n=data.get('N'), p=data.get('P'), k=data.get('K'),
            temperature=data.get('temperature'), humidity=data.get('humidity'),
            ph=data.get('ph'), rainfall=data.get('rainfall'),
            recommended_crop=crop_name,
            confidence=confidence,
            user_id=data.get('user_id')
        )
        db.add(new_pred)
        db.commit()
        
        # Log to MongoDB (Logs/Semi-structured data)
        research_logs_collection.insert_one({
            "type": "prediction_log",
            "crop": crop_name,
            "confidence": confidence,
            "input": data,
            "timestamp": datetime.utcnow()
        })
        
        # Yield calculation based on land_area if provided
        land_area = data.get('land_area', 1.0)
        # Mock base yields (tons per acre)
        base_yields = {
            "rice": 2.5,
            "maize": 3.0,
            "wheat": 2.0,
            "cotton": 1.5,
            "jute": 2.2,
            "coffee": 0.8,
            "tea": 1.2,
            "rubber": 1.0,
            "coconut": 5.0,
            "sugarcane": 30.0,
            "papaya": 15.0,
            "orange": 10.0,
            "apple": 12.0,
            "muskmelon": 8.0,
            "watermelon": 15.0,
            "grapes": 10.0,
            "mango": 8.0,
            "banana": 20.0,
            "pomegranate": 7.0,
            "lentil": 1.0,
            "blackgram": 0.8,
            "mungbean": 0.7,
            "mothbeans": 0.6,
            "pigeonpeas": 0.9,
            "kidneybeans": 1.1,
            "chickpea": 1.2
        }
        
        crop_lower = crop_name.lower()
        base_yield = base_yields.get(crop_lower, 2.0) # default 2.0 if not found
        total_yield = round(base_yield * float(land_area), 2)
        
        return {
            "crop": crop_name,
            "confidence": round(confidence, 2),
            "yield": f"{total_yield} tons",
            "base_yield_per_acre": f"{base_yield} tons",
            "recommendations": [
                f"Optimal soil pH: {round(data.get('ph'), 1)}",
                f"Climate match: {round(data.get('temperature'), 1)}°C, {round(data.get('humidity'), 1)}% humidity",
                f"Estimated yield for {land_area} acres: {total_yield} tons"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

TOMORROW_IO_KEY = "Udo7t36q9u7IUCRDJbBwWb4mTzA5DBgO"

async def fetch_live_data(lat: float, lon: float):
    # Fetch Weather from Tomorrow.io
    weather_url = f"https://api.tomorrow.io/v4/weather/realtime?location={lat},{lon}&apikey={TOMORROW_IO_KEY}"
    
    # Fetch Soil from ISRIC SoilGrids
    # phh2o: pH in water, nitrogen: total nitrogen
    soil_url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lat={lat}&lon={lon}&property=phh2o&property=nitrogen&depth=0-5cm&value=mean"
    
    async with httpx.AsyncClient() as client:
        # Default values
        res = {
            "N": 101.0, "P": 45.0, "K": 44.0,
            "temperature": 25.0, "humidity": 60.0,
            "ph": 6.5, "rainfall": 100.0
        }
        
        # Fetch Weather from Tomorrow.io
        try:
            weather_resp = await client.get(weather_url, timeout=10.0)
            if weather_resp.status_code == 200:
                weather_data = weather_resp.json()
                values = weather_data.get('data', {}).get('values', {})
                if values.get('temperature') is not None:
                    res["temperature"] = values.get('temperature')
                if values.get('humidity') is not None:
                    res["humidity"] = values.get('humidity')
                if values.get('precipitationIntensity') is not None:
                    res["rainfall"] = values.get('precipitationIntensity') * 24 
            else:
                print(f"Weather API Warning: {weather_resp.status_code}")
        except Exception as e:
            print(f"Weather API Error: {e}")

        # Fetch Soil from ISRIC SoilGrids
        try:
            soil_resp = await client.get(soil_url, timeout=10.0)
            if soil_resp.status_code == 200:
                soil_data = soil_resp.json()
                properties = soil_data.get('properties', {}).get('layers', [])
                for layer in properties:
                    if layer['name'] == 'phh2o' and layer['depths']:
                        res["ph"] = layer['depths'][0]['values']['mean'] / 10.0
                    if layer['name'] == 'nitrogen' and layer['depths']:
                        res["N"] = layer['depths'][0]['values']['mean'] / 10.0
            else:
                print(f"Soil API Warning: {soil_resp.status_code}")
        except Exception as e:
            print(f"Soil API Error: {e}")
            
        return res

@app.post("/predict/live")
async def predict_live(data: dict, db: Session = Depends(get_db)):
    lat = data.get('latitude')
    lon = data.get('longitude')
    land_area = data.get('land_area', 1.0)
    user_id = data.get('user_id')
    
    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail="Latitude and Longitude are required")
        
    live_data = await fetch_live_data(lat, lon)
    live_data['user_id'] = user_id
    live_data['land_area'] = land_area
    
    return predict_crop(live_data, db)

@app.get("/crops")
def get_crops(db: Session = Depends(get_db)):
    crops = db.query(CropInfo).all()
    # Map to frontend expectations if needed
    result = []
    for c in crops:
        result.append({
            "id": c.crop_id,
            "name": c.crop_name,
            "variety": c.variety,
            "yieldPotential": "High", # Dummy for now
            "diseaseResistance": "High", # Dummy for now
            "status": "Active"
        })
    return result

@app.post("/crops")
def add_crop(crop_data: dict, db: Session = Depends(get_db)):
    new_crop = CropInfo(**crop_data)
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop

@app.get("/traits")
def get_traits(db: Session = Depends(get_db)):
    traits = db.query(GeneticTrait, CropInfo).join(CropInfo).all()
    result = []
    for trait, crop in traits:
        result.append({
            "id": trait.trait_id,
            "crop": crop.crop_name,
            "markerId": trait.gene_code,
            "traitAffected": trait.trait_name,
            "effectType": "Positive", # Realistic default for seeded markers
            "confidenceScore": "85%"
        })
    return result

@app.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return {
        "crops": db.query(CropInfo).count(),
        "traits": db.query(GeneticTrait).count(),
        "climate": db.query(ClimateData).count(),
        "predictions": db.query(PredictionRecord).count(),
        "researchers": db.query(User).filter(User.role == 'user').count() # Frontend calls 'user' Researcher
    }

@app.get("/climate")
def get_climate(db: Session = Depends(get_db)):
    records = db.query(ClimateData).all()
    result = []
    for r in records:
        result.append({
            "id": r.climate_id,
            "location": r.region,
            "tempAvg": f"{r.temperature}°C",
            "tempMin": f"{round(r.temperature - 5, 1)}°C",
            "tempMax": f"{round(r.temperature + 5, 1)}°C",
            "rainfall": f"{r.rainfall} mm",
            "humidity": f"{r.humidity}%",
            "season": "Kharif",
            "year": "2024"
        })
    return result

@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...), 
    category: str = Form("prediction"),
    user_id: str = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df = df.where(pd.notnull(df), None) # Handle NaNs
    
    records_count = 0
    try:
        if category == "crops":
            for _, row in df.iterrows():
                new_crop = CropInfo(
                    crop_name=row.get('crop_name'),
                    variety=row.get('variety'),
                    origin_region=row.get('origin_region'),
                    description=row.get('description')
                )
                db.add(new_crop)
            records_count = len(df)
            
        elif category == "genetic":
            for _, row in df.iterrows():
                # Try to find crop by name if provided
                crop_id = None
                if 'crop_name' in row:
                    crop = db.query(CropInfo).filter(CropInfo.crop_name == row['crop_name']).first()
                    if crop:
                        crop_id = crop.crop_id
                
                new_trait = GeneticTrait(
                    crop_id=crop_id,
                    gene_code=row.get('gene_code'),
                    category=row.get('category'),
                    trait_name=row.get('trait_name'),
                    description=row.get('description')
                )
                db.add(new_trait)
            records_count = len(df)

        elif category == "climate":
            for _, row in df.iterrows():
                new_climate = ClimateData(
                    region=row.get('region'),
                    temperature=row.get('temperature'),
                    humidity=row.get('humidity'),
                    rainfall=row.get('rainfall')
                )
                db.add(new_climate)
            records_count = len(df)

        elif category == "soil":
            for _, row in df.iterrows():
                new_soil = SoilCondition(
                    region=row.get('region'),
                    soil_type=row.get('soil_type'),
                    ph_level=row.get('ph_level'),
                    nitrogen_content=row.get('nitrogen_content'),
                    phosphorus_content=row.get('phosphorus_content')
                )
                db.add(new_soil)
            records_count = len(df)
            
        else: # Default or "prediction"
            # Existing behavior or ignore for now if not matching typical bulk categories
            records_count = len(df)
            pass

        db.commit()

        if user_id and user_id.isdigit():
            audit = AuditLog(
                user_id=int(user_id),
                table_name=category,
                operation="BATCH_UPLOAD",
                details=f"Uploaded {file.filename} containing {records_count} rows to {category}"
            )
            db.add(audit)
            db.commit()

        # Trigger AI agent report automatically
        ai_report = await generate_ai_report()
        
        return {
            "message": f"Successfully processed {records_count} rows for {category}.",
            "records_count": records_count,
            "ai_report": ai_report
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

@app.get("/admin/predictions")
def get_all_predictions(db: Session = Depends(get_db)):
    # Fetch all predictions, ordered by latest
    preds = db.query(PredictionRecord).order_by(desc(PredictionRecord.created_at)).all()
    
    result = []
    for p in preds:
        user_data = "Anonymous"
        if p.user_id:
            user = db.query(User).filter(User.user_id == p.user_id).first()
            if user:
                user_data = {
                    "id": user.user_id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.full_name
                }
        
        result.append({
            "id": p.id,
            "crop": p.recommended_crop,
            "confidence": round(p.confidence, 1) if p.confidence else 0,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else "N/A",
            "user": user_data,
            "details": f"pH: {p.ph}, Temp: {p.temperature}C"
        })
    return result

from .agent import generate_ai_report

@app.post("/admin/generate-report")
async def create_report(db: Session = Depends(get_db)):
    # Note: The agent manages its own DB session or we could pass 'db' if refactored.
    # We used a helper that creates a session, so we just call it.
    try:
        report = await generate_ai_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users")
def get_users(role: str = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if role and role != "all":
        # Map frontend role names to backend if needed
        # Frontend: "Admin", "Researcher"
        # Backend: "admin", "user"
        if role.lower() == "admin":
            query = query.filter(User.role == "admin")
        elif role.lower() == "researcher":
            query = query.filter(User.role == "user")
        else:
             query = query.filter(User.role == role)
            
    users = query.all()
    result = []
    for u in users:
        # Determine status (mock logic for now, or assume active)
        status = "Active"
        
        # Count predictions
        prediction_count = db.query(PredictionRecord).filter(PredictionRecord.user_id == u.user_id).count()
        
        result.append({
            "id": u.user_id,
            "name": u.full_name or u.username,
            "email": u.email,
            "role": "Admin" if u.role == "admin" else "Researcher",
            "status": status,
            "lastActive": "N/A", # Timestamp often not stored, using placeholder
            "predictions": prediction_count
        })
    return result
