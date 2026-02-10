'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Expose Lenis instance globally for other components
declare global {
    interface Window {
        lenis?: Lenis;
    }
}

export default function SmoothScrollProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1.0,  // Mengatur sensitivitas scroll wheel (default: 1)
            touchMultiplier: 2.0,  // Mengatur sensitivitas touch scroll (default: 2)
            infinite: false,       // Nonaktifkan infinite scroll
        });

        lenisRef.current = lenis;
        window.lenis = lenis; // Make Lenis accessible globally

        // Synchronize Lenis with GSAP ScrollTrigger
        const onLenisScroll = () => ScrollTrigger.update();
        lenis.on('scroll', onLenisScroll);

        // Add Lenis to GSAP ticker
        const onTick = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(onTick);

        // Disable lag smoothing
        gsap.ticker.lagSmoothing(0);

        // Cleanup
        return () => {
            lenis.off('scroll', onLenisScroll);
            lenis.destroy();
            window.lenis = undefined;
            gsap.ticker.remove(onTick);
        };
    }, []);

    return <>{children}</>;
}
