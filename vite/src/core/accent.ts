import { ACCENT_COLORS } from './accent-colors';
import { AccentConfig } from '../types';

// Итоговые вычисленные параметры акцентного оформления
export interface EffectiveAccent {
    isGradient: boolean;
    isThreeColors: boolean;
    colors: string[];
    isGlass: boolean;
    isColoredGlass?: boolean;
}

// Преобразует HEX-цвет в RGB-компоненты
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    let c = hex.replace('#', '');
    if (c.length === 3) {
        c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

// Преобразует HEX-цвет в строку RGBA с заданной прозрачностью
function hexToRgba(hex: string, alpha: number): string {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Возвращает HEX-код цвета по ключу из палитры или готовому HEX-значению
function resolveHex(colorOrKey: string): string {
    if (!colorOrKey) return '#007AFF';
    const key = colorOrKey.toLowerCase();
    if (ACCENT_COLORS[key]) return ACCENT_COLORS[key];
    if (colorOrKey.startsWith('#')) return colorOrKey;
    return '#007AFF';
}

// Возвращает итоговые настройки акцента с учётом текущей темы
export function getEffectiveAccent(config?: AccentConfig): EffectiveAccent {
    let raw: AccentConfig;
    try {
        raw = config || JSON.parse(localStorage.getItem('etis_accent_config') || '{}');
    } catch (e) {
        raw = { colors: ['blue', 'lightblue'], isGlass: true };
    }

    const defaultColors = ['blue', 'lightblue'];
    const colors = Array.isArray(raw.colors) && raw.colors.length > 0 ? raw.colors : defaultColors;

    let isGradient = raw.isGradient !== false;
    let isThreeColors = raw.isThreeColors === true;
    let effColors = [...colors];

    if (raw.separateThemes) {
        const theme = document.documentElement.getAttribute('theme') || localStorage.getItem('theme') || 'light';
        const isDark = theme === 'dark' || theme === 'night';
        const sub = isDark ? raw.dark : raw.light;
        if (sub) {
            isGradient = sub.isGradient !== false;
            isThreeColors = sub.isThreeColors === true;
            if (Array.isArray(sub.colors) && sub.colors.length > 0) {
                effColors = [...sub.colors];
            }
        }
    }

    const max = !isGradient ? 1 : (isThreeColors ? 3 : 2);
    effColors = effColors.slice(0, max);
    if (effColors.length === 0) effColors = ['blue'];

    return {
        isGradient,
        isThreeColors,
        colors: effColors,
        isGlass: raw.isGlass !== false, // По умолчанию стекло включено
        isColoredGlass: raw.isColoredGlass !== false
    };
}

// Формирует строковую сигнатуру текущего акцента для отслеживания изменений
export function accentSignature(config?: AccentConfig): string {
    const eff = getEffectiveAccent(config);
    return `${eff.isGradient ? 1 : 0}_${eff.isThreeColors ? 1 : 0}_${eff.colors.join('-')}_${eff.isGlass ? 1 : 0}`;
}

// Применяет акцентные цвета, градиент и эффект стекла к странице
export function applyAccentColor(): void {
    const eff = getEffectiveAccent();
    const hex1 = resolveHex(eff.colors[0]);
    const hex2 = eff.colors[1] ? resolveHex(eff.colors[1]) : hex1;
    const hex3 = eff.colors[2] ? resolveHex(eff.colors[2]) : hex2;

    const theme = document.documentElement.getAttribute('theme') || 'light';
    const isDark = theme === 'dark' || theme === 'night';

    // Для эффекта стекла цвета ДОЛЖНЫ быть полупрозрачными (alpha 0.65 - 0.75)
    const glassAlpha = isDark ? 0.68 : 0.78;
    const c1 = eff.isGlass ? hexToRgba(hex1, glassAlpha) : hex1;
    const c2 = eff.isGlass ? hexToRgba(hex2, glassAlpha) : hex2;
    const c3 = eff.isGlass ? hexToRgba(hex3, glassAlpha) : hex3;

    let bgAccent = c1;
    if (eff.isGradient && eff.colors.length > 1) {
        if (eff.isThreeColors && eff.colors.length >= 3) {
            bgAccent = `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
        } else {
            bgAccent = `linear-gradient(135deg, ${c1}, ${c2})`;
        }
    }

    const activeRgba = hexToRgba(hex1, 0.15);

    const root = document.documentElement;
    root.style.setProperty('--color-accent', hex1);
    root.style.setProperty('--color-text-link', hex1);
    root.style.setProperty('--color-text-accent', hex1);
    root.style.setProperty('--color-accent-active', activeRgba);
    root.style.setProperty('--bg-accent', bgAccent);

    let styleEl = document.getElementById('etis-dynamic-accent') as HTMLStyleElement | null;
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'etis-dynamic-accent';
        (document.head || document.documentElement).appendChild(styleEl);
    }

    const glassBackdropCSS = eff.isGlass ? `
        backdrop-filter: blur(16px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.22) !important;
    ` : `
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12) !important;
    `;

    styleEl.textContent = `
        /* Активные вкладки, недели, подменю и кнопки — фон, стекло и ЖИРНЫЙ текст */
        .weeks .week.current,
        .weeks .week.current > a,
        .submenu b,
        .term-semesters-capsule b,
        .plan-submenu-track b,
        .span3 > .nav.nav-tabs.nav-stacked > li.active > a,
        .span3 .sidebar-nav-group > li.active > a,
        .span3 .sidebar-folder.is-open .sidebar-folder-content li.active > a,
        .sidebar-folder.is-open .sidebar-folder-content li.active > a,
        .span3 .sidebar-folder-header.active-header,
        .sidebar-folder-header.active-header,
        .span3 .sidebar-folder:not(.is-open) .sidebar-folder-header.active-header,
        .sidebar-folder:not(.is-open) .sidebar-folder-header.active-header,
        .sidebar-collapsible-sections .sidebar-folder-header.active-header,
        .analytics-modal .settings-sidebar-btn.active,
        #etis-settings-modal .settings-sidebar-btn.active,
        .settings-sidebar-btn.active,
        .mobile-dock-item.active,
        button.mobile-dock-item.active,
        button.sync-tab.active,
        .sync-tab.active,
        #sbmt,
        .button_gray button,
        .answer-btn-custom:not(.clear-note-btn):not(.clear-cp-note-btn):not([style*="background: var(--color-red)"]):not([style*="background:rgba"]):not([style*="background: rgba"]):not(#export-share-btn):not(.reset-edit-btn):not(#t-edit-cancel-btn):not(#cancel-task-edit-btn),
        #add-diary-task-btn,
        .mobile-menu-btn {
            background: ${bgAccent} !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            font-weight: 800 !important;
            ${glassBackdropCSS}
        }

        /* Принудительная жирность для вложенных текстов во вкладках */
        .submenu b,
        .term-semesters-capsule b,
        .plan-submenu-track b,
        .weeks .week.current *,
        .span3 li.active > a *,
        .sidebar-folder-header.active-header *,
        .sync-tab.active * {
            font-weight: 800 !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
        }

        /* Иконки внутри активных элементов */
        .weeks .week.current .material-icons,
        .span3 li.active > a .material-icons,
        .sidebar-folder-header.active-header .material-icons,
        .settings-sidebar-btn.active .material-icons,
        .mobile-dock-item.active .material-icons,
        .answer-btn-custom .material-icons,
        .sync-tab.active .material-icons,
        .weeks .week.current .ph,
        .span3 li.active > a .ph,
        .sidebar-folder-header.active-header .ph,
        .settings-sidebar-btn.active .ph,
        .mobile-dock-item.active .ph,
        .answer-btn-custom .ph,
        .sync-tab.active .ph {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
        }

        /* Текст с градиентом */
        .accent-stat,
        .logo-say-hey,
        .teacher-name-link {
            background: linear-gradient(135deg, ${hex1}, ${hex2}) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            font-weight: 800 !important;
        }
    `;

    const previewBox = document.getElementById('accent-preview-box');
    if (previewBox) {
        previewBox.querySelectorAll('.etis-preview-active-element').forEach((el: any) => {
            el.style.background = bgAccent;
            el.style.color = '#ffffff';
            if (eff.isGlass) {
                el.style.backdropFilter = 'blur(16px) saturate(180%)';
            }
        });
    }
}

// Инициализирует акцентное оформление при старте
export function accentBoot(): void {
    applyAccentColor();
}