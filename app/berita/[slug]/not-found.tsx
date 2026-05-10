import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Header />
            <div className="container pt-40 pb-20 text-center">
                <h1 className="text-6xl font-bold text-[#FFD56C]">404</h1>
                <p className="mt-4 text-xl text-neutral-300">Berita tidak ditemukan.</p>
                <Link href="/berita" className="mt-8 inline-block text-[#FFD56C] hover:underline">
                    ← Kembali ke Berita
                </Link>
            </div>
            <Footer />
        </main>
    );
}
