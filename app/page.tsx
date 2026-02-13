import HeroSection from '@/components/Homepage/HeroSection';
import HomeDeferredSections from '@/components/Homepage/HomeDeferredSections';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
    return (
        <main>
            <Header />
            <HeroSection />
            <HomeDeferredSections />
            <Footer />
        </main>
    );
}
