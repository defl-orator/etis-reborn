import { EXT_CAL_COLORS, getRandomExtColor, migrateExternalCals } from '../features/external-cals.js';
import { saveSyncData } from '../sync/data.js';

export function openSyncModal(view = 'export') {
    let overlay = document.getElementById('etis-sync-overlay');
    let modal = document.getElementById('etis-sync-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-sync-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-sync-modal';
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

    // Определяем начальную вкладку на мобильных (меню 'main')
    const startView = (window.innerWidth <= 960 && view === 'export') ? 'main' : view;

    const renderView = (currentView) => {
        let contentHTML = '';
        let title = 'Синхронизация';
        if (currentView === 'export') title = 'Экспорт в календарь';
        if (currentView === 'import') title = 'Импорт из календаря';
        if (currentView === 'main' && window.innerWidth > 960) currentView = 'export';

        let etisLink = '';
        const resourcesDiv = document.getElementById('resources');
        if (resourcesDiv) {
            const textBox = resourcesDiv.querySelector('#textbox');
            if (textBox) etisLink = textBox.value;
        }

        if (currentView === 'export') {
            contentHTML = `
                        <div style="background: var(--color-card); padding: 1.6rem; border-radius: var(--radius-large); font-size: 1.3rem; line-height: 1.5; color: var(--color-text-primary); margin-bottom: 2.4rem; border: none; box-shadow: var(--shadow-main);">
                            <b>Чтобы подключить расписание к сервисам календарей (Google, iOS, Яндекс):</b><br><br>
                            1. Нажмите "Скопировать ссылку".<br>
                            2. В настройках вашего календаря найдите "Добавить по URL" или "Подписаться".<br>
                            3. Вставьте ссылку и сохраните. <span style="color: var(--color-text-secondary);">Синхронизация может занимать до 24 часов на стороне вашего календаря.</span>
                        </div>
                        <div class="ios-settings-group">
                            <div class="ios-settings-row" id="copy-etis-link-btn" style="padding-left: 2.4rem;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-blue);">content_copy</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Скопировать ссылку</span>
                                </div>
                                <span class="material-icons chevron" style="color:var(--color-text-secondary);">chevron_right</span>
                            </div>
                            <div class="ios-settings-row" id="unsub-etis-btn" style="padding-left: 2.4rem;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="color:var(--color-red);">delete_outline</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-red);">Отписаться от календаря</span>
                                </div>
                            </div>
                        </div>
                    `;
        } else if (currentView === 'import') {
            contentHTML = `
                        <div style="background: var(--color-card); padding: 1.6rem; border-radius: var(--radius-large); font-size: 1.3rem; color: var(--color-text-primary); line-height: 1.5; margin-bottom: 2.4rem; border: none; box-shadow: var(--shadow-main);">
                            <b style="display:block; margin-bottom: 8px;">Вставьте ссылку на ваш публичный календарь в формате .ics, чтобы видеть личные события в расписании ЕТИС.</b>
                            <span style="color: var(--color-text-secondary);">В Apple Calendar: нажмите иконку «i» у календаря ➔ Включите «Публичный календарь» ➔ Поделиться ссылкой ➔ Вставить сюда.</span>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-bottom: 2.4rem; flex-wrap: wrap; align-items: stretch;">
                            <input type="text" id="ext-cal-input" placeholder="webcal://... или https://..." style="flex: 1; min-width: 200px; padding: 1.2rem 1.6rem !important; border-radius: 50px !important; border: none !important; background: var(--color-card) !important; color: var(--color-text-primary) !important; font-size: 1.3rem !important; box-shadow: var(--shadow-main) !important; margin: 0 !important;">
                            <button class="answer-btn-custom" id="ext-cal-add" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important; height: auto !important; margin: 0 !important;">
                                <span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">add</span>Добавить
                            </button>
                        </div>

                        <div id="ext-cals-list" class="ios-settings-group" style="display:none; margin-bottom: 2.4rem;"></div>
                    `;
        }

        const isMainMobile = window.innerWidth <= 960 ? (currentView === 'main') : false;

        modal.innerHTML = `
                    <div class="settings-layout">
                        <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Синхронизация</div>
                            <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                                Синхронизация
                                <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                            </div>

                            <div class="sidebar-tabs-container">
                                <div class="settings-sidebar-btn ${currentView === 'export' ? 'active' : ''}" data-target="export">
                                    <span class="material-icons">cloud_upload</span><span class="sidebar-btn-text">Экспорт (Из ЕТИС)</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'import' ? 'active' : ''}" data-target="import">
                                    <span class="material-icons">cloud_download</span><span class="sidebar-btn-text">Импорт (В ЕТИС)</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="settings-content-scroll">
                                <div class="ui-widget-header" style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <span class="material-icons back-modal-btn settings-mobile-header" data-back="main" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                        <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${title}</span>
                                    </div>
                                    <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                                </div>
                                <div style="padding: 0.8rem 0 0 0;">
                                    ${contentHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeAll);
        modal.querySelectorAll('.back-modal-btn').forEach(btn => btn.onclick = () => renderView(btn.getAttribute('data-back')));
        modal.querySelectorAll('.settings-sidebar-btn').forEach(btn => {
            btn.onclick = () => renderView(btn.getAttribute('data-target'));
        });

        if (currentView === 'export') {
            const copyBtn = modal.querySelector('#copy-etis-link-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(etisLink).then(() => {
                    const origHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<div style="display:flex; align-items:center; gap:12px;"><span class="material-icons" style="color:var(--color-green);">check</span><span style="font-size:1.4rem; font-weight:600; color:var(--color-green);">Скопировано!</span></div>`;
                    setTimeout(() => { copyBtn.innerHTML = origHtml; }, 2000);
                });
            });

            const unsubBtn = modal.querySelector('#unsub-etis-btn');
            unsubBtn.addEventListener('click', () => {
                const origDelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Отписаться'));
                if (origDelBtn) {
                    if (confirm('Отписаться от календаря?')) origDelBtn.click();
                }
            });
        } else if (currentView === 'import') {
            const calsListContainer = modal.querySelector('#ext-cals-list');
            const extInput = modal.querySelector('#ext-cal-input');
            const addExtBtn = modal.querySelector('#ext-cal-add');

            const renderCalsList = () => {
                let cals = migrateExternalCals();
                calsListContainer.innerHTML = '';
                if (cals.length === 0) {
                    calsListContainer.style.display = 'none';
                    return;
                }
                calsListContainer.style.display = 'block';

                cals.forEach((calObj, idx) => {
                    const calUrl = calObj.url;
                    const calColor = calObj.color || '#AF52DE';
                    const shortUrl = calUrl.length > 30 ? calUrl.substring(0, 18) + '...' + calUrl.substring(calUrl.length - 8) : calUrl;

                    const item = document.createElement('div');
                    item.className = 'ios-settings-row';
                    item.innerHTML = `
                                <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; flex: 1;">
                                    <div class="ext-cal-color-picker" data-idx="${idx}" style="width: 14px; height: 14px; border-radius: 50%; background: ${calColor}; cursor: pointer; transition: transform 0.2s;" title="Изменить цвет"></div>
                                    <span style="font-size: 1.4rem; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${calUrl}">${shortUrl}</span>
                                </div>
                                <span class="material-icons delete-cal-btn" data-idx="${idx}" style="color:var(--color-red); cursor:pointer;">delete_outline</span>
                            `;
                    calsListContainer.appendChild(item);
                });

                calsListContainer.querySelectorAll('.ext-cal-color-picker').forEach(picker => {
                    picker.addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.querySelectorAll('.ext-color-popup').forEach(p => p.remove());

                        const idx = e.target.getAttribute('data-idx');
                        const popup = document.createElement('div');
                        popup.className = 'ext-color-popup';
                        popup.style.cssText = 'position: absolute; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--color-card); padding: 16px; border-radius: var(--radius-medium); box-shadow: var(--shadow-dialog); border: 1px solid var(--color-table-border); z-index: 100000;';

                        EXT_CAL_COLORS.forEach(c => {
                            const circle = document.createElement('div');
                            circle.style.cssText = `width: 28px; height: 28px; border-radius: 50%; background: ${c.hex}; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.15);`;
                            circle.onclick = (ev) => {
                                ev.stopPropagation();
                                let currentCals = migrateExternalCals();
                                if(currentCals[idx]) {
                                    currentCals[idx].color = c.hex;
                                    saveSyncData('etis_external_cals_v2', JSON.stringify(currentCals));
                                    popup.remove();
                                    renderView('import');
                                    window.location.reload();
                                }
                            };
                            popup.appendChild(circle);
                        });

                        const rect = e.target.getBoundingClientRect();
                        popup.style.top = `${rect.bottom + 12}px`;
                        popup.style.left = `${rect.left - 50}px`;
                        document.body.appendChild(popup);
                        setTimeout(() => document.addEventListener('click', () => popup.remove(), {once: true}), 0);
                    });
                });

                calsListContainer.querySelectorAll('.delete-cal-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                        let currentCals = migrateExternalCals();
                        if (confirm('Удалить этот календарь?')) {
                            currentCals.splice(idx, 1);
                            saveSyncData('etis_external_cals_v2', JSON.stringify(currentCals));
                            renderView('import');
                            window.location.reload();
                        }
                    });
                });
            };

            renderCalsList();

            addExtBtn.addEventListener('click', () => {
                const val = extInput.value.trim();
                if (!val) return;
                let cals = migrateExternalCals();
                if (!cals.some(c => c.url === val)) {
                    cals.push({ url: val, color: getRandomExtColor() });
                    saveSyncData('etis_external_cals_v2', JSON.stringify(cals));
                }
                extInput.value = '';
                renderView('import');
                window.location.reload();
            });
        }
    };

    renderView(startView);
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}
