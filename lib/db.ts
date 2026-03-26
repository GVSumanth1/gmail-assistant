import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'gmail_assistant.db');
let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export type Email = {
  id: number;
  gmail_id: string;
  sender: string;
  subject: string;
  text?: string;
  category?: string;
  priority?: number;
  reasoning?: string;
  action_required?: string;
  status: 'to_do' | 'in_progress' | 'done';
};

export function getAllEmails(): Email[] {
  const db = getDb();
  return db.prepare(`
    SELECT 
      e.id, e.gmail_id, e.sender, e.subject, e.text,
      c.category, c.priority, c.reasoning, c.action_required,
      k.status
    FROM emails e
    LEFT JOIN classifications c ON e.id = c.email_id
    LEFT JOIN kanban_items k ON e.id = k.email_id
    ORDER BY e.received_at DESC
  `).all() as Email[];
}

export function updateEmailStatus(emailId: number, status: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE kanban_items 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE email_id = ?
  `).run(status, emailId);
  return result.changes > 0;
}

export function getEmailStats() {
  const db = getDb();
  return db.prepare(`
    SELECT 
      k.status,
      COUNT(*) as count,
      ROUND(AVG(COALESCE(c.priority, 0)), 2) as avg_priority
    FROM kanban_items k
    LEFT JOIN classifications c ON k.email_id = c.email_id
    GROUP BY k.status
  `).all();
}

export function deleteEmail(emailId: number): boolean {
  const db = getDb();
  try {
    // Delete from kanban_items first (foreign key)
    db.prepare('DELETE FROM kanban_items WHERE email_id = ?').run(emailId);
    // Delete from classifications
    db.prepare('DELETE FROM classifications WHERE email_id = ?').run(emailId);
    // Delete from emails
    const result = db.prepare('DELETE FROM emails WHERE id = ?').run(emailId);
    return result.changes > 0;
  } catch (err) {
    console.error('Delete error:', err);
    return false;
  }
}
