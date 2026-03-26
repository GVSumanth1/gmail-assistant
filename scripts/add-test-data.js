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
    text: 'Hi, please review the attached Q4 budget proposal. Need approval by Friday.',
    status: 'to_do',
    category: 'URGENT_DECISION',
    priority: 5,
    reasoning: 'Contains budget approval request with tight deadline (Friday). Requires immediate executive decision.',
    action_required: 'Approve Q4 budget by Friday',
  },
  {
    gmail_id: 'test_2_def456',
    sender: 'support@github.com',
    subject: 'Security Alert: New sign-in from Windows',
    text: 'A new sign-in to your GitHub account was detected from Windows.',
    status: 'to_do',
    category: 'CUSTOMER_REQUEST',
    priority: 4,
    reasoning: 'Security-related notification from trusted service. Requires verification of valid sign-in.',
    action_required: 'Review security sign-in',
  },
  {
    gmail_id: 'test_3_ghi789',
    sender: 'team@asana.com',
    subject: 'You were assigned to: Complete Phase 3 UI',
    text: 'You have been assigned a new task in Asana project.',
    status: 'in_progress',
    category: 'FOLLOW_UP',
    priority: 4,
    reasoning: 'Task assignment notification. Work is already underway in development sprint.',
    action_required: 'Complete Phase 3 UI development',
  },
  {
    gmail_id: 'test_4_jkl012',
    sender: 'newsletter@techcrunch.com',
    subject: 'Weekly Tech Digest: AI Breakthroughs',
    text: 'This week in tech: major AI model releases and industry updates.',
    status: 'to_do',
    category: 'INTERNAL_UPDATE',
    priority: 2,
    reasoning: 'Informational digest for general knowledge. No immediate action required.',
    action_required: null,
  },
  {
    gmail_id: 'test_5_mno345',
    sender: 'boss@company.com',
    subject: 'Project Status Update Required',
    text: 'Please provide a status update on the Gmail Assistant project by EOD today.',
    status: 'in_progress',
    category: 'URGENT_DECISION',
    priority: 5,
    reasoning: 'Direct request from leadership with same-day deadline. High visibility project status.',
    action_required: 'Send project status update to boss',
  },
  {
    gmail_id: 'test_6_pqr678',
    sender: 'system@aws.amazon.com',
    subject: 'AWS Billing Alert',
    text: 'Your AWS usage this month has exceeded your budgeted amount.',
    status: 'in_progress',
    category: 'INVOICE',
    priority: 3,
    reasoning: 'Cost management issue. Budget exceeded requires review and adjustment of infrastructure.',
    action_required: 'Review AWS spending and adjust budget',
  },
  {
    gmail_id: 'test_7_stu901',
    sender: 'feedback@slack.com',
    subject: 'Your Slack Workspace is ready to upgrade',
    text: 'Upgrade to Slack Pro for advanced features and better team collaboration.',
    status: 'done',
    category: 'LOW_PRIORITY',
    priority: 1,
    reasoning: 'Optional upgrade notification. Already reviewed and archived.',
    action_required: null,
  },
];

try {
  // Insert test emails with classifications and kanban items
  const insertEmail = db.prepare(`
    INSERT INTO emails (gmail_id, sender, subject, text, received_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  const insertClassification = db.prepare(`
    INSERT INTO classifications (email_id, category, priority, reasoning, action_required)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertKanbanItem = db.prepare(`
    INSERT INTO kanban_items (email_id, status, user_notes)
    VALUES (?, ?, ?)
  `);

  testEmails.forEach((email) => {
    // Destructure email data
    const { status, category, priority, reasoning, action_required, ...emailData } = email;

    // Insert email
    const emailResult = insertEmail.run(
      emailData.gmail_id,
      emailData.sender,
      emailData.subject,
      emailData.text
    );

    const emailId = emailResult.lastInsertRowid;

    // Insert classification
    insertClassification.run(
      emailId,
      category,
      priority,
      reasoning,
      action_required
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
