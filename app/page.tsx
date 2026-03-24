'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Email, CATEGORY_COLORS, STATUS_LABELS, STATUS_ORDER } from '@/lib/types';

// EmailCard Component
function EmailCard({ email }: { email: Email }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `email-${email.id}`,
    data: { email },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColor = CATEGORY_COLORS[email.category || 'LOW_PRIORITY'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 rounded-lg bg-gray-700 border-l-4 cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div style={{ borderColor: categoryColor }}>
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-1 rounded text-xs font-bold text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {email.category?.split('_').join(' ') || 'UNCLASSIFIED'}
          </span>
          {email.priority && (
            <span className="text-xs text-yellow-300">{'⭐'.repeat(email.priority)}</span>
          )}
        </div>

        {/* Subject */}
        <div className="font-semibold text-white text-sm line-clamp-2 mb-2">
          {email.subject}
        </div>

        {/* Sender */}
        <div className="text-xs text-gray-300 mb-2">
          <span className="font-medium">From:</span> {email.sender.split('@')[0]}
        </div>

        {/* Snippet */}
        <div className="text-xs text-gray-400 line-clamp-2">
          {email.snippet || 'No preview'}
        </div>
      </div>
    </div>
  );
}

// Column Component
function KanbanColumn({ status, emails }: { status: string; emails: Email[] }) {
  const { setNodeRef } = useSortable({
    id: `column-${status}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-700/50 rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-600"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-600">
        <h2 className="font-bold text-white text-lg">
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
        </h2>
        <span className="text-sm text-gray-400 mt-1 block">
          {emails.length} item{emails.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Drop Zone */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <SortableContext items={emails.map((e) => `email-${e.id}`)} strategy={verticalListSortingStrategy}>
          {emails.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">No emails</div>
          ) : (
            emails.map((email) => <EmailCard key={email.id} email={email} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// Main Page Component
export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const fetchEmails = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/emails');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Email[] = await res.json();
      setEmails(data);
    } catch (err) {
      setError('Failed to load emails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    if (!activeData?.email) return;

    const newStatus = over.id.toString().replace('column-', '');

    // Optimistic update
    setEmails((prev) =>
      prev.map((e) => (e.id === activeData.email.id ? { ...e, status: newStatus as any } : e))
    );

    // Update database
    try {
      const res = await fetch(`/api/emails/${activeData.email.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        await fetchEmails();
      }
    } catch (err) {
      console.error('Failed to update:', err);
      await fetchEmails();
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gmail Assistant</h1>
        <p className="text-gray-400">Drag emails between columns to organize them</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-600 rounded text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400 text-lg" style={{ animation: 'pulse 2s infinite' }}>
            Loading emails...
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && (
        <DndContext
          sensors={sensors}
          collisionStrategy={closestCorners}
          onDragEnd={handleDragEnd}
          onDragStart={(event) => setActiveId(event.active.id.toString())}
        >
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                emails={emails.filter((e) => e.status === status)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div
                className="opacity-50 bg-gray-700 p-4 rounded-lg shadow-2xl border-l-4 border-red-500"
                style={{ width: '320px' }}
              >
                Being dragged...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
