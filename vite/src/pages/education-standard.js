import { pageCtx } from '../app/context.js';

// Оформляет страницу образовательного стандарта с блоками компетенций
export function renderEducationStandardPage() {
    const allElements = Array.from(pageCtx.span9.childNodes);

    const majorHeader = pageCtx.span9.querySelector('h2') || pageCtx.span9.querySelector('h3');
    const majorName = majorHeader ? majorHeader.textContent.trim() : "";

    const pdfElement = Array.from(pageCtx.span9.querySelectorAll('p, div, font')).find(el => el.textContent.includes('Текст стандарта'));
    const pdfHTML = pdfElement ? pdfElement.innerHTML : "";

    const competencyBlocks = [];
    const headers = Array.from(pageCtx.span9.querySelectorAll('h3'));

    headers.forEach(h => {
        const title = h.textContent.trim();
        if (title.includes('компетенции') && title !== 'Компетенции выпускника') {
            const card = document.createElement('div');
            card.className = 'day resource-block';

            const cardTitle = document.createElement('div');
            cardTitle.style.cssText = 'display: block; padding: 1.6rem 2rem; background: var(--color-table-header); border-bottom: 1px solid var(--color-table-border); margin: 0; font-size: 1.6rem; font-weight: 700; color: var(--color-text-primary); border-radius: 16px 16px 0 0;';
            cardTitle.textContent = title;
            card.appendChild(cardTitle);

            const content = document.createElement('div');
            content.style.padding = '0 2rem 2rem 2rem';
            content.style.fontSize = '1.3rem';
            content.style.lineHeight = '1.6';

            let next = h.nextElementSibling;
            while (next && next.tagName !== 'H3') {
                const clone = next.cloneNode(true);
                if (clone.style) clone.removeAttribute('style');
                content.appendChild(clone);
                next = next.nextElementSibling;
            }
            card.appendChild(content);
            competencyBlocks.push(card);
        }
    });

    pageCtx.span9.innerHTML = '';
    competencyBlocks.forEach((block, index) => {
        if (index === 0) block.style.setProperty('margin-top', '0', 'important');
        pageCtx.span9.appendChild(block);
    });

    if (majorName || pdfHTML) {
        const footer = document.createElement('div');
        footer.className = 'electr-description';
        footer.style.marginTop = '4rem';
        footer.style.textAlign = 'center';

        if (majorName) {
            const nameDiv = document.createElement('div');
            nameDiv.style.fontWeight = 'bold';
            nameDiv.style.marginBottom = '1rem';
            nameDiv.style.color = 'var(--color-text-primary)';
            nameDiv.textContent = majorName;
            footer.appendChild(nameDiv);
        }

        if (pdfHTML) {
            const linkDiv = document.createElement('div');
            linkDiv.innerHTML = pdfHTML;
            linkDiv.querySelectorAll('*').forEach(el => el.removeAttribute('style'));
            footer.appendChild(linkDiv);
        }

        pageCtx.span9.appendChild(footer);
    }
    return;
}
