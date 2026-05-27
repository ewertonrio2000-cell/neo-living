/* =========================================================
   NEO.LIVING — PARTIALS
   Inject header and footer markup so we have a single source.
   Pages just include this script and the markup is rendered.
   ========================================================= */

(() => {
    'use strict';

    const HEADER_HTML = `
    <header class="site-header">
        <div class="site-header__inner">
            <a href="index.html" class="site-logo" aria-label="NEO.LIVING — Home">
                <span class="site-logo__monogram" aria-hidden="true"></span>
                <span>NEO.LIVING</span>
            </a>

            <nav class="site-nav" aria-label="Navegação principal">
                <ul class="site-nav__list">
                    <li><a href="work-profile.html" class="site-nav__link">Work Profile</a></li>
                    <li><a href="incorporacoes.html" class="site-nav__link">Incorporações</a></li>
                    <li><a href="head-designers.html" class="site-nav__link">Head Designers</a></li>
                    <li><a href="execucao-full.html" class="site-nav__link">Execução Full</a></li>
                    <li><a href="contact.html" class="site-nav__link">Contact</a></li>
                </ul>

                <button class="nav-toggle" aria-label="Abrir menu" type="button">
                    <span class="nav-toggle__line"></span>
                    <span class="nav-toggle__line"></span>
                    <span class="nav-toggle__line"></span>
                </button>
            </nav>
        </div>
    </header>

    <div class="mobile-drawer" aria-hidden="true">
        <ul class="mobile-drawer__list">
            <li><a href="index.html" class="mobile-drawer__link">Home</a></li>
            <li><a href="work-profile.html" class="mobile-drawer__link">Work Profile</a></li>
            <li><a href="incorporacoes.html" class="mobile-drawer__link">Incorporações</a></li>
            <li><a href="head-designers.html" class="mobile-drawer__link">Head Designers</a></li>
            <li><a href="execucao-full.html" class="mobile-drawer__link">Execução Full</a></li>
            <li><a href="contact.html" class="mobile-drawer__link">Contact</a></li>
        </ul>
        <div class="mobile-drawer__footer">
            <p>+55 21 97630.9999</p>
            <p>@neoliving_br</p>
        </div>
    </div>
    `;

    const FOOTER_HTML = `
    <footer class="site-footer">
        <div class="site-footer__inner">
            <div class="site-footer__grid">
                <div>
                    <p class="site-footer__col-title">_ NEO.LIVING</p>
                    <p class="site-footer__brand">NEO.LIVING</p>
                    <p class="site-footer__tagline">Arquitetura Contemporânea — Design &amp; Lifestyle.</p>
                </div>

                <div>
                    <p class="site-footer__col-title">_ Navegação</p>
                    <ul class="site-footer__list">
                        <li><a href="work-profile.html">Work Profile</a></li>
                        <li><a href="incorporacoes.html">Incorporações</a></li>
                        <li><a href="head-designers.html">Head Designers</a></li>
                        <li><a href="execucao-full.html">Execução Full</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <p class="site-footer__col-title">_ Contato</p>
                    <ul class="site-footer__list">
                        <li><a href="tel:+5521976309999">+55 21 97630.9999</a></li>
                        <li><a href="mailto:contato@neoliving.com.br">contato@neoliving.com.br</a></li>
                        <li><a href="https://instagram.com/neoliving_br" target="_blank" rel="noopener">@neoliving_br</a></li>
                    </ul>
                </div>

                <div>
                    <p class="site-footer__col-title">_ Localização</p>
                    <ul class="site-footer__list">
                        <li><span>Rio de Janeiro</span></li>
                        <li><span>Brasil</span></li>
                    </ul>
                </div>
            </div>

            <div class="site-footer__bottom">
                <p>NEO.LIVING © 2023 — Rio de Janeiro · BRA</p>
                <p><a href="contact.html">contato@neoliving.com.br</a></p>
            </div>
        </div>
    </footer>
    `;

    function inject() {
        const headerSlot = document.querySelector('[data-include="header"]');
        const footerSlot = document.querySelector('[data-include="footer"]');

        if (headerSlot) headerSlot.outerHTML = HEADER_HTML;
        if (footerSlot) footerSlot.outerHTML = FOOTER_HTML;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
