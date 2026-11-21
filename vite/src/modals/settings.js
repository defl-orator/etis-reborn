import { applyAccentColor } from '../core/accent.js';
import { ACCENT_COLORS, COLOR_ORDER } from '../core/accent-colors.ts';
import { generalConfig, saveGeneralConfig } from '../core/config.js';
import { applyCurrentTheme, detectTheme } from '../core/theme-engine.ts';
import { initAutoUpdateCheck, updateState } from '../core/updater.js';
import { updateLiveTimetable } from '../features/live-timetable.js';
import { getUpdateHTML, loadVersionHistory } from '../features/update-ui.js';
import { refreshModalUI } from './bug-report.js';
import { saveSyncData } from '../sync/data.js';
import { returnToDrawer } from '../ui/drawer.js';

// Открывает модальное окно настроек расширения
export function openSettingsModal(view = 'main') {
    let overlay = document.getElementById('etis-settings-overlay');
    let modal = document.getElementById('etis-settings-modal');
    let requiresReloadOnClose = false;
    let previousView = null;

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-settings-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-settings-modal';
        modal.className = 'analytics-modal'; 
        document.body.appendChild(modal);
    }

    const closeAll = () => {
        detectTheme();
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open-body');
        document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');
        if (requiresReloadOnClose) setTimeout(() => window.location.reload(), 300);
    };
    overlay.onclick = closeAll;

    // Отрисовывает выбранную вкладку настроек и привязывает обработчики
    const renderView = (currentView) => {
        if (previousView === 'appearance' && currentView !== 'appearance') {
            detectTheme();
        }
        previousView = currentView;

        if (currentView === 'main' && window.innerWidth > 960) currentView = 'timetable';

        // Сохраняем текущую позицию скролла перед обновлением HTML
        const scrollContainer = modal.querySelector('.settings-content-scroll');
        const savedScroll = scrollContainer ? scrollContainer.scrollTop : 0;

        let title = ''; let contentHTML = ''; let backTarget = 'main';

        if (currentView === 'general') {
            title = 'Общие';
            contentHTML = `
                        <div class="ios-settings-group">
                            
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Генерация QR-кода</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Создавать QR-код при экспорте онлайн-занятия</span>
                                </div>
                                <input type="checkbox" id="setting-generate-qr" class="tumbler-checkbox" ${generalConfig.generateQR ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Вотермарка на скриншотах</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Даёт возможность поделиться сайтом с установкой расширения</span>
                                </div>
                                <input type="checkbox" id="setting-watermark" class="tumbler-checkbox" ${generalConfig.watermark ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Быстрый вход</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Автоматический вход без ввода пароля при запуске</span>
                                </div>
                                <input type="checkbox" id="setting-quick-login" class="tumbler-checkbox" ${generalConfig.quickLoginEnabled ? 'checked' : ''}>
                            </label>
                            <div class="ios-settings-row" id="quick-login-settings-btn-wrapper" style="display:${generalConfig.quickLoginEnabled ? 'flex' : 'none'} !important; padding-left: 2.4rem;" data-target="quick_login_settings">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-blue);">manage_accounts</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Настроить аккаунты</span>
                                </div>
                                <span class="material-icons chevron" style="color:var(--color-text-secondary);">chevron_right</span>
                            </div>
                        </div>
                    `;
        } else if (currentView === 'quick_login_settings') {
            title = 'Настройка аккаунтов';
            backTarget = 'general';

            // Получение и автоматическое сокращение имени пользователя
            let defaultName = '';
            const nameNode = document.querySelector('.navbar-static-top .span12 > span') || document.querySelector('.sidebar-user-info b');
            if (nameNode) {
                const rawName = nameNode.childNodes[0].textContent.trim();
                const nameParts = rawName.split(' ');
                if (nameParts.length >= 2) {
                    defaultName = `${nameParts[1]} ${nameParts[0].charAt(0)}.`;
                } else if (nameParts.length === 1) {
                    defaultName = nameParts[0];
                }
            }

            contentHTML = `
                        <!-- Список аккаунтов (полностью скрыт, если пуст) -->
                        <div class="ios-settings-group" id="ql-accounts-list" style="margin-bottom: 2.4rem; display: none;">
                            <!-- Список загрузится динамически -->
                        </div>

                        <!-- Кнопка "Добавить аккаунт" с принудительным выравниванием влево -->
                        <div class="ios-settings-group" id="ql-show-add-btn-wrapper" style="margin-bottom: 2.4rem; display: none;">
                            <div class="ios-settings-row" id="ql-show-add-form-btn" style="cursor: pointer; justify-content: flex-start !important; padding: 1.2rem 1.6rem !important; gap: 12px;">
                                <span class="material-icons" style="color: var(--color-accent);">add_circle_outline</span>
                                <span id="ql-add-btn-text" style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Добавить аккаунт</span>
                            </div>
                        </div>

                        <!-- Обертка формы добавления -->
                        <div id="ql-add-form-wrapper" style="display: block;">
                            <div class="appearance-title" style="margin-bottom: 1.2rem; text-align: left; padding-left: 1.6rem;">Добавить новый аккаунт</div>

                            <div class="ios-settings-group" style="margin-bottom: 0 !important;">
                                <div class="ios-settings-row" style="cursor: default !important; padding: 1.2rem 1.6rem !important; display: flex !important; align-items: center !important; position: relative !important;">
                                    <input type="text" id="ql-new-name" placeholder="Имя (например, Николай М.)" value="${defaultName}" style="flex: 1 !important; margin: 0 !important; border: none !important; background: transparent !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important; outline: none !important; box-shadow: none !important; padding: 0 !important; text-align: left !important;">
                                </div>

                                <div class="ios-settings-row" style="cursor: default !important; padding: 1.2rem 1.6rem !important; display: flex !important; align-items: center !important; position: relative !important;">
                                    <input type="text" id="ql-new-email" placeholder="Логин (Email / Фамилия)" style="flex: 1 !important; margin: 0 !important; border: none !important; background: transparent !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important; outline: none !important; box-shadow: none !important; padding: 0 !important; text-align: left !important;">
                                </div>

                                <div class="ios-settings-row" style="cursor: default !important; padding: 1.2rem 1.6rem !important; display: flex !important; align-items: center !important; position: relative !important;">
                                    <input type="password" id="ql-new-pass" placeholder="Пароль" style="flex: 1 !important; margin: 0 !important; border: none !important; background: transparent !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important; outline: none !important; box-shadow: none !important; padding: 0 !important; text-align: left !important;">
                                </div>
                            </div>

                            <button class="answer-btn-custom" id="ql-add-account-btn" style="background: var(--color-accent) !important; color: #fff !important; width: 100% !important; justify-content: center !important; box-shadow: none !important; margin-top: 1.6rem !important; height: 3.8rem !important; cursor: pointer !important;">Добавить</button>
                        </div>
                    `;
        } else if (currentView === 'timetable') {
            title = 'Расписание';
            contentHTML = `
                        <div class="ios-settings-group">
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Окна</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Показывать количество свободных пар между занятиями</span>
                                </div>
                                <input type="checkbox" id="setting-show-gaps" class="tumbler-checkbox" ${generalConfig.showGaps ? 'checked' : ''}>
                            </label>
                            <label id="gaps-custom-wrapper" style="display: ${generalConfig.showGaps ? 'flex' : 'none'} !important;">
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Окна между своими парами</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Рассчитывать окна для консультаций и внешних календарей</span>
                                </div>
                                <input type="checkbox" id="setting-show-gaps-custom" class="tumbler-checkbox" ${generalConfig.showGapsCustom ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Скрывать выходные дни</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Убирает из расписания пустые дни без пар</span>
                                </div>
                                <input type="checkbox" id="setting-hide-days" class="tumbler-checkbox" ${generalConfig.hideDaysOff ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Объединять выходные</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Объединяет идущие подряд дни без пар в одну карточку</span>
                                </div>
                                <input type="checkbox" id="setting-merge-days" class="tumbler-checkbox" ${generalConfig.mergeDaysOff !== false ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Затемнение прошедших пар</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Делает прошедшие занятия тусклыми</span>
                                </div>
                                <input type="checkbox" id="setting-dim-pairs" class="tumbler-checkbox" ${generalConfig.dimPastPairs ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Даты слева</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Писать дату рядом с днем недели, а не в правом углу</span>
                                </div>
                                <input type="checkbox" id="setting-dates-left" class="tumbler-checkbox" ${generalConfig.datesLeft ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Большая перемена</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Отображать обеденный перерыв (13:00 – 13:30) между 3 и 4 парой</span>
                                </div>
                                <input type="checkbox" id="setting-show-big-break" class="tumbler-checkbox" ${generalConfig.showBigBreak !== false ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Таймер пар</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Показывать отсчёт до начала и окончания пары во время светофора</span>
                                </div>
                                <input type="checkbox" id="setting-live-timer" class="tumbler-checkbox" ${generalConfig.liveTimer !== false ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Уведомления об изменениях</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Push-уведомление, если расписание на неделю изменилось</span>
                                </div>
                                <input type="checkbox" id="setting-timetable-notifications" class="tumbler-checkbox" ${generalConfig.timetableNotifications !== false ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Показывать Воскресенье</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Добавляет 7-й день недели в конец списка</span>
                                </div>
                                <input type="checkbox" id="setting-show-sunday" class="tumbler-checkbox" ${generalConfig.showSunday ? 'checked' : ''}>
                            </label>
                        </div>
                    `;
        } else if (currentView === 'grades') {
            title = 'Оценки';
            contentHTML = `
                        <div class="ios-settings-group">
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Уведомления</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Всплывающие окна при изменении баллов</span>
                                </div>
                                <input type="checkbox" id="setting-grade-notifs" class="tumbler-checkbox" ${generalConfig.gradeNotifications !== false ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Абсолютные баллы</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Отображать "из 100" над таблицей вместо макс. баллов</span>
                                </div>
                                <input type="checkbox" id="setting-abs-scores" class="tumbler-checkbox" ${generalConfig.absoluteScores ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Компактные оценки</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Скрывает лишние столбцы в таблицах с оценками</span>
                                </div>
                                <input type="checkbox" id="setting-compact-grades" class="tumbler-checkbox" ${generalConfig.compactGrades ? 'checked' : ''}>
                            </label>
                            <div class="ios-settings-row" id="compact-settings-btn-wrapper" style="display:${generalConfig.compactGrades ? 'flex' : 'none'} !important;" data-target="compact_grades_settings">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-blue);">view_column</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Настроить колонки</span>
                                </div>
                                <span class="material-icons chevron" style="color:var(--color-text-secondary);">chevron_right</span>
                            </div>
                        </div>
                    `;
        } else if (currentView === 'compact_grades_settings') {
            title = 'Настройка колонок';
            backTarget = 'grades';
            const cfg = generalConfig.compactGradesConfig;
            const makeToggle = (id, label, desc, checked) => `
                        <label>
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">${label}</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">${desc}</span>
                            </div>
                            <input type="checkbox" id="${id}" class="tumbler-checkbox compact-col-toggle" ${checked ? 'checked' : ''}>
                        </label>
                    `;
            contentHTML = `
                        <div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-bottom: 1.2rem; padding: 0 4px; line-height: 1.4;">Выберите, какие столбцы оставить видимыми (<b>Тема</b> и <b>Оценка</b> отображаются всегда):</div>
                        <div class="ios-settings-group">
                            ${makeToggle('cfg-workType', 'Вид работы', 'Лек, практ, лаб, сам', cfg.showWorkType)}
                            ${makeToggle('cfg-controlType', 'Вид контроля', 'Итоговое или текущее КМ', cfg.showControlType)}
                            ${makeToggle('cfg-passScore', 'Проходной балл', 'Минимум для зачета', cfg.showPassScore)}
                            ${makeToggle('cfg-rating', 'Балл в рейтинг', 'Текущий и максимальный баллы', cfg.showRating)}
                            ${makeToggle('cfg-date', 'Дата', 'Дата выставления оценки', cfg.showDate)}
                            ${makeToggle('cfg-teacher', 'Преподаватель', 'ФИО преподавателя', cfg.showTeacher)}
                        </div>
                    `;
        } else if (currentView === 'theme_settings') {
            title = 'Тема интерфейса';
            backTarget = 'appearance';

            let mode = localStorage.getItem('etis_theme_mode') || 'system';
            let darkVariant = localStorage.getItem('etis_theme_dark_variant') || 'dark';
            let curTheme = document.documentElement.getAttribute('theme') || 'light';

            let scheduleStart = localStorage.getItem('etis_theme_schedule_start') || '21:00';
            let scheduleEnd = localStorage.getItem('etis_theme_schedule_end') || '07:00';

            const darkName = (darkVariant === 'night') ? 'Ночная' : 'Тёмная';
            let themeLabel = 'Светлая';

            if (mode === 'system') {
                themeLabel = (curTheme === 'light') ? 'Системная (Светлая)' : `Системная (${darkName})`;
            } else if (mode === 'schedule') {
                themeLabel = (curTheme === 'light') ? 'Расписание (Светлая)' : `Расписание (${darkName})`;
            } else {
                themeLabel = (curTheme === 'light') ? 'Светлая' : darkName;
            }

            contentHTML = `
                        ${mode === 'none' ? `
                        <div class="appearance-title" style="margin-bottom: 1rem; padding-left: 1.6rem;">Варианты оформления</div>
                        <div class="ios-settings-group">
                            <div class="ios-settings-row theme-select-row" data-theme-val="light" style="cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-yellow);">light_mode</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Светлая</span>
                                </div>
                                ${curTheme === 'light' ? `<span class="material-icons" style="color:var(--color-accent);">check</span>` : ''}
                            </div>
                            <div class="ios-settings-row theme-select-row" data-theme-val="dark" style="cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-blue);">${darkVariant === 'night' ? 'brightness_2' : 'dark_mode'}</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">${darkVariant === 'night' ? 'Ночная' : 'Тёмная'}</span>
                                </div>
                                ${curTheme !== 'light' ? `<span class="material-icons" style="color:var(--color-accent);">check</span>` : ''}
                            </div>
                        </div>
                        ` : ''}

                        <div class="appearance-title" style="margin: 2.4rem 0 1rem 0; padding-left: 1.6rem;">Автоматическое переключение</div>
                        <div class="ios-settings-group">
                            <!-- Синхронизация с устройством -->
                            <div class="ios-settings-row auto-mode-row" data-mode-val="system" style="cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-accent);">brightness_auto</span>
                                    <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                        <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Как на устройстве</span>
                                        <span style="font-size:1.1rem; color:var(--color-text-secondary);">Переключается вместе с темой системы</span>
                                    </div>
                                </div>
                                ${mode === 'system' ? `<span class="material-icons" style="color:var(--color-accent);">check</span>` : ''}
                            </div>
                            <!-- По расписанию -->
                            <div class="ios-settings-row auto-mode-row" data-mode-val="schedule" style="cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-warning);">schedule</span>
                                    <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                        <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">По расписанию</span>
                                        <span style="font-size:1.1rem; color:var(--color-text-secondary);">Включение по заданному времени</span>
                                    </div>
                                </div>
                                ${mode === 'schedule' ? `<span class="material-icons" style="color:var(--color-accent);">check</span>` : ''}
                            </div>
                            <!-- Выключено (вручную) -->
                            <div class="ios-settings-row auto-mode-row" data-mode-val="none" style="cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-text-secondary);">block</span>
                                    <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                        <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Выключено</span>
                                        <span style="font-size:1.1rem; color:var(--color-text-secondary);">Всегда использовать выбранную тему</span>
                                    </div>
                                </div>
                                ${mode === 'none' ? `<span class="material-icons" style="color:var(--color-accent);">check</span>` : ''}
                            </div>
                        </div>

                        <!-- Тумблер Ночной темы (OLED) -->
                        <div class="ios-settings-group" style="${mode === 'none' ? 'margin-top: 1.4rem;' : ''}">
                            <label style="cursor:pointer;">
                                <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Ночная тема (OLED)</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Глубокий чёрный цвет вместо тёмно-серого</span>
                                </div>
                                <input type="checkbox" id="theme-night-variant-toggle" class="tumbler-checkbox" ${darkVariant === 'night' ? 'checked' : ''}>
                            </label>
                        </div>

                        ${mode === 'schedule' ? `
                        <div class="appearance-title" style="margin: 2.4rem 0 1rem 0; padding-left: 1.6rem;">Время переключения</div>
                        <div class="ios-settings-group">
                            <div class="ios-settings-row" style="cursor: default !important;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Включение тёмной</span>
                                <input type="time" id="schedule-start-input" value="${scheduleStart}" style="background:var(--color-input) !important; border:1px solid var(--color-table-border) !important; border-radius:var(--radius-small) !important; padding:0.6rem 1rem !important; color:var(--color-text-primary) !important; font-size:1.35rem !important; font-weight:700; width:auto !important; margin:0 !important;">
                            </div>
                            <div class="ios-settings-row" style="cursor: default !important;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Выключение (светлая)</span>
                                <input type="time" id="schedule-end-input" value="${scheduleEnd}" style="background:var(--color-input) !important; border:1px solid var(--color-table-border) !important; border-radius:var(--radius-small) !important; padding:0.6rem 1rem !important; color:var(--color-text-primary) !important; font-size:1.35rem !important; font-weight:700; width:auto !important; margin:0 !important;">
                            </div>
                        </div>
                        ` : ''}
                    `;
        } else if (currentView === 'appearance') {
            title = 'Внешний вид';
            let config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, isThreeColors: false, colors: ['blue', 'lightblue'], isGlass: false };

            let mode = localStorage.getItem('etis_theme_mode') || 'system';
            let darkVariant = localStorage.getItem('etis_theme_dark_variant') || 'dark';
            let curTheme = document.documentElement.getAttribute('theme') || 'light';

            // Если у пользователя выбрана OLED-тема, то тёмным вариантом является именно 'night'
            const actualDarkTheme = (darkVariant === 'night') ? 'night' : 'dark';
            const darkName = (darkVariant === 'night') ? 'Ночная' : 'Тёмная';

            // Определяем активную вкладку редактирования (светлая или тёмная/ночная)
            if (window._activeEditingTheme === undefined) {
                window._activeEditingTheme = (curTheme === 'dark' || curTheme === 'night') ? 'dark' : 'light';
            }

            // Если раздельные цвета включены, включаем предпросмотр с сохранением 'night'
            if (config.separateThemes) {
                document.documentElement.setAttribute('theme', window._activeEditingTheme === 'dark' ? actualDarkTheme : 'light');
            }

            // Возвращает конфиг акцента для текущей редактируемой темы
            // Возвращает конфиг акцента для текущей редактируемой темы
            const getActiveSubConfig = () => {
                if (!config.separateThemes) return config;
                const subMode = window._activeEditingTheme || 'light';
                if (!config[subMode]) {
                    config[subMode] = {
                        isGradient: config.isGradient !== false,
                        isThreeColors: config.isThreeColors === true,
                        colors: [...(config.colors || ['blue', 'lightblue'])]
                    };
                }
                return config[subMode];
            };

            let activeSubConfig = getActiveSubConfig();

            let themeLabel = 'Светлая';
            if (mode === 'system') {
                themeLabel = (curTheme === 'light') ? 'Системная (Светлая)' : `Системная (${darkName})`;
            } else if (mode === 'schedule') {
                themeLabel = (curTheme === 'light') ? 'Расписание (Светлая)' : `Расписание (${darkName})`;
            } else {
                themeLabel = (curTheme === 'light') ? 'Светлая' : darkName;
            }

            contentHTML = `
                        <div class="ios-settings-group" style="margin-bottom: 0.8rem;">
                            <div class="ios-settings-row" data-target="theme_settings" style="cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-accent);">palette</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Тема интерфейса</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span style="font-size:1.4rem; color:var(--color-text-secondary);">${themeLabel}</span>
                                    <span class="material-icons chevron" style="color:var(--color-text-secondary);">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        <div class="ios-settings-group" style="margin-bottom: 0.8rem;">
                            <label>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Раздельные цвета для тем</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Настроить разные акценты для светлой и тёмной темы</span>
                                </div>
                                <input type="checkbox" id="separate-themes-toggle" class="tumbler-checkbox" ${config.separateThemes ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Градиент</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Использовать плавный перелив цветов</span>
                                </div>
                                <input type="checkbox" id="grad-toggle" class="tumbler-checkbox" ${activeSubConfig.isGradient ? 'checked' : ''}>
                            </label>
                            <label style="display: ${activeSubConfig.isGradient ? 'flex' : 'none'} !important;" id="three-colors-wrapper">
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">3 цвета</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Создать градиент из трех оттенков</span>
                                </div>
                                <input type="checkbox" id="three-colors-toggle" class="tumbler-checkbox" ${activeSubConfig.isThreeColors ? 'checked' : ''}>
                            </label>
                            <label>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Эффект стекла</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Размытие для капсул и кнопок</span>
                                </div>
                                <input type="checkbox" id="glass-toggle" class="tumbler-checkbox" ${config.isGlass ? 'checked' : ''}>
                            </label>
                        </div>

                        <div class="ios-settings-group" style="margin-bottom: 0.8rem;">
                            <!-- Капсула переключения Светлая/Тёмная над палитрой -->
                            <div id="theme-subtab-capsule" style="display: ${config.separateThemes ? 'flex' : 'none'} !important; justify-content: center; padding: 1.4rem 1.6rem 0.4rem 1.6rem;">
                                <div class="sync-tabs" style="width: 100%; max-width: 280px; margin: 0 !important; background: var(--color-input) !important;">
                                    <button class="sync-tab ${window._activeEditingTheme === 'light' ? 'active' : ''}" id="edit-theme-light-btn" style="padding: 0.6rem 1.2rem !important; font-size: 1.25rem !important;">
                                        <span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">light_mode</span>Светлая
                                    </button>
                                    <button class="sync-tab ${window._activeEditingTheme === 'dark' ? 'active' : ''}" id="edit-theme-dark-btn" style="padding: 0.6rem 1.2rem !important; font-size: 1.25rem !important;">
                                        <span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">${darkVariant === 'night' ? 'brightness_2' : 'dark_mode'}</span>${darkName}
                                    </button>
                                </div>
                            </div>

                            <div class="ios-settings-row" style="padding: 1.6rem; cursor: default; justify-content: center;">
                                <div class="color-picker-grid" id="color-grid" style="margin: 0; width: 100%;"></div>
                            </div>
                            <div class="ios-settings-row" id="random-color-row" style="cursor: pointer;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-text-secondary);">casino</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Случайные цвета</span>
                                </div>
                                <span class="material-icons chevron" style="color:var(--color-text-secondary);">chevron_right</span>
                            </div>
                        </div>

                        <!-- ИНТЕРАКТИВНЫЙ БЛОК ПРЕДПОКАЗА ИНТЕРФЕЙСА -->
                        <div id="accent-preview-box" style="
                            border: 1px solid var(--color-table-border);
                            background: var(--color-card);
                            border-radius: var(--radius-large);
                            padding: 1.6rem;
                            display: flex;
                            flex-direction: column;
                            gap: 1.2rem;
                            width: 100%;
                            box-sizing: border-box;
                            box-shadow: var(--shadow-main);
                            overflow: hidden;
                        ">
                            <div class="etis-preview-active-element" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.2rem; border-radius: var(--radius-small); font-weight: 700; transition: background 0.3s, color 0.3s;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span class="material-icons" style="font-size: 1.8rem; transition: color 0.3s;">account_circle</span>
                                    <span style="font-size: 1.2rem;">Пример</span>
                                </div>
                                <span class="material-icons" style="font-size: 1.6rem; transition: color 0.3s;">chevron_right</span>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <div class="etis-preview-active-element" style="padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 700; transition: background 0.3s, box-shadow 0.3s;">Активный</div>
                                <div class="etis-preview-glass-element" style="background: var(--color-highlight); color: var(--color-text-primary); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; border: 1px solid var(--color-table-border); transition: backdrop-filter 0.3s;">Обычный</div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--color-highlight); padding: 1.2rem; border-radius: var(--radius-medium);">
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                                    <span style="font-size: 1.2rem; font-weight: 700; color: var(--color-text-primary);">Интерфейс</span>
                                    <span style="font-size: 1rem; color: var(--color-text-secondary);">Описание блока</span>
                                </div>
                                <span class="material-icons" style="color: var(--color-accent); font-size: 1.8rem; transition: color 0.2s;">done</span>
                            </div>
                        </div>
                    `;
        
        } else if (currentView === 'beta') {
            title = 'Бета функции';
            const isBetaOn = generalConfig.betaFeaturesEnabled;

            contentHTML = `
                        <div class="ios-settings-group">
                            <!-- Главный мастер-тумблер -->
                            <label>
                                <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Экспериментальные функции</span>
                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Включить доступ к новым функциям, находящимся в разработке</span>
                                </div>
                                <input type="checkbox" id="setting-master-beta" class="tumbler-checkbox" ${isBetaOn ? 'checked' : ''}>
                            </label>
                        </div>
                    `;
        } else if (currentView === 'version') {
            title = 'Обновление';
            contentHTML = `<div id="version-content-wrapper">${getUpdateHTML()}</div>`;
        } else if (currentView === 'history') {
            title = 'История версий';
            backTarget = 'version';
            contentHTML = `<div id="version-history-list"><div style="text-align:center; padding: 3rem 0; color:var(--color-text-secondary);"><span class="material-icons" style="animation:spin 1s linear infinite; font-size: 32px;">sync</span></div></div>`;
        } else if (currentView === 'guide') {
            title = 'Обучение';
            
            const guideCard = (icon, itemTitle, pcDesc, mobDesc = null, singleDesc = null) => `
                        <div class="ios-settings-group" style="margin-bottom: 1.4rem;">
                            <div style="padding: 1.6rem 1.8rem; text-align: left;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                                    <span class="material-icons" style="color: var(--color-accent); font-size: 2.2rem;">${icon}</span>
                                    <span style="font-size: 1.45rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.3;">${itemTitle}</span>
                                </div>
                                <div style="font-size: 1.3rem; line-height: 1.55; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 0.8rem;">
                                    ${singleDesc ? `<div>${singleDesc}</div>` : `
                                        <div><b style="color: var(--color-text-primary);">🖥️ На ПК:</b> ${pcDesc}</div>
                                        <div><b style="color: var(--color-text-primary);">📱 На телефоне:</b> ${mobDesc}</div>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;

            contentHTML = `
                        <div class="appearance-title" style="margin: 0.5rem 0 1rem 0; padding-left: 1.8rem; box-sizing: border-box;">Расписание</div>
                        ${guideCard(
                    'edit_note',
                    'Как добавить заметку к паре',
                    'Наведите курсор на строку пары — появится значок карандаша ✎. Введите текст во вкладке «Заметка». Тумблер «На следующую пару» автоматически перенесет ее к следующему такому же занятию.',
                    'Смахните строку пары <b>влево</b> — откроется окно ввода заметки.'
                )}
                        ${guideCard(
                    'notification_important',
                    'Как пометить пару важной',
                    'Наведите курсор на ячейку с номером пары слева — на бейдже появится колокольчик. Нажмите на него, чтобы пара выделилась красным.',
                    'Смахните строку пары <b>вправо</b> до появления колокольчика с легкой вибрацией.'
                )}
                        ${guideCard(
                    'star_rate',
                    'Как оценить пару',
                    'Наведите курсор на пару — появится кнопка «Оценить» справа от преподавателя со ссылкой на форму отзыва.',
                    'Смахните уже прошедшую пару <b>вправо</b> — появится значок звезды для быстрого перехода к отзыву.'
                )}
                        ${guideCard(
                    'ios_share',
                    'Как поделиться днем',
                    'Наведите курсор на заголовок дня — в правом углу появится иконка экспорта для сохранения картинки (не работает в Safari на macOS).',
                    'Смахните заголовок дня <b>влево</b> (или нажмите иконку «Поделиться» в шапке дня).'
                )}

                        <div class="appearance-title" style="margin: 2.4rem 0 1rem 0; padding-left: 1.8rem; box-sizing: border-box;">Функции и настройки</div>
                        ${guideCard(
                    'alarm_on',
                    'Как создать напоминание о паре',
                    null, null,
                    'Нажмите на значок карандаша ✎ у пары (или смахните пару влево на телефоне) ➔ вкладка <b>«Напоминание»</b> ➔ выберите удобный сервис (Apple, Google или Яндекс) и время ➔ нажмите <b>«Добавить»</b>.'
                )}
                        ${guideCard(
                    'cloud_sync',
                    'Синхронизация между устройствами',
                    null, null,
                    'Перейдите в раздел <b>«Профиль»</b> ➔ <b>«Мои данные»</b> ➔ включите синхронизацию. Все ваши заметки, пары и цветовые темы будут мгновенно переноситься на другие устройства.'
                )}
                        ${guideCard(
                    'flash_on',
                    'Быстрый вход без пароля',
                    null, null,
                    'Откройте <b>«Настройки»</b> ➔ <b>«Общие»</b> ➔ включите <b>«Быстрый вход»</b> и сохраните логин. При следующем запуске появится кнопка входа в один клик.'
                )}
                        ${guideCard(
                    'keyboard',
                    'Горячие клавиши',
                    null, null,
                    `Удобное управление порталом с клавиатуры.<br><br>
                            • <b style="color:var(--color-accent)">Ctrl + K</b> (или <b>Cmd + K</b>) — Глобальный поиск по ЕТИС<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + Shift + D</b> или <b style="color:var(--color-accent)">Alt (Opt) + 3</b> — Дневник и дедлайны<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + Shift + S</b> или <b style="color:var(--color-accent)">Alt (Opt) + 8</b> — Настройки расширения<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + Shift + P</b> или <b style="color:var(--color-accent)">Alt (Opt) + 6</b> — Мой профиль и достижения<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + Shift + C</b> или <b style="color:var(--color-accent)">Alt (Opt) + 4</b> — График консультаций<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + Shift + N</b> или <b style="color:var(--color-accent)">Alt (Opt) + 7</b> — Центр уведомлений<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + Shift + T</b> или <b style="color:var(--color-accent)">Alt (Opt) + 1</b> — Моё расписание<br>
                            • <b style="color:var(--color-accent)">Alt (Opt) + 2</b> — Мои оценки<br>
                            • <b style="color:var(--color-accent)">Esc</b> — Закрыть любое открытое окно`
                )}
                    `;
        }

        const isMainMobile = currentView === 'main';
        const showBackBtnOnPC = backTarget !== 'main';
        const backBtnClass = showBackBtnOnPC ? 'back-modal-btn' : 'back-modal-btn settings-mobile-header';


        modal.innerHTML = `
                    <div class="settings-layout">
                        <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Настройки</div>
                            <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons back-to-drawer-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                    <span>Настройки</span>
                                </div>
                                <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                            </div>

                            <div class="sidebar-tabs-container">
                                <div class="settings-sidebar-btn ${currentView === 'general' ? 'active' : ''}" data-target="general">
                                    <span class="material-icons">settings</span><span class="sidebar-btn-text">Общие</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'timetable' ? 'active' : ''}" data-target="timetable">
                                    <span class="material-icons">calendar_today</span><span class="sidebar-btn-text">Расписание</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'grades' ? 'active' : ''}" data-target="grades">
                                    <span class="material-icons">analytics</span><span class="sidebar-btn-text">Оценки</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'appearance' ? 'active' : ''}" data-target="appearance">
                                    <span class="material-icons">palette</span><span class="sidebar-btn-text">Внешний вид</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'beta' ? 'active' : ''}" data-target="beta" style="display: none !important;">
                                    <span class="material-icons">science</span><span class="sidebar-btn-text">Бета функции</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'guide' ? 'active' : ''}" data-target="guide">
                                    <span class="material-icons">auto_stories</span><span class="sidebar-btn-text">Обучение</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'version' || currentView === 'history' ? 'active' : ''}" data-target="version">
                                    <span class="material-icons">system_update</span><span class="sidebar-btn-text">Обновление</span>${updateState.hasUpdate ? '<span class="badge-point"></span>' : ''}<span class="material-icons chevron">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="settings-content-scroll">
                                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <span class="material-icons ${backBtnClass}" data-back="${backTarget}" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                        <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${title}</span>
                                    </div>
                                    <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                                </div>
                                <div style="padding: 0.8rem 0 4rem 0;">
                                    ${contentHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        // Восстановление позиции прокрутки после того, как браузер полностью пересчитает высоты элементов
        setTimeout(() => {
            const restoredScroll = modal.querySelector('.settings-content-scroll');
            if (restoredScroll && savedScroll > 0) {
                restoredScroll.scrollTop = savedScroll;
            }
        }, 0);

        modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeAll);
        modal.querySelectorAll('.back-modal-btn').forEach(btn => {
            btn.onclick = function() { renderView(this.getAttribute('data-back')); };
        });
        modal.querySelectorAll('.settings-sidebar-btn').forEach(btn => {
            btn.onclick = () => renderView(btn.getAttribute('data-target'));
        });
        modal.querySelectorAll('.ios-settings-row[data-target]').forEach(row => {
            row.onclick = () => renderView(row.getAttribute('data-target'));
        });

        modal.querySelectorAll('.back-to-drawer-btn').forEach(btn => {
            btn.onclick = () => returnToDrawer(modal, overlay);
        });

        if (currentView === 'general') {
            modal.querySelector('#setting-watermark').onchange = (e) => {
                generalConfig.watermark = e.target.checked;
                saveGeneralConfig();
            };
            modal.querySelector('#setting-generate-qr').onchange = (e) => {
                generalConfig.generateQR = e.target.checked;
                saveGeneralConfig();
            };

            const qlToggle = modal.querySelector('#setting-quick-login');
            if (qlToggle) {
                qlToggle.onchange = (e) => {
                    generalConfig.quickLoginEnabled = e.target.checked;
                    saveGeneralConfig();
                    const wrapper = modal.querySelector('#quick-login-settings-btn-wrapper');
                    if (wrapper) {
                        wrapper.style.setProperty('display', e.target.checked ? 'flex' : 'none', 'important');
                    }
                };
            }

        } else if (currentView === 'quick_login_settings') {
            // Читает сохранённые аккаунты быстрого входа из хранилища расширения
            const getAccounts = () => {
                let accounts = [];
                try {
                    let raw = '';
                    if (typeof GM_getValue !== 'undefined') {
                        raw = GM_getValue('ql_accounts_v2', '');
                    }
                    // Полностью исключаем чтение из localStorage страницы
                    accounts = JSON.parse(raw || '[]');
                } catch (e) {
                    accounts = [];
                }
                return accounts;
            };

            // Сохраняет список аккаунтов быстрого входа в хранилище расширения
            const saveAccounts = (accounts) => {
                const str = JSON.stringify(accounts);
                if (typeof GM_setValue !== 'undefined') {
                    try {
                        GM_setValue('ql_accounts_v2', str);
                    } catch (e) {
                        console.error('Ошибка записи в GM_setValue:', e);
                    }
                } else {
                    // Если расширение не поддерживает GM_setValue, не сохраняем в LocalStorage из соображений безопасности
                    alert('Ошибка безопасности: Хранилище расширения недоступно. Пароль не сохранен.');
                }
            };

            // Отрисовывает список сохранённых аккаунтов быстрого входа
            const renderQLAccountsInSettings = (listContainer) => {
                const accounts = getAccounts();
                const addFormWrapper = modal.querySelector('#ql-add-form-wrapper');
                const showAddBtnWrapper = modal.querySelector('#ql-show-add-btn-wrapper');

                // Полностью скрываем блок, если список пуст
                if (accounts.length === 0) {
                    listContainer.style.setProperty('display', 'none', 'important');
                    if (showAddBtnWrapper) showAddBtnWrapper.style.setProperty('display', 'none', 'important');
                    if (addFormWrapper) addFormWrapper.style.setProperty('display', 'block', 'important');
                    return;
                }

                listContainer.style.setProperty('display', 'flex', 'important');
                listContainer.innerHTML = accounts.map((acc, idx) => `
                            <div class="ios-settings-row" style="cursor: default !important; padding: 1.2rem 1.6rem !important;">
                                <div style="text-align: left;">
                                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary);">${acc.name}</div>
                                    <div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 2px;">${acc.email}</div>
                                </div>
                                <button class="answer-btn-custom ql-delete-acc-btn" data-idx="${idx}" style="background: rgba(255,59,48,0.1) !important; color: var(--color-red) !important; border: 1px solid rgba(255,59,48,0.3) !important; box-shadow: none !important; padding: 6px 12px; font-size: 1.2rem; height: auto !important; margin: 0 !important; cursor: pointer;">
                                    Удалить
                                </button>
                            </div>
                        `).join('');

                // Если аккаунты есть, скрываем форму и показываем кнопку для раскрытия
                if (showAddBtnWrapper) showAddBtnWrapper.style.setProperty('display', 'block', 'important');
                if (addFormWrapper) addFormWrapper.style.setProperty('display', 'none', 'important');

                // Динамически подставляем правильный текст (например, "Добавить 2-й аккаунт")
                const btnTextEl = modal.querySelector('#ql-add-btn-text');
                if (btnTextEl) {
                    btnTextEl.textContent = `Добавить ${accounts.length + 1}-й аккаунт`;
                }

                const showAddFormBtn = modal.querySelector('#ql-show-add-form-btn');
                if (showAddFormBtn) {
                    showAddFormBtn.onclick = (e) => {
                        e.preventDefault();
                        if (showAddBtnWrapper) showAddBtnWrapper.style.setProperty('display', 'none', 'important');
                        if (addFormWrapper) addFormWrapper.style.setProperty('display', 'block', 'important');
                    };
                }

                listContainer.querySelectorAll('.ql-delete-acc-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        const idx = parseInt(btn.getAttribute('data-idx'), 10);
                        let currentAccs = getAccounts();
                        if (currentAccs[idx] && confirm(`Удалить аккаунт "${currentAccs[idx].name}"?`)) {
                            currentAccs.splice(idx, 1);
                            saveAccounts(currentAccs);
                            renderQLAccountsInSettings(listContainer);
                        }
                    };
                });
            };

            const accountsListEl = modal.querySelector('#ql-accounts-list');
            if (accountsListEl) {
                renderQLAccountsInSettings(accountsListEl);

                const addAccBtn = modal.querySelector('#ql-add-account-btn');
                if (addAccBtn) {
                    addAccBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const nameInput = modal.querySelector('#ql-new-name');
                        const emailInput = modal.querySelector('#ql-new-email');
                        const passInput = modal.querySelector('#ql-new-pass');

                        const name = nameInput ? nameInput.value.trim() : '';
                        const email = emailInput ? emailInput.value.trim() : '';
                        const pass = passInput ? passInput.value.trim() : '';

                        if (!name || !email || !pass) {
                            alert('Пожалуйста, заполните все поля!');
                            return;
                        }

                        let accounts = getAccounts();
                        accounts.push({ name, email, password: pass });
                        saveAccounts(accounts);

                        if (nameInput) nameInput.value = '';
                        if (emailInput) emailInput.value = '';
                        if (passInput) passInput.value = '';

                        renderQLAccountsInSettings(accountsListEl);
                    };
                }
            }

        } else if (currentView === 'timetable') {
            modal.querySelector('#setting-show-gaps').onchange = (e) => {
                generalConfig.showGaps = e.target.checked;
                const wrap = modal.querySelector('#gaps-custom-wrapper');
                if (wrap) wrap.style.setProperty('display', e.target.checked ? 'flex' : 'none', 'important');
                saveGeneralConfig();
                if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            };
            modal.querySelector('#setting-show-gaps-custom').onchange = (e) => {
                generalConfig.showGapsCustom = e.target.checked;
                saveGeneralConfig();
                if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            };
            modal.querySelector('#setting-hide-days').onchange = (e) => {
                generalConfig.hideDaysOff = e.target.checked;
                saveGeneralConfig();
                if (typeof window.recalculateTimetable === 'function') {
                    window.recalculateTimetable();
                } else if (window.applyHideDaysOff) {
                    window.applyHideDaysOff();
                }
            };
            modal.querySelector('#setting-merge-days').onchange = (e) => {
                generalConfig.mergeDaysOff = e.target.checked;
                saveGeneralConfig();
                if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            };
            modal.querySelector('#setting-dim-pairs').onchange = (e) => {
                generalConfig.dimPastPairs = e.target.checked;
                saveGeneralConfig();
                if (window.applyDimming) window.applyDimming();
            };
            modal.querySelector('#setting-dates-left').onchange = (e) => {
                generalConfig.datesLeft = e.target.checked;
                saveGeneralConfig();
                requiresReloadOnClose = true;
            };
            modal.querySelector('#setting-show-big-break').onchange = (e) => {
                generalConfig.showBigBreak = e.target.checked;
                saveGeneralConfig();
                if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            };
            modal.querySelector('#setting-live-timer').onchange = (e) => {
                generalConfig.liveTimer = e.target.checked;
                saveGeneralConfig();
                updateLiveTimetable();
            };
            modal.querySelector('#setting-timetable-notifications').onchange = (e) => {
                generalConfig.timetableNotifications = e.target.checked;
                saveGeneralConfig();
            };
            modal.querySelector('#setting-show-sunday').onchange = (e) => {
                generalConfig.showSunday = e.target.checked;
                saveGeneralConfig();
                requiresReloadOnClose = true;
            };
        } else if (currentView === 'grades') {
            modal.querySelector('#setting-grade-notifs').onchange = (e) => {
                generalConfig.gradeNotifications = e.target.checked;
                saveGeneralConfig();
            };
            modal.querySelector('#setting-abs-scores').onchange = (e) => {
                generalConfig.absoluteScores = e.target.checked;
                saveGeneralConfig();
                requiresReloadOnClose = true;
            };
            modal.querySelector('#setting-compact-grades').onchange = (e) => {
                generalConfig.compactGrades = e.target.checked;
                modal.querySelector('#compact-settings-btn-wrapper').style.setProperty('display', e.target.checked ? 'flex' : 'none', 'important');
                saveGeneralConfig();
                requiresReloadOnClose = true;
            };
        } else if (currentView === 'compact_grades_settings') {
            modal.querySelectorAll('.compact-col-toggle').forEach(checkbox => {
                checkbox.onchange = (e) => {
                    const id = e.target.id;
                    if (id === 'cfg-workType') generalConfig.compactGradesConfig.showWorkType = e.target.checked;
                    if (id === 'cfg-controlType') generalConfig.compactGradesConfig.showControlType = e.target.checked;
                    if (id === 'cfg-passScore') generalConfig.compactGradesConfig.showPassScore = e.target.checked;
                    if (id === 'cfg-rating') generalConfig.compactGradesConfig.showRating = e.target.checked;
                    if (id === 'cfg-date') generalConfig.compactGradesConfig.showDate = e.target.checked;
                    if (id === 'cfg-teacher') generalConfig.compactGradesConfig.showTeacher = e.target.checked;
                    saveGeneralConfig();
                    requiresReloadOnClose = true;
                };
            });
        } else if (currentView === 'theme_settings') {
            modal.querySelectorAll('.theme-select-row').forEach(row => {
                row.onclick = () => {
                    const val = row.getAttribute('data-theme-val');
                    saveSyncData('etis_theme_mode', 'none');
                    if (val === 'light') {
                        saveSyncData('theme', 'light');
                    } else {
                        const darkVar = localStorage.getItem('etis_theme_dark_variant') || 'dark';
                        saveSyncData('theme', darkVar);
                    }
                    applyCurrentTheme();
                    renderView('theme_settings');
                };
            });

            const nightToggle = modal.querySelector('#theme-night-variant-toggle');
            if (nightToggle) {
                nightToggle.onchange = (e) => {
                    const newDarkVar = e.target.checked ? 'night' : 'dark';
                    saveSyncData('etis_theme_dark_variant', newDarkVar);
                    const mode = localStorage.getItem('etis_theme_mode') || 'system';
                    const curTheme = document.documentElement.getAttribute('theme') || 'light';

                    if (mode === 'none') {
                        if (curTheme !== 'light') {
                            saveSyncData('theme', newDarkVar);
                        }
                    }
                    applyCurrentTheme();
                    renderView('theme_settings');
                };
            }

            modal.querySelectorAll('.auto-mode-row').forEach(row => {
                row.onclick = () => {
                    const modeVal = row.getAttribute('data-mode-val');
                    saveSyncData('etis_theme_mode', modeVal);
                    applyCurrentTheme();
                    renderView('theme_settings');
                };
            });

            const startInput = modal.querySelector('#schedule-start-input');
            const endInput = modal.querySelector('#schedule-end-input');

            if (startInput) {
                startInput.onchange = (e) => {
                    saveSyncData('etis_theme_schedule_start', e.target.value);
                    applyCurrentTheme();
                };
            }
            if (endInput) {
                endInput.onchange = (e) => {
                    saveSyncData('etis_theme_schedule_end', e.target.value);
                    applyCurrentTheme();
                };
            }
        } else if (currentView === 'appearance') {
            let config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, isThreeColors: false, colors: ['blue', 'lightblue'] };
            if (window._etisTargetIndex === undefined) window._etisTargetIndex = 0;

            // Возвращает конфиг акцента для текущей редактируемой темы
            const getActiveSubConfig = () => {
                if (!config.separateThemes) return config;
                const mode = window._activeEditingTheme || 'light';
                if (!config[mode]) {
                    config[mode] = {
                        isGradient: config.isGradient !== false,
                        isThreeColors: config.isThreeColors === true,
                        colors: [...(config.colors || ['blue', 'lightblue'])]
                    };
                }
                return config[mode];
            };

            const grid = modal.querySelector('#color-grid');

            // Обновляет индикаторы выбранных цветов в сетке палитры
            const updateColorGridSelection = (gridEl, currentConfig) => {
                const activeSub = getActiveSubConfig();
                const maxColors = !activeSub.isGradient ? 1 : (activeSub.isThreeColors ? 3 : 2);
                const activeColors = (activeSub.colors || []).slice(0, maxColors);

                gridEl.querySelectorAll('.color-picker-circle').forEach(circle => {
                    const colorKey = circle.getAttribute('data-color-key');
                    circle.classList.remove('selected');
                    circle.innerHTML = '';

                    const indices = [];
                    activeColors.forEach((c, idx) => {
                        if (c === colorKey) indices.push(idx + 1);
                    });

                    if (indices.length > 0) {
                        circle.classList.add('selected');
                        if (!activeSub.isGradient) {
                            circle.innerHTML = '<span class="material-icons" style="font-size: 20px;">check</span>';
                        } else {
                            const label = indices.join(',');
                            let fontSize = '1.4rem';
                            if (label.length >= 5) fontSize = '1.05rem';
                            else if (label.length >= 3) fontSize = '1.2rem';
                            circle.innerHTML = `<span style="font-size: ${fontSize}; font-weight: 800; line-height: 1; letter-spacing: -0.3px;">${label}</span>`;
                        }
                    }
                });
            };

            // Синхронизирует тумблеры градиента с активной темой
            const syncTogglesWithActiveTheme = () => {
                const activeSub = getActiveSubConfig();
                const gradToggle = modal.querySelector('#grad-toggle');
                const threeToggle = modal.querySelector('#three-colors-toggle');
                const threeWrapper = modal.querySelector('#three-colors-wrapper');

                if (gradToggle) gradToggle.checked = activeSub.isGradient;
                if (threeToggle) threeToggle.checked = activeSub.isThreeColors;
                if (threeWrapper) threeWrapper.style.setProperty('display', activeSub.isGradient ? 'flex' : 'none', 'important');
            };

            COLOR_ORDER.forEach(colorKey => {
                const circle = document.createElement('div');
                circle.className = 'color-picker-circle';
                circle.style.backgroundColor = ACCENT_COLORS[colorKey];
                circle.setAttribute('data-color-key', colorKey);

                circle.onclick = () => {
                    const activeSub = getActiveSubConfig();
                    const maxColors = !activeSub.isGradient ? 1 : (activeSub.isThreeColors ? 3 : 2);

                    if (!activeSub.isGradient) {
                        activeSub.colors = [colorKey];
                        window._etisTargetIndex = 0;
                    } else {
                        while (activeSub.colors.length < maxColors) {
                            activeSub.colors.push(colorKey);
                        }
                        activeSub.colors = activeSub.colors.slice(0, maxColors);

                        if (window._etisTargetIndex === undefined || window._etisTargetIndex >= maxColors) {
                            window._etisTargetIndex = 0;
                        }

                        activeSub.colors[window._etisTargetIndex] = colorKey;
                        window._etisTargetIndex = (window._etisTargetIndex + 1) % maxColors;
                    }

                    saveSyncData('etis_accent_config', JSON.stringify(config));
                    applyAccentColor();
                    updateColorGridSelection(grid, config);
                };
                grid.appendChild(circle);
            });

            updateColorGridSelection(grid, config);

            // Переключатели в капсуле "Светлая / Тёмная" с живым предпросмотром темы
            const lightBtn = modal.querySelector('#edit-theme-light-btn');
            const darkBtn = modal.querySelector('#edit-theme-dark-btn');

            if (lightBtn && darkBtn) {
                lightBtn.onclick = (e) => {
                    e.preventDefault();
                    window._activeEditingTheme = 'light';
                    window._etisTargetIndex = 0;
                    lightBtn.classList.add('active');
                    darkBtn.classList.remove('active');
                    
                    // Включаем временный предпросмотр светлой темы
                    document.documentElement.setAttribute('theme', 'light');
                    
                    syncTogglesWithActiveTheme();
                    updateColorGridSelection(grid, config);
                };

                darkBtn.onclick = (e) => {
                    e.preventDefault();
                    window._activeEditingTheme = 'dark';
                    window._etisTargetIndex = 0;
                    darkBtn.classList.add('active');
                    lightBtn.classList.remove('active');
                    
                    // Включаем корректную тему предпросмотра (night или dark)
                    const actualDarkTheme = localStorage.getItem('etis_theme_dark_variant') === 'night' ? 'night' : 'dark';
                    document.documentElement.setAttribute('theme', actualDarkTheme);
                    
                    syncTogglesWithActiveTheme();
                    updateColorGridSelection(grid, config);
                };
            }

            const separateToggle = modal.querySelector('#separate-themes-toggle');
            if (separateToggle) {
                separateToggle.onchange = (e) => {
                    config.separateThemes = e.target.checked;
                    const capsule = modal.querySelector('#theme-subtab-capsule');
                    if (capsule) {
                        capsule.style.setProperty('display', config.separateThemes ? 'flex' : 'none', 'important');
                    }

                    if (config.separateThemes) {
                        // Выбираем ту тему, которая сейчас активна на экране
                        const curTheme = document.documentElement.getAttribute('theme') || 'light';
                        window._activeEditingTheme = (curTheme === 'dark') ? 'dark' : 'light';

                        if (!config.light) config.light = { isGradient: config.isGradient, isThreeColors: config.isThreeColors, colors: [...config.colors] };
                        if (!config.dark) config.dark = { isGradient: config.isGradient, isThreeColors: config.isThreeColors, colors: [...config.colors] };

                        // Включаем тему предпросмотра
                        document.documentElement.setAttribute('theme', window._activeEditingTheme);
                    } else {
                        // При выключении тумблера сбрасываем тему обратно к сохранённой
                        detectTheme();
                    }

                    window._etisTargetIndex = 0;
                    syncTogglesWithActiveTheme();
                    saveSyncData('etis_accent_config', JSON.stringify(config));
                    applyAccentColor();
                    updateColorGridSelection(grid, config);
                };
            }

            // База гармоничных палитр из 2 цветов
            const HARMONIOUS_2_COLOR_PALETTES = [
                // Синие / Голубые / Океан
                ['blue', 'lightblue'], ['darkblue', 'blue'], ['indigo', 'blue'], ['ultramarine', 'sky'],
                ['cobalt', 'aqua'], ['blue', 'electricblue'], ['darkblue', 'ultramarine'], ['midnight', 'blue'],
                
                // Фиолетовые / Розовые / Маджента
                ['purple', 'pink'], ['indigo', 'fuchsia'], ['deepviolet', 'magenta'], ['violet', 'lightpurple'],
                ['plum', 'rose'], ['lavender', 'lilac'], ['purple', 'coral'], ['berry', 'pink'],
                
                // Киберпанк / Неон (Синий + Фиолетовый / Розовый / Бирюзовый)
                ['indigo', 'cyan'], ['purple', 'turquoise'], ['blue', 'pink'], ['deepviolet', 'electricblue'],
                ['fuchsia', 'cyan'], ['ultramarine', 'mint'], ['violet', 'turquoise'],
                
                // Бирюза / Зелень / Мята
                ['ocean', 'teal'], ['cyan', 'mint'], ['teal', 'turquoise'], ['mint', 'emerald'],
                ['darkgreen', 'green'], ['forest', 'mint'], ['pine', 'emerald'], ['green', 'lime'],
                ['teal', 'cyan'], ['ocean', 'mint'],
                
                // Закат / Огонь / Цитрус / Тёплые
                ['red', 'orange'], ['magenta', 'orange'], ['crimson', 'peach'], ['ruby', 'tangerine'],
                ['pink', 'yellow'], ['orange', 'yellow'], ['tangerine', 'gold'], ['deeporange', 'amber'],
                ['coral', 'gold'], ['amber', 'lime'], ['rose', 'peach'], ['ruby', 'coral'],
                
                // Благородные тёмные / Земляные
                ['terracotta', 'caramel'], ['chocolate', 'sand'], ['brown', 'caramel'], ['rust', 'peach'],
                ['bluegrey', 'slate'], ['midnight', 'charcoal'], ['charcoal', 'slate']
            ];

            // База гармоничных палитр из 3 цветов
            const HARMONIOUS_3_COLOR_PALETTES = [
                // Неон и поп
                ['indigo', 'purple', 'pink'],
                ['deepviolet', 'magenta', 'peach'],
                ['purple', 'fuchsia', 'cyan'],
                ['indigo', 'blue', 'electricblue'],
                ['plum', 'violet', 'turquoise'],
                
                // Синие и Океанские
                ['darkblue', 'blue', 'lightblue'],
                ['midnight', 'cobalt', 'sky'],
                ['cobalt', 'ultramarine', 'aqua'],
                ['blue', 'cyan', 'mint'],
                ['darkblue', 'ultramarine', 'aqua'],
                
                // Природа / Бирюза / Изумруд
                ['ocean', 'teal', 'mint'],
                ['pine', 'forest', 'lime'],
                ['teal', 'turquoise', 'emerald'],
                ['ocean', 'cyan', 'turquoise'],
                ['darkgreen', 'green', 'pistachio'],
                
                // Закат и огонь
                ['ruby', 'magenta', 'orange'],
                ['crimson', 'coral', 'yellow'],
                ['purple', 'pink', 'peach'],
                ['tangerine', 'orange', 'gold'],
                ['deeporange', 'coral', 'peach'],
                ['berry', 'ruby', 'rose'],
                ['magenta', 'pink', 'yellow'],
                ['coral', 'amber', 'lime'],
                
                // Кибер-градиенты
                ['deepviolet', 'blue', 'electricblue'],
                ['indigo', 'cyan', 'mint'],
                ['fuchsia', 'purple', 'electricblue'],
                
                // Тёплые и благородные
                ['chocolate', 'terracotta', 'sand'],
                ['rust', 'terracotta', 'caramel'],
                ['midnight', 'bluegrey', 'slate']
            ];

            // Одиночные сочные цвета
            const VIBRANT_SINGLE_COLORS = [
                'blue', 'lightblue', 'ultramarine', 'cobalt', 'cyan', 'teal', 'turquoise', 'mint',
                'green', 'emerald', 'forest', 'lime', 'gold', 'amber', 'orange', 'tangerine',
                'coral', 'deeporange', 'red', 'crimson', 'ruby', 'pink', 'fuchsia', 'magenta',
                'purple', 'deepviolet', 'violet', 'indigo', 'bluegrey'
            ];

            modal.querySelector('#random-color-row').onclick = (e) => {
                e.preventDefault();
                const activeSub = getActiveSubConfig();

                if (!activeSub.isGradient) {
                    let candidates = VIBRANT_SINGLE_COLORS.filter(c => !activeSub.colors.includes(c));
                    if (candidates.length === 0) candidates = VIBRANT_SINGLE_COLORS;
                    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                    activeSub.colors = [chosen];
                } else if (!activeSub.isThreeColors) {
                    let candidates = HARMONIOUS_2_COLOR_PALETTES.filter(p => p[0] !== activeSub.colors[0] || p[1] !== activeSub.colors[1]);
                    if (candidates.length === 0) candidates = HARMONIOUS_2_COLOR_PALETTES;
                    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                    activeSub.colors = [...chosen];
                } else {
                    let candidates = HARMONIOUS_3_COLOR_PALETTES.filter(p => p[0] !== activeSub.colors[0] || p[1] !== activeSub.colors[1]);
                    if (candidates.length === 0) candidates = HARMONIOUS_3_COLOR_PALETTES;
                    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                    activeSub.colors = [...chosen];
                }

                window._etisTargetIndex = 0;
                saveSyncData('etis_accent_config', JSON.stringify(config));
                applyAccentColor();
                updateColorGridSelection(grid, config);
            };

            modal.querySelector('#grad-toggle').onchange = (e) => {
                const activeSub = getActiveSubConfig();
                activeSub.isGradient = e.target.checked;

                const threeWrapper = modal.querySelector('#three-colors-wrapper');
                if (threeWrapper) {
                    threeWrapper.style.setProperty('display', activeSub.isGradient ? 'flex' : 'none', 'important');
                }

                if (!activeSub.isGradient) {
                    if (activeSub.colors.length > 1) activeSub.colors = [activeSub.colors[0]];
                } else {
                    if (activeSub.colors.length < 2) activeSub.colors.push('lightblue');
                    if (activeSub.isThreeColors && activeSub.colors.length < 3) activeSub.colors.push('pink');
                }

                window._etisTargetIndex = 0;
                saveSyncData('etis_accent_config', JSON.stringify(config));
                applyAccentColor();
                updateColorGridSelection(grid, config);
            };

            const threeColorsToggle = modal.querySelector('#three-colors-toggle');
            if (threeColorsToggle) {
                threeColorsToggle.onchange = (e) => {
                    const activeSub = getActiveSubConfig();
                    activeSub.isThreeColors = e.target.checked;

                    if (activeSub.isThreeColors) {
                        if (activeSub.colors.length === 1) activeSub.colors.push('lightblue');
                        if (activeSub.colors.length === 2) activeSub.colors.push('pink');
                    } else {
                        if (activeSub.colors.length > 2) activeSub.colors = activeSub.colors.slice(0, 2);
                    }

                    window._etisTargetIndex = 0;
                    saveSyncData('etis_accent_config', JSON.stringify(config));
                    applyAccentColor();
                    updateColorGridSelection(grid, config);
                };
            }

            const glassToggle = modal.querySelector('#glass-toggle');
            if (glassToggle) {
                glassToggle.onchange = (e) => {
                    config.isGlass = e.target.checked;
                    saveSyncData('etis_accent_config', JSON.stringify(config));
                    applyAccentColor();
                };
            }
        } else if (currentView === 'beta') {
            const masterToggle = modal.querySelector('#setting-master-beta');

            if (masterToggle) {
                masterToggle.onchange = (e) => {
                    const isEnabled = e.target.checked;
                    generalConfig.betaFeaturesEnabled = isEnabled;
                    saveGeneralConfig();

                    const subRows = modal.querySelectorAll('.beta-subfeature-row');
                    subRows.forEach(row => {
                        row.style.opacity = isEnabled ? '1' : '0.4';
                        row.style.pointerEvents = isEnabled ? 'auto' : 'none';
                        const input = row.querySelector('input[type="checkbox"]');
                        if (input) {
                            input.disabled = !isEnabled;
                        }
                    });

                    requiresReloadOnClose = true;
                };
            }

            const aiToggle = modal.querySelector('#setting-beta-ai');
            if (aiToggle) {
                aiToggle.onchange = (e) => {
                    generalConfig.betaFeatures.aiSummary = e.target.checked;
                    saveGeneralConfig();
                    requiresReloadOnClose = true;
                };
            }

        } else if (currentView === 'version') {
            refreshModalUI();
            if (updateState.status === 'idle') initAutoUpdateCheck(true);
        } else if (currentView === 'history') {
            loadVersionHistory();
        }

    };

    renderView(view);
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}
