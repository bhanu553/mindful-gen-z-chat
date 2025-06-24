
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Plus, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CalendarWithNotesProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface UserNote {
  id: string;
  note_date: string;
  note_text: string;
}

const CalendarWithNotes = ({ selectedDate, onDateChange }: CalendarWithNotesProps) => {
  const { user, isPremium } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('note_date', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data || []);
  };

  const saveNote = async () => {
    if (!user || !noteText.trim()) return;

    const noteDate = selectedDate.toISOString().split('T')[0];

    try {
      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('user_notes')
          .update({ note_text: noteText, updated_at: new Date().toISOString() })
          .eq('id', editingNote.id);

        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase
          .from('user_notes')
          .insert({
            user_id: user.id,
            note_date: noteDate,
            note_text: noteText
          });

        if (error) throw error;
      }

      await fetchNotes();
      setNoteText('');
      setShowNoteInput(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const getSelectedDateNote = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return notes.find(note => note.note_date === dateStr);
  };

  const getDatesWithNotes = () => {
    return notes.map(note => new Date(note.note_date + 'T00:00:00'));
  };

  const startEditNote = (note: UserNote) => {
    setEditingNote(note);
    setNoteText(note.note_text);
    setShowNoteInput(true);
  };

  const selectedDateNote = getSelectedDateNote();
  const datesWithNotes = getDatesWithNotes();

  return (
    <div className="space-y-4">
      <div className="gradient-card p-4 rounded-lg border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">
          {isPremium ? 'Full Calendar Access' : 'Current Week View'}
        </h3>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          disabled={(date) => {
            if (!isPremium) {
              // For free users, only allow current week
              const now = new Date();
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              return date < weekStart || date > weekEnd;
            }
            return date > new Date();
          }}
          modifiers={{
            hasNote: datesWithNotes
          }}
          modifiersStyles={{
            hasNote: { 
              backgroundColor: 'rgb(59 130 246 / 0.3)',
              borderRadius: '50%',
            }
          }}
          className="pointer-events-auto"
        />

        {!isPremium && (
          <p className="text-sm text-muted-foreground mt-2">
            Upgrade to Premium for full calendar access
          </p>
        )}
      </div>

      {/* Note for selected date */}
      <div className="gradient-card p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground">
            Note for {selectedDate.toLocaleDateString()}
          </h4>
          {!selectedDateNote && !showNoteInput && (
            <Button
              onClick={() => setShowNoteInput(true)}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </Button>
          )}
        </div>

        {selectedDateNote && !showNoteInput ? (
          <div className="space-y-2">
            <p className="text-foreground bg-secondary/30 p-3 rounded-lg">
              {selectedDateNote.note_text}
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => startEditNote(selectedDateNote)}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </Button>
              <Button
                onClick={() => deleteNote(selectedDateNote.id)}
                size="sm"
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        ) : showNoteInput ? (
          <div className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What happened today? How are you feeling?"
              className="w-full bg-secondary border border-border/50 rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[80px]"
            />
            <div className="flex space-x-2">
              <Button onClick={saveNote} size="sm">
                {editingNote ? 'Update' : 'Save'} Note
              </Button>
              <Button 
                onClick={() => {
                  setShowNoteInput(false);
                  setNoteText('');
                  setEditingNote(null);
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No note for this date</p>
        )}
      </div>
    </div>
  );
};

export default CalendarWithNotes;
