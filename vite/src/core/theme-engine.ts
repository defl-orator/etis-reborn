import { applyAccentColor } from './accent';
import { safeAppend } from '../styles/inject.js';
import { ActiveTheme, DarkVariant, ThemeMode } from '../types/index.js';

// Таймер расписания тем и слушатель системной цветовой схемы
let scheduleTimer: number | null = null;
let mediaQueryList: MediaQueryList | null = null;

// Вычисляет активную тему с учётом режима (система, расписание, ручной выбор) и варианта OLED
export function getCalculatedTheme(): ActiveTheme {
    let mode = (localStorage.getItem('etis_theme_mode') || '') as ThemeMode;
    if (!mode) {
        const oldTheme = localStorage.getItem('theme') || 'auto';
        mode = (oldTheme === 'auto') ? 'system' : 'none';
        localStorage.setItem('etis_theme_mode', mode);
    }

    // Вариант темной темы: 'dark' или 'night' (OLED)
    const darkVariant = (localStorage.getItem('etis_theme_dark_variant') || 'dark') as DarkVariant;

    if (mode === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? darkVariant : 'light';
    } else if (mode === 'schedule') {
        const start = localStorage.getItem('etis_theme_schedule_start') || '21:00';
        const end = localStorage.getItem('etis_theme_schedule_end') || '07:00';
        const now = new Date();
        const curMins = now.getHours() * 60 + now.getMinutes();

        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;

        let isDarkTime = false;
        if (startMins > endMins) {
            isDarkTime = (curMins >= startMins || curMins < endMins);
        } else {
            isDarkTime = (curMins >= startMins && curMins < endMins);
        }
        return isDarkTime ? darkVariant : 'light';
    } else {
        const currentSaved = localStorage.getItem('theme') || 'light';
        return (currentSaved === 'light') ? 'light' : darkVariant;
    }
}

// Обновляет цвет системной панели браузера (meta theme-color) под текущую тему
export function updateBrowserNavColor(): void {
    const theme = document.documentElement.getAttribute('theme');
    const color = (theme === 'night') ? '#000000' : (theme === 'dark' ? '#16181A' : '#F2F2F6');
    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        safeAppend(metaTheme);
    }
    metaTheme.content = color;
}

// Моментальное переключение: временное подавление CSS transitions исключает лаги и рывки анимаций
export function applyCurrentTheme(force = false): void {
    const calculatedTheme = getCalculatedTheme();
    const currentTheme = document.documentElement.getAttribute('theme');

    if (force || currentTheme !== calculatedTheme) {
        // Блокируем плавные CSS-переходы на 1 кадр, чтобы интерфейс переключился моментально
        const disableTransitions = document.createElement('style');
        disableTransitions.textContent = '*, *::before, *::after { transition: none !important; }';
        (document.head || document.documentElement).appendChild(disableTransitions);

        document.documentElement.setAttribute('theme', calculatedTheme);
        localStorage.setItem('theme', calculatedTheme);

        if (typeof applyAccentColor === 'function') {
            applyAccentColor();
        }
        updateBrowserNavColor();

        // Снимаем блокировку после полной отрисовки нового кадра
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                disableTransitions.remove();
            });
        });
    }

    planNextScheduleCheck();
}

// Расчет точного момента наступления границы переключения по расписанию
function planNextScheduleCheck(): void {
    if (scheduleTimer !== null) {
        window.clearTimeout(scheduleTimer);
        scheduleTimer = null;
    }

    const mode = (localStorage.getItem('etis_theme_mode') || 'system') as ThemeMode;
    if (mode !== 'schedule') return;

    const start = localStorage.getItem('etis_theme_schedule_start') || '21:00';
    const end = localStorage.getItem('etis_theme_schedule_end') || '07:00';
    const now = new Date();
    const curMins = now.getHours() * 60 + now.getMinutes();

    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    let nextTargetMins: number;
    const tMin = Math.min(startMins, endMins);
    const tMax = Math.max(startMins, endMins);

    if (curMins < tMin) {
        nextTargetMins = tMin;
    } else if (curMins < tMax) {
        nextTargetMins = tMax;
    } else {
        nextTargetMins = tMin + 24 * 60;
    }

    const diffMins = nextTargetMins - curMins;
    const msUntilTarget = Math.max(500, (diffMins * 60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50);

    // Запускаем переключение ровно в нулевую секунду наступления рубежа
    scheduleTimer = window.setTimeout(() => {
        applyCurrentTheme(true);
    }, msUntilTarget);
}

// Обратная совместимость для модулей, которые вызывали detectTheme()
export function detectTheme(): void {
    applyCurrentTheme();
}

// Инициализирует движок тем и подписки на системные и оконные события
export function themeEngineBoot(): void {
    // 1. Моментальная реакция на системное переключение темы (Dark Mode в OS/браузере)
    if (window.matchMedia) {
        mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        const onSystemThemeChange = () => {
            const mode = localStorage.getItem('etis_theme_mode') || 'system';
            if (mode === 'system') {
                applyCurrentTheme(true);
            }
        };

        if (typeof mediaQueryList.addEventListener === 'function') {
            mediaQueryList.addEventListener('change', onSystemThemeChange);
        } else if (typeof (mediaQueryList as any).addListener === 'function') {
            (mediaQueryList as any).addListener(onSystemThemeChange);
        }
    }

    // 2. Моментальная проверка при пробуждении устройства, выходе из спящего режима или смене вкладки
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            applyCurrentTheme();
        }
    });
    window.addEventListener('focus', () => {
        applyCurrentTheme();
    });

    // 3. Отслеживание изменения атрибута theme (обновление цвета шапки и статус-бара)
    new MutationObserver(() => {
        updateBrowserNavColor();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['theme'] });

    applyCurrentTheme();
}