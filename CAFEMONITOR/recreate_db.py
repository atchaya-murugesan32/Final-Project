import os
from app.database.connection import engine, Base
import app.models.db_models

if __name__ == "__main__":
    db_file = "cafemonitor.db"
    print("Recreating database schema...")
    if os.path.exists(db_file):
        print(f"Removing {db_file}...")
        os.remove(db_file)
        
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database recreated successfully!")
