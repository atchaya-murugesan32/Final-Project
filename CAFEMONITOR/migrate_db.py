import sys
import sqlite3

sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")

from app.database.connection import engine, Base
import app.models.db_models

# Add new columns to users table
try:
    conn = sqlite3.connect("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR\\test.db")
    cursor = conn.cursor()
    
    # Try adding columns one by one
    columns = [
        "ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500);",
        "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
        "ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN last_login DATETIME;",
        "ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'Active';"
    ]
    
    for query in columns:
        try:
            cursor.execute(query)
            print(f"Executed: {query}")
        except sqlite3.OperationalError as e:
            print(f"Skipped {query}: {e}")
            
    conn.commit()
    conn.close()
    
except Exception as e:
    print(f"Error altering users table: {e}")

# Create new tables
Base.metadata.create_all(bind=engine)
print("DB Schema updated successfully.")
