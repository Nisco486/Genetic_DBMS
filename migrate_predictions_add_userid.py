from backend.app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Add user_id column to predictions table
            conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS user_id INTEGER"))
            conn.execute(text("ALTER TABLE predictions ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id)"))
            print("Added user_id column and FK constraint to predictions table")
            
            trans.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration error: {e}")
            trans.rollback()

if __name__ == "__main__":
    migrate()
