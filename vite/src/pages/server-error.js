import { LOGO_DATA_URI } from '../assets/logo.js';

// ==========================================
// ОФОРМЛЕНИЕ СТРАНИЦЫ ОШИБКИ СЕРВЕРА (502 / 503 / 504)
// ==========================================
export function checkAndRenderServerError() {
    const bodyText = document.body ? (document.body.innerText || document.body.textContent) : '';
    const pageTitle = document.title || '';
    
    const is50x = /502 Bad Gateway|503 Service Temporarily Unavailable|504 Gateway Time-out/i.test(bodyText) ||
                  /502|503|504/i.test(pageTitle);

    if (!is50x) return false;

    document.body.innerHTML = `
                <div style="min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; box-sizing: border-box; background: var(--color-body); font-family: var(--font-family);">
                    <div style="background: var(--color-card); border: 1px solid var(--color-table-border); border-radius: var(--radius-large); box-shadow: var(--shadow-dialog); padding: 4rem 3rem; max-width: 480px; width: 100%; box-sizing: border-box; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.6rem; animation: cellScaleIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                        
                        <!-- Логотип ЕТИС -->
                        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--color-highlight); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-main); margin-bottom: 0.4rem;">
                            <img src="${LOGO_DATA_URI}" alt="Logo" style="width: 36px; height: auto; ${document.documentElement.getAttribute('theme') === 'dark' ? 'filter: invert(1) brightness(2);' : ''}">
                        </div>

                        <!-- Бейдж ошибки -->
                        <div style="background: rgba(255, 59, 48, 0.12); color: var(--color-red); font-weight: 800; font-size: 1.15rem; padding: 0.4rem 1.2rem; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.6px; display: inline-flex; align-items: center; gap: 6px;">
                            <span class="material-icons" style="font-size: 1.6rem; color: var(--color-red);">cloud_off</span>
                            502 Bad Gateway
                        </div>

                        <!-- Заголовок -->
                        <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.25; margin-top: 0.2rem;">
                            Сервер ЕТИС временно недоступен
                        </div>

                        <!-- Описание -->
                        <div style="font-size: 1.35rem; color: var(--color-text-secondary); line-height: 1.6; max-width: 380px;">
                            На стороне университета произошёл сбой в работе шлюза или сервер перегружен. Ваши локальные настройки и сохранённые данные в безопасности.
                        </div>

                        <!-- Кнопки действий -->
                        <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; margin-top: 1rem;">
                            <button id="retry-502-btn" class="answer-btn-custom" style="width: 100% !important; justify-content: center !important; height: 44px !important; font-size: 1.45rem !important; font-weight: 700 !important; border-radius: 50px !important; gap: 8px !important; cursor: pointer !important;">
                                <span class="material-icons" style="font-size: 2rem;">refresh</span>
                                Повторить попытку
                            </button>

                            <button id="demo-502-btn" class="answer-btn-custom" style="width: 100% !important; justify-content: center !important; height: 44px !important; font-size: 1.45rem !important; font-weight: 700 !important; border-radius: 50px !important; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; -webkit-text-fill-color: var(--color-text-primary) !important; border: 1px solid var(--color-table-border) !important; box-shadow: none !important; gap: 8px !important; cursor: pointer !important;">
                                <span class="material-icons" style="font-size: 2rem; color: var(--color-accent) !important; -webkit-text-fill-color: var(--color-accent) !important;">cloud_off</span>
                                <span style="color: var(--color-text-primary) !important; -webkit-text-fill-color: var(--color-text-primary) !important;">Открыть расписание оффлайн</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

    // Обработчик "Повторить попытку"
    const retryBtn = document.getElementById('retry-502-btn');
    if (retryBtn) {
        retryBtn.onclick = (e) => {
            e.preventDefault();
            retryBtn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite; font-size: 2rem;">sync</span> Проверяем...';
            retryBtn.style.pointerEvents = 'none';
            setTimeout(() => window.location.reload(), 300);
        };
    }

    // Обработчик "Открыть Демо-режим"
    const demoBtn = document.getElementById('demo-502-btn');
    if (demoBtn) {
        demoBtn.onclick = (e) => {
            e.preventDefault();
            sessionStorage.setItem('etis_demo_mode', 'true');
            sessionStorage.setItem('etis_demo_page', 'timetable');
            window.location.reload();
        };
    }

    return true;
}
