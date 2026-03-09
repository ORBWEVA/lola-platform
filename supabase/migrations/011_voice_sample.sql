-- Add voice_sample_url to avatars for pre-generated TTS greeting samples
ALTER TABLE public.avatars ADD COLUMN IF NOT EXISTS voice_sample_url TEXT;
