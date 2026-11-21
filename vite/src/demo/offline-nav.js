import { pageCtx } from '../app/context.js';

// Инициализация навигации и блокировки неподдерживаемых разделов в оффлайн-режиме
export function initOfflineNavigation() {
    if (pageCtx.isDemoActive) {
        const supportedDemoHrefs = [
            'stu.timetable', 
            'stu.signs', 
            'stu_ann.announces', 
            'stu.teacher_notes', 
            'stu.teach_plan',
            'stu.logout', 
            '#settings', 
            '#profile', 
            '#guide', 
            '#report-bug'
        ];

        // 1. Блокировка неподдерживаемых вкладок сайдбара
        document.querySelectorAll('.span3 li').forEach(li => {
            const a = li.querySelector('a');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            const isSupported = supportedDemoHrefs.some(s => href.includes(s) || href.startsWith('#'));

            if (!isSupported && !href.includes('javascript:') && !href.startsWith('http')) {
                li.classList.add('demo-disabled-tab');
                a.classList.add('demo-disabled-item');

                if (!a.querySelector('.demo-locked-overlay')) {
                    const lockOverlay = document.createElement('div');
                    lockOverlay.className = 'demo-locked-overlay';
                    lockOverlay.innerHTML = '<span class="material-icons">lock</span><span>Недоступно</span>';
                    a.appendChild(lockOverlay);
                }

                const handleLockClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    a.classList.add('demo-tab-locked');
                    setTimeout(() => a.classList.remove('demo-tab-locked'), 1500);
                    if (navigator.vibrate) navigator.vibrate(12);
                };

                a.addEventListener('click', handleLockClick, true);
                li.addEventListener('click', handleLockClick, true);
            }
        });

        // 2. Блокировка недель в расписании (кроме текущей 1-й)
        document.querySelectorAll('.weeks .week:not(.current)').forEach(weekEl => {
            const a = weekEl.querySelector('a') || weekEl;
            weekEl.classList.add('demo-disabled-item');
            a.classList.add('demo-disabled-item');

            if (!weekEl.querySelector('.demo-locked-overlay')) {
                const lockOverlay = document.createElement('div');
                lockOverlay.className = 'demo-locked-overlay';
                lockOverlay.innerHTML = '<span class="material-icons">lock</span>';
                weekEl.appendChild(lockOverlay);
            }

            const handleLockClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                weekEl.classList.add('demo-tab-locked');
                setTimeout(() => weekEl.classList.remove('demo-tab-locked'), 1500);
                if (navigator.vibrate) navigator.vibrate(12);
            };

            weekEl.addEventListener('click', handleLockClick, true);
            if (a !== weekEl) {
                a.addEventListener('click', handleLockClick, true);
            }
        });

        // 3. Блокировка неподдерживаемых подвкладок в учебном плане (Факультативы, ДВБ, Оценить)
        if (pageCtx.page === 'stu.teach_plan') {
            const allowedPlanModes = ['p_mode=advanced', 'p_mode=short'];
            document.querySelectorAll('.submenu a, a.eval-plan-link, a[href*="cust.est_plan_form_stu"]').forEach(link => {
                const href = link.getAttribute('href') || '';
                const isAllowed = allowedPlanModes.some(mode => href.includes(mode)) && href.includes('stu.teach_plan');

                if (!isAllowed) {
                    link.classList.add('demo-disabled-item');

                    if (!link.querySelector('.demo-locked-overlay')) {
                        const lockOverlay = document.createElement('div');
                        lockOverlay.className = 'demo-locked-overlay';
                        lockOverlay.innerHTML = '<span class="material-icons">lock</span><span>Недоступно</span>';
                        link.appendChild(lockOverlay);
                    }

                    const handleLockClick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        link.classList.add('demo-tab-locked');
                        setTimeout(() => link.classList.remove('demo-tab-locked'), 1500);
                        if (navigator.vibrate) navigator.vibrate(12);
                    };

                    link.addEventListener('click', handleLockClick, true);
                }
            });
        }

        // Блокировка неактивных семестров во вкладке "Оценки в семестре"
        if (pageCtx.page === 'stu.signs' && pageCtx.pageMode === 'current') {
            document.querySelectorAll('.submenu a[href*="p_term"]').forEach(link => {
                link.classList.add('demo-disabled-item');

                if (!link.querySelector('.demo-locked-overlay')) {
                    const lockOverlay = document.createElement('div');
                    lockOverlay.className = 'demo-locked-overlay';
                    lockOverlay.innerHTML = '<span class="material-icons" style="font-size: 16px;">lock</span>';
                    link.appendChild(lockOverlay);
                }

                const handleLockClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    link.classList.add('demo-tab-locked');
                    setTimeout(() => link.classList.remove('demo-tab-locked'), 1500);
                    if (navigator.vibrate) navigator.vibrate(12);
                };

                link.addEventListener('click', handleLockClick, true);
            });
        }

        // 4. Переключение поддерживаемых страниц
        document.querySelectorAll('a[href*="stu.timetable"], a[href*="stu.signs"], a[href*="stu_ann.announces"], a[href*="stu.teacher_notes"], a[href*="stu.teach_plan"], a[href*="stu.logout"], .mobile-dock-item').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.closest('.demo-disabled-item, .demo-disabled-tab') || link.classList.contains('demo-disabled-item')) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return;
                }

                const href = link.getAttribute('href') || '';
                if (href.includes('stu.timetable') || link.title === 'Расписание') {
                    e.preventDefault();
                    sessionStorage.setItem('etis_demo_page', 'timetable');
                    window.location.reload();
                } else if (href.includes('stu.signs') || link.title === 'Оценки') {
                    e.preventDefault();
                    if (href.includes('p_mode=current')) {
                        sessionStorage.setItem('etis_demo_page', 'signs_current');
                    } else if (href.includes('p_mode=rating')) {
                        sessionStorage.setItem('etis_demo_page', 'signs_rating');
                    } else if (href.includes('p_mode=diplom')) {
                        sessionStorage.setItem('etis_demo_page', 'signs_diplom');
                    } else {
                        sessionStorage.setItem('etis_demo_page', 'signs');
                    }
                    window.location.reload();
                } else if (href.includes('stu_ann.announces') || link.title === 'Объявления') {
                    e.preventDefault();
                    sessionStorage.setItem('etis_demo_page', 'announces');
                    window.location.reload();
                } else if (href.includes('stu.teacher_notes') || link.title === 'Сообщения') {
                    e.preventDefault();
                    sessionStorage.setItem('etis_demo_page', 'notes');
                    window.location.reload();
                } else if (href.includes('stu.teach_plan') || link.title === 'Учебный план') {
                    e.preventDefault();
                    if (href.includes('p_mode=advanced')) {
                        sessionStorage.setItem('etis_demo_page', 'teach_plan_advanced');
                    } else {
                        sessionStorage.setItem('etis_demo_page', 'teach_plan_short');
                    }
                    window.location.reload();
                } else if (href.includes('stu.logout')) {
                    // Выход из оффлайн-режима
                    e.preventDefault();
                    e.stopPropagation();
                    sessionStorage.removeItem('etis_demo_mode');
                    sessionStorage.removeItem('etis_demo_page');
                    window.location.href = 'stu.login';
                }
            });
        });
    }
}
