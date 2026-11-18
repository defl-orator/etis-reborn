import { pageCtx } from '../app/context.js';
import { escapeHTML } from '../utils/security.ts';

export function renderThemePage() {
    const topBar = document.createElement('div');
    topBar.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 2.4rem; flex-wrap: wrap; width: 100%; box-sizing: border-box;';

    const backBtn = document.createElement('a');
    backBtn.href = 'javascript:window.history.back()';
    backBtn.className = 'answer-btn-custom';
    backBtn.style.cssText = 'display: inline-flex !important; align-items: center !important; gap: 8px !important; padding: 0.8rem 1.8rem !important; height: auto !important; border-radius: 50px !important; width: fit-content !important; cursor: pointer !important; text-decoration: none !important; border: none !important;';
    backBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem;">arrow_back</span><span>Назад</span>';
    topBar.appendChild(backBtn);

    const estimateLink = pageCtx.span9.querySelector('a[href*="cust.estimate_tpr_form"], a[href*="cust.estimate_tt_form"]');
    if (estimateLink) {
        estimateLink.className = 'estimate-tpr-top-btn';
        estimateLink.style.cssText = 'display: inline-flex !important; align-items: center !important; gap: 8px !important; background: var(--color-card) !important; color: var(--color-text-primary) !important; -webkit-text-fill-color: var(--color-text-primary) !important; box-shadow: var(--shadow-main) !important; border: 1px solid var(--color-table-border) !important; cursor: pointer !important; text-decoration: none !important; padding: 0.8rem 1.8rem !important; height: auto !important; font-weight: 600 !important; border-radius: 50px !important; font-size: 1.3rem !important; transition: all 0.2s ease !important;';
        estimateLink.innerHTML = '<span class="material-icons" style="font-size: 1.8rem; color: var(--color-accent); line-height: 1;">rate_review</span><span style="color: var(--color-text-primary) !important; -webkit-text-fill-color: var(--color-text-primary) !important;">Оставить отзыв</span>';
        
        estimateLink.onmouseenter = () => { estimateLink.style.background = 'var(--color-highlight)'; };
        estimateLink.onmouseleave = () => { estimateLink.style.background = 'var(--color-card)'; };
        
        topBar.appendChild(estimateLink);
    }
    pageCtx.span9.prepend(topBar);

    // 1. Оформляем заголовок дисциплины / темы
    const h2 = pageCtx.span9.querySelector('h2');
    if (h2) {
        const heroCard = document.createElement('div');
        heroCard.className = 'tpr-card';
        heroCard.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large); padding: 2.4rem 2.4rem 2rem 2.4rem; box-shadow: var(--shadow-main); margin-bottom: 2.4rem; border: 1px solid var(--color-table-border);';

        const parts = h2.innerHTML.split(/<br\s*\/?>/i);
        if (parts.length > 1) {
            heroCard.innerHTML = `
                                    <div style="font-size: 1.2rem; color: var(--color-accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.8rem;">
                                        ${parts[0].replace(/«/g, '').replace(/»/g, '').trim()}
                                    </div>
                                    <div style="font-size: 2.2rem; font-weight: 800; line-height: 1.3; color: var(--color-text-primary);">
                                        ${parts[1].replace(/«/g, '').replace(/»/g, '').trim()}
                                    </div>
                                `;
        } else {
            let text = h2.textContent.trim();
            let badgeLabel = 'Учебно-методический комплекс по дисциплине';
            if (text.toLowerCase().startsWith('тема')) {
                badgeLabel = 'Тема';
                text = text.replace(/^Тема\s*/i, '');
            }
            heroCard.innerHTML = `
                                    <div style="font-size: 1.2rem; color: var(--color-accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.8rem;">
                                        ${badgeLabel}
                                    </div>
                                    <div style="font-size: 2.2rem; font-weight: 800; line-height: 1.3; color: var(--color-text-primary);">
                                        ${text.replace(/«/g, '').replace(/»/g, '').trim()}
                                    </div>
                                `;
        }
        h2.replaceWith(heroCard);
    }

    pageCtx.span9.querySelectorAll(':scope > br').forEach(br => br.remove());

    // 2. Оформление списка тем (.themes)
    const themesContainer = pageCtx.span9.querySelector('.themes');
    if (themesContainer) {
        const themesCard = document.createElement('div');
        themesCard.className = 'tpr-card';
        themesCard.style.cssText = 'padding: 2.4rem 2.4rem 2rem 2.4rem;';

        let themesTitleText = 'Темы';
        let prevH3 = themesContainer.previousElementSibling;
        if (prevH3 && prevH3.tagName === 'H3' && (prevH3.textContent.toLowerCase().includes('тем') || prevH3.textContent.toLowerCase().includes('содержан'))) {
            themesTitleText = prevH3.textContent.trim();
            prevH3.remove();
        }

        const themesList = document.createElement('div');
        themesList.className = 'themes-list';

        const themeElements = Array.from(themesContainer.querySelectorAll('.theme'));
        themeElements.forEach(themeEl => {
            const textRaw = themeEl.textContent.trim();
            const isModuleHeader = themeEl.style.paddingLeft === '0px' || themeEl.style.paddingLeft === '0' || textRaw.toLowerCase().startsWith('раздел') || textRaw.toLowerCase().startsWith('модуль');
            const link = themeEl.querySelector('a');
            const hourSpan = themeEl.querySelector('.hour');
            const ctlBadge = themeEl.querySelector('.badge.ctl');

            const row = document.createElement('div');
            row.className = isModuleHeader ? 'theme-item module-header' : 'theme-item';

            let pillsHtml = '';
            if (hourSpan && hourSpan.textContent.trim()) {
                pillsHtml += `<span class="theme-hour-pill" style="${isModuleHeader ? 'background: var(--color-card) !important;' : ''}">${hourSpan.textContent.trim()}</span>`;
            }
            if (ctlBadge && ctlBadge.textContent.trim()) {
                pillsHtml += `<span class="badge ctl">${ctlBadge.textContent.trim()}</span>`;
            }

            if (isModuleHeader) {
                let cleanTitle = textRaw;
                if (hourSpan) cleanTitle = cleanTitle.replace(hourSpan.textContent.trim(), '').trim();
                if (ctlBadge) cleanTitle = cleanTitle.replace(ctlBadge.textContent.trim(), '').trim();

                row.innerHTML = `
                                        <div style="font-weight: 800; font-size: 1.4rem; color: var(--color-text-primary); line-height: 1.35; flex: 1;">
                                            ${cleanTitle}
                                        </div>
                                        ${pillsHtml ? `<div class="theme-meta-pills">${pillsHtml}</div>` : ''}
                                    `;
            } else if (link) {
                row.innerHTML = `
                                        <a href="${link.href}" class="theme-title-link">
                                            ${link.textContent.trim()}
                                        </a>
                                        ${pillsHtml ? `<div class="theme-meta-pills">${pillsHtml}</div>` : ''}
                                    `;
            } else {
                row.innerHTML = `
                                        <div style="font-weight: 600; color: var(--color-text-primary); font-size: 1.4rem; line-height: 1.4; flex: 1;">
                                            ${textRaw}
                                        </div>
                                        ${pillsHtml ? `<div class="theme-meta-pills">${pillsHtml}</div>` : ''}
                                    `;
            }

            themesList.appendChild(row);
        });

        themesCard.innerHTML = `
                                <div class="tpr-card-header">
                                    <div class="tpr-card-title">
                                        <span class="material-icons">list_alt</span>
                                        <span>${themesTitleText}</span>
                                    </div>
                                    <span style="background: var(--color-accent-active); color: var(--color-accent); padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.15rem;">
                                        ${themeElements.length} тем
                                    </span>
                                </div>
                            `;
        themesCard.appendChild(themesList);
        themesContainer.replaceWith(themesCard);
    }

    // --- ТРАНСФОРМЕР ТАБЛИЦ ОЦЕНИВАНИЯ ---
    const transformIndicatorsTable = (table) => {
        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.8rem; margin-top: 0.8rem; margin-bottom: 0 !important; width: 100%; box-sizing: border-box;';

        const itemsData = [];
        table.querySelectorAll('tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                const scoreText = tds[0].textContent.trim();
                const descText = tds[tds.length - 1].textContent.trim();
                if (scoreText && descText) {
                    itemsData.push({ score: scoreText, desc: descText });
                }
            }
        });

        if (itemsData.length === 0) return null;

        const numericScores = itemsData
            .map(i => parseFloat(i.score.replace(',', '.')))
            .filter(n => !isNaN(n));
        const maxScoreVal = numericScores.length > 0 ? Math.max(...numericScores) : null;
        const minScoreVal = numericScores.length > 0 ? Math.min(...numericScores) : null;

        itemsData.forEach(item => {
            const s = item.score.toLowerCase();
            const numVal = parseFloat(item.score.replace(',', '.'));
            let display = item.score;
            let bg = 'var(--color-highlight)';
            let color = 'var(--color-text-primary)';

            // 1. Числовые баллы
            if (!isNaN(numVal) && maxScoreVal !== null && minScoreVal !== null && maxScoreVal !== minScoreVal) {
                display = String(numVal);
                if (numVal === maxScoreVal) {
                    bg = 'rgba(255, 184, 0, 0.18)';
                    color = '#FFB800';
                } else if (numVal === minScoreVal) {
                    bg = 'rgba(52, 199, 89, 0.15)';
                    color = 'var(--color-green)';
                } else {
                    bg = 'rgba(0, 122, 255, 0.15)';
                    color = 'var(--color-blue)';
                }
            }
            // 2. Словесные оценки (неуд проверяется первым)
            else if (s.includes('неуд') || s.includes('незач') || s === '2' || s === '0') {
                display = s.includes('незач') ? 'Незачет' : '2';
                bg = 'rgba(255, 59, 48, 0.15)';
                color = 'var(--color-red)';
            } else if (s.includes('отлич') || s === '5') {
                display = '5';
                bg = 'rgba(52, 199, 89, 0.15)';
                color = 'var(--color-green)';
            } else if (s.includes('хор') || s === '4') {
                display = '4';
                bg = 'rgba(0, 122, 255, 0.15)';
                color = 'var(--color-blue)';
            } else if (s.includes('удовл') || s === '3') {
                display = '3';
                bg = 'rgba(255, 149, 0, 0.15)';
                color = 'var(--color-warning)';
            } else if (s.includes('зач')) {
                display = 'Зачет';
                bg = 'rgba(52, 199, 89, 0.15)';
                color = 'var(--color-green)';
            }

            const rowItem = document.createElement('div');
            rowItem.style.cssText = 'display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 1.4rem 1.6rem; background: var(--color-highlight); border-radius: var(--radius-medium); border: 1px solid var(--color-table-border); box-sizing: border-box; width: 100%; text-align: left;';

            rowItem.innerHTML = `
                                    <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 8px; font-size: 1.4rem; font-weight: 800; background: ${bg}; color: ${color}; line-height: 1;">
                                        ${display}
                                    </div>
                                    <div style="font-size: 1.35rem; color: var(--color-text-primary); line-height: 1.5; font-weight: 500; text-align: left; width: 100%;">
                                        ${item.desc}
                                    </div>
                                `;
            listContainer.appendChild(rowItem);
        });

        return listContainer;
    };

    // 3. Упаковка H3 секций
    const h3List = Array.from(pageCtx.span9.querySelectorAll('h3'));

    h3List.forEach(h3 => {
        const titleRaw = h3.textContent.trim();
        const titleLower = titleRaw.toLowerCase();

        const sectionElements = [];
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'H3' && !next.classList.contains('tpr-card')) {
            sectionElements.push(next);
            next = next.nextElementSibling;
        }

        if (sectionElements.length === 0) {
            h3.remove();
            return;
        }

        // === СПЕЦИАЛЬНАЯ ОБРАБОТКА "ПЛАНИРУЕМЫЙ РЕЗУЛЬТАТ ОБУЧЕНИЯ" ===
        // Заменяем единый блок на отдельные карточки под каждый результат
        if (titleLower.includes('результат') || titleLower.includes('планируем')) {
            const el = sectionElements.find(e => e.classList?.contains('tpr_part') || e.querySelector?.('table'));
            if (el) {
                const outcomeDivs = Array.from(el.children).filter(child => child.tagName === 'DIV' && child.querySelector('table'));
                if (outcomeDivs.length > 0) {
                    outcomeDivs.forEach((outcomeDiv, idx) => {
                        const descDiv = outcomeDiv.querySelector(':scope > div:first-child');
                        let lines = [];
                        if (descDiv) {
                            lines = descDiv.innerHTML.split(/<br\s*\/?>/i)
                                .map(s => s.replace(/<[^>]+>/g, '').trim())
                                .filter(Boolean);
                        }

                        const table = outcomeDiv.querySelector('table');
                        const transformedCards = table ? transformIndicatorsTable(table) : null;

                        // Создаём отдельную полноценную карточку под результат
                        const outcomeCard = document.createElement('div');
                        outcomeCard.className = 'tpr-card';
                        outcomeCard.style.cssText = 'padding: 2.4rem 2.4rem 2rem 2.4rem;';
                        outcomeCard.innerHTML = `
                                                <div class="tpr-card-header">
                                                    <div class="tpr-card-title">
                                                        <span class="material-icons">flag</span>
                                                        <span>Планируемый результат обучения ${outcomeDivs.length > 1 ? (idx + 1) : ''}</span>
                                                    </div>
                                                </div>
                                            `;

                        const cardBody = document.createElement('div');
                        cardBody.style.cssText = 'display: flex; flex-direction: column; width: 100%; box-sizing: border-box; font-size: 1.35rem; line-height: 1.6; color: var(--color-text-primary); margin: 0; padding: 0;';

                        // Описание результата чистым текстом прямо под шапкой (без рамок)
                        if (lines.length > 0) {
                            const descEl = document.createElement('div');
                            descEl.style.cssText = 'font-size: 1.35rem; line-height: 1.6; color: var(--color-text-primary); text-align: left; margin-bottom: 1.2rem;';
                            descEl.innerHTML = lines.join('<br>');
                            cardBody.appendChild(descEl);
                        }

                        // Подзаголовок критериев оценивания
                        const criteriaHeader = document.createElement('div');
                        criteriaHeader.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 1.35rem; font-weight: 800; color: var(--color-text-primary); margin-top: 0.4rem; margin-bottom: 0.8rem; text-align: left;';
                        criteriaHeader.innerHTML = `
                                                <span class="material-icons" style="font-size: 1.8rem; color: var(--color-accent);">rule</span>
                                                <span>Критерии оценивания</span>
                                            `;
                        cardBody.appendChild(criteriaHeader);

                        // Карточки с баллами
                        if (transformedCards) {
                            cardBody.appendChild(transformedCards);
                        }

                        if (cardBody.lastElementChild) {
                            cardBody.lastElementChild.style.marginBottom = '0';
                        }

                        outcomeCard.appendChild(cardBody);
                        h3.parentNode.insertBefore(outcomeCard, h3);
                    });

                    h3.remove();
                    sectionElements.forEach(s => s.remove());
                    return;
                }
            }
        }

        // Для всех остальных секций (Трудоемкость, Аннотация, Контроль и т.д.)
        let iconName = 'category';
        if (titleLower.includes('показател') || titleLower.includes('шкал')) iconName = 'fact_check';
        else if (titleLower.includes('контрол') || titleLower.includes('оцен')) iconName = 'fact_check';
        else if (titleLower.includes('вопрос') || titleLower.includes('аттестац')) iconName = 'quiz';
        else if (titleLower.includes('трудоемкост')) iconName = 'schedule';
        else if (titleLower.includes('аннотац') || titleLower.includes('цел')) iconName = 'description';
        else if (titleLower.includes('литератур')) iconName = 'menu_book';
        else if (titleLower.includes('преподават')) iconName = 'groups';
        else if (titleLower.includes('материал') || titleLower.includes('аудитор')) iconName = 'apartment';
        else if (titleLower.includes('программн') || titleLower.includes('интернет')) iconName = 'devices';

        const card = document.createElement('div');
        card.className = 'tpr-card';
        card.style.cssText = 'padding: 2.4rem 2.4rem 2rem 2.4rem;';
        card.innerHTML = `
                                <div class="tpr-card-header">
                                    <div class="tpr-card-title">
                                        <span class="material-icons">${iconName}</span>
                                        <span>${titleRaw}</span>
                                    </div>
                                </div>
                            `;

        const cardBody = document.createElement('div');
        cardBody.style.cssText = 'display: flex; flex-direction: column; width: 100%; box-sizing: border-box; font-size: 1.35rem; line-height: 1.6; color: var(--color-text-primary); margin: 0; padding: 0;';

        sectionElements.forEach(el => {
            el.style.marginLeft = '0';
            el.style.paddingLeft = '0';
            el.querySelectorAll('*').forEach(child => {
                if (child.style) {
                    child.style.marginLeft = '0';
                    child.style.paddingLeft = '0';
                }
            });

            // Стилизация блока "Контроль"
            if (titleLower.includes('контрол')) {
                const ctlHoursEl = el.querySelector('.ctl_hours');
                let hoursText = ctlHoursEl ? ctlHoursEl.textContent.trim() : '';
                if (ctlHoursEl) ctlHoursEl.remove();

                const allDivs = Array.from(el.querySelectorAll('div'));
                const eventNameDiv = allDivs.find(d => {
                    const t = d.textContent;
                    return (t.includes('мероприятие') || t.includes('контроль')) && !t.includes('Проходной') && !t.includes('Максимальный') && !t.includes('рейтинг');
                });

                if (eventNameDiv) {
                    const rawText = eventNameDiv.textContent.replace(/^[\s:]+|[\s:]+$/g, '').trim();
                    const matchEvent = rawText.match(/(.*?)\s*[-–:]\s*(.*)/);
                    const workType = matchEvent ? matchEvent[1].trim() : 'Контроль';
                    const eventTitle = matchEvent ? matchEvent[2].trim() : rawText;

                    const headerCard = document.createElement('div');
                    headerCard.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 1.2rem 1.6rem; background: var(--color-highlight); border-radius: var(--radius-medium); border: 1px solid var(--color-table-border); margin-bottom: 1.2rem; flex-wrap: wrap;';
                    headerCard.innerHTML = `
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <span style="background: rgba(0, 122, 255, 0.12); color: var(--color-blue); padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 1.1rem; font-weight: 800; text-transform: uppercase;">
                                                    ${workType}
                                                </span>
                                                <span style="font-weight: 700; font-size: 1.4rem; color: var(--color-text-primary);">
                                                    ${eventTitle}
                                                </span>
                                            </div>
                                            ${hoursText ? `
                                            <div style="display: inline-flex; align-items: center; gap: 6px; color: var(--color-text-secondary); font-weight: 600; font-size: 1.25rem;">
                                                <span class="material-icons" style="font-size: 1.6rem; color: var(--color-accent);">timer</span>
                                                <span>${hoursText}</span>
                                            </div>` : ''}
                                        `;
                    eventNameDiv.replaceWith(headerCard);
                }

                allDivs.forEach(div => {
                    if (div.textContent.toLowerCase().includes('контролируемые элементы')) {
                        const p = div.querySelector('p');
                        let items = [];
                        if (p) {
                            items = p.innerHTML.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
                        } else {
                            items = div.innerHTML.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 5 && !s.toLowerCase().includes('контролируемые'));
                        }

                        if (items.length > 0) {
                            const listWrap = document.createElement('div');
                            listWrap.style.cssText = 'margin-top: 1.6rem; margin-bottom: 1.4rem;';
                            listWrap.innerHTML = `
                                                    <div style="display: flex; align-items: center; gap: 8px; font-size: 1.35rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 1rem;">
                                                        <span class="material-icons" style="font-size: 1.8rem; color: var(--color-accent);">checklist</span>
                                                        <span>Контролируемые элементы</span>
                                                    </div>
                                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                                        ${items.map(it => `
                                                            <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 1.35rem; line-height: 1.5; color: var(--color-text-secondary);">
                                                                <span class="material-icons" style="font-size: 1.6rem; color: var(--color-accent); flex-shrink: 0; margin-top: 2px;">check_circle</span>
                                                                <span>${it}</span>
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                `;
                            div.replaceWith(listWrap);
                        }
                    }
                });

                allDivs.forEach(div => {
                    if (div.textContent.toLowerCase().includes('показатель оценивания') && div.querySelector('table')) {
                        const heading = document.createElement('div');
                        heading.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 1.35rem; font-weight: 800; color: var(--color-text-primary); margin-top: 1.6rem; margin-bottom: 0.8rem;';
                        heading.innerHTML = `
                                                <span class="material-icons" style="font-size: 1.8rem; color: var(--color-accent);">rule</span>
                                                <span>Критерии начисления баллов</span>
                                            `;
                        div.prepend(heading);

                        Array.from(div.childNodes).forEach(n => {
                            if (n.nodeType === Node.TEXT_NODE && n.textContent.includes('Показатель')) n.remove();
                        });
                    }
                });
            }

            // Преобразование таблиц с критериями
            const tables = Array.from(el.querySelectorAll('table'));
            if (el.tagName === 'TABLE') tables.push(el);

            tables.forEach(tbl => {
                const transformed = transformIndicatorsTable(tbl);
                if (transformed) {
                    tbl.replaceWith(transformed);
                }
            });

            // Обычные таблицы оборачиваем в скролл
            el.querySelectorAll?.('table').forEach(table => {
                table.removeAttribute('style');
                table.removeAttribute('width');
                table.removeAttribute('border');
                table.removeAttribute('bgcolor');
                table.removeAttribute('align');
                table.className = 'common';

                if (!table.parentNode.classList.contains('wide-table-wrapper')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'wide-table-wrapper';
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                }
            });

            if (el.tagName === 'TABLE') {
                el.removeAttribute('style');
                el.removeAttribute('width');
                el.removeAttribute('border');
                el.className = 'common';

                const wrapper = document.createElement('div');
                wrapper.className = 'wide-table-wrapper';
                wrapper.appendChild(el);
                cardBody.appendChild(wrapper);
                return;
            }

            // Блок "Трудоемкость"
            if (titleLower.includes('трудоемкост')) {
                el.querySelectorAll('div').forEach(child => {
                    const text = child.textContent.trim();
                    const match = text.match(/(.*?)\s*[–-]\s*(.*)/);
                    if (match) {
                        const type = match[1].trim();
                        const hours = match[2].trim();

                        let bg = 'var(--color-highlight)', color = 'var(--color-text-secondary)', rowIcon = 'circle';
                        if (type.toLowerCase().includes('лекц')) { bg = 'rgba(0, 122, 255, 0.12)'; color = 'var(--color-blue)'; rowIcon = 'menu_book'; }
                        else if (type.toLowerCase().includes('практ')) { bg = 'rgba(52, 199, 89, 0.12)'; color = 'var(--color-green)'; rowIcon = 'engineering'; }
                        else if (type.toLowerCase().includes('лаб')) { bg = 'rgba(255, 149, 0, 0.12)'; color = 'var(--color-warning)'; rowIcon = 'science'; }
                        else if (type.toLowerCase().includes('самост')) { bg = 'rgba(175, 82, 222, 0.15)'; color = '#AF52DE'; rowIcon = 'person'; }
                        else if (type.toLowerCase().includes('контр') || type.toLowerCase().includes('зачет') || type.toLowerCase().includes('экзамен')) { bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)'; rowIcon = 'fact_check'; }

                        child.innerHTML = `
                                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.6rem; background: var(--color-highlight); border-radius: var(--radius-medium); border: 1px solid var(--color-table-border); margin-bottom: 0.8rem;">
                                                    <div style="display: flex; align-items: center; gap: 12px; font-weight: 600;">
                                                        <span class="material-icons" style="color: ${color}; font-size: 2rem;">${rowIcon}</span>
                                                        <span>${type}</span>
                                                    </div>
                                                    <span style="background: ${bg}; color: ${color}; padding: 0.4rem 1.2rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; white-space: nowrap;">${hours}</span>
                                                </div>
                                            `;
                    }
                });
            }

            // Плашки баллов
            if (titleLower.includes('контрол') || titleLower.includes('оцен')) {
                let passScore = '', maxScore = '', ratingScore = '';
                let passEl = null, maxEl = null, ratingEl = null;

                Array.from(el.children || []).forEach(child => {
                    const cText = child.textContent.trim().toLowerCase();
                    if (cText.includes('проходной балл')) { passScore = child.textContent.split(/[-–:]/)[1]?.trim(); passEl = child; }
                    else if (cText.includes('максимальный балл')) { maxScore = child.textContent.split(/[-–:]/)[1]?.trim(); maxEl = child; }
                    else if (cText.includes('в рейтинг')) { ratingScore = child.textContent.split(/[-–:]/)[1]?.trim(); ratingEl = child; }
                });

                if (passScore || maxScore || ratingScore) {
                    const statsGrid = document.createElement('div');
                    statsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 1.2rem; margin: 1.2rem 0; width: 100%; box-sizing: border-box;';

                    const createStat = (label, val, bg, border, color) => val ? `
                                            <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 1.2rem 1.4rem; border-radius: var(--radius-medium); background: ${bg}; border: 1px solid ${border};">
                                                <span style="font-size: 2rem; font-weight: 800; color: ${color}; line-height: 1;">${val}</span>
                                                <span style="font-size: 1.05rem; font-weight: 700; color: ${color}; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">${label}</span>
                                            </div>` : '';

                    statsGrid.innerHTML = `
                                            ${createStat('Максимум', maxScore, 'rgba(0, 122, 255, 0.1)', 'rgba(0, 122, 255, 0.25)', 'var(--color-blue)')}
                                            ${createStat('В рейтинг', ratingScore, 'var(--color-accent-active)', 'var(--color-accent)', 'var(--color-accent)')}
                                            ${createStat('Проходной', passScore, 'rgba(52, 199, 89, 0.1)', 'rgba(52, 199, 89, 0.25)', 'var(--color-green)')}
                                        `;

                    if (passEl) passEl.replaceWith(statsGrid);
                    if (maxEl) maxEl.remove();
                    if (ratingEl) ratingEl.remove();
                }

                el.querySelectorAll?.('.theme_file, .tpr_file, a[href*="file_download"]').forEach(fileEl => {
                    const link = fileEl.tagName === 'A' ? fileEl : fileEl.querySelector('a');
                    if (link) {
                        link.className = 'file-attachment-link';
                        link.style.cssText = 'display: inline-flex !important; align-items: center !important; gap: 8px !important; text-decoration: none !important; background: var(--color-highlight) !important; border: 1px solid var(--color-table-border) !important; padding: 1rem 1.6rem !important; border-radius: 50px !important; margin: 0.5rem 0 !important; font-weight: 600 !important; font-size: 1.3rem !important;';
                        link.innerHTML = `<span class="material-icons" style="color: var(--color-text-secondary); font-size: 2rem;">description</span><span class="file-name">${escapeHTML(link.textContent.trim())}</span>`;
                    }
                });
            }

            cardBody.appendChild(el);
        });

        // Выравнивание нижнего отступа у карточки
        while (cardBody.lastChild && (cardBody.lastChild.tagName === 'BR' || (cardBody.lastChild.nodeType === Node.TEXT_NODE && !cardBody.lastChild.textContent.trim()))) {
            cardBody.lastChild.remove();
        }
        cardBody.querySelectorAll('.tpr_part, .theme_part').forEach(part => {
            while (part.lastChild && (part.lastChild.tagName === 'BR' || (part.lastChild.nodeType === Node.TEXT_NODE && !part.lastChild.textContent.trim()))) {
                part.lastChild.remove();
            }
            if (part.lastElementChild) {
                part.lastElementChild.style.marginBottom = '0';
            }
        });
        if (cardBody.lastElementChild) {
            cardBody.lastElementChild.style.marginBottom = '0';
        }

        card.appendChild(cardBody);
        h3.replaceWith(card);
    });

    pageCtx.span9.querySelectorAll('br, p:empty').forEach(el => el.remove());
    return;
}
