import HeroSection from '@/components/sections/HeroSection';
import SliderNavigation from '@/components/sections/SliderNavigation';
import HeroReveal from '@/components/sections/HeroReveal';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import Header from '@/components/layout/Header';
export default function HomePage() {
    return (
        <main>
            <Header />
            <HeroSection />
            <HeroReveal />
            <AboutSection />
            <ProjectsSection />
            <SliderNavigation />
        </main>
    );
}
