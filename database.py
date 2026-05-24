import os
from sqlcipher3 import dbapi2 as sqlite
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), 'database/mssp.db')
DB_KEY = os.getenv('DB_ENCRYPTION_KEY')

def get_db():
    conn = sqlite.connect(DB_PATH)
    conn.execute(f"PRAGMA key='{DB_KEY}'")
    return conn

def init_db():
    conn = get_db()
    with open(os.path.join(os.path.dirname(__file__), 'database/schema.sql')) as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print('Database initialized successfully.')

if __name__ == '__main__':
    init_db()
