'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

interface LenisOptions {
    duration?: number
    easing?: (t: number) => number
    orientation?: 'vertical' | 'horizontal'
    gestureOrientation?: 'vertical' | 'horizontal' | 'both'
    smoothWheel?: boolean
    wheelMultiplier?: number
    smoothTouch?: boolean
    touchMultiplier?: number
    infinite?: boolean
}

export function useLenis(options?: LenisOptions) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
            ...options,
        })

        lenisRef.current = lenis

        // Cleanup
        return () => {
            lenis.destroy()
            lenisRef.current = null
        }
    }, [options])

    return lenisRef
}
