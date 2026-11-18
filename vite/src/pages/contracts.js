import { pageCtx } from '../app/context.js';
import { escapeHTML } from '../utils/security.ts';

export function renderContractsPage() {
    const isDetailedView = pageCtx.span9.querySelector('iframe[name="ifrmSber"]') || pageCtx.span9.querySelector('form[action="stu_pay.process_payment"]');

    if (isDetailedView) {
        // === СТРАНИЦА ОПЛАТЫ И ДЕТАЛИЗАЦИИ ДОГОВОРА ===

        // 0. Добавляем кнопку "Назад" на самый верх
        const backBtn = document.createElement('a');
        backBtn.href = 'stu_pay.contract_list';
        backBtn.className = 'answer-btn-custom';
        backBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; margin-bottom: 2.4rem; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; box-shadow: none !important; border: 1px solid var(--color-table-border) !important;';
        backBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem;">arrow_back</span> Назад к договорам';
        pageCtx.span9.prepend(backBtn);

        // 1. Красивое оформление заголовка и остатка по договору
        const mainH2 = pageCtx.span9.querySelector('h2');
        if (mainH2) mainH2.style.display = 'none'; // Скрываем дублирующийся "Договоры с ПГНИУ"

        const h3s = pageCtx.span9.querySelectorAll('h3');
        if (h3s.length >= 2) {
            const contractName = h3s[0].textContent.trim();
            const balanceText = h3s[1].textContent.trim();

            const infoCard = document.createElement('div');
            infoCard.style.cssText = 'background: var(--color-card); padding: 2.4rem; border-radius: var(--radius-large); box-shadow: var(--shadow-main); margin-bottom: 3rem; display: flex; flex-direction: column; gap: 1.6rem; border: 1px solid var(--color-table-border);';

            infoCard.innerHTML = `
                                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.4;">
                                        ${contractName}
                                    </div>
                                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary); background: var(--color-highlight); padding: 1.2rem 1.6rem; border-radius: var(--radius-small); display: inline-flex; width: fit-content; align-items: center; gap: 8px; border: 1px solid var(--color-table-border);">
                                        <span class="material-icons" style="color: var(--color-text-secondary);">account_balance_wallet</span>
                                        ${balanceText}
                                    </div>
                                `;

            h3s[0].replaceWith(infoCard);
            h3s[1].remove();
        }

        // 2. Убираем висячие заголовки и br, приводим в порядок подзаголовки таблиц
        pageCtx.span9.querySelectorAll('b').forEach(b => {
            if (b.textContent.includes('Информация о платежах') || b.textContent.includes('Совершить платёж')) {
                b.style.display = 'block';
                b.style.fontSize = '1.6rem';
                b.style.fontWeight = '800';
                b.style.color = 'var(--color-text-primary)';
                b.style.marginBottom = '1.6rem';
                b.style.marginTop = '3rem';
            }
        });
        pageCtx.span9.querySelectorAll('br').forEach(br => br.remove());

        // 3. Оборачиваем таблицы в скролл-контейнеры
        pageCtx.span9.querySelectorAll('table.slimtab_nice').forEach(table => {
            table.className = 'common';
            const wrapper = document.createElement('div');
            wrapper.className = 'wide-table-wrapper';
            wrapper.style.marginBottom = '2rem';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);

            // Делаем красивую кнопку из текстовой ссылки "ЧЕК"
            table.querySelectorAll('a').forEach(a => {
                if (a.textContent.includes('ЧЕК')) {
                    a.className = 'answer-btn-custom';
                    a.style.padding = '6px 12px';
                    a.style.fontSize = '1.2rem';
                    a.style.display = 'inline-flex';
                    a.style.alignItems = 'center';
                    a.style.gap = '6px';
                    a.innerHTML = '<span class="material-icons" style="font-size: 1.6rem;">receipt_long</span>Чек';
                }
            });
        });

        // 4. Превращаем зеленый текст в красивую плашку
        const greenNotice = pageCtx.span9.querySelector('font[color="green"]');
        if (greenNotice) {
            const noticeDiv = document.createElement('div');
            noticeDiv.className = 'cert-alert-box';
            noticeDiv.style.cssText = 'margin-bottom: 3rem; margin-top: 1rem; display: flex; align-items: center; gap: 1.2rem;';
            noticeDiv.innerHTML = `<span class="material-icons" style="font-size: 2.6rem; color: var(--color-green);">info</span><div style="line-height: 1.5; font-size: 1.3rem;">${greenNotice.innerHTML}</div>`;
            greenNotice.replaceWith(noticeDiv);
        }

        // 5. Оформляем форму оплаты
        const payForm = pageCtx.span9.querySelector('form[action="stu_pay.process_payment"]');
        if (payForm) {
            // Ищем заголовок формы
            let formTitleText = 'Совершить платёж';
            pageCtx.span9.querySelectorAll('b').forEach(b => {
                if (b.textContent.includes('Совершить платёж')) {
                    formTitleText = b.textContent;
                    b.remove(); // Удаляем старый заголовок из потока
                }
            });

            // Сохраняем важные элементы формы
            const amountInput = payForm.querySelector('input[name="p_amount"]');
            const emailInput = payForm.querySelector('input[name="p_email"]');
            const hiddenInputs = payForm.querySelectorAll('input[type="hidden"]');
            const submitBtn = payForm.querySelector('input[type="submit"]');

            // Очищаем старую кривую таблицу
            payForm.innerHTML = '';

            // Стилизуем саму карточку формы
            payForm.style.cssText = 'background: var(--color-card); padding: 3rem; border-radius: var(--radius-large); box-shadow: var(--shadow-main); margin-bottom: 2.4rem; max-width: 450px; display: flex; flex-direction: column; gap: 2rem; border: 1px solid var(--color-table-border);';

            // Добавляем красивый заголовок внутрь формы
            const titleEl = document.createElement('div');
            titleEl.style.cssText = 'font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px;';
            titleEl.innerHTML = `<span class="material-icons" style="color: var(--color-accent); font-size: 2.4rem;">payment</span>${formTitleText}`;
            payForm.appendChild(titleEl);

            // Поле: Сумма
            if (amountInput) {
                const group = document.createElement('div');
                group.style.cssText = 'display: flex; flex-direction: column; gap: 0.8rem;';

                const label = document.createElement('label');
                label.textContent = 'Сумма к оплате';
                label.style.cssText = 'font-size: 1.3rem; font-weight: 600; color: var(--color-text-secondary);';

                const inputWrap = document.createElement('div');
                inputWrap.style.cssText = 'display: flex; align-items: center; background: var(--color-input); border: 1px solid var(--color-table-border); border-radius: var(--radius-small); padding-right: 1.6rem; overflow: hidden; transition: border-color 0.2s;';

                // Сброс инлайновых стилей ЕТИСа и стилизация самого инпута
                amountInput.style.cssText = 'flex: 1; padding: 1.4rem 1.6rem !important; border: none !important; background: transparent !important; color: var(--color-text-primary) !important; font-size: 1.6rem !important; font-weight: 800 !important; box-shadow: none !important; outline: none !important; width: 100%; margin: 0 !important; border-radius: 0 !important;';

                const suffix = document.createElement('span');
                suffix.textContent = 'руб.';
                suffix.style.cssText = 'font-size: 1.4rem; font-weight: 700; color: var(--color-text-secondary); pointer-events: none;';

                inputWrap.appendChild(amountInput);
                inputWrap.appendChild(suffix);
                group.appendChild(label);
                group.appendChild(inputWrap);
                payForm.appendChild(group);

                // Фокус-эффект
                amountInput.addEventListener('focus', () => inputWrap.style.borderColor = 'var(--color-accent)');
                amountInput.addEventListener('blur', () => inputWrap.style.borderColor = 'var(--color-table-border)');
            }

            // Поле: Email
            if (emailInput) {
                const group = document.createElement('div');
                group.style.cssText = 'display: flex; flex-direction: column; gap: 0.8rem;';

                const label = document.createElement('label');
                label.textContent = 'E-mail для получения чека';
                label.style.cssText = 'font-size: 1.3rem; font-weight: 600; color: var(--color-text-secondary);';

                emailInput.style.cssText = 'padding: 1.4rem 1.6rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important; font-weight: 600 !important; width: 100%; box-sizing: border-box; box-shadow: none !important; outline: none !important; transition: border-color 0.2s; margin: 0 !important;';

                group.appendChild(label);
                group.appendChild(emailInput);
                payForm.appendChild(group);

                emailInput.addEventListener('focus', () => emailInput.style.borderColor = 'var(--color-accent)');
                emailInput.addEventListener('blur', () => emailInput.style.borderColor = 'var(--color-table-border)');
            }

            // Возвращаем скрытые системные поля ЕТИСа
            hiddenInputs.forEach(hi => payForm.appendChild(hi));

            // Кнопка оплаты
            if (submitBtn) {
                submitBtn.className = 'answer-btn-custom';
                submitBtn.style.cssText = 'background: var(--color-accent) !important; color: #fff !important; border: none !important; padding: 1.6rem 2.4rem !important; font-size: 1.4rem !important; cursor: pointer; border-radius: 50px !important; font-weight: 800 !important; margin-top: 1rem; width: 100%; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; transition: transform 0.2s, opacity 0.2s;';
                payForm.appendChild(submitBtn);

                // Эффект нажатия
                submitBtn.addEventListener('mousedown', () => submitBtn.style.transform = 'scale(0.98)');
                submitBtn.addEventListener('mouseup', () => submitBtn.style.transform = 'scale(1)');
                submitBtn.addEventListener('mouseleave', () => submitBtn.style.transform = 'scale(1)');
            }

            // Слушаем отправку формы, чтобы ПЛАВНО показать скрытый iframe Сбербанка
            payForm.addEventListener('submit', () => {
                const iframe = pageCtx.span9.querySelector('iframe[name="ifrmSber"]');
                if (iframe) {
                    iframe.style.display = 'block';
                    setTimeout(() => {
                        iframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });
        }

        // 6. Оформляем iframe Сбербанка и ПРЯЧЕМ ЕГО ДО КЛИКА
        const iframe = pageCtx.span9.querySelector('iframe[name="ifrmSber"]');
        if (iframe) {
            iframe.style.cssText = 'width: 100%; max-width: 500px; height: 750px; border-radius: var(--radius-large); border: 1px solid var(--color-table-border); background: #fff; display: none; margin-top: 1rem; margin-bottom: 3rem;';
        }

        // 7. Оформляем PDF-инструкцию в виде карточки и ПЕРЕНОСИМ В САМЫЙ НИЗ
        const pdfLink = pageCtx.span9.querySelector('a[href*="SberPay.pdf"]');
        if (pdfLink) {
            const pdfCard = document.createElement('a');
            pdfCard.href = pdfLink.href;
            pdfCard.className = 'advice-card';
            pdfCard.style.cssText = 'display: inline-flex; margin-top: 3rem; width: fit-content; background: var(--color-highlight); border: 1px dashed var(--color-table-border); box-shadow: none;';
            pdfCard.innerHTML = `<span class="material-icons" style="color: var(--color-text-secondary);">picture_as_pdf</span><span class="advice-label">${escapeHTML(pdfLink.textContent.trim())}</span>`;

            pageCtx.span9.appendChild(pdfCard);
            pdfLink.remove();
        }

        // Финальная зачистка висячих заголовков
        pageCtx.span9.querySelectorAll('b').forEach(b => {
            if (b.textContent.includes('Информация о платежах')) {
                b.style.display = 'block';
                b.style.fontSize = '1.6rem';
                b.style.fontWeight = '800';
                b.style.color = 'var(--color-text-primary)';
                b.style.marginBottom = '1.6rem';
                b.style.marginTop = '3rem';
            }
        });
        pageCtx.span9.querySelectorAll('br').forEach(br => br.remove());

    } else {
        // === СТРАНИЦА СПИСКА ДОГОВОРОВ ===
        const contractLinks = Array.from(pageCtx.span9.querySelectorAll('a'));
        pageCtx.span9.innerHTML = '';

        const mainContainer = document.createElement('div');
        mainContainer.className = 'contracts-container';
        mainContainer.style.setProperty('margin-top', '0', 'important');

        let instructionCard = null;

        contractLinks.forEach(link => {
            const text = link.textContent.trim();
            const isInstruction = text.toLowerCase().includes('инструкция');

            if (isInstruction) {
                const card = document.createElement('a');
                card.href = link.href;
                card.className = 'contract-card instruction-footer';
                card.innerHTML = `
                                        <span class="material-icons" style="color: var(--color-text-secondary)">info</span>
                                        <div class="contract-content">
                                            <div class="contract-title" style="color: var(--color-text-secondary)">${text}</div>
                                        </div>
                                        <span class="material-icons" style="color: var(--color-text-secondary); font-size: 1.8rem">open_in_new</span>
                                    `;
                instructionCard = card;
                return;
            }

            const card = document.createElement('a');
            card.href = link.href;
            card.className = 'contract-card';

            const statusMatch = text.match(/\[(.*?)\]/);
            const statusText = statusMatch ? statusMatch[1] : '';
            let cleanText = text.replace(/\[.*?\]/, '').trim();

            const splitIndex = cleanText.indexOf('№');
            let title = cleanText;
            let meta = '';

            if (splitIndex !== -1) {
                title = cleanText.substring(0, splitIndex).trim();
                meta = cleanText.substring(splitIndex).trim();
            }

            if (statusText.toLowerCase().includes('действует')) {
                card.classList.add('status-active');
            } else if (statusText.toLowerCase().includes('расторгнут')) {
                card.classList.add('status-terminated');
            }

            card.innerHTML = `
                                    <span class="material-icons">description</span>
                                    <div class="contract-content">
                                        <div class="contract-title">${title}</div>
                                        <div class="contract-meta">${meta}</div>
                                    </div>
                                    ${statusText ? `<div class="contract-status">${statusText}</div>` : ''}
                                `;

            mainContainer.appendChild(card);
        });

        pageCtx.span9.appendChild(mainContainer);
        if (instructionCard) {
            const hr = document.createElement('div');
            hr.style.margin = '3rem 0 1.5rem';
            hr.style.borderTop = '1px solid var(--color-table-border)';
            pageCtx.span9.appendChild(hr);
            pageCtx.span9.appendChild(instructionCard);
        }
    }
    return;
}
