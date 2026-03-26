import Database from 'better-sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

const dbPath = path.join(process.cwd(), 'gmail_assistant.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
}

export async function POST(request: Request) {
  try {
    const { messageId, from, subject, text, category, priority, reasoning, action_required } =
      await request.json();

    // Log the incoming request
    console.log('📨 Classification Request Received:');
    console.log('  messageId:', messageId);
    console.log('  category:', category);
    console.log('  priority:', priority);
    console.log('  reasoning:', reasoning);
    console.log('  action_required:', action_required);
    console.log('  action_required type:', typeof action_required);

    if (!messageId || !category || priority === undefined || !reasoning) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if email exists
    let emailId = (
      db.prepare('SELECT id FROM emails WHERE gmail_id = ?').get(messageId) as any
    )?.id;

    // If email doesn't exist, create it
    if (!emailId) {
      try {
        const result = db.prepare(`
          INSERT INTO emails (gmail_id, sender, subject, text, received_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `).run(messageId, from || 'unknown', subject || 'No subject', text || '');

        emailId = result.lastInsertRowid as number;

        // Create kanban_item
        db.prepare(`
          INSERT INTO kanban_items (email_id, status)
          VALUES (?, 'to_do')
        `).run(emailId);
      } catch (dbError) {
        console.error('DB Insert Error:', dbError);
        throw dbError;
      }
    }

    // Upsert classification
    const existing = db.prepare('SELECT id FROM classifications WHERE email_id = ?').get(emailId);

    if (existing) {
      console.log('🔄 Updating existing classification...');
      db.prepare(`
        UPDATE classifications 
        SET category = ?, priority = ?, reasoning = ?, action_required = ?
        WHERE email_id = ?
      `).run(category, priority, reasoning, action_required || null, emailId);
      console.log('✅ Classification updated with action_required:', action_required || null);
    } else {
      console.log('➕ Creating new classification...');
      db.prepare(`
        INSERT INTO classifications (email_id, category, priority, reasoning, action_required)
        VALUES (?, ?, ?, ?, ?)
      `).run(emailId, category, priority, reasoning, action_required || null);
      console.log('✅ Classification created with action_required:', action_required || null);
    }

    db.close();

    return NextResponse.json({ success: true, emailId });
  } catch (error) {
    console.error('Classification API Error:', error);
    return NextResponse.json(
      { error: 'Failed to classify email', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
