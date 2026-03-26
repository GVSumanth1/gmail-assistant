# Gmail Assistant

A full-stack email classification and workflow management system that intelligently categorizes Gmail messages and organizes them into a Kanban board using AI-powered analysis.

## Overview

Gmail Assistant combines **n8n** (workflow automation) with **Next.js** (frontend) and **SQLite** (database) to create an intelligent email management system. Emails are automatically fetched from Gmail, classified by an LLM AI agent, and displayed in an interactive Kanban board where you can organize them by workflow status.

**Key Features:**
- Automatic Gmail integration via n8n
- AI-powered email classification (category, priority, actions)
- Drag-and-drop Kanban board interface
- Persistent storage of emails and classifications
- Color-coded priority levels and categories
- Real-time updates every 10 seconds

---

## Architecture

### Tech Stack
```
n8n Cloud/Self-Hosted
    ↓
Gmail Trigger (fetches new emails)
    ↓
Gemini/Claude LLM (classifies emails)
    ↓
HTTP POST → Next.js API
    ↓
SQLite Database ← → Next.js Frontend (React + Tailwind)
                        ↓
                   Kanban Board UI
```

### Components
- **n8n**: Orchestrates Gmail integration and LLM classification
- **Next.js 16**: Backend API + Frontend SPA
- **SQLite**: Persistent data storage with better-sqlite3
- **React 19**: Interactive Kanban board with drag-drop
- **dnd-kit**: Lightweight drag-drop library
- **Tailwind CSS**: Styling

---

## N8N Workflow

The Gmail Assistant uses an n8n workflow to automate email ingestion and classification.

### Workflow Steps

#### 1. **Gmail Trigger** (Polling/Webhook)
```
- Listens for new emails in Gmail inbox
- Extracts: from, subject, body/text
- Runs periodically (e.g., every 5-10 minutes)
```

#### 2. **Data Transformation** (Optional)
```
- Formats email data into clean JSON
- Prepares text for LLM classification
```

#### 3. **LLM Classification** (Gemini/Claude/Mistral)
```
Sends prompt to AI:
  "Analyze this email and classify it"
  
AI returns JSON:
  {
    "category": "work",
    "priority": 4,
    "action_required": "Approve budget by Friday",
    "reasoning": "Urgent financial approval needed"
  }
```

#### 4. **HTTP POST to Backend**
```
POST /api/emails/classify
{
  "messageId": "gmail_id_123",
  "from": "boss@company.com",
  "subject": "Q4 Budget Approval",
  "text": "Please approve the Q4 budget...",
  "category": "work",
  "priority": 4,
  "action_required": "Approve budget by Friday",
  "reasoning": "Urgent financial approval needed"
}
```

#### 5. **Database Storage**
```
[OK] Inserted into emails table + classifications table
[OK] Kanban item created with status: "to_do"
[OK] Frontend polls and displays new email
```

### N8N Setup

**To connect n8n to this app:**

1. **Create Gmail Trigger in n8n:**
   - Add "Gmail" trigger node
   - Authenticate with your Gmail account
   - Set to "New Email" mode

2. **Add LLM Node:**
   - Choose: Gemini, OpenAI, Claude, etc.
   - Input the email data
   - Prompt: Use the system prompt below

3. **Add HTTP Request Node:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/emails/classify` (or your deployed URL)
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "messageId": "{{ $node['Gmail'].json.id }}",
       "from": "{{ $node['Gmail'].json.from.text }}",
       "subject": "{{ $node['Gmail'].json.subject }}",
       "text": "{{ $node['Gmail'].json.text }}",
       "category": "{{ $node['LLM'].json.category }}",
       "priority": "{{ $node['LLM'].json.priority }}",
       "action_required": "{{ $node['LLM'].json.action_required }}",
       "reasoning": "{{ $node['LLM'].json.reasoning }}"
     }
     ```

4. **LLM System Prompt:**
   ```
   You are an intelligent email assistant. For each email you receive, analyze 
   and classify it with:
   
   - category: one of [work, security, task, news, alert, marketing]
   - priority: number 1-5 (5 = urgent, 1 = low priority)
   - action_required: brief description (max 50 chars) or null if no action needed
   - reasoning: brief explanation of classification (max 100 chars)
   
   Return ONLY valid JSON with no markdown, no code blocks, no additional text.
   
   Example:
   {
     "category": "work",
     "priority": 5,
     "action_required": "Approve Q4 budget by Friday",
     "reasoning": "Urgent financial approval needed"
   }
   ```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3
- n8n (Cloud or Self-Hosted)
- Gmail account

### 1. Clone Repository
```bash
git clone https://github.com/GVSumanth1/gmail-assistant.git
cd gmail_assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database
```bash
node scripts/init-db.js
node scripts/add-test-data.js  # Optional: Add 7 test emails
```

### 4. Configure Environment
Create `.env.local`:
```env
# n8n webhook endpoint (optional)
N8N_WEBHOOK_URL=http://n8n-instance/webhook/...

# Not needed for local development, but useful for deployment
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the app.

### 6. Production Build
```bash
npm run build
npm start
```

---

## How to Use

### 1. **Access the Kanban Board**
Open `http://localhost:3000` in your browser.

### 2. **View Your Emails**
The Kanban board displays three columns:
- **To Do** - New emails requiring attention
- **In Progress** - Emails you're currently working on
- **Done** - Completed/archived emails

### 3. **Drag Emails Between Columns**
- Click and drag any email card to move it between columns
- Status is automatically saved to the database
- Drag-drop uses collision detection for smooth UX

### 4. **Monitor n8n Integration**
Once emails arrive via n8n and are classified:
- They appear automatically in the "To Do" column
- Refresh rate: every 10 seconds

### 5. **Read Full Email**
Each card shows:
- **Subject** (main heading)
- **Type/Priority** (category and priority badge)
- **From** (sender username)
- **Analysis** (AI reasoning - truncated)
- **Action Required** (brief action or blank)

---

## Understanding the Kanban Card

Each email card displays key information in a structured layout:

```
┌─────────────────────────────────────┐
│  Email Subject (Prominent)          │
├─────────────────────────────────────┤
│ Type: WORK    Priority: P4          │
├─────────────────────────────────────┤
│ From: boss@company.com              │
├─────────────────────────────────────┤
│ Analysis: Urgent financial...       │
│           (truncated to 2 lines)   │
├─────────────────────────────────────┤
│ [!] Action Required:                │
│   Approve budget by Friday          │
└─────────────────────────────────────┘
```

### Card Elements Explained

| Element | Meaning | Example |
|---------|---------|---------|
| **Subject** | Email subject line (what it's about) | "Q4 Budget Approval" |
| **Type** | Email category (work/marketing/task/etc) | "Type: WORK" |
| **Priority** | Urgency level P1-P5 (P5 = most urgent) | "Priority: P4" |
| **From** | Sender's email username | "From: boss" |
| **Analysis** | AI's reasoning for classification | "Urgent financial approval" |
| **Action Required** | What you need to do (or blank) | "Approve budget by Friday" |

### Color Coding

**Priority Colors (P1-P5):**
- **P1** = Blue (Low priority)
- **P2** = Green
- **P3** = Yellow
- **P4** = Orange
- **P5** = Red (Urgent)

**Card backgrounds use priority colors** to quickly identify urgent emails at a glance.

---

## AI Classification System

### What the AI Agent Does

The AI agent (LLM) analyzes each email and assigns:

#### 1. **Category** (Type of Email)
```
- work       → Business/job-related
- security   → Security alerts or warnings
- task       → Action items or to-dos
- news       → Newsletters or news updates
- alert      → System alerts or notifications
- marketing  → Promotions or marketing emails
```

#### 2. **Priority** (Urgency Level 1-5)
```
5 → URGENT   - Requires immediate action
4 → HIGH     - Important, should handle soon
3 → NORMAL   - Regular, handle when available
2 → LOW      - Non-urgent background items
1 → MINIMAL  - Can defer indefinitely
```

#### 3. **Action Required** (What to Do)
- **If action needed:** Brief description (max 50 characters)
  - Examples: "Approve budget by Friday", "Update password", "Call client"
- **If no action:** `null` (informational only)

#### 4. **Reasoning** (Why This Classification)
- AI's explanation for the classification (max 100 characters)
- Examples: "Urgent financial approval needed", "System security alert"

### Classification Example

**Email:**
```
From: boss@company.com
Subject: Q4 Budget Approval Needed
Body: Please review and approve the Q4 budget spreadsheet 
      attached. Need approval by Friday EOD.
```

**AI Classification:**
```json
{
  "category": "work",
  "priority": 4,
  "action_required": "Approve Q4 budget by Friday",
  "reasoning": "Urgent financial decision with deadline"
}
```

**Result:** Card appears in "To Do" with P4 (orange) background, action highlighted.

---

## Database Schema

### Tables

#### emails
```sql
id              INTEGER PRIMARY KEY
gmail_id        TEXT UNIQUE           -- Gmail message ID
sender          TEXT                  -- Sender email address
subject         TEXT                  -- Email subject
text            TEXT                  -- Email body/content
received_at     TIMESTAMP             -- When email was received
fetched_at      TIMESTAMP             -- When app fetched it
```

#### classifications
```sql
email_id        INTEGER PRIMARY KEY FOREIGN KEY
category        TEXT                  -- work|security|task|news|alert|marketing
priority        INTEGER 1-5           -- Urgency level
reasoning       TEXT                  -- AI's explanation
action_required TEXT                  -- Action to take (or NULL)
```

#### kanban_items
```sql
email_id        INTEGER PRIMARY KEY FOREIGN KEY
status          TEXT CHECK            -- to_do|in_progress|done
user_notes      TEXT                  -- Optional user notes
```

---

## API Reference

### GET /api/emails
**Returns all emails with classifications and status**

Response:
```json
[
  {
    "id": 1,
    "gmail_id": "msg_123",
    "sender": "boss@company.com",
    "subject": "Q4 Budget Approval",
    "text": "Please review and approve...",
    "category": "work",
    "priority": 4,
    "reasoning": "Urgent approval",
    "action_required": "Approve by Friday",
    "status": "to_do"
  }
]
```

### PATCH /api/emails/[id]
**Update email status (move between columns)**

Request:
```json
{
  "status": "in_progress"  // or "to_do", "done"
}
```

Response:
```json
{
  "success": true,
  "emailId": 1,
  "status": "in_progress"
}
```

### POST /api/emails/classify
**n8n webhook - Insert/update classified email**

Request:
```json
{
  "messageId": "gmail_id_123",
  "from": "boss@company.com",
  "subject": "Q4 Budget",
  "text": "Please review...",
  "category": "work",
  "priority": 4,
  "action_required": "Approve by Friday",
  "reasoning": "Urgent approval"
}
```

Response:
```json
{
  "success": true
}
```

---

## Test Data

Run this to seed the database with 7 test emails for demonstration:

```bash
node scripts/add-test-data.js
```

Test emails include various categories and priorities to showcase the system.

---

## Deployment

### Option 1: Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

### Option 2: Traditional Node Server
```bash
npm run build
npm start
```

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Troubleshooting

### Emails not appearing
- Check n8n workflow is running
- Verify webhook URL is correct in n8n
- Check database: `sqlite3 gmail_assistant.db "SELECT * FROM emails;"`
- Verify API is responding: `curl http://localhost:3000/api/emails`

### Drag-drop not working
- Ensure dev server is running (`npm run dev`)
- Check browser console for errors
- Clear cache and refresh browser

### Database errors
- Reset database: `rm gmail_assistant.db && node scripts/init-db.js`
- Check permissions on database file
- Ensure better-sqlite3 is installed: `npm install better-sqlite3`

### AI classification not working in n8n
- Verify LLM API key is configured
- Check n8n logs for errors
- Ensure prompt is formatted correctly (JSON only)
- Test with simpler email first

---

## 📝 Development Notes

### Adding New Categories
Edit `lib/types.ts` and update:
1. Email type union
2. n8n prompt
3. CATEGORY_COLORS mapping

### Modifying Card Layout
Edit `app/page.tsx` EmailCard component - structure is in the first 100 lines.

### Changing Status Workflow
Edit `lib/types.ts` -> `STATUS_ORDER` constant and update column count in app.

---

## License
ISC

## Author
Suman (GVSumanth1)

---

## Links
- [n8n Documentation](https://docs.n8n.io)
- [Next.js Docs](https://nextjs.org/docs)
- [dnd-kit](https://docs.dnd-kit.com)
- [Tailwind CSS](https://tailwindcss.com)
