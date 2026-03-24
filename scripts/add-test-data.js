const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'gmail_assistant.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const testEmails = [
  {
    gmail_id: 'test_1_abc123',
    sender: 'john.doe@example.com',
    subject: 'Q4 Budget Review Meeting',
    body: 'Hi, please review the attached Q4 budget proposal. Need approval by Friday.',
    snippet: 'Hi, please review the attached Q4 budget proposal...',
    status: 'new',
    category: 'work',
    priority: 5,
  },
  {
    gmail_id: 'test_2_def456',
    sender: 'support@github.com',
    subject: 'Security Alert: New sign-in from Windows',
    body: 'A new sign-in to your GitHub account was detected from Windows.',
    snippet: 'A new sign-in to your GitHub account was detected...',
    status: 'new',
    category: 'security',
    priority: 4,
  },
  {
    gmail_id: 'test_3_ghi789',
    sender: 'team@asana.com',
    subject: 'You were assigned to: Complete Phase 3 UI',
    body: 'You have been assigned a new task in Asana project.',
    snippet: 'You have been assigned a new task in Asana...',
    status: 'classified',
    category: 'task',
    priority: 4,
  },
  {
    gmail_id: 'test_4_jkl012',
    sender: 'newsletter@techcrunch.com',
    subject: 'Weekly Tech Digest: AI Breakthroughs',
    body: 'This week in tech: major AI model releases and industry updates.',
    snippet: 'This week in tech: major AI model releases...',
    status: 'classified',
    category: 'news',
    priority: 2,
  },
  {
    gmail_id: 'test_5_mno345',
    sender: 'boss@company.com',
    subject: 'Project Status Update Required',
    body: 'Please provide a status update on the Gmail Assistant project by EOD today.',
    snippet: 'Please provide a status update on the Gmail Assistant...',
    status: 'in_progress',
    category: 'work',
    priority: 5,
  },
  {
    gmail_id: 'test_6_pqr678',
    sender: 'system@aws.amazon.com',
    subject: 'AWS Billing Alert',
    body: 'Your AWS usage this month has exceeded your budgeted amount.',
    snippet: 'Your AWS usage this month has exceeded...',
    status: 'in_progress',
    category: 'alert',
    priority: 3,
  },
  {
    gmail_id: 'test_7_stu901',
    sender: 'feedback@slack.com',
    subject: 'Your Slack Workspace is ready to upgrade',
    body: 'Upgrade to Slack Pro for advanced features and better team collaboration.',
    snippet: 'Upgrade to Slack Pro for advanced features...',
    status: 'done',
    category: 'marketing',
    priority: 1,
  },
];

try {
  // Insert test emails with classifications and kanban items
  const insertEmail = db.prepare(`
    INSERT INTO emails (gmail_id, sender, subject, body, snippet, received_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  const insertClassification = db.prepare(`
    INSERT INTO classifications (email_id, category, priority, reasoning)
    VALUES (?, ?, ?, ?)
  `);

  const insertKanbanItem = db.prepare(`
    INSERT INTO kanban_items (email_id, status, user_notes)
    VALUES (?, ?, ?)
  `);

  testEmails.forEach((email) => {
    const { status, category, priority, ...emailData } = email;

    // Insert email
    const emailResult = insertEmail.run(
      emailData.gmail_id,
      emailData.sender,
      emailData.subject,
      emailData.body,
      emailData.snippet
    );

    const emailId = emailResult.lastInsertRowid;

    // Insert classification
    insertClassification.run(
      emailId,
      category,
      priority,
      `Auto-classified as ${category} with priority ${priority}`
    );

    // Insert kanban item
    insertKanbanItem.run(emailId, status, null);
  });

  console.log('✅ Successfully added 7 test emails!');
  console.log('📊 Database stats:');
  
  const emailCount = db.prepare('SELECT COUNT(*) as count FROM emails').get();
  const classificationCount = db.prepare('SELECT COUNT(*) as count FROM classifications').get();
  const kanbanCount = db.prepare('SELECT COUNT(*) as count FROM kanban_items').get();
  
  console.log(`   - Emails: ${emailCount.count}`);
  console.log(`   - Classifications: ${classificationCount.count}`);
  console.log(`   - Kanban Items: ${kanbanCount.count}`);
  
  console.log('\n🔄 Refresh your browser at http://localhost:3000 to see the test data!');
} catch (error) {
  console.error('❌ Error adding test data:', error.message);
  process.exit(1);
} finally {
  db.close();
}
