import { pageCtx } from '../app/context.js';

// Оформляет анкету оценки занятия и добавляет кнопку возврата
export function renderEstimateFormsPage() {
    if (!pageCtx.span9.querySelector('.estimate-top-bar')) {
        const topBar = document.createElement('div');
        topBar.className = 'estimate-top-bar';
        topBar.style.cssText = 'display: flex; align-items: center; justify-content: flex-start; gap: 12px; margin-bottom: 2.4rem; width: 100%; box-sizing: border-box;';

        const backBtn = document.createElement('a');
        backBtn.href = 'javascript:window.history.back()';
        backBtn.className = 'answer-btn-custom';
        backBtn.style.cssText = 'display: inline-flex !important; align-items: center !important; gap: 8px !important; padding: 0.8rem 1.8rem !important; height: auto !important; border-radius: 50px !important; width: fit-content !important; cursor: pointer !important; text-decoration: none !important; border: none !important;';
        backBtn.innerHTML = '<span class="material-icons" style="font-size: 1.8rem;">arrow_back</span><span>Назад</span>';

        topBar.appendChild(backBtn);
        pageCtx.span9.prepend(topBar);
    }

    pageCtx.span9.querySelectorAll('.question label select').forEach(sel => {
        const activateRadio = () => {
            const radio = sel.closest('label')?.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                if (window.$) $(radio).trigger('change');
                else radio.dispatchEvent(new Event('change', { bubbles: true }));
                
                sel.closest('ul')?.querySelectorAll('label').forEach(l => l.classList.remove('checked'));
                sel.closest('label')?.classList.add('checked');
            }
        };
        sel.addEventListener('change', activateRadio);
        sel.addEventListener('click', activateRadio);
    });

    const form = pageCtx.span9.querySelector('form[name="estimate"], form.que_form');
    if (form) {
        const sendBtn = form.querySelector('#send_btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const queInput = form.querySelector('#p_que_str') || form.querySelector('input[name="p_que_str"]');
                const checkedQ = Array.from(form.querySelectorAll('input[type="radio"][name^="q"]:checked'));
                if (queInput && checkedQ.length > 0) {
                    queInput.value = checkedQ.map(r => encodeURIComponent(r.name) + '=' + encodeURIComponent(r.value)).join('&');
                }

                if (window.showEtisPush) {
                    window.showEtisPush('Отзыв отправлен', 'Спасибо за оценку!', 'Возвращаемся в расписание...', 'success', 'check_circle', null, null, false);
                }
            });
        }
    }

    return;
}
