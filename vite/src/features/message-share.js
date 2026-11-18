import { openExportPreviewModal } from './export.js';

// --- МЯГКАЯ ИКОНКА ПОДЕЛИТЬСЯ (SVG) ---
export const softShareSVG = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-msg-btn" title="Поделиться">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                `;

// --- Перенаправление на универсальную функцию экспорта ---
export const shareMessageCard = (cardElement, defaultFileName, onComplete = null) => {
    openExportPreviewModal(cardElement, defaultFileName, false);
    if (typeof onComplete === 'function') onComplete(true);
};

// --- ЕДИНЫЙ МЕХАНИЗМ СВАЙПОВ ДЛЯ СООБЩЕНИЙ И ОБЪЯВЛЕНИЙ ---
export const initMessageSwipes = (container, defaultFileName) => {
    let bubble = document.getElementById('swipe-action-bubble');
    if (!bubble) {
        bubble = document.createElement('div');
        bubble.id = 'swipe-action-bubble';
        bubble.innerHTML = '<span class="material-icons"></span>';
        document.body.appendChild(bubble);
    }
    const iconEl = bubble.querySelector('.material-icons');

    let startX = 0, startY = 0;
    let currentCard = null;
    let originalRect = null;
    let isSwiping = false;
    let isScrollDetermined = false;
    let swipeDir = '';
    let hasAi = false;
    const THRESHOLD = 65;

    // Слушаем события на уровне span9 или контейнера
    const targetArea = document.querySelector('.span9') || container || document.body;

    targetArea.addEventListener('touchstart', (e) => {
        if (window.innerWidth > 960) return;
        
        // Игнорируем клики по кнопкам, полям ввода и ссылкам
        if (e.target.closest('button, input, textarea, select, a, .file-attachment-link, .import-cons-btn, .msg-event-link')) return;

        const card = e.target.closest('.msg-card');
        if (!card) return;

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isSwiping = false;
        isScrollDetermined = false;
        swipeDir = '';
        currentCard = card;
        originalRect = currentCard.getBoundingClientRect();
        hasAi = !!currentCard.querySelector('.ai-summary-btn');

        currentCard.style.setProperty('transition', 'none', 'important');
        currentCard.style.setProperty('animation', 'none', 'important');
    }, { passive: true });

    targetArea.addEventListener('touchmove', (e) => {
        if (!currentCard || !originalRect) return;

        const touch = e.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;

        // Определение направления: скролл страницы или свайп карточки
        if (!isScrollDetermined) {
            if (Math.abs(diffX) < 8 && Math.abs(diffY) < 8) return;
            isScrollDetermined = true;
            if (Math.abs(diffY) >= Math.abs(diffX)) {
                currentCard = null;
                return;
            }
            isSwiping = true;
            bubble.className = '';
        }

        if (isSwiping) {
            if (e.cancelable) e.preventDefault();

            swipeDir = diffX < 0 ? 'left' : 'right';
            if (swipeDir === 'left') {
                iconEl.textContent = 'ios_share';
            } else {
                iconEl.textContent = hasAi ? 'auto_awesome' : 'content_copy';
            }

            let moveX = diffX;
            if (Math.abs(moveX) > THRESHOLD) {
                moveX = (moveX > 0 ? 1 : -1) * (THRESHOLD + (Math.abs(moveX) - THRESHOLD) * 0.25);
            }

            currentCard.style.setProperty('transform', `translateX(${moveX}px)`, 'important');

            // Динамический расчет высоты относительно экрана
            const currentRect = currentCard.getBoundingClientRect();
            bubble.style.top = `${currentRect.top + currentRect.height / 2 - 12}px`;
            bubble.style.opacity = Math.min(Math.abs(diffX) / 30, 1).toString();

            if (swipeDir === 'left') {
                bubble.style.left = `${originalRect.right + (moveX / 2) - 12}px`;
            } else {
                bubble.style.left = `${originalRect.left + (moveX / 2) - 12}px`;
            }

            if (Math.abs(diffX) >= THRESHOLD) {
                if (swipeDir === 'left') {
                    bubble.classList.add('active-threshold', 'action-share');
                } else {
                    bubble.classList.add('active-threshold', hasAi ? 'action-ai' : 'action-add');
                }

                if (!bubble.dataset.vibrated && navigator.vibrate) {
                    navigator.vibrate(15);
                    bubble.dataset.vibrated = 'true';
                }
            } else {
                bubble.classList.remove('active-threshold', 'action-share', 'action-ai', 'action-add');
                bubble.dataset.vibrated = '';
            }
        }
    }, { passive: false }); // Важно: passive = false, чтобы preventDefault мог заблокировать вертикальный скролл

    const resetCard = (e) => {
        if (!currentCard || !isSwiping) {
            currentCard = null;
            isSwiping = false;
            return;
        }

        const diffX = (e.changedTouches && e.changedTouches.length > 0) ? (e.changedTouches[0].clientX - startX) : 0;
        const target = currentCard;
        const dir = swipeDir;
        const cardHasAi = hasAi;

        target.style.setProperty('transition', 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 'important');
        target.style.setProperty('transform', 'translateX(0px)', 'important');

        bubble.style.opacity = '0';
        bubble.classList.remove('active-threshold', 'action-share', 'action-ai', 'action-add');
        bubble.dataset.vibrated = '';

        if (Math.abs(diffX) >= THRESHOLD) {
            if (dir === 'left') {
                shareMessageCard(target, defaultFileName);
            } else if (dir === 'right') {
                if (cardHasAi) {
                    target.querySelector('.ai-summary-btn')?.click();
                } else {
                    const bodyText = target.querySelector('.msg-body')?.innerText || target.innerText;
                    navigator.clipboard.writeText(bodyText.trim());
                    if (window.showEtisPush) {
                        window.showEtisPush('Скопировано', 'Текст скопирован', 'Сообщение сохранено в буфер обмена', 'success', 'content_copy', null, null, false);
                    }
                }
            }
        }

        currentCard = null;
        isSwiping = false;
    };

    targetArea.addEventListener('touchend', resetCard, { passive: true });
    targetArea.addEventListener('touchcancel', resetCard, { passive: true });
};

// Генерация уникального хэша для каждого сообщения
const getMessageUniqueId = (cardElement) => {
    const sender = cardElement.querySelector('.msg-sender')?.textContent.trim() || '';
    const date = cardElement.querySelector('.msg-date-text')?.textContent.trim() || '';
    const subject = cardElement.querySelector('.msg-subject')?.textContent.trim() || '';
    const str = `${sender}_${date}_${subject}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return 'msg_' + Math.abs(hash);
};
