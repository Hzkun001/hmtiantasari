# HMTI Website

Website resmi Himpunan Mahasiswa Teknologi Informasi (HMTI) yang dibangun menggunakan Next.js. menampilkan profil organisasi, kegiatan, proyek, dan sistem manajemen admin.

## 🚀 Fitur Utama

### Public Features
- **Homepage Interaktif** - Landing page dengan animasi GSAP dan smooth scrolling
- **Sejarah Organisasi** - Halaman tentang sejarah dan visi misi HMTI
- **Kabinet** - Informasi tentang struktur kabinet organisasi
- **Kegiatan** - Showcase kegiatan dan aktivitas HMTI
- **Projects** - Portfolio proyek-proyek yang telah dikerjakan
- **Certificate Checker** - Sistem verifikasi sertifikat kegiatan

### Admin Panel
- **Dashboard** - Overview statistik proyek dan anggota tim
- **Manajemen Proyek** - CRUD operations untuk proyek
- **Manajemen Kegiatan** - Kelola kegiatan organisasi
- **Manajemen Tim** - Kelola data anggota tim
- **Settings** - Konfigurasi website

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn/ui** - Re-usable component library

### Animation & UX
- **GSAP** - Professional-grade animation
- **Lenis** - Smooth scrolling library
- **Three.js** - 3D graphics (jika digunakan)
- **Framer Motion** - React animation library

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL Database
  - Authentication
  - Storage
  - Real-time subscriptions

### UI Components
- **Radix UI** - Headless UI components
- **Lucide Icons** - Icon library
- **Heroicons** - Additional icons

## 📁 Struktur Proyek

```
hmti/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel routes
│   │   ├── activities/          # Manajemen kegiatan
│   │   ├── projects/            # Manajemen proyek
│   │   ├── team-members/        # Manajemen anggota
│   │   └── settings/            # Pengaturan
│   ├── certificate-checker/     # Verifikasi sertifikat
│   ├── kabinet/                 # Halaman kabinet
│   ├── kegiatan/                # Halaman kegiatan
│   ├── login/                   # Halaman login admin
│   ├── projects/                # Halaman proyek
│   ├── sejarah-kami/            # Halaman sejarah
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── About/                   # Komponen about section
│   ├── CertificateChecker/      # Komponen certificate checker
│   ├── Dashboard/               # Komponen admin dashboard
│   ├── Homepage/                # Komponen homepage
│   ├── Kabinet/                 # Komponen kabinet
│   ├── layout/                  # Layout components (Header, Footer)
│   ├── providers/               # Context providers
│   └── ui-shadcn/               # Shadcn UI components
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts            # Mobile detection
│   ├── useLenis.ts              # Lenis smooth scroll hook
│   └── useScrollTrigger.ts      # GSAP ScrollTrigger hook
├── lib/                          # Utility libraries
│   ├── certificates.ts          # Certificate logic
│   ├── projectsData.ts          # Projects data
│   ├── site-settings-server.ts  # Site settings
│   ├── supabase.ts              # Supabase client & types
│   ├── uploadImage.ts           # Image upload utility
│   └── utils.ts                 # General utilities
├── public/                       # Static assets
│   ├── images/                  # Images
│   ├── kabinet/                 # Kabinet images
│   ├── parallaxgallery/         # Gallery images
│   └── videos/                  # Video files
├── middleware.ts                 # Next.js middleware
└── package.json                  # Dependencies & scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20.x atau lebih tinggi
- npm, yarn, atau pnpm
- Akun Supabase (untuk database dan auth)

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/Hzkun001/hmtilandingpage.git
   cd hmti
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Setup Environment Variables**
   
   Buat file `.env.local` di root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup Supabase Database**
   
   Buat tabel-tabel berikut di Supabase:
   - `Projects` - Data proyek
   - `Activities` - Data kegiatan
   - `TeamMembers` - Data anggota tim
   - `Certificates` - Data sertifikat
   - `SiteSettings` - Pengaturan website

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build aplikasi untuk production |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan ESLint |
| `npm run clean` | Membersihkan folder .next |

## 🔐 Authentication

Website menggunakan Supabase Authentication untuk admin panel. Setup:

1. Enable Email/Password authentication di Supabase Dashboard
2. Buat user admin melalui Supabase Dashboard
3. Login melalui `/login`

## 🎨 Customization

### Mengubah Tema
Edit file `tailwind.config.ts` untuk mengubah color scheme dan theme.

### Menambah Komponen UI
Gunakan shadcn/ui CLI:
```bash
npx shadcn@latest add [component-name]
```

### Mengubah Animasi
Edit komponen di `components/Homepage/` dan sesuaikan GSAP animations.

## 📱 Responsive Design

Website fully responsive dengan breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - Shadcn/ui configuration
- `middleware.ts` - Next.js middleware untuk auth

## 🤝 Contributing

Contributions are welcome! Untuk kontribusi:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

This project is private and maintained by HMTI.

## 👥 Contact

HMTI - Himpunan Mahasiswa Teknologi Informasi

Project Link: [https://github.com/Hzkun001/hmtilandingpage](https://github.com/Hzkun001/hmtilandingpage)

---

**Made with ❤️ by HMTI Team**
