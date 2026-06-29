import sys
import os

sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()
users = db.query(User).all()
print("Total users:", len(users))

for u in users:
    print(f"ID: {u.id}, Email: {u.email}, Password Hash: {u.password_hash}")
    if u.email == "953624104022@ritrjpm.ac.in":
        is_valid = pwd_context.verify("246810", u.password_hash)
        print(f"Password '246810' matches hash for {u.email}? {is_valid}")
