# Menetapkan admin

Role admin disimpan di `app_metadata`, bukan `user_metadata`, agar user tidak dapat mengubah role miliknya sendiri.

Jalankan di Supabase Dashboard → SQL Editor setelah user mendaftar:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

Hapus akses admin:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
where email = 'admin@example.com';
```

Verifikasi:

```sql
select email, raw_app_meta_data->>'role' as role
from auth.users
order by email;
```

User perlu logout dan login kembali setelah role berubah agar JWT berisi claim terbaru.
