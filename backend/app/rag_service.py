import os
import pandas as pd
from typing import List, Dict
from .database import research_logs_collection, SessionLocal, CropInfo

class RAGService:
    def __init__(self):
        self.db = research_logs_collection

    def search_research_logs(self, query: str, limit: int = 3) -> List[Dict]:
        """Search semi-structured research logs in MongoDB."""
        # Simple text search simulation in MongoDB
        # In a real app, you'd use $text index or Vector Search
        cursor = self.db.find({
            "$or": [
                {"content": {"$regex": query, "$options": "i"}},
                {"type": {"$regex": query, "$options": "i"}},
                {"crop": {"$regex": query, "$options": "i"}}
            ]
        }).limit(limit)
        
        results = []
        for doc in cursor:
            results.append({
                "type": doc.get("type", "General"),
                "content": doc.get("content", doc.get("input", "")),
                "timestamp": str(doc.get("timestamp", ""))
            })
        return results

    def get_crop_knowledge(self, crop_name: str) -> str:
        """Fetch deep details about a crop from relational data."""
        session = SessionLocal()
        try:
            crop = session.query(CropInfo).filter(CropInfo.crop_name.ilike(f"%{crop_name}%")).first()
            if crop:
                return f"{crop.crop_name}: {crop.description}. Yield: {crop.yield_potential}. Resistance: {crop.disease_resistance}"
            return ""
        finally:
            session.close()

rag_service = RAGService()
