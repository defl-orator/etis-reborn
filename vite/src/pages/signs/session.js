import { pageCtx } from '../../app/context.js';
import { getEffectiveAccent } from '../../core/accent.js';
import { ACCENT_COLORS } from '../../core/accent-colors.ts';
import { generalConfig } from '../../core/config.js';
import { updateEmptyState } from '../../ui/empty-state.js';
import { highlightSearchTerm } from '../../ui/search-highlight.js';
import { applySri } from '../../utils/security.ts';
import { getTermWord } from '../../utils/term-system.ts';

export function renderSessionSigns() {
    if (pageCtx.pageMode === 'session') {

        // Проверяем, есть ли хоть какие-то реальные оценки в сессиях
        const hasAnySessionData = Array.from(pageCtx.span9.querySelectorAll('table.common tr')).some(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const gText = cells[1].textContent.trim().toLowerCase();
                return gText && gText !== 'н' && !gText.includes('нет');
            }
            return false;
        });

        const submenu = pageCtx.span9.querySelector('.submenu');

        let searchContainer = null;
        
        if (!hasAnySessionData) {
            // Если данных нет — оставляем обычную аккуратную капсулу .submenu без двойных рамок и без кнопки поиска
            if (submenu) {
                submenu.style.removeProperty('display');
            }
        } else {
            // Если данные есть — создаём объединённую капсулу с поиском и аналитикой
            searchContainer = document.createElement('div');
            searchContainer.className = 'term-controls-wrapper';
            searchContainer.innerHTML = `
                                    <div class="term-default-bar">
                                        <div class="term-semesters-capsule" id="session-submenu-track"></div>
                                        <div class="term-actions-capsule">
                                            <button type="button" class="term-action-btn" id="session-search-open-btn" title="Поиск">
                                                <span class="material-icons">search</span>
                                            </button>
                                            <div class="term-actions-divider"></div>
                                            <button type="button" class="term-action-btn analytics-btn" id="session-analytics-btn" title="Аналитика успеваемости">
                                                <span class="material-icons">insights</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="term-search-bar">
                                        <div class="term-search-input-capsule">
                                            <span class="material-icons">search</span>
                                            <input type="text" class="signs-local-input" placeholder="Поиск...">
                                        </div>
                                        <div class="term-search-close-capsule">
                                            <button type="button" class="term-action-btn" id="session-search-close-btn" title="Закрыть поиск">
                                                <span class="material-icons">close</span>
                                            </button>
                                        </div>
                                    </div>
                                `;

            if (submenu) {
                const track = searchContainer.querySelector('#session-submenu-track');
                while (submenu.firstChild) {
                    track.appendChild(submenu.firstChild);
                }
                submenu.replaceWith(searchContainer);
            } else {
                pageCtx.span9.prepend(searchContainer);
            }

            // Обработчики открытия/закрытия поиска
            const searchOpenBtn = searchContainer.querySelector('#session-search-open-btn');
            const searchCloseBtn = searchContainer.querySelector('#session-search-close-btn');
            const sessionInput = searchContainer.querySelector('.signs-local-input');

            if (searchOpenBtn && searchCloseBtn && sessionInput) {
                searchOpenBtn.onclick = () => {
                    searchContainer.classList.add('is-searching');
                    sessionInput.focus();
                    setTimeout(() => sessionInput.focus(), 150);
                };
                searchCloseBtn.onclick = () => {
                    searchContainer.classList.remove('is-searching');
                    sessionInput.value = '';
                    sessionInput.dispatchEvent(new Event('input'));
                };
                sessionInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') searchCloseBtn.click();
                });
            }

            const autoSearchSession = sessionStorage.getItem('etis_auto_search_grade');
            if (autoSearchSession && searchContainer && sessionInput) {
                sessionStorage.removeItem('etis_auto_search_grade');
                searchContainer.classList.add('is-searching');
                sessionInput.value = autoSearchSession;
                setTimeout(() => sessionInput.dispatchEvent(new Event('input')), 120);
            }
        }

        const signsTables = pageCtx.span9.querySelectorAll('table.common');

        signsTables.forEach(table => {
            const rows = Array.from(table.querySelectorAll('tr'));
            const headerRow = rows.find(r => r.textContent.toLowerCase().includes('дисциплина'));
            let trimesterData = [];

            let currentBlock = null;
            rows.forEach(row => {
                const cells = row.children;
                if (cells.length === 1 && (cells[0].tagName === 'TH' || cells[0].classList.contains('subheader'))) {
                    if (currentBlock) trimesterData.push(currentBlock);
                    currentBlock = { headerRaw: cells[0].textContent.trim(), rows: [] };
                } else if (currentBlock && cells.length > 1 && !row.textContent.includes('Дисциплина')) {
                    currentBlock.rows.push(row);
                }
            });
            if (currentBlock) trimesterData.push(currentBlock);

            trimesterData.forEach(block => {
                let sum = 0, count = 0, hasFail = false, hasPass = false, hasAny = false;
                block.rows.forEach(r => {
                    const gText = r.cells[1].textContent.trim().toLowerCase();
                    if (gText && gText !== 'н') {
                        hasAny = true;
                        let num = parseFloat(gText.replace(',', '.'));
                        if (gText.includes('незач') || gText === '2') { hasFail = true; sum += 2; count++; }
                        else if (gText.includes('зач')) { hasPass = true; sum += 5; count++; }
                        else if (!isNaN(num) && num >= 3 && num <= 5) { sum += num; count++; }
                    }

                    const gradeCell = r.cells[1];
                    const dateCell = r.cells[2];
                    if (gradeCell) {
                        let bg = 'rgba(142, 142, 147, 0.15)', color = 'var(--color-text-secondary)';
                        const gt = gradeCell.textContent.trim().toLowerCase();
                        let displayText = gradeCell.textContent.trim();

                        // 1. Проверяем долги, двойки и незачеты
                        if (gt.includes('незач') || gt.includes('неуд') || gt === '2' || gt === 'н') {
                            bg = 'rgba(255, 59, 48, 0.15)';
                            color = 'var(--color-red)';
                        }
                        // 2. Зачеты и пятерки
                        else if (gt.includes('отлич') || gt === '5' || (gt.includes('зач') && !gt.includes('незач'))) {
                            bg = 'rgba(52, 199, 89, 0.15)';
                            color = 'var(--color-green)';
                        }
                        // 3. Четверки
                        else if (gt.includes('хор') || gt === '4') {
                            bg = 'rgba(0, 122, 255, 0.15)';
                            color = 'var(--color-blue)';
                        }
                        // 4. Тройки
                        else if (gt.includes('удовл') || gt === '3') {
                            bg = 'rgba(255, 149, 0, 0.15)';
                            color = 'var(--color-warning)';
                        }
                        // 5. ФОЛБЭК: Если оценка еще не выставлена / пустая ячейка / прочерк
                        else if (!gt || gt === '-' || gt === '—' || gt.includes('нет') || gt.includes('неизвестно')) {
                            displayText = 'Неизвестно';
                            bg = 'rgba(142, 142, 147, 0.15)';
                            color = 'var(--color-text-secondary)';
                        }

                        gradeCell.innerHTML = `<span class="kt-score-capsule" style="background:${bg}; color:${color}; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; display: inline-block; min-width: 24px; text-align: center; white-space: nowrap;">${displayText}</span>`;
                    }
                    if (dateCell) {
                        dateCell.textContent = dateCell.textContent.trim().replace(/\.20(\d{2})/, '.$1');
                        dateCell.style.fontSize = '1.2rem'; dateCell.style.opacity = '0.7';
                    }
                });

                const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;

                // Парсинг (Только Номер, Тип периода и Курс)
                const trimM = block.headerRaw.match(/(\d+)\s+(триместр|семестр)/i);
                const courseM = block.headerRaw.match(/(\d+)\s+курс/i);

                const typePart = trimM ? trimM[2].toUpperCase() : getTermWord('nom_sg', true).toUpperCase();
                const numPart = trimM ? trimM[1] : "";
                const coursePart = courseM ? `${courseM[1]} КУРС` : "";
                const combinedInfo = [`${numPart} ${typePart}`, coursePart].filter(x => x.trim()).join(', ');

                // Контейнер заголовков
                const headerContainer = document.createElement('div');
                headerContainer.className = 'subject-header-flex session-term-header-group';
                headerContainer.style.cssText = 'display: flex !important; justify-content: space-between !important; align-items: center !important; margin-top: 4rem; margin-bottom: 1.5rem; padding: 0 !important; margin-left: 0 !important; width: 100%; box-sizing: border-box;';

                // Левый блок
                const leftText = document.createElement('div');
                leftText.style.cssText = 'font-size: 1.3rem; font-weight: 800; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center;';
                leftText.textContent = combinedInfo;
                headerContainer.appendChild(leftText);

                // Правая капсула (GPA)
                if (hasAny) {
                    const gpaCapsule = document.createElement('div');
                    gpaCapsule.className = 'subject-score-capsule';
                    gpaCapsule.style.cssText = 'margin: 0; display: inline-flex; align-items: center; justify-content: center; min-width: 80px; height: 32px; font-weight: 800; font-size: 1.4rem; color: #fff; position: relative; cursor: help;';
                    gpaCapsule.textContent = hasFail ? 'ДОЛГИ' : `${avg} / 5`;

                    let tooltipText = '';
                    let currentMark = '';
                    let markColor = '';

                    if (hasFail) {
                        gpaCapsule.style.background = 'var(--color-red)';
                        currentMark = '2';
                        markColor = 'var(--color-red)';
                        tooltipText = 'Есть задолженности';
                    } else {
                        const p = (avg / 5) * 100;
                        if (p < 61) {
                            gpaCapsule.style.background = 'var(--color-yellow)';
                            gpaCapsule.style.color = '#000';
                            currentMark = '3';
                            markColor = 'var(--color-warning)';
                            tooltipText = 'Удовлетворительно';
                        } else if (p < 81) {
                            gpaCapsule.style.background = '#8BC34A';
                            currentMark = '4';
                            markColor = '#8BC34A';
                            tooltipText = 'Хорошая сессия';
                        } else {
                            gpaCapsule.style.background = 'var(--color-green)';
                            currentMark = '5';
                            markColor = 'var(--color-green)';
                            tooltipText = avg === 5 ? 'Отличная сессия! 😎' : 'Отлично';
                        }
                    }

                    // Создание всплывающей подсказки при ховере/клике
                    const tooltip = document.createElement('div');
                    tooltip.className = 'score-tooltip';
                    tooltip.innerHTML = `<span style="color: ${markColor}; font-size: 1.4rem;">${currentMark}</span><span style="color: var(--color-text-secondary); margin: 0 6px;">•</span>${tooltipText}`;
                    gpaCapsule.appendChild(tooltip);

                    headerContainer.appendChild(gpaCapsule);
                }

                table.parentNode.insertBefore(headerContainer, table);

                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper session-term-table-group';
                wrapper.setAttribute('data-term-avg', avg);
                wrapper.setAttribute('data-term-name', block.headerRaw);

                const newTable = document.createElement('table');
                newTable.className = 'common session-table-v6';
                const isEmptyBlock = block.rows.length === 0;

                if (headerRow) {
                    const thead = document.createElement('thead');
                    const clonedHeader = headerRow.cloneNode(true);
                    let lastVisibleTh = null;
                    clonedHeader.querySelectorAll('th').forEach((th, idx) => {
                        if (isEmptyBlock) {
                            // Если данных в семестре нет — скрываем колонки "Дата" и "Преподаватель"
                            if (idx > 1) th.style.display = 'none';
                        } else if (generalConfig.compactGrades) {
                            const cfg = generalConfig.compactGradesConfig;
                            if (idx === 2 && !cfg.showDate) th.style.display = 'none';
                            if (idx === 3 && !cfg.showTeacher) th.style.display = 'none';
                            if (idx > 3) th.style.display = 'none';
                        }
                        if (th.style.display !== 'none') lastVisibleTh = th;
                    });
                    if (lastVisibleTh) lastVisibleTh.classList.add('align-right-cell');
                    thead.appendChild(clonedHeader);
                    newTable.appendChild(thead);
                }
                const tbody = document.createElement('tbody');
                
                if (isEmptyBlock) {
                    // Оформление для пустого семестра/триместра (colspan 2 под оставшиеся 2 колонки)
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
                    block.rows.forEach(r => {
                        let lastVisibleTd = null;
                        r.querySelectorAll('td').forEach((td, idx) => {
                            if (generalConfig.compactGrades) {
                                const cfg = generalConfig.compactGradesConfig;
                                if (idx === 2 && !cfg.showDate) td.style.display = 'none';
                                if (idx === 3 && !cfg.showTeacher) td.style.display = 'none';
                                if (idx > 3) td.style.display = 'none';
                                if (idx === 1) { td.style.width = '1%'; td.style.whiteSpace = 'nowrap'; td.style.textAlign = 'center'; }
                            }
                            if (td.style.display !== 'none') lastVisibleTd = td;
                        });
                        if (lastVisibleTd) lastVisibleTd.classList.add('align-right-cell');
                        tbody.appendChild(r);
                    });
                }
                newTable.appendChild(tbody);
                wrapper.appendChild(newTable);
                table.parentNode.insertBefore(wrapper, table);
            });
            table.remove();
        });

        // Шаг 2. Расчет среднего балла и создание Flex-заголовков
        const sessionTables = pageCtx.span9.querySelectorAll('.session-table-v6');
        sessionTables.forEach(table => {
            const wrapper = table.closest('.wide-table-wrapper');
            const h3 = wrapper ? wrapper.previousElementSibling : null;
            if (!h3 || !h3.classList.contains('term-title')) return;

            let sum = 0, count = 0, hasFail = false, hasPass = false, hasAny = false;
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(r => {
                const cells = r.querySelectorAll('td');
                if (cells.length >= 2) {
                    const gradeText = cells[1].textContent.trim().toLowerCase();
                    if (gradeText && gradeText !== 'н') {
                        hasAny = true;
                        let num = parseInt(gradeText, 10);

                        if (gradeText.includes('незач') || gradeText === '2') {
                            hasFail = true;
                            sum += 2; // Считаем незачет как 2 для аналитики
                            count++;
                        }
                        else if (gradeText.includes('зач')) {
                            hasPass = true;
                            sum += 5; // Считаем зачет как 5
                            count++;
                        }
                        else if (!isNaN(num) && num >= 3 && num <= 5) {
                            sum += num;
                            count++;
                        }
                    }
                }
            });

            // Высчитываем средний балл даже для триместров с незачетом (для графика)
            const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
            wrapper.setAttribute('data-term-avg', avg);
            wrapper.setAttribute('data-term-name', h3.textContent.trim());

            const headerContainer = document.createElement('div');
            headerContainer.className = 'subject-header-flex session-term-header-group';
            h3.parentNode.insertBefore(headerContainer, h3);
            headerContainer.appendChild(h3);

            const capsule = document.createElement('div');
            capsule.className = 'subject-score-capsule';

            // Отображение капсулы
            if (!hasAny) {
                capsule.textContent = 'Нет оценок';
                capsule.style.background = 'var(--color-highlight)';
                capsule.style.color = 'var(--color-text-secondary)';
            }
            else if (hasFail) {
                capsule.textContent = 'НЕЗАЧЕТ';
                capsule.style.background = 'var(--color-red)';
                capsule.style.color = '#fff';
            }
            else if (count > 0) {
                capsule.textContent = `${avg} / 5`;
                const p = (avg / 5) * 100;
                if (p < 41) capsule.style.background = 'var(--color-red)';
                else if (p < 61) capsule.style.background = 'var(--color-yellow)';
                else if (p < 81) capsule.style.background = '#8BC34A';
                else capsule.style.background = 'var(--color-green)';
                capsule.style.color = (p >= 41 && p < 61) ? '#000' : '#fff';
            }
            else if (hasPass) {
                capsule.textContent = 'ЗАЧЕТ';
                capsule.style.background = 'var(--color-green)';
                capsule.style.color = '#fff';
            }
            headerContainer.appendChild(capsule);

            wrapper.classList.add('session-term-table-group');
        });

        // Проверяем, есть ли хотя бы один семестр со средним баллом > 0
        const hasAnalyticData = Array.from(pageCtx.span9.querySelectorAll('.session-term-table-group')).some(w => {
            const avg = parseFloat(w.getAttribute('data-term-avg'));
            return !isNaN(avg) && avg > 0;
        });

        if (searchContainer) {
            const analyticsBtn = searchContainer.querySelector('#session-analytics-btn');
            const sessionDivider = searchContainer.querySelector('.term-actions-divider');
            if (analyticsBtn) {
                if (!hasAnalyticData) {
                    analyticsBtn.style.setProperty('display', 'none', 'important');
                    if (sessionDivider) sessionDivider.style.setProperty('display', 'none', 'important');
                } else {
                    analyticsBtn.style.removeProperty('display');
                    if (sessionDivider) sessionDivider.style.removeProperty('display');
                }
            }
        }

        // --- ШАГ 3. СОЗДАНИЕ И ЛОГИКА ОКНА АНАЛИТИКИ ---

        const overlay = document.createElement('div');
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);

        const modal = document.createElement('div');
        modal.id = 'etis-analytics-modal';
        modal.className = 'analytics-modal';
        modal.innerHTML = `
                                <div class="ui-widget-header" style="display:flex !important; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--color-table-border); background: var(--color-table-header); padding: 1.6rem 2.4rem !important;">
                                    <span class="ui-dialog-title" style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary);">Аналитика успеваемости</span>
                                    <div style="display:flex; align-items:center; gap:14px;">
                                        <button id="share-analytics-bento-btn" title="Поделиться" style="background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; margin:0 !important; display:flex !important; align-items:center; justify-content:center; cursor:pointer;">
                                            <span class="material-icons" style="color:var(--color-text-secondary); font-size:24px; transition:color 0.2s;">ios_share</span>
                                        </button>
                                        <button class="close-analytics" title="Закрыть" style="background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; margin:0 !important; display:flex !important; align-items:center; justify-content:center; cursor:pointer;">
                                            <span class="material-icons" style="color:var(--color-text-secondary); font-size:24px; transition: color 0.2s;">close</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="ui-dialog-content" style="padding: 1.6rem 2.4rem 2.4rem 2.4rem; max-height: 80vh; overflow-y: auto; box-sizing: border-box;">
                                    <div id="analytics-empty" style="display:none; text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary); font-size:1.4rem;">
                                        Недостаточно данных с оценками для построения аналитики.
                                    </div>
                                    <div id="analytics-content">
                                        <!-- Главная Бенто-карточка -->
                                        <div id="analytics-bento-capture" style="background: var(--color-card); border-radius: var(--radius-large); padding: 14px; box-shadow: var(--shadow-main); border: 1px solid var(--color-table-border); display: flex; flex-direction: column; gap: 10px; width: 100%; box-sizing: border-box;">
                                            
                                            <!-- 1. Единый блок графика со скругленной зоной заполнения снизу -->
                                            <div style="background: var(--color-highlight); border-radius: 14px; padding: 16px; box-sizing: border-box; width: 100%;">
                                                <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; text-align: left;">
                                                    Динамика среднего балла
                                                </div>
                                                <div style="height: 200px; width: 100%; position: relative; border-radius: 10px; overflow: hidden;">
                                                    <canvas id="gradesChart"></canvas>
                                                </div>
                                            </div>

                                            <!-- 2. Сетка: Лучший и Худший периоды -->
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; box-sizing: border-box;">
                                                <div style="background: var(--color-highlight); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; text-align: left; box-sizing: border-box;">
                                                    <span class="stat-box-title" id="title-best-term" style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Лучший период</span>
                                                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 2px;">
                                                        <span class="stat-box-value good" id="stat-best-term" style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary);">-</span>
                                                        <span class="subject-score-capsule" id="capsule-best-term" style="display: none; margin: 0 !important; padding: 0 10px !important; height: 26px; font-size: 1.25rem; font-weight: 800; box-shadow: none !important; align-items: center; justify-content: center; line-height: 1; border-radius: 50px;"></span>
                                                    </div>
                                                </div>
                                                <div style="background: var(--color-highlight); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; text-align: left; box-sizing: border-box;">
                                                    <span class="stat-box-title" id="title-worst-term" style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Худший период</span>
                                                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 2px;">
                                                        <span class="stat-box-value bad" id="stat-worst-term" style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary);">-</span>
                                                        <span class="subject-score-capsule" id="capsule-worst-term" style="display: none; margin: 0 !important; padding: 0 10px !important; height: 26px; font-size: 1.25rem; font-weight: 800; box-shadow: none !important; align-items: center; justify-content: center; line-height: 1; border-radius: 50px;"></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- 3. Блок успеваемости по предметам -->
                                            <div style="background: var(--color-highlight); border-radius: 14px; padding: 14px 16px 16px 16px; text-align: left; box-sizing: border-box; width: 100%;">
                                                <span class="stat-box-title" style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Всего оценок</span>
                                                <div id="dynamic-stats-container" style="width: 100%; box-sizing: border-box;"></div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            `;

        document.body.appendChild(modal);

        const closeAnalytics = () => {
            overlay.classList.remove('active');
            modal.classList.remove('active');
            document.body.classList.remove('modal-open-body');
        };
        overlay.addEventListener('click', closeAnalytics);
        modal.querySelectorAll('.close-analytics').forEach(btn => btn.addEventListener('click', closeAnalytics));

        const analyticsBtnTrigger = searchContainer ? searchContainer.querySelector('.analytics-btn') : null;
        if (analyticsBtnTrigger) analyticsBtnTrigger.addEventListener('click', function() {
            const btn = this;

            const getChartLib = () => {
                if (typeof Chart !== 'undefined') return Chart;
                if (typeof window.Chart !== 'undefined') return window.Chart;
                if (typeof unsafeWindow !== 'undefined' && unsafeWindow.Chart) return unsafeWindow.Chart;
                return null;
            };

            const renderAnalytics = () => {
                try {
                    const ChartConstructor = getChartLib();
                    if (!ChartConstructor) throw new Error('Chart.js не найден');

                    const termsData = [];
                    const subjectsData = [];
                    let termTypeGlobal = getTermWord('nom_sg');

                    document.querySelectorAll('.session-term-table-group').forEach(wrapper => {
                        const rawTermName = wrapper.getAttribute('data-term-name');
                        const avg = parseFloat(wrapper.getAttribute('data-term-avg'));

                        if (rawTermName) {
                            if (rawTermName.toLowerCase().includes('триместр')) termTypeGlobal = 'триместр';
                            if (rawTermName.toLowerCase().includes('семестр')) termTypeGlobal = 'семестр';

                            const numMatch = rawTermName.match(/(\d+)\s*(трим|сем)/i);
                            const termNum = numMatch ? parseInt(numMatch[1], 10) : 0;

                            if (avg > 0) {
                                termsData.push({ name: termNum.toString(), avg: avg, num: termNum });
                            }
                        }

                        wrapper.querySelectorAll('tbody tr').forEach(row => {
                            const cells = row.querySelectorAll('td');
                            if (cells.length >= 2) {
                                const subj = cells[0].textContent.trim();
                                const gradeText = cells[1].textContent.trim().toLowerCase();

                                let num = parseInt(gradeText, 10);
                                let isZach = false;
                                let isNezach = false;

                                if (gradeText.includes('незач')) { num = 2; isNezach = true; }
                                else if (gradeText.includes('зач')) { num = 5; isZach = true; }

                                if (!isNaN(num) && num >= 2 && num <= 5) {
                                    subjectsData.push({ subj, grade: num, isZach, isNezach });
                                }
                            }
                        });
                    });

                    termsData.sort((a, b) => a.num - b.num);
                    const shareAnalyticsBtn = modal.querySelector('#share-analytics-bento-btn');

                    if (termsData.length === 0) {
                        document.getElementById('analytics-content').style.display = 'none';
                        document.getElementById('analytics-empty').style.display = 'block';
                        if (shareAnalyticsBtn) shareAnalyticsBtn.style.setProperty('display', 'none', 'important');
                    } else {
                        document.getElementById('analytics-content').style.display = 'block';
                        document.getElementById('analytics-empty').style.display = 'none';
                        if (shareAnalyticsBtn) shareAnalyticsBtn.style.setProperty('display', 'flex', 'important');

                        const maxAvg = Math.max(...termsData.map(t => t.avg));
                        const minAvg = Math.min(...termsData.map(t => t.avg));

                        const bestTermsStr = termsData.filter(t => t.avg === maxAvg).map(t => t.num).join(', ');
                        const worstTermsStr = termsData.filter(t => t.avg === minAvg).map(t => t.num).join(', ');

                        document.getElementById('stat-best-term').textContent = bestTermsStr;
                        document.getElementById('stat-worst-term').textContent = worstTermsStr;

                        const bestTitle = document.getElementById('title-best-term');
                        const worstTitle = document.getElementById('title-worst-term');
                        if (bestTitle) bestTitle.textContent = `Лучший ${termTypeGlobal}`;
                        if (worstTitle) worstTitle.textContent = `Худший ${termTypeGlobal}`;

                        const bestCapsule = document.getElementById('capsule-best-term');
                        const worstCapsule = document.getElementById('capsule-worst-term');

                        if (bestCapsule) {
                            bestCapsule.style.display = 'inline-flex';
                            bestCapsule.textContent = maxAvg.toFixed(1);
                            bestCapsule.style.setProperty('background', 'var(--color-green)', 'important');
                            bestCapsule.style.setProperty('color', '#ffffff', 'important');
                        }
                        if (worstCapsule) {
                            worstCapsule.style.display = 'inline-flex';
                            worstCapsule.textContent = minAvg.toFixed(1);
                            worstCapsule.style.setProperty('background', 'var(--color-red)', 'important');
                            worstCapsule.style.setProperty('color', '#ffffff', 'important');
                        }

                        const count5 = subjectsData.filter(s => s.grade === 5 && !s.isZach).length;
                        const countZach = subjectsData.filter(s => s.isZach).length;
                        const count4 = subjectsData.filter(s => s.grade === 4).length;
                        const count3 = subjectsData.filter(s => s.grade === 3).length;
                        const count2 = subjectsData.filter(s => s.grade === 2 || s.isNezach).length;

                        let statsHtml = '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">';
                        const makeStatPill = (count, label, bg, border, color) => `
                                                <div style="flex: 1; min-width: 75px; background: ${bg}; border: 1px solid ${border}; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; text-align: left; box-sizing: border-box;">
                                                    <span style="font-size: 1.8rem; font-weight: 800; color: ${color}; line-height: 1; width: 100%;">${count}</span>
                                                    <span style="font-size: 1rem; font-weight: 700; color: ${color}; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; width: 100%;">${label}</span>
                                                </div>`;

                        if (count5 > 0) statsHtml += makeStatPill(count5, 'Отлично', 'rgba(52, 199, 89, 0.1)', 'rgba(52, 199, 89, 0.25)', 'var(--color-green)');
                        if (countZach > 0) statsHtml += makeStatPill(countZach, 'Зачет', 'rgba(0, 191, 165, 0.1)', 'rgba(0, 191, 165, 0.25)', '#00BFA5');
                        if (count4 > 0) statsHtml += makeStatPill(count4, 'Хорошо', 'rgba(0, 122, 255, 0.1)', 'rgba(0, 122, 255, 0.25)', 'var(--color-blue)');
                        if (count3 > 0) statsHtml += makeStatPill(count3, 'Удовл.', 'rgba(255, 149, 0, 0.1)', 'rgba(255, 149, 0, 0.25)', 'var(--color-warning)');
                        if (count2 > 0) statsHtml += makeStatPill(count2, 'Долги', 'rgba(255, 59, 48, 0.1)', 'rgba(255, 59, 48, 0.25)', 'var(--color-red)');
                        statsHtml += '</div>';

                        document.getElementById('dynamic-stats-container').innerHTML = statsHtml;

                        const ctx = document.getElementById('gradesChart').getContext('2d');
                        if (window.etisChartInstance) window.etisChartInstance.destroy();

                        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#8E8E93';
                        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-table-border').trim() || 'rgba(0,0,0,0.06)';
                        const accConfig = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };
                        const chartAccentColor = ACCENT_COLORS[getEffectiveAccent(accConfig).colors[0]] || '#007AFF';

                        // Плавный градиент с затуханием к нижней скругленной границе
                        const gradientFill = ctx.createLinearGradient(0, 0, 0, 190);
                        gradientFill.addColorStop(0, chartAccentColor + '40');
                        gradientFill.addColorStop(1, chartAccentColor + '02');

                        window.etisChartInstance = new ChartConstructor(ctx, {
                            type: 'line',
                            data: {
                                labels: termsData.map(t => t.name),
                                datasets: [{
                                    label: ' Средний балл',
                                    data: termsData.map(t => t.avg),
                                    borderColor: chartAccentColor,
                                    backgroundColor: gradientFill,
                                    borderWidth: 3,
                                    pointBackgroundColor: chartAccentColor,
                                    pointBorderColor: '#ffffff',
                                    pointBorderWidth: 2,
                                    pointRadius: 4.5,
                                    pointHoverRadius: 6.5,
                                    fill: true,
                                    tension: 0.38,
                                    clip: false
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                layout: {
                                    padding: { top: 8, right: 10, left: 4, bottom: 2 }
                                },
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        displayColors: false,
                                        backgroundColor: 'rgba(24, 26, 28, 0.92)',
                                        padding: 8,
                                        cornerRadius: 8,
                                        titleFont: { size: 11, weight: '700' },
                                        bodyFont: { size: 12, weight: '600' },
                                        callbacks: {
                                            title: (ctx) => ctx[0].label + '-й ' + termTypeGlobal,
                                            label: (ctx) => 'Ср. балл: ' + ctx.parsed.y.toFixed(2)
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        min: 2.0,
                                        max: 5.0,
                                        ticks: {
                                            color: textColor,
                                            font: { size: 11, weight: '700' },
                                            stepSize: 1,
                                            padding: 8
                                        },
                                        grid: {
                                            color: gridColor,
                                            drawBorder: false
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            color: textColor,
                                            font: { size: 11, weight: '700' },
                                            padding: 6
                                        },
                                        grid: {
                                            display: false,
                                            drawBorder: false
                                        }
                                    }
                                }
                            }
                        });

                        // ==========================================
                        // ЭКСПОРТ СКРИНШОТА С КАНВАСОМ
                        // ==========================================
                        const shareBtn = modal.querySelector('#share-analytics-bento-btn');
                        if (shareBtn) {
                            shareBtn.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const bIcon = shareBtn.querySelector('.material-icons');
                                const origIcon = bIcon.textContent;
                                bIcon.textContent = 'sync';
                                bIcon.style.animation = 'spin 1s linear infinite';
                                bIcon.style.color = 'var(--color-accent)';

                                const targetEl = document.getElementById('analytics-bento-capture');

                                const executeShare = () => {
                                    let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                                    if (!h2c) {
                                        bIcon.textContent = 'error';
                                        bIcon.style.animation = 'none';
                                        bIcon.style.color = 'var(--color-red)';
                                        setTimeout(() => { bIcon.textContent = origIcon; bIcon.style.color = 'var(--color-text-secondary)'; }, 2000);
                                        return;
                                    }

                                    const exportWrapper = document.createElement('div');
                                    exportWrapper.style.cssText = `position: absolute; top: 0px; left: 0px; pointer-events: none; width: ${targetEl.offsetWidth || 520}px; padding: 24px; box-sizing: border-box; background: ${getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6'}; z-index: -9999;`;

                                    const clone = targetEl.cloneNode(true);
                                    clone.style.margin = '0';
                                    clone.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';

                                    // ВАЖНО: Заменяем пустой склонированный canvas на снимок оригинального канваса в виде <img>
                                    const origCanvas = document.getElementById('gradesChart');
                                    if (origCanvas) {
                                        const chartImg = document.createElement('img');
                                        chartImg.src = origCanvas.toDataURL('image/png');
                                        chartImg.style.cssText = 'width: 100%; height: 100%; display: block; object-fit: contain;';
                                        const clonedCanvas = clone.querySelector('#gradesChart');
                                        if (clonedCanvas) clonedCanvas.replaceWith(chartImg);
                                    }

                                    exportWrapper.appendChild(clone);

                                    if (generalConfig.watermark) {
                                        const watermark = document.createElement('div');
                                        watermark.style.cssText = 'text-align: right; margin-top: 12px; width: 100%; box-sizing: border-box; font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;';
                                        watermark.textContent = 'etisreborn.ru';
                                        exportWrapper.appendChild(watermark);
                                    }

                                    document.body.appendChild(exportWrapper);

                                    h2c(exportWrapper, {
                                        scale: 2.5,
                                        useCORS: true,
                                        backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim()
                                    }).then(canvas => {
                                        exportWrapper.remove();
                                        canvas.toBlob(blob => {
                                            const file = new File([blob], 'EtisAnalytics.png', { type: 'image/png' });
                                            if (window.innerWidth <= 960 && navigator.canShare && navigator.canShare({ files: [file] })) {
                                                navigator.share({ files: [file], title: 'Аналитика успеваемости' }).catch(() => {});
                                                bIcon.textContent = origIcon;
                                                bIcon.style.animation = 'none';
                                                bIcon.style.color = 'var(--color-text-secondary)';
                                            } else {
                                                const link = document.createElement('a');
                                                link.download = 'EtisAnalytics.png';
                                                link.href = URL.createObjectURL(blob);
                                                link.click();
                                                URL.revokeObjectURL(link.href);

                                                bIcon.textContent = 'check';
                                                bIcon.style.animation = 'none';
                                                bIcon.style.color = 'var(--color-green)';
                                                setTimeout(() => { bIcon.textContent = origIcon; bIcon.style.color = 'var(--color-text-secondary)'; }, 2000);
                                            }
                                        }, 'image/png');
                                    }).catch(() => {
                                        exportWrapper.remove();
                                        bIcon.textContent = 'error';
                                        bIcon.style.animation = 'none';
                                        bIcon.style.color = 'var(--color-red)';
                                        setTimeout(() => { bIcon.textContent = origIcon; bIcon.style.color = 'var(--color-text-secondary)'; }, 2000);
                                    });
                                };

                                if (typeof html2canvas === 'undefined' && !window.html2canvas) {
                                    const script = document.createElement('script');
                                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; applySri(script);
                                    script.onload = () => executeShare();
                                    document.head.appendChild(script);
                                } else {
                                    executeShare();
                                }
                            };
                        }
                    }

                    overlay.classList.add('active');
                    modal.classList.add('active');
                    document.body.classList.add('modal-open-body');
                } catch (e) {
                    console.error('Analytics error:', e);
                }
            };

            if (getChartLib()) {
                renderAnalytics();
            } else {
                const origHtml = btn.innerHTML;
                btn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite; font-size: 1.9rem;">sync</span>';
                btn.style.pointerEvents = 'none';

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'; applySri(script);
                script.onload = () => {
                    btn.innerHTML = origHtml;
                    btn.style.pointerEvents = 'auto';
                    renderAnalytics();
                };
                script.onerror = () => {
                    btn.innerHTML = origHtml;
                    btn.style.pointerEvents = 'auto';
                    alert('Не удалось загрузить Chart.js.');
                };
                document.head.appendChild(script);
            }
        });

        // --- ШАГ 4. ЛОГИКА ФИЛЬТРАЦИИ ПОИСКА ПО ПРЕДМЕТАМ ---
        if (searchContainer) {
            const filterInput = searchContainer.querySelector('.signs-local-input');
            if (filterInput) {
                filterInput.addEventListener('input', (e) => {
                    const val = e.target.value.toLowerCase().trim();
                    const headers = document.querySelectorAll('.session-term-header-group');
                    const wrappers = document.querySelectorAll('.session-term-table-group');

                    headers.forEach((header, index) => {
                        const wrapper = wrappers[index];
                        if (!wrapper) return;

                        // Чтение метаданных периода текущего блока (например, "1 триместр, 1 курс")
                        const termName = (wrapper.getAttribute('data-term-name') || '').toLowerCase();
                        const isPeriodMatch = val !== "" && termName.includes(val);

                        const rows = Array.from(wrapper.querySelectorAll('tbody tr'));
                        let visibleRowsCount = 0;
                        let sum = 0, count = 0, hasFail = false, hasPass = false, hasAny = false;

                        rows.forEach(row => {
                            const subject = row.cells[0]?.textContent.toLowerCase() || "";
                            const teacher = row.cells[3]?.textContent.toLowerCase() || "";

                            // Отображаем строку, если совпали метаданные периода ИЛИ название предмета/преподавателя
                            if (val === "" || subject.includes(val) || teacher.includes(val) || isPeriodMatch) {
                                row.style.display = "";
                                highlightSearchTerm(row, val);
                                visibleRowsCount++;

                                // --- ПЕРЕСЧЕТ ОЦЕНОК НА ЛЕТУ ---
                                const cells = row.querySelectorAll('td');
                                if (cells.length >= 2) {
                                    const gradeText = cells[1].textContent.trim().toLowerCase();
                                    if (gradeText && gradeText !== 'н') {
                                        hasAny = true;
                                        let num = parseInt(gradeText, 10);

                                        if (gradeText.includes('незач') || gradeText === '2') {
                                            hasFail = true;
                                            sum += 2; // Считаем незачет как 2 для аналитики
                                            count++;
                                        }
                                        else if (gradeText.includes('зач')) {
                                            hasPass = true;
                                            sum += 5; // Считаем зачет как 5
                                            count++;
                                        }
                                        else if (!isNaN(num) && num >= 3 && num <= 5) {
                                            sum += num;
                                            count++;
                                        }
                                    }
                                }
                            } else {
                                row.style.display = "none";
                            }
                        });

                        // Скрытие пустых триместров или обновление их капсул
                        if (val !== "" && visibleRowsCount === 0) {
                            header.style.setProperty('display', 'none', 'important');
                            wrapper.style.setProperty('display', 'none', 'important');
                        } else {
                            header.style.setProperty('display', 'flex', 'important');
                            wrapper.style.setProperty('display', 'block', 'important');
                            highlightSearchTerm(header, val);

                            const capsules = header.querySelectorAll('.subject-score-capsule');
                            const capsule = capsules[capsules.length - 1];

                            if (capsule && capsules.length > 0) {
                                const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
                                wrapper.setAttribute('data-term-avg', avg);

                                let currentMark = '', markColor = '', tooltipText = '';

                                if (!hasAny) {
                                    capsule.textContent = 'Нет оценок';
                                    capsule.style.background = 'var(--color-highlight)';
                                    capsule.style.color = 'var(--color-text-secondary)';
                                } else if (hasFail) {
                                    capsule.textContent = 'ДОЛГИ';
                                    capsule.style.background = 'var(--color-red)';
                                    capsule.style.color = '#fff';
                                    currentMark = '2'; markColor = 'var(--color-red)'; tooltipText = 'Есть задолженности';
                                } else if (count > 0) {
                                    capsule.textContent = `${avg} / 5`;
                                    const p = (avg / 5) * 100;
                                    if (p < 61) {
                                        capsule.style.background = 'var(--color-yellow)';
                                        capsule.style.color = '#000';
                                        currentMark = '3'; markColor = 'var(--color-warning)'; tooltipText = 'Удовлетворительно';
                                    } else if (p < 81) {
                                        capsule.style.background = '#8BC34A';
                                        capsule.style.color = '#fff';
                                        currentMark = '4'; markColor = '#8BC34A'; tooltipText = 'Хорошая сессия';
                                    } else {
                                        capsule.style.background = 'var(--color-green)';
                                        capsule.style.color = '#fff';
                                        currentMark = '5'; markColor = 'var(--color-green)'; tooltipText = avg === 5 ? 'Отличная сессия! 😎' : 'Отлично';
                                    }
                                } else if (hasPass) {
                                    capsule.textContent = 'ЗАЧЕТ';
                                    capsule.style.background = 'var(--color-green)';
                                    capsule.style.color = '#fff';
                                    currentMark = 'ЗАЧЕТ'; markColor = 'var(--color-green)'; tooltipText = 'Все зачеты сданы';
                                }

                                if (currentMark) {
                                    const tooltip = document.createElement('div');
                                    tooltip.className = 'score-tooltip';
                                    tooltip.innerHTML = `<span style="color: ${markColor}; font-size: 1.4rem;">${currentMark}</span><span style="color: var(--color-text-secondary); margin: 0 6px;">•</span>${tooltipText}`;
                                    capsule.appendChild(tooltip);
                                }
                            }
                        }
                    });
                    // Определение общей видимости строк по всем таблицам сессии
                    let totalVisible = 0;
                    document.querySelectorAll('.session-term-table-group').forEach(w => {
                        if (w.style.display !== 'none') {
                            totalVisible += w.querySelectorAll('tbody tr:not([style*="display: none"])').length;
                        }
                    });

                    updateEmptyState(pageCtx.span9, totalVisible > 0, val, 'grades');
                });
            }
        }

        // --- ОФОРМЛЕНИЕ ПАМЯТКИ ТОЛЬКО ДЛЯ СЕССИЙ ---
        const sessionFooterP = pageCtx.span9.querySelector('p');
        if (sessionFooterP && sessionFooterP.textContent.includes('Показанные здесь оценки являются официальными')) {
            const infoBox = document.createElement('div');
            infoBox.className = 'etis-official-notice';
            infoBox.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large) !important; box-shadow: var(--shadow-main); padding: 2.6rem !important; margin-top: 4rem; text-align: left !important; color: var(--color-text-primary); border: 1px solid var(--color-table-border); line-height: 1.6;';

            let rawHTML = sessionFooterP.innerHTML.replace(/&nbsp;/g, '').trim();
            let lines = rawHTML.split(/<br\s*\/?>/i).map(l => l.trim()).filter(l => l.length > 0);
            let processedContent = '';

            lines.forEach(line => {
                if (line.match(/^\d\./)) {
                    processedContent += `<div style="margin-bottom: 12px; padding-left: 28px; position: relative; font-size: 1.35rem;"><span style="position: absolute; left: 0; font-weight: 800; color: var(--color-accent);">${line.charAt(0)}</span>${line.substring(2)}</div>`;
                } else if (line.toLowerCase().includes('порядок уточнения')) {
                    processedContent += `<div style="font-weight: 800; margin: 20px 0 15px; font-size: 1.4rem; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${line}</div>`;
                } else {
                    processedContent += `<p style="margin-bottom: 16px; opacity: 0.9; font-size: 1.35rem;">${line}</p>`;
                }
            });

            infoBox.innerHTML = `<div style="display:flex; align-items:center; gap:12px; margin-bottom:22px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;"><span class="material-icons" style="color:var(--color-accent); font-size: 26px;">gavel</span>Важная информация об оценках</div><div style="text-align: left !important;">${processedContent}</div>`;
            sessionFooterP.replaceWith(infoBox);
        }

    }
}
