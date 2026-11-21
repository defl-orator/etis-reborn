// Оформляет форму смены электронной почты и справочный блок
export function renderChangeEmailPage() {
    const emailSpan9 = document.querySelector('.span9');
    const emailForm = emailSpan9.querySelector('form.form');
    const emailH3 = emailSpan9.querySelector('h3');

    if (emailForm) {
        const footerBox = document.createElement('div');
        footerBox.className = 'electr-description';

        const allDivs = Array.from(emailSpan9.querySelectorAll('div:not(.span3):not(.span9)'));
        const infoUl = emailSpan9.querySelector('ul');

        allDivs.forEach(div => {
            if (div.textContent.includes('Адрес электронной почты') && !div.contains(emailForm)) {
                footerBox.appendChild(div);
            }
        });

        if (infoUl) {
            infoUl.removeAttribute('style');
            footerBox.appendChild(infoUl);
        }

        if (emailH3) {
            emailH3.style.textAlign = 'center';
            emailH3.style.marginBottom = '3rem';
            emailForm.prepend(emailH3);
        }

        const label = emailForm.querySelector('label');
        const input = emailForm.querySelector('input');
        if (label && input) {
            input.placeholder = label.textContent.trim();
            label.remove();
        }

        const btn = emailForm.querySelector('button');
        if (btn) btn.style.width = '100%';

        emailForm.style.maxWidth = '400px';
        emailForm.style.margin = '40px auto';

        emailSpan9.appendChild(footerBox);
        emailForm.querySelectorAll('br').forEach(br => br.remove());
    }
    return;
}
