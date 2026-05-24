import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database.db import SessionLocal
from app.models.models import User
from app.core.security import hash_password
import uuid

def create_customer():
    db = SessionLocal()
    try:
        # Check if customer exists
        existing = db.query(User).filter(User.username == "ravi_customer").first()
        if not existing:
            customer = User(
                id=uuid.uuid4(),
                username="ravi_customer",
                email="ravi@customer.com",
                full_name="Ravi Landowner",
                password_hash=hash_password("password123"),
                role="CUSTOMER",
                is_active=True
            )
            db.add(customer)
            db.commit()
            print("Customer ravi_customer / password123 created successfully.")
        else:
            print("Customer already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    create_customer()
