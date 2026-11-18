import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';
import { formatEtisDate } from '../utils/etis-dates.js';

export function renderFeedbackListPage() {
    const feedbackMsgs = pageCtx.span9.querySelectorAll('ul.nav.msg');
    const ratingTable = document.getElementById('rating');
    const submenu = pageCtx.span9.querySelector('.submenu');

    // Определяем активную вкладку по тегу <b> (активный элемент меню)
    const activeSubmenuItem = submenu ? submenu.querySelector('b') : null;
    const activeTabName = activeSubmenuItem ? activeSubmenuItem.textContent.toLowerCase() : '';

    // Разделяем вкладки взаимно исключающим образом
    const isCommentsTab = activeTabName.includes('комментари') || (!ratingTable && !pageCtx.span9.querySelector('form') && !activeTabName);
    const isRatingTab = activeTabName.includes('рейтинг') || (!!ratingTable && !activeTabName);

    // Логика вкладки "Мои комментарии"
    if (isCommentsTab) {
        if (feedbackMsgs.length > 0) {
            const container = document.createElement('div');
            container.className = 'msg-container';

            feedbackMsgs.forEach(msg => {
                const li = msg.querySelector('li');
                if (!li) return;

                const clone = li.cloneNode(true);

                if (li.hasAttribute('onclick')) {
                    const clickFunc = li.getAttribute('onclick');
                    if (clickFunc.includes('read')) {
                        try {
                            const mm = clickFunc.match(/^\s*(read[A-Za-z0-9_]*)\(\s*((?:'[^']*'|"[^"]*"|-?\d+)(?:\s*,\s*(?:'[^']*'|"[^"]*"|-?\d+))*)?\s*\)\s*;?\s*$/);
                            const pageWin = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
                            if (mm && typeof pageWin[mm[1]] === 'function') {
                                const args = [];
                                (mm[2] || '').replace(/'([^']*)'|"([^"]*)"|(-?\d+)/g, (_, a, b, c) => { args.push(a !== undefined ? a : (b !== undefined ? b : Number(c))); return ''; });
                                pageWin[mm[1]](...args);
                            }
                        } catch(e) {}
                    }
                }

                const dateNode = clone.querySelector('font[color="#808080"]');
                const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                if (dateNode) dateNode.remove();

                const headerNode = clone.querySelector('font[style*="font-weight:bold"]');
                let headerHTML = '';
                if (headerNode) {
                    headerHTML = headerNode.innerHTML.replace(/<br>/g, ' ').replace(/\s+/g, ' ').trim();
                    headerNode.remove();
                }

                const tableNode = clone.querySelector('table');
                let tableHTML = '';
                if (tableNode) {
                    tableNode.removeAttribute('width');
                    tableNode.className = 'feedback-table';
                    tableNode.querySelectorAll('td').forEach(td => {
                        td.removeAttribute('width');
                        td.removeAttribute('style');
                    });
                    tableHTML = tableNode.outerHTML;
                    tableNode.remove();
                }

                let bodyText = clone.innerHTML.replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
                if (!bodyText.replace(/<br>/g, '').trim()) bodyText = '';

                const card = document.createElement('div');
                card.className = 'msg-card';

                card.innerHTML = `
                                        <div class="msg-header">
                                            <div class="msg-sender"><span class="material-icons">rate_review</span>Отзыв</div>
                                            <div class="msg-date">${dateStr}</div>
                                        </div>
                                        ${headerHTML ? `<div class="msg-subject" style="font-weight:500; opacity:0.9; font-size:1.3rem;">${headerHTML}</div>` : ''}
                                        ${bodyText ? `<div class="msg-body" style="margin-bottom:1rem;">${bodyText}</div>` : ''}
                                        ${tableHTML}
                                    `;
                container.appendChild(card);
            });

            feedbackMsgs.forEach(m => m.remove());

            if (submenu) submenu.after(container);
            else pageCtx.span9.appendChild(container);
        }

        // Вызов заглушки для комментариев
        updateEmptyState(pageCtx.span9, feedbackMsgs.length > 0, '', 'comments');
    }

    // Логика вкладки "Рейтинг факультетов и кафедр"
    if (isRatingTab) {
        const ratingH4 = pageCtx.span9.querySelector('h4');

        // Проверяем, есть ли реальные числовые оценки в таблице (хотя бы одна строка с colspan или > 1 ячейкой)
        let hasRatingData = false;
        if (ratingTable) {
            const rows = ratingTable.querySelectorAll('tr.lvl1, tr.lvl2');
            for (let r of rows) {
                if (r.cells.length > 1) {
                    hasRatingData = true;
                    break;
                }
            }
        }

        if (hasRatingData) {
            // Оформляем заголовок и памятку "Как читать таблицы?" только если данные есть
            if (ratingH4 && ratingH4.textContent.includes('Индекс удовлетворенности')) {
                const newTitle = document.createElement('h3');
                newTitle.textContent = ratingH4.textContent;
                newTitle.style.marginBottom = '2rem';
                newTitle.style.fontSize = '1.6rem';
                newTitle.style.fontWeight = '800';
                newTitle.style.color = 'var(--color-text-primary)';
                newTitle.style.lineHeight = '1.4';

                const infoBlock = document.createElement('div');
                infoBlock.style.cssText = `
                                        background: var(--color-card);
                                        border-radius: var(--radius-large);
                                        box-shadow: var(--shadow-main);
                                        padding: 2.4rem;
                                        margin-bottom: 3rem;
                                        border: 1px solid var(--color-table-border);
                                        color: var(--color-text-primary);
                                        line-height: 1.6;
                                        font-size: 1.35rem;
                                    `;

                infoBlock.innerHTML = `
                                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; font-weight:800; font-size:1.6rem; color:var(--color-text-primary);">
                                            <span class="material-icons" style="color:var(--color-accent); font-size: 24px;">help_outline</span>
                                            Как читать таблицы?
                                        </div>
                                        <div style="display: flex; flex-direction: column; gap: 10px; color: var(--color-text-secondary);">
                                            <div style="display: flex; gap: 10px;">
                                                <span style="color: var(--color-accent); font-weight: 800;">•</span>
                                                <div><b style="color: var(--color-text-primary);">Строки</b> — кафедры и факультеты, работу которых оценивали.</div>
                                            </div>
                                            <div style="display: flex; gap: 10px;">
                                                <span style="color: var(--color-accent); font-weight: 800;">•</span>
                                                <div><b style="color: var(--color-text-primary);">Столбцы (аббревиатуры)</b> — факультеты студентов, которые оставляли отзыв. Например, ЭК — студенты эконома. Столбец <b style="color: var(--color-text-primary);">«Все»</b> — средний балл от студентов со всего университета.</div>
                                        </div>
                                            <div style="display: flex; gap: 10px;">
                                                <span style="color: var(--color-accent); font-weight: 800;">•</span>
                                                <div><b style="color: var(--color-text-primary);">Оценки</b> — средний индекс (максимум 5.0). <span style="background: rgba(255, 59, 48, 0.1); color: var(--color-red); padding: 2px 6px; border-radius: 6px; font-weight: 800; font-size: 1.2rem; display: inline-block; line-height: 1;">Красным</span> выделены оценки ниже 4.0. Прочерк означает, что студенты данного факультета не оценивали эту кафедру.</div>
                                            </div>
                                        </div>
                                    `;

                ratingH4.replaceWith(newTitle);
                newTitle.after(infoBlock);

                let nextSibling = infoBlock.nextSibling;
                while (nextSibling && nextSibling.tagName === 'BR') {
                    const toRemove = nextSibling;
                    nextSibling = nextSibling.nextSibling;
                    toRemove.remove();
                }
            }

            if (ratingTable) {
                let headerThs =[];
                ratingTable.querySelectorAll('tr').forEach(tr => {
                    const ths = tr.querySelectorAll('th');
                    if (ths.length > 5 && !ths[0].hasAttribute('colspan')) {
                        headerThs = Array.from(ths).map(th => th.textContent.trim());
                    }
                });

                if (headerThs.length > 0) {
                    const groups =[];
                    let currentGroup = null;

                    ratingTable.querySelectorAll('tr.lvl1, tr.lvl2').forEach(tr => {
                        if (tr.classList.contains('lvl1')) {
                            currentGroup = {
                                name: tr.cells[0].textContent.trim(),
                                overallData: Array.from(tr.cells).slice(1),
                                departments:[]
                            };
                            groups.push(currentGroup);
                        } else if (tr.classList.contains('lvl2') && currentGroup) {
                            currentGroup.departments.push({
                                name: tr.cells[0].textContent.trim(),
                                data: Array.from(tr.cells).slice(1)
                            });
                        }
                    });

                    const newContainer = document.createElement('div');
                    newContainer.className = 'rating-split-container';

                    groups.forEach(group => {
                        const activeColIndices =[];
                        for (let i = 0; i < headerThs.length; i++) {
                            let hasData = false;
                            if (group.overallData[i] && group.overallData[i].textContent.trim() !== '') hasData = true;
                            if (!hasData) {
                                for (let dep of group.departments) {
                                    if (dep.data[i] && dep.data[i].textContent.trim() !== '') {
                                        hasData = true;
                                        break;
                                    }
                                }
                            }
                            if (hasData) activeColIndices.push(i);
                        }

                        if (activeColIndices.length === 0 && group.departments.length === 0) return;

                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        wrapper.style.marginBottom = '3rem';

                        const table = document.createElement('table');
                        table.className = 'common rating-split-table';
                        table.style.width = '100%';

                        const thead = document.createElement('thead');
                        const hTr = document.createElement('tr');
                        const thName = document.createElement('th');
                        thName.textContent = group.name;
                        thName.style.textAlign = 'left';
                        hTr.appendChild(thName);

                        activeColIndices.forEach(idx => {
                            const th = document.createElement('th');
                            th.textContent = headerThs[idx];
                            th.style.textAlign = 'center';
                            hTr.appendChild(th);
                        });
                        thead.appendChild(hTr);
                        table.appendChild(thead);

                        const tbody = document.createElement('tbody');

                        const processCell = (origTd) => {
                            const td = document.createElement('td');
                            td.style.textAlign = 'center';
                            td.style.verticalAlign = 'middle';

                            if (!origTd) {
                                td.innerHTML = '<span style="color: var(--color-table-border);">-</span>';
                                return td;
                            }

                            td.innerHTML = origTd.innerHTML;

                            if (origTd.classList.contains('tooltip')) {
                                td.classList.add('tooltip');
                                if (origTd.title) td.title = origTd.title;
                                if (origTd.hasAttribute('data-val')) td.setAttribute('data-val', origTd.getAttribute('data-val'));
                            }

                            if (td.textContent.trim() === '') {
                                td.innerHTML = '<span style="color: var(--color-table-border);">-</span>';
                            } else {
                                const font = td.querySelector('font[color="#d00"], font[style*="color:#d00"]');
                                if (font) {
                                    font.style.cssText = 'color: var(--color-red) !important; font-weight: 800 !important; background: rgba(255, 59, 48, 0.1) !important; padding: 0.4rem 0.8rem !important; border-radius: 6px !important; display: inline-block !important;';
                                }
                            }
                            return td;
                        };

                        const overallTr = document.createElement('tr');
                        overallTr.style.background = 'var(--color-highlight)';
                        const overallTdName = document.createElement('td');
                        overallTdName.innerHTML = '<b>В целом по факультету</b>';
                        overallTr.appendChild(overallTdName);

                        activeColIndices.forEach(idx => {
                            overallTr.appendChild(processCell(group.overallData[idx]));
                        });
                        tbody.appendChild(overallTr);

                        group.departments.forEach(dep => {
                            const tr = document.createElement('tr');
                            const tdName = document.createElement('td');
                            tdName.textContent = dep.name.replace(/^[\-—]\s*/, '');
                            tr.appendChild(tdName);

                            activeColIndices.forEach(idx => {
                                tr.appendChild(processCell(dep.data[idx]));
                            });
                            tbody.appendChild(tr);
                        });

                        table.appendChild(tbody);
                        wrapper.appendChild(table);
                        newContainer.appendChild(wrapper);
                    });

                    ratingTable.parentNode.replaceChild(newContainer, ratingTable);
                }
            }
        } else {
            // Если данных нет, полностью очищаем оригинальный заголовок, пустую таблицу и лишние BR
            if (ratingH4) ratingH4.remove();
            if (ratingTable) ratingTable.remove();

            pageCtx.span9.querySelectorAll('br').forEach(br => {
                if (br.parentNode === pageCtx.span9) br.remove();
            });
        }

        // Вызываем проверку пустого состояния
        updateEmptyState(pageCtx.span9, hasRatingData, '', 'rating');
    }
    return;
}
