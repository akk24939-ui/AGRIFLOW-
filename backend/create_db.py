"""Create the agriflow database if it does not exist."""
import pg8000, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    conn = pg8000.connect(
        host="localhost", port=5432,
        user="postgres", password="271527",
        database="postgres"
    )
    conn.autocommit = True
    try:
        conn.run("CREATE DATABASE agriflow")
        print("OK: Database 'agriflow' created successfully!")
    except Exception as e:
        if "already exists" in str(e):
            print("INFO: Database 'agriflow' already exists -- skipping creation")
        else:
            raise
    conn.close()
    print("DB_READY")
except Exception as e:
    print(f"ERROR: Failed to connect to PostgreSQL: {e}")
    print("Make sure PostgreSQL is running and password is correct (271527)")
    sys.exit(1)
