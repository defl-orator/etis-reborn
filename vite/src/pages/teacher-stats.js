import { pageCtx } from '../app/context.js';
import { updateEmptyState } from '../ui/empty-state.js';

export function renderTeacherStatsPage() {
    const table = pageCtx.span9.querySelector('table.common');
    // Таблица считается пустой, если в ней нет строк с ячейками данных (td), только заголовки (th)
    const hasData = table && table.querySelectorAll('td').length > 0;

    if (hasData) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wide-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        table.removeAttribute('border');
        table.querySelectorAll('td, th').forEach(el => {
            el.removeAttribute('align');
            el.removeAttribute('valign');
            if (el.textContent.trim() === '') el.classList.add('empty');
        });

        const footerText = pageCtx.span9.innerHTML.split('</table>')[1];
        if (footerText) {
            const footerDiv = document.createElement('div');
            footerDiv.className = 'electr-description';
            footerDiv.style.textAlign = 'left';
            footerDiv.style.marginTop = '2rem';
            footerDiv.innerHTML = footerText.replace(/<br>/g, '');

            const currentContent = pageCtx.span9.innerHTML.split('</table>')[0] + '</table>';
            pageCtx.span9.innerHTML = currentContent;
            pageCtx.span9.appendChild(footerDiv);
        }
    } else {
        if (table) table.remove();

        // Удаляем текстовые сноски внизу страницы ("** - если средний балл...")
        Array.from(pageCtx.span9.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('средний балл')) {
                node.textContent = '';
            }
            if (node.tagName === 'BR') {
                node.remove();
            }
        });
    }

    // Вызываем проверку пустого состояния
    updateEmptyState(pageCtx.span9, hasData, '', 'teacher_stats');
    return;
}
