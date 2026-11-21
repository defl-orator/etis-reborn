import { styles } from './index.js';

// Безопасное внедрение элементов
export const safeAppend = (element) => {
    if (document.head) {
        document.head.appendChild(element);
    } else {
        document.documentElement.appendChild(element);
    }
};

// Неблокирующее подключение шрифтов и иконок
const fontLink = document.createElement('link');

// Внедрение таблицы стилей скрипта в документ
const injectStyles = (css) => {
    const style = document.createElement('style');
    style.id = 'etis-reborn-styles';
    style.innerHTML = css;
    safeAppend(style);
};

// Подключение иконочных шрифтов Phosphor и основных стилей при загрузке
export function injectBoot() {
    const PH = 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src';
    ['regular', 'fill'].forEach(w => {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = `${PH}/${w}/style.css`;
        safeAppend(l);
    });

    injectStyles(styles);
}
