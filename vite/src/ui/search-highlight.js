// ==========================================
// 2. ВНЕДРЕНИЕ JS ЛОГИКИ
// ==========================================

export function highlightSearchTerm(container, term) {
    // 1. Убираем старые подсветки
    const oldHighlights = container.querySelectorAll('.search-highlight');
    oldHighlights.forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    if (!term || term.length < 2) return;

    // 2. Регулярка для поиска (без учета регистра)
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');

    // 3. Рекурсивный обход текстовых узлов
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if (node.parentNode.closest('.search-highlight')) return;
        if (regex.test(node.nodeValue)) {
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<mark class="search-highlight">$1</mark>');
            node.parentNode.replaceChild(span, node);
        }
    });
}
