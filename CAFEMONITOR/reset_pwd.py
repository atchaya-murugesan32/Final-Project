import sys
import os

sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

user = db.query(User).filter(User.email == "953624104022@ritrjpm.ac.in").first()
if user:
    new_hash = pwd_context.hash("246810")
    user.password_hash = new_hash
    db.commit()
    print("Password successfully reset to 246810")
else:
    print("User not found")
