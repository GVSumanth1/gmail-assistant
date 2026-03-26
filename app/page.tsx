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
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Email, CATEGORY_COLORS, PRIORITY_COLORS, STATUS_LABELS, STATUS_ORDER } from '@/lib/types';

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
    backgroundColor: PRIORITY_COLORS[email.priority || 1] || PRIORITY_COLORS[1],
  };

  const categoryColor = CATEGORY_COLORS[email.category || 'LOW_PRIORITY'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 rounded-lg cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow border-l-4"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div style={{ borderColor: 'rgba(0, 0, 0, 0.2)' }}>
        {/* Subject Line - MAIN HEADING - Prominent Segment */}
        <div className="mb-4 p-3 rounded border-2" style={{ borderColor: 'rgba(0, 0, 0, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="font-bold text-lg line-clamp-2" style={{ color: 'rgb(0, 0, 0)' }}>
            {email.subject}
          </div>
        </div>

        {/* Category & Priority Badges */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b-2" style={{ borderColor: 'rgba(0, 0, 0, 0.4)' }}>
          <span className="text-xs font-bold uppercase" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
            Type: <span style={{ color: 'rgb(0, 0, 0)' }}>{email.category?.split('_').join(' ') || 'UNCLASSIFIED'}</span>
          </span>
          {email.priority && (
            <span className="text-xs font-bold uppercase" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
              Priority: <span style={{ color: 'rgb(0, 0, 0)' }}>P{email.priority}</span>
            </span>
          )}
        </div>

        {/* Sender */}
        <div className="mb-3 pb-3 border-b-2" style={{ borderColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
            <span className="font-bold uppercase">From:</span> <span style={{ color: 'rgb(0, 0, 0)' }}>{email.sender.split('@')[0]}</span>
          </div>
        </div>

        {/* Analysis / Reasoning */}
        <div className="mb-3 pb-3 border-b-2" style={{ borderColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="text-xs font-bold uppercase mb-1" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Analysis:</div>
          <div className="text-xs line-clamp-2" style={{ color: 'rgb(0, 0, 0)' }}>
            {email.reasoning || 'No analysis available'}
          </div>
        </div>

        {/* Action Required */}
        {email.action_required && (
          <div className="mt-4 p-3 rounded border-2" style={{ borderColor: 'rgba(0, 0, 0, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Action Required:</div>
            <div className="text-sm font-medium" style={{ color: 'rgb(0, 0, 0)' }}>
              {email.action_required}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Column Component
function KanbanColumn({ status, emails }: { status: string; emails: Email[] }) {
  const { setNodeRef } = useDroppable({
    id: `column-${status}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 rounded-lg overflow-hidden flex flex-col border border-gray-300 shadow-sm"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900 text-lg">
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
        </h2>
        <span className="text-sm text-gray-600 mt-1 block">
          {emails.length} item{emails.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Drop Zone */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <SortableContext items={emails.map((e) => `email-${e.id}`)} strategy={verticalListSortingStrategy}>
          {emails.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">No emails</div>
          ) : (
            emails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// Bin Drop Zone Component
function BinDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bin',
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute top-0 right-0 transition-all"
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '12px',
        borderWidth: '2px',
        borderColor: isOver ? 'rgb(220, 38, 38)' : 'rgba(0, 0, 0, 0.15)',
        backgroundColor: isOver ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div 
        className="text-5xl mb-1"
        style={{
          filter: isOver ? 'scale(1.1)' : 'scale(1)',
          transition: 'filter 0.2s',
        }}
      >
        Delete
      </div>
      <div className="text-xs font-semibold" style={{ color: isOver ? 'rgb(220, 38, 38)' : 'rgba(0, 0, 0, 0.5)' }}>
        DROP HERE
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

    // Check if dropped on bin
    if (over.id === 'bin') {
      // Remove from UI optimistically
      setEmails((prev) => prev.filter((e) => e.id !== activeData.email.id));

      // Delete from database
      try {
        const res = await fetch('/api/emails/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId: activeData.email.id }),
        });

        if (!res.ok) {
          // Revert on error
          await fetchEmails();
        }
      } catch (err) {
        console.error('Failed to delete:', err);
        await fetchEmails();
      }
      return;
    }

    // Find which column we're dropping into
    // over.id could be either a column-${status} or an email-${id}
    let newStatus: string;
    
    if (over.id.toString().startsWith('column-')) {
      // Direct drop on column
      newStatus = over.id.toString().replace('column-', '');
    } else if (over.id.toString().startsWith('email-')) {
      // Drop on an email card - need to find its parent column
      const targetEmail = emails.find((e) => e.id === parseInt(over.id.toString().replace('email-', ''), 10));
      if (!targetEmail) return;
      newStatus = targetEmail.status;
    } else {
      return;
    }

    // Don't update if dropping in same column
    if (newStatus === activeData.email.status) return;

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
    <div className="min-h-screen p-6 bg-white">
      <DndContext
        sensors={sensors}
        collisionStrategy={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => setActiveId(event.active.id.toString())}
      >
        {/* Header with Bin */}
        <div className="mb-8 relative">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gmail Assistant</h1>
            <p className="text-gray-600">Drag emails between columns to organize them</p>
          </div>
          
          {/* Bin Drop Zone - Top Right */}
          <BinDropZone />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-600 text-lg" style={{ animation: 'pulse 2s infinite' }}>
              Loading emails...
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {!loading && (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                emails={emails.filter((e) => e.status === status)}
              />
            ))}
          </div>
        )}

        <DragOverlay>
          {activeId ? (
            <div
              className="opacity-50 bg-white p-4 rounded-lg shadow-2xl border-l-4 border-blue-500 border border-gray-300"
              style={{ width: '320px' }}
            >
              <span className="text-gray-700 font-medium">Being dragged...</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
