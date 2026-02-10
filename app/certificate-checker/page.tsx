import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CertificateCheckerClient from '@/components/CertificateChecker/CertificateCheckerClient';
import './certificate-checker.css';

export default function CertificateCheckerPage() {
    return (
        <main className="certificate-checker-page">
            <Header />
            <CertificateCheckerClient />
            <Footer />
        </main>
    );
}

