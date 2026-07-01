import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import User, UserPreference
from app.routes.ai import ai_chat
from app.routes.ai import ChatRequest, ChatMessage

db = SessionLocal()
user = db.query(User).filter(User.email == "953624104022@ritrjpm.ac.in").first()

req = ChatRequest(
    messages=[],
    user_message="Can you recommend a cafe for me? Please confirm what preferences you are using for the recommendation."
)

response = ai_chat(req=req, current_user=user, db=db)
print(response)
