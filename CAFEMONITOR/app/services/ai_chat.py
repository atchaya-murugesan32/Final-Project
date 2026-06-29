import google.generativeai as genai
from sqlalchemy.orm import Session
from app.models.db_models import FavoriteCafe, UserPreference, AIHistory
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_chat_response(message: str, user_id: int, db: Session) -> str:
    favorites = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == user_id).all()
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    
    context = ""
    
    pref_str = []
    if prefs:
        if prefs.primary_purpose and prefs.primary_purpose != "Any":
            pref_str.append(f"purpose: {prefs.primary_purpose}")
        if prefs.budget_range and prefs.budget_range != "Any":
            pref_str.append(f"budget: {prefs.budget_range}")
        if prefs.preferred_occupancy and prefs.preferred_occupancy != "Any":
            pref_str.append(f"occupancy: {prefs.preferred_occupancy}")
        if prefs.wifi_required:
            pref_str.append("needs wifi")
    
    if pref_str:
        context += f"The user's saved preferences are: {', '.join(pref_str)}. "
        
    if favorites:
        fav_names = ", ".join([f.cafe_name for f in favorites])
        context += f"The user has favorited the following cafes: {fav_names}. Please use this to give personalized recommendations. "
    
    # Save to AI History
    history_entry = AIHistory(user_id=user_id, query=message)
    db.add(history_entry)
    db.commit()

    if not api_key:
        mock_msg = f"[MOCK AI RESPONSE]\nYou asked: '{message}'\n\nTo get a real AI answer, please add your GEMINI_API_KEY to the .env file! "
        if context:
            mock_msg += f"\n(Also, I noticed your saved preferences are: {context})"
        else:
            mock_msg += "\n(Also, you haven't set any specific preferences or favorites in your account yet.)"
        return mock_msg

    prompt = f"You are a helpful Cafe assistant named ZenBrew AI. {context}\nUser: {message}\nAI:"
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        mock_msg = f"[MOCK AI RESPONSE]\nYou asked: '{message}'\n\nTo get a real AI answer, please add your GEMINI_API_KEY to the .env file! "
        if context:
            mock_msg += f"\n(Also, I noticed your saved preferences are: {context})"
        else:
            mock_msg += "\n(Also, you haven't set any specific preferences or favorites in your account yet.)"
        return mock_msg
