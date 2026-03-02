-- Enable RLS and allow public read + authenticated admin panel writes.
alter table public."SiteSettings" enable row level security;

-- Readable publicly for website footer + metadata (anon API key).
drop policy if exists "site_settings_public_read" on public."SiteSettings";
create policy "site_settings_public_read"
on public."SiteSettings"
for select
to anon, authenticated
using (true);

-- Writable for logged-in users (admin panel uses authenticated Supabase session).
drop policy if exists "site_settings_authenticated_insert" on public."SiteSettings";
create policy "site_settings_authenticated_insert"
on public."SiteSettings"
for insert
to authenticated
with check (true);

drop policy if exists "site_settings_authenticated_update" on public."SiteSettings";
create policy "site_settings_authenticated_update"
on public."SiteSettings"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "site_settings_authenticated_delete" on public."SiteSettings";
create policy "site_settings_authenticated_delete"
on public."SiteSettings"
for delete
to authenticated
using (true);

grant select on public."SiteSettings" to anon, authenticated;
grant insert, update, delete on public."SiteSettings" to authenticated;

do $$
begin
    if exists (
        select 1
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'S'
          and c.relname = 'SiteSettings_id_seq'
          and n.nspname = 'public'
    ) then
        execute 'grant usage, select on sequence public."SiteSettings_id_seq" to authenticated';
    end if;
end;
$$;
