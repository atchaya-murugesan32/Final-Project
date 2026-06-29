import sys
import requests
import json
from app.database.connection import SessionLocal
from app.models.db_models import User, UserPreference
from app.auth.security import create_access_token

db = SessionLocal()
user = db.query(User).filter(User.email == "953624104022@ritrjpm.ac.in").first()

if not user:
    print("User not found")
    sys.exit()

# Set some dummy preferences
prefs = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
if not prefs:
    prefs = UserPreference(user_id=user.id)
    db.add(prefs)
prefs.wifi_required = True
prefs.charging_ports_required = True
prefs.pet_friendly = False
prefs.parking_required = False
db.commit()

token = create_access_token(user.email)

url = "http://localhost:8000/ai/chat"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

data = {
    "messages": [],
    "user_message": "Do I need to ask you about WiFi or charging ports, or do you already know what I need?"
}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(response.json())
