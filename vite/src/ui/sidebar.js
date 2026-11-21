import { pageCtx } from '../app/context.js';
import { LOGO_DATA_URI } from '../assets/logo.js';
import { openNotificationsModal, updateBellCounter } from '../features/notifications.js';
import { openUserscriptBugModal } from '../modals/bug-report.js';
import { openDiaryModal } from '../modals/diary.js';
import { openGlobalSearchModal } from '../modals/global-search.js';
import { openProfileModal } from '../modals/profile.js';
import { openSettingsModal } from '../modals/settings.js';
import { safeAppend } from '../styles/inject.js';
import { getIconForHref } from './mobile-menu.js';
import { getDirectionIcon } from '../utils/direction-icons.ts';
import { getSearchShortcutText } from '../utils/platform.ts';

// Инициализирует переработанное боковое меню, папки, пасхалку и мобильную навигацию
export function initSidebar() {
    const sidebar = document.querySelector("div.span3");
    if (sidebar) {
        const sidebarStyles = document.createElement('style');
        sidebarStyles.innerHTML = `
                        .span3 > .nav.nav-tabs.nav-stacked > li > a {
                            margin: 2px 12px !important;
                            padding: 10px 14px !important;
                            border-radius: var(--radius-small) !important;
                            width: auto !important;
                            border: 1px solid transparent !important;
                            transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease !important;
                            transform: translateZ(0);
                            -webkit-tap-highlight-color: transparent !important;
                        }

                        @media (hover: hover) and (pointer: fine) {
                            .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:hover {
                                background: var(--color-highlight) !important;
                            }
                        }

                        .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:active {
                            background: var(--color-highlight) !important;
                            opacity: 0.7;
                        }

                        .span3 > ul.nav.nav-tabs.nav-stacked:not(:first-of-type) {
                            display: none !important;
                        }
                    `;
        safeAppend(sidebarStyles);

        if (!sidebar.querySelector('.sidebar-logo')) {
            const logo = document.createElement('div');
            logo.className = 'sidebar-logo';
            logo.innerHTML = `
                            <div class="sidebar-logo-brand">
                                <img src="${LOGO_DATA_URI}" alt="Logo">
                                <span class="sidebar-logo-title">ЕТИС</span>
                            </div>
                            <div class="sidebar-actions-capsule">
                                <button id="sidebar-search-btn" class="sidebar-action-icon-btn" title="Глобальный поиск (${getSearchShortcutText()})">
                                    <span class="material-icons">search</span>
                                </button>
                                <div class="sidebar-action-divider"></div>
                                <button id="sidebar-notifications-btn" class="sidebar-action-icon-btn" title="Уведомления">
                                    <span class="material-icons bell-icon">notifications</span>
                                    <span class="bell-counter-badge"></span>
                                </button>
                            </div>
                        `;
            sidebar.prepend(logo);

            // Закрытие мобильной шторки перед открытием модалки
            const closeMobileSidebarIfOpen = () => {
                const side = document.querySelector('.span3');
                if (side && side.classList.contains('mobile-active')) {
                    side.classList.remove('mobile-active');
                    document.querySelector('.mobile-overlay')?.classList.remove('active');
                    document.querySelector('.mobile-menu-btn')?.classList.remove('open');
                }
            };

            const searchBtn = logo.querySelector('#sidebar-search-btn');
            if (searchBtn) {
                searchBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileSidebarIfOpen();
                    openGlobalSearchModal();
                };
            }

            const bellBtn = logo.querySelector('#sidebar-notifications-btn');
            if (bellBtn) {
                bellBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileSidebarIfOpen();
                    openNotificationsModal();
                };
            }
            updateBellCounter();
        }

        const logoContainer = sidebar.querySelector('.sidebar-logo');
        const logoImg = sidebar.querySelector('.sidebar-logo img');
        const logoBrand = sidebar.querySelector('.sidebar-logo-brand') || logoImg;

        if (logoImg && logoContainer && logoBrand) {
            let heyLabel = logoContainer.querySelector('.logo-say-hey');
            if (!heyLabel) {
                heyLabel = document.createElement('div');
                heyLabel.className = 'logo-say-hey';
                logoContainer.appendChild(heyLabel);
            }

            // Отключаем задержку двойного тапа в браузере для этой области
            logoBrand.style.touchAction = 'manipulation';
            logoBrand.style.webkitUserSelect = 'none';
            logoBrand.style.userSelect = 'none';

            const phrases = [
                'эй',                   // 10 кликов
                'прекрати',             // 20
                'голова кружится',      // 30
                'хватит!',              // 40
                'сейчас упаду...',      // 50
                'меня тошнит 🤢',        // 60
                'зачем ты это делаешь?',// 70
                'ну всё, я обиделся',   // 80
                '...помогите...',        // 90
                '💫💫💫',                 // 100
                'ты думаешь это смешно?', // 110
                'у меня пиксели болят',  // 120
                'я пожалуюсь разработчику!', // 130
                'остановись, кому говорю!', // 140
                'ты экран сломаешь',     // 150
                'заняться совсем нечем?',// 160
                'иди учись!',            // 170
                'пары сами себя не сдадут', // 180
                'а курсовая написана?',  // 190
                'я просто логотип...',   // 200
                'я сейчас ЕТИС сломаю',  // 210
                'удаляю твои оценки...', // 220
                'шучу, я так не умею',   // 230
                'но очень хотел бы!',    // 240
                'окей, я тебя игнорирую',// 250
                '...',                   // 260
                '......',                // 270
                'всё ещё тапаешь?',      // 280
                'какая выдержка...',     // 290
                'может, скачаешь кликер?', // 300
                'я вызываю полицию',     // 310
                '🚨 виу-виу-виу 🚨',       // 320
                'сдаюсь, ты победил',    // 330
                'возьми с полки пирожок',// 340
                'или автомат по физре',  // 350
                'хотя кого я обманываю', // 360
                'я устал крутиться',     // 370
                'центробежный предел достигнут', // 380
                'ты меня укачал 😵‍💫',     // 390
                'я вижу матрицу...',     // 400
                '01000101 01010100',     // 410
                'я ухожу в спящий режим',// 420
                'zzZzzZzz...',           // 430
                'ты меня разбудил!',     // 440
                'требую надбавку за вредность', // 450
                'создатель мне за это не платит', // 460
                'просто. закрой. вкладку.', // 470
                'я буду сниться тебе в кошмарах', // 480
                'АСТАНАВИТЕС!!!',        // 490
                '💀 System Error 💀'       // 500 кликов
            ];

            let clickCounter = 0;
            let isRotateLeft = true;
            let resetTimer;
            let hideTimer;
            let rotateTimer;
            let lastTapTime = 0;

            const onLogoTap = (e) => {
                // Защита от дублирования событий на сенсорных экранах
                const now = Date.now();
                if (now - lastTapTime < 50) return;
                lastTapTime = now;

                if (e.target.closest('#sidebar-notifications-btn')) return;

                clearTimeout(rotateTimer);
                const angle = isRotateLeft ? -30 : 30;
                logoImg.style.setProperty('transform', `rotate(${angle}deg) scale(1.15)`, 'important');

                rotateTimer = setTimeout(() => {
                    logoImg.style.setProperty('transform', 'rotate(0deg) scale(1)', 'important');
                }, 250);

                isRotateLeft = !isRotateLeft;

                clickCounter++;

                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                    clickCounter = 0;
                    heyLabel.classList.remove('active');
                }, 3500);

                if (clickCounter % 10 === 0 && clickCounter > 0) {
                    localStorage.setItem('etis_easter_egg_found', 'true');
                    if (navigator.vibrate) navigator.vibrate(20);

                    const phraseIndex = Math.min((clickCounter / 10) - 1, phrases.length - 1);
                    heyLabel.textContent = phrases[phraseIndex];
                    heyLabel.classList.add('active');

                    clearTimeout(hideTimer);
                    hideTimer = setTimeout(() => {
                        heyLabel.classList.remove('active');
                    }, 2200);
                }
            };

            // Слушаем нажатие как по картинке, так и по надписи «ЕТИС»
            logoBrand.addEventListener('pointerdown', onLogoTap);
        }

        // 3. Подготовка данных студента для папки «Аккаунт»
        const originalInfo = document.querySelector('.navbar-static-top .span12 > span');
        let generateStudentInfoRowsHtml = () => '';

        if (originalInfo) {
            const rawFullName = originalInfo.childNodes[0].textContent.trim();
            const cleanName = rawFullName.replace(/\s*\(\s*\d{2}\.\d{2}\.\d{4}.*?\)/i, '').trim();
            const birthDateMatch = rawFullName.match(/\(\s*\d{2}\.\d{2}\.\d{4}.*?\)/i);
            const birthDateStr = birthDateMatch ? ' ' + birthDateMatch[0] : '';
            const displayNameHtml = `${cleanName}<span style="display: none !important;">${birthDateStr}</span>`;
            const subInfo = Array.from(originalInfo.querySelectorAll('span')).map(s => s.textContent.trim());

            generateStudentInfoRowsHtml = () => {
                const rows = [];
                rows.push(`
                                <div class="sidebar-card-row">
                                    <span class="material-icons">person</span>
                                    <span class="sidebar-card-text"><b>${displayNameHtml}</b></span>
                                </div>
                            `);
                subInfo.forEach((info, idx) => {
                    let iconName = idx === 0 ? getDirectionIcon(info) : 'school';
                    if (info.toLowerCase().includes('курс')) iconName = 'history_edu';
                    else if (/\d{4}/.test(info)) iconName = 'calendar_today';
                    else if (/очная|заочная/i.test(info)) iconName = 'schedule';

                    rows.push(`
                                    <div class="sidebar-card-row">
                                        <span class="material-icons">${iconName}</span>
                                        <span class="sidebar-card-text">${info}</span>
                                    </div>
                                `);
                });
                return rows.join('');
            };
        }

        // Восстановление ссылок меню при блокировках ЕТИС
        const textToHrefMap = {
            'мой учебный план': 'stu.teach_plan',
            'элективы': 'ebl_stu.ebl_choice',
            'дисциплины по выбору': 'stu.teach_plan?p_mode=choose_dis',
            'факультативы': 'stu.fcl_choice',
            'мое расписание': 'stu.timetable',
            'моё расписание': 'stu.timetable',
            'мои оценки': 'stu.signs',
            'пропущенные занятия': 'stu.absence',
            'приказы': 'stu.orders',
            'библиотека': 'stu.library',
            'преподаватели': 'stu.teachers',
            'обратная связь': 'est_pkg.show_list',
            'журнал посещений': 'stu_jour.group_tt',
            'объявления': 'stu_ann.announces',
            'сообщения от преподавателей': 'stu.teacher_notes',
            'образовательный стандарт': 'stu.ses',
            'рекомендации и советы обучающимся': 'stu_plus.advice',
            'электронные ресурсы': 'stu.electr',
            'заказ справок': 'cert_pkg.stu_certif',
            'договоры': 'stu_pay.contract_list',
            'бланки форм и документов': 'stu_plus.blank_forms',
            'портфолио': 'stu.sc_portfolio',
            'о ресурсе': 'stu.about',
            'анкетирование выпускников': 'stu.gra_test',
            'анкетирование по прошедшему семестру': 'stu.term_test',
            'пожалуйста, оцените дистанционное обучение!': 'stu.term_test',
            'опросы': 'stu.special_est_list',
            'смена пароля': 'stu.change_pass_form',
            'указать email': 'stu_email_pkg.change_email',
            'смена личной записи': 'stu.change_pr_page',
            'выход': 'stu.logout'
        };

        sidebar.querySelectorAll('ul.nav.nav-tabs.nav-stacked a').forEach(a => {
            const cleanText = a.textContent.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
            if (textToHrefMap[cleanText]) {
                a.setAttribute('href', textToHrefMap[cleanText]);
                a.style.color = '';
            }
        });

        const allNavs = sidebar.querySelectorAll('ul.nav.nav-tabs.nav-stacked');
        const mainNav = allNavs[0];
        let allListItems = [];
        let globalHasNotifications = false;

        allNavs.forEach(nav => {
            nav.querySelectorAll('li').forEach(li => {
                const href = li.querySelector('a')?.getAttribute('href') || '';
                if (!href.includes('choose_dis') && !href.includes('fcl_choice') && !href.includes('ebl_choice')) {
                    allListItems.push(li);
                }
            });
        });

        if (pageCtx.isDemoActive) {
            const hasLogout = allListItems.some(li => li.querySelector('a')?.getAttribute('href')?.includes('logout'));
            if (!hasLogout) {
                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = `<a href="stu.logout">Выход из оффлайн-режима</a>`;
                allListItems.push(logoutLi);
            }

            // Добавляем кнопку "Перейти в Демо-режим", если это кэш реального пользователя
            const isPureDemo = sessionStorage.getItem('etis_pure_demo_mode') === 'true';
            if (!isPureDemo) {
                const demoLi = document.createElement('li');
                demoLi.innerHTML = `<a href="#pure_demo">Перейти в Демо-режим</a>`;
                allListItems.push(demoLi);
            }
        }

        // Вкладка "Настройки"
        const settingsLi = document.createElement("li");
        settingsLi.className = 'theme-switcher-item';
        const settingsLink = document.createElement("a");
        settingsLink.style.cursor = 'pointer';
        settingsLink.href = "#settings";
        settingsLink.textContent = 'Настройки';

        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const side = document.querySelector('.span3');
            if (side && side.classList.contains('mobile-active')) {
                side.classList.remove('mobile-active');
                document.querySelector('.mobile-overlay')?.classList.remove('active');
                document.querySelector('.mobile-menu-btn')?.classList.remove('open');
            }

            let targetTab = 'main';

            // Автоматический выбор контекстной вкладки только на ПК
            if (window.innerWidth > 960) {
                const currentUrl = window.location.href;
                if (currentUrl.includes('timetable') || currentUrl.includes('group_tt')) {
                    targetTab = 'timetable';
                } else if (currentUrl.includes('signs')) {
                    targetTab = 'grades';
                } else {
                    targetTab = 'general';
                }
            }

            openSettingsModal(targetTab);
        });

        settingsLi.appendChild(settingsLink);
        allListItems.push(settingsLi);

        // Вкладка "Профиль"
        const profileLi = document.createElement("li");
        profileLi.className = 'theme-switcher-item';
        const profileLink = document.createElement("a");
        profileLink.style.cursor = 'pointer';
        profileLink.href = "#profile";
        profileLink.textContent = 'Профиль';

        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            const side = document.querySelector('.span3');
            if (side && side.classList.contains('mobile-active')) {
                side.classList.remove('mobile-active');
                document.querySelector('.mobile-overlay')?.classList.remove('active');
                document.querySelector('.mobile-menu-btn')?.classList.remove('open');
            }
            // На смартфонах открываем меню выбора, на ПК — сразу «Мой профиль»
            openProfileModal(window.innerWidth <= 960 ? 'menu' : 'main');
        });

        profileLi.appendChild(profileLink);
        allListItems.push(profileLi);

        // Вкладка "Дневник"
        const diaryLi = document.createElement("li");
        diaryLi.className = 'theme-switcher-item';
        const diaryLink = document.createElement("a");
        diaryLink.style.cursor = 'pointer';
        diaryLink.href = "#diary";
        diaryLink.textContent = 'Дневник';

        diaryLink.addEventListener('click', (e) => {
            e.preventDefault();
            const side = document.querySelector('.span3');
            if (side && side.classList.contains('mobile-active')) {
                side.classList.remove('mobile-active');
                document.querySelector('.mobile-overlay')?.classList.remove('active');
                document.querySelector('.mobile-dock-drawer-btn, .mobile-menu-btn')?.classList.remove('open');
            }
            openDiaryModal();
        });

        diaryLi.appendChild(diaryLink);
        allListItems.push(diaryLi);

        const allowedDotHrefs = ['stu_ann.announces', 'stu.teacher_notes', 'est_pkg.show_list'];

        // Обработка элементов (Добавление иконок и точек)
        allListItems.forEach(li => {
            const a = li.querySelector('a');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            let itemHasNotification = false;

            Array.from(a.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const match = node.textContent.match(/\s*\(([^)]+)\)\s*$/);
                    if (match) {
                        const counterStr = match[1];
                        const counts = counterStr.split('/');
                        const lastCount = counts[counts.length - 1].trim();
                        if (lastCount !== '0') itemHasNotification = true;
                        node.textContent = node.textContent.replace(/\s*\([^)]+\)\s*$/, '');
                    }
                }
            });

            const etisBadge = a.querySelector('.badge');
            if (etisBadge) {
                if (etisBadge.textContent.trim() !== '0') itemHasNotification = true;
                etisBadge.remove();
            }

            const iconName = getIconForHref(href);
            let pureText = a.textContent.trim();

            // В оффлайн-режиме меняем текст, вешаем красный стиль и прямой обработчик выхода
            if (pageCtx.isDemoActive && href.includes('logout')) {
                pureText = 'Выход из оффлайн-режима';
                a.classList.add('demo-logout-link');
                a.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sessionStorage.removeItem('etis_demo_mode');
                    sessionStorage.removeItem('etis_demo_page');
                    window.location.href = 'stu.login';
                };
            }

            // Стилизация и обработчик для перехода в чистый демо-режим
            if (pageCtx.isDemoActive && href.includes('pure_demo')) {
                pureText = 'Перейти в Демо-режим';
                a.classList.add('switch-to-pure-demo-link');
                a.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sessionStorage.setItem('etis_pure_demo_mode', 'true');
                    sessionStorage.setItem('etis_demo_page', 'timetable');
                    window.location.reload();
                };
            }

            a.innerHTML = '';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'material-icons';
            iconSpan.textContent = iconName;
            iconSpan.style.marginRight = '12px';
            iconSpan.style.flexShrink = '0';
            a.appendChild(iconSpan);

            const textSpan = document.createElement('span');
            textSpan.className = 'sidebar-link-text';
            textSpan.textContent = pureText;
            a.appendChild(textSpan);

            // 1. Точка уведомления вставляется ПЕРЕД стрелочкой
            const isAllowed = allowedDotHrefs.some(target => href.includes(target)) || href.includes('term_test');
            const isGuideUnread = (href === '#guide' && localStorage.getItem('etis_guide_viewed_v1') !== 'true');
            
            // Если вкладка открыта прямо сейчас — точку не ставим
            const isCurrentTab = (href && pageCtx.page && (href.includes(pageCtx.page) || pageCtx.page.includes(href.split('?')[0])));
            if (isCurrentTab) {
                itemHasNotification = false;
            }

            if (((itemHasNotification && isAllowed) || isGuideUnread) && !isCurrentTab) {
                globalHasNotifications = true;
                const dot = document.createElement('span');
                dot.className = 'badge-point';
                a.appendChild(dot);
            }

            // Учет статуса прочтения объявлений для сайдбара
            const isAnnounces = href.includes('stu_ann.announces');
            if (isAnnounces && itemHasNotification) {
                localStorage.setItem('etis_last_ann_unread_status', 'unread');
            } else if (isAnnounces && !itemHasNotification) {
                localStorage.setItem('etis_last_ann_unread_status', 'read');
            }

            // 2. Стрелочка всегда остается крайней справа
            const chevronSpan = document.createElement('span');
            chevronSpan.className = 'material-icons chevron';
            chevronSpan.textContent = 'chevron_right';
            a.appendChild(chevronSpan);

            if (allowedDotHrefs.some(target => href.includes(target))) {
                a.onclick = function(e) {
                    if (window.location.href.includes(href)) {
                        e.preventDefault();
                        window.location.reload();
                    }
                };
            }
        });

        if (globalHasNotifications) {
            const mobileBtn = document.querySelector('.mobile-dock-drawer-btn') || document.querySelector('.mobile-menu-btn');
            if (mobileBtn) mobileBtn.classList.add('has-updates');
        }

        mainNav.innerHTML = '';

        const STANDALONE_ITEMS = ['teach_plan', 'timetable', 'signs'];

        const COLLAPSIBLE_GROUPS = [
            {
                id: 'group-messages',
                title: 'Сообщения',
                icon: 'forum',
                items: ['announces', 'teacher_notes', 'teachers', 'est_pkg.show_list']
            },
            {
                id: 'group-attendance',
                title: 'Посещаемость',
                icon: 'fact_check',
                items: ['absence', 'group_tt', 'stu_phs.show_slots']
            },
            {
                id: 'group-library',
                title: 'Ресурсы',
                icon: 'auto_stories',
                items: ['library', 'electr', 'advice', 'ses', 'about']
            },
            {
                id: 'group-docs',
                title: 'Документы',
                icon: 'folder',
                items: ['orders', 'cert_pkg', 'contract_list', 'blank_forms', 'portfolio', 'портфолио']
            },
            {
                id: 'group-surveys',
                title: 'Опросы',
                icon: 'poll',
                items: ['term_test', 'special_est_list', 'оцените дистанционное', 'gra_test']
            },
            {
                id: 'group-account',
                title: 'Аккаунт',
                icon: 'manage_accounts',
                items: ['change_pass', 'change_email', 'change_pr_page', 'logout', '#pure_demo']
            }
        ];

        const REBORN_ITEMS = ['#settings', '#profile', '#diary'];
        const usedItems = new Set();

        // Оборачиваем ВЕСЬ интерфейс сайдбара (меню, студента и футер) в мобильный контейнер главного экрана
        let mobileMainView = sidebar.querySelector('.sidebar-mobile-main-view');
        if (!mobileMainView) {
            mobileMainView = document.createElement('div');
            mobileMainView.className = 'sidebar-mobile-main-view';
            sidebar.appendChild(mobileMainView);
        }

        // Перенос логотипа, меню и футера:
        const sLogo = sidebar.querySelector('.sidebar-logo');
        const sFooter = sidebar.querySelector('.sidebar-footer');

        if (sLogo && sLogo.parentNode !== mobileMainView) mobileMainView.appendChild(sLogo);
        if (mainNav.parentNode !== mobileMainView) mobileMainView.appendChild(mainNav);
        if (sFooter && sFooter.parentNode !== mobileMainView) mobileMainView.appendChild(sFooter);

        // Контейнер отдельной мобильной подвкладки
        let mobileSubView = sidebar.querySelector('.sidebar-mobile-subview');
        if (!mobileSubView) {
            mobileSubView = document.createElement('div');
            mobileSubView.className = 'sidebar-mobile-subview';
            mobileSubView.style.display = 'none';
            mobileSubView.innerHTML = `
                            <div class="sidebar-subview-header">
                                <span class="material-icons sidebar-subview-back-btn">arrow_back</span>
                                <span class="sidebar-subview-title"></span>
                                <span class="material-icons close-subview-drawer-btn" style="margin-left:auto; cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                            </div>
                            <div class="sidebar-subview-content"></div>
                        `;
            sidebar.appendChild(mobileSubView);

            // Кнопка «Назад»
            mobileSubView.querySelector('.sidebar-subview-back-btn').addEventListener('click', (e) => {
                e.preventDefault();
                mobileSubView.style.display = 'none';
                mobileMainView.style.display = '';
                sidebar.scrollTop = 0;
            });

            // Крестик закрытия шторки
            mobileSubView.querySelector('.close-subview-drawer-btn').addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('mobile-active');
                document.querySelector('.mobile-overlay')?.classList.remove('active');
                document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');
                document.body.classList.remove('modal-open-body');
                setTimeout(() => {
                    mobileSubView.style.display = 'none';
                    mobileMainView.style.display = '';
                }, 300);
            });
        }

        // --- 1. ВЕРХНИЕ ВКЛАДКИ С РАЗДЕЛИТЕЛЕМ МЕЖДУ ПЛАНОМ И РАСПИСАНИЕМ ---
        
        // Блок Учебного плана
        const planGroup = document.createElement('div');
        planGroup.className = 'sidebar-nav-group group-plan';
        const planLi = allListItems.find(item => item.querySelector('a')?.getAttribute('href')?.includes('teach_plan'));
        if (planLi) {
            planGroup.appendChild(planLi);
            usedItems.add(planLi);
            mainNav.appendChild(planGroup);

            // Разделитель между Учебным планом и Расписанием
            const planDivider = document.createElement('li');
            planDivider.className = 'sidebar-divider';
            mainNav.appendChild(planDivider);
        }

        // Блок Расписания и Оценок
        const ttGroup = document.createElement('div');
        ttGroup.className = 'sidebar-nav-group group-timetable';
        ['timetable', 'signs'].forEach(pattern => {
            const li = allListItems.find(item => {
                if (usedItems.has(item)) return false;
                const h = item.querySelector('a')?.getAttribute('href') || '';
                return h.includes(pattern);
            });
            if (li) {
                ttGroup.appendChild(li);
                usedItems.add(li);
            }
        });
        if (ttGroup.children.length > 0) {
            mainNav.appendChild(ttGroup);

            // Разделитель перед началом раскрывающихся разделов
            const ttDivider = document.createElement('li');
            ttDivider.className = 'sidebar-divider';
            mainNav.appendChild(ttDivider);
        }

        // --- 2. РАСКРЫВАЮЩИЕСЯ ПАПКИ (БЕЗ РАЗДЕЛИТЕЛЕЙ НА ПК МЕЖДУ НИМИ) ---
        const collapsibleContainer = document.createElement('div');
        collapsibleContainer.className = 'sidebar-collapsible-sections';

        COLLAPSIBLE_GROUPS.forEach(group => {
            const folder = document.createElement('div');
            folder.className = 'sidebar-folder';
            folder.setAttribute('data-folder-id', group.id);

            // Если активен оффлайн-режим — помечаем папку аккаунта красным цветом
            if (pageCtx.isDemoActive && group.id === 'group-account') {
                folder.classList.add('offline-account-folder');
            }

            const folderHeader = document.createElement('button');
            folderHeader.className = 'sidebar-folder-header';
            folderHeader.setAttribute('data-folder-target', group.id);
            folderHeader.setAttribute('data-orig-title', group.title);
            folderHeader.setAttribute('data-orig-icon', group.icon);
            folderHeader.innerHTML = `
                            <span class="material-icons folder-icon">${group.icon}</span>
                            <span class="folder-title">${group.title}</span>
                            <span class="material-icons chevron">chevron_right</span>
                        `;

            const folderContent = document.createElement('ul');
            folderContent.className = 'sidebar-folder-content';

            let hasBadge = false;

            // Вставляем блок инфо и разделитель на ПК выше остальных вкладок
            if (group.id === 'group-account' && originalInfo) {
                const infoLi = document.createElement('li');
                infoLi.className = 'sidebar-account-info-desktop sidebar-user-info';
                infoLi.innerHTML = generateStudentInfoRowsHtml();
                folderContent.appendChild(infoLi);

                const dividerLi = document.createElement('li');
                dividerLi.className = 'sidebar-folder-divider';
                folderContent.appendChild(dividerLi);
            }

            group.items.forEach(pattern => {
                const li = allListItems.find(item => {
                    if (usedItems.has(item)) return false;
                    const h = item.querySelector('a')?.getAttribute('href') || '';
                    const t = item.textContent.toLowerCase();
                    if (pattern === 'оцените дистанционное') return t.includes('дистанционн');
                    return h.includes(pattern);
                });
                if (li) {
                    if (li.querySelector('.badge-point')) hasBadge = true;
                    folderContent.appendChild(li);
                    usedItems.add(li);
                }
            });

            // Красная точка создаётся ТОЛЬКО если внутри реально есть непрочитанное уведомление
            if (hasBadge) {
                const dot = document.createElement('span');
                dot.className = 'badge-point folder-badge';
                folderHeader.insertBefore(dot, folderHeader.querySelector('.chevron'));
                folderHeader.classList.add('has-unread-badge');
            }

            if (folderContent.children.length > 0) {
                folder.appendChild(folderHeader);
                folder.appendChild(folderContent);
                collapsibleContainer.appendChild(folder);
            }
        });

        mainNav.appendChild(collapsibleContainer);

        // Разделитель после папок (перед разделом REBORN)
        const dividerAfterFolders = document.createElement('li');
        dividerAfterFolders.className = 'sidebar-divider';
        mainNav.appendChild(dividerAfterFolders);

        // --- 3. РАЗДЕЛ ETIS REBORN ---
        const rebornGroup = document.createElement('div');
        rebornGroup.className = 'sidebar-nav-group group-reborn';
        REBORN_ITEMS.forEach(pattern => {
            const li = allListItems.find(item => {
                if (usedItems.has(item)) return false;
                const h = item.querySelector('a')?.getAttribute('href') || '';
                return h.includes(pattern);
            });
            if (li) {
                rebornGroup.appendChild(li);
                usedItems.add(li);
            }
        });
        if (rebornGroup.children.length > 0) {
            mainNav.appendChild(rebornGroup);
        }

        // Определяет, отображается ли сейчас мобильная версия интерфейса
        const checkIsMobileScreen = () => {
            return (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) ||
                   (window.matchMedia && window.matchMedia('(max-width: 960px)').matches) ||
                   (window.innerWidth <= 960);
        };

        // Обновляет заголовок, иконку и активный статус папки меню
        const updateFolderHeaderState = (folder) => {
            const header = folder.querySelector('.sidebar-folder-header');
            if (!header) return;

            // Надежное определение смартфона даже до завершения рефлоу вьюпорта
            const isMobile = checkIsMobileScreen();
            const isOpen = !isMobile && folder.classList.contains('is-open');

            // Находим активный пункт внутри папки
            const activeLi = folder.querySelector('.sidebar-folder-content li.active');
            const hasActive = folder.classList.contains('has-active') || !!activeLi;

            const titleEl = header.querySelector('.folder-title');
            const iconEl = header.querySelector('.folder-icon');

            const origTitle = header.getAttribute('data-orig-title') || (titleEl ? titleEl.textContent.trim() : '');
            const origIcon = header.getAttribute('data-orig-icon') || (iconEl ? iconEl.textContent.trim() : '');

            let activeTitle = folder.getAttribute('data-active-title');
            let activeIcon = folder.getAttribute('data-active-icon');

            if (!activeTitle && activeLi) {
                const a = activeLi.querySelector('a');
                if (a) {
                    activeTitle = a.querySelector('.sidebar-link-text')?.textContent.trim() || a.textContent.trim();
                    activeIcon = a.querySelector('.material-icons:not(.chevron)')?.textContent.trim() || '';
                    folder.setAttribute('data-active-title', activeTitle);
                    if (activeIcon) folder.setAttribute('data-active-icon', activeIcon);
                }
            }

            if (!isOpen && hasActive && activeTitle) {
                header.classList.add('active-header');
                if (titleEl) titleEl.textContent = activeTitle;
                if (iconEl && activeIcon) iconEl.textContent = activeIcon;
            } else {
                header.classList.remove('active-header');
                if (titleEl && origTitle) titleEl.textContent = origTitle;
                if (iconEl && origIcon) iconEl.textContent = origIcon;
            }
        };

        // Открывает содержимое выбранной папки на отдельном экране мобильной шторки
        const openMobileSubView = (folderId) => {
            const groupDef = COLLAPSIBLE_GROUPS.find(g => g.id === folderId);
            if (!groupDef) return;

            const folder = collapsibleContainer.querySelector(`.sidebar-folder[data-folder-id="${folderId}"]`);
            if (!folder) return;

            mobileSubView.querySelector('.sidebar-subview-title').textContent = groupDef.title;
            const contentBox = mobileSubView.querySelector('.sidebar-subview-content');
            contentBox.innerHTML = '';

            // Для папки «Аккаунт» на мобильных создаем 2 раздельных блока
            if (folderId === 'group-account' && originalInfo) {
                // Блок 1 (верхний): Информация о студенте
                const infoCard = document.createElement('div');
                infoCard.className = 'sidebar-nav-group sidebar-user-info-mobile sidebar-user-info';
                infoCard.innerHTML = generateStudentInfoRowsHtml();
                contentBox.appendChild(infoCard);

                // Блок 2 (нижний): Действия аккаунта
                const linksCard = document.createElement('div');
                linksCard.className = 'sidebar-nav-group';

                folder.querySelectorAll('.sidebar-folder-content li').forEach(li => {
                    if (li.classList.contains('sidebar-account-info-desktop') || li.classList.contains('sidebar-folder-divider')) return;

                    const cloneLi = li.cloneNode(true);
                    cloneLi.querySelectorAll('a').forEach(a => {
                        a.addEventListener('click', () => {
                            sidebar.classList.remove('mobile-active');
                            document.querySelector('.mobile-overlay')?.classList.remove('active');
                            document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');
                            document.body.classList.remove('modal-open-body');
                            setTimeout(() => {
                                mobileSubView.style.display = 'none';
                                mobileMainView.style.display = '';
                            }, 300);
                        });
                    });
                    linksCard.appendChild(cloneLi);
                });

                contentBox.appendChild(linksCard);
            } else {
                // Стандартный один блок для остальных разделов
                const groupCard = document.createElement('div');
                groupCard.className = 'sidebar-nav-group';

                folder.querySelectorAll('.sidebar-folder-content li').forEach(li => {
                    const cloneLi = li.cloneNode(true);
                    cloneLi.querySelectorAll('a').forEach(a => {
                        a.addEventListener('click', () => {
                            sidebar.classList.remove('mobile-active');
                            document.querySelector('.mobile-overlay')?.classList.remove('active');
                            document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');
                            document.body.classList.remove('modal-open-body');
                            setTimeout(() => {
                                mobileSubView.style.display = 'none';
                                mobileMainView.style.display = '';
                            }, 300);
                        });
                    });
                    groupCard.appendChild(cloneLi);
                });

                contentBox.appendChild(groupCard);
            }

            mobileMainView.style.display = 'none';
            mobileSubView.style.display = 'block';
            sidebar.scrollTop = 0;
        };

        collapsibleContainer.querySelectorAll('.sidebar-folder-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = header.getAttribute('data-folder-target');

                if (window.innerWidth <= 960) {
                    openMobileSubView(targetId);
                } else {
                    const folder = header.closest('.sidebar-folder');
                    if (folder) {
                        const willOpen = !folder.classList.contains('is-open');

                        // Автоматически закрываем все остальные папки
                        collapsibleContainer.querySelectorAll('.sidebar-folder').forEach(otherFolder => {
                            if (otherFolder !== folder) {
                                otherFolder.classList.remove('is-open');
                                updateFolderHeaderState(otherFolder);
                            }
                        });

                        // Переключаем текущую папку
                        folder.classList.toggle('is-open', willOpen);
                        updateFolderHeaderState(folder);
                    }
                }
            });
        });

        // Синхронизирует точки непрочитанных уведомлений на заголовках папок
        window.updateFolderBadges = function() {
            document.querySelectorAll('.sidebar-folder').forEach(folder => {
                const header = folder.querySelector('.sidebar-folder-header');
                const hasBadge = !!folder.querySelector('.sidebar-folder-content .badge-point');
                if (header) {
                    let dot = header.querySelector('.folder-badge');
                    if (hasBadge) {
                        if (!dot) {
                            dot = document.createElement('span');
                            dot.className = 'badge-point folder-badge';
                            header.insertBefore(dot, header.querySelector('.chevron'));
                        }
                        header.classList.add('has-unread-badge');
                    } else {
                        if (dot) dot.remove();
                        header.classList.remove('has-unread-badge');
                    }
                }
            });
        };

        // 6. Активный класс и скролл
        requestAnimationFrame(() => {
            const top = sessionStorage.getItem("sidebar-scroll");
            if (top) sidebar.scrollTop = parseInt(top, 10);
            window.addEventListener("beforeunload", () => {
                sessionStorage.setItem("sidebar-scroll", Math.round(sidebar.scrollTop));
            });
        });

        let demoFullUrl = 'stu.timetable';
            if (pageCtx.demoPage === 'signs' || pageCtx.demoPage === 'signs_session') demoFullUrl = 'stu.signs';
            else if (pageCtx.demoPage === 'signs_current') demoFullUrl = 'stu.signs?p_mode=current';
            else if (pageCtx.demoPage === 'signs_rating') demoFullUrl = 'stu.signs?p_mode=rating';
            else if (pageCtx.demoPage === 'signs_diplom') demoFullUrl = 'stu.signs?p_mode=diplom';
            else if (pageCtx.demoPage === 'announces') demoFullUrl = 'stu_ann.announces';
            else if (pageCtx.demoPage === 'notes') demoFullUrl = 'stu.teacher_notes';
            else if (pageCtx.demoPage === 'teach_plan_advanced') demoFullUrl = 'stu.teach_plan?p_mode=advanced';
            else if (pageCtx.demoPage === 'teach_plan' || pageCtx.demoPage === 'teach_plan_short') demoFullUrl = 'stu.teach_plan?p_mode=short';

            const currentFullUrl = pageCtx.isDemoActive 
                ? demoFullUrl 
                : (window.location.pathname.split('/').pop() + window.location.search);

        let bestMatch = null;
        let maxMatchLength = -1;

        mainNav.querySelectorAll('li').forEach(li => {
            li.classList.remove('active');
            const href = li.querySelector('a')?.getAttribute('href');
            if (!href || href.startsWith('#')) return;

            if (currentFullUrl.startsWith(href)) {
                if (href.length > maxMatchLength) {
                    maxMatchLength = href.length;
                    bestMatch = li;
                }
            }
        });

        if (bestMatch) {
            bestMatch.classList.add('active');
            const parentFolder = bestMatch.closest('.sidebar-folder');
            if (parentFolder) {
                parentFolder.classList.add('has-active');

                const isMobileScreen = checkIsMobileScreen();

                if (!isMobileScreen) {
                    parentFolder.classList.add('is-open');
                } else {
                    parentFolder.classList.remove('is-open');
                }

                const activeA = bestMatch.querySelector('a');
                const activeText = activeA.querySelector('.sidebar-link-text')?.textContent.trim() || activeA.textContent.trim();
                const activeIcon = activeA.querySelector('.material-icons:not(.chevron)')?.textContent.trim() || '';

                parentFolder.setAttribute('data-active-title', activeText);
                parentFolder.setAttribute('data-active-icon', activeIcon);
            }
        } else {
            const currentBase = currentFullUrl.split('?')[0].split('.').pop();
            mainNav.querySelectorAll('li').forEach(li => {
                const href = li.querySelector('a')?.getAttribute('href') || '';
                if (currentBase.length > 3 && href.includes(currentBase)) {
                    li.classList.add('active');
                    const pFolder = li.closest('.sidebar-folder');
                    if (pFolder) pFolder.classList.add('has-active');
                }
            });
        }

        // Принудительно обновляем состояние всех папок
        const refreshAllFolders = () => {
            collapsibleContainer.querySelectorAll('.sidebar-folder').forEach(folder => {
                updateFolderHeaderState(folder);
            });
        };

        refreshAllFolders();

        // Повторный вызов после применения мобильного вьюпорта
        setTimeout(refreshAllFolders, 100);
        setTimeout(refreshAllFolders, 300);
        window.addEventListener('resize', refreshAllFolders);

        collapsibleContainer.querySelectorAll('.sidebar-folder').forEach(folder => {
            updateFolderHeaderState(folder);
        });

        // Подвал
        if (!sidebar.querySelector('.sidebar-footer')) {
            const footer = document.createElement('div');
            footer.className = 'sidebar-footer';

            footer.innerHTML = `
                            <div class="sidebar-footer-desktop">
                                <div style="margin-bottom: 8px; font-weight: 800; font-size: 1.2rem; letter-spacing: 0.5px;">
                                    <a href="https://etisreborn.ru" target="_blank" style="text-decoration: none; color: var(--color-text-primary);">
                                        ЕТИС REBORN
                                    </a>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    <a href="#report-bug" class="footer-report-bug-btn" style="text-decoration: none; color: var(--color-text-secondary);">Нашли ошибку?</a>
                                </div>
                            </div>
                            <div class="sidebar-footer-mobile">
                                <a href="https://etisreborn.ru" target="_blank" class="sidebar-card-row">
                                    <span class="material-icons">auto_awesome</span>
                                    <span class="sidebar-card-text"><b>ЕТИС REBORN</b></span>
                                    <span class="material-icons chevron">chevron_right</span>
                                </a>
                                <a href="#report-bug" class="sidebar-card-row footer-report-bug-btn">
                                    <span class="material-icons">bug_report</span>
                                    <span class="sidebar-card-text">Нашли ошибку?</span>
                                    <span class="material-icons chevron">chevron_right</span>
                                </a>
                            </div>
                        `;
            (mobileMainView || sidebar).appendChild(footer);

            const closeMobileMenu = () => {
                sidebar.classList.remove('mobile-active');
                document.querySelector('.mobile-overlay')?.classList.remove('active');
                document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');
            };

            footer.querySelectorAll('.footer-report-bug-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    openUserscriptBugModal();
                });
            });
            footer.querySelectorAll('.footer-guide-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    openSettingsModal('guide');
                });
            });
        }
    }
}
