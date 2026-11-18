import { pageCtx } from '../app/context.js';

export function renderSpecialSurveysPage() {
    pageCtx.span9.querySelectorAll('h3, h2').forEach(h => h.remove());
    while (pageCtx.span9.firstChild && (pageCtx.span9.firstChild.tagName === 'BR' || (pageCtx.span9.firstChild.nodeType === Node.TEXT_NODE && !pageCtx.span9.firstChild.textContent.trim()))) {
        pageCtx.span9.firstChild.remove();
    }

    // 2. Оформление верхнего предупреждения (плашки)
    const warnings = document.querySelectorAll('.warning');
    if (warnings.length > 0) {
        const warningText = warnings[0].textContent.trim();
        warnings.forEach(w => w.remove());

        if (warningText) {
            const banner = document.createElement('div');
            banner.className = 'warning-banner-card anim-fade-up is-visible';
            banner.style.cssText = 'margin-top: 0 !important; margin-bottom: 2rem !important;';
            banner.innerHTML = `
                                    <span class="material-icons">priority_high</span>
                                    <div>${warningText}</div>
                                `;
            pageCtx.span9.prepend(banner);
        }
    }

    // 3. Сбор вводного текста анкеты
    let introTitleText = '';
    let introBodyText = '';
    const nodesToDelete = [];

    Array.from(pageCtx.span9.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text.includes('Уважаемый студент') || (text.length > 10 && !text.includes('FUNCTION') && !text.includes('function'))) {
                introTitleText = text;
                nodesToDelete.push(node);
            }
        } else if (node.tagName === 'P' && node.textContent.includes('мнение о преподавателях')) {
            introBodyText = node.innerHTML.replace(/\n/g, '<br>');
            nodesToDelete.push(node);
        }
    });

    nodesToDelete.forEach(n => n.remove());

    if (introTitleText || introBodyText) {
        const introCard = document.createElement('div');
        introCard.className = 'survey-intro-card anim-fade-up is-visible';
        introCard.style.cssText = 'margin: 0 0 2rem 0 !important;';
        introCard.innerHTML = `
                                <h4>
                                    <span class="material-icons" style="font-size: 2rem; color: var(--color-accent);">rate_review</span>
                                    ${introTitleText || 'Опрос об учебном процессе'}
                                </h4>
                                ${introBodyText ? `<p style="margin: 0; line-height: 1.6; color: var(--color-text-secondary); font-size: 1.35rem;">${introBodyText}</p>` : ''}
                            `;

        const firstCard = pageCtx.span9.querySelector('.survey-card, .nav.answ, .nav.msg');
        if (firstCard && firstCard.nextSibling) {
            pageCtx.span9.insertBefore(introCard, firstCard.nextSibling);
        } else {
            pageCtx.span9.appendChild(introCard);
        }
    }

    // 4. Оформление карточек опросов
    const surveyBlocks = pageCtx.span9.querySelectorAll('.nav.answ, .nav.msg, ul.survey-card');

    surveyBlocks.forEach(survey => {
        survey.className = 'survey-card anim-fade-up is-visible';
        survey.style.cssText = 'margin-bottom: 2rem !important;';

        const headerLi = survey.querySelector('li:first-child');
        const contentLi = survey.querySelector('li:nth-child(2)');

        if (headerLi && contentLi) {
            let arrow = headerLi.querySelector('.survey-arrow');
            if (!arrow) {
                arrow = document.createElement('span');
                arrow.className = 'material-icons survey-arrow';
                arrow.textContent = 'arrow_drop_down';
                headerLi.appendChild(arrow);
            }

            const updateArrow = () => {
                headerLi.classList.toggle('is-open', !contentLi.classList.contains('hide_elem'));
            };

            updateArrow();
            headerLi.addEventListener('click', () => {
                setTimeout(updateArrow, 50);
            });

            const headerLink = headerLi.querySelector('a');
            if (headerLink) headerLi.innerHTML = headerLink.innerHTML;

            const headerFont = headerLi.querySelector('font');
            if (headerFont) headerLi.innerHTML = headerFont.innerHTML;

            headerLi.style.fontSize = '1.4rem';
            headerLi.style.lineHeight = '1.5';
            headerLi.style.fontWeight = '600';
            headerLi.style.color = 'var(--color-text-primary)';
        }

        if (contentLi) {
            const contentLink = contentLi.querySelector('a');
            if (contentLink) contentLi.innerHTML = contentLink.innerHTML;

            const activeForm = contentLi.querySelector('form[name^="estimate_"]');

            // --- АКТИВНЫЙ ОПРОС С РАДИО-КНОПКАМИ ---
            if (activeForm) {
                const reviewDiv = contentLi.querySelector('.review');
                if (reviewDiv) {
                    const formInnerDiv = reviewDiv.querySelector('.form');
                    if (formInnerDiv) {
                        formInnerDiv.removeAttribute('style');
                    }

                    const actionButtonsWrap = document.createElement('div');
                    actionButtonsWrap.className = 'survey-action-buttons';

                    const sendBtn = reviewDiv.querySelector('button[id^="send_btn_"]');
                    const rejectBtn = reviewDiv.querySelector('button[id^="reject_send_btn_"]');

                    const counterBadge = document.createElement('span');
                    counterBadge.id = 'survey-progress-counter';
                    counterBadge.style.cssText = 'font-size: 1.25rem; font-weight: 700; color: var(--color-text-secondary); margin-left: 8px; align-self: center;';

                    if (sendBtn) {
                        const sendBtnWrap = sendBtn.closest('.button_gray') || sendBtn;
                        if (!sendBtn.querySelector('.material-icons')) {
                            sendBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem;">send</span>' + sendBtn.textContent;
                        }
                        actionButtonsWrap.appendChild(sendBtnWrap);
                    }

                    if (rejectBtn) {
                        const rejectBtnWrap = rejectBtn.closest('.button_gray') || rejectBtn;
                        if (!rejectBtn.querySelector('.material-icons')) {
                            rejectBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem;">update</span>' + rejectBtn.textContent;
                        }
                        actionButtonsWrap.appendChild(rejectBtnWrap);
                    }

                    actionButtonsWrap.appendChild(counterBadge);
                    reviewDiv.appendChild(actionButtonsWrap);

                    // ==========================================
                    // ТОЧНЫЙ СБОР ДАННЫХ В ФОРМАТЕ ЕТИСА (.serialize)
                    // ==========================================
                    const questions = activeForm.querySelectorAll('.question');
                    const totalQuestions = questions.length;

                    const serializeFormAnswers = () => {
                        const checkedInputs = activeForm.querySelectorAll('input[type="radio"][name^="q"]:checked');
                        const params = [];
                        checkedInputs.forEach(input => {
                            params.push(`${encodeURIComponent(input.name)}=${encodeURIComponent(input.value)}`);
                        });
                        return params.join('&');
                    };

                    const validateAndCollect = () => {
                        let answeredCount = 0;
                        let firstUnanswered = null;

                        questions.forEach(q => {
                            const checkedRadio = q.querySelector('input[type="radio"]:checked');
                            if (checkedRadio) {
                                answeredCount++;
                            } else if (!firstUnanswered) {
                                firstUnanswered = q;
                            }
                        });

                        // Записываем сериализованную строку в p_que_str
                        const serializedData = serializeFormAnswers();
                        const queInput = activeForm.querySelector('input[name="p_que_str"], #p_que_str');
                        if (queInput) queInput.value = serializedData;

                        if (counterBadge) {
                            counterBadge.textContent = `Отвечено: ${answeredCount} из ${totalQuestions}`;
                            counterBadge.style.color = (answeredCount === totalQuestions && totalQuestions > 0) ? 'var(--color-green)' : 'var(--color-text-secondary)';
                        }

                        if (sendBtn) {
                            if (answeredCount === totalQuestions && totalQuestions > 0) {
                                sendBtn.removeAttribute('disabled');
                                sendBtn.disabled = false;
                                sendBtn.style.opacity = '1';
                                sendBtn.style.cursor = 'pointer';
                            } else {
                                sendBtn.setAttribute('disabled', 'disabled');
                                sendBtn.disabled = true;
                                sendBtn.style.opacity = '0.6';
                                sendBtn.style.cursor = 'not-allowed';
                            }
                        }

                        return {
                            isComplete: (answeredCount === totalQuestions && totalQuestions > 0),
                            serializedData,
                            firstUnanswered
                        };
                    };

                    activeForm.querySelectorAll('input[type="radio"]').forEach(radio => {
                        radio.addEventListener('change', validateAndCollect);
                    });

                    // Отправка формы в строгом соответствии со скриптом ЕТИСа
                    if (sendBtn) {
                        sendBtn.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const status = validateAndCollect();
                            if (!status.isComplete) {
                                alert('Пожалуйста, ответьте на все вопросы перед отправкой анкеты.');
                                if (status.firstUnanswered) {
                                    status.firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                                return;
                            }

                            // Ищем или создаем форму отправки send_form_estimate_...
                            let sendForm = document.getElementById(`send_form_${activeForm.name}`) || document.querySelector(`form[name="send_form_${activeForm.name}"]`) || document.querySelector('form[name^="send_form_estimate_"]');
                            if (!sendForm) {
                                sendForm = document.createElement('form');
                                sendForm.method = 'POST';
                                sendForm.action = activeForm.action || 'stu.special_est_action';
                                sendForm.style.display = 'none';
                                document.body.appendChild(sendForm);
                            }

                            sendForm.innerHTML = '';

                            // Копируем все служебные поля и p_que_str (исключая radio с именами q...)
                            activeForm.querySelectorAll('input, select').forEach(input => {
                                if (!input.name.startsWith('q')) {
                                    const clone = input.cloneNode(true);
                                    clone.value = input.value;
                                    sendForm.appendChild(clone);
                                }
                            });

                            // Копируем комментарии/textarea, если есть
                            activeForm.querySelectorAll('textarea').forEach(ta => {
                                if (!ta.name.startsWith('q')) {
                                    const clone = ta.cloneNode(true);
                                    clone.value = ta.value;
                                    sendForm.appendChild(clone);
                                }
                            });

                            sendBtn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">sync</span> Отправка...';
                            sendBtn.disabled = true;

                            // Отправка запроса в базу
                            HTMLFormElement.prototype.submit.call(sendForm);
                        };
                    }

                    if (rejectBtn) {
                        rejectBtn.onclick = (e) => {
                            e.preventDefault();
                            let sendForm = document.getElementById(`send_form_${activeForm.name}`) || document.querySelector(`form[name="send_form_${activeForm.name}"]`);
                            if (sendForm) {
                                sendForm.innerHTML = '';
                                activeForm.querySelectorAll('input, select').forEach(input => {
                                    if (!input.name.startsWith('q')) {
                                        const clone = input.cloneNode(true);
                                        clone.value = input.name === 'p_que_str' ? '' : input.value;
                                        sendForm.appendChild(clone);
                                    }
                                });
                                HTMLFormElement.prototype.submit.call(sendForm);
                            } else {
                                window.location.href = 'stu.timetable';
                            }
                        };
                    }

                    setTimeout(validateAndCollect, 150);
                }
                return;
            }

            const rawHTML = contentLi.innerHTML;

            // --- ОПРОСЫ С ПОЛЕМ ТЕКСТОВОГО ВВОДА ---
            if (rawHTML.includes('<form') || rawHTML.includes('<textarea')) {
                const shortBtn = contentLi.querySelector('div[id$="_short"]');
                if (shortBtn) {
                    shortBtn.className = 'answer-btn-custom';
                    shortBtn.style.width = 'fit-content';
                    shortBtn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">edit</span>' + shortBtn.innerHTML;
                }

                const form = contentLi.querySelector('form');
                if (form) {
                    const formContainer = document.createElement('div');
                    formContainer.className = 'form';
                    formContainer.style.marginTop = '1.6rem';
                    formContainer.style.padding = '2rem';
                    formContainer.style.boxShadow = 'none';
                    formContainer.style.border = '1px solid var(--color-table-border)';

                    form.parentNode.insertBefore(formContainer, form);
                    formContainer.appendChild(form);

                    const textarea = form.querySelector('textarea');
                    if (textarea) {
                        textarea.style.width = '100%';
                        textarea.style.minHeight = '150px';
                        textarea.style.padding = '1.2rem';
                        textarea.style.borderRadius = 'var(--radius-small)';
                        textarea.style.border = '1px solid var(--color-table-border)';
                        textarea.style.background = 'var(--color-input)';
                        textarea.style.color = 'var(--color-text-primary)';
                        textarea.style.fontSize = '1.4rem';
                        textarea.style.resize = 'vertical';
                    }

                    const sendBtn = form.querySelector('button');
                    if (sendBtn) {
                        sendBtn.className = 'answer-btn-custom';
                        sendBtn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">send</span>Отправить';
                    }
                }
                return;
            }

            // --- РАНЕЕ ПРОЙДЕННЫЕ ОПРОСЫ ---
            const cleanContent = document.createElement('div');

            const dateMatch = rawHTML.match(/\d{2}\.\d{2}\.\d{4}\s\d{2}:\d{2}:\d{2}/);
            if (dateMatch) {
                const d = document.createElement('div');
                d.className = 'msg-date';
                d.style.marginBottom = '2rem';
                d.style.paddingBottom = '1rem';
                d.style.borderBottom = '1px solid var(--color-table-border)';
                d.textContent = 'Пройдено: ' + dateMatch[0];
                cleanContent.appendChild(d);
            }

            const temp = document.createElement('div');
            temp.innerHTML = rawHTML;

            const dateSpan = temp.querySelector('span[style*="color:#808080"]');
            if (dateSpan) dateSpan.remove();

            const boldQuestions = temp.querySelectorAll('b');
            let items = [];

            if (boldQuestions.length > 0) {
                boldQuestions.forEach(b => {
                    let q = b.textContent.replace(':', '').trim();
                    let a = "";
                    let next = b.nextSibling;

                    while (next && next.nodeName !== 'B') {
                        if (next.nodeName === 'SPAN' || next.nodeName === 'I' || (next.nodeType === Node.TEXT_NODE && next.textContent.trim().length > 2)) {
                            a += next.textContent.trim() + " ";
                        }
                        next = next.nextSibling;
                    }
                    if (q) items.push({ q, a: a.trim() });
                });
            }

            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'survey-result-item';
                div.innerHTML = `
                                        <span class="survey-result-q">${item.q}</span>
                                        <div class="survey-result-a">${item.a}</div>
                                    `;
                cleanContent.appendChild(div);
            });

            if (items.length > 0) {
                contentLi.innerHTML = '';
                contentLi.appendChild(cleanContent);
            }
        }
    });

    pageCtx.span9.querySelectorAll('br').forEach(br => br.remove());
    return;
}
