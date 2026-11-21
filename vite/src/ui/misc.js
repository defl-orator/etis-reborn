import { safeAppend } from '../styles/inject.js';

// Создаёт SVG-треугольник для всплывающей подсказки оценки
function createTooltipTriangle() {
    const xmlns = 'http://www.w3.org/2000/svg'

    const svg = document.createElementNS(xmlns, 'svg');
    svg.setAttributeNS(null, 'width', '15')
    svg.setAttributeNS(null, 'height', '9')
    svg.setAttributeNS(null, 'viewBox', '0 0 15 9')
    svg.setAttributeNS(null, 'fill', 'none')
    svg.classList.add('sign-tooltip-triangle')

    const path = document.createElementNS(xmlns, 'path')
    path.classList.add('tooltipTriangle')
    path.setAttributeNS(null, 'd', 'M6.79289 7.79289L0.707107 1.70711C0.0771419 1.07714 0.523308 0 1.41421 0H13.5858C14.4767 0 14.9229 1.07714 14.2929 1.70711L8.20711 7.79289C7.81658 8.18342 7.18342 8.18342 6.79289 7.79289Z')

    svg.appendChild(path)
    return svg
}

// Добавляет или обновляет мета-тег viewport для адаптивной вёрстки
export function addViewport() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        safeAppend(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
}
