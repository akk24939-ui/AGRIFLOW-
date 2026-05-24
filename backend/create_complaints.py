import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database.db import engine, Base
from app.models.models import Complaint, ComplaintMessage

def create_complaints():
    Base.metadata.create_all(bind=engine, tables=[Complaint.__table__, ComplaintMessage.__table__])
    print("Complaints tables created successfully.")

if __name__ == "__main__":
    create_complaints()
