import { pageCtx } from '../app/context.js';

// Преобразует список приказов в карточки с иконками по типу приказа
export function renderOrdersPage() {
    pageCtx.span9.querySelectorAll('h3').forEach(h => h.remove());
    const ordersList = pageCtx.span9.querySelector('ul.orders');
    if (!ordersList) return;

    const orders = Array.from(ordersList.querySelectorAll('li.ord'));

    pageCtx.span9.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'orders-container';
    container.style.setProperty('margin-top', '0', 'important');

    orders.forEach(ord => {
        const link = ord.querySelector('a');
        if (!link) return;

        const fullText = link.textContent.trim();

        const match = fullText.match(/(№.*?от\s+\d{2}\.\d{2}\.\d{4})(?:[\.\s]*)(.*)/);

        const meta = match ? match[1] : '';
        const title = match ? match[2] : fullText;

        let icon = 'assignment';
        let type = 'default';
        const lowerTitle = fullText.toLowerCase();

        if (lowerTitle.includes('благодарность')) { icon = 'military_tech'; type = 'благодарность'; }
        else if (lowerTitle.includes('зачислить')) { icon = 'school'; }
        else if (lowerTitle.includes('перевести')) { icon = 'swap_horiz'; }
        else if (lowerTitle.includes('академический отпуск')) { icon = 'pause_circle_filled'; }
        else if (lowerTitle.includes('вышедшим из')) { icon = 'play_circle'; }
        else if (lowerTitle.includes('командиров')) { icon = 'flight_takeoff'; }
        else if (lowerTitle.includes('руководителя')) { icon = 'history_edu'; }
        else if (lowerTitle.includes('дубликат')) { icon = 'content_copy'; }

        const card = document.createElement('a');
        card.href = link.href;
        card.target = '_blank';
        card.className = 'order-card';
        card.setAttribute('data-type', type);

        card.innerHTML = `
                                <div class="order-icon-box">
                                    <span class="material-icons">${icon}</span>
                                </div>
                                <div class="order-info">
                                    <div class="order-meta">${meta}</div>
                                    <div class="order-title">${title}</div>
                                </div>
                                <span class="material-icons" style="color:var(--color-text-secondary); font-size: 1.8rem;">open_in_new</span>
                            `;

        container.appendChild(card);
    });

    pageCtx.span9.appendChild(container);
    return;
}
