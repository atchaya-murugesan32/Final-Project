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
url = f"http://localhost:8000/dashboard/stats"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    print("Stats Status:", response.status_code)
    print("Stats Response:", response.text)
    
    response = requests.get("http://localhost:8000/dashboard/profile", headers=headers)
    print("Profile Status:", response.status_code)
    print("Profile Response:", response.text)
except Exception as e:
    print("Error:", repr(e))
