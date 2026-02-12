"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase, ScrollTrigger } from "gsap/all";
import SplitType from "split-type";
import styles from "./KabinetLanding.module.css";
import { projectsData } from "@/lib/projectsData";

// Types
interface Project {
    name: string;
    director: string;
    creator: string;
}

interface LandingHeroProps {
    projects?: Project[];
}

type LenisLike = {
    stop?: () => void;
    start?: () => void;
    scrollTo?: (
        target: number | string | HTMLElement,
        options?: {
            immediate?: boolean;
            force?: boolean;
        }
    ) => void;
};

const LandingHero: React.FC<LandingHeroProps> = ({
    projects = projectsData
}) => {
    const projectsContainerRef = useRef<HTMLDivElement>(null);
    const locationsContainerRef = useRef<HTMLDivElement>(null);
    const imageGridRef = useRef<HTMLDivElement>(null);
    const introCopyRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const isMobileViewport = window.matchMedia("(max-width: 900px)").matches;
        const heroLiftY = isMobileViewport ? -18 : -50;
        const heroScale = isMobileViewport ? 2.15 : 4;
        const heroClipPath = isMobileViewport
            ? "polygon(14% 10%, 86% 10%, 86% 90%, 14% 90%)"
            : "polygon(20% 10%, 80% 10%, 80% 90%, 20% 90%)";
        const bannerLeftOne = isMobileViewport ? "30%" : "40%";
        const bannerLeftTwo = isMobileViewport ? "70%" : "60%";
        const bannerRotateOne = isMobileViewport ? -12 : -20;
        const bannerRotateTwo = isMobileViewport ? 12 : 20;

        const html = document.documentElement;
        const body = document.body;
        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyTouchAction = body.style.touchAction;
        const lenis = (window as Window & { lenis?: LenisLike }).lenis;
        let hasUnlockedScroll = false;

        const unlockScroll = () => {
            if (hasUnlockedScroll) return;
            hasUnlockedScroll = true;
            body.classList.remove("overflow-hidden");
            html.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyOverflow;
            body.style.touchAction = previousBodyTouchAction;
            lenis?.start?.();
        };

        lenis?.stop?.();
        body.classList.add("overflow-hidden");
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        body.style.touchAction = "none";
        lenis?.scrollTo?.(0, { immediate: true, force: true });
        window.scrollTo({ top: 0, behavior: "auto" });

        // Register GSAP plugins
        gsap.registerPlugin(CustomEase, ScrollTrigger);
        CustomEase.create("hop", "0.9, 0, 0.1, 1");

        const projectsContainer = projectsContainerRef.current;
        const locationsContainer = locationsContainerRef.current;
        const gridImages = gsap.utils.toArray<HTMLElement>(".img");
        const heroImage = document.querySelector(".img.hero-img") as HTMLElement;
        const images = gridImages.filter((img) => img !== heroImage);

        // Split text for animations
        const introCopy = new SplitType(".intro-copy h3", {
            types: "words",
            absolute: false,
        });

        // Image sources
        const allImageSources = [
            "/kabinet/img1.jpg", "/kabinet/img2.jpg", "/kabinet/img3.jpg", "/kabinet/img4.jpg",
            "/kabinet/img5.jpg", "/kabinet/img6.jpg", "/kabinet/img7.jpg", "/kabinet/img8.jpg",
            "/kabinet/img9.jpg", "/kabinet/img10.jpg", "/kabinet/img11.jpg",
        ];

        const getRandomImageSet = () => {
            const shuffled = [...allImageSources].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 9);
        };

        // Initialize dynamic content
        const initializeDynamicContent = () => {
            if (!projectsContainer || !locationsContainer) return;

            projects.forEach((project) => {
                const projectItem = document.createElement("div");
                projectItem.className = "project-item";

                const projectName = document.createElement("p");
                projectName.textContent = project.name;

                const directorName = document.createElement("p");
                directorName.textContent = project.director;

                projectItem.appendChild(projectName);
                projectItem.appendChild(directorName);
                projectsContainer.appendChild(projectItem);
            });

            projects.forEach((project) => {
                const locationItem = document.createElement("div");
                locationItem.className = "location-item";

                const locationName = document.createElement("p");
                locationName.textContent = project.creator;

                locationItem.appendChild(locationName);
                locationsContainer.appendChild(locationItem);
            });
        };

        // Start image rotation
        const startImageRotation = () => {
            const totalCycles = 20;

            for (let cycle = 0; cycle < totalCycles; cycle++) {
                const randomImages = getRandomImageSet();

                gsap.to({}, {
                    duration: 0,
                    delay: cycle * 0.15,
                    onComplete: () => {
                        gridImages.forEach((img, index) => {
                            const imgElement = img.querySelector("img");
                            if (!imgElement) return;

                            if (cycle === totalCycles - 1 && img === heroImage) {
                                imgElement.src = "/kabinet/img5.jpg";
                                gsap.set(".hero-img img", { scale: 1.2 });
                            } else {
                                imgElement.src = randomImages[index];
                            }
                        });
                    },
                });
            }
        };

        // Setup initial states
        const setupInitialStates = () => {
            gsap.set(introCopy.words, { y: "110%" });
        };

        // Create animation timelines
        const createAnimationTimelines = () => {
            const overlayTimeline = gsap.timeline();
            const imagesTimeline = gsap.timeline();
            const textTimeline = gsap.timeline();

            overlayTimeline.to(".logo-line-1", {
                backgroundPosition: "0% 0%",
                color: "#fff",
                duration: 1,
                ease: "none",
                delay: 0.5,
                onComplete: () => {
                    gsap.to(".logo-line-2", {
                        backgroundPosition: "0% 0%",
                        color: "#fff",
                        duration: 1,
                        ease: "none",
                    });
                },
            });

            overlayTimeline.to([".projects-header", ".project-item"], {
                opacity: 1,
                duration: 0.15,
                stagger: 0.075,
                delay: 1,
            });

            overlayTimeline.to([".locations-header", ".location-item"], {
                opacity: 1,
                duration: 0.15,
                stagger: 0.075,
            }, "<");

            overlayTimeline.to(".project-item", {
                color: "#ffff",
                duration: 0.15,
                stagger: 0.075,
            });

            overlayTimeline.to(".location-item", {
                color: "#fff",
                duration: 0.15,
                stagger: 0.075,
            }, "<");

            overlayTimeline.to([".projects-header", ".project-item"], {
                opacity: 0,
                duration: 0.15,
                stagger: 0.075,
            });

            overlayTimeline.to([".locations-header", ".location-item"], {
                opacity: 0,
                duration: 0.15,
                stagger: 0.075,
            }, "<");

            overlayTimeline.to(".overlay", {
                opacity: 0,
                duration: 0.5,
                delay: 1.5,
                onComplete: () => {
                    gsap.set(".overlay", { display: "none" });
                },
            });

            imagesTimeline.to(".img", {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1,
                delay: 2.5,
                stagger: 0.05,
                ease: "hop",
                onStart: () => {
                    setTimeout(() => {
                        startImageRotation();
                        gsap.to(".loader", { opacity: 0, duration: 0.3 });
                    }, 1000);
                },
            });

            imagesTimeline.to(images, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                duration: 1,
                delay: 2.5,
                stagger: 0.05,
                ease: "hop",
            });

            imagesTimeline.to(".hero-img", {
                y: heroLiftY,
                duration: 1,
                ease: "hop",
            });

            imagesTimeline.to(".hero-img", {
                scale: heroScale,
                clipPath: heroClipPath,
                duration: 1.5,
                ease: "hop",
                onStart: () => {
                    gsap.to(".hero-img img", {
                        scale: 1,
                        duration: 1.5,
                        ease: "hop",
                    });

                    gsap.to(".banner-img", {
                        scale: 1,
                        delay: 0.5,
                        duration: 0.5,
                    });
                },
            });

            imagesTimeline.to(".banner-img-1", {
                left: bannerLeftOne,
                rotate: bannerRotateOne,
                duration: 1.5,
                delay: 0.5,
                ease: "hop",
            }, "<");

            imagesTimeline.to(".banner-img-2", {
                left: bannerLeftTwo,
                rotate: bannerRotateTwo,
                duration: 1.5,
                ease: "hop",
            }, "<");

            textTimeline.to(introCopy.words, {
                y: "0%",
                duration: 1,
                stagger: 0.1,
                delay: 9.5,
                ease: "power3.out",
                onComplete: unlockScroll,
            });
        };

        const scrollUnlockFallback = window.setTimeout(unlockScroll, 12000);

        // Initialize
        initializeDynamicContent();
        setupInitialStates();
        createAnimationTimelines();

        // Cleanup
        return () => {
            window.clearTimeout(scrollUnlockFallback);
            introCopy.revert();
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            unlockScroll();
        };
    }, [projects]);

    return (
        <div className={styles.landingContainer}>
            <div className="overlay">
                <div className="projects" ref={projectsContainerRef}>
                    <div className="projects-header">
                        <p>Projects</p>
                        <p>Directors</p>
                    </div>
                </div>
                <div className="loader">
                    <h1 className="logo-line-1">KABINET</h1>
                    <h1 className="logo-line-2">ARNANTA</h1>
                </div>
                <div className="locations" ref={locationsContainerRef}>
                    <div className="locations-header">
                        <p>Location</p>
                    </div>
                </div>
            </div>

            <div className="image-grid" ref={imageGridRef}>
                <div className="grid-row">
                    <div className="img">
                        <img src="/kabinet/img1.jpg" alt="" />
                    </div>
                    <div className="img">
                        <img src="/kabinet/img2.jpg" alt="" />
                    </div>
                    <div className="img">
                        <img src="/kabinet/img3.jpg" alt="" />
                    </div>
                </div>
                <div className="grid-row">
                    <div className="img">
                        <img src="/kabinet/img4.jpg" alt="" />
                    </div>
                    <div className="img hero-img">
                        <img src="/kabinet/img5.jpg" alt="" />
                    </div>
                    <div className="img">
                        <img src="/kabinet/img6.jpg" alt="" />
                    </div>
                </div>
                <div className="grid-row">
                    <div className="img">
                        <img src="/kabinet/img9.jpg" alt="" />
                    </div>
                    <div className="img">
                        <img src="/kabinet/img10.jpg" alt="" />
                    </div>
                    <div className="img">
                        <img src="/kabinet/img11.jpg" alt="" />
                    </div>
                </div>
            </div>

            <div className="banner-img banner-img-1">
                <img src="/kabinet/img7.jpg" alt="" />
            </div>
            <div className="banner-img banner-img-2">
                <img src="/kabinet/img8.jpg" alt="" />
            </div>

            <div className="intro-copy" ref={introCopyRef}>
                <h3>Sentra Berhimpun</h3>
                <h3>Aksi Transformatif</h3>
            </div>
        </div>
    );
};

export default LandingHero;
