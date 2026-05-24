"""
Migration: Add priority, category, notes, start_date columns to tasks table.
Safe to re-run -- checks if columns exist before adding.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.db import engine
from sqlalchemy import text

COLUMNS = [
    ("priority",   "VARCHAR(50) DEFAULT 'MEDIUM'"),
    ("category",   "VARCHAR(100)"),
    ("notes",      "TEXT"),
    ("start_date", "TIMESTAMP WITH TIME ZONE"),
]

with engine.connect() as conn:
    for col_name, col_type in COLUMNS:
        try:
            conn.execute(text(f"ALTER TABLE tasks ADD COLUMN {col_name} {col_type}"))
            conn.commit()
            print(f"  [OK] Added column: tasks.{col_name}")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                print(f"  [SKIP] Column tasks.{col_name} already exists")
            else:
                print(f"  [ERROR] tasks.{col_name}: {e}")

print("\nMigration complete!")
