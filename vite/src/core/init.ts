import { addViewport } from '../ui/misc.js';
import { stylePages } from '../app/stylePages.js';
import { checkDiaryReminders } from '../features/diary-reminders.js';
import { revealPage } from './fouc';

// Инициализирует основную стилизацию страницы и периодическую проверку напоминаний дневника
export function initBoot(): void {
    addViewport();

    const run = () => {
        try {
            stylePages();
        } finally {
            revealPage();
        }
        checkDiaryReminders();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    setInterval(checkDiaryReminders, 60000);
}