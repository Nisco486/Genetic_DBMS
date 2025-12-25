from backend.app.database import SessionLocal, User, CropInfo, GeneticTrait, ClimateData, PredictionRecord, init_db
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data():
    db = SessionLocal()
    try:
        # Create tables
        init_db()

        # Check if already seeded
        if db.query(CropInfo).count() > 0:
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database...")

        # 1. Users with hashed passwords
        users = [
            User(username="AD-101", full_name="Nishan Admin", email="nishan@rvce.edu.in", phone_number="", password_hash=pwd_context.hash("admin123"), role="admin"),
            User(username="AD-102", full_name="Manya Admin", email="manya@rvce.edu.in", phone_number="", password_hash=pwd_context.hash("admin123"), role="admin"),
            User(username="researcher01", full_name="Research User", email="res01@rvce.edu.in", phone_number="", password_hash=pwd_context.hash("user123"), role="user"),
        ]
        db.add_all(users)
        db.commit()

        # 2. Crops
        crops = [
            CropInfo(crop_name="Rice", variety="IR64", origin_region="Coastal", description="High yielding indica variety"),
            CropInfo(crop_name="Maize", variety="NK6240", origin_region="Plains", description="Hybrid maize for commercial use"),
            CropInfo(crop_name="Wheat", variety="HD2967", origin_region="Northern", description="Drought tolerant wheat"),
            CropInfo(crop_name="Cotton", variety="BT-II", origin_region="Central", description="Pest resistant hybrid"),
        ]
        db.add_all(crops)
        db.commit()

        # 3. Traits
        rice = crops[0]
        maize = crops[1]
        traits = [
            GeneticTrait(crop_id=rice.crop_id, gene_code="SNP_001", category="Yield", trait_name="Grain Size", description="Increases grain weight"),
            GeneticTrait(crop_id=rice.crop_id, gene_code="SNP_002", category="Stress", trait_name="Salinity Tolerance", description="Helps in coastal soil"),
            GeneticTrait(crop_id=maize.crop_id, gene_code="BT_GENE_1", category="Resistance", trait_name="Bollworm Resistance", description="Intrinsic pest control"),
        ]
        db.add_all(traits)
        db.commit()

        # 4. Climate Data
        climate = [
            ClimateData(region="Coastal", temperature=28.5, humidity=80.0, rainfall=1200.0),
            ClimateData(region="Northern", temperature=22.0, humidity=45.0, rainfall=600.0),
        ]
        db.add_all(climate)
        db.commit()

        # 5. Some Predictions
        preds = [
            PredictionRecord(n=90, p=42, k=43, temperature=20.8, humidity=82.0, ph=6.5, rainfall=202.9, recommended_crop="rice", confidence=92.5),
            PredictionRecord(n=104, p=18, k=30, temperature=23.6, humidity=60.3, ph=6.7, rainfall=140.9, recommended_crop="maize", confidence=88.4),
        ]
        db.add_all(preds)
        db.commit()

        print("Seeding complete.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
