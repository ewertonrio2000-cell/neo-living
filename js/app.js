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
    // 6a. CURSOR CUSTOMIZADO + HOVERS MAGNÉTICOS
    // =====================================================
    function initCustomCursor() {
        if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
        document.body.classList.add('has-custom-cursor');

        // Seletores que mudam o cursor para dourado
        const HOVER_SEL = 'a[href], button, .service-card, .project-card, .highlights-item, .step-card';

        // Movimento suave (lerp)
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let cx = mx, cy = my;
        window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
        (function raf() {
            cx += (mx - cx) * 0.2;
            cy += (my - cy) * 0.2;
            cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) translate(-50%, -50%)';
            requestAnimationFrame(raf);
        })();

        // Delegação (cobre header/footer injetados dinamicamente)
        document.addEventListener('mouseover', (e) => {
            const t = e.target.closest ? e.target.closest(HOVER_SEL) : null;
            if (!t) return;
            cursor.classList.add('is-hover');
            cursor.style.backgroundColor = '#E6B325';
            cursor.style.mixBlendMode = 'normal';
        });
        document.addEventListener('mouseout', (e) => {
            const t = e.target.closest ? e.target.closest(HOVER_SEL) : null;
            if (!t) return;
            const to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(HOVER_SEL) : null;
            if (to) return; // ainda sobre um alvo
            cursor.classList.remove('is-hover');
            cursor.style.backgroundColor = '';
            cursor.style.mixBlendMode = '';
        });

        // ---- Hovers magnéticos (botões) ----
        let magnet = null;
        document.addEventListener('mousemove', (e) => {
            const el = e.target.closest ? e.target.closest('.btn, [data-magnetic]') : null;
            if (el) {
                const r = el.getBoundingClientRect();
                const dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
                const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
                el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                magnet = el;
            } else if (magnet) {
                magnet.style.transform = '';
                magnet = null;
            }
        }, { passive: true });
    }

    // =====================================================
    // 6e. WEBGL — distorção líquida + RGB shift no hover (Our Projects)
    //     Detector de desempenho + falha graciosa (zero regressão)
    // =====================================================
    function initWebGLImageFX() {
        const mm = window.matchMedia;
        if (!mm) return;
        // Gate de desempenho: desktop, ponteiro fino, cores/memória suficientes
        if (mm('(prefers-reduced-motion: reduce)').matches) return;
        if (!mm('(hover: hover) and (pointer: fine)').matches) return;
        if ((navigator.hardwareConcurrency || 4) < 4) return;
        if ((navigator.deviceMemory || 4) < 4) return;
        // Suporte a WebGL
        try {
            const t = document.createElement('canvas').getContext('webgl');
            if (!t) return;
        } catch (e) { return; }

        const VERT =
            'attribute vec2 aPos; varying vec2 vUv;' +
            'void main(){ vUv = (aPos+1.0)*0.5; vUv.y = 1.0-vUv.y; gl_Position = vec4(aPos,0.0,1.0); }';
        const FRAG =
            'precision mediump float; uniform sampler2D uTex; uniform vec2 uPointer; uniform float uAmp; uniform float uTime; varying vec2 vUv;' +
            'void main(){ vec2 uv=vUv; vec2 d=uv-uPointer; float dist=length(d);' +
            'float ripple = sin(dist*20.0 - uTime*4.5)*exp(-dist*6.5)*uAmp*0.035;' +
            'vec2 dir = d/(dist+0.0001);' +
            'vec2 uvR = uv+dir*ripple*1.0; vec2 uvG = uv+dir*ripple*0.65; vec2 uvB = uv+dir*ripple*0.35;' +
            'float r=texture2D(uTex,uvR).r; float g=texture2D(uTex,uvG).g; float b=texture2D(uTex,uvB).b;' +
            'gl_FragColor = vec4(r,g,b,1.0); }';

        function compile(gl, type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
            return s;
        }

        function createFX(media, img) {
            try {
                const canvas = document.createElement('canvas');
                canvas.className = 'project-card__fx';
                const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
                if (!gl) return null;
                const vs = compile(gl, gl.VERTEX_SHADER, VERT);
                const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
                if (!vs || !fs) return null;
                const prog = gl.createProgram();
                gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
                if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
                gl.useProgram(prog);

                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
                const aPos = gl.getAttribLocation(prog, 'aPos');
                gl.enableVertexAttribArray(aPos);
                gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                const uPointer = gl.getUniformLocation(prog, 'uPointer');
                const uAmp = gl.getUniformLocation(prog, 'uAmp');
                const uTime = gl.getUniformLocation(prog, 'uTime');
                gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);

                media.appendChild(canvas);

                const state = { px: 0.5, py: 0.5, amp: 0, target: 0, t: 0, raf: null, dead: false, firstFrame: false };

                function resize() {
                    const r = media.getBoundingClientRect();
                    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
                    canvas.width = Math.max(2, Math.round(r.width * dpr));
                    canvas.height = Math.max(2, Math.round(r.height * dpr));
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }
                resize();

                function frame() {
                    if (state.dead) return;
                    state.t += 0.016;
                    state.amp += (state.target - state.amp) * 0.08;
                    gl.uniform2f(uPointer, state.px, state.py);
                    gl.uniform1f(uAmp, state.amp);
                    gl.uniform1f(uTime, state.t);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    if (!state.firstFrame) { state.firstFrame = true; canvas.classList.add('is-on'); }
                    if (state.amp > 0.002 || state.target > 0) {
                        state.raf = requestAnimationFrame(frame);
                    } else {
                        state.raf = null;
                        canvas.classList.remove('is-on');
                    }
                }

                return {
                    activate() { resize(); state.target = 1; if (!state.raf) state.raf = requestAnimationFrame(frame); },
                    deactivate() { state.target = 0; },
                    setPointer(e) {
                        const r = media.getBoundingClientRect();
                        state.px = (e.clientX - r.left) / r.width;
                        state.py = (e.clientY - r.top) / r.height;
                    }
                };
            } catch (err) { return null; }
        }

        document.querySelectorAll('.project-card').forEach((card) => {
            const media = card.querySelector('.project-card__media');
            const img = media && media.querySelector('img');
            if (!media || !img) return;
            let fx = null;
            const ensure = () => {
                if (fx) return;
                if (img.complete && img.naturalWidth > 0) fx = createFX(media, img);
            };
            card.addEventListener('mouseenter', () => { ensure(); if (fx) fx.activate(); });
            card.addEventListener('mousemove', (e) => { if (fx) fx.setPointer(e); });
            card.addEventListener('mouseleave', () => { if (fx) fx.deactivate(); });
        });
    }

    // =====================================================
    // 6d. GALERIA HORIZONTAL — pin + scroll horizontal
    // =====================================================
    function initHorizontalGallery() {
        const section = document.querySelector('.h-gallery');
        if (!section) return;
        const track = section.querySelector('.h-gallery__track');
        if (!track) return;

        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
        const canGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

        // Fallback: scroll horizontal nativo (mobile, sem GSAP ou reduced-motion)
        if (!canGsap || reduce || isMobile) {
            section.classList.add('h-gallery--native');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: () => '+=' + (track.scrollWidth - window.innerWidth),
                pin: true,
                pinSpacing: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        // Corrige o "travamento" do pin: recalcula posições quando as imagens
        // carregam (o layout muda depois que o ScrollTrigger já foi montado)
        const refresh = () => { try { ScrollTrigger.refresh(); } catch (e) {} };
        window.addEventListener('load', refresh);
        section.querySelectorAll('img').forEach((img) => {
            if (!img.complete) img.addEventListener('load', refresh, { once: true });
        });
        setTimeout(refresh, 600);
        setTimeout(refresh, 1500);
    }

    // =====================================================
    // 6b. REVEALS CINEMATOGRÁFICOS + PARALLAX NAS IMAGENS
    // =====================================================
    function initReveals() {
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Curtain reveal é feito via CSS atrelado a .is-visible (observer do fade-in).

        // ---- Parallax interno nas imagens (object-position, sem conflito com hover) ----
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduce) {
            gsap.registerPlugin(ScrollTrigger);
            gsap.utils.toArray('.project-card__media img, .service-card__media img').forEach((img) => {
                gsap.fromTo(img,
                    { objectPosition: '50% 34%' },
                    {
                        objectPosition: '50% 66%',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: img.closest('.project-card, .service-card') || img,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.6
                        }
                    }
                );
            });
        }
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

    // Garante que a página sempre inicia no topo (hero), evitando o browser
    // restaurar uma posição de rolagem anterior (bug "abre no final" no mobile)
    (function forceTopOnLoad() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        const toTop = () => window.scrollTo(0, 0);
        toTop();
        window.addEventListener('load', toTop, { once: true });
    })();

    // =====================================================
    // 12b. HERO RALLY — dispara entrada horizontal dos cards
    // =====================================================
    function initHeroRally() {
        const rally = document.querySelector('.hero-rally');
        if (!rally) return;
        // Dispara após um pequeno atraso (robusto: não depende de rAF/load)
        setTimeout(() => rally.classList.add('is-rallying'), 450);
    }

    // =====================================================
    // 12d. HERO VÍDEO (4 clipes, 4s cada) + SPOTLIGHT do cursor
    // =====================================================
    function initHeroVideo() {
        const hero = document.querySelector('.hero--editorial');
        if (!hero) return;

        // ---- Carrossel de vídeo ----
        const clips = Array.from(hero.querySelectorAll('.hero-video__clip'));
        if (clips.length) {
            const playSafe = (el) => { try { const p = el.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
            let idx = 0;
            clips[0].classList.add('is-active');
            playSafe(clips[0]);
            // Pré-carrega os demais clipes em segundo plano
            window.addEventListener('load', () => {
                clips.forEach((c, i) => { if (i > 0) { try { c.load(); } catch (e) {} } });
            }, { once: true });

            setInterval(() => {
                const next = (idx + 1) % clips.length;
                try { clips[next].currentTime = 0; } catch (e) {}
                playSafe(clips[next]);
                clips[next].classList.add('is-active');
                clips[idx].classList.remove('is-active');
                const prev = idx;
                setTimeout(() => { try { clips[prev].pause(); } catch (e) {} }, 900);
                idx = next;
            }, 4000);
        }

        // ---- Spotlight que segue o cursor ----
        const spot = hero.querySelector('.hero-spotlight');
        if (spot && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
            hero.addEventListener('mousemove', (e) => {
                const r = hero.getBoundingClientRect();
                spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
                spot.style.opacity = '1';
            });
            hero.addEventListener('mouseleave', () => { spot.style.opacity = '0'; });
        }
    }

    // =====================================================
    // 12. INIT
    // =====================================================
    function init() {
        initLenis();
        initHeader();
        initMobileDrawer();
        initFadeIn();
        initHighlightsHover();
        initCustomCursor();
        initParallax();
        initReveals();
        initHorizontalGallery();
        initWebGLImageFX();
        initHeroEntrance();
        initActiveNav();
        initForm();
        initPageTransitions();
        initHeroRally();
        initHeroVideo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
