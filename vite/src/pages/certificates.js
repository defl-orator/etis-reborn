import { pageCtx } from '../app/context.js';
import { escapeHTML } from '../utils/security.ts';

// Оформляет страницу заказа и просмотра справок
export function renderCertificatesPage() {
    const action = pageCtx.urlParams.get('p_action');

    let greenText = "Справки выдаются лично заявителю, либо доверенному лицу, если его ФИО будет написано в «Примечаниях» при заказе справки.";
    const greenSpan = pageCtx.span9.querySelector('span[style*="00b050"]');
    if (greenSpan && greenSpan.textContent.trim()) {
        greenText = greenSpan.textContent.trim();
    }

    // Формирует подвал со сроками изготовления, контактами ОКО и памяткой
    const appendCertFooter = (container) => {
        const footerContainer = document.createElement('div');
        footerContainer.style.marginTop = '4rem';

        const footerGrid = document.createElement('div');
        footerGrid.className = 'cert-footer-grid';
        footerGrid.style.marginTop = '0';

        const infoCard = document.createElement('div');
        infoCard.className = 'cert-footer-card';
        infoCard.innerHTML = `
                                <span class="material-icons">timer</span>
                                <div class="cert-footer-card-content">
                                    Справки готовятся в течение <b>3 рабочих дней</b>.<br>
                                    Готовые документы выдаются в отделе кадров обучающихся (ОКО).
                                    <small>Важно: не путайте с отделом кадров сотрудников.</small>
                                </div>
                            `;

        const contactCard = document.createElement('div');
        contactCard.className = 'cert-footer-card';
        contactCard.innerHTML = `
                                <span class="material-icons">place</span>
                                <div class="cert-footer-card-content">
                                    Корпус №8 ПГНИУ, <b>каб. 214</b><br>
                                    Пн – Чт: 8:30 – 17:30 (Пт до 16:30)<br>
                                    Тел: (342) 2-396-135
                                    <small>Суббота и воскресенье — выходные дни.</small>
                                </div>
                            `;

        footerGrid.appendChild(infoCard);
        footerGrid.appendChild(contactCard);
        footerContainer.appendChild(footerGrid);

        const alert = document.createElement('div');
        alert.className = 'cert-alert-box';
        alert.style.margin = '2rem 0 0 0';

        const mainText = document.createElement('div');
        mainText.style.display = 'flex';
        mainText.style.alignItems = 'center';
        mainText.style.gap = '1.2rem';
        mainText.innerHTML = `<span class="material-icons" style="font-size: 2.6rem; color: var(--color-green);">info</span>` +
                            `<div>${greenText}</div>`;
        alert.appendChild(mainText);

        const finalNote = document.createElement('div');
        finalNote.style.cssText = 'margin-top: 1.6rem; padding-top: 1.6rem; border-top: 1px solid rgba(52, 199, 89, 0.2); font-weight: 600; font-size: 1.3rem; display: flex; align-items: center; gap: 1.2rem; color: var(--color-green);';
        finalNote.innerHTML = '<span class="material-icons" style="font-size: 2.6rem;">track_changes</span><div>Просим отслеживать статус заявки в личном кабинете</div>';
        alert.appendChild(finalNote);

        footerContainer.appendChild(alert);
        container.appendChild(footerContainer);
    };

    if (action === 'NEW' || action === 'VIEW') {
        while (pageCtx.span9.firstChild && (pageCtx.span9.firstChild.tagName === 'BR' || (pageCtx.span9.firstChild.nodeType === Node.TEXT_NODE && !pageCtx.span9.firstChild.textContent.trim()))) {
            pageCtx.span9.firstChild.remove();
        }

        pageCtx.span9.querySelectorAll('h2, h3').forEach(h => h.remove());

        const paper = pageCtx.span9.querySelector('.bgprj');
        if (paper) {
            paper.classList.add('info-block-anim');
            paper.style.background = 'var(--color-card)';
            paper.style.border = '1px solid var(--color-table-border)';
            paper.style.borderRadius = 'var(--radius-medium)';
            paper.style.boxShadow = 'var(--shadow-main)';
            paper.style.color = 'var(--color-text-primary)';
            paper.style.width = '100%';
            paper.style.boxSizing = 'border-box';
            paper.style.padding = '2.4rem';
            paper.querySelectorAll('font').forEach(f => {
                if (f.style.color === 'black' || !f.style.color) f.style.color = 'inherit';
            });
        }

        const questionBlock = pageCtx.span9.querySelector('.question');
        if (questionBlock) {
            questionBlock.classList.add('info-block-anim');
            questionBlock.style.background = 'var(--color-card)';
            questionBlock.style.padding = '2.4rem';
            questionBlock.style.borderRadius = 'var(--radius-medium)';
            questionBlock.style.boxShadow = 'var(--shadow-main)';
            questionBlock.style.marginTop = '2.4rem';
            questionBlock.style.border = 'none';

            questionBlock.querySelectorAll('textarea').forEach(ta => {
                ta.style.width = '100%';
                ta.style.boxSizing = 'border-box';
                ta.style.padding = '1.2rem';
                ta.style.borderRadius = 'var(--radius-small)';
                ta.style.border = '1px solid var(--color-table-border)';
                ta.style.background = 'var(--color-input)';
                ta.style.color = 'var(--color-text-primary)';
                ta.style.fontSize = '1.3rem';
                ta.style.fontFamily = 'inherit';
                ta.style.marginTop = '0.8rem';
                ta.style.resize = 'vertical';
            });
        }

        const tables = Array.from(pageCtx.span9.querySelectorAll('table')).filter(t => !paper?.contains(t) && !questionBlock?.contains(t));
        tables.forEach(table => {
            table.classList.add('info-block-anim');
            table.style.background = 'var(--color-card)';
            table.style.padding = '2rem';
            table.style.borderRadius = 'var(--radius-medium)';
            table.style.boxShadow = 'var(--shadow-main)';
            table.style.marginTop = '2.4rem';
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';

            table.querySelectorAll('td').forEach(td => {
                td.style.padding = '1rem 1.6rem';
                td.style.fontSize = '1.3rem';
                td.style.borderBottom = '1px solid var(--color-table-border)';
            });

            const lastRowTds = table.querySelectorAll('tr:last-child td');
            lastRowTds.forEach(td => td.style.borderBottom = 'none');
        });

        const btnWrap = pageCtx.span9.querySelector('.button_gray');
        if (btnWrap) {
            btnWrap.style.marginTop = '2.4rem';
            btnWrap.style.width = '100%';
            btnWrap.style.textAlign = 'left';
            const btn = btnWrap.querySelector('button');
            if (btn) {
                btn.className = 'answer-btn-custom';
                btn.innerHTML = '<span class="material-icons" style="font-size:2rem; margin-right:8px">send</span>' + btn.innerHTML;
                btn.style.padding = '1.2rem 2.4rem';
                btn.style.fontSize = '1.4rem';
            }
        }

        const grayText = pageCtx.span9.querySelector('font[color="#808080"]');
        if (grayText) grayText.remove();

        pageCtx.span9.querySelectorAll('br').forEach(br => {
            if (!paper?.contains(br) && !questionBlock?.contains(br)) br.remove();
        });

        appendCertFooter(pageCtx.span9);

    } else {
        const allHeaders = Array.from(pageCtx.span9.querySelectorAll('h3'));
        const allLists = Array.from(pageCtx.span9.querySelectorAll('ul.orders'));

        pageCtx.span9.innerHTML = '';

        const headNew = allHeaders.find(h => h.textContent.includes('Заказать'));
        if (headNew && allLists[0]) {
            const container = document.createElement('div');
            container.className = 'advice-container';
            container.style.setProperty('margin-top', '0', 'important');
            allLists[0].querySelectorAll('a').forEach(link => {
                const card = document.createElement('a');
                card.className = 'advice-card';
                card.href = link.href;
                card.innerHTML = `<span class="material-icons">add_circle_outline</span><span class="advice-label">${escapeHTML(link.textContent.trim())}</span>`;
                container.appendChild(card);
            });
            pageCtx.span9.appendChild(container);
        }

        const headHistory = allHeaders.find(h => h.textContent.includes('Мои справки'));
        const historyList = allLists.length > 1 ? allLists[1] : (allLists[0] && !headNew ? allLists[0] : null);

        if (headHistory && historyList) {
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '1.4rem';
            container.style.setProperty('margin-top', (headNew && allLists[0]) ? '4rem' : '0', 'important');

            historyList.querySelectorAll('a').forEach(link => {
            const fullText = link.textContent.trim();

            const match = fullText.match(/^(\d{2}\.\d{2}\.\d{4})\s+(.*?)\s+\(код запроса:\s*(.*?),\s*статус:\s*(.*?)\)$/i);

            const card = document.createElement('a');
            card.href = link.href;
            card.className = 'order-card';

            if (match) {
                const date = match[1];
                const title = match[2];
                const code = match[3];
                const rawStatus = match[4].toLowerCase();

                let statusBg = 'var(--color-highlight)';
                let statusColor = 'var(--color-text-secondary)';
                let displayStatus = rawStatus;

                if (rawStatus.includes('готов')) {
                    statusBg = 'rgba(52, 199, 89, 0.15)';
                    statusColor = 'var(--color-green)';
                    displayStatus = 'ГОТОВО';
                }
                else if (rawStatus.includes('обработк') || rawStatus.includes('заявка')) {
                    statusBg = 'rgba(255, 149, 0, 0.15)';
                    statusColor = 'var(--color-warning)';
                    displayStatus = 'ОБРАБОТКА';
                }
                else if (rawStatus.includes('отказ') || rawStatus.includes('отклон')) {
                    statusBg = 'rgba(255, 59, 48, 0.15)';
                    statusColor = 'var(--color-red)';
                    displayStatus = 'ОТКАЗ';
                }

                card.innerHTML = `
                                        <div class="order-icon-box">
                                            <span class="material-icons">history_edu</span>
                                        </div>
                                        <div class="order-info" style="min-width: 0; flex: 1;">
                                            <div class="order-meta">${date} • Запрос ${code}</div>
                                            <div class="order-title" style="white-space: normal; overflow: hidden; text-overflow: ellipsis;">${title}</div>
                                        </div>
                                        <div style="font-size: 1.05rem; font-weight: 800; text-transform: uppercase; padding: 0 1.2rem; height: 2.4rem; border-radius: 50px; letter-spacing: 0.5px; white-space: nowrap; background: ${statusBg}; color: ${statusColor}; margin-left: 10px; flex-shrink: 0; align-self: center; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">
                                            ${displayStatus}
                                        </div>
                                    `;
            } else {
                    card.innerHTML = `
                                            <div class="order-icon-box">
                                                <span class="material-icons">history_edu</span>
                                            </div>
                                            <div class="order-info">
                                                <div class="order-title">${fullText}</div>
                                            </div>
                                        `;
                }
                container.appendChild(card);
            });
            pageCtx.span9.appendChild(container);
        }

        appendCertFooter(pageCtx.span9);
    }
    return;
}
