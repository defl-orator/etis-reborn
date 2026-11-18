import { pageCtx } from '../app/context.js';
import { escapeHTML } from '../utils/security.ts';

export function renderVisitsPairPage() {
    const backBtn = document.createElement('a');
    backBtn.href = 'stu_jour.group_tt';
    backBtn.className = 'answer-btn-custom';
    backBtn.style.cssText = 'display: inline-flex !important; align-items: center !important; gap: 8px !important; margin-bottom: 2rem !important; padding: 0.8rem 1.8rem !important; height: auto !important; border-radius: 50px !important; width: fit-content !important; cursor: pointer !important; text-decoration: none !important; border: none !important;';
    backBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem;">arrow_back</span><span>Назад</span>';
    pageCtx.span9.prepend(backBtn);

    const h4 = pageCtx.span9.querySelector('h4');
    if (h4) {
        const lines = h4.innerHTML.split('<br>').map(l => l.trim()).filter(l => l);

        const infoCard = document.createElement('div');
        infoCard.className = 'jour-info-card';

        if (lines.length >= 2) {
            const group = lines[0];
            const subject = lines[1];
            const teacher = lines.length > 2 ? lines[2] : '';
            const department = lines.length > 3 ? lines[3] : '';

            infoCard.innerHTML = `
                                    <div class="jour-info-header">
                                        <div class="jour-info-group">${group}</div>
                                        <div class="jour-info-subject">${subject}</div>
                                    </div>
                                    ${teacher ? `
                                    <div class="jour-info-teacher">
                                        <span class="material-icons">person</span>
                                        <div>
                                            <strong>${teacher}</strong>
                                            ${department ? `<span>${department}</span>` : ''}
                                        </div>
                                    </div>` : ''}
                                `;
        } else {
            infoCard.innerHTML = `<h3 style="margin:0">${escapeHTML(h4.textContent)}</h3>`;
        }

        h4.parentNode.replaceChild(infoCard, h4);
    }

    const table = pageCtx.span9.querySelector('table.common');
    if (table) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wide-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        table.removeAttribute('style');
        table.querySelectorAll('th, td').forEach(cell => {
            cell.removeAttribute('style');
        });
    }

    const btnWrapper = pageCtx.span9.querySelector('.button_gray');
    if (btnWrapper) {
        btnWrapper.className = 'jour-save-wrapper';
        const btn = btnWrapper.querySelector('button');
        if (btn) {
            btn.className = 'answer-btn-custom';
            btn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">save</span>' + btn.innerHTML;
        }
    }
    return;
}
