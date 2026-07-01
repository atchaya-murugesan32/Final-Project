import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import User
import requests
from app.auth.security import create_access_token

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No user")
    sys.exit()

token = create_access_token(user.email)
url = f"http://localhost:8000/dashboard/notifications"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    print("GET Status:", response.status_code)
    print("GET Response:", response.text)
    
    data = {
        "notify_crowd": False,
        "notify_reservation": True,
        "notify_ai_updates": False
    }
    response = requests.put(url, headers=headers, json=data)
    print("PUT Status:", response.status_code)
    print("PUT Response:", response.text)
except Exception as e:
    print("Error:", repr(e))
