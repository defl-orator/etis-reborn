import { getCalculatedTheme } from './theme-engine';

// ID временного элемента стиля для предотвращения мигания неоформленной страницы (FOUC)
const FOUC_GUARD_ID = 'etis-fouc-guard';

// Устанавливает тему и скрывает body до завершения стилизации страницы
export function foucBoot1(): void {
    const effectiveTheme = getCalculatedTheme();
    document.documentElement.setAttribute('theme', effectiveTheme);

    if (!document.getElementById(FOUC_GUARD_ID)) {
        const guard = document.createElement('style');
        guard.id = FOUC_GUARD_ID;
        guard.textContent = `
            html[theme="light"] { background-color: #F2F2F6 !important; }
            html[theme="dark"] { background-color: #16181A !important; }
            html[theme="night"] { background-color: #000000 !important; }
            html:not(.etis-ready) body { opacity: 0 !important; pointer-events: none !important; }
        `;
        document.documentElement.appendChild(guard);
    }
}

// Показывает страницу и удаляет временный FOUC-экран
export function revealPage(): void {
    const mainStyle = document.getElementById('etis-reborn-styles');
    if (mainStyle && document.head && mainStyle.parentNode !== document.head) {
        document.head.appendChild(mainStyle);
    } else if (mainStyle && document.head && document.head.lastElementChild !== mainStyle) {
        document.head.appendChild(mainStyle);
    }

    document.documentElement.classList.add('etis-ready');
    const guard = document.getElementById(FOUC_GUARD_ID);
    if (guard) guard.remove();
}

// Запускает страховочный таймер показа страницы на случай задержки DOMContentLoaded
export function foucBoot2(): void {
    window.setTimeout(revealPage, 1500);
}
