import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import User
db = SessionLocal()
users = db.query(User).all()
print("Users in DB:")
for u in users:
    print(f"- ID: {u.id}, Email: {u.email}")
