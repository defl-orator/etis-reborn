import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';

export function renderLibraryPage() {
    let pageMode = new URLSearchParams(window.location.search).get('p_mode');
    if (!pageMode) {
        if (pageCtx.span9.querySelector('#record_list') || pageCtx.span9.querySelector('.wrap')) {
            pageMode = 'catalog';
        } else if (pageCtx.span9.querySelector('.library-history-table') || pageCtx.span9.querySelector('th')?.textContent.includes('Книга')) {
            pageMode = 'history';
        } else {
            pageMode = 'recommend';
        }
    }

    const submenu = pageCtx.span9.querySelector('.submenu');

    // 1. Памятка научной библиотеки (переносим в конец)
    const libIntro = Array.from(pageCtx.span9.querySelectorAll('p')).find(p => p.textContent.includes('Для чтения полных текстов'));
    if (libIntro) {
        const infoBox = document.createElement('div');
        infoBox.className = 'electr-description';
        infoBox.style.cssText = `
                                background: var(--color-card);
                                border-radius: var(--radius-large) !important;
                                box-shadow: var(--shadow-main);
                                padding: 2.4rem !important;
                                margin-top: 4rem;
                                margin-bottom: 2rem;
                                text-align: left !important;
                                color: var(--color-text-primary);
                                border: 1px solid var(--color-table-border);
                                line-height: 1.6;
                                font-size: 1.35rem;
                                width: 100%;
                                box-sizing: border-box;
                            `;

        let cleanHTML = libIntro.innerHTML.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        infoBox.innerHTML = `
                                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                    <span class="material-icons" style="color:var(--color-accent); font-size: 26px;">info</span>
                                    Электронные издания
                                </div>
                                <div style="opacity: 0.9;">${cleanHTML}</div>
                            `;
        libIntro.remove();
        setTimeout(() => pageCtx.span9.appendChild(infoBox), 0);
    }

    // 2. Создаем единую капсулу подвкладок и поиска
    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'plan-controls-wrapper';
    controlsWrapper.innerHTML = `
                            <div class="plan-default-bar">
                                <div class="plan-submenu-track" id="lib-submenu-track">
                                    ${pageMode === 'recommend' ? '<b>Рекомендуемая</b>' : '<a href="stu.library?p_mode=recommend">Рекомендуемая</a>'}
                                    ${pageMode === 'catalog' ? '<b>Электронный каталог</b>' : '<a href="stu.library?p_mode=catalog">Электронный каталог</a>'}
                                    ${pageMode === 'history' ? '<b>История выдачи</b>' : '<a href="stu.library?p_mode=history">История выдачи</a>'}
                                </div>
                                <button type="button" class="plan-search-circle-btn" id="lib-search-open-btn" title="Поиск">
                                    <span class="material-icons">search</span>
                                </button>
                            </div>
                            <div class="term-search-bar">
                                <div class="term-search-input-capsule">
                                    <span class="material-icons">search</span>
                                    <input type="text" class="lib-unified-input" placeholder="${pageMode === 'catalog' ? 'Поиск по электронному каталогу (нажмите Enter)...' : (pageMode === 'history' ? 'Поиск в истории выдачи...' : 'Поиск книги, автора, предмета...')}">
                                </div>
                                <div class="term-search-close-capsule">
                                    <button type="button" class="term-action-btn" id="lib-search-close-btn" title="Закрыть поиск">
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                            </div>
                        `;

    if (submenu) {
        submenu.replaceWith(controlsWrapper);
    } else {
        pageCtx.span9.prepend(controlsWrapper);
    }

    // Удаляем старый поиск ЕТИСа, если он был
    const oldSearchWrap = pageCtx.span9.querySelector('.wrap');
    if (oldSearchWrap) oldSearchWrap.remove();

    const searchOpenBtn = controlsWrapper.querySelector('#lib-search-open-btn');
    const searchCloseBtn = controlsWrapper.querySelector('#lib-search-close-btn');
    const libInput = controlsWrapper.querySelector('.lib-unified-input');

    if (searchOpenBtn && searchCloseBtn && libInput) {
        searchOpenBtn.onclick = () => {
            controlsWrapper.classList.add('is-searching');
            libInput.focus(); // Синхронный фокус
            setTimeout(() => libInput.focus(), 150);
        };
        searchCloseBtn.onclick = () => {
            controlsWrapper.classList.remove('is-searching');
            libInput.value = '';
            libInput.dispatchEvent(new Event('input'));
        };
        libInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') searchCloseBtn.click();
        });
    }

    // 3. Режим: Электронный каталог
    if (pageMode === 'catalog') {
        const recordList = document.getElementById('record_list');
        const loadGif = "/etis/dojo/dijit/themes/tundra/images/loading.gif";

        const performSearch = () => {
            const val = libInput.value.trim();
            if (val.length < 2) return;
            const filter = encodeURIComponent(val);
            $(recordList).html(`<div style="padding:20px; text-align:center;"><img src="${loadGif}"> Загрузка...</div>`);
            $(recordList).load("lib_search.get_books?p_filter=" + filter, function() {
                const table = recordList.querySelector('table');
                if (table && !table.parentNode.classList.contains('wide-table-wrapper')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'wide-table-wrapper';
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                    table.style.minWidth = "850px";
                }
            });
        };

        libInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    // 4. Режим: Рекомендуемая литература
    else if (pageMode === 'recommend') {
        const headers = Array.from(pageCtx.span9.querySelectorAll('h3'));
        headers.forEach(h3 => {
            const table = h3.nextElementSibling;
            if (table && table.tagName === 'TABLE') {
                const block = document.createElement('div');
                block.className = 'library-subject-block';
                block.style.marginBottom = '4rem';
                h3.parentNode.insertBefore(block, h3);
                block.appendChild(h3);

                const tbody = table.querySelector('tbody') || table;
                const rows = Array.from(tbody.querySelectorAll('tr'));
                let mainHeaderRow = null;

                for (let row of rows) {
                    if (row.querySelector('th') && !row.querySelector('.subheader')) {
                        mainHeaderRow = row;
                        break;
                    }
                }

                let currentTableBody = null;
                let currentWrapper = null;

                rows.forEach(row => {
                    if (row === mainHeaderRow) return;

                    const subheader = row.querySelector('.subheader');
                    if (subheader) {
                        const categoryName = subheader.textContent.trim();

                        currentWrapper = document.createElement('div');
                        currentWrapper.className = 'wide-table-wrapper';
                        if (block.querySelectorAll('.wide-table-wrapper').length > 0) {
                            currentWrapper.style.marginTop = '2.4rem';
                        }

                        block.appendChild(currentWrapper);

                        const newTable = document.createElement('table');
                        newTable.className = 'common resource-table';
                        newTable.style.minWidth = "800px";

                        currentTableBody = document.createElement('tbody');
                        newTable.appendChild(currentTableBody);

                        if (mainHeaderRow) {
                            const clonedHeader = mainHeaderRow.cloneNode(true);
                            const firstTh = clonedHeader.querySelector('th');
                            if (firstTh && firstTh.textContent.includes('Литература')) {
                                firstTh.textContent = categoryName + ' литература';
                            }
                            currentTableBody.appendChild(clonedHeader);
                        }

                        currentWrapper.appendChild(newTable);
                    } else if (currentTableBody) {
                        if (row.children.length === 0) return;
                        currentTableBody.appendChild(row);
                    }
                });

                table.remove();
            }
        });

        const initialRecsCount = document.querySelectorAll('.library-subject-block').length;
        updateEmptyState(pageCtx.span9, initialRecsCount > 0, '', 'library');

        libInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.library-subject-block').forEach(block => {
                const h3Text = block.querySelector('h3').textContent.toLowerCase();
                let blockHasVisible = false;

                block.querySelectorAll('.wide-table-wrapper').forEach(wrapper => {
                    const rows = Array.from(wrapper.querySelectorAll('tbody tr'));
                    let wrapperHasVisible = false;

                    rows.forEach((row, idx) => {
                        if (idx === 0 && row.querySelector('th')) return;
                        const match = val === "" || row.textContent.toLowerCase().includes(val) || h3Text.includes(val);
                        row.style.display = match ? "" : "none";
                        if (match) wrapperHasVisible = true;
                    });

                    if (wrapperHasVisible) {
                        wrapper.style.display = '';
                        blockHasVisible = true;
                    } else {
                        wrapper.style.display = 'none';
                    }
                });

                block.style.display = blockHasVisible ? "block" : "none";
            });

            let totalVisible = 0;
            document.querySelectorAll('.library-subject-block').forEach(block => {
                if (block.style.display !== 'none') {
                    totalVisible += block.querySelectorAll('.wide-table-wrapper:not([style*="display: none"]) tbody tr:not([style*="display: none"]):not(:has(th))').length;
                }
            });

            updateEmptyState(pageCtx.span9, totalVisible > 0, val, 'library');
        });
    }
    // 5. Режим: История выдачи
    else if (pageMode === 'history') {
        const historyTable = pageCtx.span9.querySelector('table.common');
        if (historyTable) {
            historyTable.classList.add('library-history-table');
            const wrapper = document.createElement('div');
            wrapper.className = 'wide-table-wrapper';
            historyTable.parentNode.insertBefore(wrapper, historyTable);
            wrapper.appendChild(historyTable);
            historyTable.style.minWidth = "900px";

            const initialHistoryCount = historyTable.querySelectorAll('tbody tr:not(:has(th))').length;
            updateEmptyState(pageCtx.span9, initialHistoryCount > 0, '', 'library');

            libInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase().trim();
                let totalVisible = 0;

                historyTable.querySelectorAll('tbody tr').forEach(row => {
                    if (row.querySelector('th')) return;
                    const match = (val === "" || row.textContent.toLowerCase().includes(val));
                    row.style.display = match ? "" : "none";
                    if (match) totalVisible++;
                });

                updateEmptyState(pageCtx.span9, totalVisible > 0, val, 'library');
            });
        }
    }

    pageCtx.span9.querySelectorAll('br, p:empty').forEach(el => el.remove());
    return;
}
