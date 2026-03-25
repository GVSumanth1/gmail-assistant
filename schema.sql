CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gmail_id TEXT UNIQUE NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  snippet TEXT,
  received_at DATETIME,
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER NOT NULL UNIQUE,
  category TEXT NOT NULL,
  priority INTEGER CHECK(priority BETWEEN 1 AND 5),
  reasoning TEXT,
  action_required TEXT,
  classified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kanban_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER NOT NULL UNIQUE,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'classified', 'in_progress', 'done')),
  user_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gmail_id ON emails(gmail_id);
CREATE INDEX IF NOT EXISTS idx_email_status ON kanban_items(status);
CREATE INDEX IF NOT EXISTS idx_category ON classifications(category);
