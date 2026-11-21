import { pageCtx } from './context.js';
import { initOfflineNavigation } from '../demo/offline-nav.js';
import { renderOfflineDemoPage } from '../demo/offline-page.js';
import { exposeCustomPairModal } from '../features/custom-pair-modal.js';
import { initEventLinks } from '../features/event-links.js';
import { initKeyboardShortcuts } from '../features/keyboard-shortcuts.js';
import { exposePush, setupPushContainer } from '../features/push.js';
import { initSmartScroll } from '../features/smart-scroll.js';
import { openProfileModal } from '../modals/profile.js';
import { runPageHandler } from '../pages/index.js';
import { renderLoginPage } from '../pages/login.js';
import { renderPeoTTPage } from '../pages/peo-tt.js';
import { checkAndRenderServerError } from '../pages/server-error.js';
import { initFadeAnimations } from '../ui/fade-animations.js';
import { initMobileMenu } from '../ui/mobile-menu.js';
import { initReviewContainer } from '../ui/review-container.js';
import { initSidebar } from '../ui/sidebar.js';
import { initSubmenus } from '../ui/submenus.js';

// Модификация и стилизация активной страницы ЕТИС
export function stylePages() {
    const isDemoActive = sessionStorage.getItem('etis_demo_mode') === 'true';
    pageCtx.isDemoActive = isDemoActive;

    if (isDemoActive) {
        if (!sessionStorage.getItem('etis_offline_notice_shown')) {
            sessionStorage.setItem('etis_offline_notice_shown', 'true');
            setTimeout(() => {
                if (window.showEtisPush) {
                    window.showEtisPush(
                        'Оффлайн-режим',
                        'Используются сохранённые данные',
                        'Информация может быть неполной или частично взята из демо-шаблона.',
                        'warning',
                        'cloud_off',
                        null,
                        null,
                        false
                    );
                }
            }, 800);
        }
    }
    
    // Если оригинальный сервер отдал ошибку 502/503/504
    if (!isDemoActive && checkAndRenderServerError()) {
        return;
    }

    let demoPage = sessionStorage.getItem('etis_demo_page') || 'timetable';
    pageCtx.demoPage = demoPage;

    const urlParams = new URLSearchParams(window.location.search);
    pageCtx.urlParams = urlParams;
    let pageMode = urlParams.get('p_mode');
    pageCtx.pageMode = pageMode;

    if (isDemoActive) {
        if (demoPage === 'signs' || demoPage === 'signs_session') pageMode = 'session';
        else if (demoPage === 'signs_current') pageMode = 'current';
        else if (demoPage === 'signs_rating') pageMode = 'rating';
        else if (demoPage === 'signs_diplom') pageMode = 'diplom';
        else if (demoPage === 'teach_plan_advanced') pageMode = 'advanced';
        else if (demoPage === 'teach_plan' || demoPage === 'teach_plan_short') pageMode = 'short';
                pageCtx.pageMode = pageMode;
    }

    const page = isDemoActive 
        ? (demoPage.startsWith('signs') ? 'stu.signs' : (demoPage === 'announces' ? 'stu_ann.announces' : (demoPage === 'notes' ? 'stu.teacher_notes' : (demoPage.startsWith('teach_plan') ? 'stu.teach_plan' : 'stu.timetable')))) 
        : window.location.pathname.split('/').pop();
    pageCtx.page = page;

    if (!isDemoActive && !pageMode && (window.location.pathname.includes('stu.signs') || page === 'stu.signs')) {
        pageMode = 'session';
                pageCtx.pageMode = pageMode;
    }

    // Сохраняем HTML-кэш страниц для оффлайн-режима, пока пользователь онлайн
    if (!isDemoActive) {
        try {
            const navInfo = document.querySelector('.navbar-static-top .span12 > span');
            if (navInfo) {
                localStorage.setItem('etis_offline_student_info_html', navInfo.outerHTML);
            }

            const s9 = document.querySelector('.span9');
            if (s9) {
                const rawHtml = s9.innerHTML;
                const pMode = urlParams.get('p_mode') || '';

                if (page === 'stu.signs') {
                    const key = pMode ? `etis_offline_signs_${pMode}_html` : 'etis_offline_signs_session_html';
                    localStorage.setItem(key, rawHtml);
                } else if (page === 'stu_ann.announces') {
                    localStorage.setItem('etis_offline_announces_html', rawHtml);
                } else if (page === 'stu.teacher_notes') {
                    localStorage.setItem('etis_offline_notes_html', rawHtml);
                } else if (page === 'stu.teach_plan') {
                    const key = pMode === 'advanced' ? 'etis_offline_teach_plan_advanced_html' : 'etis_offline_teach_plan_short_html';
                    localStorage.setItem(key, rawHtml);
                }
            }
        } catch (e) {
            console.error('[Offline Cache Save Error]', e);
        }
    }

    renderOfflineDemoPage();

    initMobileMenu();

    setupPushContainer();

    exposePush(); 

    exposeCustomPairModal();

    // Страница расписания преподавателя (без боковой панели)
    const isPeoTT = document.querySelector('form#form1 input[name="P_PEO_ID"]') !== null;
    pageCtx.isPeoTT = isPeoTT;
    let span9 = document.querySelector('div.span9');

if (isPeoTT && !span9) {
        const fixStyle = document.createElement('style');
        fixStyle.innerHTML = `
                    .span9 { margin-left: 0 !important; margin: 0 auto !important; max-width: 840px !important; }
                    .peo-container { display: flex; justify-content: center; width: 100%; box-sizing: border-box; padding: 2rem; }
                    @media (max-width: 960px) {
                        .peo-container { padding: 0 !important; }
                        .peo-span9 { padding: 0 1.6rem 15rem !important; }
                    }
                `;
        document.head.appendChild(fixStyle);

        const container = document.createElement('div');
        container.className = 'peo-container';

        span9 = document.createElement('div');
        span9.className = 'span9 peo-span9';
        span9.style.cssText = 'float: none !important; width: 100% !important; padding-top: 1rem !important;';

        Array.from(document.body.childNodes).forEach(node => {
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.id !== 'swipe-action-bubble' && node.id !== 'etis-push-container' && node !== container) {
                span9.appendChild(node);
            }
        });

        container.appendChild(span9);
        document.body.appendChild(container);
        document.body.style.backgroundColor = '';
    }

    const login = document.querySelector('body > div.login');
    if (login) {
        renderLoginPage();
    } else {
        initSubmenus();
        initSidebar();

        const span9 = document.querySelector('div.span9');
    pageCtx.span9 = span9;
        if (!span9 && !document.querySelector('.login') && page !== 'stu.schedule_detail') return;

        const warning = document.querySelector('div.warning');
        if (warning && span9) {
            span9.prepend(warning);
        }

        let el, btn, img;

        renderPeoTTPage();

        runPageHandler(page);

        initReviewContainer();

        initFadeAnimations();

    }

    initSmartScroll();

    // Автоматическое открытие профиля после расчета оценок диплома
    if (window.location.hash === '#open-profile') {
        // Бесследно стираем хэш-маркер из адресной строки без перезагрузки страницы
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
        setTimeout(() => {
            if (typeof openProfileModal === 'function') {
                // На смартфонах открываем меню выбора, на ПК — сразу «Мой профиль»
                openProfileModal(window.innerWidth <= 960 ? 'menu' : 'main');
            }
        }, 1000); // Небольшая задержка, чтобы страница успела полностью загрузиться
    }

    document.querySelectorAll('.submenu a:not(.answer-btn-custom), .weeks a, .timetable-toolbar a.toolbar-item').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.includes('javascript:')) {
                const menuBtn = document.querySelector('.mobile-menu-btn');
                if (menuBtn) menuBtn.classList.add('is-loading');
            }
        });
    });

    if (page.includes('announces') || page.includes('teacher_notes')) {
        initEventLinks();
    }

    initKeyboardShortcuts();

    initOfflineNavigation();
}
