import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';
import { highlightSearchTerm } from '../ui/search-highlight.js';

export function renderTeachersPage() {
    const statsLink = pageCtx.span9.querySelector('a[href="stu.dis_stat"]');

    // Извлекаем параметры текущего семестра из скрытого JS-кода страницы
    let pTyId = '2025', pTerm = '2';
    const scriptMatch = document.body.innerHTML.match(/P_TY_ID=(\d+)&P_TERM=(\d+)/i);
    if (scriptMatch) {
        pTyId = scriptMatch[1];
        pTerm = scriptMatch[2];
    }

    // Чистим span9 от мусора ЕТИСа
    pageCtx.span9.querySelectorAll('br, script, style').forEach(el => el.remove());

    // 2. Создаем капсулу поиска
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'teacher-search-wrapper';
    searchWrapper.innerHTML = `
                            <div class="search-capsule">
                                <span class="material-icons search-icon">search</span>
                                <input type="text" class="search-input" placeholder="Поиск" style="padding-left: 44px !important;">
                            </div>
                        `;
    pageCtx.span9.prepend(searchWrapper);

    // 3. Создаем контейнер для списка
    const listContainer = document.createElement('div');
    listContainer.className = 'teachers-list';
    pageCtx.span9.appendChild(listContainer);

    // 4. Переносим таблицы в карточки внутри списка
    const tables = pageCtx.span9.querySelectorAll('table.teacher_info');
    tables.forEach(table => {
        const img = table.querySelector('.teacher_photo img');
        const nameDiv = table.querySelector('.teacher_name');
        const chairDiv = table.querySelector('.chair');
        const disDiv = table.querySelector('.dis');

        const nameText = nameDiv ? nameDiv.textContent.trim() : '';
        const chairText = chairDiv ? chairDiv.textContent.trim() : '';

        // === ПРАВИЛЬНЫЙ ПАРСИНГ ССЫЛОК ИЗ ФУНКЦИИ get_tt ===
        let nameUrl = '#';
        let chairUrl = '#';

        if (nameDiv) {
            const match = nameDiv.innerHTML.match(/get_tt\(\s*'?(\d+)'?\s*,/i);
            if (match) nameUrl = `tt_pkg.show_prep?P_TY_ID=${pTyId}&P_TERM=${pTerm}&P_PEO_ID=${match[1]}&P_SDIV_ID=&p_print=y`;
        }
        if (chairDiv) {
            const match = chairDiv.innerHTML.match(/get_tt\(\s*'?\d*'?\s*,\s*'?(\d+)'?\s*\)/i);
            if (match) chairUrl = `tt_pkg.show_prep?P_TY_ID=${pTyId}&P_TERM=${pTerm}&P_PEO_ID=&P_SDIV_ID=${match[1]}&p_print=y`;
        }
        // =================================================

        // --- ПАРСИНГ ПРЕДМЕТОВ И ВЫДЕЛЕНИЕ МЕТОК ---
        let subjectsHtml = '';
        let rawSubjectsText = '';
        let uniqueTypes = new Set();

        if (disDiv) {
            const lines = disDiv.innerHTML.split(/<br\s*\/?>/i).filter(line => line.trim());
            lines.forEach(line => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = line;
                rawSubjectsText += tempDiv.textContent + ' ';

                const match = line.match(/(.*?)\s*\(([^)]+)\)\s*$/);
                if (match) {
                    let subjName = match[1].trim();
                    let typesStr = match[2].trim();
                    typesStr.split(',').forEach(t => uniqueTypes.add(t.trim().toLowerCase()));
                    subjectsHtml += `<div style="margin-bottom: 0.6rem; line-height: 1.4; color: var(--color-text-primary); opacity: 0.9;">${subjName}</div>`;
                } else {
                    subjectsHtml += `<div style="margin-bottom: 0.6rem; line-height: 1.4; color: var(--color-text-primary); opacity: 0.9;">${line}</div>`;
                }
            });
        }

        // --- ГЕНЕРАЦИЯ ЦВЕТНЫХ КАПСУЛ ---
        let badgesHtml = '';
        const orderedTypes =['экзамен', 'зачет', 'зачёт', 'лек', 'практ', 'лаб'];
        const foundTypes = Array.from(uniqueTypes);

        foundTypes.sort((a, b) => {
            let ia = orderedTypes.indexOf(a);
            let ib = orderedTypes.indexOf(b);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        foundTypes.forEach(t => {
            let bg = 'var(--color-highlight)';
            let color = 'var(--color-text-secondary)';

            if (t === 'лек') { bg = 'rgba(0, 122, 255, 0.12)'; color = 'var(--color-blue)'; }
            else if (t === 'практ') { bg = 'rgba(52, 199, 89, 0.12)'; color = 'var(--color-green)'; }
            else if (t === 'лаб') { bg = 'rgba(255, 149, 0, 0.12)'; color = 'var(--color-warning)'; }
            else if (t === 'зачет' || t === 'зачёт') { bg = 'rgba(85, 197, 209, 0.15)'; color = '#008B8B'; }
            else if (t === 'экзамен') { bg = 'rgba(175, 82, 222, 0.15)'; color = '#AF52DE'; }

            badgesHtml += `<span style="background: ${bg}; color: ${color}; padding: 0 1rem; border-radius: 50px; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; height: 2.2rem; line-height: 1;">${t}</span>`;
        });

        const card = document.createElement('div');
        card.className = 'teacher-card';

        const searchString = `${nameText} ${chairText} ${rawSubjectsText}`.toLowerCase().replace(/\s+/g, ' ');
        card.setAttribute('data-search', searchString);

        // Умный обработчик: на ПК открывает окошко, на мобилках работает как обычная ссылка
        const popupScript = `if(window.innerWidth > 960 && this.href !== '#' && !this.href.endsWith('#')) { window.open(this.href, 'tt', 'width=1000,height=700,scrollbars=yes,resizable=yes'); return false; }`;

        card.innerHTML = `
                                <div class="teacher-avatar-box">
                                    <img src="${img ? img.src : ''}" loading="lazy">
                                </div>
                                <div class="teacher-details">
                                    <a class="teacher-name-link" href="${nameUrl}" target="_blank" onclick="${popupScript}">${nameText.replace('Расписание преподавателя', '')}</a>

                                    <div class="teacher-meta-row">
                                        <a class="teacher-dept-link" href="${chairUrl}" target="_blank" onclick="${popupScript}">${chairText.replace('Расписание кафедры', '')}</a>
                                        <div class="teacher-badges-box">${badgesHtml}</div>
                                    </div>

                                    <div class="teacher-subjects">${subjectsHtml}</div>
                                </div>
                            `;
        listContainer.appendChild(card);
        table.remove();
    });

    if (statsLink) {
        statsLink.className = 'stats-link-bottom';
        statsLink.innerHTML = `
                                <div class="order-icon-box" style="background: var(--color-accent-active) !important;">
                                    <span class="material-icons" style="color: var(--color-accent) !important;">insights</span>
                                </div>
                                <div style="flex-grow: 1; text-align: left;">
                                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary); line-height: 1.4;">Статистика сдачи экзаменов и зачетов</div>
                                    <div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 2px;">Статистика по преподавателям за последние 2 сессии</div>
                                </div>
                                <span class="material-icons" style="color: var(--color-text-secondary); font-size: 1.8rem; flex-shrink: 0;">open_in_new</span>
                            `;
        pageCtx.span9.appendChild(statsLink);
    }

    // Первоначальная проверка при пустом списке на сервере
    const initialCardsCount = listContainer.querySelectorAll('.teacher-card').length;
    updateEmptyState(listContainer, initialCardsCount > 0, '', 'teachers');

    const input = searchWrapper.querySelector('.search-input');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        let foundCount = 0;
        listContainer.querySelectorAll('.teacher-card').forEach(card => {
            const content = card.getAttribute('data-search');
            if (term === '' || content.includes(term)) {
                card.style.display = 'flex';
                foundCount++;
                highlightSearchTerm(card, term);
            } else {
                card.style.display = 'none';
            }
        });

        // Использование умного плейсхолдера вместо простого текста
        updateEmptyState(listContainer, foundCount > 0, term, 'teachers');
    });

    return;
}
