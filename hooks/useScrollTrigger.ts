'use client'

import { useEffect } from 'react'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export function useScrollTrigger() {
    const isRegistered = useRef(false)

    useEffect(() => {
        if (!isRegistered.current) {
            gsap.registerPlugin(ScrollTrigger)
            isRegistered.current = true
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])
}

export function useLenisScrollTrigger(lenisRef: React.RefObject<any>) {
    useEffect(() => {
        if (!lenisRef.current) return

        // Sync Lenis with GSAP ScrollTrigger
        lenisRef.current.on('scroll', ScrollTrigger.update)

        gsap.ticker.add((time) => {
            if (lenisRef.current) {
                lenisRef.current.raf(time * 1000)
            }
        })

        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove(() => { })
        }
    }, [lenisRef])
}
