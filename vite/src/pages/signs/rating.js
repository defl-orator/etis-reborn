import { pageCtx } from '../../app/context.js';

// Оформляет страницу итогового рейтинга студентов и преобразует позиции в цветные капсулы.
export function renderRatingSigns() {
    if (pageCtx.pageMode === 'rating') {
        // Скрываем капсулу выбора периода, если доступен только 1 семестр/триместр
        const submenus = pageCtx.span9.querySelectorAll('.submenu');
        if (submenus.length > 1) {
            const termSubmenu = submenus[submenus.length - 1];
            const termItems = termSubmenu.querySelectorAll('a, b');
            if (termItems.length <= 1) {
                termSubmenu.remove();
            }
        }

        const allTables = pageCtx.span9.querySelectorAll('table.common');
        let ratingTable = null;

        allTables.forEach(t => {
            if (t.textContent.includes('Совокупность студентов')) ratingTable = t;
        });

        if (ratingTable) {
            if (!ratingTable.parentNode.classList.contains('wide-table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper';
                ratingTable.parentNode.insertBefore(wrapper, ratingTable);
                wrapper.appendChild(ratingTable);
            }

            // Принудительно растягиваем таблицу и убираем артефакты display: block
            ratingTable.style.setProperty('display', 'table', 'important');
            ratingTable.style.setProperty('width', '100%', 'important');
            ratingTable.style.setProperty('min-width', '100%', 'important');

            const dataRows = Array.from(ratingTable.querySelectorAll('tbody tr:not(:has(th)), tr:has(td)'));

            if (dataRows.length === 0) {
                const tbody = ratingTable.querySelector('tbody') || ratingTable;
                const emptyTr = document.createElement('tr');
                emptyTr.innerHTML = `
                                        <td colspan="2" style="text-align: center !important; padding: 3.6rem 2rem !important; color: var(--color-text-secondary) !important; font-weight: 600 !important; font-size: 1.35rem !important; background: transparent !important; border: none !important;">
                                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                                                <span class="material-icons" style="font-size: 2.8rem; color: var(--color-text-secondary); opacity: 0.4;">hourglass_empty</span>
                                                <span>Данных пока нет</span>
                                            </div>
                                        </td>
                                    `;
                tbody.appendChild(emptyTr);
            } else {
                ratingTable.querySelectorAll('tr').forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const ratingCell = cells[cells.length - 1];
                        const text = ratingCell.textContent.trim();
                        const match = text.match(/(\d+)\s+из\s+(\d+)/);

                        if (match && parseInt(match[1], 10) > 0 && parseInt(match[2], 10) > 0) {
                            const current = parseInt(match[1], 10);
                            const total = parseInt(match[2], 10);

                            let bg = 'rgba(142, 142, 147, 0.15)';
                            let color = 'var(--color-text-secondary)';

                            const p = total > 1 ? ((total - current) / (total - 1)) * 100 : 100;

                            if (p < 30) { bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)'; }
                            else if (p < 60) { bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)'; }
                            else if (p < 85) { bg = 'rgba(139, 195, 74, 0.15)'; color = '#8BC34A'; }
                            else { bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)'; }

                            ratingCell.innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.5rem 1.2rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; pointer-events: none;">${text}</span>`;
                        } else {
                            ratingCell.innerHTML = `<span style="background: rgba(142, 142, 147, 0.15); color: var(--color-text-secondary); padding: 0.5rem 1.2rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; pointer-events: none;">Неизвестно</span>`;
                        }
                        ratingCell.style.textAlign = 'right';
                        ratingCell.style.cursor = 'help';
                    }
                });
            }

            const footerP = pageCtx.span9.querySelector('p');
            if (footerP && footerP.textContent.includes('Показанные здесь оценки')) {
                const infoBox = document.createElement('div');
                infoBox.className = 'etis-official-notice';
                infoBox.style.cssText = `
                                        background: var(--color-card);
                                        border-radius: var(--radius-large) !important;
                                        box-shadow: var(--shadow-main);
                                        padding: 2.4rem !important;
                                        margin-top: 3rem;
                                        text-align: left !important;
                                        color: var(--color-text-primary);
                                        border: 1px solid var(--color-table-border);
                                    `;

                let rawHTML = footerP.innerHTML.replace(/&nbsp;/g, '').trim();
                let cleanHTML = rawHTML.split(/<br\s*\/?>/i)
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => `<p style="margin-bottom: 12px; line-height: 1.6; opacity: 0.9; font-size: 1.35rem;">${line}</p>`)
                    .join('');

                infoBox.innerHTML = `
                                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                            <span class="material-icons" style="color:var(--color-accent); font-size: 24px;">info</span>
                                            Порядок уточнения оценок
                                        </div>
                                        <div style="text-align: left !important;">
                                            ${cleanHTML}
                                        </div>
                                    `;

                footerP.replaceWith(infoBox);
            }
        }
    }
}
