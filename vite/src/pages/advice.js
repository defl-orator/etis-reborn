import { pageCtx } from '../app/context.js';

// Преобразует список советов и инструкций в карточки
export function renderAdvicePage() {
    pageCtx.span9.querySelectorAll('h3').forEach(h => h.remove());
    const adviceList = pageCtx.span9.querySelector('ul');
    if (!adviceList) return;

    while (pageCtx.span9.firstChild && (pageCtx.span9.firstChild.tagName === 'BR' || (pageCtx.span9.firstChild.nodeType === Node.TEXT_NODE && !pageCtx.span9.firstChild.textContent.trim()))) {
        pageCtx.span9.firstChild.remove();
    }
    const container = document.createElement('div');
    container.className = 'advice-container';
    container.style.setProperty('margin-top', '0', 'important');

    const links = adviceList.querySelectorAll('a');
    links.forEach(link => {
        const href = link.href.toLowerCase();
        const card = document.createElement('a');
        card.className = 'advice-card';
        card.href = link.href;
        card.target = '_blank';

        let iconName = 'article';
        let iconColor = 'var(--color-accent)';
        let bgBox = 'var(--color-accent-active)';

        if (href.includes('.pdf')) {
            iconName = 'picture_as_pdf';
            iconColor = '#FF3B30';
            bgBox = 'rgba(255, 59, 48, 0.15)';
        } else if (href.includes('.mp4') || href.includes('.avi') || href.includes('.mov')) {
            iconName = 'play_circle';
            iconColor = '#AF52DE';
            bgBox = 'rgba(175, 82, 222, 0.15)';
        }

        card.innerHTML = `
                                <div class="order-icon-box" style="background: ${bgBox} !important;">
                                    <span class="material-icons" style="color: ${iconColor} !important;">${iconName}</span>
                                </div>
                                <div class="advice-label" style="flex-grow: 1; font-size: 1.4rem; font-weight: 500; color: var(--color-text-primary); line-height: 1.4;">
                                    ${link.textContent.trim()}
                                </div>
                                <span class="material-icons" style="color: var(--color-text-secondary); font-size: 1.8rem; flex-shrink: 0;">open_in_new</span>
                            `;

        container.appendChild(card);
    });

    adviceList.parentNode.replaceChild(container, adviceList);

    pageCtx.span9.querySelectorAll('h2, h3').forEach(h => h.remove());

    pageCtx.span9.querySelectorAll('br, p:empty').forEach(el => el.remove());

    return;
}
