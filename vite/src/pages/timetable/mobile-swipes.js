// Инициализирует свайпы по парам и карточкам дней на мобильных устройствах.
export function initMobileSwipes() {
    let bubble = document.getElementById('swipe-action-bubble');
    if (!bubble) {
        bubble = document.createElement('div');
        bubble.id = 'swipe-action-bubble';
        bubble.innerHTML = '<span class="material-icons"></span>';
        document.body.appendChild(bubble);
    }
    const iconEl = bubble.querySelector('.material-icons');

    let startX = 0, startY = 0;
    let currentTarget = null;
    let targetElements = [];
    let originalRect = null;
    let targetType = '';
    let isSwiping = false;
    let isScrollDetermined = false;
    let swipeDir = '';
    let hasEval = false;
    let evalLink = null;
    let clickPrevented = false;
    let lastDiffX = 0;
    const THRESHOLD = 65;

    const span9El = document.querySelector('.span9');
    if (!span9El) return;

    span9El.addEventListener('touchstart', (e) => {
        if (window.innerWidth > 960) return;

        // Игнорируем только системные элементы и внешние ссылки комнат
        if (e.target.closest('button, input, textarea, select, .subject-note-btn, .pair-important-btn, .share-day-btn, .add-custom-pair-btn, .delete-custom-pair-btn, a[href*="zoom"], a[href*="telemost"], a.btn-generic-online, .pair-online-link')) return;

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isSwiping = false;
        isScrollDetermined = false;
        swipeDir = '';
        lastDiffX = 0;
        clickPrevented = false;
        currentTarget = null;
        targetElements = [];
        originalRect = null;

        const row = e.target.closest('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)');
        const dayCard = e.target.closest('.day');

        if (row && !row.querySelector('th')) {
            currentTarget = row;
            targetElements = Array.from(row.querySelectorAll('td'));
            targetType = 'row';
            // Запрещаем оценку для любых кастомных пар, событий из объявлений и внешних календарей
            const isCustomRow = row.classList.contains('custom-pair-row') || row.classList.contains('external-event-row') || row.classList.contains('docx-consultation-row');
            evalLink = isCustomRow ? null : row.querySelector('a.eval');
            hasEval = !!evalLink;

            const firstTd = targetElements[0].getBoundingClientRect();
            const lastTd = targetElements[targetElements.length - 1].getBoundingClientRect();
            originalRect = {
                top: firstTd.top,
                left: firstTd.left,
                right: lastTd.right,
                height: firstTd.height
            };
        } else if (dayCard) {
            currentTarget = dayCard;
            targetElements = [dayCard];
            targetType = 'day';

            // Вычисляем координаты от ВСЕЙ карточки дня для центрирования
            const dayRect = dayCard.getBoundingClientRect();
            originalRect = {
                top: dayRect.top,
                left: dayRect.left,
                right: dayRect.right,
                height: dayRect.height
            };
        }

        if (currentTarget) {
            targetElements.forEach(el => {
                el.style.setProperty('transition', 'none', 'important');
                el.style.setProperty('animation', 'none', 'important');
            });
        }
    }, { passive: true });

    span9El.addEventListener('touchmove', (e) => {
        if (!currentTarget || !originalRect) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;
        lastDiffX = diffX;

        if (!isScrollDetermined) {
            if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;
            isScrollDetermined = true;
            if (Math.abs(diffY) >= Math.abs(diffX)) {
                currentTarget = null;
                return;
            }
            isSwiping = true;
            clickPrevented = true;
            bubble.className = '';
        }

        if (isSwiping) {
            if (e.cancelable) e.preventDefault();

            if (diffX < 0) {
                swipeDir = 'left';
                if (targetType === 'day') {
                    iconEl.textContent = 'ios_share';
                } else {
                    iconEl.textContent = 'edit';
                }
            } else if (diffX > 0) {
                swipeDir = 'right';
                if (targetType === 'day') {
                    iconEl.textContent = 'add';
                } else if (targetType === 'row') {
                    let isPassed = false;
                    const dayDateEl = currentTarget.closest('.day')?.querySelector('.day-date');
                    if (dayDateEl) {
                        const dateStr = dayDateEl.textContent.trim();
                        const match = dateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                        let classDate = new Date();
                        if (match) {
                            const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                            if (m !== undefined) {
                                classDate.setMonth(m);
                                classDate.setDate(parseInt(match[1]));
                            }
                        } else {
                            const isoMatch = dateStr.match(/(\d{2})\.(\d{2})/);
                            if (isoMatch) {
                                classDate.setMonth(parseInt(isoMatch[2])-1);
                                classDate.setDate(parseInt(isoMatch[1]));
                            }
                        }
                        classDate.setHours(0,0,0,0);
                        const today = new Date();
                        today.setHours(0,0,0,0);

                        if (classDate.getTime() < today.getTime()) {
                            isPassed = true;
                        } else if (classDate.getTime() === today.getTime()) {
                            const timeEl = currentTarget.querySelector('.eval');
                            if (timeEl) {
                                const parts = timeEl.textContent.trim().split(':');
                                if (parts.length === 2) {
                                    const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                                    const currentMins = new Date().getHours() * 60 + new Date().getMinutes();
                                    if (currentMins >= startMins) isPassed = true;
                                }
                            }
                        }
                    }

                    if (!isPassed) {
                        iconEl.textContent = 'notification_important';
                        bubble.className = 'active-threshold action-important';
                    } else if (hasEval) {
                        iconEl.textContent = 'star_rate';
                        bubble.className = 'active-threshold action-eval';
                    } else {
                        targetElements.forEach(el => el.style.setProperty('transform', 'translateX(0px)', 'important'));
                        bubble.style.opacity = '0';
                        return;
                    }
                }
            }

            let moveX = diffX;
            if (Math.abs(moveX) > THRESHOLD) {
                moveX = (moveX > 0 ? 1 : -1) * (THRESHOLD + (Math.abs(moveX) - THRESHOLD) * 0.25);
            }

            targetElements.forEach(el => el.style.setProperty('transform', `translateX(${moveX}px)`, 'important'));

            const rect = currentTarget.getBoundingClientRect();
            bubble.style.top = `${rect.top + (rect.height / 2) - 14}px`;

            if (swipeDir === 'left') {
                bubble.style.left = `${originalRect.right + (moveX / 2) - 14}px`;
            } else {
                bubble.style.left = `${originalRect.left + (moveX / 2) - 14}px`;
            }

            const absDiff = Math.abs(diffX);
            if (absDiff < 20) {
                bubble.style.opacity = '0';
            } else {
                bubble.style.opacity = Math.min((absDiff - 20) / 35, 1).toString();
            }

            if (Math.abs(diffX) >= THRESHOLD) {
                if (targetType === 'day') {
                    if (swipeDir === 'left') {
                        bubble.classList.add('active-threshold', 'action-share');
                    } else {
                        bubble.classList.add('active-threshold', 'action-add');
                    }
                } else if (swipeDir === 'left') {
                    bubble.classList.add('active-threshold', 'action-note');
                } else if (!bubble.classList.contains('action-important')) {
                    bubble.classList.add('active-threshold', 'action-eval');
                }

                if (!bubble.dataset.vibrated && navigator.vibrate) {
                    navigator.vibrate(15);
                    bubble.dataset.vibrated = 'true';
                }
            } else {
                bubble.classList.remove('active-threshold', 'action-add', 'action-note', 'action-eval', 'action-share', 'action-important');
                bubble.dataset.vibrated = '';
            }
        }
    }, { passive: false });

    // Сбрасывает состояние свайпа и запускает действие при достижении порога.
    const resetSwipe = (e) => {
        if (!currentTarget || !isSwiping) {
            currentTarget = null;
            isSwiping = false;
            return;
        }

        const endDiffX = (e.changedTouches && e.changedTouches.length > 0) ? (e.changedTouches[0].clientX - startX) : lastDiffX;
        const finalDiff = Math.abs(endDiffX) > Math.abs(lastDiffX) ? endDiffX : lastDiffX;
        const target = currentTarget;
        const tType = targetType;
        const dir = swipeDir;
        const el = evalLink;

        // Запоминаем флаги действия до сброса классов пузыря
        const isImportant = bubble.classList.contains('action-important');
        const isEval = bubble.classList.contains('action-eval');

        targetElements.forEach(elem => {
            elem.style.setProperty('transition', 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 'important');
            elem.style.setProperty('transform', 'translateX(0px)', 'important');
        });

        bubble.style.opacity = '0';
        bubble.classList.remove('active-threshold', 'action-add', 'action-note', 'action-eval', 'action-share', 'action-important');
        bubble.dataset.vibrated = '';

        // Блокируем случайное открытие ссылки под пальцем, но НЕ блокируем кнопки скрипта
        if (clickPrevented) {
            const preventClickCapture = (ev) => {
                if (ev.target.closest('.subject-note-btn, .pair-important-btn, .share-day-btn, .add-custom-pair-btn')) return;
                ev.preventDefault();
                ev.stopPropagation();
            };
            window.addEventListener('click', preventClickCapture, true);
            setTimeout(() => window.removeEventListener('click', preventClickCapture, true), 200);
        }

        if (Math.abs(finalDiff) >= THRESHOLD) {
            setTimeout(() => {
                if (tType === 'day') {
                    if (dir === 'left') {
                        const shareBtn = target.querySelector('.share-day-btn');
                        if (shareBtn) shareBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    } else if (dir === 'right') {
                        const dayNameEl = target.querySelector('.day-name');
                        if (dayNameEl && typeof window.openCustomPairModal === 'function') {
                            window.openCustomPairModal(dayNameEl.textContent.trim());
                        }
                    }
                } else if (tType === 'row') {
                    if (dir === 'left') {
                        const noteBtn = target.querySelector('.subject-note-btn');
                        if (noteBtn) noteBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    } else if (dir === 'right') {
                        if (isImportant) {
                            const impBtn = target.querySelector('.pair-important-btn');
                            if (impBtn) impBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                        } else if (isEval && el) {
                            if (el.hasAttribute('href')) window.location.href = el.getAttribute('href');
                            else el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                        }
                    }
                }
            }, 50);
        }

        currentTarget = null;
        isSwiping = false;
        clickPrevented = false;
    };

    span9El.addEventListener('touchend', resetSwipe, { passive: true });
    span9El.addEventListener('touchcancel', resetSwipe, { passive: true });
}
