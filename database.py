import os
from pathlib import Path
from sqlcipher3 import dbapi2 as sqlite
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'database' / 'mssp.db'

def get_db_key():
    key = os.getenv('DB_ENCRYPTION_KEY')
    if not key:
        raise RuntimeError('DB_ENCRYPTION_KEY must be set before opening the encrypted database.')
    return key

def quote_sqlcipher_key(key):
    return key.replace("'", "''")

def get_db():
    conn = sqlite.connect(str(DB_PATH))
    conn.execute(f"PRAGMA key = '{quote_sqlcipher_key(get_db_key())}'")
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

def init_db():
    conn = get_db()
    with open(BASE_DIR / 'database' / 'schema.sql', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print('Database initialized successfully.')

if __name__ == '__main__':
    init_db()
