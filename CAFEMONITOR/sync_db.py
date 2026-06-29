import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")

from app.database.connection import engine, Base
import app.models.db_models

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done.")