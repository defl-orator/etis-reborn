import { pageCtx } from '../app/context.js';
import { generalConfig } from '../core/config.js';
import { escapeHTML } from '../utils/security.js';

export function renderLoginPage() {
    document.body.innerHTML = '<div class="login-container">' + document.body.innerHTML + '</div>';
    
    // Находим актуальные ссылки на элементы в пересозданном DOM
    const loginContainer = document.querySelector('div.login-container');
    const loginForm = document.getElementById('form');
    const activeLoginDiv = loginContainer.querySelector('.login');

    // Определение типов страниц авторизации
    const isRecoveryPage = pageCtx.page === 'stu_email_pkg.send_r_email' || window.location.href.includes('send_r_email');
    const isChangePwdPage = pageCtx.page === 'stu_email_pkg.change_pwd' || window.location.href.includes('change_pwd') || !!loginForm?.querySelector('input[name="p_vkey"]');
    const isAuthSubPage = isRecoveryPage || isChangePwdPage;

    if (loginForm && !isAuthSubPage) {
        loginForm.addEventListener('submit', () => {
            const loginInput = loginForm.querySelector('input[name="p_login"]') || loginForm.querySelector('input[type="text"]');
            if (loginInput && loginInput.value) {
                const cleanLogin = loginInput.value.trim().toLowerCase();
                if (typeof GM_setValue !== 'undefined') {
                    GM_setValue('etis_secure_login_id', cleanLogin);
                }
            }
        });
    }

    let inputsWrapper = null;
    const allItemsBlocks = loginForm.querySelectorAll('div.items');
    let loginItems = null;
    let extraAlerts = [];

    allItemsBlocks.forEach(block => {
        if (block.querySelector('.item')) {
            loginItems = block;
        } else {
            extraAlerts.push(block);
        }
    });

    if (!loginItems && allItemsBlocks.length > 0) loginItems = allItemsBlocks[0];

    // Логотип и динамический заголовок
    const chooseDiv = document.querySelector('div.choose');
    if (chooseDiv) chooseDiv.remove();

    const psuLogo = document.createElement('div');
    psuLogo.className = 'psu-logo';

    let subtitleText = 'Войдите в аккаунт<br>ЕТИС';
    if (isChangePwdPage) subtitleText = 'Новый<br>пароль';
    else if (isRecoveryPage) subtitleText = 'Восстановление<br>пароля';

    const subtitle = document.createElement('div');
    subtitle.className = 'psu-logo-subtitle';
    subtitle.innerHTML = subtitleText;
    psuLogo.appendChild(subtitle);

    const oldTitle = loginForm.querySelector('.choose');
    if (oldTitle) oldTitle.remove();

    inputsWrapper = document.createElement('div');
    inputsWrapper.className = 'login-inputs-wrapper';

    const allItems = loginItems.querySelectorAll('.item');
    allItems.forEach(item => inputsWrapper.appendChild(item));

    loginItems.prepend(inputsWrapper);
    loginForm.prepend(psuLogo);

    let helpTextContent = '';

    const oldFooter = document.querySelector('div.header_message');
    if (oldFooter) {
        helpTextContent += `<p style="margin-bottom:8px;">${oldFooter.innerHTML}</p>`;
        oldFooter.remove();
    }

    const walker = document.createTreeWalker(loginItems, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToRemove = [];
    while(node = walker.nextNode()) {
        if (node.textContent.includes('2396870') || node.textContent.includes('технической поддержки')) {
            if (!helpTextContent.includes(node.textContent.trim())) {
                helpTextContent += `<p style="margin-bottom:8px;">${node.textContent.trim()}</p>`;
            }
            nodesToRemove.push(node);
        }
    }
    nodesToRemove.forEach(n => n.remove());
    loginItems.querySelectorAll('br').forEach(br => br.remove());

    const loginActions = document.createElement('div');
    loginActions.className = 'login-actions';
    loginItems.appendChild(loginActions);

    // Нижние действия: ссылка "Забыли пароль?" или "Назад ко входу"
    if (!isAuthSubPage) {
        let el = loginItems.querySelector('a');
        if (el) {
            el.className = 'forgot-password';
            loginActions.appendChild(el);
        }
    } else {
        const backToLogin = document.createElement('a');
        backToLogin.href = 'stu.login';
        backToLogin.className = 'forgot-password';
        backToLogin.textContent = 'Назад ко входу';
        loginActions.appendChild(backToLogin);
    }

    let sbmt = document.getElementById('sbmt') || loginForm.querySelector('button[type="submit"]') || loginForm.querySelector('input[type="submit"]');
    if (sbmt) {
        sbmt.id = 'sbmt';
        loginActions.appendChild(sbmt);
    }

    // Стилизация элементов формы и сообщений
    const items = loginItems.querySelectorAll('div.item');
    items.forEach(item => {
        const errorMessage = item.querySelector('div.error_message');
        if (errorMessage) {
            if (!errorMessage.querySelector('.material-icons')) {
                const errIcon = document.createElement('span');
                errIcon.className = 'material-icons';
                errIcon.textContent = 'error';
                errIcon.style.cssText = 'color: var(--color-red) !important; font-size: 2.2rem !important; flex-shrink: 0; line-height: 1;';
                errorMessage.prepend(errIcon);
            }

            document.body.appendChild(errorMessage);
            item.remove();

            requestAnimationFrame(() => {
                setTimeout(() => {
                    errorMessage.classList.add('show');
                }, 100);
            });

            setTimeout(() => {
                errorMessage.classList.remove('show');
                setTimeout(() => {
                    errorMessage.remove();
                }, 400);
            }, 5000);

            return;
        }

        // Оформление информационных блоков с текстом (письмо отправлено / правила пароля)
        const paragraphs = item.querySelectorAll('p');
        if (paragraphs.length > 0) {
            item.style.cssText = 'background: var(--color-highlight); border: 1px solid var(--color-table-border); border-radius: var(--radius-medium); padding: 1.4rem 1.6rem; margin-bottom: 1.6rem; text-align: left;';
            paragraphs.forEach(p => {
                p.style.cssText = 'font-size: 1.3rem; line-height: 1.6; color: var(--color-text-primary); margin: 0 0 8px 0;';
                p.querySelectorAll('b').forEach(b => {
                    b.style.cssText = 'color: var(--color-accent); font-weight: 700; display: inline-block; word-break: break-all;';
                });
            });
            const lastP = paragraphs[paragraphs.length - 1];
            if (lastP) lastP.style.marginBottom = '0';
        }

        // Оформление полей ввода и плейсхолдеров
        let input = item.querySelector('input');
        let label = item.querySelector('label');
        if (input) {
            if (label) {
                let labelText = label.textContent.trim();
                if (labelText === 'Фамилия / email' || labelText.includes('email')) labelText = 'Email';
                input.placeholder = labelText;
                label.remove();
            } else if (!input.placeholder) {
                if (input.name === 'p_password' || input.id === 'password') input.placeholder = 'Новый пароль';
                else if (input.name === 'p_password1' || input.id === 'password1') input.placeholder = 'Повторите новый пароль';
            }
        }
    });

    if (extraAlerts.length > 0) {
        const alertsContainer = document.createElement('div');
        alertsContainer.className = 'login-alerts-wrapper';
        loginForm.parentNode.insertBefore(alertsContainer, loginForm.nextSibling);

        extraAlerts.forEach(alertBlock => {
            const alertCard = document.createElement('div');
            alertCard.className = 'login-alert-box';
            alertCard.innerHTML = alertBlock.innerHTML;
            alertsContainer.appendChild(alertCard);
            alertBlock.remove();
        });
    }

    // БЫСТРЫЙ ВХОД (Показывается ТОЛЬКО на странице обычного входа)
    const qlEnabled = generalConfig.quickLoginEnabled;
    let qlAccounts = [];
    try {
        let raw = '';
        if (typeof GM_getValue !== 'undefined') {
            raw = GM_getValue('ql_accounts_v2', '');
        }
        // Миграция: если старая версия оставила пароли в localStorage страницы — переносим в хранилище скрипта и стираем
        const legacyQL = localStorage.getItem('ql_accounts_v2');
        if (legacyQL !== null) {
            if (!raw && typeof GM_setValue !== 'undefined') {
                try { GM_setValue('ql_accounts_v2', legacyQL); raw = legacyQL; } catch (e) {}
            }
            localStorage.removeItem('ql_accounts_v2');
        }
        if (!raw) raw = '[]';
        qlAccounts = JSON.parse(raw);
    } catch (e) {
        qlAccounts = [];
    }

    if (!isAuthSubPage && qlEnabled && qlAccounts.length > 0) {
        if (inputsWrapper) inputsWrapper.style.setProperty('display', 'none', 'important');
        if (loginActions) loginActions.style.setProperty('display', 'none', 'important');

        const qlBlock = document.createElement('div');
        qlBlock.id = 'quick-login-block';
        qlBlock.style.cssText = 'display: flex; flex-direction: column; gap: 1.6rem; width: 100%; align-items: center; margin: auto 0 !important;';
        
        if (qlAccounts.length === 1) {
            const qlBtn = document.createElement('button');
            qlBtn.className = 'answer-btn-custom ql-login-btn';
            qlBtn.setAttribute('data-idx', '0');
            qlBtn.style.cssText = 'width: 100%; height: 48px; font-size: 1.5rem; font-weight: 700; border-radius: 24px; justify-content: center; cursor: pointer;';
            qlBtn.innerHTML = `<span class="material-symbols-rounded" style="margin-right: 8px; font-size: 20px;">flash_on</span> Войти как ${escapeHTML(qlAccounts[0].name)}`;
            qlBlock.appendChild(qlBtn);
        } else {
            const expanderBtn = document.createElement('button');
            expanderBtn.id = 'ql-expander-btn';
            expanderBtn.className = 'answer-btn-custom';
            expanderBtn.style.cssText = 'width: 100%; height: 48px; font-size: 1.5rem; font-weight: 700; border-radius: 24px; justify-content: center; cursor: pointer;';
            expanderBtn.innerHTML = '<span class="material-symbols-rounded" style="margin-right: 8px; font-size: 20px;">flash_on</span> Быстрый вход';

            const accountsMenu = document.createElement('div');
            accountsMenu.id = 'ql-accounts-menu';
            accountsMenu.style.cssText = 'display: none; flex-direction: column; gap: 1rem; width: 100%; margin-top: 0.5rem;';

            qlAccounts.forEach((acc, idx) => {
                const accBtn = document.createElement('button');
                accBtn.className = 'answer-btn-custom ql-login-btn';
                accBtn.setAttribute('data-idx', idx.toString());
                accBtn.style.cssText = 'width: 100%; height: 44px; font-size: 1.4rem; font-weight: 600; border-radius: 20px; justify-content: center; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; border: 1px solid var(--color-table-border) !important; cursor: pointer;';
                accBtn.textContent = `Войти как ${acc.name}`;
                accountsMenu.appendChild(accBtn);
            });

            expanderBtn.onclick = (e) => {
                e.preventDefault();
                expanderBtn.style.setProperty('display', 'none', 'important');
                accountsMenu.style.display = 'flex';
            };

            qlBlock.appendChild(expanderBtn);
            qlBlock.appendChild(accountsMenu);
        }

        const manualBtn = document.createElement('a');
        manualBtn.href = '#';
        manualBtn.className = 'forgot-password';
        manualBtn.style.cssText = 'font-size: 1.3rem; margin-top: 0.5rem; text-decoration: underline; cursor: pointer;';
        manualBtn.textContent = 'Войти под другим аккаунтом';

        qlBlock.appendChild(manualBtn);
        loginItems.appendChild(qlBlock);

        const performQuickLogin = (email, password) => {
            const emailInput = loginForm.querySelector('input[name="p_login"]') || loginForm.querySelector('input[type="text"]');
            const passwordInput = loginForm.querySelector('input[name="p_pass"]') || loginForm.querySelector('input[type="password"]');
            if (emailInput && passwordInput) {
                if (typeof GM_setValue !== 'undefined') { GM_setValue('etis_secure_login_id', email.trim().toLowerCase()); }
                emailInput.value = email;
                passwordInput.value = password;
                loginForm.submit();
            }
        };

        qlBlock.querySelectorAll('.ql-login-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const acc = qlAccounts[idx];
                if (acc) {
                    performQuickLogin(acc.email, acc.password);
                }
            };
        });

        manualBtn.onclick = (e) => {
            e.preventDefault();
            qlBlock.style.setProperty('display', 'none', 'important');
            if (inputsWrapper) inputsWrapper.style.setProperty('display', 'block', 'important');
            if (loginActions) loginActions.style.setProperty('display', 'flex', 'important');
        };
    }
// --- КНОПКА СПРАВКИ И ОФФЛАЙН-РЕЖИМА В ПРАВОМ ВЕРХНЕМ УГЛУ ---
    const helpWrap = document.createElement('div');
    helpWrap.className = 'login-help-wrap';

    const helpBtn = document.createElement('div');
    helpBtn.className = 'login-help-btn';
    helpBtn.textContent = '?';

    const helpMenu = document.createElement('div');
    helpMenu.className = 'login-help-menu';
    helpMenu.innerHTML = helpTextContent || '';

    const demoContainer = document.createElement('div');
    demoContainer.style.cssText = helpTextContent 
        ? 'margin-top: 1.2rem; padding-top: 1.2rem; border-top: 1px solid var(--color-table-border);' 
        : '';
    
    const demoBtn = document.createElement('button');
    demoBtn.className = 'answer-btn-custom';
    demoBtn.style.cssText = 'width: 100% !important; justify-content: center !important; font-size: 1.25rem !important; font-weight: 700 !important; height: 36px !important; gap: 8px !important; box-shadow: none !important; margin: 0 !important; cursor: pointer !important;';
    demoBtn.innerHTML = `
                    <span class="material-icons" style="font-size: 18px;">cloud_off</span>
                    <span>Оффлайн-режим</span>
                `;
    demoBtn.onclick = (e) => {
        e.preventDefault();
        sessionStorage.setItem('etis_demo_mode', 'true');
        sessionStorage.setItem('etis_demo_page', 'timetable');
        window.location.reload();
    };
    demoContainer.appendChild(demoBtn);
    helpMenu.appendChild(demoContainer);

    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpMenu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        helpMenu.classList.remove('active');
    });
    helpMenu.addEventListener('click', (e) => e.stopPropagation());

    helpWrap.appendChild(helpBtn);
    helpWrap.appendChild(helpMenu);

    document.body.appendChild(helpWrap);
}
