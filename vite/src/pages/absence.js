import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';

// Оформляет страницу пропусков занятий и сводную статистику
export function renderAbsencePage() {
    while (pageCtx.span9.firstChild && (pageCtx.span9.firstChild.tagName === 'BR' || (pageCtx.span9.firstChild.nodeType === Node.TEXT_NODE && !pageCtx.span9.firstChild.textContent.trim()))) {
        pageCtx.span9.firstChild.remove();
    }

    const table = pageCtx.span9.querySelector('table.slimtab_nice');
    // Таблица пуста, если в ней нет ячеек с данными (td), а есть только заголовки (th)
    const hasData = table && table.querySelectorAll('td').length > 0;

    if (hasData) {
        table.className = 'common absence-table';

        const wrapper = document.createElement('div');
        wrapper.className = 'wide-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        const firstTh = table.querySelector('th');
        if (firstTh && firstTh.textContent.trim() === '') {
            firstTh.textContent = '№';
        }

        table.querySelectorAll('tr').forEach(tr => {
            const td = tr.querySelectorAll('td')[1];
            if (td) {
                const fonts = td.querySelectorAll('font');
                if (fonts.length > 0) {
                    const dateContainer = document.createElement('div');
                    dateContainer.style.display = 'flex';
                    dateContainer.style.flexWrap = 'wrap';
                    dateContainer.style.gap = '6px';
                    dateContainer.style.justifyContent = 'center';

                    fonts.forEach(font => {
                        const color = font.getAttribute('color');
                        const title = font.getAttribute('title');
                        const text = font.textContent.trim();

                        const capsule = document.createElement('span');
                        capsule.className = 'absence-capsule ' + (color === 'green' ? 'valid' : 'invalid');
                        capsule.textContent = text;
                        if (title) capsule.title = title;

                        dateContainer.appendChild(capsule);
                    });

                    td.innerHTML = '';
                    td.appendChild(dateContainer);
                }
            }
        });

        let total = '0', valid = '0', invalid = '0';
        let foundStats = false;

        Array.from(pageCtx.span9.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text.includes('Всего пропущено занятий:')) {
                    total = text.replace(/\D/g, '');
                    foundStats = true;
                    node.textContent = '';
                }
                if (text.includes('Из них по уважительной причине:')) {
                    valid = text.replace(/\D/g, '');
                    node.textContent = '';
                }
            } else if (node.tagName === 'B' && node.textContent.includes('По неуважительной причине:')) {
                invalid = node.textContent.replace(/\D/g, '');
                node.remove();
            }
        });

        if (foundStats) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'absence-summary';
            summaryDiv.innerHTML = `
                                    <div class="absence-stat">
                                        <span class="absence-stat-val">${total}</span>
                                        <span class="absence-stat-label">Всего пропущено</span>
                                    </div>
                                    <div class="absence-stat valid">
                                        <span class="absence-stat-val">${valid}</span>
                                        <span class="absence-stat-label">Уважительные</span>
                                    </div>
                                    <div class="absence-stat invalid">
                                        <span class="absence-stat-val">${invalid}</span>
                                        <span class="absence-stat-label">Неуважительные</span>
                                    </div>
                                `;
            pageCtx.span9.appendChild(summaryDiv);
        }
    } else {
        if (table) table.remove();

        Array.from(pageCtx.span9.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text.includes('Всего пропущено занятий:') || text.includes('Из них по уважительной причине:')) {
                    node.textContent = '';
                }
            } else if (node.tagName === 'B' && node.textContent.includes('По неуважительной причине:')) {
                node.remove();
            }
            if (node.tagName === 'BR') {
                node.remove();
            }
        });
    }

    updateEmptyState(pageCtx.span9, hasData, '', 'absence');
    return;
}
