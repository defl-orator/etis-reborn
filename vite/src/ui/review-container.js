// Оформляет страницу анкетирования и таблицы вопросов
export function initReviewContainer() {
    const reviewContainer = document.querySelector('.span9 > .review');
    if (reviewContainer) {
        reviewContainer.querySelectorAll('style').forEach(s => s.remove());

        const introParagraphs = [];
        for (let node of reviewContainer.childNodes) {
            if (node.tagName === 'P') introParagraphs.push(node);
            else if (node.tagName === 'FORM' || node.tagName === 'DIV' || node.tagName === 'H3') break;
        }

        if (introParagraphs.length > 0) {
            const introCard = document.createElement('div');
            introCard.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large); box-shadow: var(--shadow-main); padding: 2.4rem; margin-bottom: 2.4rem; border: 1px solid var(--color-table-border);';

            const title = document.createElement('div');
            title.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-weight: 800; font-size: 1.8rem; color: var(--color-text-primary);';
            title.innerHTML = '<span class="material-icons" style="color: var(--color-accent); font-size: 2.4rem;">assignment</span> Анкетирование';
            introCard.appendChild(title);

            introParagraphs.forEach(p => {
                p.style.cssText = 'font-size: 1.4rem; color: var(--color-text-primary); line-height: 1.6; margin-bottom: 1.2rem; opacity: 0.9;';
                introCard.appendChild(p);
            });

            reviewContainer.prepend(introCard);

            const rejectForm = document.getElementById('reject_form');
            if (rejectForm) {
                const rejectBtnWrap = rejectForm.nextElementSibling;
                if (rejectBtnWrap && rejectBtnWrap.classList.contains('button_gray')) {
                    introCard.appendChild(rejectForm);
                    introCard.appendChild(rejectBtnWrap);
                    rejectBtnWrap.style.cssText = 'text-align: left; margin-top: 2rem; width: 100%;';
                    const rejectBtn = rejectBtnWrap.querySelector('button');
                    if (rejectBtn) {
                        rejectBtn.className = 'answer-btn-custom';
                        rejectBtn.style.cssText = 'background: var(--color-red) !important; color: #fff !important; border: none !important; box-shadow: 0 4px 12px rgba(255, 59, 48, 0.2) !important; font-weight: 700;';
                        rejectBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem; margin-right: 8px;">cancel</span>' + rejectBtn.textContent;
                    }
                }
            }
        }

        const estimateForm = document.querySelector('form[name="estimate"], form.que_form');
        if (estimateForm) {
            estimateForm.querySelectorAll('h3').forEach(h3 => {
                h3.style.cssText = 'font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary); margin: 4rem 0 2rem 0; line-height: 1.4;';
                h3.innerHTML = h3.innerHTML;
            });

            estimateForm.querySelectorAll('table.question_table').forEach(qTable => {
                if (!qTable.parentElement.classList.contains('question-table-wrapper')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'question-table-wrapper';
                    wrapper.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large); box-shadow: var(--shadow-main); margin-bottom: 3rem; overflow: hidden; border: 1px solid var(--color-table-border);';
                    qTable.parentNode.insertBefore(wrapper, qTable);
                    wrapper.appendChild(qTable);
                }

                qTable.style.cssText = 'margin: 0 !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; border-collapse: collapse !important; table-layout: fixed;';

                const rows = qTable.querySelectorAll('tr');
                rows.forEach((tr, rowIndex) => {
                    const isHeader = rowIndex === 0;

                    tr.querySelectorAll('th, td').forEach((cell, cellIndex) => {
                        cell.style.padding = isHeader ? '1.6rem 1rem' : '1.4rem';

                        // Первая колонка (текст вопроса) - шире остальных
                        if (cellIndex === 0) {
                            cell.style.width = '40%';
                            cell.style.textAlign = 'left';
                        } else {
                            cell.style.width = '10%';
                            cell.style.textAlign = 'center';
                        }
                    });
                });
            });

            const sendBtn = estimateForm.querySelector('#send_btn');
            if (sendBtn) {
                sendBtn.className = 'answer-btn-custom';
                if (!sendBtn.querySelector('.material-icons')) {
                    sendBtn.innerHTML = '<span class="material-icons" style="font-size: 2rem; margin-right: 0.8rem;">send</span>' + sendBtn.textContent;
                }
            }
        }
    }
}
