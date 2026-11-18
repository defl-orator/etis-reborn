import { pageCtx } from '../app/context.js';

export function renderBlankFormsPage() {
    const sections = Array.from(pageCtx.span9.querySelectorAll('h3'));
    const pageTitle = pageCtx.span9.querySelector('h2');
    const data = [];

    sections.forEach(h3 => {
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'UL' && next.tagName !== 'H3') {
            next = next.nextElementSibling;
        }

        if (next && next.tagName === 'UL') {
            data.push({
                header: h3.cloneNode(true),
                list: next.cloneNode(true)
            });
        }
    });

    pageCtx.span9.innerHTML = '';

    data.forEach((item, index) => {
    const sectionTitle = document.createElement('div');
    sectionTitle.style.cssText = `font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary); margin: ${index === 0 ? '0' : '3rem'} 0 1.6rem 0;`;
        sectionTitle.textContent = item.header.textContent;
        pageCtx.span9.appendChild(sectionTitle);

        const grid = document.createElement('div');
        grid.className = 'forms-grid';

        const items = item.list.querySelectorAll('li');
        items.forEach(li => {
            const links = Array.from(li.querySelectorAll('a'));
            if (links.length === 0) return;

            const primaryLink = links[0];
            const href = primaryLink.getAttribute('href').toLowerCase();

            const card = document.createElement('a');
            card.className = 'form-card';
            card.href = primaryLink.href;
            card.target = '_blank';

            let icon = 'description';
            let typeClass = 'type-word';
            if (href.includes('.xls')) { icon = 'table_chart'; typeClass = 'type-excel'; }
            else if (href.includes('.pdf')) { icon = 'picture_as_pdf'; typeClass = 'type-pdf'; }

            let badgesHtml = '';
            links.forEach(l => {
                const lHref = l.getAttribute('href').toLowerCase();
                let ext = 'DOC';
                if (lHref.includes('.pdf')) ext = 'PDF';
                else if (lHref.includes('.xls')) ext = 'XLS';
                badgesHtml += `<span class="badge-ext">${ext}</span>`;
            });

            card.innerHTML = `
                                    <div class="form-icon-box ${typeClass}">
                                        <span class="material-icons">${icon}</span>
                                    </div>
                                    <div class="form-name">${primaryLink.textContent.trim()}</div>
                                    <div class="form-badges">${badgesHtml}</div>
                                `;

            grid.appendChild(card);
        });

        pageCtx.span9.appendChild(grid);
    });

    pageCtx.span9.querySelectorAll('br').forEach(br => br.remove());
    return;
}
