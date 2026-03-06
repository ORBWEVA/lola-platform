-- Helper functions for atomic operations

create or replace function public.deduct_credits(p_user_id uuid, p_amount int)
returns void as $$
begin
  update public.profiles
  set credits = greatest(credits - p_amount, 0)
  where id = p_user_id;
end;
$$ language plpgsql security definer;

create or replace function public.increment_session_count(p_avatar_id uuid)
returns void as $$
begin
  update public.avatars
  set session_count = session_count + 1
  where id = p_avatar_id;
end;
$$ language plpgsql security definer;
