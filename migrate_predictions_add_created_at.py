from backend.app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Add created_at column to predictions table
            conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("Added created_at column to predictions table")
            
            trans.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration error: {e}")
            trans.rollback()

if __name__ == "__main__":
    migrate()
