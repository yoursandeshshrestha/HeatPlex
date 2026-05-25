/**
 * Member Notes Tab
 * Add and view internal staff notes about the member
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailEmpty,
  DetailLoading,
  DetailSection,
} from '../components/detail-ui';

type InternalNote = Tables<'internal_notes'>;

interface MemberNotesTabProps {
  memberId: string;
}

export function MemberNotesTab({ memberId }: MemberNotesTabProps) {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [memberId]);

  async function loadNotes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('internal_notes')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!newNoteBody.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        toast.error('You must be logged in to add notes');
        return;
      }

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .single();

      if (staffError || !staffData) {
        toast.error('Staff account not found');
        return;
      }

      const { error } = await supabase.from('internal_notes').insert({
        member_id: memberId,
        staff_id: staffData.id,
        body: newNoteBody.trim(),
      });

      if (error) throw error;

      toast.success('Note added');
      setNewNoteBody('');
      setShowAddNote(false);
      loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <DetailLoading />;
  }

  return (
    <div className="space-y-6">
      <DetailSection title="Add note">
        {!showAddNote ? (
          <Button
            onClick={() => setShowAddNote(true)}
            variant="outline"
            className="w-full cursor-pointer border-dashed"
          >
            <Plus className="mr-2 size-4" />
            Add internal note
          </Button>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              placeholder="Visible only to staff…"
              rows={3}
              className="cursor-text resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddNote}
                disabled={submitting || !newNoteBody.trim()}
                className="cursor-pointer"
                size="sm"
              >
                {submitting ? 'Adding…' : 'Save note'}
              </Button>
              <Button
                onClick={() => {
                  setShowAddNote(false);
                  setNewNoteBody('');
                }}
                variant="ghost"
                size="sm"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DetailSection>

      <DetailSection title={`Notes (${notes.length})`} flushList>
        {notes.length === 0 ? (
          <DetailEmpty
            message="No notes yet"
            hint="Add internal notes to track conversations or important details."
          />
        ) : (
          <ul className="divide-y divide-border">
            {notes.map((note) => (
              <NoteRow key={note.id} note={note} />
            ))}
          </ul>
        )}
      </DetailSection>
    </div>
  );
}

function NoteRow({ note }: { note: InternalNote }) {
  const [staffName, setStaffName] = useState<string>('…');

  useEffect(() => {
    loadStaffName();
  }, [note.staff_id]);

  async function loadStaffName() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('name, email')
        .eq('id', note.staff_id)
        .single();

      if (error) throw error;

      setStaffName(data?.name || data?.email || 'Unknown');
    } catch (error) {
      setStaffName('Unknown');
    }
  }

  return (
    <li className="px-6 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{staffName}</p>
        <p className="shrink-0 text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {note.body}
      </p>
    </li>
  );
}
