import { openNotificationsModal } from './notifications.js';
import { openConsultationsModal } from '../modals/consultations.js';
import { openDiaryModal } from '../modals/diary.js';
import { openGlobalSearchModal } from '../modals/global-search.js';
import { openProfileModal } from '../modals/profile.js';
import { openSettingsModal } from '../modals/settings.js';

export function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 1. Закрытие окон и снятие блюра по нажатию Escape
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll(
                '.analytics-modal.active, #etis-settings-modal.active, .ui-dialog:not([style*="display: none"])'
            );
            const activeOverlays = document.querySelectorAll(
                '.analytics-overlay.active, #etis-settings-overlay.active, .mobile-overlay.active, .ui-widget-overlay'
            );

            if (activeModals.length > 0 || activeOverlays.length > 0 || document.body.classList.contains('modal-open-body')) {
                e.preventDefault();
                activeModals.forEach(m => m.classList.remove('active'));
                activeOverlays.forEach(o => o.classList.remove('active'));
                document.body.classList.remove('modal-open-body');
                document.documentElement.classList.remove('modal-open-body');
                document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');

                if (window.$ && $.ui && $.ui.dialog) {
                    $('.ui-dialog-content').dialog('close');
                }
            }
            return;
        }

        // 2. Глобальный поиск: Ctrl + K (Windows) или Cmd + K (macOS)
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            e.preventDefault();
            if (typeof openGlobalSearchModal === 'function') openGlobalSearchModal();
            return;
        }

        // Блокируем горячие клавиши, если фокус находится в поле ввода или текста
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || document.activeElement?.isContentEditable) {
            return;
        }

        // 3. Вызов через Alt + Shift + Буква (исключает конфликт с адресной строкой и системными меню)
        if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey) {
            switch (e.code) {
                case 'KeyD': // Alt + Shift + D -> Дневник
                    e.preventDefault();
                    if (typeof openDiaryModal === 'function') openDiaryModal();
                    break;
                case 'KeyS': // Alt + Shift + S -> Настройки
                    e.preventDefault();
                    if (typeof openSettingsModal === 'function') openSettingsModal('general');
                    break;
                case 'KeyP': // Alt + Shift + P -> Профиль
                    e.preventDefault();
                    if (typeof openProfileModal === 'function') openProfileModal(window.innerWidth <= 960 ? 'menu' : 'main');
                    break;
                // case 'KeyR': // Alt + Shift + R -> Маршрутизатор
                    // e.preventDefault();
                    // if (typeof openRouterModal === 'function') openRouterModal();
                    // break;
                case 'KeyC': // Alt + Shift + C -> Консультации
                    e.preventDefault();
                    if (typeof openConsultationsModal === 'function') openConsultationsModal();
                    break;
                case 'KeyN': // Alt + Shift + N -> Уведомления
                    e.preventDefault();
                    if (typeof openNotificationsModal === 'function') openNotificationsModal();
                    break;
                case 'KeyT': // Alt + Shift + T -> Расписание
                    e.preventDefault();
                    window.location.href = 'stu.timetable';
                    break;
            }
            return;
        }

        // 4. Альтернативный быстрый доступ одной рукой: Alt + Цифра (1-8)
        if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            switch (e.code) {
                case 'Digit1': // Alt + 1 -> Расписание
                    e.preventDefault();
                    window.location.href = 'stu.timetable';
                    break;
                case 'Digit2': // Alt + 2 -> Оценки
                    e.preventDefault();
                    window.location.href = 'stu.signs';
                    break;
                case 'Digit3': // Alt + 3 -> Дневник
                    e.preventDefault();
                    if (typeof openDiaryModal === 'function') openDiaryModal();
                    break;
                case 'Digit4': // Alt + 4 -> Консультации
                    e.preventDefault();
                    if (typeof openConsultationsModal === 'function') openConsultationsModal();
                    break;
                // case 'Digit5': // Alt + 5 -> Маршрутизатор
                    // e.preventDefault();
                    // if (typeof openRouterModal === 'function') openRouterModal();
                    // break;
                case 'Digit6': // Alt + 6 -> Профиль
                    e.preventDefault();
                    if (typeof openProfileModal === 'function') openProfileModal(window.innerWidth <= 960 ? 'menu' : 'main');
                    break;
                case 'Digit7': // Alt + 7 -> Уведомления
                    e.preventDefault();
                    if (typeof openNotificationsModal === 'function') openNotificationsModal();
                    break;
                case 'Digit8': // Alt + 8 -> Настройки
                    e.preventDefault();
                    if (typeof openSettingsModal === 'function') openSettingsModal('general');
                    break;
            }
        }
    });
}
