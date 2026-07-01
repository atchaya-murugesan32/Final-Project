import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")

from app.database.connection import SessionLocal
from app.auth.security import create_access_token
from app.auth.dependencies import get_current_user
from app.models.db_models import User

db = SessionLocal()
# Create a dummy user if not exists
user = db.query(User).filter(User.email == "test@test.com").first()
if not user:
    user = User(name="Test", email="test@test.com", password_hash="test")
    db.add(user)
    db.commit()

token = create_access_token("test@test.com")
print("Token:", token)

try:
    user = get_current_user(token=token, db=db)
    print("User found:", user.email)
except Exception as e:
    print("Error:", repr(e))
