const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'gmail_assistant.db');
const db = new Database(dbPath);

try {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8');
  db.exec(schema);
  
  console.log('✅ Database initialized successfully!');
  console.log('✅ Database path:', dbPath);
  console.log('\nTables created:');
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  tables.forEach(t => console.log('  ✓', t.name));
  
  console.log('\nIndexes created:');
  const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'").all();
  indexes.forEach(i => console.log('  ✓', i.name));
  
  db.close();
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
  process.exit(1);
}
