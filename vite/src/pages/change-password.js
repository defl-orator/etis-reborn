// Оформляет форму смены пароля с плейсхолдерами вместо меток
export function renderChangePasswordPage() {
    const passSpan9 = document.querySelector('.span9');
    const passForm = passSpan9.querySelector('form.form');
    const passH3 = passSpan9.querySelector('h3');

    if (passForm) {
        passForm.querySelectorAll('br').forEach(br => br.remove());

        if (passH3) {
            passH3.style.textAlign = 'center';
            passH3.style.marginBottom = '3rem';
            passForm.prepend(passH3);
        }

        const labels = passForm.querySelectorAll('label');
        labels.forEach(label => {
            const input = document.getElementById(label.getAttribute('for'));
            if (input) {
                input.placeholder = label.textContent.trim();
                // Очищаем значение, чтобы плейсхолдер был виден (если это не сохраненный email)
                if (input.type === 'password') input.value = '';
                label.remove();
            }
        });

        const btn = passForm.querySelector('button');
        if (btn) btn.style.width = '100%';

        passForm.style.maxWidth = '400px';
        passForm.style.margin = '40px auto';
    }
    return;
}
