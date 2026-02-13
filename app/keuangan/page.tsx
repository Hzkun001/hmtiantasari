import type { Metadata } from 'next';
import LaporanKeuanganSection from '@/components/Keuangan/LaporanKeuanganSection';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
    title: 'Laporan Keuangan',
    description:
        'Halaman transparansi kas laporan keuangan HMTI UIN Antasari, meliputi kas masuk, kas keluar, dan saldo akhir.',
};

export default function LaporanKeuanganPage() {
    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Header />
            <LaporanKeuanganSection />
            <Footer />
        </main>
    );
}
