import { pageCtx } from '../app/context.js';
import { generalConfig } from '../core/config.js';
import { updateLiveTimetable } from '../features/live-timetable.js';
import { applySri, escapeHTML } from '../utils/security.ts';

export function renderPeoTTPage() {
    if (pageCtx.isPeoTT) {
        // 1. Очистка заголовка
        const h4 = pageCtx.span9.querySelector('h4');
        let dateRangeText = "";
        if (h4) {
            const h2 = document.createElement('h2');
            h2.textContent = h4.textContent;
            h2.style.marginBottom = '2.4rem';

            // Извлекаем даты
            const rangeMatch = h4.textContent.match(/\(с\s+\d{2}\.\d{2}\.\d{4}\s+по\s+\d{2}\.\d{2}\.\d{4}\)/i);
            if (rangeMatch) {
                dateRangeText = rangeMatch[0].replace(/[()]/g, '');
            }

            h2.style.display = 'none';
            h4.replaceWith(h2);
        }

        // 2. Парсинг семестров и недель
        const spans = Array.from(pageCtx.span9.querySelectorAll('span.fl, span.active'));
        const terms =[];
        const weeks =[];

        spans.forEach(span => {
            const text = span.textContent.trim();
            const onclick = span.getAttribute('onclick');

            if (/^\d+$/.test(text) || (onclick && onclick.includes("'',"))) {
                weeks.push(span);
            } else {
                terms.push(span);
            }
        });

        // Удаляем висячие <br> и &nbsp;
        Array.from(pageCtx.span9.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') node.remove();
            if (node.tagName === 'BR') node.remove();
        });

        // 3. Создание Submenu (Семестры)
        if (terms.length > 0) {
            const submenu = document.createElement('div');
            submenu.className = 'submenu';
            submenu.style.setProperty('margin-bottom', '1.6rem', 'important');
            submenu.style.setProperty('width', '100%', 'important');
            submenu.style.setProperty('box-sizing', 'border-box', 'important');

            terms.forEach(span => {
                const a = document.createElement(span.classList.contains('active') ? 'b' : 'a');
                a.textContent = span.textContent;
                if (span.hasAttribute('onclick')) {
                    a.href = '#';
                    a.setAttribute('onclick', span.getAttribute('onclick'));
                }
                // Заставляем вкладки равномерно растягиваться на всю ширину
                a.style.setProperty('flex', '1 1 0', 'important');
                a.style.setProperty('justify-content', 'center', 'important');
                submenu.appendChild(a);
                span.remove();
            });
            pageCtx.span9.insertBefore(submenu, pageCtx.span9.querySelector('table.slimtab_nice') || pageCtx.span9.firstChild);
        }

        // 4. Создание Weeks (Недели)
        if (weeks.length > 0) {
            const wrapper = document.createElement('div');
            wrapper.className = 'week-select-wrapper';
            wrapper.style.setProperty('margin-bottom', '1.6rem', 'important');
            wrapper.style.setProperty('width', '100%', 'important');
            wrapper.style.setProperty('box-sizing', 'border-box', 'important');

            const weeksContainer = document.createElement('div');
            weeksContainer.className = 'weeks';

            const actualWeekNum = localStorage.getItem('etis_actual_week');

            weeks.forEach(span => {
                const isActive = span.classList.contains('active');
                const weekDiv = document.createElement('div');
                weekDiv.className = 'week ' + (isActive ? 'current' : '');

                const text = span.textContent.trim();

                if (text === actualWeekNum && !isActive) {
                    weekDiv.classList.add('actual-week');
                }

                const a = document.createElement('a');
                if (isActive) {
                    a.innerHTML = `<span style="font-weight: 800;">${escapeHTML(text)}</span>&nbsp;<span style="font-weight: 800;">Неделя</span>`;
                } else {
                    a.textContent = text;
                }

                if (span.hasAttribute('onclick')) {
                    a.href = '#';
                    a.setAttribute('onclick', span.getAttribute('onclick'));
                }

                if (isActive) {
                    a.style.setProperty('color', '#fff', 'important');
                }

                weekDiv.appendChild(a);
                weeksContainer.appendChild(weekDiv);
                span.remove();
            });

            wrapper.appendChild(weeksContainer);

            if (dateRangeText) {
                const dateCapsule = document.createElement('div');
                dateCapsule.className = 'week-date-styled';
                const cleanDateRange = dateRangeText.replace(/\.\d{4}/g, '');
                dateCapsule.textContent = cleanDateRange;
                wrapper.appendChild(dateCapsule);
            }

            pageCtx.span9.insertBefore(wrapper, pageCtx.span9.querySelector('table.slimtab_nice') || pageCtx.span9.firstChild);

            setTimeout(() => {
                const activeW = weeksContainer.querySelector('.current');
                if (activeW) {
                    const scrollTarget = activeW.offsetLeft - (weeksContainer.offsetWidth / 2) + (activeW.offsetWidth / 2);
                    weeksContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' });
                }
            }, 200);
        }

        // 5. Оформление таблицы (Парсинг сетки в карточки дней)
        const table = pageCtx.span9.querySelector('table.slimtab_nice');
        if (table) {
            if (!document.getElementById('peo-tt-hover-styles')) {
                const style = document.createElement('style');
                style.id = 'peo-tt-hover-styles';
                style.innerHTML = `
                                .aud-hidden {
                                    max-height: 0;
                                    overflow: hidden;
                                    opacity: 0;
                                    transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
                                    margin-top: 0;
                                    display: flex;
                                    flex-direction: column;
                                    gap: 6px;
                                }
                                .aud-hover-container:hover .aud-hidden {
                                    max-height: 800px;
                                    opacity: 1;
                                    margin-top: 8px;
                                }
                                .pair_teacher { overflow: visible !important; }
                                .groups-more-btn {
                                    background: var(--color-highlight);
                                    color: var(--color-text-primary);
                                    padding: 4px 10px;
                                    border-radius: 12px;
                                    font-size: 1.1rem;
                                    margin-left: 6px;
                                    font-weight: 800;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    display: inline-block;
                                    vertical-align: middle;
                                    border: 1px solid transparent;
                                    line-height: 1.2;
                                }
                                .groups-more-btn:hover {
                                    background: var(--color-accent-active);
                                    color: var(--color-accent);
                                    border-color: var(--color-accent);
                                    transform: translateY(-1px);
                                }
                                /* Фикс ширины правой колонки для преподавателя */
                                html[theme] .teacher-days-container .timetable-grid td.pair_teacher {
                                    width: 250px !important;
                                    min-width: 200px !important;
                                    padding-right: 1.6rem !important;
                                }
                                html[theme] .teacher-days-container .timetable-grid tr:not(:last-child) {
                                    background-image: linear-gradient(to right,
                                        transparent 90px,
                                        var(--color-table-border) 90px,
                                        var(--color-table-border) calc(100% - 1.6rem),
                                        transparent calc(100% - 1.6rem)
                                    ) !important;
                                    background-position: bottom !important;
                                    background-repeat: no-repeat !important;
                                    background-size: 100% 1px !important;
                                }
                                @media (max-width: 960px) {
                                    html[theme] .teacher-days-container .timetable-grid td.pair_teacher {
                                        width: 110px !important;
                                        min-width: 110px !important;
                                        padding-right: 1.6rem !important;
                                    }
                                    html[theme] .teacher-days-container .timetable-grid tr:not(:last-child) {
                                        background-image: linear-gradient(to right,
                                            transparent calc(75px + 0.5rem),
                                            var(--color-table-border) calc(75px + 0.5rem),
                                            var(--color-table-border) calc(100% - 1.6rem),
                                            transparent calc(100% - 1.6rem)
                                        ) !important;
                                    }
                                }
                            `;
                document.head.appendChild(style);
            }

            const daysArr =["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
            const daysData = daysArr.map(name => ({ name, pairs:[] }));
            let teacherInfoHtml = "";

            // Попытка вытащить дату начала недели (понедельника) из заголовка
            const h2Title = pageCtx.span9.querySelector('h2');
            let startWeekDate = null;
            if (h2Title) {
                const dateMatch = h2Title.textContent.match(/с\s+(\d{2})\.(\d{2})\.(\d{4})/i);
                if (dateMatch) {
                    startWeekDate = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
                }
            }
            const monthsArrCase =['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

            const rows = table.querySelectorAll('tr');
            rows.forEach((tr, rowIndex) => {
                if (rowIndex === 0 || tr.children.length === 0) return;

                let time = "";
                let dayCellOffset = 0;
                const firstCell = tr.cells[0];

                if (firstCell && firstCell.rowSpan > 2 && firstCell.querySelector('b')) {
                    teacherInfoHtml = firstCell.innerHTML;
                    time = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
                    dayCellOffset = 2;
                } else {
                    time = firstCell ? firstCell.textContent.trim() : "";
                    dayCellOffset = 1;
                }

                if (!time.includes(':')) return;

                for (let i = 0; i < 6; i++) {
                    const cell = tr.cells[i + dayCellOffset];
                    if (!cell || cell.textContent.trim() === '') continue;

                    const pairBlocks = cell.innerHTML.split(/<hr[^>]*>/i);

                    pairBlocks.forEach(blockHtml => {
                        if (blockHtml.trim() === '') return;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = blockHtml;

                        let subject = "Пара";
                        let type = "";

                        const allDivs = tempDiv.querySelectorAll(':scope > div');
                        if (allDivs.length === 0) return;

                        const cleanDivs = Array.from(allDivs).filter(d => !d.classList.contains('param'));

                        if (cleanDivs.length === 0) return;

                        const subjFont = cleanDivs[0].querySelector('font[color="#6A0035"] b') || cleanDivs[0];
                        const titleText = subjFont.textContent.trim();
                        const typeMatch = titleText.match(/\((лек|практ|лаб)\)$/i);
                        if (typeMatch) {
                            type = typeMatch[1].toLowerCase();
                            subject = titleText.replace(typeMatch[0], '').trim();
                        } else if (titleText.toLowerCase().includes('консультация')) {
                            type = 'конс';
                            subject = titleText;
                        } else { subject = titleText; }

                        let infoDiv = cleanDivs.length >= 2 ? cleanDivs[1] : null;
                        let groupsDiv = cleanDivs.length >= 3 ? cleanDivs[2] : null;

                        if (cleanDivs.length === 2) {
                            const c1Html = cleanDivs[1].innerHTML;
                            if (cleanDivs[1].querySelector('a') || (c1Html.includes('<br>') && !c1Html.match(/\d{2}\.\d{2}/) && !cleanDivs[1].classList.contains('fp'))) {
                                groupsDiv = cleanDivs[1];
                                infoDiv = null;
                            }
                        }

                        let infoHtml = "";
                        if (infoDiv) {
                            let visibleEntries =[];
                            let hiddenEntries =[];
                            const tooltipEl = infoDiv.querySelector('.tooltip');

                            let rawText = infoDiv.innerHTML.replace(/\.\d{4}/g, '')
                                .replace(/<font[^>]*>/g, '').replace(/<\/font>/g, '')
                                .replace(/<img[^>]*>/ig, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/<span[^>]*>.*?online.*?<\/span>/ig, 'online');

                            let parts = rawText.split(/<br\s*\/?>/i).map(s => s.trim().replace(/<[^>]+>/g, '')).filter(s => s);

                            for (let j = 0; j < parts.length; j++) {
                                let text = parts[j];
                                if (text.toLowerCase() === titleText.toLowerCase() || text.toLowerCase() === subject.toLowerCase()) continue;

                                text = text.replace(/^[\d,\s]+-\s*/, '');

                                if (text.startsWith('с ') || text.match(/^\d{2}\.\d{2}/)) {
                                    let nxt = parts[j+1] && !parts[j+1].startsWith('с ') && !parts[j+1].match(/^\d{2}\.\d{2}/) ? parts[j+1] : '';
                                    if (nxt) {
                                        nxt = nxt.replace(/^[\d,\s]+-\s*/, '');
                                        j++;
                                    }
                                    visibleEntries.push({ date: text, text: nxt, type: 'loc' });
                                } else {
                                    visibleEntries.push({ date: '', text: text, type: 'loc' });
                                }
                            }

                            if (tooltipEl && tooltipEl.hasAttribute('title')) {
                                const titleStr = tooltipEl.getAttribute('title');
                                const tParts = titleStr.split(/<br\s*\/?>/i).filter(s => s.trim());
                                tParts.forEach(p => {
                                    const m = p.match(/^([\d\.]+)\s*-\s*(.*)/);
                                    if (m) {
                                        hiddenEntries.push({ date: m[1].trim().replace(/\.\d{4}/g, ''), text: m[2].trim(), type: 'loc' });
                                    } else {
                                        if (/(?:ауд\.|к\.|[0-9]+\/[0-9]+)/i.test(p)) {
                                            hiddenEntries.push({ date: '', text: p.trim(), type: 'loc' });
                                        } else {
                                            hiddenEntries.push({ date: '', text: p.trim(), type: 'info' });
                                        }
                                    }
                                });
                            } else {
                                hiddenEntries = visibleEntries.slice(1);
                            }

                            const formatAud = (audStr, strType) => {
                                if (!audStr) return '';
                                if (audStr.toLowerCase() === 'online') {
                                    return `<span style="display:inline-flex; align-items:center; gap:4px; color:var(--color-text-secondary); font-weight:500; font-size:1.3rem;"><span class="material-icons" style="font-size:1.5rem;">public</span>Онлайн</span>`;
                                }

                                if (strType === 'info') {
                                    return `<div style="display:flex; align-items:flex-start; gap:8px; color:var(--color-text-secondary); font-weight:400; font-size:1.2rem; line-height:1.4; text-align:left; width:100%;"><span class="material-icons" style="font-size:1.5rem; opacity:0.7; flex-shrink:0; transform: translateY(-1px);">info</span><span>${audStr}</span></div>`;
                                }

                                let displayAud = audStr;
                                if (generalConfig.shortAudFormat) {
                                    const m = audStr.match(/(\d+)\s*к\.\s*(?:ауд\.)?\s*(\d+[а-яa-z]?)(?:\/\d+)?/i);
                                    if (m) {
                                        displayAud = `${m[2]}/${m[1]}`;
                                    }
                                }
                                return `<span style="display:inline-flex; align-items:center; gap:4px; color:var(--color-text-secondary); font-weight:500; font-size:1.3rem;"><span class="material-icons" style="font-size:1.5rem;">place</span>${displayAud}</span>`;
                            };

                            if (visibleEntries.length > 0) {
                                let first = visibleEntries[0];
                                let visibleHtml = `<div class="aud-visible" style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; text-align: left;">
                                                ${formatAud(first.text, first.type)}
                                                ${first.date ? `<span style="font-size:1.15rem; color:var(--color-accent); opacity:0.8; font-weight:600;">${first.date}</span>` : ''}
                                            </div>`;

                                let hiddenHtml = '';
                                const listToHide = hiddenEntries.length > 0 ? hiddenEntries : visibleEntries.slice(1);

                                if (listToHide.length > 0) {
                                    hiddenHtml = `<div class="aud-hidden">`;
                                    listToHide.forEach(e => {
                                        hiddenHtml += `<div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; text-align:left; width:100%;">
                                                        ${formatAud(e.text, e.type)}
                                                        ${e.date ? `<span style="font-size:1.15rem; color:var(--color-text-secondary); opacity:0.8; font-weight:500;">${e.date}</span>` : ''}
                                                    </div>`;
                                    });
                                    hiddenHtml += `</div>`;
                                }

                                infoHtml = `<div class="aud-hover-container" style="cursor:default; padding: 4px 0; text-align: left;">
                                                ${visibleHtml}
                                                ${hiddenHtml}
                                            </div>`;
                            }
                        }

                        let groupsHtml = "";
                        if (groupsDiv) {
                            let groupsArr =[];
                            const aTags = groupsDiv.querySelectorAll('a');

                            if (aTags.length > 0) {
                                groupsArr = Array.from(aTags).map(a => a.textContent.trim()).filter(Boolean);
                            } else {
                                groupsArr = groupsDiv.innerHTML.split(/<br\s*\/?>/i)
                                    .map(g => g.replace(/<[^>]*>/g, '').trim())
                                    .filter(g => g.length > 1);
                            }

                            if (groupsArr.length > 0) {
                                const visibleCount = 2;
                                const visibleGroups = groupsArr.slice(0, visibleCount).join(', ');

                                if (groupsArr.length > visibleCount) {
                                    const extraCount = groupsArr.length - visibleCount;
                                    const safeGroups = encodeURIComponent(JSON.stringify(groupsArr));

                                    groupsHtml = `
                                                    <div style="color:var(--color-text-secondary); font-weight:500; font-size:1.2rem; text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                                                        <span>${visibleGroups}</span>
                                                        <span class="groups-more-btn modal-groups-trigger" data-groups="${safeGroups}">+${extraCount} групп</span>
                                                    </div>`;
                                } else {
                                    groupsHtml = `<div style="color:var(--color-text-secondary); font-weight:500; font-size:1.2rem; text-align:right;">${visibleGroups}</div>`;
                                }
                            }
                        }

                        daysData[i].pairs.push({ time, subject, type, infoHtml, groupsHtml });
                    });
                }
            });

            // --- СКРИНШОТ ГЕНЕРАТОР ---
            const handleScreenshot = async (targetEl, fileName, btnEl) => {
                let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                if (!h2c) {
                    btnEl.textContent = 'error';
                    setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                    return;
                }

                const isMobile = window.innerWidth <= 960;
                const renderWidth = isMobile ? 540 : 1000;

                const exportContainer = document.createElement('div');
                exportContainer.style.cssText = `position:absolute; top:0px; left:0px; pointer-events:none; width:${renderWidth}px; padding:${isMobile ? '24px 24px 12px' : '40px 40px 20px'}; background:var(--color-body); z-index:-9999; box-sizing:border-box;`;

                if (targetEl.classList.contains('teacher-days-container')) {
                    const title = document.createElement('h2');
                    title.textContent = h2Title ? h2Title.textContent.trim() : 'Расписание преподавателя';
                    title.style.textAlign = 'center';
                    title.style.marginBottom = isMobile ? '20px' : '30px';
                    title.style.fontSize = isMobile ? '1.8rem' : '2.2rem';
                    title.style.fontWeight = '800';
                    title.style.color = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#000';
                    exportContainer.appendChild(title);
                }

                const span9Wrapper = document.createElement('div');
                span9Wrapper.className = 'span9';
                span9Wrapper.style.cssText = 'margin:0 !important; padding:0 !important; width:100% !important; display:block;';

                const clone = targetEl.cloneNode(true);
                clone.style.margin = '0';
                clone.querySelectorAll('script').forEach(s => s.remove());
                clone.querySelectorAll('[loading="lazy"]').forEach(el => el.removeAttribute('loading'));
                clone.querySelectorAll('.share-day-btn, .share-all-btn, .live-dot, .day-status-icon').forEach(el => el.remove());

                // Убираем "Добавить онлайн мероприятие" и разделитель "•" перед ним
                clone.querySelectorAll('a').forEach(a => {
                    if (a.textContent.includes('Добавить онлайн мероприятие')) {
                        const prev = a.previousElementSibling;
                        if (prev && prev.tagName === 'SPAN' && prev.textContent.includes('•')) {
                            prev.remove();
                        }
                        a.remove();
                    }
                });

                clone.querySelectorAll('.pair-passed, td').forEach(el => {
                    el.classList.remove('pair-passed');
                    el.style.setProperty('opacity', '1', 'important');
                });

                const exportStyles = document.createElement('style');
                exportStyles.innerHTML = `
                                * { transition: none !important; animation: none !important; opacity: 1 !important; }
                                .day, .teacher-card {
                                    box-shadow: none !important;
                                    border: 1px solid var(--color-table-border) !important;
                                    border-radius: 24px !important;
                                    overflow: hidden !important;
                                }
                                .day h3 {
                                    border-top-left-radius: 23px !important;
                                    border-top-right-radius: 23px !important;
                                }

                                .timetable-grid { table-layout: fixed !important; width: 100% !important; border-spacing: 0 !important; border-collapse: collapse !important; }
                                .timetable-grid td { white-space: normal !important; word-wrap: break-word !important; border-bottom: none !important; padding: 12px 0 !important; }

                                /* Даем воздух снизу, чтобы html2canvas не срезал закругления */
                                .timetable-grid tr:last-child td { padding-bottom: 20px !important; }

                                .timetable-grid td.pair_num { width: 90px !important; min-width: 90px !important; font-size: 1.1rem !important; text-align: center !important; padding: 12px 5px !important; }
                                .timetable-grid td.pair_info { width: auto !important; padding-left: 5px !important; padding-right: 5px !important; text-align: left !important; }
                                .timetable-grid td.pair_teacher { width: 250px !important; min-width: 200px !important; text-align: right !important; padding-right: 16px !important; display: table-cell !important; }
                                .timetable-grid tr:not(:last-child) {
                                    background-image: linear-gradient(to right, transparent 90px, var(--color-table-border) 90px, var(--color-table-border) calc(100% - 16px), transparent calc(100% - 16px)) !important;
                                    background-position: bottom !important; background-size: 100% 1px !important; background-repeat: no-repeat !important; background-color: transparent !important;
                                }

                                .timetable-gap-capsule {
                                    display: inline-flex !important; align-items: center !important;
                                    width: auto !important; flex: 0 0 auto !important;
                                }
                                .aud a, .btn-generic-online {
                                    display: inline-flex !important; align-items: center !important;
                                    width: auto !important; flex: 0 0 auto !important;
                                    text-decoration: none !important;
                                }
                            `;
                clone.appendChild(exportStyles);
                span9Wrapper.appendChild(clone);

                if (generalConfig.watermark) {
                    const watermark = document.createElement('div');
                    watermark.style.cssText = 'text-align: right; margin-top: 16px; font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;';
                    watermark.textContent = 'etisreborn.ru';
                    span9Wrapper.appendChild(watermark);
                }

                exportContainer.appendChild(span9Wrapper);
                document.body.appendChild(exportContainer);

                try {
                    await new Promise(r => setTimeout(r, 150));
                    const canvas = await h2c(exportContainer, {
                        scale: 2,
                        useCORS: true,
                        windowWidth: renderWidth,
                        scrollY: 0,
                        backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim(),
                        ignoreElements: (node) => node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME'
                    });
                    canvas.toBlob(blob => {
                        const file = new File([blob], fileName, { type: 'image/png' });
                        if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                            navigator.share({ files: [file], title: fileName });
                        } else {
                            const link = document.createElement('a');
                            link.download = fileName; link.href = URL.createObjectURL(blob); link.click();
                            URL.revokeObjectURL(link.href);
                        }
                        exportContainer.remove();
                        btnEl.textContent = 'check';
                        setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                    }, 'image/png');
                } catch(err) {
                    exportContainer.remove();
                    btnEl.textContent = 'error';
                    setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                }
            };

            const loadH2cAndShoot = (targetEl, fileName, btnEl) => {
                let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                if (!h2cObj) {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; applySri(script);
                    script.onload = () => handleScreenshot(targetEl, fileName, btnEl);
                    script.onerror = () => {
                        btnEl.textContent = 'error';
                        setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                    };
                    document.head.appendChild(script);
                } else {
                    handleScreenshot(targetEl, fileName, btnEl);
                }
            };

            const daysContainer = document.createElement('div');
            daysContainer.className = 'teacher-days-container';

            if (teacherInfoHtml) {
                const tCard = document.createElement('div');
                tCard.style.cssText = 'width: 100%; box-sizing: border-box; background: var(--color-card); padding: 1.8rem 2.4rem; border-radius: var(--radius-large); margin-bottom: 2.4rem; font-size: 1.4rem; color: var(--color-text-primary); border: 1px solid var(--color-table-border); box-shadow: var(--shadow-main); display: flex; justify-content: space-between; align-items: center;';
                tCard.innerHTML = `
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span class="material-icons" style="color:var(--color-accent);">person</span>
                                    <div style="line-height:1.4;">${teacherInfoHtml.replace(/<br\s*\/?>/gi, ' <span style="color:var(--color-text-secondary); margin: 0 4px;">•</span> ')}</div>
                                </div>
                                <span class="material-icons share-all-btn" title="Поделиться расписанием" style="color:var(--color-text-secondary); cursor:pointer; font-size:2.4rem; padding: 4px; transition: color 0.2s;">ios_share</span>
                            `;
                daysContainer.appendChild(tCard);

                const shareAllBtn = tCard.querySelector('.share-all-btn');
                shareAllBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    shareAllBtn.textContent = 'hourglass_empty';
                    const fileName = `Расписание (${h2Title ? h2Title.textContent.replace('Расписание преподавателей. ', '').trim() : 'Преподавателя'}).png`;
                    loadH2cAndShoot(daysContainer, fileName, shareAllBtn);
                });
            }

            daysData.forEach(day => {
                if (day.pairs.length === 0) return;

                let datePart = '';
                if (startWeekDate) {
                    const dayIndex = daysArr.indexOf(day.name);
                    if (dayIndex !== -1) {
                        const currentDayDate = new Date(startWeekDate);
                        currentDayDate.setDate(currentDayDate.getDate() + dayIndex);
                        datePart = `${currentDayDate.getDate()} ${monthsArrCase[currentDayDate.getMonth()]}`;
                    }
                }

                let leftDateHTML = '';
                let rightDateHTML = '';

                if (datePart) {
                    if (generalConfig.datesLeft) {
                        leftDateHTML = `<span>,</span>&nbsp;<span class="day-date" style="font-size: 1.4rem; color: var(--color-text-secondary); font-weight: 500;">${datePart}</span>`;
                    } else {
                        rightDateHTML = `<span class="day-date">${datePart}</span>`;
                    }
                }

                const dayDiv = document.createElement('div');
                dayDiv.className = 'day';

                const h3 = document.createElement('h3');
                h3.innerHTML = `
                                <div style="display:flex; align-items:center; gap: 6px;">
                                    <div class="day-title-text-wrap" style="display:flex; align-items:center;">
                                        <span class="day-name">${day.name}</span>${leftDateHTML}
                                    </div>
                                </div>
                                <div class="day-header-right">
                                    ${rightDateHTML}
                                    <span class="material-icons share-day-btn" title="Поделиться днем">ios_share</span>
                                </div>
                            `;
                dayDiv.appendChild(h3);

                h3.querySelector('.share-day-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const btn = e.currentTarget;
                    btn.textContent = 'hourglass_empty';
                    const fileName = `Расписание (${datePart || day.name}).png`;
                    loadH2cAndShoot(dayDiv, fileName, btn);
                });

                const gridTable = document.createElement('table');
                gridTable.className = 'timetable timetable-grid';
                const tbody = document.createElement('tbody');

                day.pairs.forEach((pair, idx) => {
                    const tr = document.createElement('tr');

                    let typeClass = 'type-badge-lek';
                    if (pair.type === 'практ') typeClass = 'type-badge-pract';
                    else if (pair.type === 'лаб') typeClass = 'type-badge-lab';
                    else if (pair.type === 'конс') typeClass = 'type-badge-cons';

                    tr.innerHTML = `
                                    <td class="pair_num">
                                        <div class="pair-badge-wrapper">
                                            ${pair.type ? `<span class="pair-type-badge ${typeClass}">${pair.type}</span>` : ''}
                                        </div>
                                        ${idx + 1} пара<br><font class="eval">${pair.time}</font>
                                    </td>
                                    <td class="pair_info" style="text-align: left !important;">
                                        <div class="dis" style="text-align: left !important;"><span style="font-weight:700; color:var(--color-text-primary); font-size:1.45rem;">${pair.subject}</span></div>
                                        <div class="aud-list" style="margin-top:4px; text-align: left !important;">${pair.infoHtml}</div>
                                    </td>
                                    <td class="pair_teacher">
                                        <div style="text-align:right; line-height:1.5; margin-left:auto;">
                                            ${pair.groupsHtml}
                                        </div>
                                    </td>
                                `;
                    tbody.appendChild(tr);
                });

                gridTable.appendChild(tbody);
                dayDiv.appendChild(gridTable);
                daysContainer.appendChild(dayDiv);
            });

            table.replaceWith(daysContainer);

            // Обработчик для модальных окон со списком групп
            daysContainer.querySelectorAll('.modal-groups-trigger').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const groups = JSON.parse(decodeURIComponent(btn.getAttribute('data-groups')));

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

                    modal.innerHTML = `
                                    <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                                        <span class="ui-dialog-title">Учебные группы (${groups.length})</span>
                                        <button class="close-analytics" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                                    </div>
                                    <div class="ui-dialog-content" style="padding: 2.4rem;">
                                        <div style="display:flex; flex-direction:column; gap:8px;">
                                            ${groups.map(g => `<div style="background:var(--color-highlight); padding:1.2rem 1.6rem; border-radius:var(--radius-small); font-size:1.3rem; color:var(--color-text-primary); font-weight:600;">${g}</div>`).join('')}
                                        </div>
                                    </div>
                                `;

                    const closeAnalytics = () => {
                        overlay.classList.remove('active');
                        modal.classList.remove('active');
                        document.body.classList.remove('modal-open-body');
                    };
                    overlay.onclick = closeAnalytics;
                    modal.querySelector('.close-analytics').onclick = closeAnalytics;

                    overlay.classList.add('active');
                    modal.classList.add('active');
                    document.body.classList.add('modal-open-body');
                });
            });

            // Инициализация свайпов для преподавателя (Мобильные)
            function initTeacherMobileSwipes() {
                if (window.innerWidth > 960) return;
                let bubble = document.getElementById('swipe-action-bubble');
                if (!bubble) {
                    bubble = document.createElement('div');
                    bubble.id = 'swipe-action-bubble';
                    bubble.innerHTML = '<span class="material-icons"></span>';
                    document.body.appendChild(bubble);
                }
                const iconEl = bubble.querySelector('.material-icons');
                let startX = 0, startY = 0;
                let currentTarget = null, targetType = '', isSwiping = false, swipeDir = '', originalRect = null, isScrollDetermined = false;
                const THRESHOLD = 70;

                daysContainer.addEventListener('touchstart', (e) => {
                    const touch = e.touches[0];
                    startX = touch.clientX; startY = touch.clientY;
                    isSwiping = false; isScrollDetermined = false; swipeDir = '';
                    currentTarget = null; originalRect = null;

                    const dayHeader = e.target.closest('.day h3');
                    if (dayHeader) {
                        currentTarget = dayHeader.closest('.day');
                        targetType = 'day';
                        originalRect = currentTarget.getBoundingClientRect();
                        currentTarget.style.transition = 'none';
                    }
                }, { passive: true });

                daysContainer.addEventListener('touchmove', (e) => {
                    if (!currentTarget || !originalRect) return;
                    const touch = e.touches[0];
                    const diffX = touch.clientX - startX;
                    const diffY = touch.clientY - startY;

                    if (!isScrollDetermined) {
                        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;
                        isScrollDetermined = true;
                        if (Math.abs(diffY) > Math.abs(diffX) || diffX > 0) { // Разрешаем свайп только ВЛЕВО (поделиться)
                            currentTarget = null; return;
                        }
                        isSwiping = true;
                        bubble.className = '';
                        iconEl.textContent = 'ios_share';
                    }

                    if (isSwiping) {
                        swipeDir = 'left';
                        let moveX = diffX;
                        if (Math.abs(moveX) > THRESHOLD) moveX = -THRESHOLD - (Math.abs(moveX) - THRESHOLD) * 0.25;

                        currentTarget.style.transform = `translateX(${moveX}px)`;

                        bubble.style.top = `${originalRect.top + originalRect.height / 2 - 12}px`;
                        bubble.style.left = `${originalRect.right + (moveX / 2) - 12}px`;
                        bubble.style.opacity = Math.min(Math.abs(diffX) / 30, 1).toString();

                        if (Math.abs(diffX) >= THRESHOLD) {
                            bubble.classList.add('active-threshold', 'action-share');
                            if (!bubble.dataset.vibrated && navigator.vibrate) {
                                navigator.vibrate(15); bubble.dataset.vibrated = 'true';
                            }
                        } else {
                            bubble.classList.remove('active-threshold', 'action-share');
                            bubble.dataset.vibrated = '';
                        }
                    }
                }, { passive: true });

                daysContainer.addEventListener('touchend', (e) => {
                    if (!currentTarget || !isSwiping) return;
                    const diffX = e.changedTouches[0].clientX - startX;
                    const target = currentTarget;

                    currentTarget.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    currentTarget.style.transform = 'translateX(0px)';

                    bubble.style.opacity = '0';
                    bubble.classList.remove('active-threshold', 'action-share');
                    bubble.dataset.vibrated = '';

                    if (diffX <= -THRESHOLD) {
                        setTimeout(() => {
                            const shareBtn = target.querySelector('.share-day-btn');
                            if (shareBtn) shareBtn.click();
                        }, 150);
                    }
                    currentTarget = null; isSwiping = false;
                });
            }
            initTeacherMobileSwipes();

            // Затемнение прошедших пар
            function dimTeacherPastPairs() {
                if (!generalConfig.dimPastPairs) return;

                // Вычисляем, какую неделю мы сейчас смотрим
                const viewedWeekEl = document.querySelector('.weeks .week.current');
                const viewedWeek = viewedWeekEl ? parseInt(viewedWeekEl.textContent.replace(/\D/g, ''), 10) : -1;
                const actualWeek = parseInt(localStorage.getItem('etis_actual_week') || '-1', 10);

                const isPastWeek = (actualWeek !== -1 && viewedWeek !== -1 && viewedWeek < actualWeek);
                const isFutureWeek = (actualWeek !== -1 && viewedWeek !== -1 && viewedWeek > actualWeek);

                const days = daysContainer.querySelectorAll('.day');
                const now = new Date();
                const todayMins = now.getHours() * 60 + now.getMinutes();
                const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                days.forEach(day => {
                    const dateEl = day.querySelector('.day-date');
                    if (!dateEl) return;

                    let classDateObj = new Date();
                    const dateStr = dateEl.textContent.trim();
                    const match = dateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);

                    if (match) {
                        const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                        classDateObj.setMonth(m);
                        classDateObj.setDate(parseInt(match[1]));
                    }
                    classDateObj.setHours(0,0,0,0);
                    const classTime = classDateObj.getTime();

                    const isPastDay = classTime < todayZero;
                    const isToday = classTime === todayZero;

                    day.querySelectorAll('.timetable-grid tr').forEach(row => {
                        let isPassed = false;

                        if (isPastWeek) {
                            isPassed = true; // Если неделя прошлая — всё темно
                        } else if (isFutureWeek) {
                            isPassed = false; // Если будущая — всё ярко
                        } else if (isPastDay) {
                            isPassed = true; // На этой неделе: прошлые дни
                        } else if (isToday) {
                            // На этой неделе: сегодняшний день
                            let startMins = -1;
                            let endMins = -1;
                            const timeEl = row.querySelector('.eval');
                            if (timeEl) {
                                const timeMatch = timeEl.textContent.match(/(\d{1,2}):(\d{2})/);
                                if (timeMatch) {
                                    startMins = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
                                    const explicitEndTime = row.getAttribute('data-end-time');
                                    if (explicitEndTime) {
                                        const ep = explicitEndTime.split(':');
                                        endMins = parseInt(ep[0]) * 60 + parseInt(ep[1]);
                                    } else {
                                        endMins = startMins + 90;
                                    }
                                }
                            }

                            if (startMins !== -1 && endMins !== -1) {
                                if (todayMins >= endMins) isPassed = true;
                            }
                        }

                        if (isPassed) {
                            row.classList.add('pair-passed');
                        } else {
                            row.classList.remove('pair-passed');
                        }
                    });
                });
            }
            dimTeacherPastPairs();
            setInterval(dimTeacherPastPairs, 60000);

            // Лайв-индикаторы
            if (typeof updateLiveTimetable === 'function') {
                updateLiveTimetable();
            }
        }
    }
}
