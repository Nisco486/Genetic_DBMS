from backend.app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Users table updates
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"))
            
            conn.execute(text("""
                UPDATE users 
                SET full_name = COALESCE(full_name, 'User'), 
                    password_hash = COALESCE(password_hash, '$2b$12$dummyhash')
                WHERE full_name IS NULL OR password_hash IS NULL
            """))
            print("Users table migrated.")

            # Predictions table updates
            conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS region VARCHAR(100)"))
            conn.execute(text("UPDATE predictions SET region = 'Global' WHERE region IS NULL"))
            print("Predictions table migrated (region column added).")
            
            trans.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration error: {e}")
            trans.rollback()

if __name__ == "__main__":
    migrate()
