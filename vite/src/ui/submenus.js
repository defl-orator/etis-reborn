// Преобразует старую разметку подменю и центрирует активную вкладку на мобильных
export function initSubmenus() {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(menu => {
        menu.querySelectorAll('.submenu-item').forEach(span => {
            const link = span.querySelector('a');
            if (link) {
                span.replaceWith(link);
            } else {
                const b = document.createElement('b');
                b.textContent = span.textContent.trim();
                span.replaceWith(b);
            }
        });

        // Очистка текстовых узлов и мусора
        Array.from(menu.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent.replace(/&nbsp;|\u00A0/g, '').trim();
                if (text) {
                    let b = document.createElement('b');
                    b.textContent = text;
                    menu.replaceChild(b, node);
                } else {
                    node.remove();
                }
            } else if (node.tagName === 'BR') {
                node.remove();
            } else if (node.tagName !== 'A' && node.tagName !== 'B') {
                if (!node.querySelector('a')) {
                    let b = document.createElement('b');
                    b.textContent = node.textContent.trim();
                    menu.replaceChild(b, node);
                }
            }
        });
    });
    // Центрирование активного элемента подменю (вкладки) на мобильных устройствах
    if (window.innerWidth <= 960) {
        submenus.forEach(menu => {
            const activeItem = menu.querySelector('b');
            if (activeItem) {
                setTimeout(() => {
                    const containerWidth = menu.offsetWidth;
                    const itemWidth = activeItem.offsetWidth;
                    const itemLeft = activeItem.offsetLeft;

                    const scrollTarget = itemLeft - (containerWidth / 2) + (itemWidth / 2);

                    menu.scrollTo({
                        left: scrollTarget,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        });
    }
}
