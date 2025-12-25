"""
Migration script to add new columns to users table
"""
from backend.app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            # Add full_name column
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100)"))
            print("Added full_name column")
            
            # Add phone_number column
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)"))
            print("Added phone_number column")
            
            # Add password_hash column
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"))
            print("Added password_hash column")
            
            # Update existing users with default values
            conn.execute(text("""
                UPDATE users 
                SET full_name = COALESCE(full_name, 'User'), 
                    phone_number = COALESCE(phone_number, ''),
                    password_hash = COALESCE(password_hash, '$2b$12$dummyhash')
                WHERE full_name IS NULL OR phone_number IS NULL OR password_hash IS NULL
            """))
            print("Updated existing users with default values")
            
            conn.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration error: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
