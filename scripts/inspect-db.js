const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'gmail_assistant.db');
const db = new Database(dbPath);

console.log('=== Tables ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log('-', t.name));

console.log('\n=== Emails ===');
const emails = db.prepare('SELECT * FROM emails').all();
console.log(JSON.stringify(emails, null, 2));

console.log('\n=== Classifications ===');
const classifications = db.prepare('SELECT * FROM classifications').all();
console.log(JSON.stringify(classifications, null, 2));

console.log('\n=== Kanban Items ===');
const kanbanItems = db.prepare('SELECT * FROM kanban_items').all();
console.log(JSON.stringify(kanbanItems, null, 2));

db.close();
