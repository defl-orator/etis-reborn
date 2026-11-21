import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';
import { highlightSearchTerm } from '../ui/search-highlight.js';
import { escapeHTML } from '../utils/security.ts';

// Оформляет страницу учебного плана, факультативов, элективов и выбора дисциплин
export function renderTeachPlanPage() {
    const params = new URLSearchParams(window.location.search);
    const currentMode = params.get('p_mode');
    const isAdvanced = currentMode === 'advanced';
    const isChooseDis = currentMode === 'choose_dis';
    const isShortPlan = pageCtx.page === 'stu.teach_plan' && !isAdvanced && !isChooseDis;

    let submenu = pageCtx.span9.querySelector('.submenu');
    const planEvalBtn = pageCtx.span9.querySelector('a[onclick*="cust.est_plan_form_stu"], a[href*="cust.est_plan_form_stu"]');
    if (planEvalBtn) {
        planEvalBtn.className = 'eval-plan-link';
        planEvalBtn.innerHTML = 'Оценить учебный план';
    }

    if (isShortPlan) {
        const controlsWrapper = document.createElement('div');
        controlsWrapper.className = 'plan-controls-wrapper';
        controlsWrapper.innerHTML = `
                                <div class="plan-default-bar">
                                    <div class="plan-submenu-track" id="plan-submenu-track">
                                        <a href="stu.teach_plan?p_mode=advanced">Подробно</a>
                                        <b>Кратко</b>
                                        <a href="stu.fcl_choice">Факультативы</a>
                                        <a href="ebl_stu.ebl_choice">Элективы</a>
                                        <a href="stu.teach_plan?p_mode=choose_dis">Дисциплины по выбору</a>
                                    </div>
                                    <button type="button" class="plan-search-circle-btn" id="plan-search-open-btn" title="Поиск">
                                        <span class="material-icons">search</span>
                                    </button>
                                </div>
                                <div class="term-search-bar">
                                    <div class="term-search-input-capsule">
                                        <span class="material-icons">search</span>
                                        <input type="text" class="plan-local-input" placeholder="Поиск">
                                    </div>
                                    <div class="term-search-close-capsule">
                                        <button type="button" class="term-action-btn" id="plan-search-close-btn" title="Закрыть поиск">
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

        const track = controlsWrapper.querySelector('#plan-submenu-track');
        if (planEvalBtn && track) track.appendChild(planEvalBtn);

        const searchOpenBtn = controlsWrapper.querySelector('#plan-search-open-btn');
        const searchCloseBtn = controlsWrapper.querySelector('#plan-search-close-btn');
        const planInput = controlsWrapper.querySelector('.plan-local-input');

        if (searchOpenBtn && searchCloseBtn && planInput) {
            searchOpenBtn.onclick = () => {
                controlsWrapper.classList.add('is-searching');
                planInput.focus(); // Синхронный фокус
                setTimeout(() => planInput.focus(), 150);
            };
            searchCloseBtn.onclick = () => {
                controlsWrapper.classList.remove('is-searching');
                planInput.value = '';
                planInput.dispatchEvent(new Event('input'));
            };
            planInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') searchCloseBtn.click();
            });
        }
    } else {
        if (!submenu) {
            submenu = document.createElement('div');
            submenu.className = 'submenu';
            const h3 = pageCtx.span9.querySelector('h3') || pageCtx.span9.firstChild;
            if (h3 && h3.parentNode) {
                h3.parentNode.insertBefore(submenu, h3.nextSibling);
            } else {
                pageCtx.span9.prepend(submenu);
            }
        }

        submenu.innerHTML = `
                                <a href="stu.teach_plan?p_mode=advanced">Подробно</a>
                                <a href="stu.teach_plan?p_mode=short">Кратко</a>
                                <a href="stu.fcl_choice">Факультативы</a>
                                <a href="ebl_stu.ebl_choice">Элективы</a>
                                <a href="stu.teach_plan?p_mode=choose_dis">Дисциплины по выбору</a>
                            `;

        const links = Array.from(submenu.querySelectorAll('a'));
        links.forEach(link => {
            const href = link.getAttribute('href');
            let isActive = false;

            if (pageCtx.page === 'stu.teach_plan') {
                if (href.includes('p_mode=advanced') && isAdvanced) isActive = true;
                else if (href.includes('p_mode=short') && (!currentMode || currentMode === 'short')) isActive = true;
                else if (href.includes('p_mode=choose_dis') && isChooseDis) isActive = true;
            } else if ((pageCtx.page === 'stu.ebl_choice' || pageCtx.page === 'ebl_stu.ebl_choice') && href.includes('ebl_choice')) {
                isActive = true;
            } else if (pageCtx.page === 'stu.fcl_choice' && href.includes('fcl_choice')) {
                isActive = true;
            }

            if (isActive) {
                const b = document.createElement('b');
                b.textContent = link.textContent;
                link.replaceWith(b);
            }
        });

        if (planEvalBtn && submenu) submenu.appendChild(planEvalBtn);
    }

    if (pageCtx.page === 'stu.fcl_choice') {
        const allH3 = Array.from(pageCtx.span9.querySelectorAll('h3'));
        let yearTitle = 'Факультативы';
        let statusText = '';

        allH3.forEach(h3 => {
            const t = h3.textContent.trim();
            if (t.toLowerCase().includes('факультатив')) {
                yearTitle = t;
                h3.remove();
            } else if (t.toLowerCase().includes('голосован')) {
                statusText = t;
                h3.remove();
            }
        });

        const polozhLink = pageCtx.span9.querySelector('a[href*="polozh-fakultativ"]');
        const rulesUl = pageCtx.span9.querySelector('ul');
        const ruleItems = rulesUl ? Array.from(rulesUl.querySelectorAll('li')).map(li => li.textContent.trim()) : [];

        pageCtx.span9.querySelectorAll('p, ul:not(.nav), br').forEach(el => {
            if (!el.closest('.submenu')) el.remove();
        });

        const rulesCard = document.createElement('div');
        rulesCard.style.cssText = `
                                background: var(--color-card);
                                border: 1px solid var(--color-table-border);
                                border-radius: var(--radius-large);
                                box-shadow: var(--shadow-main);
                                padding: 2.4rem;
                                margin-bottom: 2rem;
                                color: var(--color-text-primary);
                                box-sizing: border-box;
                            `;

        let rulesListHtml = '';
        if (ruleItems.length > 0) {
            rulesListHtml = `
                                    <div style="display: flex; flex-direction: column; gap: 1.2rem; margin-top: 1.6rem;">
                                        ${ruleItems.map(item => {
                        const match = item.match(/^(\d+\.\d+\.?)\s*(.*)/);
                        const num = match ? match[1] : '•';
                        const text = match ? match[2] : item;
                        return `
                                                <div style="display: flex; align-items: flex-start; gap: 12px; font-size: 1.35rem; line-height: 1.5; color: var(--color-text-secondary);">
                                                    <span style="font-weight: 800; color: var(--color-accent); flex-shrink: 0; min-width: 32px;">${num}</span>
                                                    <div>${text}</div>
                                                </div>
                                            `;
                    }).join('')}
                                    </div>
                                `;
        }

        const pdfHref = polozhLink ? polozhLink.getAttribute('href') : '/polozh-fakultativ.pdf';

        rulesCard.innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.4rem; border-bottom: 1px solid var(--color-table-border); padding-bottom: 1.6rem;">
                                    <div>
                                        <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary);">${yearTitle}</div>
                                        <div style="font-size: 1.25rem; color: var(--color-text-secondary); margin-top: 4px;">Порядок освоения факультативных дисциплин в ПГНИУ</div>
                                    </div>
                                    <a href="${pdfHref}" target="_blank" class="file-attachment-link" style="margin: 0 !important; font-weight: 600; text-decoration: none;">
                                        <span class="material-icons" style="color: var(--color-red);">picture_as_pdf</span>
                                        <span class="file-name">Текст Положения</span>
                                    </a>
                                </div>
                                ${rulesListHtml}
                            `;

        pageCtx.span9.appendChild(rulesCard);

        if (statusText) {
            const isClosed = statusText.toLowerCase().includes('закрыт');
            const statusCard = document.createElement('div');
            statusCard.style.cssText = `
                                    background: ${isClosed ? 'var(--color-highlight)' : 'rgba(52, 199, 89, 0.12)'};
                                    border: 1px solid ${isClosed ? 'var(--color-table-border)' : 'rgba(52, 199, 89, 0.25)'};
                                    border-radius: var(--radius-large);
                                    padding: 1.6rem 2rem;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    box-shadow: var(--shadow-main);
                                    margin-bottom: 2rem;
                                `;

            statusCard.innerHTML = `
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${isClosed ? 'var(--color-card)' : 'rgba(52, 199, 89, 0.2)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="font-size: 22px; color: ${isClosed ? 'var(--color-text-secondary)' : 'var(--color-green)'};">${isClosed ? 'lock' : 'how_to_vote'}</span>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-size: 1.45rem; font-weight: 800; color: var(--color-text-primary);">${statusText}</div>
                                        <div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 2px;">
                                            ${isClosed ? 'Сроки подачи заявок на выбор факультативов истекли.' : 'Вы можете выбрать интересующие вас дисциплины из списка.'}
                                        </div>
                                    </div>
                                `;

            pageCtx.span9.appendChild(statusCard);
        }

        pageCtx.span9.querySelectorAll('table.common').forEach(table => {
            if (!table.parentNode.classList.contains('wide-table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });

        return;
    }

    pageCtx.span9.querySelectorAll('div[style*="inline-block"]').forEach(div => {
        div.style.display = 'block';
        div.style.width = '100%';
    });

    let subjectsReportType = JSON.parse(localStorage.getItem('etis_subjects_report_type_v1') || '{}');
    let reportDataUpdated = false;
    pageCtx.span9.querySelectorAll('table.teach_plan, table.common').forEach(table => {
        const rows = Array.from(table.querySelectorAll('tr'));
        let discIdx = -1, reportIdx = -1;
        const headers = rows[0]?.querySelectorAll('th');
        if (headers) {
            headers.forEach((th, idx) => {
                const text = th.textContent.toLowerCase();
                if (text.includes('дисциплина') || text.includes('наименование')) discIdx = idx;
                if (text.includes('отчетность')) reportIdx = idx;
            });
        }
        if (discIdx !== -1 && reportIdx !== -1) {
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells[discIdx] && cells[reportIdx]) {
                    const subjName = cells[discIdx].textContent.replace(/\s+/g, ' ').trim().toLowerCase();
                    const reportText = cells[reportIdx].textContent.toLowerCase();
                    if (subjName && reportText) {
                        if (reportText.includes('зачет') || reportText.includes('зачёт')) {
                            subjectsReportType[subjName] = 'зачет';
                            reportDataUpdated = true;
                        } else if (reportText.includes('экзамен')) {
                            subjectsReportType[subjName] = 'экзамен';
                            reportDataUpdated = true;
                        }
                    }
                }
            }
        }
    });
    if (reportDataUpdated) {
        localStorage.setItem('etis_subjects_report_type_v1', JSON.stringify(subjectsReportType));
    }

    if (pageCtx.page === 'stu.teach_plan') {
        if (isChooseDis) {
            const tpInfo = Array.from(pageCtx.span9.querySelectorAll('div')).find(d =>
                d.textContent.includes('Учебный план') && d.textContent.trim().length < 30 && d.parentNode === pageCtx.span9
            );
            const targetH3 = Array.from(pageCtx.span9.querySelectorAll('h3')).find(h => h.textContent.includes('Блоки дисциплин'));

            if (tpInfo && targetH3) {
                const headerFlex = document.createElement('div');
                headerFlex.className = 'subject-header-flex';
                headerFlex.style.marginTop = '2rem';

                const capsule = document.createElement('div');
                capsule.className = 'subject-score-capsule';
                capsule.style.background = 'var(--color-highlight)';
                capsule.style.color = 'var(--color-text-secondary)';
                capsule.style.border = '1px solid var(--color-table-border)';
                capsule.style.boxShadow = 'none';

                const tpNumber = tpInfo.textContent.replace(/Учебный план/i, '').trim();
                capsule.innerHTML = `<span class="material-icons" style="font-size:1.4rem; vertical-align: middle; margin-right:4px; opacity:0.7">info</span> План №${escapeHTML(tpNumber)}`;

                targetH3.parentNode.insertBefore(headerFlex, targetH3);
                headerFlex.appendChild(targetH3);
                headerFlex.appendChild(capsule);
                tpInfo.remove();
            }
        }

        pageCtx.span9.querySelectorAll('br').forEach((br, i) => { if(i < 3) br.remove(); });

        if (isAdvanced) {
            const calendarGrid = document.createElement('div');
            calendarGrid.className = 'calendar-grid';
            const headers = Array.from(pageCtx.span9.querySelectorAll('b')).filter(b => {
                const text = b.textContent.toLowerCase();
                return text.includes('триместр') || text.includes('семестр');
            });

            headers.forEach(header => {
                const card = document.createElement('div');
                card.className = 'calendar-card';
                const h4 = document.createElement('h4');
                h4.textContent = header.textContent.toUpperCase();
                card.appendChild(h4);
                let next = header.parentElement.tagName === 'P' ? header.parentElement : header;
                let current = next.nextSibling;
                const toRem = [header, header.parentElement];

                while (current && current.tagName !== 'TABLE' && !(current.querySelector && current.querySelector('b')?.textContent.toLowerCase().match(/триместр|семестр/))) {
                    let nxt = current.nextSibling;
                    if (current.nodeType === 1 && (current.tagName === 'DIV' || current.tagName === 'P')) {
                        const row = document.createElement('div');
                        row.className = 'calendar-event';
                        const txt = current.textContent.trim();
                        const m = txt.match(/^(\d{2}\.\d{2}\.\d{4}\s-\s\d{2}\.\d{2}\.\d{4})(.*)/);
                        if (m) row.innerHTML = `<span class="date-range">${escapeHTML(m[1])}</span><span class="event-desc">${escapeHTML(m[2].trim())}</span>`;
                        else if (txt.length > 5) row.innerHTML = `<span class="event-desc">${escapeHTML(txt)}</span>`;
                        card.appendChild(row);
                        toRem.push(current);
                    }
                    current = nxt;
                }
                if (card.children.length > 1) calendarGrid.appendChild(card);
                toRem.forEach(el => el?.remove?.());
            });

            const mainTitle = Array.from(pageCtx.span9.querySelectorAll('h3')).find(h => h.textContent.includes('Календарный учебный график'));
            if (mainTitle) mainTitle.after(calendarGrid);

            pageCtx.span9.querySelectorAll('table.teach_plan').forEach(table => {
                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            });
        }

        if (!isAdvanced && !isChooseDis) {
            pageCtx.span9.querySelectorAll('h3').forEach(h3 => {
                if (/семестр|триместр/i.test(h3.textContent)) {
                    h3.classList.add('plan-semester-header');
                }
            });

            const originalTables = Array.from(pageCtx.span9.querySelectorAll('table.teach_plan, table.common'));

            originalTables.forEach(table => {
                const allRows = Array.from(table.querySelectorAll('tr'));
                if (allRows.length === 0) return;

                const headerRows = [];
                const bodyRows = [];

                allRows.forEach(row => {
                    if (row.querySelector('th') && !row.querySelector('td')) {
                        headerRows.push(row);
                    } else {
                        bodyRows.push(row);
                    }
                });

                const isCategoryRow = (tr) => {
                    const tds = tr.querySelectorAll('td');
                    if (tds.length === 1 && tds[0].hasAttribute('colspan')) {
                        const cs = parseInt(tds[0].getAttribute('colspan'), 10);
                        return cs >= 3;
                    }
                    return false;
                };

                const sections = [];
                let currentSection = null;

                bodyRows.forEach(row => {
                    if (isCategoryRow(row)) {
                        const rawTitle = row.textContent.replace(/\s+/g, ' ').trim();
                        if (currentSection && currentSection.rows.length === 0) {
                            currentSection.title += ` • ${rawTitle}`;
                        } else {
                            currentSection = {
                                title: rawTitle,
                                rows: []
                            };
                            sections.push(currentSection);
                        }
                    } else {
                        const braceCell = row.querySelector('td[rowspan]');
                        if (braceCell && braceCell.textContent.trim() === '{') {
                            braceCell.remove();
                        }

                        const firstTd = row.querySelector('td');
                        if (firstTd) {
                            firstTd.setAttribute('colspan', '2');
                            firstTd.style.setProperty('text-align', 'left', 'important');
                            firstTd.style.setProperty('border-left', 'none', 'important');
                        }

                        if (!currentSection) {
                            currentSection = {
                                title: 'Программы дисциплин',
                                rows: []
                            };
                            sections.push(currentSection);
                        }
                        currentSection.rows.push(row);
                    }
                });

                if (sections.length === 0) return;

                const containerFragment = document.createDocumentFragment();

                sections.forEach((section, sIdx) => {
                    if (section.rows.length === 0) return;

                    const wrapper = document.createElement('div');
                    wrapper.className = 'wide-table-wrapper plan-short-table-group';
                    if (sIdx > 0) wrapper.style.marginTop = '1.8rem';

                    const newTable = document.createElement('table');
                    newTable.className = 'common';
                    newTable.style.width = '100%';

                    const thead = document.createElement('thead');
                    const singleHeaderTr = document.createElement('tr');

                    const thTitle = document.createElement('th');
                    thTitle.setAttribute('colspan', '2');
                    thTitle.textContent = section.title;
                    singleHeaderTr.appendChild(thTitle);

                    const thReport = document.createElement('th');
                    thReport.textContent = 'Отчетность';
                    singleHeaderTr.appendChild(thReport);

                    if (headerRows.length >= 2) {
                        const row2Ths = headerRows[1].querySelectorAll('th');
                        row2Ths.forEach(th => {
                            let clean = th.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
                            if (!clean.toLowerCase().includes(', ч') && !clean.toLowerCase().includes('(ч)')) {
                                clean += ', ч';
                            }
                            const newTh = document.createElement('th');
                            newTh.textContent = clean;
                            singleHeaderTr.appendChild(newTh);
                        });
                    } else {
                        ['Аудиторная работа, ч', 'Самостоятельная работа, ч', 'Всего, ч'].forEach(name => {
                            const th = document.createElement('th');
                            th.textContent = name;
                            singleHeaderTr.appendChild(th);
                        });
                    }

                    thead.appendChild(singleHeaderTr);
                    singleHeaderTr.querySelectorAll('th').forEach(th => {
                        th.style.setProperty('border-top', 'none', 'important');
                        th.style.setProperty('border-left', 'none', 'important');
                        th.style.setProperty('border-right', 'none', 'important');
                    });
                    newTable.appendChild(thead);

                    const tbody = document.createElement('tbody');
                    section.rows.forEach(row => {
                        row.querySelectorAll('td').forEach(cell => {
                            const text = cell.textContent.replace(/\s/g, '').toLowerCase();
                            let bg, color;

                            if (text === 'экзамен') {
                                bg = 'rgba(0, 122, 255, 0.15)';
                                color = 'var(--color-blue)';
                            } else if (text === 'зачет' || text === 'зачёт') {
                                bg = 'rgba(52, 199, 89, 0.15)';
                                color = 'var(--color-green)';
                            }

                            if (bg && !cell.querySelector('span')) {
                                cell.innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.4rem 1rem; border-radius: 50px; font-size: 1.1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; white-space: nowrap;">${escapeHTML(cell.textContent.trim())}</span>`;
                            }
                        });
                        tbody.appendChild(row);
                    });

                    newTable.appendChild(tbody);
                    wrapper.appendChild(newTable);
                    containerFragment.appendChild(wrapper);
                });

                table.replaceWith(containerFragment);
            });

            const planInput = pageCtx.span9.querySelector('.plan-local-input');
            if (planInput) {
                planInput.addEventListener('input', (e) => {
                    const val = e.target.value.toLowerCase().trim();

                    document.querySelectorAll('.plan-semester-header').forEach(h3 => {
                        const h3Text = h3.textContent.toLowerCase();
                        let semesterHasVisibleRows = false;

                        let next = h3.nextElementSibling;
                        while (next && !next.classList.contains('plan-semester-header') && next.tagName !== 'H3') {
                            if (next.classList.contains('plan-short-table-group')) {
                                const sectionTable = next.querySelector('table');
                                const sectionTitle = sectionTable ? (sectionTable.querySelector('thead th')?.textContent.toLowerCase() || '') : '';
                                const isSectionMatch = val !== '' && (sectionTitle.includes(val) || h3Text.includes(val));

                                const rows = Array.from(next.querySelectorAll('tbody tr'));
                                let visibleRows = [];

                                rows.forEach(row => {
                                    row.classList.remove('last-visible-row');
                                    const rowText = row.textContent.toLowerCase();
                                    if (val === '' || rowText.includes(val) || isSectionMatch) {
                                        row.style.display = '';
                                        highlightSearchTerm(row, val);
                                        visibleRows.push(row);
                                    } else {
                                        row.style.display = 'none';
                                        highlightSearchTerm(row, '');
                                    }
                                });

                                if (visibleRows.length > 0) {
                                    visibleRows[visibleRows.length - 1].classList.add('last-visible-row');
                                }

                                if (val !== '' && visibleRows.length === 0) {
                                    next.style.setProperty('display', 'none', 'important');
                                } else {
                                    next.style.setProperty('display', 'block', 'important');
                                    semesterHasVisibleRows = true;
                                }
                            }
                            next = next.nextElementSibling;
                        }

                        if (val !== '' && !semesterHasVisibleRows) {
                            h3.style.setProperty('display', 'none', 'important');
                        } else {
                            h3.style.removeProperty('display');
                            highlightSearchTerm(h3, val);
                        }
                    });

                    let totalVisible = 0;
                    document.querySelectorAll('.plan-short-table-group').forEach(w => {
                        if (w.style.display !== 'none') {
                            totalVisible += w.querySelectorAll('tbody tr:not([style*="display: none"])').length;
                        }
                    });
                    updateEmptyState(pageCtx.span9, totalVisible > 0, val, 'teach_plan');
                });
            }
        }

        if (isChooseDis) {
            pageCtx.span9.querySelectorAll('table.common').forEach(table => {
                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            });
        }
    }

    if (pageCtx.page === 'stu.ebl_choice' || pageCtx.page === 'ebl_stu.ebl_choice') {
        let noticeText = '';
        const boldNotice = Array.from(pageCtx.span9.querySelectorAll('b')).find(b => 
            b.textContent.toLowerCase().includes('элективн') || 
            b.textContent.toLowerCase().includes('учебным планом')
        );

        if (boldNotice) {
            noticeText = boldNotice.textContent.trim();
            boldNotice.remove();
        }

        pageCtx.span9.querySelectorAll('br, p:empty').forEach(el => {
            if (!el.closest('.submenu')) el.remove();
        });

        if (noticeText) {
            const noticeCard = document.createElement('div');
            noticeCard.style.cssText = `
                                    background: var(--color-card);
                                    border: 1px solid var(--color-table-border);
                                    border-radius: var(--radius-large);
                                    box-shadow: var(--shadow-main);
                                    padding: 2.4rem;
                                    margin-bottom: 2rem;
                                    display: flex;
                                    align-items: center;
                                    gap: 1.6rem;
                                    box-sizing: border-box;
                                `;

            noticeCard.innerHTML = `
                                    <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-highlight); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="font-size: 24px; color: var(--color-text-secondary);">event_busy</span>
                                    </div>
                                    <div style="flex: 1; text-align: left;">
                                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.4;">
                                            ${noticeText}
                                        </div>
                                        <div style="font-size: 1.25rem; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5;">
                                            Запись на элективные курсы для вашего курса и направления в данный момент не требуется.
                                        </div>
                                    </div>
                                `;

            pageCtx.span9.appendChild(noticeCard);
        }

        const tables = pageCtx.span9.querySelectorAll('table.common');
        tables.forEach(table => {
            if (!table.parentNode.classList.contains('wide-table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });

        const submitBtns = pageCtx.span9.querySelectorAll('input[type="submit"], button[type="submit"]');
        submitBtns.forEach(btn => {
            btn.className = 'answer-btn-custom';
            btn.style.cssText = `
                                    background: var(--color-accent) !important;
                                    color: #fff !important;
                                    padding: 1.2rem 2.4rem !important;
                                    font-size: 1.4rem !important;
                                    font-weight: 700 !important;
                                    border: none !important;
                                    border-radius: 50px !important;
                                    cursor: pointer !important;
                                    margin-top: 1.5rem !important;
                                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
                                `;
        });

        return;
    }

    return;
}
