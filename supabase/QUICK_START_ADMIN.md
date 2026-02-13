## 📝 Cara Set Admin (3 Langkah)

### Step 1: Apply Helper Functions
Buka **Supabase Dashboard → SQL Editor**, paste & run:
```sql
-- File: 20260213_admin_management_helpers.sql
-- Copy paste semua isi file ini dan run
```

### Step 2: Login ke Aplikasi
Login ke aplikasi Anda via `/login` dengan email/password seperti biasa.

### Step 3: Set sebagai Admin
Kembali ke **Supabase SQL Editor**, run:
```sql
SELECT * FROM set_user_as_admin('email-yang-baru-login@gmail.com');
```

**Done!** ✅ User tersebut sekarang admin.

---

## 🔄 Ganti Admin Nanti

### Add Admin Baru
```sql
SELECT * FROM set_user_as_admin('admin-baru@gmail.com');
```

### Remove Admin
```sql
SELECT * FROM remove_admin_role('admin-lama@gmail.com');
```

### Cek Siapa Admin Sekarang
```sql
SELECT * FROM list_all_admins();
```

---

## ✅ Verification

### Di SQL Editor:
```sql
-- Cek email dan role user
SELECT 
  email, 
  raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'your-email@gmail.com';
```

### Di Browser Console (setelah login):
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Role:', user.user_metadata.role);
// Output: "admin"
```