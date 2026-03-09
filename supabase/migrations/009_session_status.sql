-- Add session lifecycle columns
ALTER TABLE public.sessions ADD COLUMN status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'completed', 'failed', 'expired'));
ALTER TABLE public.sessions ADD COLUMN session_notes text;
ALTER TABLE public.sessions ADD COLUMN feedback_rating int CHECK (feedback_rating IN (1, 3, 5));
ALTER TABLE public.sessions ADD COLUMN feedback_text text;

-- Allow system role in transcript entries for error messages
ALTER TABLE public.transcript_entries DROP CONSTRAINT IF EXISTS transcript_entries_role_check;
ALTER TABLE public.transcript_entries ADD CONSTRAINT transcript_entries_role_check
  CHECK (role IN ('user', 'model', 'system'));
