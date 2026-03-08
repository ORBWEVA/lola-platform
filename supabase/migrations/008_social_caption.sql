-- Add social_caption to avatars for AI-generated post captions
alter table public.avatars add column if not exists social_caption text;
