import { pageCtx } from '../app/context.js';

// Оформляет таблицу учебного периода, правила и форму выбора слотов
export function renderShowSlotsPage() {
    const h2 = pageCtx.span9.querySelector('h2');
    if (h2 && h2.textContent.includes('Прикладная')) {
        h2.textContent = 'Учебный период и количество занятий';
        h2.style.marginBottom = '2.4rem';
    }

    const table = pageCtx.span9.querySelector('table.common');
    if (table) {
        table.querySelectorAll('tr').forEach(row => {
            if (row.children.length > 0) {
                row.children[0].remove();
            }
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'wide-table-wrapper';

        wrapper.style.marginBottom = '1.6rem';

        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        table.style.boxShadow = 'none';
        table.style.border = 'none';
        table.style.minWidth = '600px';

        // Перебиваем глобальные стили ширины и выравнивания первой колонки
        table.querySelectorAll('th, td').forEach(cell => {
            cell.style.setProperty('text-align', 'center', 'important');
            cell.style.setProperty('min-width', 'max-content', 'important');
            cell.style.setProperty('white-space', 'nowrap', 'important');
            cell.style.setProperty('word-break', 'normal', 'important');
            cell.style.verticalAlign = 'middle';
            cell.style.padding = '2rem 1rem';
            cell.style.fontSize = '1.3rem';
            cell.style.borderBottom = 'none';

            if (cell.tagName === 'TH') {
                cell.innerHTML = cell.innerHTML.replace(/<br\s*\/?>/gi, ' ').toUpperCase();
                cell.style.color = 'var(--color-text-secondary)';
                cell.style.letterSpacing = '1px';
            }
        });

        table.querySelectorAll('td[onclick]').forEach(td => {
            const text = td.textContent.trim();
            if (text && text !== '-') {
                let bg = 'var(--color-highlight)';
                let color = 'var(--color-text-primary)';

                const match = text.match(/(\d+)\/(\d+)/);
                if (match) {
                    const current = parseInt(match[1], 10);
                    const total = parseInt(match[2], 10);

                    if (current === 0) {
                        bg = 'var(--color-highlight)';
                        color = 'var(--color-text-primary)';
                    } else if (current >= total) {
                        bg = 'rgba(52, 199, 89, 0.15)';
                        color = 'var(--color-green)';
                    } else {
                        bg = 'rgba(0, 122, 255, 0.15)';
                        color = 'var(--color-blue)';
                    }
                }

                td.innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.8rem 1.6rem; border-radius: 50px; font-weight: 800; display: inline-block; white-space: nowrap; word-break: normal; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none;">${text}</span>`;

                td.addEventListener('mouseenter', () => {
                    const span = td.querySelector('span');
                    if(span) span.style.transform = 'scale(1.1)';
                });
                td.addEventListener('mouseleave', () => {
                    const span = td.querySelector('span');
                    if(span) span.style.transform = 'scale(1)';
                });
            }
        });
    }

    const h4 = pageCtx.span9.querySelector('h4');
    if (h4) {
        const newH3 = document.createElement('h3');
        newH3.textContent = h4.textContent;
        newH3.style.fontSize = '1.8rem';
        newH3.style.fontWeight = '800';
        newH3.style.marginBottom = '1.6rem';
        newH3.style.marginTop = '1rem';
        h4.replaceWith(newH3);
    }

    const textDivs = Array.from(pageCtx.span9.querySelectorAll('div[style*="padding:10px 20px"]'));

    if (textDivs.length > 0) {
        const rulesDiv = textDivs[0];
        rulesDiv.classList.add('info-block-anim');
        rulesDiv.removeAttribute('style');
        rulesDiv.style.cssText = `
                                background: var(--color-card);
                                border: 1px solid var(--color-table-border);
                                border-radius: var(--radius-large);
                                box-shadow: var(--shadow-main);
                                padding: 2.4rem;
                                margin-bottom: 2.4rem;
                            `;

        const ul = rulesDiv.querySelector('ul');
        if (ul) {
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            ul.style.margin = '0';

            ul.querySelectorAll('li').forEach((li, index, array) => {
                li.style.position = 'relative';
                li.style.paddingLeft = '3.6rem';
                li.style.marginBottom = (index === array.length - 1) ? '0' : '1.6rem';
                li.style.lineHeight = '1.6';
                li.style.fontSize = '1.35rem';
                li.style.color = 'var(--color-text-primary)';

                const icon = document.createElement('span');
                icon.className = 'material-icons';
                icon.textContent = 'info';
                icon.style.cssText = `
                                        position: absolute;
                                        left: 0;
                                        top: 0px;
                                        font-size: 2.2rem;
                                        color: var(--color-green);
                                    `;
                li.insertBefore(icon, li.firstChild);
            });
        }
    }

    const formDiv = textDivs[1] || pageCtx.span9.querySelector('form')?.parentElement;
    if (formDiv && formDiv.querySelector('form')) {
        formDiv.removeAttribute('style');
        const form = formDiv.querySelector('form');
        form.classList.add('info-block-anim');

        form.style.cssText = `
                                background: var(--color-card);
                                border: 1px solid var(--color-table-border);
                                border-radius: var(--radius-large);
                                box-shadow: var(--shadow-main);
                                padding: 2.4rem;
                                display: flex;
                                flex-direction: column;
                                gap: 1.6rem;
                            `;

        form.querySelectorAll('div[style*="margin-bottom:5px"]').forEach(div => {
            div.removeAttribute('style');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '1.2rem';
            div.style.fontSize = '1.4rem';
            div.style.color = 'var(--color-text-primary)';
            div.style.flexWrap = 'wrap';

            const label = div.querySelector('label');
            if (label) {
                label.style.margin = '0';
                label.style.cursor = 'pointer';
                label.style.fontWeight = '500';
            }

            const select = div.querySelector('select');
            if (select) {
                select.style.padding = '0.8rem 3.5rem 0.8rem 1.6rem';
                select.style.fontSize = '1.3rem';
                select.style.borderRadius = 'var(--radius-small)';
                select.style.border = '1px solid var(--color-table-border)';
                select.style.background = 'var(--color-input)';
                select.style.color = 'var(--color-text-primary)';
                select.style.fontWeight = '600';
            }
        });

        const btnWrap = form.querySelector('.button_gray');
        if (btnWrap) {
            btnWrap.className = '';
            btnWrap.style.marginTop = '1.6rem';

            const btn = btnWrap.querySelector('button');
            if (btn) {
                btn.className = 'answer-btn-custom';
                btn.innerHTML = '<span class="material-icons" style="font-size:2rem; margin-right:8px">save</span>Сохранить';
                btn.style.cssText = `
                                        background: var(--color-green) !important;
                                        color: #fff !important;
                                        border: none !important;
                                        padding: 1.4rem 2.4rem !important;
                                        font-size: 1.4rem !important;
                                        cursor: pointer;
                                        border-radius: 50px !important;
                                        font-weight: 700 !important;
                                        display: inline-flex !important;
                                        align-items: center !important;
                                        box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2) !important;
                                    `;
            }
        }
    }

    Array.from(pageCtx.span9.childNodes).forEach(node => {
        if (node.tagName === 'BR') node.remove();
    });

    return;
}
