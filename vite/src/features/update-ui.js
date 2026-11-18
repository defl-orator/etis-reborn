import { RELEASE_URL, updateState } from '../core/updater.js';
import { isIOS } from '../utils/platform.ts';

export function triggerUpdateIndicators() {
    // 1. Точка в главном сайдбаре
    const settingsLink = document.querySelector('a[href="#settings"]');
    if (settingsLink && !settingsLink.querySelector('.badge-point')) {
        const dot = document.createElement('span');
        dot.className = 'badge-point';
        settingsLink.appendChild(dot);
    }

    // 2. Точка на мобильной кнопке "Меню"
    const mob = document.querySelector('.mobile-dock-drawer-btn') || document.querySelector('.mobile-menu-btn');
    if (mob) mob.classList.add('has-updates');

    // 3. Точка внутри открытого окна настроек
    const versionBtn = document.querySelector('#etis-settings-modal .settings-sidebar-btn[data-target="version"]');
    if (versionBtn && !versionBtn.querySelector('.badge-point')) {
        const dot = document.createElement('span');
        dot.className = 'badge-point';
        // Вставляем точку прямо перед иконкой шеврона
        const chevron = versionBtn.querySelector('.chevron');
        if (chevron) {
            versionBtn.insertBefore(dot, chevron);
        } else {
            versionBtn.appendChild(dot);
        }
    }
}

export function loadVersionHistory() {
    const container = document.getElementById('version-history-list');
    if (!container) return;
    container.innerHTML = '<div style="display:flex; align-items:center; gap:12px; padding: 1rem 0; color:var(--color-text-secondary); font-size:1.5rem; font-weight:600;"><span class="material-icons" style="animation:spin 1s linear infinite;">sync</span>Загрузка истории...</div>';

    // Последние 10 коммитов файла
    const apiUrl = 'https://api.github.com/repos/defl-orator/etis-reborn/commits?path=etis.user.js&per_page=10';

    GM_xmlhttpRequest({
        method: 'GET',
        url: apiUrl,
        onload: async function(res) {
            if (res.status !== 200) {
                container.innerHTML = '<div style="color:var(--color-red); text-align:left; padding: 1rem 0; font-size: 1.4rem;">Не удалось загрузить историю версий. Попробуйте позже.</div>';
                return;
            }

            const commits = JSON.parse(res.responseText);
            const history = [];
            const seenVersions = new Set();

            // Параллельно загружаем сырые файлы по SHA коммита, чтобы прочитать заголовки
            const fetchPromises = commits.map(commit => {
                return new Promise((resolve) => {
                    const rawUrl = `https://raw.githubusercontent.com/defl-orator/etis-reborn/${commit.sha}/etis.user.js`;
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: rawUrl,
                        onload: (rawRes) => {
                            const text = rawRes.responseText;
                            const vMatch = text.match(/@version\s+([\d\.]+)/);
                            const clMatch = text.match(/@changelog\s+(.*)/);
                            if (vMatch) {
                                resolve({
                                    version: vMatch[1],
                                    changelog: clMatch ? clMatch[1].trim() : 'Без описания',
                                    date: new Date(commit.commit.author.date).toLocaleDateString('ru-RU'),
                                    url: rawUrl // Прямая ссылка на скачивание/установку конкретной версии
                                });
                            } else {
                                resolve(null);
                            }
                        },
                        onerror: () => resolve(null)
                    });
                });
            });

            const results = await Promise.all(fetchPromises);

            results.forEach(item => {
                if (item && !seenVersions.has(item.version)) {
                    seenVersions.add(item.version);
                    history.push(item);
                }
            });

            if (history.length === 0) {
                container.innerHTML = '<div style="color:var(--color-text-secondary); text-align:left; font-size: 1.4rem; padding: 1rem 0;">История версий пуста</div>';
                return;
            }

            let html = '';
            history.forEach(item => {
                const isCurrent = item.version === GM_info.script.version;
                const borderStyle = isCurrent ? 'border: 2px solid var(--color-accent);' : 'border: 1px solid var(--color-table-border);';

                html += `
                            <div style="background: var(--color-card); padding: 1.6rem; border-radius: var(--radius-large); margin-bottom: 1.6rem; ${borderStyle} position: relative; transition: all 0.2s; text-align: left;">
                                <!-- Дата в правом верхнем углу -->
                                <div style="position: absolute; top: 1.6rem; right: 1.6rem; font-size: 1.2rem; color: var(--color-text-secondary); font-weight: 600;">
                                    ${item.date}
                                </div>

                                <!-- Кликабельная версия и бейдж -->
                                <div style="margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px; padding-right: 8rem;">
                                    <a href="${item.url}" target="_blank" style="font-size: 1.6rem; font-weight: 800; color: var(--color-accent); text-decoration: none; transition: opacity 0.2s;" title="Нажмите, чтобы установить эту версию" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                        Версия ${item.version}
                                    </a>
                                    ${isCurrent ? '<span style="background:var(--color-accent-active); color:var(--color-accent); padding:2px 6px; border-radius:4px; font-size:1rem; font-weight:800;">ТЕКУЩАЯ</span>' : ''}
                                </div>

                                <!-- Описание -->
                                <div style="font-size: 1.3rem; color: var(--color-text-primary); line-height: 1.5; white-space: pre-wrap;">${item.changelog.trim()}</div>
                            </div>
                        `;
            });
            container.innerHTML = html;
        }
    });
}

export function getUpdateHTML() {
    const cur = GM_info.script.version;

    if (updateState.status === 'loading') return `<div style="padding:2rem 0;text-align:left;display:flex;align-items:center;gap:12px;"><span class="material-icons" style="font-size:32px;color:var(--color-accent);animation:spin 1s linear infinite;">sync</span><div style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Проверка обновлений...</div></div><style>@keyframes spin{100%{transform:rotate(360deg)}}</style>`;

    if (updateState.status === 'error') return `<div style="text-align:left;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;"><span class="material-icons" style="font-size:36px;color:var(--color-red);">error_outline</span><div style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Ошибка: ${updateState.details}</div></div><button id="retry-update" class="answer-btn-custom" style="width:100%;justify-content:center;">Повторить</button></div>`;

    let mainHtml = '';

    if (updateState.hasUpdate) {
        const updateUrl = updateState.updateUrl || RELEASE_URL;
        const betaBadge = updateState.isBeta 
            ? '<span style="background:rgba(255,149,0,0.15); color:#FF9500; padding:2px 8px; border-radius:6px; font-size:1rem; font-weight:800; text-transform:uppercase;">BETA</span>' 
            : '';

        let actionButtons = '';
        if (isIOS) {
            const encodedUrl = encodeURIComponent(updateUrl);
            const stayDeepLink = `stay://x-callback-url/open-install?url=${encodedUrl}`;
            actionButtons = `
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <a href="${stayDeepLink}" id="update-stay" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-accent)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                                <span class="material-icons">open_in_new</span> Обновить через Stay
                            </a>
                            <a href="${updateUrl}" target="_blank" id="update-browser" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-green)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                                <span class="material-icons">public</span> В браузере
                            </a>
                        </div>
                    `;
        } else {
            actionButtons = `
                        <a href="${updateUrl}" target="_blank" id="update-confirm" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-green)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                            <span class="material-icons">system_update_alt</span> Обновить сейчас
                        </a>
                    `;
        }

        mainHtml = `
                    <div style="text-align:left;">
                        <div style="display:flex; align-items:center; gap:16px; margin-bottom:2rem;">
                            <div style="background:rgba(52, 199, 89, 0.15); padding:12px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons" style="font-size:36px;color:var(--color-green);">system_update</span>
                            </div>
                            <div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span style="font-size:2rem;font-weight:800;color:var(--color-text-primary);line-height:1.2;">Обновление!</span>
                                    ${betaBadge}
                                </div>
                                <div style="font-size:1.3rem;color:var(--color-text-secondary);font-weight:600;margin-top:4px;">Доступна новая версия</div>
                            </div>
                        </div>

                        <div style="background:var(--color-highlight);padding:1.6rem;border-radius:12px;margin-bottom:2rem;border:1px solid var(--color-table-border);">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--color-table-border);">
                                <div>
                                    <div style="font-size:1.2rem;color:var(--color-text-secondary);margin-bottom:2px;">Новая версия</div>
                                    <div style="font-size:1.5rem;font-weight:800;color:var(--color-text-primary);">${updateState.remoteVer}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:1.2rem;color:var(--color-text-secondary);margin-bottom:2px;">У вас</div>
                                    <div style="font-size:1.5rem;font-weight:800;color:var(--color-text-secondary);">${cur}</div>
                                </div>
                            </div>

                            ${updateState.remoteLog ? `
                                <div style="font-size:1.2rem;color:var(--color-text-secondary);margin-bottom:6px;font-weight:600;text-transform:uppercase;">Что нового:</div>
                                <div style="font-size:1.35rem;line-height:1.5;color:var(--color-text-primary);">
                                    ${updateState.remoteLog}
                                </div>
                            ` : ''}
                        </div>

                        ${actionButtons}
                    </div>`;
    } else {
        mainHtml = `
                    <div style="text-align:left;">
                        <div style="display:flex; align-items:center; gap:16px; margin-bottom:2rem;">
                            <div style="background:var(--color-accent-active); padding:12px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons" style="font-size:36px;color:var(--color-accent);">check_circle</span>
                            </div>
                            <div>
                                <div style="font-size:2rem;font-weight:800;color:var(--color-text-primary);line-height:1.2;">Всё актуально</div>
                                <div style="color:var(--color-text-secondary);margin-top:4px;font-size:1.3rem;font-weight:500;">У вас установлена v${cur}</div>
                            </div>
                        </div>
                    </div>`;
    }

    return mainHtml + `
                <div class="ios-settings-group" style="margin-top: 1.6rem;">
                    <div class="ios-settings-row" id="open-history-btn" style="cursor:pointer;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span class="material-icons" style="color:var(--color-accent);">history</span>
                            <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">История версий</span>
                        </div>
                        <span class="material-icons chevron" style="color:var(--color-text-secondary);">chevron_right</span>
                    </div>
                </div>
            `;
}
