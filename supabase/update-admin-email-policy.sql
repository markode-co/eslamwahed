create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt()->>'email', '')) = 'ca.markode@gmail.com'
    or exists(select 1 from public.users where id = auth.uid() and role = 'admin');
$$;
