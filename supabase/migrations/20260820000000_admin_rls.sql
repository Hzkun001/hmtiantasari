-- Public content is readable by everyone; only app_metadata admins may mutate it.
alter table public."News" enable row level security;
alter table public."TeamMembers" enable row level security;
alter table public."SiteSettings" enable row level security;
alter table public."CalendarEvents" enable row level security;

create policy "public read News" on public."News" for select using (true);
create policy "admin write News" on public."News" for all
using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "public read TeamMembers" on public."TeamMembers" for select using (true);
create policy "admin write TeamMembers" on public."TeamMembers" for all
using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "public read SiteSettings" on public."SiteSettings" for select using (true);
create policy "admin write SiteSettings" on public."SiteSettings" for all
using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "public read CalendarEvents" on public."CalendarEvents" for select using (true);
create policy "admin write CalendarEvents" on public."CalendarEvents" for all
using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "public read site images" on storage.objects for select
using (bucket_id in ('activity-images', 'team-images'));
create policy "admin write site images" on storage.objects for all
using (bucket_id in ('activity-images', 'team-images') and (auth.jwt()->'app_metadata'->>'role') = 'admin')
with check (bucket_id in ('activity-images', 'team-images') and (auth.jwt()->'app_metadata'->>'role') = 'admin');
