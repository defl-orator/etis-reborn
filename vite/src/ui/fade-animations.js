// Инициализирует плавное появление карточек и блоков при прокрутке
export function initFadeAnimations() {
    const animatedSelectors =[
        '.day', '.teacher-card', '.msg-card', '.advice-card', '.order-card', '.jour-card',
        '.review-item', '.contract-card', '.form-card', '.calendar-card', '.about-card',
        '.survey-card', '.jour-info-card', '.wide-table-wrapper', '.subject-header-flex',
        '.question', '.comment', '.cert-footer-card', '.absence-stat', '.portfolio-header',
        'form.form', '.cert-alert-box', '.electr-description', '.info-block-anim'
    ].join(', ');

    const animatedElements = document.querySelectorAll(animatedSelectors);

    // Отсеиваем вложенные элементы (чтобы таблица внутри карточки не прыгала второй раз)
    const topLevelElements = Array.from(animatedElements).filter(el => {
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
            if (parent.matches && parent.matches(animatedSelectors)) return false;
            parent = parent.parentElement;
        }
        return true;
    });

    topLevelElements.forEach(el => el.classList.add('anim-fade-up'));

    // Используем IntersectionObserver: элемент анимируется только когда появляется на экране
    const observer = new IntersectionObserver((entries) => {
        let delayCounter = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // Небольшая задержка для красивого эффекта "лесенки", если на экране сразу много элементов
                setTimeout(() => {
                    el.classList.add('is-visible');
                }, delayCounter * 40);
                delayCounter++;
                observer.unobserve(el);
            }
        });
    }, {
        rootMargin: '50px 0px', // Начинаем анимацию чуть раньше, чем элемент появится на экране
        threshold: 0.05
    });

    topLevelElements.forEach(el => observer.observe(el));
}
