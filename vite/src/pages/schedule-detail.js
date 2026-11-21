import { pageCtx } from '../app/context.js';
import { generalConfig } from '../core/config.js';

// Оформляет страницу подробного расписания, статистики и распределения дисциплин
export function renderScheduleDetailPage() {
    if (!document.getElementById('etis-reborn-schedule-detail-css')) {
        const css = document.createElement('style');
        css.id = 'etis-reborn-schedule-detail-css';
        css.innerHTML = `
                                .detail-schedule-grid td.pair_num {
                                    text-align: center !important;
                                    width: 95px !important;
                                    min-width: 95px !important;
                                }
                                .detail-schedule-container .day,
                                div[style*="max-width: 900px"] {
                                    border: none !important;
                                }
                                @media (min-width: 961px) {
                                    .detail-schedule-grid td.pair_teacher {
                                        width: 160px !important;
                                        min-width: 160px !important;
                                    }
                                }
                                @media (max-width: 960px) {
                                    body, .span9 {
                                        padding-left: 1.6rem !important;
                                        padding-right: 1.6rem !important;
                                        box-sizing: border-box !important;
                                    }
                                    .detail-schedule-container .day h3 {
                                        padding: 1.2rem 1.4rem !important;
                                        font-size: 1.4rem !important;
                                        flex-wrap: nowrap !important;
                                    }
                                }
                                .detail-schedule-container .day h3 {
                                    display: flex !important;
                                    align-items: center !important;
                                    justify-content: space-between !important;
                                    padding: 1.6rem 2rem !important;
                                    background: var(--color-table-header) !important;
                                    border-bottom: 1px solid var(--color-table-border) !important;
                                    margin: 0 !important;
                                    font-size: 1.6rem !important;
                                    border-radius: 23px 23px 0 0 !important;
                                }
                                .umk-tooltip-wrapper {
                                    position: relative;
                                    display: inline-flex;
                                    align-items: center;
                                    cursor: help;
                                }
                                .umk-tooltip {
                                    position: absolute;
                                    left: 100%;
                                    top: 50%;
                                    transform: translateY(-50%) translateX(8px);
                                    background: #2A2C2F;
                                    color: #fff;
                                    padding: 0.8rem 1.2rem;
                                    border-radius: var(--radius-small);
                                    font-size: 1.2rem;
                                    font-weight: 600;
                                    white-space: nowrap;
                                    opacity: 0;
                                    visibility: hidden;
                                    transition: all 0.2s ease;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                                    z-index: 100000;
                                    pointer-events: none;
                                }
                                .umk-tooltip::after {
                                    content: '';
                                    position: absolute;
                                    top: 50%;
                                    right: 100%;
                                    left: auto;
                                    transform: translateY(-50%);
                                    border-width: 5px;
                                    border-style: solid;
                                    border-color: transparent #2A2C2F transparent transparent;
                                }
                                .umk-tooltip-wrapper:hover .umk-tooltip,
                                .umk-tooltip-wrapper:active .umk-tooltip {
                                    opacity: 1;
                                    visibility: visible;
                                    transform: translateY(-50%) translateX(4px);
                                }
                            `;
        document.head.appendChild(css);
    }

    const container = pageCtx.span9 || document.body;
    if (!pageCtx.span9) {
        document.body.style.padding = '2rem';
        document.body.style.maxWidth = '1120px';
        document.body.style.margin = '0 auto';
    }

    container.querySelectorAll('br, style').forEach(el => el.remove());

    const allH1 = container.querySelectorAll('h1');
    const mainTitle = allH1[0];
    const h2 = container.querySelector('h2');

    let headerTitle = '';
    if (mainTitle && mainTitle.textContent.includes('Группа')) {
        headerTitle = mainTitle.textContent.trim();
        mainTitle.remove();
    }

    allH1.forEach(h1 => {
        if (h1.textContent.includes('Распределение')) h1.remove();
    });

    let startWeekDateGlobal = null;
    if (h2) {
        const dateMatchStr = h2.textContent.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*\d{2}\.\d{2}\.\d{4}/);
        if (dateMatchStr) {
            startWeekDateGlobal = new Date(parseInt(dateMatchStr[3]), parseInt(dateMatchStr[2]) - 1, parseInt(dateMatchStr[1]));
        }

        const navCard = document.createElement('div');
        navCard.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large); box-shadow: var(--shadow-main); padding: 1.6rem 2.4rem; margin: 2rem auto 2.4rem auto; max-width: 900px; display: flex; flex-direction: column; gap: 1.6rem; box-sizing: border-box;';

        const links = h2.querySelectorAll('a');
        let prevLink = null, nextLink = null;
        links.forEach(a => {
            if (a.querySelector('img[src*="back"]')) prevLink = a;
            if (a.querySelector('img[src*="forward"]')) nextLink = a;
        });

        let textContent = h2.innerHTML;
        if (prevLink) textContent = textContent.replace(prevLink.outerHTML, '');
        if (nextLink) textContent = textContent.replace(nextLink.outerHTML, '');
        textContent = textContent.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();

        const dateMatch = textContent.match(/(.*?)\s*\((.*?)\)/);
        let formattedDate = textContent;
        if (dateMatch) {
            formattedDate = `<div style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary);">${dateMatch[1].trim()}</div><div style="font-size: 1.2rem; color: var(--color-text-secondary); font-weight: 600; margin-top: 4px;">${dateMatch[2].trim()}</div>`;
        }

        const createNavBtn = (aNode, iconName) => {
            if (!aNode) return '<div style="width: 44px;"></div>';
            return `<a href="${aNode.href}" class="answer-btn-custom" style="padding: 0; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; box-shadow: none !important;"><span class="material-icons" style="font-size: 2rem;">${iconName}</span></a>`;
        };

        navCard.innerHTML = `
                                ${headerTitle ? `<div style="font-size: 1.35rem; color: var(--color-text-secondary); font-weight: 600; border-bottom: 1px solid var(--color-table-border); padding-bottom: 1.4rem; margin-bottom: 0.4rem; line-height: 1.4;">${headerTitle}</div>` : ''}
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    ${createNavBtn(prevLink, 'arrow_back_ios_new')}
                                    <div style="text-align: center; line-height: 1.2;">${formattedDate}</div>
                                    ${createNavBtn(nextLink, 'arrow_forward_ios')}
                                </div>
                            `;

        h2.replaceWith(navCard);
    }

    const statsHeader = Array.from(container.querySelectorAll('b')).find(b => b.textContent.includes('На выбранной неделе'));
    if (statsHeader) {
        const wrapperTable = statsHeader.closest('table');

        if (wrapperTable && !wrapperTable.classList.contains('slimtab_nice')) {
            const gridContainer = document.createElement('div');
            gridContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 0 auto 2.4rem auto; max-width: 900px; box-sizing: border-box;';

            const mainCells = wrapperTable.querySelectorAll(':scope > tbody > tr > td');

            mainCells.forEach(cell => {
                const titleNode = cell.querySelector('b');
                const innerTable = cell.querySelector('table');

                if (titleNode && innerTable) {
                    const card = document.createElement('div');
                    card.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large); padding: 2.4rem; box-shadow: var(--shadow-main); display: flex; flex-direction: column;';

                    const cardTitle = document.createElement('div');
                    cardTitle.style.cssText = 'font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 1.6rem;';
                    cardTitle.textContent = titleNode.textContent;
                    card.appendChild(cardTitle);

                    innerTable.className = 'common';
                    innerTable.style.cssText = 'margin: 0; width: 100%; box-shadow: none; border: none; background: transparent;';

                    innerTable.querySelectorAll('tr').forEach((tr, index, rows) => {
                        tr.style.backgroundImage = 'none';

                        const tds = tr.querySelectorAll('td');
                        tds.forEach(td => {
                            td.style.cssText = `padding: 1.2rem 0; border-bottom: ${index === rows.length - 1 ? 'none' : '1px solid var(--color-table-border)'}; font-size: 1.3rem; background: transparent;`;
                        });

                        if (tds.length === 2) {
                            tds[0].style.color = 'var(--color-text-secondary)';
                            tds[1].style.fontWeight = '700';
                            tds[1].style.color = 'var(--color-text-primary)';
                            tds[1].style.textAlign = 'right';

                            if (tds[0].querySelector('b')) {
                                tds[0].style.fontWeight = '800';
                                tds[0].style.color = 'var(--color-text-primary)';
                            }
                        }
                    });

                    card.appendChild(innerTable);
                    gridContainer.appendChild(card);
                }
            });

            wrapperTable.replaceWith(gridContainer);
        }
    }

    container.querySelectorAll('div[id^="chart_div"]').forEach(chart => {
        chart.style.cssText = 'width: 100% !important; min-width: 1000px !important; height: auto !important; min-height: 0 !important;';

        const wrapper = document.createElement('div');
        wrapper.className = 'google-chart-wrapper';
        wrapper.style.cssText = 'display: none; background: var(--color-card); border-radius: var(--radius-large); box-shadow: var(--shadow-main); padding: 2.4rem 1rem; margin: 0 auto 2.4rem auto; max-width: 900px; box-sizing: border-box; overflow-x: auto;';

        chart.parentNode.insertBefore(wrapper, chart);
        wrapper.appendChild(chart);

        const observer = new MutationObserver(() => {
            if (chart.innerHTML.trim() !== '') {
                wrapper.style.display = 'block';
                chart.style.height = '500px';
                observer.disconnect();
            }
        });
        observer.observe(chart, { childList: true });
    });

    const mainScheduleTable = container.querySelector('table.slimtab_nice:not(.distr)');
    if (mainScheduleTable) {
        const daysArr =["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        const daysData = daysArr.map(name => ({ name, pairs:[] }));

        let startWeekDate = startWeekDateGlobal;
        const monthsArrCase =['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

        const rows = mainScheduleTable.querySelectorAll('tr');
        rows.forEach((tr, rowIndex) => {
            if (rowIndex === 0) return;

            const cells = tr.querySelectorAll('td');
            if (cells.length < 7) return;

            const timeRaw = cells[0].textContent.trim();
            const originalPairNum = parseInt(timeRaw, 10) || 1;

            const timeMap = {1: '08:00', 2: '09:45', 3: '11:30', 4: '13:30', 5: '15:15', 6: '17:00', 7: '18:40', 8: '20:25'};
            const mappedTime = timeMap[originalPairNum] || "00:00";

            for (let i = 0; i < 6; i++) {
                const cell = cells[i + 1];
                if (!cell || cell.textContent.trim() === '') continue;

                const bNode = cell.querySelector('b');
                if (!bNode) continue;

                let subjectText = bNode.textContent.trim();

                let umkNumber = '';
                const umkMatch = subjectText.match(/УМК\s*№?(\d+)/i);
                if (umkMatch) {
                    umkNumber = umkMatch[1];
                    subjectText = subjectText.replace(umkMatch[0], '').trim();
                }

                let type = 'Лек';
                let typeClass = 'type-badge-lek';
                const typeMatch = subjectText.match(/\((лек|практ|лаб)\)/i);
                if (typeMatch) {
                    const rawType = typeMatch[1].toLowerCase();
                    subjectText = subjectText.replace(typeMatch[0], '').trim();
                    if (rawType === 'практ') { type = 'Практ'; typeClass = 'type-badge-pract'; }
                    else if (rawType === 'лаб') { type = 'Лаб'; typeClass = 'type-badge-lab'; }
                }

                let teacher = '';
                let aud = '';
                cell.querySelectorAll('a').forEach(link => {
                    const title = link.getAttribute('title') || '';
                    if (title.includes('преподавател')) teacher = link.textContent.trim();
                    else if (title.includes('аудитори')) aud = link.textContent.trim();
                });

                if (generalConfig.shortAudFormat && aud) {
                    const m = aud.match(/ауд\.\s*(\d+[а-яa-z]*)\/(\d+)/i);
                    if (m) aud = `${m[1]}/${m[2]}`;
                }

                let theme = '', extraNotesHtml = '', hoursInfo = '';
                cell.querySelectorAll('div').forEach(div => {
                    const color = div.style.color || '';
                    if (color === 'gray' || color === '#808080') {
                        theme = div.textContent.trim();
                    } else if (color === 'green') {
                        hoursInfo = div.textContent.trim();
                    } else if (color === 'red' || color === 'blue') {
                        if (!div.querySelector('a')) {
                            const text = div.textContent.trim();
                            if (text.toLowerCase() === 'контроль') {
                                extraNotesHtml += `<span style="background: rgba(0, 122, 255, 0.15); color: var(--color-blue); padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; line-height: 1;">Контроль</span>`;
                            } else {
                                extraNotesHtml += `<span style="font-size: 1.2rem; color: ${color === 'red' ? 'var(--color-red)' : 'var(--color-blue)'}; font-weight: 600;">${text}</span>`;
                            }
                        }
                    }
                });

                let tooltipContent = '';
                if (umkNumber) tooltipContent += `<div>УМК №${umkNumber}</div>`;
                if (hoursInfo) {
                    tooltipContent += `<div style="${umkNumber ? 'margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.2);' : ''} color: #ccc; font-size: 1.1rem; font-weight: 500;">${hoursInfo}</div>`;
                }

                let infoIconHtml = '';
                if (tooltipContent) {
                    infoIconHtml = `
                                        <div class="umk-tooltip-wrapper">
                                            <span class="material-icons" style="font-size:1.6rem; color:var(--color-text-secondary); opacity:0.6; cursor:help; transition: color 0.2s;">info</span>
                                            <div class="umk-tooltip" style="text-align: left;">${tooltipContent}</div>
                                        </div>`;
                }

                daysData[i].pairs.push({
                    mappedTime: mappedTime,
                    subject: subjectText,
                    infoIconHtml: infoIconHtml,
                    type: type,
                    typeClass: typeClass,
                    teacher: teacher,
                    aud: aud,
                    theme: theme,
                    extraNotes: extraNotesHtml
                });
            }
        });

        const scheduleContainer = document.createElement('div');
        scheduleContainer.className = 'teacher-days-container detail-schedule-container';
        scheduleContainer.style.cssText = 'margin-bottom: 4rem; max-width: 900px; margin-left: auto; margin-right: auto;';

        daysData.forEach((day, i) => {
            let datePart = '';
            if (startWeekDate) {
                const currentDayDate = new Date(startWeekDate);
                currentDayDate.setDate(currentDayDate.getDate() + i);
                datePart = `${currentDayDate.getDate()} ${monthsArrCase[currentDayDate.getMonth()]}`;
            }

            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            dayDiv.style.cssText = 'border-radius: var(--radius-large) !important; background-color: var(--color-card) !important; box-shadow: var(--shadow-main) !important; overflow: hidden !important; padding: 0 !important; margin-bottom: 2rem !important; border: none !important;';
            const h3 = document.createElement('h3');

            let leftDateHTML = '';
            let rightDateHTML = '';

            if (datePart) {
                if (generalConfig.datesLeft) {
                    leftDateHTML = `<span>,</span>&nbsp;<span class="day-date" style="font-size: 1.4rem; color: var(--color-text-secondary); font-weight: 500;">${datePart}</span>`;
                } else {
                    rightDateHTML = `<div class="day-header-right"><span class="day-date" style="font-size: 1.4rem; color: var(--color-text-secondary); font-weight: 500;">${datePart}</span></div>`;
                }
            }

            h3.innerHTML = `
                                    <div style="display:flex; align-items:center; gap: 6px;">
                                        <div class="day-title-text-wrap" style="display:flex; align-items:center;">
                                            <span class="day-name" style="font-weight: 700; color: var(--color-text-primary); text-transform: capitalize;">${day.name}</span>${leftDateHTML}
                                        </div>
                                    </div>
                                    ${rightDateHTML}
                                `;
            dayDiv.appendChild(h3);

            const gridTable = document.createElement('table');
            gridTable.className = 'timetable timetable-grid detail-schedule-grid';
            gridTable.style.cssText = 'width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0;';
            const tbody = document.createElement('tbody');

            if (day.pairs.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                                        <td class="pair_num" style="border: none !important;">
                                            <div class="pair-badge-wrapper" style="margin-bottom: 8px; display: flex !important; justify-content: center !important;">
                                                <span class="pair-type-badge type-badge-holiday" style="color: #00BFA5; font-weight: 800; font-size: 1.05rem; letter-spacing: 0.5px;">ВЫХ</span>
                                            </div>
                                            <span style="font-size: 1.2rem; font-weight: 600; opacity: 0.7; color: var(--color-text-secondary); display: block; text-align: center !important;">0 пар</span>
                                        </td>
                                        <td class="pair_info" style="text-align: left !important; padding: 1.6rem 1rem 1.6rem 0 !important; border: none !important;">
                                            <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(52, 199, 89, 0.12); color: var(--color-green); padding: 0.6rem 1.4rem; border-radius: 50px; font-weight: 700; font-size: 1.3rem; line-height: 1;">
                                                <span class="material-icons" style="font-size: 1.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">free_breakfast</span>
                                                Выходной
                                            </div>
                                        </td>
                                        <td class="pair_teacher" style="border: none !important;"></td>
                                    `;
                tbody.appendChild(tr);
            } else {
                day.pairs.forEach((pair, pairIdx) => {
                    const tr = document.createElement('tr');
                    const isLast = pairIdx === day.pairs.length - 1;
                    const borderStyle = isLast ? '' : 'background-image: linear-gradient(to right, transparent 85px, var(--color-table-border) 85px, var(--color-table-border) calc(100% - 16px), transparent calc(100% - 16px)); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;';

                    tr.style.cssText = borderStyle;

                    tr.innerHTML = `
                                            <td class="pair_num" style="vertical-align: top; padding: 1.6rem 5px; border: none;">
                                                <div class="pair-badge-wrapper" style="margin-bottom: 6px; display: flex !important; justify-content: center !important;">
                                                    <span class="pair-type-badge ${pair.typeClass}">${pair.type}</span>
                                                </div>
                                                <div style="font-size: 1.2rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px; text-align: center !important;">${pairIdx + 1} пара</div>
                                                <font class="eval" style="font-size: 1.15rem; color: var(--color-text-secondary); font-weight: 500; display: block; text-align: center !important;">${pair.mappedTime}</font>
                                            </td>
                                            <td class="pair_info" style="text-align: left !important; padding: 1.6rem 1rem 1.6rem 0 !important; border: none;">
                                                <div class="dis" style="display:flex; align-items:center; gap:8px; text-align: left !important;">
                                                    <span style="font-weight:700; color:var(--color-text-primary); font-size:1.4rem; line-height:1.2; text-align: left !important;">${pair.subject}</span>
                                                    ${pair.infoIconHtml}
                                                </div>
                                                ${pair.theme ? `<div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 6px; line-height: 1.4; text-align: left !important;">${pair.theme}</div>` : ''}

                                                ${(pair.aud || pair.extraNotes) ? `
                                                <div style="display: flex; align-items: center; justify-content: flex-start; margin-top: 8px; flex-wrap: wrap; gap: 10px; width: 100%;">
                                                    ${pair.aud ? `
                                                    <div class="aud" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem; font-weight: 500; text-align: left !important;">
                                                        <span class="material-icons" style="font-size: 1.4rem;">place</span><span>${pair.aud}</span>
                                                    </div>` : ''}
                                                    ${pair.extraNotes ? `<div style="display: inline-flex; align-items: center; gap: 6px;">${pair.extraNotes}</div>` : ''}
                                                </div>
                                                ` : ''}
                                            </td>
                                            <td class="pair_teacher" style="text-align: right !important; padding: 1.6rem 1.6rem 1.6rem 0 !important; border: none;">
                                                <span style="color: var(--color-text-secondary); font-size: 1.25rem; font-weight: 500; line-height: 1.3; display: block; text-align: right !important;">${pair.teacher}</span>
                                            </td>
                                        `;
                    tbody.appendChild(tr);
                });
            }

            gridTable.appendChild(tbody);
            dayDiv.appendChild(gridTable);
            scheduleContainer.appendChild(dayDiv);
        });

        mainScheduleTable.replaceWith(scheduleContainer);
    }

    const table = container.querySelector('table.distr');
    if (table) {
        table.classList.add('common');
        table.removeAttribute('border');

        if (!table.parentNode.classList.contains('wide-table-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'wide-table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }

        table.querySelectorAll('th, td').forEach(cell => {
            cell.removeAttribute('style');
            cell.removeAttribute('align');
            cell.removeAttribute('valign');

            cell.querySelectorAll('.pair').forEach(p => {
                p.innerHTML = '';
                if (p.classList.contains('lec')) p.title = 'Лекция';
                if (p.classList.contains('pract')) p.title = 'Практика';
                if (p.classList.contains('lab')) p.title = 'Лабораторная';
            });

            if (cell.cellIndex === 0) {
                cell.style.textAlign = 'left';
                if (cell.tagName === 'TH') {
                    cell.style.fontWeight = '700';
                    cell.style.color = 'var(--color-text-secondary)';
                } else {
                    const text = cell.textContent.trim();
                    const match = text.match(/(.*?),\s*(лек|практ|лаб|зачет|зачёт|экзамен)$/i);
                    if (match) {
                        const subj = match[1];
                        const type = match[2].toLowerCase();

                        let bg = 'var(--color-highlight)', color = 'var(--color-text-secondary)';
                        if (type === 'лек') { bg = 'rgba(0, 122, 255, 0.15)'; color = 'var(--color-blue)'; }
                        else if (type === 'практ') { bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)'; }
                        else if (type === 'лаб') { bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)'; }

                        cell.innerHTML = `
                                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                                                    <span style="font-weight: 600; color: var(--color-text-primary); white-space: normal; word-break: break-word;">${subj}</span>
                                                    <span style="background: ${bg}; color: ${color}; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;">${type}</span>
                                                </div>
                                            `;
                    } else {
                        cell.style.fontWeight = '600';
                        cell.style.color = 'var(--color-text-primary)';
                    }
                }
            } else {
                cell.style.textAlign = 'center';
            }
        });
    }
    return;
}
