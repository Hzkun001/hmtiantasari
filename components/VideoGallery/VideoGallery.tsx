'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '@/hooks/useLenis'
import { useLenisScrollTrigger } from '@/hooks/useScrollTrigger'
import styles from './VideoGallery.module.css'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

const videoData = [
    { name: "/videos/v1.mp4" },
    { name: "/videos/v2.mp4" },
    { name: "/videos/v3.mp4" },
    { name: "/videos/v4.mp4" },
    { name: "/videos/v5.mp4" },
    { name: "/videos/v6.mp4" },
    { name: "/videos/v7.mp4" },
]

const params = {
    rows: 4,
    columns: 5,
    curvature: 6,
    spacing: 15,
    imageWidth: 7,
    imageHeight: 4.5,
    depth: 7.5,
    elevation: 0,
    lookAtRange: 15,
    verticalCurvature: 0.5,
}

export default function VideoGallery() {
    const sectionRef = useRef<HTMLElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const lenisRef = useLenis()

    // Integrate Lenis with GSAP ScrollTrigger
    useLenisScrollTrigger(lenisRef)

    useEffect(() => {
        if (!containerRef.current || !sectionRef.current) return

        // Fade out animation saat scroll keluar dari section
        const fadeOutTrigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress
                if (containerRef.current && headerRef.current) {
                    // Fade out gradually
                    const opacity = 1 - progress
                    containerRef.current.style.opacity = opacity.toString()
                    headerRef.current.style.opacity = opacity.toString()
                }
            },
        })

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            25,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        camera.position.set(0, 0, 40)

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: false,
            alpha: true,
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        containerRef.current.appendChild(renderer.domElement)

        // Mouse tracking
        let mouseX = 0, mouseY = 0
        let targetX = 0, targetY = 0
        let headerRotationX = 0, headerRotationY = 0, headerTranslateZ = 0
        const lookAtTarget = new THREE.Vector3(0, 0, 0)

        // Helper functions
        function createVideoElement(videoSource: string): HTMLVideoElement {
            const video = document.createElement("video")
            video.src = videoSource
            video.crossOrigin = "anonymous"
            video.loop = true
            video.muted = true
            video.playsInline = true
            video.preload = "auto"
            video.width = 640
            video.height = 360
            video.play().catch(err => console.log("Video play error:", err))
            return video
        }

        function calculateRotations(x: number, y: number) {
            const a = 1 / (params.depth * params.curvature)
            const slopeY = -2 * a * x
            const rotationY = Math.atan(slopeY)

            const verticalFactor = params.verticalCurvature
            const maxYDistance = (params.rows * params.spacing) / 2
            const normalizedY = y / maxYDistance
            const rotationX = normalizedY * verticalFactor

            return { rotationX, rotationY }
        }

        function calculatePosition(row: number, col: number) {
            let x = (col - params.columns / 2) * params.spacing
            let y = (row - params.rows / 2) * params.spacing
            let z = (x * x) / (params.depth * params.curvature)

            const normalizedY = y / ((params.rows * params.spacing) / 2)
            z += Math.abs(normalizedY) * normalizedY * params.verticalCurvature * 5
            y += params.elevation

            const { rotationX, rotationY } = calculateRotations(x, y)
            return { x, y, z, rotationX, rotationY }
        }

        // Create video planes
        const videos: THREE.Mesh[] = []
        let videoIndex = 0

        function createVideoPlane(row: number, col: number) {
            const videoSource = videoData[videoIndex % videoData.length]
            videoIndex++

            const geometry = new THREE.PlaneGeometry(params.imageWidth, params.imageHeight)
            const video = createVideoElement(videoSource.name)
            const videoTexture = new THREE.VideoTexture(video)
            videoTexture.minFilter = THREE.LinearFilter
            videoTexture.magFilter = THREE.LinearFilter
            videoTexture.format = THREE.RGBAFormat
            videoTexture.generateMipmaps = false

            const material = new THREE.MeshBasicMaterial({
                map: videoTexture,
                side: THREE.DoubleSide,
            })

            const plane = new THREE.Mesh(geometry, material)
            const { x, y, z, rotationX, rotationY } = calculatePosition(row, col)

            plane.position.set(x, y, z)
            plane.rotation.x = rotationX
            plane.rotation.y = rotationY

            plane.userData.video = video
            plane.userData.basePosition = { x, y, z }
            plane.userData.baseRotation = { x: rotationX, y: rotationY, z: 0 }
            plane.userData.parallaxFactor = Math.random() * 0.5 + 0.5
            plane.userData.randomOffset = {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random() * 2 - 1,
            }
            plane.userData.rotationModifier = {
                x: Math.random() * 0.15 - 0.075,
                y: Math.random() * 0.15 - 0.075,
                z: Math.random() * 0.2 - 0.1,
            }
            plane.userData.phaseOffset = Math.random() * Math.PI * 2

            return plane
        }

        // Initialize gallery
        for (let row = 0; row < params.rows; row++) {
            for (let col = 0; col < params.columns; col++) {
                const plane = createVideoPlane(row, col)
                videos.push(plane)
                scene.add(plane)
            }
        }

        // Frustum culling
        const frustum = new THREE.Frustum()
        const cameraViewProjectionMatrix = new THREE.Matrix4()

        // Event listeners
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
            mouseY = -(event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)

            headerRotationX = -mouseY * 30
            headerRotationY = mouseX * 30
            headerTranslateZ = Math.abs(mouseX * mouseY) * 50
        }

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('resize', handleResize)

        // Animation loop
        function animate() {
            requestAnimationFrame(animate)

            // Update Lenis smooth scrolling
            if (lenisRef.current) {
                lenisRef.current.raf(performance.now())
            }

            // Update header transform
            if (headerRef.current) {
                headerRef.current.style.transform = `
                translate(-50%, -50%)
                perspective(1000px)
                rotateX(${headerRotationX}deg)
                rotateY(${headerRotationY}deg)
                translateZ(${headerTranslateZ}px)
                `
            }

            // Smooth easing
            targetX += (mouseX - targetX) * 0.08
            targetY += (mouseY - targetY) * 0.08

            lookAtTarget.x = targetX * params.lookAtRange
            lookAtTarget.y = targetY * params.lookAtRange
            lookAtTarget.z = (lookAtTarget.x * lookAtTarget.x) / (params.depth * params.curvature)

            const time = performance.now() * 0.001

            // Update frustum
            camera.updateMatrixWorld()
            camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
            cameraViewProjectionMatrix.multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse
            )
            frustum.setFromProjectionMatrix(cameraViewProjectionMatrix)

            // Update video planes
            videos.forEach((plane) => {
                const {
                    basePosition,
                    baseRotation,
                    parallaxFactor,
                    randomOffset,
                    rotationModifier,
                    phaseOffset,
                } = plane.userData

                const mouseDistance = Math.sqrt(targetX * targetX + targetY * targetY)
                const parallaxX = targetX * parallaxFactor * 3 * randomOffset.x
                const parallaxY = targetY * parallaxFactor * 3 * randomOffset.y
                const oscillation = Math.sin(time + phaseOffset) * mouseDistance * 0.1

                plane.position.x = basePosition.x + parallaxX + oscillation * randomOffset.x
                plane.position.y = basePosition.y + parallaxY + oscillation * randomOffset.y
                plane.position.z = basePosition.z + oscillation * randomOffset.z * parallaxFactor

                plane.rotation.x = baseRotation.x + targetY * rotationModifier.x * mouseDistance + oscillation + rotationModifier.x * 0.2
                plane.rotation.y = baseRotation.y + targetX * rotationModifier.y * mouseDistance + oscillation + rotationModifier.y * 0.2
                plane.rotation.z = baseRotation.z + targetX * targetY * rotationModifier.z * 2 + oscillation * rotationModifier.z * 0.3

                // Frustum culling for video playback
                const isVisible = frustum.intersectsObject(plane)
                const video = plane.userData.video

                if (video) {
                    if (isVisible && video.paused) {
                        video.play().catch(() => { })
                    } else if (!isVisible && !video.paused) {
                        video.pause()
                    }
                }
            })

            camera.lookAt(lookAtTarget)
            renderer.render(scene, camera)
        }

        animate()

        // Cleanup
        return () => {
            fadeOutTrigger.kill()
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('resize', handleResize)

            videos.forEach((plane) => {
                if (plane.userData.video) {
                    plane.userData.video.pause()
                    plane.userData.video.src = ''
                }
                scene.remove(plane)
            })

            renderer.dispose()

            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement)
            }
        }
    }, [lenisRef])

    return (
        <section ref={sectionRef} style={{ height: '100vh', position: 'relative', backgroundColor: '#1a1a1a' }}>
            <div className={styles.header} ref={headerRef}>
                <h1>TheStory HMTI</h1>
            </div>
            <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        </section>
    )
}
