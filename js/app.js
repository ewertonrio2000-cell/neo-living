/* =========================================================
   NEO.LIVING — APP JS
   Smooth scroll (Lenis), GSAP animations, scroll triggers,
   header scroll, mobile drawer, fade-in observer,
   highlights image-on-hover, form interactions
   ========================================================= */

(() => {
    'use strict';

    // Surge do véu de digitais no hero: disparado pela troca de vídeo
    // (initHeroVideo) e lido pelo shader (initFingerprintFX)
    let heroSurgeStart = -1e9;

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
    // 6f. FINGERPRINT FX — campo de "digitais" (iso-linhas) em WebGL
    //     Renderiza por pixel em resolução total na GPU: linhas nítidas
    //     (AA por derivadas), deformação do cursor e vinheta lateral.
    // =====================================================
    function initFingerprintFX() {
        const mm = window.matchMedia;
        if (!mm) return;
        if (mm('(prefers-reduced-motion: reduce)').matches) return;
        // Celular: efeito ativo com DPR pleno (cap 2) — linhas finas nítidas
        // em telas de celular; o guarda de 4096px protege as seções altas
        const DPR_CAP = 2;

        const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
        const FRAG =
            '#extension GL_OES_standard_derivatives : enable\n' +
            'precision highp float;\n' +
            'uniform vec2 u_res;uniform float u_dpr;uniform float u_time;\n' +
            'uniform vec2 u_mouse;uniform float u_mouseOn;uniform float u_alpha;\n' +
            'uniform float u_ring;uniform float u_lw;uniform float u_veil;\n' +
            'uniform float u_surge;\n' +
            '#define PI 3.14159265359\n' +
            'void main(){\n' +
            '  float t=u_time;\n' +
            '  vec2 fc=vec2(gl_FragCoord.x, u_res.y-gl_FragCoord.y);\n' +
            '  vec2 res=u_res/u_dpr; vec2 P=fc/u_dpr;\n' +
            // Surge (troca de vídeo): o warp cresce e uma ondulação rápida
            // percorre o campo — as ristas se distorcem visivelmente
            '  float WARP=34.0+18.0*u_surge, WF=0.010;\n' +
            '  float X=P.x + WARP*sin(P.y*WF+t) + WARP*0.5*sin(P.y*WF*2.3-t*0.7);\n' +
            '  float Y=P.y + WARP*sin(P.x*WF-t*0.9) + WARP*0.5*sin(P.x*WF*1.9+t*0.6);\n' +
            '  X += u_surge*6.0*sin(P.y*0.045+t*7.0);\n' +
            '  Y += u_surge*5.0*sin(P.x*0.052-t*6.2);\n' +
            // Deformação do cursor BEM SUTIL: leve respiro nas linhas, sem abrir clareira
            '  if(u_mouseOn>0.5){\n' +
            '    vec2 d=vec2(X,Y)-u_mouse; float dd=dot(d,d);\n' +
            '    float R=min(res.x,res.y)*0.22; float R2=R*R;\n' +
            '    if(dd<R2){ float push=1.0-dd/R2; float p=push*push*0.14; X+=d.x*p; Y+=d.y*p; }\n' +
            '  }\n' +
            // Campo de direção UNITÁRIA (|∇φ|=1): espaçamento IDÊNTICO em todo
            // o campo — a organicidade vem só do warp/ondulação, que não muda
            // a densidade média das linhas
            '  float phi=dot(vec2(X,Y), vec2(0.4832, 0.8755));\n' +
            '  float idx=phi*u_ring/(2.0*PI);\n' +
            '  #ifdef GL_OES_standard_derivatives\n' +
            '    float aa=fwidth(idx);\n' +
            '  #else\n' +
            '    float aa=0.02;\n' +
            '  #endif\n' +
            '  float e=abs(fract(idx)-0.5);\n' +
            '  float fade=smoothstep(0.85, 0.32, aa);\n' +   // tolera densidade alta antes de sumir
            '  float line=(1.0-smoothstep(u_lw, u_lw+aa*1.5, e))*fade;\n' +
            // Aberração cromática nas ristas durante o surge: os canais R e B
            // se deslocam em fases opostas → franjas espectrais nas linhas
            '  float coff=0.14*u_surge;\n' +
            '  float lr=(1.0-smoothstep(u_lw, u_lw+aa*1.5, abs(fract(idx+coff)-0.5)))*fade;\n' +
            '  float lb=(1.0-smoothstep(u_lw, u_lw+aa*1.5, abs(fract(idx-coff)-0.5)))*fade;\n' +
            '  vec3 lineRGB=vec3(lr, line, lb);\n' +
            '  vec3 silver=vec3(206.0,212.0,222.0)/255.0;\n' +
            // Véu: "reflexo" — intensidade varia ao longo das linhas (banda de
            // brilho que desliza + realce especular que acompanha o cursor);
            // nunca 100% sólidas
            '  float shade=1.0;\n' +
            '  if(u_veil>0.5){\n' +
            '    float sheen=0.5+0.5*sin(P.x*0.0038+P.y*0.0021 - t*0.55);\n' +
            '    sheen*=sheen;\n' +
            '    vec2 hl=mix(vec2(res.x*0.62,res.y*0.34), u_mouse, 0.35*u_mouseOn);\n' +
            '    float spec=exp(-distance(P,hl)/(0.5*min(res.x,res.y)));\n' +
            '    shade=0.22+0.68*sheen+0.55*spec;\n' +
            '  }\n' +
            '  vec3 ridge=lineRGB*u_alpha*shade*(1.0+4.6*u_surge);\n' +   // acende FORTE na troca
            // Flash lateral prata: só nas seções escuras (não no véu do hero)
            '  float ex=clamp(min(fc.x, u_res.x-fc.x)/(u_res.x*0.30), 0.0, 1.0);\n' +
            '  float sideSin = P.x < res.x*0.5 ? sin(t*0.7) : sin(t*0.7+PI);\n' +
            '  float env=max(0.0, sideSin); env=env*env*env*0.09*(1.0-u_veil);\n' +
            '  float vig=(1.0-ex)*env;\n' +
            // Véu: VINHETA — sombras fortes nas extremidades; o centro dela
            // desliza levemente com o cursor (interação)
            '  float vshadow=0.0;\n' +
            '  if(u_veil>0.5){\n' +
            '    vec2 vc=vec2(0.5)+(u_mouse/res-vec2(0.5))*0.15*u_mouseOn;\n' +
            '    float vd=distance(P/res, vc);\n' +
            '    vshadow=smoothstep(0.40,0.86,vd)*0.7;\n' +
            '  }\n' +
            '  vec3 col=mix(silver, vec3(1.0,0.93,0.78), u_surge*0.8);\n' +   // esquenta p/ champanhe
            // LUZES com aberração cromática na transição: dois brilhos suaves
            // + um feixe anamórfico horizontal, cada um com canais R/B
            // deslocados em direções opostas (halo espectral)
            '  vec3 lum=vec3(0.0);\n' +
            '  if(u_veil>0.5 && u_surge>0.004){\n' +
            '    vec2 co=vec2(res.x*0.020, -res.y*0.007)*u_surge;\n' +
            '    vec2 L1=res*vec2(0.27+0.05*sin(t*0.5), 0.32+0.05*cos(t*0.42));\n' +
            '    vec2 L2=res*vec2(0.74+0.05*cos(t*0.47), 0.58+0.06*sin(t*0.53));\n' +
            '    float s1q=res.y*res.y*0.048, s2q=res.y*res.y*0.023;\n' +
            '    vec2 dA=P-(L1+co); float r1=exp(-dot(dA,dA)/s1q);\n' +
            '    dA=P-L1;      float g1=exp(-dot(dA,dA)/s1q);\n' +
            '    dA=P-(L1-co); float b1=exp(-dot(dA,dA)/s1q);\n' +
            '    lum += vec3(r1,g1,b1);\n' +
            '    dA=P-(L2+co); float r2=exp(-dot(dA,dA)/s2q);\n' +
            '    dA=P-L2;      float g2=exp(-dot(dA,dA)/s2q);\n' +
            '    dA=P-(L2-co); float b2=exp(-dot(dA,dA)/s2q);\n' +
            '    lum += 0.85*vec3(r2,g2,b2);\n' +
            '    float sy=res.y*0.030, sx=res.x*0.60;\n' +
            '    float yb=res.y*(0.45+0.03*sin(t*0.6));\n' +
            '    float cy=res.y*0.014*u_surge;\n' +
            '    float fx=exp(-abs(P.x-res.x*0.5)/sx);\n' +
            '    lum += 0.9*vec3(exp(-abs(P.y-yb+cy)/sy)*fx, exp(-abs(P.y-yb)/sy)*fx, exp(-abs(P.y-yb-cy)/sy)*fx);\n' +
            '    lum *= u_surge*0.85;\n' +
            '  }\n' +
            '  float aR=clamp(max(max(ridge.r,ridge.g),ridge.b)+vig+max(lum.r,max(lum.g,lum.b)), 0.0, 1.0);\n' +
            '  float outA=vshadow+aR*(1.0-vshadow);\n' +
            '  vec3 rgb=clamp(col*ridge + silver*vig + lum, 0.0, 1.0);\n' +
            '  gl_FragColor=vec4(rgb*(1.0-vshadow), outA);\n' +
            '}';

        document.querySelectorAll('[data-fingerprint]').forEach(setup);

        function setup(host) {
            try {
                const canvas = document.createElement('canvas');
                canvas.className = 'fp-canvas';
                host.insertBefore(canvas, host.firstChild);

                const opts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false };
                const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
                if (!gl) { canvas.remove(); return; }
                gl.getExtension('OES_standard_derivatives');

                function compile(type, src) {
                    const s = gl.createShader(type);
                    gl.shaderSource(s, src); gl.compileShader(s);
                    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
                    return s;
                }
                const vs = compile(gl.VERTEX_SHADER, VERT);
                const fs = compile(gl.FRAGMENT_SHADER, FRAG);
                if (!vs || !fs) { canvas.remove(); return; }
                const prog = gl.createProgram();
                gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
                if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
                gl.useProgram(prog);

                const quad = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, quad);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
                const aLoc = gl.getAttribLocation(prog, 'a');
                gl.enableVertexAttribArray(aLoc);
                gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

                const uRes = gl.getUniformLocation(prog, 'u_res');
                const uDpr = gl.getUniformLocation(prog, 'u_dpr');
                const uTime = gl.getUniformLocation(prog, 'u_time');
                const uMouse = gl.getUniformLocation(prog, 'u_mouse');
                const uMouseOn = gl.getUniformLocation(prog, 'u_mouseOn');
                const uAlpha = gl.getUniformLocation(prog, 'u_alpha');
                const uRing = gl.getUniformLocation(prog, 'u_ring');
                const uLw = gl.getUniformLocation(prog, 'u_lw');
                const uVeil = gl.getUniformLocation(prog, 'u_veil');
                const uSurge = gl.getUniformLocation(prog, 'u_surge');

                // Variante "véu" no hero: ristas finíssimas e densas (+50% no
                // centro), reflexo deslizante, vinheta com sombra nas bordas.
                // O alpha das ristas fica baixo (0.20) e a força da vinheta vem
                // da opacity 0.55 do canvas no CSS.
                const isVeil = host.classList.contains('hero--editorial');
                const P_RING = 1.90;                    // linhas bem juntas e UNIFORMES (~3.3px em todo o campo)
                const P_LW = 0.024;                     // espessura fio de cabelo
                const P_ALPHA = isVeil ? 0.20 : 0.42;   // seções escuras um pouco mais presentes

                let DPR = 1;
                function resize() {
                    const r = host.getBoundingClientRect();
                    DPR = Math.min(window.devicePixelRatio || 1, DPR_CAP);
                    // GPUs de celular podem limitar buffers a 4096px — em seções
                    // muito altas (ex.: dark-band no mobile) reduz o DPR p/ caber
                    const maxSide = Math.max(r.width, r.height);
                    if (maxSide * DPR > 4096) DPR = 4096 / maxSide;
                    canvas.width = Math.max(2, Math.round(r.width * DPR));
                    canvas.height = Math.max(2, Math.round(r.height * DPR));
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }
                resize();
                window.addEventListener('resize', resize, { passive: true });

                // cursor: alvo (mtx/mty) + posição suavizada (mx/my), em px CSS
                let mtx = 0, mty = 0, mx = 0, my = 0, mact = false;
                host.addEventListener('mousemove', (e) => {
                    const r = host.getBoundingClientRect();
                    mtx = e.clientX - r.left; mty = e.clientY - r.top; mact = true;
                }, { passive: true });
                host.addEventListener('mouseleave', () => { mact = false; });

                // Toque (celular): o dedo deforma as linhas e move o reflexo,
                // igual ao cursor no desktop
                function onTouch(e) {
                    if (!e.touches || !e.touches[0]) return;
                    const r = host.getBoundingClientRect();
                    mtx = e.touches[0].clientX - r.left;
                    mty = e.touches[0].clientY - r.top;
                    mact = true;
                }
                host.addEventListener('touchstart', onTouch, { passive: true });
                host.addEventListener('touchmove', onTouch, { passive: true });
                host.addEventListener('touchend', () => { mact = false; }, { passive: true });
                host.addEventListener('touchcancel', () => { mact = false; }, { passive: true });

                let t = 0, last = 0, visible = false, raf = null;
                function frame(now) {
                    raf = requestAnimationFrame(frame);
                    if (!visible) return;
                    const dt = now - last;
                    if (dt < 16) return;              // ~60fps
                    last = now;
                    t += 0.7 * Math.min(0.05, dt / 1000);
                    mx += (mtx - mx) * 0.15; my += (mty - my) * 0.15;
                    gl.uniform2f(uRes, canvas.width, canvas.height);
                    gl.uniform1f(uDpr, DPR);
                    gl.uniform1f(uTime, t);
                    gl.uniform2f(uMouse, mx, my);
                    gl.uniform1f(uMouseOn, mact ? 1 : 0);
                    gl.uniform1f(uAlpha, P_ALPHA);
                    gl.uniform1f(uRing, P_RING);
                    gl.uniform1f(uLw, P_LW);
                    gl.uniform1f(uVeil, isVeil ? 1 : 0);
                    // Surge da troca de vídeo (só no véu do hero): ataque
                    // rápido (~300ms) e decaimento suave (~1.9s)
                    let surge = 0;
                    if (isVeil) {
                        const el = (now - heroSurgeStart) / 1000;
                        if (el > 0 && el < 2.6) {
                            surge = el < 0.45 ? (el / 0.45) : Math.pow(1 - (el - 0.45) / 2.15, 1.4);
                        }
                    }
                    gl.uniform1f(uSurge, surge);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }

                if ('IntersectionObserver' in window) {
                    new IntersectionObserver((entries) => {
                        visible = entries[0].isIntersecting;
                    }, { threshold: 0.02 }).observe(host);
                } else {
                    visible = true;
                }
                raf = requestAnimationFrame(frame);
            } catch (e) { /* falha graciosa */ }
        }
    }

    // =====================================================
    // 6e. CATEGORIAS — pastas de projetos por tipologia
    //     Clique abre a "gaveta" com os projetos da categoria
    // =====================================================
    function initCategoryFolders() {
        const folders = Array.from(document.querySelectorAll('.h-panel[data-cat]'));
        const drawer = document.querySelector('.cat-drawer');
        const grid = drawer && drawer.querySelector('.cat-drawer__grid');
        if (!folders.length || !drawer || !grid || !window.NEO_PROJECTS) return;

        // Agrupa os projetos por categoria
        const byCat = {};
        window.NEO_PROJECTS.forEach((p) => {
            if (!p.category) return;
            (byCat[p.category] = byCat[p.category] || []).push(p);
        });

        // Contadores nos painéis ("12 projetos") — no lugar da localização
        folders.forEach((f) => {
            const n = (byCat[f.dataset.cat] || []).length;
            const el = f.querySelector('.h-panel__loc');
            if (el) el.textContent = n + (n === 1 ? ' projeto' : ' projetos');
        });

        let open = null;
        folders.forEach((f) => {
            f.addEventListener('click', (ev) => {
                ev.preventDefault();
                const cat = f.dataset.cat;

                // Clicou na pasta já aberta → fecha a gaveta
                if (open === cat) {
                    open = null;
                    drawer.hidden = true;
                    drawer.classList.remove('is-open');
                    folders.forEach((x) => { x.classList.remove('is-open'); x.setAttribute('aria-expanded', 'false'); });
                    return;
                }

                open = cat;
                folders.forEach((x) => {
                    const on = x === f;
                    x.classList.toggle('is-open', on);
                    x.setAttribute('aria-expanded', on ? 'true' : 'false');
                });

                grid.innerHTML = (byCat[cat] || []).map((p) => {
                    const media = p.coverImage
                        ? '<span class="cat-item__media"><img src="' + p.coverImage + '" alt="" loading="lazy"></span>'
                        : '<span class="cat-item__media cat-item__media--blank"><span>' + p.index + '</span></span>';
                    return '<a class="cat-item" href="project.html?id=' + p.id + '">' + media +
                           '<span class="cat-item__name">' + p.name + '</span>' +
                           '<span class="cat-item__loc">' + p.location + '</span></a>';
                }).join('');

                drawer.hidden = false;
                // reinicia a animação de abertura da gaveta
                drawer.classList.remove('is-open');
                void drawer.offsetWidth;
                drawer.classList.add('is-open');
                // leva o visitante até a gaveta (logo abaixo do tabuleiro)
                if (lenis && lenis.scrollTo) lenis.scrollTo(drawer, { offset: -90, duration: 1.1 });
                else drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // =====================================================
    // 6f2. MODAL DE PROJETO — janela cinematográfica na página
    //      Ficha técnica + carrossel (crossfade + Ken Burns),
    //      título dourado; intercepta os cliques da gaveta.
    // =====================================================
    function initProjectModal() {
        if (!window.NEO_PROJECTS) return;

        // ---- estrutura (criada uma vez) ----
        const modal = document.createElement('div');
        modal.className = 'pmodal';
        modal.hidden = true;
        modal.innerHTML =
            '<div class="pmodal__backdrop"></div>' +
            '<div class="pmodal__dialog" role="dialog" aria-modal="true">' +
            '  <button type="button" class="pmodal__close" aria-label="Fechar">✕</button>' +
            '  <div class="pmodal__media">' +
            '    <div class="pmodal__slides"></div>' +
            '    <button type="button" class="pmodal__nav pmodal__nav--prev" aria-label="Anterior">←</button>' +
            '    <button type="button" class="pmodal__nav pmodal__nav--next" aria-label="Próxima">→</button>' +
            '    <span class="pmodal__count"></span>' +
            '  </div>' +
            '  <div class="pmodal__sheet">' +
            '    <p class="pmodal__idx"></p>' +
            '    <h3 class="pmodal__title"></h3>' +
            '    <p class="pmodal__tagline"></p>' +
            '    <dl class="pmodal__specs"></dl>' +
            '    <div class="pmodal__desc"></div>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(modal);

        const slides = modal.querySelector('.pmodal__slides');
        const count = modal.querySelector('.pmodal__count');
        const elIdx = modal.querySelector('.pmodal__idx');
        const elTitle = modal.querySelector('.pmodal__title');
        const elTagline = modal.querySelector('.pmodal__tagline');
        const elSpecs = modal.querySelector('.pmodal__specs');
        const elDesc = modal.querySelector('.pmodal__desc');

        let imgs = [], cur = 0, timer = null, isOpen = false;
        let videoLayer = null, videoOpen = false;

        // ---- vídeo do projeto (miniatura no canto → preenche a tela) ----
        function openVideo(p) {
            if (!p.video) return;
            if (!videoLayer) {
                videoLayer = document.createElement('div');
                videoLayer.className = 'pmodal__video';
                videoLayer.hidden = true;
                modal.appendChild(videoLayer);
            }
            const start = p.videoStart ? '&start=' + p.videoStart : '';
            videoLayer.innerHTML =
                '<iframe src="https://www.youtube-nocookie.com/embed/' + p.video +
                '?autoplay=1&rel=0&modestbranding=1&playsinline=1' + start +
                '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>' +
                '<button type="button" class="pmodal__close" aria-label="Fechar vídeo">✕</button>';
            videoLayer.querySelector('.pmodal__close').addEventListener('click', closeVideo);
            videoOpen = true;
            videoLayer.hidden = false;
            requestAnimationFrame(() => { requestAnimationFrame(() => { videoLayer.classList.add('is-on'); }); });
        }

        function closeVideo(immediate) {
            if (!videoLayer || !videoOpen) return;
            videoOpen = false;
            videoLayer.classList.remove('is-on');
            const finish = () => { videoLayer.hidden = true; videoLayer.innerHTML = ''; };  // remove o iframe → para o áudio
            if (immediate === true) finish(); else setTimeout(finish, 620);
        }

        function pad2(n) { return n < 10 ? '0' + n : String(n); }
        function esc(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function show(i) {
            if (!imgs.length) return;
            cur = (i + imgs.length) % imgs.length;
            imgs.forEach((im, j) => im.classList.toggle('is-active', j === cur));
            count.textContent = pad2(cur + 1) + ' / ' + pad2(imgs.length);
        }
        function restartAuto() {
            if (timer) clearInterval(timer);
            timer = setInterval(() => { show(cur + 1); }, 4500);
        }

        function open(id) {
            const p = window.NEO_findProject ? window.NEO_findProject(id)
                    : window.NEO_PROJECTS.find((x) => x.id === id);
            if (!p) return;

            // carrossel — galeria do projeto (fallback: arte da categoria)
            const gal = (p.gallery && p.gallery.length) ? p.gallery
                      : ['assets/images/categorias/' + (p.category || 'casas') + '.svg'];
            slides.innerHTML = '';
            imgs = gal.map((src) => {
                const im = document.createElement('img');
                im.src = src; im.alt = p.name; im.loading = 'eager';
                slides.appendChild(im);
                return im;
            });
            const nav = imgs.length > 1;
            modal.querySelector('.pmodal__nav--prev').style.display = nav ? '' : 'none';
            modal.querySelector('.pmodal__nav--next').style.display = nav ? '' : 'none';
            count.style.display = nav ? '' : 'none';
            show(0);
            if (nav) restartAuto();

            // ficha técnica
            elIdx.textContent = '_' + (p.index || '');
            elTitle.textContent = p.name || '';
            const tl = (p.tagline || '').trim();
            elTagline.textContent = tl;
            elTagline.style.display = tl ? '' : 'none';
            const rows = [
                ['Localização', p.location],
                ['Tipologia', p.tag],
                ['Ano', p.year],
                ['Área', p.area],
                ['Status', p.status],
                ['Arquitetura', p.credits && p.credits.architecture]
            ].filter((r) => r[1] && String(r[1]).trim());
            elSpecs.innerHTML = rows.map((r) =>
                '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('');
            // descrições: pula os placeholders "[...]"
            const descs = [p.description1, p.description2]
                .filter((d) => d && d.trim() && d.trim().charAt(0) !== '[');
            elDesc.innerHTML = descs.map((d) => '<p>' + esc(d) + '</p>').join('');

            // vídeo do projeto: miniatura no canto inferior direito do quadro
            const oldBtn = modal.querySelector('.pmodal__filmbtn');
            if (oldBtn) oldBtn.remove();
            if (p.video) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'pmodal__filmbtn';
                btn.setAttribute('aria-label', 'Assistir filme do projeto');
                btn.innerHTML = '<img src="https://i.ytimg.com/vi/' + p.video +
                                '/hqdefault.jpg" alt="" loading="lazy">';
                btn.addEventListener('click', () => { openVideo(p); });
                modal.querySelector('.pmodal__dialog').appendChild(btn);
            }

            // abre
            isOpen = true;
            modal.hidden = false;
            document.body.classList.add('no-scroll');
            if (lenis) lenis.stop();
            requestAnimationFrame(() => { requestAnimationFrame(() => { modal.classList.add('is-open'); }); });
        }

        function close() {
            if (!isOpen) return;
            isOpen = false;
            closeVideo(true);
            modal.classList.remove('is-open');
            if (timer) { clearInterval(timer); timer = null; }
            setTimeout(() => {
                modal.hidden = true;
                document.body.classList.remove('no-scroll');
                if (lenis) lenis.start();
            }, 420);
        }

        // navegação do carrossel
        modal.querySelector('.pmodal__nav--prev').addEventListener('click', () => { show(cur - 1); restartAuto(); });
        modal.querySelector('.pmodal__nav--next').addEventListener('click', () => { show(cur + 1); restartAuto(); });
        modal.querySelector('.pmodal__close').addEventListener('click', close);
        modal.querySelector('.pmodal__backdrop').addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') { if (videoOpen) closeVideo(); else close(); }
            else if (videoOpen) { /* setas não navegam com o vídeo aberto */ }
            else if (e.key === 'ArrowLeft') { show(cur - 1); restartAuto(); }
            else if (e.key === 'ArrowRight') { show(cur + 1); restartAuto(); }
        });

        // intercepta os projetos da gaveta E os destaques (delegação)
        document.addEventListener('click', (e) => {
            const a = e.target.closest && e.target.closest('.cat-item, .f-card');
            if (!a) return;
            const m = (a.getAttribute('href') || '').match(/id=([\w-]+)/);
            if (!m) return;
            e.preventDefault();
            open(m[1]);
        });
    }

    // =====================================================
    // 6d. GALERIA HORIZONTAL — pin + scroll horizontal
    // =====================================================
    function initHorizontalGallery() {
        const wrap = document.querySelector('.h-gallery-wrap');
        if (!wrap) return;
        const section = wrap.querySelector('.h-gallery');
        const track = section && section.querySelector('.h-gallery__track');
        if (!section || !track) return;

        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

        // Fallback: scroll horizontal nativo (mobile / reduced-motion)
        if (reduce || isMobile) {
            wrap.style.height = 'auto';
            section.classList.add('h-gallery--native');
            return;
        }

        let overflow = 0;

        // Altura do wrapper = 100vh + overflow horizontal (quanto scroll extra)
        function measure() {
            overflow = Math.max(0, track.scrollWidth - window.innerWidth);
            wrap.style.height = (window.innerHeight + overflow) + 'px';
            render();
        }

        // Traduz o track conforme o progresso do scroll dentro do wrapper
        function render() {
            const rect = wrap.getBoundingClientRect();
            const total = wrap.offsetHeight - window.innerHeight;
            let p = total > 0 ? (-rect.top / total) : 0;
            p = p < 0 ? 0 : (p > 1 ? 1 : p);
            track.style.transform = 'translate3d(' + (-p * overflow) + 'px, 0, 0)';
        }

        measure();
        window.addEventListener('resize', measure, { passive: true });
        window.addEventListener('scroll', render, { passive: true });
        if (lenis && lenis.on) lenis.on('scroll', render);

        // Recalcula quando as imagens carregam (layout muda depois)
        section.querySelectorAll('img').forEach((img) => {
            if (!img.complete) img.addEventListener('load', measure, { once: true });
        });
        window.addEventListener('load', measure);
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
            // links de projeto abrem o MODAL na própria página (não navegam)
            if (a.classList.contains('f-card') || a.classList.contains('cat-item')) return;

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

            // Celular: vídeos VERTICAIS dedicados (9:16, recorte composto em
            // resolução plena) — mais nítidos e ~metade do peso dos horizontais
            if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
                clips.forEach((c, i) => {
                    try {
                        if (i === 0) c.poster = 'assets/images/hero/hero-poster-v.jpg';
                        c.src = 'assets/videos/hero-' + (i + 1) + '-v.mp4';
                        c.load();
                    } catch (e) {}
                });
            }

            let idx = 0;
            clips[0].classList.add('is-active');
            playSafe(clips[0]);
            // Pré-carrega os demais clipes em segundo plano
            window.addEventListener('load', () => {
                clips.forEach((c, i) => { if (i > 0) { try { c.load(); } catch (e) {} } });
            }, { once: true });

            // Distorção do PRÓPRIO VÍDEO na troca: anima a escala do
            // feDisplacementMap (turbulência SVG) com ataque/decaimento,
            // no mesmo envelope do surge das digitais
            const videoWrap = hero.querySelector('.hero-video');
            const dispMap = document.querySelector('#heroWarp feDisplacementMap');
            const offR = document.getElementById('hwR');
            const offB = document.getElementById('hwB');
            const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
            const isNarrow = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            const WARP_PEAK = isCoarse ? 24 : 40;     // deslocamento sutil (px)
            const CHROMA_PEAK = (isCoarse || isNarrow) ? 26 : 24;   // separação R/B — forte e presente

            // Celular: navegadores móveis (sobretudo iOS/Safari) IGNORAM filtros
            // SVG em elementos HTML — a aberração do vídeo não aparecia. Aqui ela
            // é feita em WebGL: o vídeo vira textura e os canais R/B são amostrados
            // deslocados, com o mesmo grade fosco do CSS por cima.
            const useGlChroma = isCoarse || isNarrow;
            let chromaFx;
            function ensureChromaFx() {
                if (chromaFx !== undefined) return chromaFx;
                chromaFx = null;
                try {
                    const cv = document.createElement('canvas');
                    cv.className = 'hero-chroma';
                    videoWrap.appendChild(cv);
                    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
                    if (!gl) { cv.remove(); return chromaFx; }
                    const VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}';
                    const FS = 'precision mediump float;varying vec2 v;' +
                        'uniform sampler2D u_tex;uniform float u_alpha;uniform vec2 u_off;uniform vec2 u_warp;uniform float u_time;uniform vec2 u_scale;' +
                        'void main(){' +
                        '  vec2 uv=(v-0.5)*u_scale+0.5;' +
                        '  uv+=u_warp*vec2(sin(uv.y*9.0+u_time*3.1), sin(uv.x*8.0-u_time*2.7));' +
                        '  float r=texture2D(u_tex, clamp(uv+u_off, 0.0, 1.0)).r;' +
                        '  float g=texture2D(u_tex, clamp(uv, 0.0, 1.0)).g;' +
                        '  float b=texture2D(u_tex, clamp(uv-u_off, 0.0, 1.0)).b;' +
                        '  vec3 c=vec3(r,g,b);' +
                        '  c=(c-0.5)*0.9+0.5;' +                                       // contrast .9
                        '  float l=dot(c,vec3(0.2126,0.7152,0.0722));' +
                        '  c=mix(vec3(l),c,0.78)*0.7;' +                               // saturate .78 * brightness .7
                        '  gl_FragColor=vec4(c*u_alpha, u_alpha);' +
                        '}';
                    function sh(t, s) {
                        const o = gl.createShader(t);
                        gl.shaderSource(o, s); gl.compileShader(o);
                        return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
                    }
                    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
                    if (!vs || !fs) { cv.remove(); return chromaFx; }
                    const pr = gl.createProgram();
                    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
                    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return chromaFx; }
                    gl.useProgram(pr);
                    const buf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
                    const aL = gl.getAttribLocation(pr, 'a');
                    gl.enableVertexAttribArray(aL);
                    gl.vertexAttribPointer(aL, 2, gl.FLOAT, false, 0, 0);
                    const tex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    const U = {};
                    ['u_alpha', 'u_off', 'u_warp', 'u_time', 'u_scale'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
                    chromaFx = {
                        show() { cv.classList.add('is-on'); },
                        hide() { cv.classList.remove('is-on'); },
                        draw(video, env, el) {
                            if (!video || video.readyState < 2 || !video.videoWidth) return;
                            const r = videoWrap.getBoundingClientRect();
                            const DPR = Math.min(window.devicePixelRatio || 1, 2);
                            const w = Math.max(2, Math.round(r.width * DPR));
                            const h = Math.max(2, Math.round(r.height * DPR));
                            if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
                            gl.viewport(0, 0, w, h);
                            gl.bindTexture(gl.TEXTURE_2D, tex);
                            try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); } catch (e) { return; }
                            // mapeamento "cover" (mesma lógica do object-fit do CSS)
                            const ca = r.width / r.height, ta = video.videoWidth / video.videoHeight;
                            if (ta > ca) gl.uniform2f(U.u_scale, ca / ta, 1);
                            else gl.uniform2f(U.u_scale, 1, ta / ca);
                            const off = (CHROMA_PEAK * env) / r.width;
                            gl.uniform2f(U.u_off, off, -off * 0.35);
                            const wamp = (WARP_PEAK * env * 0.5) / r.width;
                            gl.uniform2f(U.u_warp, wamp, wamp * 0.8);
                            gl.uniform1f(U.u_time, el);
                            gl.uniform1f(U.u_alpha, Math.min(1, env * 0.85));
                            gl.drawArrays(gl.TRIANGLES, 0, 6);
                        }
                    };
                } catch (e) { chromaFx = null; }
                return chromaFx;
            }

            let warpRaf = null;
            function warpBurst() {
                if (!videoWrap) return;
                // Celular: overlay WebGL (croma + warp) — funciona em todos os browsers
                if (useGlChroma) {
                    const fx = ensureChromaFx();
                    if (!fx) return;
                    if (warpRaf) cancelAnimationFrame(warpRaf);
                    const t0 = performance.now();
                    fx.show();
                    (function step(now) {
                        const el = (now - t0) / 1000;
                        if (el >= 2.6) { fx.hide(); warpRaf = null; return; }
                        // ataque mais lento (450ms) e decaimento longo (2.15s):
                        // a aberração fica em cena, dá tempo de ser presenciada
                        const env = el < 0.45 ? (el / 0.45) : Math.pow(1 - (el - 0.45) / 2.15, 1.4);
                        const active = hero.querySelector('.hero-video__clip.is-active') || clips[idx];
                        fx.draw(active, env, el);
                        warpRaf = requestAnimationFrame(step);
                    })(t0);
                    return;
                }
                if (!dispMap) return;
                if (warpRaf) cancelAnimationFrame(warpRaf);
                const t0 = performance.now();
                videoWrap.classList.add('is-warping');
                (function step(now) {
                    const el = (now - t0) / 1000;
                    if (el >= 2.6) {
                        dispMap.setAttribute('scale', '0');
                        if (offR) { offR.setAttribute('dx', '0'); offR.setAttribute('dy', '0'); }
                        if (offB) { offB.setAttribute('dx', '0'); offB.setAttribute('dy', '0'); }
                        videoWrap.classList.remove('is-warping');
                        warpRaf = null;
                        return;
                    }
                    const env = el < 0.45 ? (el / 0.45) : Math.pow(1 - (el - 0.45) / 2.15, 1.4);
                    dispMap.setAttribute('scale', String((env * WARP_PEAK).toFixed(1)));
                    // chromatic aberration: R e B puxam em direções opostas
                    const ch = env * CHROMA_PEAK;
                    if (offR) { offR.setAttribute('dx', ch.toFixed(1)); offR.setAttribute('dy', (-ch * 0.35).toFixed(1)); }
                    if (offB) { offB.setAttribute('dx', (-ch).toFixed(1)); offB.setAttribute('dy', (ch * 0.35).toFixed(1)); }
                    warpRaf = requestAnimationFrame(step);
                })(t0);
            }

            setInterval(() => {
                const next = (idx + 1) % clips.length;
                // dispara o SURGE do véu de digitais + a DISTORÇÃO do vídeo:
                // pico casa com o início do melt (ataque ~300ms ≈ swap 420ms)
                heroSurgeStart = performance.now();
                warpBurst();
                // 1) AQUECE o próximo clipe antes da troca: seek + play com o vídeo
                //    ainda invisível → decoder pronto, sem engasgo na entrada
                try { if (clips[next].readyState > 2) clips[next].currentTime = 0; } catch (e) {}
                playSafe(clips[next]);
                setTimeout(() => {
                    // 2) o vídeo atual "derrete" (desfoca+amplia+escurece) enquanto
                    //    o próximo entra desfocado/ampliado e assenta nítido
                    const prev = idx;
                    clips[prev].classList.remove('is-active');
                    clips[prev].classList.add('is-leaving');
                    clips[next].classList.add('is-active');
                    idx = next;
                    // 3) limpeza após o fim das transições
                    setTimeout(() => {
                        clips[prev].classList.remove('is-leaving');
                        try { clips[prev].pause(); } catch (e) {}
                    }, 1400);
                }, 420);
            }, 4000);
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
        initFingerprintFX();
        initCategoryFolders();
        initProjectModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
