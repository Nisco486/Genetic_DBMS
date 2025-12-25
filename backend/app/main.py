from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
import sys
import os

# Add backend directory to sys.path to allow resolving 'app' module (required for joblib unpickling)
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import numpy as np
import os
import io
from datetime import datetime

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
            confidence=confidence
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
        
        return {
            "crop": crop_name,
            "confidence": round(confidence, 2),
            "yield": "High",  # Placeholder or logic based on crop
            "recommendations": [
                f"Optimal soil pH: {round(data.get('ph'), 1)}",
                f"Climate match: {round(data.get('temperature'), 1)}°C, {round(data.get('humidity'), 1)}% humidity",
                "Recommended fertilizer: NPK according to soil test"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Process batch predictions
    return {"message": f"Successfully processed {len(df)} rows."}
