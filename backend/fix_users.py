import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.db import SessionLocal
from app.models.models import User

def fix_users():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == None).all()
        count = 0
        for u in users:
            u.is_active = True
            count += 1
        db.commit()
        print(f"Fixed {count} users with NULL is_active")
    finally:
        db.close()

if __name__ == "__main__":
    fix_users()
