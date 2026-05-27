/* =========================================================
   NEO.LIVING — PROJECT PAGE RENDERER
   Reads ?id= from URL, finds project in window.NEO_PROJECTS,
   renders the template, sets up lightbox.
   ========================================================= */

(() => {
    'use strict';

    // =====================================================
    // 1. ROUTING — read ?id= and find project
    // =====================================================
    function getProjectIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // =====================================================
    // 2. RENDER 404
    // =====================================================
    function render404(root, requestedId) {
        root.innerHTML = `
            <section class="project-404">
                <p class="project-404__code">404</p>
                <p class="project-404__title">Projeto não encontrado.</p>
                <p class="project-404__sub">
                    ${requestedId
                        ? `O ID <strong style="color: var(--accent-amber);">${escapeHTML(requestedId)}</strong> não corresponde a nenhum projeto do portfólio NEO.LIVING.`
                        : 'Nenhum projeto foi especificado na URL.'}
                </p>
                <a href="index.html#highlights" class="btn btn-primary">
                    <span>Ver portfólio</span>
                    <span class="arrow" aria-hidden="true">→</span>
                </a>
            </section>
        `;
        document.title = 'NEO.LIVING — Projeto não encontrado';
    }

    // =====================================================
    // 3. RENDER PROJECT
    // =====================================================
    function renderProject(root, project) {
        document.title = `NEO.LIVING — ${project.name}`;

        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', `${project.name} — ${project.tagline || 'Projeto NEO.LIVING.'}`);
        }

        const next = window.NEO_getNextProject(project.id);
        const prev = window.NEO_getPrevProject(project.id);

        const hasGallery = project.gallery && project.gallery.length > 0;
        const hasCover = !!project.coverImage;

        root.innerHTML = `
            <!-- HERO DO PROJETO -->
            <section class="project-hero">
                <div class="project-hero__media">
                    ${hasCover
                        ? `<img src="${escapeAttr(project.coverImage)}" alt="${escapeAttr(project.name)}" loading="eager" fetchpriority="high">`
                        : `<div class="placeholder-img"><span class="placeholder-img__label">_ ${escapeHTML(project.name)} · capa em breve</span></div>`}
                </div>
                <div class="project-hero__overlay"></div>

                <div class="project-hero__content">
                    <a href="index.html#highlights" class="project-hero__back fade-in">
                        <span class="arrow" aria-hidden="true">←</span>
                        <span>Voltar ao portfólio</span>
                    </a>
                    <p class="project-hero__index fade-in fade-in-delay-1">_ ${escapeHTML(project.index)}</p>
                    <h1 class="project-hero__name fade-in fade-in-delay-2">${escapeHTML(project.name)}</h1>
                    <p class="project-hero__location fade-in fade-in-delay-3">${escapeHTML(project.location)}</p>
                    ${project.tagline ? `<p class="project-hero__tagline fade-in fade-in-delay-4">${escapeHTML(project.tagline)}</p>` : ''}
                </div>
            </section>

            <!-- FICHA TÉCNICA -->
            <section class="project-spec">
                <div class="project-spec__inner">
                    ${specItem('Localização', project.location)}
                    ${specItem('Tipologia', project.tag)}
                    ${specItem('Ano', project.year)}
                    ${specItem('Área', project.area)}
                    ${specItem('Status', project.status)}
                </div>
            </section>

            <!-- TEXTO EDITORIAL -->
            <section class="project-text">
                <div class="project-text__inner">
                    <p class="t-eyebrow project-text__eyebrow fade-in">_ Sobre o projeto</p>
                    <p class="project-text__body ${isPlaceholder(project.description1) ? 'is-placeholder' : ''} fade-in fade-in-delay-1">
                        ${escapeHTML(project.description1 || '')}
                    </p>
                    ${project.tagline ? `
                        <p class="project-text__quote fade-in fade-in-delay-2">
                            "${escapeHTML(project.tagline)}"
                        </p>
                    ` : ''}
                    <p class="project-text__body ${isPlaceholder(project.description2) ? 'is-placeholder' : ''} fade-in fade-in-delay-3">
                        ${escapeHTML(project.description2 || '')}
                    </p>
                </div>
            </section>

            <!-- GALERIA -->
            <section class="project-gallery">
                <div class="project-gallery__head fade-in">
                    <p class="t-eyebrow" style="margin-bottom: 16px;">_ Galeria</p>
                    <h2 class="t-h1">${hasGallery && project.gallery.length > 1 ? 'Imagens do projeto.' : (hasGallery ? 'Imagem do projeto.' : 'Imagens em breve.')}</h2>
                </div>

                ${hasGallery
                    ? `<div class="project-gallery__grid">
                        ${project.gallery.map((src, i) => `
                            <div class="project-gallery__item fade-in" data-lightbox-idx="${i}">
                                <img src="${escapeAttr(src)}" alt="${escapeAttr(project.name)} — imagem ${i + 1}" loading="lazy">
                            </div>
                        `).join('')}
                       </div>`
                    : `<div style="width: 100%; max-width: var(--max-content); margin: 0 auto; padding-left: var(--gutter-desktop); padding-right: var(--gutter-desktop);">
                        <div class="project-gallery__empty fade-in">
                            <p class="project-gallery__empty-icon">_</p>
                            <p class="project-gallery__empty-title">Galeria em breve</p>
                            <p class="project-gallery__empty-text">
                                As imagens deste projeto estão sendo selecionadas e em breve estarão disponíveis no portfólio NEO.LIVING.
                            </p>
                        </div>
                       </div>`}
            </section>

            <!-- CREDITS -->
            <section class="project-credits">
                <div class="project-credits__inner">
                    <div class="project-credits__head fade-in">
                        <p class="t-eyebrow" style="margin-bottom: 16px;">_ Créditos</p>
                        <h2 class="t-h2">Ficha do Projeto.</h2>
                    </div>
                    <div class="project-credits__list">
                        ${creditRow('Arquitetura', project.credits.architecture)}
                        ${creditRow('Fotografia', project.credits.photography)}
                        ${creditRow('Ano', project.credits.year)}
                    </div>
                </div>
            </section>

            <!-- NAVEGAÇÃO ENTRE PROJETOS -->
            <section class="project-nav">
                <div class="project-nav__inner">
                    <a href="project.html?id=${prev.id}" class="project-nav__link project-nav__link--prev">
                        <span class="project-nav__direction">
                            <span class="arrow">←</span>
                            <span>Projeto anterior</span>
                        </span>
                        <span class="project-nav__name">${escapeHTML(prev.name)}</span>
                        <span class="project-nav__location">${escapeHTML(prev.location)}</span>
                    </a>

                    <a href="project.html?id=${next.id}" class="project-nav__link project-nav__link--next">
                        <span class="project-nav__direction">
                            <span>Próximo projeto</span>
                            <span class="arrow">→</span>
                        </span>
                        <span class="project-nav__name">${escapeHTML(next.name)}</span>
                        <span class="project-nav__location">${escapeHTML(next.location)}</span>
                    </a>
                </div>
            </section>
        `;

        // Trigger fade-in observer for the newly inserted nodes
        triggerFadeIn();

        // Wire up lightbox
        if (hasGallery) {
            initLightbox(project.gallery);
        }
    }

    // =====================================================
    // Helper renderers
    // =====================================================
    function specItem(label, value) {
        const isEmpty = !value || value.trim() === '';
        return `
            <div class="project-spec__item fade-in">
                <span class="project-spec__label">_ ${escapeHTML(label)}</span>
                <span class="project-spec__value ${isEmpty ? 'project-spec__value--empty' : ''}">
                    ${isEmpty ? 'a definir' : escapeHTML(value)}
                </span>
            </div>
        `;
    }

    function creditRow(label, value) {
        const isEmpty = !value || value.trim() === '';
        return `
            <div class="project-credits__row">
                <span class="project-credits__label">_ ${escapeHTML(label)}</span>
                <span class="project-credits__value ${isEmpty ? 'project-credits__value--empty' : ''}">
                    ${isEmpty ? 'a definir' : escapeHTML(value)}
                </span>
            </div>
        `;
    }

    function isPlaceholder(text) {
        return !text || text.startsWith('[Descrição') || text.startsWith('[Texto');
    }

    function escapeHTML(str) {
        if (str === undefined || str === null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttr(str) {
        return escapeHTML(str);
    }

    function triggerFadeIn() {
        // Re-run observer for newly inserted .fade-in elements
        const els = document.querySelectorAll('.fade-in:not(.is-visible)');
        if (!els.length || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        els.forEach(el => observer.observe(el));
    }

    // =====================================================
    // 4. LIGHTBOX
    // =====================================================
    function initLightbox(images) {
        const overlay = document.getElementById('lightbox');
        const imgEl = document.getElementById('lb-img');
        const counterEl = document.getElementById('lb-counter');
        const closeBtn = document.getElementById('lb-close');
        const prevBtn = document.getElementById('lb-prev');
        const nextBtn = document.getElementById('lb-next');
        if (!overlay || !imgEl) return;

        let current = 0;

        function update() {
            imgEl.src = images[current];
            counterEl.textContent = `${current + 1} / ${images.length}`;
            // Hide nav arrows if only 1 image
            prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
            nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
        }

        function open(idx) {
            current = idx;
            update();
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('no-scroll');
        }

        function close() {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
        }

        function navigate(delta) {
            current = (current + delta + images.length) % images.length;
            update();
        }

        // Gallery items → open lightbox
        document.querySelectorAll('.project-gallery__item').forEach((item) => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.lightboxIdx, 10);
                if (!isNaN(idx)) open(idx);
            });
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', () => navigate(-1));
        nextBtn.addEventListener('click', () => navigate(1));

        // Click outside image closes
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('is-open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });
    }

    // =====================================================
    // 5. INIT
    // =====================================================
    function init() {
        const root = document.getElementById('project-root');
        if (!root) return;

        // Wait for projects.js to load
        if (!window.NEO_PROJECTS) {
            console.error('NEO_PROJECTS not loaded');
            render404(root, null);
            return;
        }

        const id = getProjectIdFromURL();
        if (!id) {
            render404(root, null);
            return;
        }

        const project = window.NEO_findProject(id);
        if (!project) {
            render404(root, id);
            return;
        }

        renderProject(root, project);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
