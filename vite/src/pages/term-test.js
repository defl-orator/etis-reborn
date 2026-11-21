import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';

// Оформляет страницу анкетирования преподавателей в виде списка карточек
export function renderTermTestPage() {
    const reviewContainer = pageCtx.span9.querySelector('.review');
    if (!reviewContainer) return;

    const listUl = reviewContainer.querySelector('ul.list');
    const hasData = listUl && listUl.querySelectorAll('li').length > 0;

    if (hasData) {
        const card = document.createElement('div');
        card.className = 'review-card';

        const newList = document.createElement('div');
        newList.className = 'review-list';

        listUl.querySelectorAll('li').forEach(li => {
            const link = li.querySelector('a');
            if (!link) return;

            let teacherName = li.textContent.replace(link.textContent, '').trim();
            teacherName = teacherName.replace(/[()]/g, '');

            let fullTitle = link.textContent.trim();
            let cleanTitle = fullTitle;
            let badgeTypes =[];

            const match = fullTitle.match(/\(([^)]+)\)$/i);
            if (match) {
                cleanTitle = fullTitle.replace(match[0], '').trim();
                const typesArr = match[1].toLowerCase().split(',').map(t => t.trim()).filter(t => t);

                typesArr.forEach(t => {
                    if (t.includes('лек')) badgeTypes.push('лек');
                    else if (t.includes('практ')) badgeTypes.push('практ');
                    else if (t.includes('лаб')) badgeTypes.push('лаб');
                    else if (t.includes('зач') || t.includes('экз')) badgeTypes.push('экз');
                });
            }

            let badgesHtml = '';
            let titleColor = 'var(--color-text-primary)';

            const mainType = badgeTypes[0] || '';
            if (mainType === 'лек') titleColor = 'var(--color-blue)';
            else if (mainType === 'практ') titleColor = 'var(--color-green)';
            else if (mainType === 'лаб') titleColor = 'var(--color-warning)';
            else if (mainType === 'экз') titleColor = 'var(--color-red)';

            badgeTypes.forEach(t => {
                let bg = 'var(--color-highlight)', color = 'var(--color-text-secondary)', label = t.toUpperCase();
                if (t === 'лек') { bg = 'rgba(0, 122, 255, 0.12)'; color = 'var(--color-blue)'; }
                else if (t === 'практ') { bg = 'rgba(52, 199, 89, 0.12)'; color = 'var(--color-green)'; }
                else if (t === 'лаб') { bg = 'rgba(255, 149, 0, 0.12)'; color = 'var(--color-warning)'; }
                else if (t === 'экз') { bg = 'rgba(255, 59, 48, 0.12)'; color = 'var(--color-red)'; label = 'ЗАЧ/ЭКЗ'; }

                badgesHtml += `<span style="background: ${bg}; color: ${color}; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">${label}</span>`;
            });

            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
                                    <div style="display: flex; flex-direction: column; gap: 0.8rem; align-items: flex-start; flex: 1; padding-right: 1.6rem;">
                                        <a href="${link.href}" style="font-size: 1.5rem; font-weight: 700; text-decoration: none; color: ${titleColor} !important; line-height: 1.3; background: none !important; -webkit-text-fill-color: initial !important;">${cleanTitle}</a>
                                        ${badgesHtml ? `<div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">${badgesHtml}</div>` : ''}
                                    </div>
                                    <div class="review-teacher-info" style="flex-shrink: 0; text-align: right; display: flex; align-items: center; gap: 0.6rem;">
                                        <span class="material-icons" style="font-size: 1.8rem;">person</span>
                                        <span>${teacherName}</span>
                                    </div>
                                `;
            newList.appendChild(item);
        });

        card.appendChild(newList);
        listUl.parentNode.replaceChild(card, listUl);

        const emptySubmenu = reviewContainer.querySelector('.submenu');
        if (emptySubmenu && !emptySubmenu.textContent.trim()) {
            emptySubmenu.remove();
        }

        reviewContainer.querySelectorAll('h2, h3').forEach(h => h.remove());
    } else {
        reviewContainer.remove();
        pageCtx.span9.querySelectorAll('br').forEach(br => br.remove());
    }

    updateEmptyState(pageCtx.span9, hasData, '', 'term_test');
    return;
}
