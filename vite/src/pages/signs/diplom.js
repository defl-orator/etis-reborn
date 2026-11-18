import { pageCtx } from '../../app/context.js';
import { saveSyncData } from '../../sync/data.js';
import { escapeHTML } from '../../utils/security.ts';

export function renderDiplomSigns() {
    const activeSubmenu = pageCtx.span9.querySelector('.submenu b');
    const isDiplom = pageCtx.pageMode === 'diplom';

    if (isDiplom) {
        const table = pageCtx.span9.querySelector('table.common');
        if (table) {
            const oldAvg = Array.from(pageCtx.span9.querySelectorAll('div')).find(d => d.textContent.includes('Средний балл') && !d.classList.contains('subject-score-capsule'));
            if (oldAvg) oldAvg.style.display = 'none';

            const wrapper = document.createElement('div');
            wrapper.className = 'wide-table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);

            let sum = 0, count = 0, hasFail = false;
            const rows = table.querySelectorAll('tr');
            const dataRows = Array.from(table.querySelectorAll('tbody tr:not(:has(th)), tr:has(td)'));

            // Если в таблице диплома нет строк с предметами
            if (dataRows.length === 0) {
                const tbody = table.querySelector('tbody') || table;
                
                // Динамически определяем количество колонок в шапке (2 или 3)
                const colCount = table.querySelectorAll('th').length || 3;
                
                const emptyTr = document.createElement('tr');
                emptyTr.innerHTML = `
                                        <td colspan="${colCount}" style="text-align: center !important; padding: 4.5rem 2rem !important; color: var(--color-text-secondary) !important; font-weight: 600 !important; font-size: 1.35rem !important; background: transparent !important; border: none !important;">
                                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 100%;">
                                                <span class="material-icons" style="font-size: 3.2rem; color: var(--color-text-secondary); opacity: 0.45; line-height: 1;">hourglass_empty</span>
                                                <span style="color: var(--color-text-secondary);">Данных пока нет</span>
                                            </div>
                                        </td>
                                    `;
                tbody.appendChild(emptyTr);
            } else {
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const gradeCell = cells[1];
                        const text = gradeCell.textContent.toLowerCase().trim();

                        if (text.includes('отлично')) { sum += 5; count++; }
                        else if (text.includes('хорошо')) { sum += 4; count++; }
                        else if (text.includes('удовлетворительно') || text.includes('удовл.')) { sum += 3; count++; }
                        else if (text.includes('неудовлетворительно') || text.includes('незачет') || text.includes('незачёт')) { hasFail = true; }

                        if (text && !text.includes('нет итоговой оценки') && text !== '-' && text !== '—') {
                            let bg = 'rgba(142, 142, 147, 0.15)', color = 'var(--color-text-secondary)';
                            if (text.includes('отлично') || (text.includes('зачет') && !text.includes('незачет'))) {
                                bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)';
                            } else if (text.includes('хорошо')) {
                                bg = 'rgba(0, 122, 255, 0.15)'; color = 'var(--color-blue)';
                            } else if (text.includes('удовлетворительно') || text.includes('удовл.')) {
                                bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)';
                            } else if (text.includes('неуд') || text.includes('незач') || text === '2') {
                                bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)';
                            }

                            gradeCell.innerHTML = `<span class="kt-score-capsule" style="background:${bg}; color:${color}; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; display: inline-block; min-width: 24px; text-align: center; white-space: nowrap;">${escapeHTML(gradeCell.textContent.trim())}</span>`;
                        } else {
                            gradeCell.innerHTML = `<span class="kt-score-capsule" style="background: rgba(142, 142, 147, 0.15); color: var(--color-text-secondary); padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; display: inline-block; min-width: 24px; text-align: center; white-space: nowrap;">Неизвестно</span>`;
                        }
                    }
                });
            }

            const headerContainer = document.createElement('div');
            headerContainer.className = 'subject-header-flex';
            const title = document.createElement('h3');
            title.textContent = 'Выписка оценок к диплому';
            headerContainer.appendChild(title);

            const capsule = document.createElement('div');
            capsule.className = 'subject-score-capsule';
            if (hasFail) {
                capsule.textContent = 'ЕСТЬ ДОЛГИ';
                capsule.style.background = 'var(--color-red)';
                capsule.style.color = '#fff';
                saveSyncData('etis_diploma_gpa', 'debts');
                localStorage.setItem('etis_diploma_gpa_timestamp', Date.now().toString());
            } else if (count > 0) {
                const avg = Math.round((sum / count) * 100) / 100;
                saveSyncData('etis_diploma_gpa', avg.toString());
                localStorage.setItem('etis_diploma_gpa_timestamp', Date.now().toString());
                capsule.textContent = `${avg} / 5`;
                const p = (avg / 5) * 100;
                if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                else if (p < 81) { capsule.style.background = '#8BC34A'; capsule.style.color = '#fff'; }
                else { capsule.style.background = 'var(--color-green)'; capsule.style.color = '#fff'; }
                if (avg >= 4.75) capsule.style.boxShadow = '0 0 0 2px #FFD700';
            } else {
                capsule.textContent = 'Нет оценок';
                capsule.style.background = 'var(--color-highlight)';
                capsule.style.color = 'var(--color-text-secondary)';
                saveSyncData('etis_diploma_gpa', 'none');
                localStorage.setItem('etis_diploma_gpa_timestamp', Date.now().toString());
            }
            headerContainer.appendChild(capsule);
            pageCtx.span9.insertBefore(headerContainer, wrapper);

            const footerP = pageCtx.span9.querySelector('p');
            if (footerP && footerP.textContent.includes('Итоговая оценка по дисциплине')) {
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
                    .map(line => {
                        line = line.replace(/<sup>\*<\/sup>/i, '');
                        return `<p style="margin-bottom: 12px; line-height: 1.6; opacity: 0.9; font-size: 1.35rem;">${line}</p>`;
                    }).join('');

                infoBox.innerHTML = `
                                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                            <span class="material-icons" style="color:var(--color-accent); font-size: 24px;">info</span>
                                            Правила расчета
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
