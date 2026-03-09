-- Session events for observability
CREATE TABLE public.session_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid REFERENCES public.sessions ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_events_type ON session_events(event_type);
CREATE INDEX idx_session_events_session ON session_events(session_id);

ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
  ON public.session_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON public.session_events FOR INSERT WITH CHECK (auth.uid() = user_id);
