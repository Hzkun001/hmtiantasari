'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type HeaderProps = {
    onlyShowAtTop?: boolean;
    showAfterSelector?: string;
    theme?: 'light' | 'dark';
};

type HeaderMenuItem = {
    label: string;
    href: string;
};

const HEADER_MENU_ITEMS: HeaderMenuItem[] = [
    { label: 'Sejarah Kami', href: '/sejarah-kami' },
    { label: 'Kabinet', href: '/kabinet' },
    { label: 'Project', href: '/projects' },
    { label: 'Kegiatan', href: '/kegiatan' },
    { label: 'Sertifikat checker', href: '/certificate-checker' },
];

export default function Header({ onlyShowAtTop = false, showAfterSelector, theme = 'dark' }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hideHeader, setHideHeader] = useState(false);
    const [hideBySection, setHideBySection] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const heroSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        return () => {
            document.body.classList.remove('overflow-hidden');
            document.body.removeAttribute('data-lenis-prevent');
        };
    }, []);

    useEffect(() => {
        heroSectionRef.current = document.querySelector('.hero-section');
        const showAfterElement = showAfterSelector ? document.querySelector(showAfterSelector) : null;
        const footer = document.querySelector('footer');

        let scrollTimeout: number;

        const handleScroll = () => {
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }

            scrollTimeout = requestAnimationFrame(() => {
                if (onlyShowAtTop) {
                    const isAtTop = window.scrollY <= 4;
                    setIsScrolled(!isAtTop);
                    setHideHeader(!isAtTop);
                    return;
                }

                if (showAfterElement) {
                    const passedShowAfterSection = showAfterElement.getBoundingClientRect().bottom <= 0;
                    setIsScrolled(passedShowAfterSection);
                    setHideHeader(!passedShowAfterSection);
                    return;
                }

                if (heroSectionRef.current) {
                    const scrollY = window.scrollY;
                    const heroHeight = heroSectionRef.current.offsetHeight;
                    setIsScrolled(scrollY >= heroHeight / 2);
                } else {
                    setIsScrolled(window.scrollY > 24);
                }

                if (footer) {
                    const footerRect = footer.getBoundingClientRect();
                    const headerHeight = headerRef.current?.offsetHeight || 0;
                    setHideHeader(footerRect.top <= window.innerHeight - headerHeight);
                } else {
                    setHideHeader(false);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        // Run once on mount
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }
        };
    }, [onlyShowAtTop, showAfterSelector]);

    useEffect(() => {
        if (onlyShowAtTop) {
            setHideBySection(false);
            return;
        }

        const hideTrigger = document.querySelector('[data-header-hide-trigger]');
        if (!hideTrigger) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setHideBySection(entry.isIntersecting);
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(hideTrigger);

        return () => {
            observer.disconnect();
        };
    }, [onlyShowAtTop]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.classList.toggle('overflow-hidden', !isMenuOpen);
        if (!isMenuOpen) {
            document.body.setAttribute('data-lenis-prevent', '');
        } else {
            document.body.removeAttribute('data-lenis-prevent');
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.classList.remove('overflow-hidden');
        document.body.removeAttribute('data-lenis-prevent');
    };

    return (
        <header
            ref={headerRef}
            className={`header ${theme === 'light' ? 'header-light' : ''} ${isScrolled ? 'on-scroll' : ''} ${isMenuOpen ? 'menu-is-active' : ''} ${(hideHeader || hideBySection) ? 'header-hidden' : ''}`}
        >
            <nav className="navbar">
                <div className="header-container">
                    <Link href="/" scroll className="brand">
                        <Image
                            src="/kabinet.png"
                            alt="HMTI Logo"
                            width={108}
                            height={24}
                            priority
                        />
                    </Link>

                    <button
                        type="button"
                        className={`burger ${isMenuOpen ? 'is-active' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav-menu"
                    >
                        <div className="burger-line-wrapper">
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                        </div>
                    </button>

                    <div className="menu" id="mobile-nav-menu">
                        <div className="menu-header">
                            <Link href="/" scroll className="brand" onClick={closeMenu}>
                                <svg width="169" height="53" viewBox="0 0 169 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M-4.76837e-07 52.8V0H10.368V21.792H30.112V0H40.448V52.8H30.112V30.88H10.368V52.8H-4.76837e-07ZM52.443 52.8L57.691 0H68.699L81.307 33.024L93.915 0H104.923L110.171 52.8H99.803L96.539 18.624L84.475 51.488H78.107L66.075 18.624L62.779 52.8H52.443ZM126.486 52.8V9.152H113.11V0H150.23V9.152H136.823V52.8H126.486ZM158.625 52.8V0H168.993V52.8H158.625Z" fill="#FFD56C" />
                                </svg>
                            </Link>
                            <button
                                type="button"
                                className={`burger is-active close-menu`}
                                onClick={closeMenu}
                                aria-label="Close menu"
                                aria-controls="mobile-nav-menu"
                            >
                                <div className="burger-line-wrapper">
                                    <span className="burger-line"></span>
                                    <span className="burger-line"></span>
                                    <span className="burger-line"></span>
                                </div>
                            </button>
                        </div>

                        <ul className="menu-inner">
                            {HEADER_MENU_ITEMS.map((item) => (
                                <li key={item.href} className="menu-item">
                                    <Link href={item.href} scroll className="menu-link" onClick={closeMenu}>
                                        <span className="menu-link-content">{item.label}</span>
                                        <span className="menu-link-icon" aria-hidden="true">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="menu-block">
                        <Link href="/admin" className="menu-block-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="currentColor" viewBox="0 0 24 24" >
                                <path d="M12 7c-2 0-3.5 1.5-3.5 3.5S10 14 12 14s3.5-1.5 3.5-3.5S14 7 12 7m0 5c-.88 0-1.5-.62-1.5-1.5S11.12 9 12 9s1.5.62 1.5 1.5S12.88 12 12 12"></path><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M8.18 19c.41-1.16 1.51-2 2.82-2h2c1.3 0 2.4.84 2.82 2H8.19Zm9.71 0a5 5 0 0 0-4.9-4h-2c-2.41 0-4.43 1.72-4.9 4h-1.1V5h14v14z"></path>
                            </svg>
                            Account
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="header-backdrop" onClick={closeMenu}></div>
        </header>
    );
}
