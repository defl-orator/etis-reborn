import { pageCtx } from '../app/context.js';

export function renderElectronicResourcesPage() {
    while (pageCtx.span9.firstChild && (pageCtx.span9.firstChild.tagName === 'BR' || (pageCtx.span9.firstChild.nodeType === Node.TEXT_NODE && !pageCtx.span9.firstChild.textContent.trim()))) {
        pageCtx.span9.firstChild.remove();
    }

    const resTable = document.getElementById('resources');

    // 1. Убираем лишние заголовки
    pageCtx.span9.querySelectorAll('h3').forEach(h => {
        const text = h.textContent.toLowerCase();
        if (text.includes('электронные ресурсы пгниу') || text.includes('ресурсы, доступ к которым')) {
            h.remove();
        }
    });

    // 2. Оформляем инфо-блок (памятка от научной библиотеки) и переносим в конец страницы
    const introText = pageCtx.span9.querySelector('p[style*="font-size:11pt"]');
    if (introText) {
        const infoBox = document.createElement('div');
        infoBox.style.cssText = `
                                background: var(--color-card);
                                border-radius: var(--radius-large) !important;
                                box-shadow: var(--shadow-main);
                                padding: 2.4rem !important;
                                margin-top: 3.2rem; /* Сделаем красивый отступ от таблиц сверху */
                                margin-bottom: 0 !important;
                                text-align: left !important;
                                color: var(--color-text-primary);
                                border: 1px solid var(--color-table-border);
                                line-height: 1.6;
                                font-size: 1.35rem;
                            `;

        let cleanHTML = introText.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();

        infoBox.innerHTML = `
                                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                    <span class="material-icons" style="color:var(--color-accent); font-size: 24px;">local_library</span>
                                    Научная библиотека
                                </div>
                                <div style="opacity: 0.9;">
                                    ${cleanHTML}
                                </div>
                            `;
        introText.remove();
        pageCtx.span9.appendChild(infoBox);
    }

    // 3. Парсинг таблицы и исправление скролла/разделителей
    const rows = Array.from(resTable.querySelectorAll('tr'));
    let currentTbody = null;

    const addCopyLogic = (cell) => {
        const text = cell.textContent.trim();
        if (!text || text.includes('от личного кабинета') || text.toLowerCase().includes('код доступа') || text.includes('Логин')) return;

        cell.style.cursor = 'pointer';
        cell.classList.add('copy-pass');

        cell.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                const originalHTML = cell.innerHTML;
                cell.textContent = 'Скопировано!';
                cell.style.color = 'var(--color-green)';
                setTimeout(() => {
                    cell.innerHTML = originalHTML;
                    cell.style.color = '';
                }, 800);
            });
        });
    };

    rows.forEach((row) => {
        const catHeader = row.querySelector('th[colspan="3"]');
        const rowText = row.textContent.toLowerCase();

        if (catHeader && rowText.includes('ldap/campus')) { row.remove(); return; }
        if (rowText.includes('логин / пароль') && rowText.includes('личного кабинета') && !rowText.includes('bbb')) { row.remove(); return; }

        if (catHeader) {
            let titleText = catHeader.textContent.trim();
            if (titleText.toLowerCase() === 'видеоресурс') {
                titleText = 'ВИДЕОРЕСУРС и LDAP/CAMPUS';
            }

            const block = document.createElement('div');
            block.className = 'day resource-block';

            const title = document.createElement('h3');
            title.textContent = titleText;
            block.appendChild(title);

            // Оборачиваем в контейнер для скролла
            const wrapper = document.createElement('div');
            wrapper.className = 'wide-table-wrapper';

            const table = document.createElement('table');
            table.className = 'common resource-table';
            table.style.minWidth = '650px'; // Заставляем скроллиться на мобильных

            // Добавляем tbody, чтобы заработали стили градиентных разделителей
            currentTbody = document.createElement('tbody');
            table.appendChild(currentTbody);

            wrapper.appendChild(table);
            block.appendChild(wrapper);

            // Вставляем блок перед старой таблицей
            resTable.parentNode.insertBefore(block, resTable);
            row.remove();
        } else if (currentTbody) {
            if (row.querySelector('th') || (rowText.includes('логин') && rowText.includes('пароль'))) {
                row.remove();
                return;
            }

            const cells = row.querySelectorAll('td');
            if (cells.length === 3) {
                addCopyLogic(cells[1]);
                addCopyLogic(cells[2]);
            } else if (cells.length === 2) {
                addCopyLogic(cells[1]);
            }

            currentTbody.appendChild(row);
        }
    });

    resTable.remove();
    return;
}
