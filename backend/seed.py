"""
AgriFlow -- One-Time Database Seeder
Run once: python seed.py
Credentials: admin / 271527
"""
import uuid, sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from app.database.db import SessionLocal, engine, Base
from app.models.models import User, Land, Task
from app.core.security import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("\nAgriFlow Enterprise -- Database Seeder")
        print("=" * 45)

        # SUPER ADMIN
        if db.query(User).filter(User.username == "admin").first():
            print("Super Admin already exists -- skipping")
        else:
            admin = User(
                id=uuid.uuid4(),
                full_name="Super Admin",
                username="admin",
                email="admin@agriflow.in",
                phone="9000000000",
                password_hash=hash_password("271527"),
                role="SUPER_ADMIN",
                is_active=True,
                created_by="system",
            )
            db.add(admin)
            db.commit()
            print("Super Admin created")
            print("  username : admin")
            print("  password : 271527")
            print("  role     : SUPER_ADMIN")

        # Sample Lands
        sample_lands = [
            {"land_id": "TN-CH-001",  "land_name": "Panimugil Estate",     "district": "Chennai",    "village": "Ambattur"},
            {"land_id": "TN-MDU-101", "land_name": "Kaveri Delta Farm",    "district": "Madurai",    "village": "Usilampatti"},
            {"land_id": "TN-TJ-202",  "land_name": "Sundaram Paddy Fields","district": "Thanjavur",  "village": "Papanasam"},
            {"land_id": "TN-CBE-303", "land_name": "Cauvery Green Acres",  "district": "Coimbatore", "village": "Mettupalayam"},
        ]
        for sl in sample_lands:
            if not db.query(Land).filter(Land.land_id == sl["land_id"]).first():
                db.add(Land(id=uuid.uuid4(), **sl))
                print(f"Land {sl['land_id']} -- {sl['land_name']}")
        db.commit()

        # Sample Users
        sample_users = [
            {"full_name": "Panimugil Rajan",    "username": "pani_raj",  "email": "pani@agriflow.in",    "phone": "9876543210", "role": "OWNER",    "land_id": "TN-CH-001"},
            {"full_name": "Kavitha Murugan",     "username": "kavitha_m", "email": "kavitha@agriflow.in", "phone": "9123456780", "role": "AGENT",    "land_id": "TN-CH-001"},
            {"full_name": "Selvam Chidambaram",  "username": "selvam_c",  "email": "selvam@agriflow.in",  "phone": "9988776655", "role": "CUSTOMER", "land_id": "TN-MDU-101"},
            {"full_name": "Meena Sundaram",      "username": "meena_s",   "email": "meena@agriflow.in",   "phone": "9876501234", "role": "AGENT",    "land_id": "TN-TJ-202"},
            {"full_name": "Arjun Krishnamurthy", "username": "arjun_k",   "email": "arjun@agriflow.in",   "phone": "9765432108", "role": "OWNER",    "land_id": "TN-MDU-101"},
            {"full_name": "Priya Venkataraman",  "username": "priya_v",   "email": "priya@agriflow.in",   "phone": "9551234567", "role": "ADMIN",    "land_id": None},
        ]
        for su in sample_users:
            if not db.query(User).filter(User.username == su["username"]).first():
                db.add(User(
                    id=uuid.uuid4(),
                    password_hash=hash_password("User@1234"),
                    is_active=True,
                    created_by="admin",
                    **su,
                ))
                print(f"User {su['username']:15s}  role={su['role']}")
        db.commit()

        print("\nSeeding complete!")
        print("-" * 45)
        print("  Admin     -> admin / 271527")
        print("  All users -> <username> / User@1234")
        print("-" * 45)

    finally:
        db.close()

if __name__ == "__main__":
    seed()
