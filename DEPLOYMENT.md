# Panduan Deployment Aqiqah Almeera ke Vercel / Production

## 1. Environment Variables Wajib
Atur di Vercel Dashboard (**Project Settings → Environment Variables**):

| Variable | Deskripsi | Contoh |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL Connection String (Session Pooler Supabase/Neon/RDS) | `postgresql://postgres.[REF]:[PASS]@[HOST]:6543/postgres` |
| `DATABASE_SSL` | Pakai koneksi SSL (`true` untuk Supabase/Neon/RDS) | `true` |
| `DATABASE_POOL_MAX` | Maksimal connection pool serverless | `5` |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint Supabase Storage | `https://[REF].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret Service Role Key Supabase | `eyJ...` (jangan commit ke Git) |
| `NEXT_PHASE` | Otomatis disediakan oleh Next.js | - |

## 2. Inisialisasi Database Production
Jalankan satu kali dari komputer lokal dengan koneksi database production:
```bash
npm run db:migrate
npm run db:seed
npm run db:verify
```

## 3. Build Command di Hosting
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** `>= 22.5.0` (sesuai `package.json`)

## 4. Keamanan & Backup
- File `.env*`, database lokal `data/*.db`, dan file storage lokal sudah di-ignore di `.gitignore`.
- Jangan pernah melakukan commit secret ke repository Git.
- Lakukan rotate berkala untuk `SUPABASE_SERVICE_ROLE_KEY`.
