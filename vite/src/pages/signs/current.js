import { pageCtx } from '../../app/context.js';
import { generalConfig } from '../../core/config.js';
import { updateEmptyState } from '../../ui/empty-state.js';
import { highlightSearchTerm } from '../../ui/search-highlight.js';
import { getTermWord } from '../../utils/term-system.ts';

// Оформляет страницу текущих оценок (контрольных точек), поиск, рейтинг предметов и пересчет баллов.
export function renderCurrentSigns() {
    if (pageCtx.pageMode === 'current') {

        const submenus = pageCtx.span9.querySelectorAll('.submenu');
        const lastSubmenu = submenus[submenus.length - 1];

        const searchContainer = document.createElement('div');
        searchContainer.className = 'term-controls-wrapper';

        searchContainer.innerHTML = `
                                <!-- 1. Обычное состояние: Семестры + Кнопки -->
                                <div class="term-default-bar">
                                    <div class="term-semesters-capsule" id="term-semesters-track"></div>
                                    <div class="term-actions-capsule">
                                        <button type="button" class="term-action-btn" id="term-search-open-btn" title="Поиск">
                                            <span class="material-icons">search</span>
                                        </button>
                                        <div class="term-actions-divider"></div>
                                        <button type="button" class="term-action-btn analytics-btn" id="term-top-btn" title="Топ предметов">
                                            <span class="material-icons">emoji_events</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- 2. Состояние поиска: Инпут + Кнопка закрытия -->
                                <div class="term-search-bar">
                                    <div class="term-search-input-capsule">
                                        <span class="material-icons">search</span>
                                        <input type="text" class="term-local-input" placeholder="Поиск...">
                                    </div>
                                    <div class="term-search-close-capsule">
                                        <button type="button" class="term-action-btn" id="term-search-close-btn" title="Закрыть поиск">
                                            <span class="material-icons">close</span>
                                        </button>
                                    </div>
                                </div>
                            `;

        if (lastSubmenu) {
            const track = searchContainer.querySelector('#term-semesters-track');
            while (lastSubmenu.firstChild) {
                track.appendChild(lastSubmenu.firstChild);
            }
            lastSubmenu.replaceWith(searchContainer);
        } else {
            pageCtx.span9.prepend(searchContainer);
        }

        const searchOpenBtn = searchContainer.querySelector('#term-search-open-btn');
        const searchCloseBtn = searchContainer.querySelector('#term-search-close-btn');
        const termInput = searchContainer.querySelector('.term-local-input');

        searchOpenBtn.onclick = () => {
            searchContainer.classList.add('is-searching');
            termInput.focus();
            setTimeout(() => termInput.focus(), 150);
        };

        searchCloseBtn.onclick = () => {
            searchContainer.classList.remove('is-searching');
            termInput.value = '';
            termInput.dispatchEvent(new Event('input'));
        };

        const autoSearchTerm = sessionStorage.getItem('etis_auto_search_grade');
        if (autoSearchTerm && searchContainer && termInput) {
            sessionStorage.removeItem('etis_auto_search_grade');
            searchContainer.classList.add('is-searching');
            termInput.value = autoSearchTerm;
            setTimeout(() => termInput.dispatchEvent(new Event('input')), 120);
        }

        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') searchCloseBtn.click();
        });

        pageCtx.span9.querySelectorAll('table.common').forEach(table => {
            table.classList.add('term-table-v6');
            if (!table.parentNode.classList.contains('wide-table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper term-subject-group';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }

            const wrapper = table.closest('.wide-table-wrapper');
            const h3 = wrapper.previousElementSibling;
            if (!h3 || h3.tagName !== 'H3') return;

            const rows = Array.from(table.querySelectorAll('tr'));
            const totalRow = rows.find(r => r.textContent.toLowerCase().includes('всего:'));

            // Проверяем, есть ли реальные строки с оценками (не заголовки и не пустые заглушки)
            const dataRows = rows.filter(r => {
                if (r === totalRow || r.querySelector('th')) return false;
                const text = r.textContent.trim().toLowerCase();
                if (text.includes('нет данных') || text.includes('не назначены') || text === '') return false;
                return r.querySelectorAll('td').length >= 3;
            });

            const isEmptySubject = dataRows.length === 0;

            let calculatedCurrent = 0, calculatedMax = 0, hasAnyGrades = false;
            let isZachet = false;

            if (isEmptySubject) {
                table.querySelectorAll('tr:not(:has(th))').forEach(r => r.remove());
                if (totalRow) totalRow.remove();

                // В шапке оставляем только "Тема" и "Оценка"
                const headerRows = Array.from(table.querySelectorAll('tr:has(th)'));
                headerRows.forEach((hRow, hIdx) => {
                    const ths = hRow.querySelectorAll('th');
                    if (hIdx === 0) {
                        let lastTh = null;
                        ths.forEach(th => {
                            const text = th.textContent.toLowerCase().trim();
                            if (text.includes('тема') || text.includes('оценка')) {
                                th.style.display = '';
                                th.removeAttribute('rowspan');
                                th.removeAttribute('colspan');
                                if (text.includes('оценка')) lastTh = th;
                            } else {
                                th.style.display = 'none';
                            }
                        });
                        if (lastTh) lastTh.classList.add('align-right-cell');
                    } else {
                        // Вторая строка шапки ("текущий / максимальный") скрывается
                        hRow.style.display = 'none';
                    }
                });

                const tbody = table.querySelector('tbody') || table;

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
                rows.forEach(r => {
                    if (r === totalRow) return;

                    const cells = r.querySelectorAll('th, td');

                    if (cells.length >= 7 && cells[2]) {
                        if (cells[2].textContent.toLowerCase().includes('зачет') || cells[2].textContent.toLowerCase().includes('зачёт')) {
                            isZachet = true;
                        }
                    }

                    if (generalConfig.compactGrades) {
                        const cfg = generalConfig.compactGradesConfig;

                        if (cells.length === 2 && cells[0].textContent.toLowerCase().includes('текущий')) {
                            if (!cfg.showRating) r.style.display = 'none';
                        } else if (r.querySelector('th') && cells.length >= 7) {
                            cells.forEach((cell) => {
                                const text = cell.textContent.toLowerCase();
                                if (text.includes('вид работы') && !cfg.showWorkType) cell.style.display = 'none';
                                if (text.includes('вид контроля') && !cfg.showControlType) cell.style.display = 'none';
                                if (text.includes('проходной') && !cfg.showPassScore) cell.style.display = 'none';
                                if (text.includes('в рейтинг') && !cfg.showRating) cell.style.display = 'none';
                                if (text.includes('дата') && !cfg.showDate) cell.style.display = 'none';
                                if (text.includes('преподаватель') && !cfg.showTeacher) cell.style.display = 'none';

                                if (!cfg.showRating) {
                                    cell.removeAttribute('rowspan');
                                    cell.removeAttribute('colspan');
                                }
                            });
                        } else if (cells.length >= 7) {
                            cells.forEach((cell, idx) => {
                                if (idx === 1 && !cfg.showWorkType) cell.style.display = 'none';
                                if (idx === 2 && !cfg.showControlType) cell.style.display = 'none';
                                if (idx === 4 && !cfg.showPassScore) cell.style.display = 'none';
                                if ((idx === 5 || idx === 6) && !cfg.showRating) cell.style.display = 'none';
                                if (idx === 7 && !cfg.showDate) cell.style.display = 'none';
                                if (idx === 8 && !cfg.showTeacher) cell.style.display = 'none';

                                if (idx === 3) {
                                    cell.style.width = '1%';
                                    cell.style.whiteSpace = 'nowrap';
                                }
                            });
                        }
                    }

                    let lastVisibleCell = null;
                    cells.forEach(cell => {
                        if (cell.style.display !== 'none') lastVisibleCell = cell;
                    });
                    if (lastVisibleCell) lastVisibleCell.classList.add('align-right-cell');

                    if (r.querySelector('th')) return;

                    if (cells.length > 1) {
                        let typeText = cells[1].textContent.trim().toLowerCase();
                        if (typeText) {
                            let bg = 'var(--color-highlight)', color = 'var(--color-text-secondary)';
                            if (typeText === 'лек') { bg = 'rgba(0, 122, 255, 0.1)'; color = 'var(--color-blue)'; }
                            else if (typeText === 'практ') { bg = 'rgba(52, 199, 89, 0.1)'; color = 'var(--color-green)'; }
                            else if (typeText === 'лаб') { bg = 'rgba(255, 149, 0, 0.1)'; color = 'var(--color-warning)'; }
                            else if (typeText === 'сам') { bg = 'rgba(175, 82, 222, 0.15)'; color = '#AF52DE'; }

                            cells[1].innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.4rem 0.8rem; border-radius: 50px; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">${typeText}</span>`;
                        }
                    }

                    if (cells.length > 2) {
                        let ctrlText = cells[2].textContent.trim();
                        if (ctrlText) {
                            ctrlText = ctrlText.replace(/контрольное мероприятие/ig, 'КМ');
                            ctrlText = ctrlText.charAt(0).toUpperCase() + ctrlText.slice(1);
                            cells[2].innerHTML = `<span style="color: var(--color-text-secondary); font-size: 1.25rem; font-weight: 500; white-space: nowrap;">${ctrlText}</span>`;
                        }
                    }

                    if (cells.length >= 7) {
                        const gradeStr = cells[3].textContent.trim();
                        const maxStr = cells[6].textContent.trim();

                        r.setAttribute('data-raw-grade', gradeStr);
                        r.setAttribute('data-raw-max', maxStr);

                        const maxVal = parseFloat(maxStr.replace(',', '.')) || 0;

                        if (gradeStr !== '' && gradeStr !== '-' && gradeStr !== '—') {
                            hasAnyGrades = true;

                            if (maxVal > 0) {
                                calculatedMax += maxVal;
                                if (gradeStr !== 'н') {
                                    calculatedCurrent += parseFloat(gradeStr.replace(',', '.')) || 0;
                                }
                            }

                            if (gradeStr !== 'н') {
                                if (!cells[3].querySelector('.kt-score-capsule')) {
                                    let bg, color, mark = '';
                                    const gradeVal = parseFloat(gradeStr.replace(',', '.')) || 0;

                                    if (maxVal > 0) {
                                        const p = (gradeVal / maxVal) * 100;
                                        if (p < 41) { bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)'; mark = '2'; }
                                        else if (p < 61) { bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)'; mark = '3'; }
                                        else if (p < 81) { bg = 'rgba(139, 195, 74, 0.15)'; color = '#8BC34A'; mark = '4'; }
                                        else { bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)'; mark = '5'; }
                                    } else {
                                        bg = 'rgba(142, 142, 147, 0.15)'; color = 'var(--color-text-secondary)';
                                    }

                                    let tooltipHtml = '';
                                    if (maxVal > 0) {
                                        tooltipHtml = `<div class="score-tooltip grade-cell-tooltip"><span style="color: ${color}; font-size: 1.4rem;">${mark}</span><span style="color: var(--color-text-secondary); margin: 0 6px;">•</span>${gradeVal} из ${maxVal}</div>`;
                                    }

                                    const originalContent = cells[3].innerHTML;
                                    cells[3].innerHTML = `<span class="kt-score-capsule" style="background: ${bg}; color: ${color}; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; display: inline-flex; align-items: center; justify-content: center; min-width: 24px;">${originalContent}${tooltipHtml}</span>`;

                                    const innerSpan = cells[3].querySelector('span span');
                                    if (innerSpan) innerSpan.style.borderBottom = 'none';
                                }
                            } else {
                                if (!cells[3].querySelector('.kt-score-capsule')) {
                                    cells[3].innerHTML = `<span class="kt-score-capsule" style="background: rgba(255, 59, 48, 0.15); color: var(--color-red); padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; display: inline-block; text-align: center; min-width: 24px;">н</span>`;
                                }
                            }
                        } else {
                            if (!cells[3].querySelector('.kt-score-capsule')) {
                                cells[3].innerHTML = `<span class="kt-score-capsule" style="background: rgba(142, 142, 147, 0.15); color: var(--color-text-secondary); padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.15rem; display: inline-block; text-align: center; min-width: 24px; white-space: nowrap;">Неизвестно</span>`;
                            }
                        }
                    }
                });

                if (totalRow) totalRow.remove();
            }

            const subjectsReportType = JSON.parse(localStorage.getItem('etis_subjects_report_type_v1') || '{}');
            const cleanSubjName = h3.textContent.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

            if (subjectsReportType[cleanSubjName] === 'зачет') {
                isZachet = true;
            } else {
                for (const [savedSubj, type] of Object.entries(subjectsReportType)) {
                    if (savedSubj === cleanSubjName || savedSubj.includes(cleanSubjName) || cleanSubjName.includes(savedSubj)) {
                        if (type === 'зачет') isZachet = true;
                        break;
                    }
                }
            }

            wrapper.setAttribute('data-subject-name', h3.textContent.trim());
            wrapper.setAttribute('data-score-current', calculatedCurrent);
            wrapper.setAttribute('data-score-max', calculatedMax);
            wrapper.setAttribute('data-is-zachet', isZachet ? 'true' : 'false');

            const headerContainer = document.createElement('div');
            headerContainer.className = 'subject-header-flex term-header-group';
            h3.parentNode.insertBefore(headerContainer, h3);
            headerContainer.appendChild(h3);

            const finalMax = generalConfig.absoluteScores ? 100 : calculatedMax;

            const capsule = document.createElement('div');
            capsule.className = 'subject-score-capsule';

            if (isEmptySubject || !hasAnyGrades || finalMax === 0) {
                capsule.textContent = 'Нет оценок';
                capsule.style.background = 'var(--color-highlight)';
                capsule.style.color = 'var(--color-text-secondary)';
            } else {
                capsule.textContent = `${calculatedCurrent} / ${finalMax}`;
                const p = (calculatedCurrent / finalMax) * 100;
                if (p < 41) capsule.style.background = 'var(--color-red)';
                else if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                else if (p < 81) capsule.style.background = '#8BC34A';
                else capsule.style.background = 'var(--color-green)';
                if (p < 41 || p >= 61) capsule.style.color = '#fff';
            }

            if (!isEmptySubject && finalMax > 0 && hasAnyGrades) {
                let tooltipText = '';
                let currentMark = '';
                let markColor = '';
                const zachetCheck = wrapper.getAttribute('data-is-zachet') === 'true';

                if (zachetCheck) {
                    if (calculatedCurrent < 41) {
                        tooltipText = `До зачета: ${41 - calculatedCurrent} б.`;
                        currentMark = 'НЕЗАЧЕТ'; markColor = 'var(--color-red)';
                    } else {
                        tooltipText = `Зачет получен! 😎`;
                        currentMark = 'ЗАЧЕТ'; markColor = 'var(--color-green)';
                    }
                } else {
                    if (calculatedCurrent < 41) {
                        tooltipText = `До тройки: ${41 - calculatedCurrent} б.`;
                        currentMark = '2'; markColor = 'var(--color-red)';
                    } else if (calculatedCurrent < 61) {
                        tooltipText = `До четверки: ${61 - calculatedCurrent} б.`;
                        currentMark = '3'; markColor = 'var(--color-warning)';
                    } else if (calculatedCurrent < 81) {
                        tooltipText = `До пятерки: ${81 - calculatedCurrent} б.`;
                        currentMark = '4'; markColor = '#8BC34A';
                    } else {
                        tooltipText = `Отлично! 😎`;
                        currentMark = '5'; markColor = 'var(--color-green)';
                    }
                }

                const tooltip = document.createElement('div');
                tooltip.className = 'score-tooltip';
                tooltip.innerHTML = `<span style="color: ${markColor}; font-size: 1.4rem;">${currentMark}</span><span style="color: var(--color-text-secondary); margin: 0 6px;">•</span>${tooltipText}`;
                capsule.appendChild(tooltip);
            }
            headerContainer.appendChild(capsule);
        });

        const hasAnyRankableSubjects = Array.from(pageCtx.span9.querySelectorAll('.term-subject-group')).some(w => {
            const max = parseInt(w.getAttribute('data-score-max'), 10) || 0;
            return max > 0;
        });

        const topBtn = searchContainer.querySelector('#term-top-btn');
        const termDivider = searchContainer.querySelector('.term-actions-divider');
        if (topBtn) {
            if (!hasAnyRankableSubjects) {
                topBtn.style.setProperty('display', 'none', 'important');
                if (termDivider) termDivider.style.setProperty('display', 'none', 'important');
            } else {
                topBtn.style.removeProperty('display');
                if (termDivider) termDivider.style.removeProperty('display');
            }
        }

        const filterInput = searchContainer.querySelector('.term-local-input');
        filterInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            const headers = document.querySelectorAll('.term-header-group');
            const wrappers = document.querySelectorAll('.term-subject-group');

            headers.forEach((header, index) => {
                const wrapper = wrappers[index];
                if (!wrapper) return;

                const h3 = header.querySelector('h3');
                const subjectName = h3 ? h3.textContent.toLowerCase() : header.textContent.toLowerCase();
                const isSubjectMatch = subjectName.includes(val);

                const rows = Array.from(wrapper.querySelectorAll('tr'));
                let visibleRowsCount = 0;
                let calculatedCurrent = 0, calculatedMax = 0, hasAnyGrades = false;

                rows.forEach(row => {
                    if (row.querySelector('th')) {
                        if (wrapper.querySelector('td[colspan]')) {
                            // Для пустых таблиц не отображаем вторую строку шапки
                            const hRowIdx = Array.from(wrapper.querySelectorAll('tr:has(th)')).indexOf(row);
                            if (hRowIdx > 0) {
                                row.style.display = 'none';
                                return;
                            }
                        } else if (generalConfig.compactGrades && !generalConfig.compactGradesConfig.showRating) {
                            const thCells = row.querySelectorAll('th');
                            if (thCells.length === 2 && thCells[0].textContent.toLowerCase().includes('текущий')) {
                                row.style.display = 'none';
                                return;
                            }
                        }
                        row.style.display = '';
                        return;
                    }

                    if (row.querySelector('td[colspan]')) {
                        if (val === "" || isSubjectMatch) {
                            row.style.display = '';
                            visibleRowsCount++;
                        } else {
                            row.style.display = 'none';
                        }
                        return;
                    }

                    const rowContent = row.textContent.toLowerCase();

                    if (val === "" || isSubjectMatch || rowContent.includes(val)) {
                        row.style.display = '';
                        visibleRowsCount++;
                        highlightSearchTerm(row, val);

                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 7) {
                            const rawGrade = (row.getAttribute('data-raw-grade') !== null 
                                ? row.getAttribute('data-raw-grade') 
                                : cells[3].textContent).trim();
                            const rawMax = (row.getAttribute('data-raw-max') !== null 
                                ? row.getAttribute('data-raw-max') 
                                : cells[6].textContent).trim();

                            const gt = rawGrade.toLowerCase();
                            const isGradeEmpty = !gt || gt === '-' || gt === '—' || gt.includes('неизвестно') || gt.includes('нет');

                            if (!isGradeEmpty) {
                                hasAnyGrades = true;
                                const maxVal = parseFloat(rawMax.replace(',', '.')) || 0;

                                if (maxVal > 0) {
                                    calculatedMax += maxVal;
                                    if (gt !== 'н') {
                                        calculatedCurrent += parseFloat(rawGrade.replace(',', '.')) || 0;
                                    }
                                }
                            }
                        }
                    } else {
                        row.style.display = 'none';
                        highlightSearchTerm(row, '');
                    }
                });

                if (val !== "" && !isSubjectMatch && visibleRowsCount === 0) {
                    header.style.setProperty('display', 'none', 'important');
                    wrapper.style.setProperty('display', 'none', 'important');
                } else {
                    header.style.setProperty('display', 'flex', 'important');
                    wrapper.style.setProperty('display', 'block', 'important');
                    highlightSearchTerm(header, val);

                    const capsule = header.querySelector('.subject-score-capsule');
                    if (capsule) {
                        wrapper.setAttribute('data-score-current', calculatedCurrent);
                        wrapper.setAttribute('data-score-max', calculatedMax);

                        const finalMaxFiltered = generalConfig.absoluteScores 
                            ? (hasAnyGrades && calculatedMax > 0 ? 100 : 0) 
                            : calculatedMax;

                        if (!hasAnyGrades || finalMaxFiltered === 0) {
                            capsule.textContent = 'Нет оценок';
                            capsule.style.background = 'var(--color-highlight)';
                            capsule.style.color = 'var(--color-text-secondary)';
                            const oldTooltip = capsule.querySelector('.score-tooltip');
                            if (oldTooltip) oldTooltip.remove();
                        } else {
                            capsule.textContent = `${calculatedCurrent} / ${finalMaxFiltered}`;
                            const p = (calculatedCurrent / finalMaxFiltered) * 100;
                            if (p < 41) capsule.style.background = 'var(--color-red)';
                            else if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                            else if (p < 81) capsule.style.background = '#8BC34A';
                            else capsule.style.background = 'var(--color-green)';

                            if (p < 41 || p >= 61) capsule.style.color = '#fff';

                            let tooltipText = '';
                            let currentMark = '';
                            let markColor = '';
                            const zachetCheck = wrapper.getAttribute('data-is-zachet') === 'true';

                            if (zachetCheck) {
                                if (calculatedCurrent < 41) {
                                    tooltipText = `До зачета: ${41 - calculatedCurrent} б.`;
                                    currentMark = 'НЕЗАЧЕТ'; markColor = 'var(--color-red)';
                                } else {
                                    tooltipText = `Зачет получен! 😎`;
                                    currentMark = 'ЗАЧЕТ'; markColor = 'var(--color-green)';
                                }
                            } else {
                                if (calculatedCurrent < 41) {
                                    tooltipText = `До тройки: ${41 - calculatedCurrent} б.`;
                                    currentMark = '2'; markColor = 'var(--color-red)';
                                } else if (calculatedCurrent < 61) {
                                    tooltipText = `До четверки: ${61 - calculatedCurrent} б.`;
                                    currentMark = '3'; markColor = 'var(--color-warning)';
                                } else if (calculatedCurrent < 81) {
                                    tooltipText = `До пятерки: ${81 - calculatedCurrent} б.`;
                                    currentMark = '4'; markColor = '#8BC34A';
                                } else {
                                    tooltipText = `Отлично! 😎`;
                                    currentMark = '5'; markColor = 'var(--color-green)';
                                }
                            }

                            const oldTooltip = capsule.querySelector('.score-tooltip');
                            if (oldTooltip) oldTooltip.remove();

                            const tooltip = document.createElement('div');
                            tooltip.className = 'score-tooltip';
                            tooltip.innerHTML = `<span style="color: ${markColor}; font-size: 1.4rem;">${currentMark}</span><span style="color: var(--color-text-secondary); margin: 0 6px;">•</span>${tooltipText}`;
                            capsule.appendChild(tooltip);
                        }
                    }
                }
            });

            let totalVisible = 0;
            document.querySelectorAll('.term-subject-group').forEach(w => {
                if (w.style.display !== 'none') {
                    totalVisible += w.querySelectorAll('tbody tr:not([style*="display: none"]):not(:has(th))').length;
                }
            });

            updateEmptyState(pageCtx.span9, totalVisible > 0, val, 'grades');
        });

        let overlay = document.querySelector('.analytics-overlay');
        let modal = document.querySelector('.analytics-modal');

        if (!overlay || !modal) {
            overlay = document.createElement('div');
            overlay.className = 'analytics-overlay';
            document.body.appendChild(overlay);

            modal = document.createElement('div');
            modal.className = 'analytics-modal';
            document.body.appendChild(modal);
        }

        searchContainer.querySelector('.analytics-btn').addEventListener('click', () => {
            modal.innerHTML = `
                                    <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                                        <span class="ui-dialog-title">Топ предметов ${getTermWord('gen_sg')}</span>
                                        <span class="close-analytics material-icons" style="color:var(--color-text-secondary); font-size:24px; cursor:pointer; user-select:none; transition: color 0.2s;">close</span>
                                    </div>
                                    <div class="ui-dialog-content" style="padding: 2.4rem;">
                                        <div id="analytics-empty" style="display:none; text-align:center; padding: 3rem; color:var(--color-text-secondary); font-size:1.4rem;">
                                            Недостаточно данных (баллов) для построения рейтинга.
                                        </div>
                                        <div id="analytics-content">
                                            <!-- Здесь будет сгенерированный список -->
                                        </div>
                                    </div>
                                `;

            modal.querySelectorAll('.close-analytics').forEach(btn => {
                btn.addEventListener('mouseenter', () => btn.style.color = 'var(--color-accent)');
                btn.addEventListener('mouseleave', () => btn.style.color = 'var(--color-text-secondary)');
            });

            // Закрывает модальное окно рейтинга предметов.
            const closeAnalytics = () => {
                overlay.classList.remove('active');
                modal.classList.remove('active');
                document.body.classList.remove('modal-open-body');
            };
            overlay.onclick = closeAnalytics;
            modal.querySelector('.close-analytics').onclick = closeAnalytics;

            const subjectsData =[];
            document.querySelectorAll('.term-subject-group').forEach(wrapper => {
                const name = wrapper.getAttribute('data-subject-name');
                const current = parseInt(wrapper.getAttribute('data-score-current'), 10) || 0;
                const max = parseInt(wrapper.getAttribute('data-score-max'), 10) || 0;

                if (max > 0) {
                    const percent = Math.round((current / max) * 100);
                    // Чистим название от мусора ЕТИСа, если есть
                    let cleanName = name.replace(/\[.*?\]/g, '').trim();
                    subjectsData.push({ name: cleanName, current, max, percent });
                }
            });

            subjectsData.sort((a, b) => b.percent - a.percent);

            if (subjectsData.length === 0) {
                document.getElementById('analytics-content').style.display = 'none';
                document.getElementById('analytics-empty').style.display = 'block';
            } else {
                document.getElementById('analytics-content').style.display = 'block';
                document.getElementById('analytics-empty').style.display = 'none';

                let leaderboardHtml = '<div class="leaderboard-list">';

                subjectsData.forEach((subj, index) => {
                    let rankClass = '';
                    let rankContent = index + 1;

                    if (index === 0) { rankClass = 'rank-1'; }
                    else if (index === 1) { rankClass = 'rank-2'; }
                    else if (index === 2) { rankClass = 'rank-3'; }

                    let colorBg = 'var(--color-green)';
                    if (subj.percent < 41) colorBg = 'var(--color-red)';
                    else if (subj.percent < 61) colorBg = 'var(--color-yellow)';
                    else if (subj.percent < 81) colorBg = '#8BC34A';

                    let colorText = (subj.percent >= 41 && subj.percent < 61) ? '#000' : '#fff';

                    leaderboardHtml += `
                                            <div class="leaderboard-item">
                                                <div class="leaderboard-rank ${rankClass}">${rankContent}</div>
                                                <div class="leaderboard-info">
                                                    <div class="leaderboard-name">${subj.name}</div>
                                                    <div class="leaderboard-meta">Набрано: ${subj.current} из ${subj.max}</div>
                                                </div>
                                                <div class="subject-score-capsule" style="background:${colorBg}; color:${colorText}; font-size:1.25rem; padding: 0.6rem 1.2rem; margin-left: 0;">
                                                    ${subj.percent}%
                                                </div>
                                            </div>
                                        `;
                });
                leaderboardHtml += '</div>';

                document.getElementById('analytics-content').innerHTML = leaderboardHtml;
            }

            overlay.classList.add('active');
            modal.classList.add('active');

            document.body.classList.add('modal-open-body');
        });

        const currentFooterP = pageCtx.span9.querySelector('p');
        if (currentFooterP && currentFooterP.textContent.includes('Показанные здесь оценки являются официальными')) {
            const infoBox = document.createElement('div');
            infoBox.className = 'etis-official-notice';
            infoBox.style.cssText = `
                                    background: var(--color-card);
                                    border-radius: var(--radius-large) !important;
                                    box-shadow: var(--shadow-main);
                                    padding: 2.6rem !important;
                                    margin-top: 4rem;
                                    text-align: left !important;
                                    color: var(--color-text-primary);
                                    border: 1px solid var(--color-table-border);
                                    line-height: 1.6;
                                `;

            let rawHTML = currentFooterP.innerHTML.replace(/&nbsp;/g, '').trim();
            let lines = rawHTML.split(/<br\s*\/?>/i).map(l => l.trim()).filter(l => l.length > 0);

            let processedContent = '';
            lines.forEach(line => {
                if (line.match(/^\d\./)) {
                    processedContent += `
                                            <div style="margin-bottom: 12px; padding-left: 28px; position: relative; font-size: 1.35rem;">
                                                <span style="position: absolute; left: 0; font-weight: 800; color: var(--color-accent);">${line.charAt(0)}</span>
                                                ${line.substring(2)}
                                            </div>`;
                }
                else if (line.toLowerCase().includes('порядок уточнения')) {
                    processedContent += `<div style="font-weight: 800; margin: 20px 0 15px; font-size: 1.4rem; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${line}</div>`;
                }
                else {
                    processedContent += `<p style="margin-bottom: 16px; opacity: 0.9; font-size: 1.35rem;">${line}</p>`;
                }
            });

            infoBox.innerHTML = `
                                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:22px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                        <span class="material-icons" style="color:var(--color-accent); font-size: 26px;">gavel</span>
                                        Важная информация об оценках
                                    </div>
                                    <div style="text-align: left !important;">
                                        ${processedContent}
                                    </div>
                                `;

            currentFooterP.replaceWith(infoBox);
        }

    }
}
