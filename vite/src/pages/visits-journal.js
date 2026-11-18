import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';

export function renderVisitsJournalPage() {
    const groupH3 = pageCtx.span9.querySelector('h3');
    const listItems = pageCtx.span9.querySelectorAll('li > a[href*="stu_jour.tt_pair"]');

    pageCtx.span9.innerHTML = '';

    if (groupH3) {
        const pageTitle = document.createElement('h2');
        pageTitle.textContent = groupH3.textContent.trim();
        pageTitle.style.marginBottom = '1.6rem';
        pageCtx.span9.appendChild(pageTitle);
    }

    // Если записей в журнале нет
    if (!listItems.length) {
        updateEmptyState(pageCtx.span9, false, '', 'journal');
        return;
    }

    const container = document.createElement('div');
    container.className = 'jour-container';

    listItems.forEach(link => {
        const text = link.textContent.trim();
        const href = link.href;

        let title = text;
        let badge = '';
        let icon = 'fact_check';
        let typeClass = 'jour-badge-default';

        const match = text.match(/(.*?)\s*\((лек|практ|лаб)\)$/i);
        if (match) {
            title = match[1];
            badge = match[2].toLowerCase();

            if (badge === 'лек') {
                icon = 'menu_book';
                typeClass = 'jour-badge-lek';
            } else if (badge === 'практ') {
                icon = 'engineering';
                typeClass = 'jour-badge-pract';
            } else if (badge === 'лаб') {
                icon = 'science';
                typeClass = 'jour-badge-lab';
            }
        }

        const card = document.createElement('a');
        card.href = href;
        card.className = 'jour-card';

        card.innerHTML = `
                                <div class="jour-icon-box ${typeClass}">
                                    <span class="material-icons">${icon}</span>
                                </div>
                                <div class="jour-title">${title}</div>
                                ${badge ? `<div class="jour-badge ${typeClass}">${badge}</div>` : ''}
                                <span class="material-icons" style="color:var(--color-text-secondary); margin-left: 8px;">chevron_right</span>
                            `;

        container.appendChild(card);
    });

    pageCtx.span9.appendChild(container);
    return;
}
