export type Email = {
  id: number;
  sender: string;
  subject: string;
  snippet: string;
  category?: string;
  priority?: number;
  reasoning?: string;
  action_required?: string;
  status: 'new' | 'classified' | 'in_progress' | 'done';
};

export const CATEGORY_COLORS: Record<string, string> = {
  URGENT_DECISION: 'rgb(220, 38, 38)',     // red-600
  INVOICE: 'rgb(234, 88, 12)',              // orange-600
  CUSTOMER_REQUEST: 'rgb(180, 83, 9)',      // amber-700
  INTERNAL_UPDATE: 'rgb(37, 99, 235)',      // blue-600
  FOLLOW_UP: 'rgb(202, 138, 4)',            // yellow-700
  LOW_PRIORITY: 'rgb(107, 114, 128)'        // gray-500
};

export const STATUS_LABELS = {
  new: 'New Emails',
  classified: 'Ready to Act',
  in_progress: 'In Progress',
  done: 'Completed'
};

export const STATUS_ORDER = ['new', 'classified', 'in_progress', 'done'] as const;
