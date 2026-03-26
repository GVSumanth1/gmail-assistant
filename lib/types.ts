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

export const CATEGORY_COLORS: Record<string, string> = {
  URGENT_DECISION: 'rgb(220, 38, 38)',     // red-600
  INVOICE: 'rgb(234, 88, 12)',              // orange-600
  CUSTOMER_REQUEST: 'rgb(180, 83, 9)',      // amber-700
  INTERNAL_UPDATE: 'rgb(37, 99, 235)',      // blue-600
  FOLLOW_UP: 'rgb(202, 138, 4)',            // yellow-700
  LOW_PRIORITY: 'rgb(107, 114, 128)'        // gray-500
};

export const PRIORITY_COLORS: Record<number, string> = {
  5: 'rgb(239, 68, 68)',    // red-500 (highest priority)
  4: 'rgb(249, 115, 22)',   // orange-500
  3: 'rgb(250, 204, 21)',   // yellow-400
  2: 'rgb(34, 197, 94)',    // green-500
  1: 'rgb(59, 130, 246)'    // blue-500 (lowest priority)
};

export const STATUS_LABELS = {
  to_do: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
};

export const STATUS_ORDER = ['to_do', 'in_progress', 'done'] as const;
