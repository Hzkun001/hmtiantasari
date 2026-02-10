import HeroSection from '@/components/Homepage/HeroSection';
import SliderNavigation from '@/components/Homepage/SliderNavigation';
import HeroReveal from '@/components/Homepage/WelcomeVideo';
import AboutSection from '@/components/Homepage/ParallaxImage';
import ProjectsSection from '@/components/Homepage/ProjectsSection';
import Header from '@/components/layout/Header';
import ActivitiesSection from '@/components/Homepage/ActivitiesSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
    return (
        <main>
            <Header />
            <HeroSection />
            <HeroReveal />
            <AboutSection />
            <ProjectsSection />
            <ActivitiesSection />
            <SliderNavigation />
            <Footer />
        </main>
    );
}
