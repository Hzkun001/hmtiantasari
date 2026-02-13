import HeroSection from '@/components/Homepage/HeroSection';
import SliderNavigation from '@/components/Homepage/SliderNavigation';
import HeroReveal from '@/components/Homepage/WelcomeVideo';
import AboutSection from '@/components/Homepage/ParallaxImage';
import CalendarSection from '@/components/Homepage/CalenderSection';
import Header from '@/components/layout/Header';
import NewsSection from '@/components/Homepage/NewsSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
    return (
        <main>
            <Header />
            <HeroSection />
            <HeroReveal />
            <AboutSection />
            <CalendarSection />
            <NewsSection />
            <SliderNavigation />
            <Footer />
        </main>
    );
}
