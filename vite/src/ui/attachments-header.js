// Двустороннее динамическое затухание для файлов (слева и справа)
export const updateAttachmentsScrollMask = (el) => {
    if (!el) return;
    const isOverflowing = el.scrollWidth > el.clientWidth + 2;
    if (!isOverflowing) {
        el.style.setProperty('-webkit-mask-image', 'none', 'important');
        el.style.setProperty('mask-image', 'none', 'important');
        return;
    }

    const hasLeftScroll = el.scrollLeft > 6;
    const hasRightScroll = el.scrollLeft + el.clientWidth < el.scrollWidth - 6;
    const fadeSize = '32px';

    let mask = 'none';
    if (hasLeftScroll && hasRightScroll) {
        mask = `linear-gradient(to right, transparent 0%, #000 ${fadeSize}, #000 calc(100% - ${fadeSize}), transparent 100%)`;
    } else if (hasLeftScroll) {
        mask = `linear-gradient(to right, transparent 0%, #000 ${fadeSize}, #000 100%)`;
    } else if (hasRightScroll) {
        mask = `linear-gradient(to right, #000 0%, #000 calc(100% - ${fadeSize}), transparent 100%)`;
    }

    el.style.setProperty('-webkit-mask-image', mask, 'important');
    el.style.setProperty('mask-image', mask, 'important');
};

// Инициализирует обработчики прокрутки для затухания списка вложений
export const initAttachmentsScrollFade = (el) => {
    if (!el) return;
    el.addEventListener('scroll', () => updateAttachmentsScrollMask(el), { passive: true });
    requestAnimationFrame(() => updateAttachmentsScrollMask(el));
    setTimeout(() => updateAttachmentsScrollMask(el), 150);
};

// Замер ширины строки: сокращение даты и имени ТОЛЬКО если они не помещаются
export const adjustHeaderLayout = (header) => {
    if (!header) return;
    const sender = header.querySelector('.msg-sender');
    const senderName = header.querySelector('.msg-sender-name');
    const dateText = header.querySelector('.msg-date-text');
    const dateWrapper = header.querySelector('.msg-date-wrapper');

    if (!sender || !senderName || !dateText) return;

    const fullSender = senderName.getAttribute('data-full-sender') || senderName.textContent;
    const fullDate = dateText.getAttribute('data-full-date') || dateText.textContent;
    const shortDate = dateText.getAttribute('data-short-date') || fullDate;

    // Выставляем исходные полные значения для замера
    dateText.textContent = fullDate;
    senderName.textContent = fullSender;

    const availableWidth = header.clientWidth;
    if (availableWidth <= 0) return;

    const iconWidth = sender.querySelector('.material-icons')?.offsetWidth || 22;
    const senderGap = 8;
    const totalSenderWidth = iconWidth + senderGap + senderName.scrollWidth;
    const dateWidth = dateWrapper ? dateWrapper.scrollWidth : dateText.scrollWidth;
    const headerGap = 16;

    if (totalSenderWidth + dateWidth + headerGap > availableWidth) {
        dateText.textContent = shortDate;

        // Если всё ещё не влезает и имя длиннее 25 символов — обрезаем имя
        const newDateWidth = dateWrapper ? dateWrapper.scrollWidth : dateText.scrollWidth;
        if (fullSender.length > 25 && (totalSenderWidth + newDateWidth + headerGap > availableWidth)) {
            senderName.textContent = fullSender.slice(0, 25).trim() + '...';
        }
    } else {
        dateText.textContent = fullDate;
    }
};
