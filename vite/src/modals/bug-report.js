import { generalConfig, saveGeneralConfig } from '../core/config.js';
import { initAutoUpdateCheck } from '../core/updater.js';
import { getUpdateHTML } from '../features/update-ui.js';
import { openSettingsModal } from './settings.js';

// Открывает модальное окно обратной связи
export function openUserscriptBugModal() {
    let overlay = document.getElementById('etis-bug-overlay');
    let modal = document.getElementById('etis-bug-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-bug-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-bug-modal';
        modal.className = 'analytics-modal';
        document.body.appendChild(modal);
    }

    const closeAll = () => {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open-body');
        document.querySelector('.mobile-nav-dock')?.classList.remove('dock-hidden');
    };
    overlay.onclick = closeAll;

    modal.innerHTML = `
                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2.4rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-icons" style="color:var(--color-accent); font-size:24px;">bug_report</span>
                        <span style="font-size: 1.7rem; font-weight: 800; color: var(--color-text-primary);">Обратная связь</span>
                    </div>
                    <span class="material-icons close-bug-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                </div>
                <div class="ui-dialog-content" style="padding: 2.4rem;">
                    <div style="font-size: 1.35rem; color: var(--color-text-primary); line-height: 1.5; margin-bottom: 2rem; text-align: left;">
                        Если вы обнаружили баг, хотите предложить улучшение или задать вопрос, свяжитесь со мной напрямую удобным способом:
                    </div>
                    
                    <div class="ios-settings-group" style="margin-bottom: 0 !important; border: none !important; box-shadow: var(--shadow-main) !important;">
                        <a href="https://t.me/perdyash" target="_blank" class="ios-settings-row" style="padding: 1.4rem 1.6rem !important;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span class="material-icons" style="color: #0088CC; font-size: 2.2rem;">send</span>
                                <div style="display: flex; flex-direction: column; text-align: left;">
                                    <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Telegram</span>
                                    <span style="font-size: 1.15rem; color: var(--color-text-secondary);">@perdyash</span>
                                </div>
                            </div>
                            <span class="material-icons chevron" style="color: var(--color-text-secondary);">open_in_new</span>
                        </a>
                        
                        <a href="mailto:bdengerr@gmail.com" class="ios-settings-row" style="padding: 1.4rem 1.6rem !important;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span class="material-icons" style="color: var(--color-red); font-size: 2.2rem;">email</span>
                                <div style="display: flex; flex-direction: column; text-align: left;">
                                    <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Email</span>
                                    <span style="font-size: 1.15rem; color: var(--color-text-secondary);">bdengerr@gmail.com</span>
                                </div>
                            </div>
                            <span class="material-icons chevron" style="color: var(--color-text-secondary);">open_in_new</span>
                        </a>
                    </div>
                </div>
            `;

    modal.querySelector('.close-bug-btn').onclick = closeAll;

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}

// Обновляет интерфейс блока обновлений в окне настроек
export function refreshModalUI() {
    const modal = document.getElementById('etis-settings-modal');
    if (modal) {
        const wrapper = modal.querySelector('#version-content-wrapper');
        if (wrapper) {
            wrapper.innerHTML = getUpdateHTML();

            const betaToggle = wrapper.querySelector('#setting-beta-updates');
            if (betaToggle) {
                betaToggle.onchange = (e) => {
                    generalConfig.betaUpdates = e.target.checked;
                    saveGeneralConfig();
                    initAutoUpdateCheck(true);
                };
            }

            const historyBtn = wrapper.querySelector('#open-history-btn');
            if (historyBtn) {
                historyBtn.onclick = () => {
                    openSettingsModal('history');
                };
            }

            const setupAutoReload = () => {
                // Плавно закрываем окно перед перезагрузкой
                modal.classList.remove('active');
                const overlay = document.getElementById('etis-settings-overlay');
                if (overlay) overlay.classList.remove('active');

                sessionStorage.setItem('etis_update_pending', 'true');
                const onFocusOrVisible = () => {
                    setTimeout(() => {
                        if (document.visibilityState === 'visible' && document.hasFocus()) {
                            if (sessionStorage.getItem('etis_update_pending')) {
                                sessionStorage.removeItem('etis_update_pending');
                                window.location.reload();
                            }
                        }
                    }, 200);
                };
                setTimeout(() => {
                    document.addEventListener('visibilitychange', onFocusOrVisible);
                    window.addEventListener('focus', onFocusOrVisible);
                }, 1500);
            };

            const btnStay = wrapper.querySelector('#update-stay');
            if (btnStay) btnStay.addEventListener('click', setupAutoReload);

            const btnBrowser = wrapper.querySelector('#update-browser');
            if (btnBrowser) btnBrowser.addEventListener('click', setupAutoReload);

            const btnConfirm = wrapper.querySelector('#update-confirm');
            if (btnConfirm) btnConfirm.addEventListener('click', setupAutoReload);

            const retry = wrapper.querySelector('#retry-update');
            if (retry) retry.onclick = () => initAutoUpdateCheck(true);
        }
    }
}
