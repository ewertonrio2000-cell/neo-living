/* =========================================================
   NEO.LIVING — APP JS
   Smooth scroll (Lenis), GSAP animations, scroll triggers,
   header scroll, mobile drawer, fade-in observer,
   highlights image-on-hover, form interactions
   ========================================================= */

(() => {
    'use strict';

    // =====================================================
    // 1. SMOOTH SCROLL (Lenis)
    // =====================================================
    let lenis = null;

    function initLenis() {
        if (typeof Lenis === 'undefined') return;

        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Sync with GSAP ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }
    }

    // =====================================================
    // 2. HEADER SCROLL EFFECT
    // =====================================================
    function initHeader() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastY = 0;
        function check() {
            const y = window.scrollY;
            if (y > 32) header.classList.add('is-scrolled');
            else header.classList.remove('is-scrolled');
            lastY = y;
        }
        window.addEventListener('scroll', check, { passive: true });
        check();
    }

    // =====================================================
    // 3. MOBILE DRAWER
    // =====================================================
    function initMobileDrawer() {
        const toggle = document.querySelector('.nav-toggle');
        const drawer = document.querySelector('.mobile-drawer');
        if (!toggle || !drawer) return;

        toggle.addEventListener('click', () => {
            const isOpen = drawer.classList.toggle('is-open');
            toggle.classList.toggle('is-active', isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
            if (lenis) {
                isOpen ? lenis.stop() : lenis.start();
            }
        });

        // Close on link click
        drawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                drawer.classList.remove('is-open');
                toggle.classList.remove('is-active');
                document.body.classList.remove('no-scroll');
                if (lenis) lenis.start();
            });
        });
    }

    // =====================================================
    // 4. FADE-IN OBSERVER (Intersection Observer)
    // =====================================================
    function initFadeIn() {
        const els = document.querySelectorAll('.fade-in');
        if (!els.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        });

        els.forEach(el => observer.observe(el));
    }

    // =====================================================
    // 5. HIGHLIGHTS LIST — image on hover
    // =====================================================
    function initHighlightsHover() {
        const items = document.querySelectorAll('.highlights-item');
        const previews = document.querySelectorAll('.highlights-preview__img');
        if (!items.length || !previews.length) return;

        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const idx = item.dataset.index;
                items.forEach(i => i.classList.remove('is-active'));
                previews.forEach(p => p.classList.remove('is-active'));
                item.classList.add('is-active');
                const target = document.querySelector(`.highlights-preview__img[data-index="${idx}"]`);
                if (target) target.classList.add('is-active');
            });
        });

        // Default: first image visible
        if (previews[0]) previews[0].classList.add('is-active');
        if (items[0]) items[0].classList.add('is-active');
    }

    // =====================================================
    // 6. PARALLAX (GSAP ScrollTrigger)
    // =====================================================
    function initParallax() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // Hero media gentle parallax
        gsap.utils.toArray('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            gsap.to(el, {
                yPercent: -20 * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('section') || el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // Watermark horizontal drift
        gsap.utils.toArray('[data-drift]').forEach(el => {
            const dir = parseFloat(el.dataset.drift) || -1;
            gsap.fromTo(el,
                { xPercent: 0 },
                {
                    xPercent: 8 * dir,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        });
    }

    // =====================================================
    // 7. HERO ENTRANCE
    // =====================================================
    function initHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const heroDisplay = document.querySelector('.hero__display');
        const heroMedia = document.querySelector('.hero__media');
        const heroSub = document.querySelector('.hero__sub');
        const heroBottom = document.querySelector('.hero__bottom');

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (heroMedia) {
            tl.fromTo(heroMedia,
                { scale: 1.08, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.6 },
                0
            );
        }
        if (heroDisplay) {
            tl.fromTo(heroDisplay,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2 },
                0.3
            );
        }
        if (heroSub) {
            tl.fromTo(heroSub,
                { y: 24, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                0.5
            );
        }
        if (heroBottom) {
            tl.fromTo(heroBottom.children,
                { y: 32, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
                0.7
            );
        }
    }

    // =====================================================
    // 8. ACTIVE NAV LINK
    // =====================================================
    function initActiveNav() {
        const path = window.location.pathname;
        const links = document.querySelectorAll('.site-nav__link, .mobile-drawer__link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const isMatch = (href === '/' && (path === '/' || path.endsWith('/index.html')))
                || (href !== '/' && path.includes(href.replace('.html', '')));
            if (isMatch) link.classList.add('is-active');
        });
    }

    // =====================================================
    // 9. FORM ENHANCEMENTS
    // =====================================================
    function initForm() {
        const form = document.querySelector('#contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                const original = btn.querySelector('.btn-label')?.textContent || btn.textContent;
                if (btn.querySelector('.btn-label')) {
                    btn.querySelector('.btn-label').textContent = 'Enviado.';
                } else {
                    btn.textContent = 'Enviado.';
                }
                btn.style.color = 'var(--accent-amber)';
                setTimeout(() => {
                    if (btn.querySelector('.btn-label')) {
                        btn.querySelector('.btn-label').textContent = original;
                    } else {
                        btn.textContent = original;
                    }
                    btn.style.color = '';
                    form.reset();
                }, 2400);
            }
        });
    }

    // =====================================================
    // 10. PAGE TRANSITION (subtle wipe on link click)
    // =====================================================
    function initPageTransitions() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background-color: var(--bg-deeper);
            z-index: 200;
            pointer-events: none;
            transform: translateY(100%);
            transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
        `;
        document.body.appendChild(overlay);

        // Fade in body on load
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 600ms ease-out';
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });

        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            // Skip externals, anchors, mailto/tel
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            if (a.target === '_blank') return;

            a.addEventListener('click', (e) => {
                // Allow modifier-clicks
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                overlay.style.transform = 'translateY(0)';
                setTimeout(() => {
                    window.location.href = href;
                }, 480);
            });
        });
    }

    // =====================================================
    // 11. INIT
    // =====================================================
    function init() {
        initLenis();
        initHeader();
        initMobileDrawer();
        initFadeIn();
        initHighlightsHover();
        initParallax();
        initHeroEntrance();
        initActiveNav();
        initForm();
        initPageTransitions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
