// Возвращает имя иконки Material Icons по URL-адресу пункта меню
export const getIconForHref = (href) => {
    if (href === '#version-check') return 'system_update';
    if (href === '#appearance') return 'palette';
    if (href.includes('pure_demo')) return 'account_box';
    if (href === '#report-bug') return 'bug_report';
    if (href === '#settings') return 'settings';
    if (href === '#profile') return 'account_circle';
    if (href === '#guide') return 'auto_stories';
    if (href === '#diary') return 'menu_book';
    if (href.includes('tpr') || href.includes('theme')) return 'menu_book';
    if (href.includes('fcl_choice')) return 'interests';
    if (href.includes('ebl_choice')) return 'how_to_vote';
    if (href.includes('teach_plan')) return 'school';
    if (href.includes('timetable')) return 'calendar_month';
    if (href.includes('schedule_detail')) return 'event_note';
    if (href.includes('signs')) return 'bar_chart_4_bars';
    if (href.includes('absence')) return 'auto_stories_off';
    if (href.includes('stu_phs.show_slots')) return 'steps';
    if (href.includes('orders')) return 'assignment';
    if (href.includes('library')) return 'book_2';
    if (href.includes('teachers')) return 'people';
    if (href.includes('dis_stat') || href.includes('teacher_stats')) return 'insights';
    if (href.includes('est_pkg.show_list')) return 'forum';
    if (href.includes('group_tt') || href.includes('tt_pair')) return 'playlist_add_check';
    if (href.includes('announces')) return 'record_voice_over';
    if (href.includes('teacher_notes')) return 'mail';
    if (href.includes('ses')) return 'account_balance';
    if (href.includes('advice')) return 'lightbulb';
    if (href.includes('electr')) return 'public';
    if (href.includes('cert_pkg')) return 'description';
    if (href.includes('contract_list')) return 'receipt';
    if (href.includes('blank_forms')) return 'insert_drive_file';
    if (href.includes('portfolio')) return 'folder_shared';
    if (href.includes('about')) return 'info';
    if (href.includes('term_test') || href.includes('estimate_')) return 'rate_review';
    if (href.includes('special_est_list')) return 'poll';
    if (href.includes('change_pass')) return 'vpn_key';
    if (href.includes('change_email')) return 'alternate_email';
    if (href.includes('change_pr_page')) return 'account_box';
    if (href.includes('logout')) return 'exit_to_app';
    
    return 'widgets';
};

// Инициализирует нижний мобильный док и выдвижную боковую шторку
export function initMobileMenu() {
    if (document.querySelector('.mobile-nav-dock') || document.querySelector('.login')) return;

    const sidebar = document.querySelector('.span3');
    if (!sidebar) return;

    const isDemoActive = sessionStorage.getItem('etis_demo_mode') === 'true';
    const demoPage = sessionStorage.getItem('etis_demo_page') || 'timetable';

    let currentPath = window.location.pathname.split('/').pop() || '';
    let currentFullUrl = currentPath + window.location.search;

    let isTimetable = false;
    let isSigns = false;

    if (isDemoActive) {
        isTimetable = (demoPage === 'timetable');
        isSigns = (demoPage === 'signs');

        // Определяем виртуальный путь для демо-страниц
        if (demoPage === 'signs') { currentPath = 'stu.signs'; currentFullUrl = 'stu.signs'; }
        else if (demoPage === 'announces') { currentPath = 'stu_ann.announces'; currentFullUrl = 'stu_ann.announces'; }
        else if (demoPage === 'notes') { currentPath = 'stu.teacher_notes'; currentFullUrl = 'stu.teacher_notes'; }
        else if (demoPage === 'teach_plan_advanced') { currentPath = 'stu.teach_plan'; currentFullUrl = 'stu.teach_plan?p_mode=advanced'; }
        else if (demoPage === 'teach_plan' || demoPage === 'teach_plan_short') { currentPath = 'stu.teach_plan'; currentFullUrl = 'stu.teach_plan?p_mode=short'; }
        else { currentPath = 'stu.timetable'; currentFullUrl = 'stu.timetable'; }
    } else {
        isTimetable = currentPath.includes('stu.timetable') || currentPath.includes('schedule_detail');
        isSigns = currentPath.includes('stu.signs');
    }
    const isOther = !isTimetable && !isSigns;

    let dynamicOtherItemHtml = '';
    if (isOther) {
        const iconName = getIconForHref(currentFullUrl || currentPath);
        dynamicOtherItemHtml = `
                    <a href="${currentFullUrl || currentPath}" class="mobile-dock-item active" title="Текущий раздел">
                        <span class="material-icons">${iconName}</span>
                    </a>
                `;
    }

    const dock = document.createElement('div');
    dock.className = 'mobile-nav-dock';
    dock.innerHTML = `
                <a href="stu.timetable" class="mobile-dock-item ${isTimetable ? 'active' : ''}" title="Расписание">
                    <span class="material-icons">calendar_month</span>
                </a>
                <a href="stu.signs" class="mobile-dock-item ${isSigns ? 'active' : ''}" title="Оценки">
                    <span class="material-icons">bar_chart_4_bars</span>
                </a>
                ${dynamicOtherItemHtml}
                <button class="mobile-dock-item mobile-dock-drawer-btn" title="Все разделы">
                    <span class="material-icons">widgets</span>
                    <span class="mobile-notify-dot"></span>
                </button>
            `;
    document.body.appendChild(dock);

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    sidebar.parentNode.insertBefore(overlay, sidebar);

    requestAnimationFrame(() => {
        setTimeout(() => {
            sidebar.classList.add('ready-to-animate');
            overlay.classList.add('ready-to-animate');
        }, 50);
    });

    const drawerBtn = dock.querySelector('.mobile-dock-drawer-btn');

    // Открывает или закрывает мобильную боковую панель навигации
    function toggleMenu(show) {
        if (show) {
            // Возвращаем мобильную шторку в главное меню
            const mainView = sidebar.querySelector('.sidebar-mobile-main-view');
            const subView = sidebar.querySelector('.sidebar-mobile-subview');
            if (mainView && subView) {
                mainView.style.display = '';
                subView.style.display = 'none';
            }
            sidebar.scrollTop = 0;
            sidebar.classList.add('mobile-active');
            overlay.classList.add('active');
            dock.classList.add('dock-hidden');
            document.body.classList.add('modal-open-body');
        } else {
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
            dock.classList.remove('dock-hidden');
            document.body.classList.remove('modal-open-body');
        }
    }

    drawerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = sidebar.classList.contains('mobile-active');
        toggleMenu(!isOpen);
    });

    overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(false);
    });

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });
}
