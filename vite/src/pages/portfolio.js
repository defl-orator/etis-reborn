import { pageCtx } from '../app/context.js';

export function renderPortfolioPage() {
    while (pageCtx.span9.firstChild && (pageCtx.span9.firstChild.tagName === 'BR' || (pageCtx.span9.firstChild.nodeType === Node.TEXT_NODE && !pageCtx.span9.firstChild.textContent.trim()))) {
        pageCtx.span9.firstChild.remove();
    }

    // Обнуляем отступ у главного заголовка "Результаты..."
    const mainH3 = pageCtx.span9.querySelector('h3');
    if (mainH3 && !mainH3.querySelector('a.dashed')) {
        mainH3.style.setProperty('margin-top', '0', 'important');
        mainH3.style.setProperty('margin-bottom', '2.4rem', 'important');
    }

    const portfolioLinks = pageCtx.span9.querySelectorAll('h3 > a.dashed');

    portfolioLinks.forEach(link => {
        const h3 = link.parentElement;
        const oldCounter = link.querySelector('span[id$="_cnt"]');

        const headerCard = document.createElement('div');
        headerCard.className = 'portfolio-header';

        if (oldCounter) {
            const countVal = oldCounter.textContent.replace(/[()]/g, '').trim();
            if (countVal !== "") {
                const newBadge = document.createElement('span');
                newBadge.className = 'portfolio-count';
                newBadge.textContent = countVal;
                headerCard.appendChild(newBadge);
            }
        }

        Array.from(link.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = node.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
            }
        });

        const chevron = document.createElement('span');
        chevron.className = 'material-icons portfolio-arrow';
        chevron.textContent = 'arrow_drop_down';
        headerCard.appendChild(chevron);

        h3.parentNode.insertBefore(headerCard, h3);
        headerCard.prepend(link);

        headerCard.onclick = (e) => {
            if (e.target !== link) link.click();
        };
        link.onclick = (e) => e.stopPropagation();

        h3.remove();
    });

    // --- СКРОЛЛ ТАБЛИЦ ---
    // Находим все блоки контента (публикации, проекты и т.д.)
    const contentDivs = pageCtx.span9.querySelectorAll('div[id="pub"], div[id="pis"], div[id="agr"], div[id="ooo"], div[id="saw"], div[id="vkr"]');

    contentDivs.forEach(div => {
        const table = div.querySelector('table');
        if (table) {
            // Создаем обертку для скролла
            const wrapper = document.createElement('div');
            wrapper.className = 'wide-table-wrapper';

            // Вставляем обертку перед таблицей
            table.parentNode.insertBefore(wrapper, table);

            // Перемещаем таблицу внутрь
            wrapper.appendChild(table);

            // Сбрасываем ширину, чтобы таблица растягивалась
            table.style.width = '100%';
        }
    });

    // Иконки загрузки файлов
    const loadImgs = pageCtx.span9.querySelectorAll('img[name="load_doc"]');
    loadImgs.forEach(img => {
        const icon = document.createElement('span');
        icon.className = 'material-icons icon-load-doc-new';
        icon.textContent = 'upload_file';
        icon.style.cursor = 'pointer';

        Array.from(img.attributes).forEach(attr => {
            icon.setAttribute(attr.name, attr.value);
        });

        icon.onclick = function(e) {
            if (typeof window.get_files === 'function') {
                window.get_files.call(this);
            } else if (typeof get_files === 'function') {
                get_files.call(this);
            }
        };

        img.parentNode.replaceChild(icon, img);
    });

    const dialogObserver = new MutationObserver(() => {
        const dialog = document.querySelector('.ui-dialog');
        if (dialog) {
            dialog.style.width = 'min(90vw, 500px)';
            dialog.style.position = 'fixed';
            dialog.style.top = '50%';
            dialog.style.left = '50%';
            dialog.style.transform = 'translate(-50%, -50%)';
        }
    });

    dialogObserver.observe(document.body, { childList: true });

    return;
}
