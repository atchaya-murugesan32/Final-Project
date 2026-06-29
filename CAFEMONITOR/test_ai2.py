import os
import sys

# Add the project root to sys.path so we can import from app
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")

from app.services.ai_chat import get_gemini_model

try:
    model = get_gemini_model()
    
    valid_history = []
    
    chat = model.start_chat(history=valid_history)
    response = chat.send_message("cafe in chennai")
    print("SUCCESS:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")