-- MSSP Database Schema
-- Structure only — actual .db file is gitignored

CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    plan TEXT,
    retainer INTEGER,
    users INTEGER,
    industry TEXT,
    health INTEGER DEFAULT 100,
    status TEXT DEFAULT 'healthy',
    billing_status TEXT DEFAULT 'paid',
    next_due TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    client_id TEXT,
    priority TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT,
    title TEXT,
    date TEXT,
    severity TEXT,
    status TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
