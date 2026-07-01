from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.db_models import User
from app.models.request_models import ChatRequest
from app.services.ai_chat import generate_chat_response

router = APIRouter()

@router.post("/chat")
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        response_text = generate_chat_response(request.message, current_user.id, db)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
