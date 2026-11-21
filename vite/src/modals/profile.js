import { accentSignature, applyAccentColor, getEffectiveAccent } from '../core/accent.js';
import { ACCENT_COLORS } from '../core/accent-colors.ts';
import { isDemoUser } from '../core/demo-mode.ts';
import { registerCurrentDevice } from '../core/devices.ts';
import { consultationsFiles, saveConsultationsState, setConsultationsFiles } from '../features/consultations/state.js';
import { openExportPreviewModal } from '../features/export.js';
import { migrateExternalCals } from '../features/external-cals.js';
import { openNotificationsModal, updateBellCounter } from '../features/notifications.js';
import { openSettingsModal } from './settings.js';
import { clearMasterKey, downloadDataFromCloud, getMasterKey, setMasterKey, triggerSilentCloudUpload, uploadDataToCloud } from '../sync/cloud.js';
import { EtisCrypto, FIREBASE_DB_URL, safeParseJSON } from '../sync/crypto.ts';
import { getSyncToggles, saveSyncData } from '../sync/data.js';
import { returnToDrawer } from '../ui/drawer.js';
import { declineDirection } from '../utils/declension.ts';
import { getDirectionIcon } from '../utils/direction-icons.ts';
import { isMacSafari } from '../utils/platform.ts';
import { escapeHTML } from '../utils/security.ts';
import { getTermWord } from '../utils/term-system.ts';

// Открывает модальное окно профиля, достижений и синхронизации данных
export function openProfileModal(view = 'main') {
    registerCurrentDevice();

    // Возвращает сохранённый идентификатор пользователя из кэша или шапки страницы
    const getSavedLoginId = () => {
        if (typeof GM_getValue === 'undefined') return '';
        let identity = GM_getValue('etis_secure_identity_cache', '');
        if (!identity) {
            const nameNode = document.querySelector('.navbar-static-top .span12 > span') || document.querySelector('.sidebar-user-info b');
            if (nameNode) identity = nameNode.childNodes[0].textContent.trim();
        }
        return identity;
    };

    let overlay = document.getElementById('etis-profile-overlay');
    let modal = document.getElementById('etis-profile-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-profile-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-profile-modal';
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

    // Отрисовывает выбранную вкладку профиля и привязывает обработчики
    const renderView = (currentView) => {
        if (currentView === 'menu' && window.innerWidth > 960) currentView = 'main';
        let cpCount = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]').length;
        let notesObj = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
        let notesCount = Object.keys(notesObj.specific || {}).length + Object.keys(notesObj.next_unbound || {}).length;
        let gradesObj = JSON.parse(localStorage.getItem('etis_reborn_grades_snapshot_v3') || '{"grades":{}}');
        let gradesCount = Object.keys(gradesObj.grades || {}).length;
        let consCount = JSON.parse(localStorage.getItem('etis_consultation_files_v1') || '[]').length;

        let qlAccountsCount = 0;
        try {
            qlAccountsCount = JSON.parse(GM_getValue('ql_accounts_v2', '[]')).length;
        } catch(e) { qlAccountsCount = 0; }
        let qlCount = qlAccountsCount;
        let weeklyPairs = JSON.parse(localStorage.getItem('etis_weekly_pairs_history_v1') || '{}');
        let weeklyPairsCount = Object.keys(weeklyPairs).length;

        const localAccent = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'], isGlass: false, isColoredGlass: true };

        let rawName = 'Студент';
        const nameNode = document.querySelector('.navbar-static-top .span12 > span');
        if (nameNode) rawName = nameNode.childNodes[0].textContent.trim();
        const nameParts = rawName.split(' ');
        let firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

        let studentDirection = '';
        const originalInfo = document.querySelector('.navbar-static-top .span12 > span');
        if (originalInfo) {
            const spans = Array.from(originalInfo.querySelectorAll('span'));
            for (let span of spans) {
                const text = span.textContent.trim();
                if (/^(очная|заочная|очно-заочная|вечерняя)$/i.test(text)) continue;
                if (/^\d{4}(\s*г\.)?$/i.test(text)) continue;
                if (/курс/i.test(text)) continue;
                if (/факультет/i.test(text)) continue;

                studentDirection = text.replace(/^(направление|специальность|направленность|профиль)\s*(подготовки)?\s*["«]?/i, '')
                                       .replace(/["»]$/, '')
                                       .trim();
                if (studentDirection) break;
            }
        }
        const declinedDir = declineDirection(studentDirection);

        let diplomaGpaStr = localStorage.getItem('etis_diploma_gpa');
        const gpaTimestamp = localStorage.getItem('etis_diploma_gpa_timestamp');

        if (diplomaGpaStr) {
            if (!gpaTimestamp) {
                localStorage.setItem('etis_diploma_gpa_timestamp', Date.now().toString());
            } else if (Date.now() - parseInt(gpaTimestamp, 10) > 7 * 24 * 60 * 60 * 1000) {
                diplomaGpaStr = null; 
                localStorage.removeItem('etis_diploma_gpa');
                localStorage.removeItem('etis_diploma_gpa_timestamp');
            }
        }

        let diplomaGpaVal = '—';
        if (diplomaGpaStr) {
            if (diplomaGpaStr === 'none' || diplomaGpaStr === '0') {
                diplomaGpaVal = 'Нет';
            } else if (diplomaGpaStr === 'debts') {
                diplomaGpaVal = 'Долги';
            } else {
                const p = parseFloat(diplomaGpaStr);
                diplomaGpaVal = (isNaN(p) || p === 0) ? 'Нет' : p.toFixed(2);
            }
        }

        let gpa = isDemoUser() ? 4.69 : (diplomaGpaStr && !isNaN(parseFloat(diplomaGpaStr)) ? parseFloat(diplomaGpaStr) : 0);
        const isDiplomaVisitedNoGrades = diplomaGpaStr === 'none' || diplomaGpaStr === '0';
        const hasDiplomaDebts = diplomaGpaStr === 'debts';

        let notifsCount = JSON.parse(localStorage.getItem('etis_notifications_history_v1') || '[]').length;

        let installDateRaw = GM_getValue('etis_reborn_install_date') || localStorage.getItem('etis_reborn_install_date');
        if (!installDateRaw) {
            installDateRaw = Date.now().toString();
            GM_setValue('etis_reborn_install_date', installDateRaw);
            localStorage.setItem('etis_reborn_install_date', installDateRaw);
        }

        const installDate = parseInt(installDateRaw, 10);
        const joinDateStr = new Date(installDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const daysPassed = Math.max(1, Math.floor((Date.now() - installDate) / (1000 * 60 * 60 * 24)));
        const totalSeconds = parseInt(localStorage.getItem('etis_reborn_time_spent') || '0', 10);
        const minsPerDay = Math.max(1, Math.round((totalSeconds / 60) / daysPassed));

        // Формирует список достижений и проверяет условия их разблокировки
        const getAchievementsList = () => {
            const baseStatuses = [
                { id: 'novice', level: 1, text: 'Новичок', emoji: '🌱', desc: 'Первый вход в личный кабинет ЕТИС', cond: () => true },
                { id: 'observer', level: 2, text: 'Наблюдатель', emoji: '🕵️', desc: 'Посещать ЕТИС более 3 дней', cond: () => daysPassed >= 3 },
                { id: 'notes_1', level: 3, text: 'Заметочник', emoji: '📝', desc: 'Создать хотя бы одну заметку или домашнее задание', cond: () => notesCount >= 1 },
                { id: 'constructor', level: 4, text: 'Конструктор', emoji: '✏️', desc: 'Добавить собственное занятие в расписание', cond: () => cpCount >= 1 },
                { id: 'otlichnik', level: 5, text: 'Отличник', emoji: '📚', desc: 'Достичь среднего балла в дипломе 4.5 или выше', cond: () => gpa >= 4.5 },
                { id: 'guest', level: 6, text: 'Постоянный гость', emoji: '🚀', desc: 'Провести более 1 часа на сайте', cond: () => totalSeconds >= 3600 },
                { id: 'writer', level: 7, text: 'Писатель', emoji: '✍️', desc: 'Написать 5 или более заметок или ДЗ для предметов', cond: () => notesCount >= 5 },
                { id: 'schedule', level: 8, text: 'Свой график', emoji: '📅', desc: 'Создать в расписании не менее 5 собственных занятий', cond: () => cpCount >= 5 },
                { id: 'explorer', level: 9, text: 'Исследователь', emoji: '🤓', desc: 'Накопить историю из 50 или более оценок в архиве', cond: () => gradesCount >= 50 },
                { id: 'organizer', level: 10, text: 'Организатор', emoji: '🧩', desc: 'Добавить расписание консультаций преподавателей', cond: () => consCount >= 1 },
                { id: 'pfg', level: 11, text: 'Пофигист', emoji: '🧘', desc: 'Иметь средний балл диплома ниже 3.5', cond: () => gpa > 0 && gpa < 3.5 },
                { id: 'hor', level: 12, text: 'Хорошист', emoji: '😎', desc: 'Иметь средний балл диплома от 4.0 до 4.5', cond: () => gpa >= 4.0 && gpa < 4.5 },
                { id: 'veteran_time', level: 13, text: 'Старожил', emoji: '⏰', desc: 'Посещать личный кабинет более 14 дней', cond: () => daysPassed >= 14 },
                { id: 'addicted', level: 14, text: 'Зависимый', emoji: '🔥', desc: 'Провести более 5 часов на сайте', cond: () => totalSeconds >= 18000 },
                { id: 'easter_egg', level: 15, text: 'Искатель тайн', emoji: '🐻', desc: 'Найти скрытую пасхалку', cond: () => localStorage.getItem('etis_easter_egg_found') === 'true' },
                { id: 'esthete', level: 16, text: 'Эстет', emoji: '🎨', desc: 'Настроить собственную цветовую тему', cond: () => localStorage.getItem('etis_accent_config') !== null },
                { id: 'analyst', level: 17, text: 'Аналитик', emoji: '📈', desc: 'Накопить 100+ оценок в архиве', cond: () => gradesCount >= 100 },
                { id: 'perfectionist', level: 18, text: 'Перфекционист', emoji: '🎓', desc: 'Достичь отличного среднего балла диплома (4.75 или выше)', cond: () => gpa >= 4.75 },
                { id: 'veteran', level: 19, text: 'Ветеран', emoji: '🛡️', desc: 'Посещать сайт более 30 дней и провести на нем 5+ часов', cond: () => daysPassed >= 30 && totalSeconds >= 18000 }
            ];

            // Фильтрация неактуальных худших статусов
            const visibleStatuses = baseStatuses.filter(s => {
                if (s.id === 'pfg' && gpa >= 3.5) return false;
                if (s.id === 'hor' && gpa >= 4.5) return false;
                return true;
            });

            // Проверка: все ли остальные достижения разблокированы
            const allOtherUnlocked = visibleStatuses.every(s => s.cond());

            // Легенда ЕТИСа
            visibleStatuses.push({
                id: 'legend',
                level: 20,
                text: 'Легенда ЕТИСа',
                emoji: '👑',
                desc: 'Открыть все остальные доступные достижения',
                cond: () => allOtherUnlocked
            });

            return visibleStatuses;
        };

        // Получение открытых достижений с учетом пользовательского порядка
        const allUnlocked = getAchievementsList().filter(s => s.cond());
        const savedCustomOrder = JSON.parse(localStorage.getItem('etis_custom_achievements_order_v1') || '[]');

        allUnlocked.sort((a, b) => {
            const idxA = savedCustomOrder.indexOf(a.id);
            const idxB = savedCustomOrder.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return b.level - a.level;
        });

        const topAchievements = allUnlocked.slice(0, 3);

        // Формирует подпись для карточки достижения в бенто-сетке
        const getCardLabel = (item, idx, total) => {
            if (total === 1) return `Я ${item.text}`;
            if (idx === 0) return `Я ${item.text}`;
            if (idx === total - 1) return `и ${item.text}`;
            return item.text;
        };

        const badgeStatus = (() => {
            const statuses = getAchievementsList();
            let unlockDates = JSON.parse(localStorage.getItem('etis_statuses_unlocked_dates_v1') || '{}');
            let datesChanged = false;
            let best = statuses[0];

            for (const s of statuses) {
                if (s.cond()) {
                    if (!unlockDates[s.level]) {
                        unlockDates[s.level] = new Date().toLocaleDateString('ru-RU');
                        datesChanged = true;
                    }
                    if (s.level > best.level) best = s;
                }
            }
            if (datesChanged) localStorage.setItem('etis_statuses_unlocked_dates_v1', JSON.stringify(unlockDates));
            return best;
        })();

        const badge = badgeStatus.text;
        const badgeEmoji = badgeStatus.emoji;

        // Склоняет слово «день» в зависимости от числа
        const getDaysWord = (n) => {
            const absN = Math.abs(n) % 100; const lastDigit = absN % 10;
            if (absN > 10 && absN < 20) return 'дней';
            if (lastDigit > 1 && lastDigit < 5) return 'дня';
            if (lastDigit === 1) return 'день'; return 'дней';
        };
        // Склоняет слово «минута» в зависимости от числа
        const getMinsWord = (n) => {
            const absN = Math.abs(n) % 100; const lastDigit = absN % 10;
            if (absN > 10 && absN < 20) return 'минут';
            if (lastDigit > 1 && lastDigit < 5) return 'минуты';
            if (lastDigit === 1) return 'минуте'; return 'минут';
        };

        // Генерирует HTML-индикатор текущей цветовой палитры и темы
        const getColorsIndicator = (config) => {
            if (!config || !config.colors || config.colors.length === 0) return '—';
            config = getEffectiveAccent(config);
            let html = `<span style="display:inline-flex; align-items:center; gap:6px; vertical-align: middle;">`;
            const isGrad = config.isGradient !== false && config.colors.length > 1;
            const c1 = ACCENT_COLORS[config.colors[0]] || '#007AFF';

            html += `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background: ${c1}; border: 1px solid var(--color-table-border); box-shadow: 0 1px 3px rgba(0,0,0,0.15);" title="Цвет 1"></span>`;
            if (isGrad && config.colors[1]) {
                const c2 = ACCENT_COLORS[config.colors[1]] || c1;
                html += `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background: ${c2}; border: 1px solid var(--color-table-border); box-shadow: 0 1px 3px rgba(0,0,0,0.15);" title="Цвет 2"></span>`;
            }
            if (isGrad && config.isThreeColors && config.colors[2]) {
                const c3 = ACCENT_COLORS[config.colors[2]] || c1;
                html += `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background: ${c3}; border: 1px solid var(--color-table-border); box-shadow: 0 1px 3px rgba(0,0,0,0.15);" title="Цвет 3"></span>`;
            }
            const activeTheme = localStorage.getItem('theme') || 'auto';
            let themeBg = activeTheme === 'night' ? '#000000' : (activeTheme === 'dark' ? '#212325' : (activeTheme === 'light' ? '#EAECEE' : 'linear-gradient(90deg, #EAECEE 50%, #212325 50%)'));
            html += `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background: ${themeBg}; border: 1px solid var(--color-table-border); box-shadow: 0 1px 3px rgba(0,0,0,0.15);" title="Тема"></span>`;
            if (config.isGlass === true) {
                html += `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border: 1px dashed var(--color-text-secondary); box-shadow: 0 1px 3px rgba(0,0,0,0.1);" title="Стекло"></span>`;
            }
            html += `</span>`;
            return html;
        };

        let title = 'Мой профиль';
        let contentHTML = '';
        let backTarget = (window.innerWidth <= 960) ? 'menu' : 'main';

        if (currentView === 'main') {
            title = 'Мой профиль';
            backTarget = (window.innerWidth <= 960) ? 'menu' : 'main';
            contentHTML = `
                        <!-- Единая карточка бенто-сетки -->
                        <div id="bento-capture-area" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--color-card); border-radius: var(--radius-large); padding: 16px; box-shadow: var(--shadow-main); border: 1px solid var(--color-table-border); margin-bottom: 1.6rem; width: 100%; box-sizing: border-box;">
                            
                            <!-- Карточка Аватара и Имени -->
                            <div style="grid-column: span 2; background: var(--color-highlight); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 4px; box-sizing: border-box;">
                                <div style="width: 54px; height: 54px; background: var(--color-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; margin-bottom: 4px; color: #fff !important; -webkit-text-fill-color: #fff !important;">
                                    ${firstName.charAt(0)}
                                </div>
                                <div style="font-size: 1.7rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.2;">Я ${firstName}</div>
                                <div style="font-size: 1.2rem; color: var(--color-text-secondary); font-weight: 600;">Студент ПГНИУ</div>
                            </div>

                            <!-- Карточка Среднего балла -->
                            <div style="grid-column: span 1; background: var(--color-highlight); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-sizing: border-box;">
                                ${gpa > 0 ? `
                                    <div style="font-size: 2.8rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 4px; line-height: 1;">${gpa.toFixed(2)}</div>
                                    <div style="font-size: 1.05rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; line-height: 1.3;">Мой средний балл в <br>дипломе</div>
                                ` : hasDiplomaDebts ? `
                                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-red); margin-bottom: 4px; line-height: 1.2;">ДОЛГИ</div>
                                    <div style="font-size: 1.05rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; line-height: 1.3;">Есть академические <br>задолженности</div>
                                ` : isDiplomaVisitedNoGrades ? `
                                    <span class="material-icons" style="font-size: 2.8rem; color: var(--color-accent); margin-bottom: 4px;">auto_stories</span>
                                    <div style="font-size: 1.05rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; line-height: 1.3;">Лишь начинаю <br>учиться</div>
                                ` : `
                                    <div style="font-size: 1.1rem; color: var(--color-text-secondary); font-weight: 600; line-height: 1.3; text-align: center;">Зайдите в <a href="https://student.psu.ru/pls/stu_cus_et/stu.signs?p_mode=diplom#open-profile" style="color: var(--color-accent) !important; font-weight: 800; text-decoration: underline !important;">«Оценки в диплом»</a></div>
                                `}
                            </div>

                            <!-- Направление обучения -->
                            ${declinedDir ? `
                            <div style="grid-column: span 3; background: var(--color-highlight); border-radius: 20px; padding: 12px 16px; display: flex; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box; flex-wrap: wrap;">
                                <span class="material-icons" style="font-size: 1.8rem; color: var(--color-accent);">${getDirectionIcon(studentDirection)}</span>
                                <span style="font-size: 1.25rem; color: var(--color-text-secondary); font-weight: 500; text-transform: lowercase;">изучаю</span>
                                <span style="font-size: 1.45rem; font-weight: 800; color: var(--color-accent);">${declinedDir}</span>
                            </div>
                            ` : ''}

                            <!-- Сетка блоков достижений -->
                            <div id="status-bento-cards-container" style="grid-column: span 3; display: grid; grid-template-columns: repeat(${topAchievements.length}, 1fr); gap: 12px; box-sizing: border-box;">
                                ${topAchievements.map((item, idx) => {
                            const cardLabel = getCardLabel(item, idx, topAchievements.length);
                            const isFirst = idx === 0;
                            return `
                                        <div class="status-bento-subcard" draggable="true" data-id="${item.id}" data-idx="${idx}" style="background: ${isFirst ? 'var(--color-accent)' : 'var(--color-highlight)'}; border-radius: 20px; padding: 16px 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: grab; user-select: none; -webkit-user-select: none; touch-action: pan-y; transition: transform 0.2s, opacity 0.2s; box-sizing: border-box;" title="Потяните или смахните для смены порядка">
                                            <div style="font-size: 2.8rem; margin-bottom: 6px; line-height: 1; pointer-events: none;">${item.emoji}</div>
                                            <div style="font-size: 1.3rem; font-weight: 800; color: ${isFirst ? '#fff !important; -webkit-text-fill-color: #fff !important;' : 'var(--color-text-primary);'}; line-height: 1.2; pointer-events: none;">
                                                ${cardLabel}
                                            </div>
                                        </div>
                                    `;
                        }).join('')}
                            </div>

                        </div>

                        <!-- Кнопка перехода ко всем достижениям -->
                        <div class="ios-settings-group" style="margin-bottom: 0 !important; width: 100%; box-sizing: border-box;">
                            <div class="ios-settings-row" id="view-all-achievements-btn" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span class="material-icons" style="color: var(--color-accent); font-size: 2.2rem;">emoji_events</span>
                                    <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Все достижения</span>
                                </div>
                                <span class="material-icons chevron" style="color: var(--color-text-secondary);">chevron_right</span>
                            </div>
                        </div>
                    `;
        } else if (currentView === 'data') {
            title = 'Мои данные';
            backTarget = (window.innerWidth <= 960) ? 'menu' : 'data';

            const isDemo = isDemoUser();
            const lastCloudRaw = isDemo ? {} : JSON.parse(localStorage.getItem('etis_last_cloud_counts_v1') || '{}');
            
            const lastCloud = {
                cp: !isDemo && lastCloudRaw.cp !== undefined ? lastCloudRaw.cp : '—',
                notes: !isDemo && lastCloudRaw.notes !== undefined ? lastCloudRaw.notes : '—',
                grades: !isDemo && lastCloudRaw.grades !== undefined ? lastCloudRaw.grades : '—',
                cons: !isDemo && lastCloudRaw.cons !== undefined ? lastCloudRaw.cons : '—',
                weekly: !isDemo && lastCloudRaw.weekly !== undefined ? lastCloudRaw.weekly : '—',
                aiSummaries: !isDemo && lastCloudRaw.aiSummaries !== undefined ? lastCloudRaw.aiSummaries : '—',
                theme: !isDemo && lastCloudRaw.theme !== undefined ? lastCloudRaw.theme : '—',
                timeSpent: !isDemo && lastCloudRaw.timeSpent !== undefined ? lastCloudRaw.timeSpent : '—',
                cals: !isDemo && lastCloudRaw.cals !== undefined ? lastCloudRaw.cals : '—',
                gpa: !isDemo && lastCloudRaw.gpa !== undefined ? lastCloudRaw.gpa : '—',
                notifs: !isDemo && lastCloudRaw.notifs !== undefined ? lastCloudRaw.notifs : '—'
            };

            // Генерирует комбинированную иконку локального и облачного хранения
            const getHybridSyncIcon = () => `
                        <span style="display:inline-flex; align-items:center; gap:3px; flex-shrink:0;">
                            <span class="material-icons" style="font-size: 1.6rem; color: var(--color-text-secondary);">download</span>
                            <span style="font-size: 1.3rem; font-weight: 800; line-height: 1; color: var(--color-text-secondary);">+</span>
                            <span class="material-icons" style="font-size: 1.6rem; color: var(--color-accent);">cloud</span>
                        </span>
                    `;

            // Генерирует строку статистики и управления разделом данных
            const dataRow = (rowTitle, count, key, spanId = '', isSyncable = true, isHTML = false, cloudVal = '—', hasDetails = false, detailsView = '') => {
                const localSpanId = `local-val-${key.replace(/_/g, '-')}`;
                const displayCloudVal = isDemo ? '—' : cloudVal;

                let hasData = true;
                if (typeof count === 'number') {
                    hasData = count > 0;
                } else if (typeof count === 'string') {
                    const cleanText = count.replace(/<[^>]+>/g, '').trim();
                    if (cleanText === '0' || cleanText === '0 мин' || cleanText === '0 мин.' || cleanText === '—' || cleanText === '' || cleanText === 'Нет') {
                        hasData = false;
                    } else if (key === 'etis_accent_config') {
                        hasData = localStorage.getItem('etis_accent_config') !== null;
                    }
                }

                // Проверяем, равны ли данные на устройстве и в облаке
                let isSynced = (isSyncable && !isDemo && displayCloudVal !== '—' && String(count).trim() === String(displayCloudVal).trim());
                if (key === 'etis_accent_config') {
                    isSynced = !!(isSyncable && !isDemo && lastCloudRaw.themeSig && lastCloudRaw.themeSig === accentSignature(localAccent));
                }

                let indicatorsHtml = '';
                if (isSynced) {
                    indicatorsHtml = `
                                <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--color-text-primary); font-size: 1.25rem; font-weight: 700;" title="Синхронизировано: локально и в облаке одинаковые данные">
                                    ${getHybridSyncIcon(key)}
                                    <span id="${localSpanId}">${count}</span>
                                    <span ${spanId ? `id="${spanId}"` : ''} style="display:none;">${displayCloudVal}</span>
                                </span>
                            `;
                } else {
                    indicatorsHtml = `
                                <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--color-text-secondary); font-size: 1.25rem;" title="Сохранено на этом устройстве">
                                    <span class="material-icons" style="font-size: 1.6rem; color: var(--color-text-secondary);">download</span>
                                    <span id="${localSpanId}">${count}</span>
                                </span>
                                ${(isSyncable && !isDemo) ? `
                                <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--color-text-secondary); font-size: 1.25rem;" title="Сохранено в облаке Firebase">
                                    <span class="material-icons" style="font-size: 1.6rem; color: var(--color-accent);">cloud</span>
                                    <span ${spanId ? `id="${spanId}"` : ''} style="font-weight: 700;">${displayCloudVal}</span>
                                </span>
                                ` : ''}
                            `;
                }

                return `
                            <div class="ios-settings-row" style="cursor: default !important; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: left; flex: 1; min-width: 0; padding-right: 8px;">
                                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rowTitle}</div>
                                    <div style="display: flex; align-items: center; gap: 16px; margin-top: 4px;">
                                        ${indicatorsHtml}
                                    </div>
                                </div>
                                ${hasData ? `
                                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                    ${hasDetails ? `
                                    <button class="details-data-btn" data-target="${detailsView}" title="Просмотреть детализацию" style="width: 34px; height: 34px; border-radius: 50% !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; border: 1px solid var(--color-table-border) !important; padding: 0 !important; margin: 0 !important; cursor: pointer; box-shadow: none !important; transition: all 0.2s;">
                                        <span class="material-icons" style="font-size: 1.8rem !important; margin: 0 !important; line-height: 1 !important; color: var(--color-accent) !important;">keyboard_return</span>
                                    </button>
                                    ` : ''}
                                    <button class="clear-data-btn" data-key="${key}" title="Очистить все данные этого раздела" style="width: 34px; height: 34px; border-radius: 50% !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; background: rgba(255,59,48,0.1) !important; color: var(--color-red) !important; border: 1px solid rgba(255,59,48,0.2) !important; padding: 0 !important; margin: 0 !important; cursor: pointer; box-shadow: none !important; transition: all 0.2s;">
                                        <span class="material-icons" style="font-size: 1.8rem !important; margin: 0 !important; line-height: 1 !important; color: var(--color-red) !important;">delete_outline</span>
                                    </button>
                                </div>
                                ` : ''}
                            </div>
                        `;
            };

            const masterKey = getMasterKey();

            let syncBlockHTML = '';

            if (sessionStorage.getItem('etis_demo_mode') === 'true') {
                syncBlockHTML = `
                            <div class="ios-settings-row sync-row-e2ee" style="cursor: default !important; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(255, 149, 0, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-warning); font-size: 22px;">cloud_off</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left;">
                                        <span style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-primary);">Оффлайн-режим</span>
                                        <span style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 2px;">Синхронизация отключена</span>
                                    </div>
                                </div>
                            </div>
                        `;
            } else if (!masterKey) {
                syncBlockHTML = `
                            <div class="ios-settings-row sync-row-e2ee" style="cursor: default !important; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--color-highlight); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-text-secondary); font-size: 22px;">lock_open</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1; min-width: 0;">
                                        <span style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-primary);">Сквозное шифрование (E2EE)</span>
                                        <span style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 3px; line-height: 1.35;">Синхронизация не настроена. Создайте ключ или войдите по имеющемуся.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="ios-settings-row sync-row-e2ee" id="setup-new-sync-btn" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--color-accent-active); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-accent); font-size: 22px;">add_moderator</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1;">
                                        <span style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary);">Создать новый ключ</span>
                                        <span style="font-size: 1.15rem; color: var(--color-text-secondary); margin-top: 2px;">Сгенерировать мастер-ключ</span>
                                    </div>
                                    <span class="material-icons chevron" style="color: var(--color-text-secondary); opacity: 0.5;">chevron_right</span>
                                </div>
                            </div>

                            <div class="ios-settings-row sync-row-e2ee" id="enter-existing-sync-btn" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(0, 122, 255, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-blue); font-size: 22px;">devices</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1;">
                                        <span style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary);">Войти по ключу с другого устройства</span>
                                        <span style="font-size: 1.15rem; color: var(--color-text-secondary); margin-top: 2px;">Ввести 25-значный мастер-ключ</span>
                                    </div>
                                    <span class="material-icons chevron" style="color: var(--color-text-secondary); opacity: 0.5;">chevron_right</span>
                                </div>
                            </div>
                        `;
            } else {
                const syncMetaForBtn = safeParseJSON(localStorage.getItem('etis_sync_meta'), {});
                const connectedDevicesCount = Object.keys(syncMetaForBtn.devices || {}).length;
                syncBlockHTML = `
                            <div class="ios-settings-row sync-row-e2ee" style="cursor: default !important; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(52, 199, 89, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-green); font-size: 22px;">cloud_done</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1; min-width: 0;">
                                        <span style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-primary);">Сквозное шифрование (E2EE)</span>
                                        <span style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 3px;">Данные зашифрованы ключом AES-GCM 256</span>
                                    </div>
                                </div>
                            </div>

                            <div class="ios-settings-row sync-row-e2ee" style="cursor: default !important; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--color-accent-active); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-accent); font-size: 22px;">key</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1; min-width: 0;">
                                        <span style="font-size: 1.15rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Ключ восстановления</span>
                                        <span id="master-key-display" class="key-blurred" style="font-family: monospace; font-size: 1.45rem; font-weight: 800; color: var(--color-text-primary); letter-spacing: 1px; margin-top: 2px; width: fit-content;" title="Нажмите, чтобы показать/скрыть ключ">${masterKey}</span>
                                    </div>
                                    <button id="copy-master-key-btn" type="button" title="Скопировать ключ" style="width: 36px; height: 36px; border-radius: 50% !important; border: 1px solid var(--color-table-border) !important; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer; padding: 0 !important; margin: 0 !important; box-shadow: none !important; flex-shrink: 0;">
                                        <span class="material-icons" style="font-size: 18px; color: inherit;">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            <div class="ios-settings-row sync-row-e2ee" id="sync-settings-btn" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--color-highlight); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-accent); font-size: 22px;">tune</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1;">
                                        <span style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary);">Настройки синхронизации</span>
                                        <span id="sync-devices-subtitle" style="font-size: 1.15rem; color: var(--color-text-secondary); margin-top: 2px;">Управление устройствами (${connectedDevicesCount}) и типами данных</span>
                                    </div>
                                    <span class="material-icons chevron" style="color: var(--color-text-secondary); opacity: 0.5;">chevron_right</span>
                                </div>
                            </div>

                            <div class="ios-settings-row sync-row-e2ee" id="unlink-sync-btn" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(255, 59, 48, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-red); font-size: 22px;">logout</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left; flex: 1;">
                                        <span style="font-size: 1.4rem; font-weight: 700; color: var(--color-red);">Отключить синхронизацию</span>
                                        <span style="font-size: 1.15rem; color: var(--color-text-secondary); margin-top: 2px;">Удалить мастер-ключ с этого браузера</span>
                                    </div>
                                </div>
                            </div>
                        `;
            }

            let calsCount = typeof migrateExternalCals === 'function' ? migrateExternalCals().length : 0;

            const hasOfflineCache = !!localStorage.getItem('etis_offline_timetable_html');
            const offlineCacheStatus = hasOfflineCache ? 'Сохранён' : 'Пусто';

            contentHTML = `
                    <div class="ios-settings-group" id="ql-sync-group" style="margin-bottom: 1rem !important;">
                        ${syncBlockHTML}
                    </div>

                    <div style="font-size: 1.2rem; color: var(--color-text-secondary); line-height: 1.5; text-align: left; padding: 0 4px; margin-bottom: 2.4rem; margin-top: -0.5rem;">
                        Синхронизация позволяет переносить ваши пары, заметки и цветовые темы между устройствами в зашифрованном виде. Логин и пароли в облако не отправляются.
                    </div>

                    <div class="ios-settings-group" style="margin-bottom: 0 !important;">
                        <div class="ios-settings-row" style="cursor: default !important;">
                            <div>
                                <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary);">Дата присоединения</div>
                                <div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 4px;" id="install-date-val">Скрипт установлен: ${joinDateStr}</div>
                            </div>
                        </div>
                        ${dataRow('Свои пары', cpCount, 'etis_custom_pairs_v1', 'cloud-val-cp', true, false, lastCloud.cp, true, 'details_custom_pairs')}
                        ${dataRow('Заметки и ДЗ', notesCount, 'etis_subject_notes_v2', 'cloud-val-notes', true, false, lastCloud.notes, true, 'details_subject_notes')}
                        ${dataRow('История оценок', gradesCount, 'etis_reborn_grades_snapshot_v3', 'cloud-val-grades', true, false, lastCloud.grades, false)}
                        ${dataRow('Оффлайн-кэш', offlineCacheStatus, 'etis_offline_cache', '', false, false, '—', false)}
                        ${dataRow('Средний балл диплома', diplomaGpaVal, 'etis_diploma_gpa', 'cloud-val-gpa', true, false, lastCloud.gpa, false)}
                        ${dataRow('Центр уведомлений', notifsCount, 'etis_notifications_history_v1', 'cloud-val-notifs', true, false, lastCloud.notifs, true, 'notifications_modal_redirect')}
                        ${dataRow('Файлы консультаций', consCount, 'etis_consultation_files_v1', 'cloud-val-cons', true, false, lastCloud.cons, true, 'details_consultations')}
                        ${dataRow('История расписания', weeklyPairsCount, 'etis_weekly_pairs_history_v1', 'cloud-val-weekly', true, false, lastCloud.weekly, false)}
                        ${dataRow('Тема и цвета', getColorsIndicator(localAccent), 'etis_accent_config', 'cloud-val-theme', true, true, lastCloud.theme, false)}
                        ${dataRow('Время использования', `${Math.round(totalSeconds / 60)} мин`, 'etis_reborn_time_spent', 'cloud-val-time-spent', true, false, lastCloud.timeSpent, false)}
                        ${dataRow('Внешние календари', calsCount, 'etis_external_cals_v2', 'cloud-val-cals', true, false, lastCloud.cals, true, 'details_external_cals')}
                        ${dataRow('Данные быстрого входа', qlCount, 'etis_quick_login_creds', '', false, false, '—', true, 'quick_login_redirect')}
                    </div>
                    `;
        } else if (currentView === 'details_custom_pairs') {
            title = 'Свои пары';
            backTarget = 'data';
            let pairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');

            // Вычисляет дату пользовательской пары и метку повторения
            const getPairDateFormatted = (p) => {
                const daysMap = { 'воскресенье': 0, 'понедельник': 1, 'вторник': 2, 'среда': 3, 'четверг': 4, 'пятница': 5, 'суббота': 6 };
                const monthsArr = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                
                const actualWeek = parseInt(localStorage.getItem('etis_actual_week') || '1', 10);
                const targetWeek = p.addedWeek || actualWeek;
                const weekDiff = targetWeek - actualWeek;
                
                const now = new Date();
                const currentDay = now.getDay();
                const targetDay = daysMap[(p.dayName || '').toLowerCase()] !== undefined ? daysMap[(p.dayName || '').toLowerCase()] : currentDay;
                
                const dayDiff = targetDay - (currentDay === 0 ? 7 : currentDay) + (targetDay === 0 ? 7 : 0);
                const dateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (weekDiff * 7) + dayDiff);
                
                const recLabels = {
                    'once': 'Только на этой неделе',
                    'every': 'Каждую неделю',
                    'biweekly': 'Раз в 2 недели'
                };
                const recText = recLabels[p.recurrence] || '';

                return {
                    dateStr: `${dateObj.getDate()} ${monthsArr[dateObj.getMonth()]}`,
                    recText: recText
                };
            };

            if (pairs.length === 0) {
                contentHTML = `<div style="text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary); font-size:1.4rem;">У вас пока нет созданных вручную пар.</div>`;
            } else {
                contentHTML = `
                            <div class="ios-settings-group">
                                ${pairs.map((p) => {
                            const { dateStr, recText } = getPairDateFormatted(p);
                            return `
                                        <div class="ios-settings-row" style="cursor:default !important; padding: 1.4rem 1.6rem !important;">
                                            <div style="text-align:left; flex:1; min-width:0; padding-right:12px;">
                                                <div style="font-size:1.4rem; font-weight:700; color:var(--color-text-primary); line-height:1.3; margin-bottom:4px;">${escapeHTML(p.subject)}</div>
                                                <div style="font-size:1.2rem; color:var(--color-text-secondary); line-height:1.4;">
                                                    <b style="color:var(--color-accent);">${dateStr}</b> • ${p.startTime || '00:00'} - ${p.endTime || '00:00'}
                                                    ${p.type ? ` • <span style="text-transform:uppercase; font-weight:700;">${p.type}</span>` : ''}
                                                    ${p.aud ? ` • ${p.aud}` : ''}
                                                </div>
                                                ${recText ? `<div style="font-size:1.15rem; color:var(--color-text-secondary); margin-top:2px;">${recText}</div>` : ''}
                                                ${p.teacher ? `<div style="font-size:1.15rem; color:var(--color-text-secondary); margin-top:2px;">${p.teacher}</div>` : ''}
                                            </div>
                                            <button class="delete-single-cp-btn" data-id="${p.id}" title="Удалить пару" style="width:32px; height:32px; border-radius:50% !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; background:rgba(255,59,48,0.1) !important; color:var(--color-red) !important; border:1px solid rgba(255,59,48,0.2) !important; padding:0 !important; margin:0 !important; cursor:pointer; flex-shrink:0;">
                                                <span class="material-icons" style="font-size:1.8rem !important; color:var(--color-red) !important;">delete_outline</span>
                                            </button>
                                        </div>
                                    `;
                        }).join('')}
                            </div>
                        `;
            }
        } else if (currentView === 'details_subject_notes') {
            title = 'Заметки и ДЗ';
            backTarget = 'data';
            let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
            let spec = notesData.specific || {};
            let unbound = notesData.next_unbound || {};
            let totalNotes = Object.keys(spec).length + Object.keys(unbound).length;

            if (totalNotes === 0) {
                contentHTML = `<div style="text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary); font-size:1.4rem;">У вас пока нет сохраненных заметок или ДЗ.</div>`;
            } else {
                let rowsHtml = '';
                for (const [id, text] of Object.entries(spec)) {
                    let label = id.replace(/_/g, ' • ');
                    rowsHtml += `
                                <div class="ios-settings-row" style="cursor:default !important; padding: 1.4rem 1.6rem !important;">
                                    <div style="text-align:left; flex:1; min-width:0; padding-right:12px;">
                                        <div style="font-size:1.2rem; font-weight:700; color:var(--color-accent); margin-bottom:4px;">${label}</div>
                                        <div style="font-size:1.35rem; color:var(--color-text-primary); line-height:1.4; white-space:pre-wrap;">${text}</div>
                                    </div>
                                    <button class="delete-single-note-btn" data-id="${id}" data-type="specific" title="Удалить заметку" style="width:32px; height:32px; border-radius:50% !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; background:rgba(255,59,48,0.1) !important; color:var(--color-red) !important; border:1px solid rgba(255,59,48,0.2) !important; padding:0 !important; margin:0 !important; cursor:pointer; flex-shrink:0;">
                                        <span class="material-icons" style="font-size:1.8rem !important; color:var(--color-red) !important;">delete_outline</span>
                                    </button>
                                </div>
                            `;
                }
                for (const [subj, data] of Object.entries(unbound)) {
                    rowsHtml += `
                                <div class="ios-settings-row" style="cursor:default !important; padding: 1.4rem 1.6rem !important;">
                                    <div style="text-align:left; flex:1; min-width:0; padding-right:12px;">
                                        <div style="font-size:1.2rem; font-weight:700; color:var(--color-warning); margin-bottom:4px;">На следующее занятие • ${subj}</div>
                                        <div style="font-size:1.35rem; color:var(--color-text-primary); line-height:1.4; white-space:pre-wrap;">${data.text || data}</div>
                                    </div>
                                    <button class="delete-single-note-btn" data-id="${subj}" data-type="unbound" title="Удалить заметку" style="width:32px; height:32px; border-radius:50% !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; background:rgba(255,59,48,0.1) !important; color:var(--color-red) !important; border:1px solid rgba(255,59,48,0.2) !important; padding:0 !important; margin:0 !important; cursor:pointer; flex-shrink:0;">
                                        <span class="material-icons" style="font-size:1.8rem !important; color:var(--color-red) !important;">delete_outline</span>
                                    </button>
                                </div>
                            `;
                }
                contentHTML = `<div class="ios-settings-group">${rowsHtml}</div>`;
            }
        } else if (currentView === 'details_consultations') {
            title = 'Файлы консультаций';
            backTarget = 'data';
            let files = JSON.parse(localStorage.getItem('etis_consultation_files_v1') || '[]');

            if (files.length === 0) {
                contentHTML = `<div style="text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary); font-size:1.4rem;">У вас пока нет загруженных файлов консультаций.</div>`;
            } else {
                contentHTML = `
                            <div class="ios-settings-group">
                                ${files.map((f) => `
                                    <div class="ios-settings-row" style="cursor:default !important; padding: 1.4rem 1.6rem !important;">
                                        <div style="text-align:left; flex:1; min-width:0; padding-right:12px;">
                                            <div style="font-size:1.4rem; font-weight:700; color:var(--color-text-primary); margin-bottom:4px;">${f.title}</div>
                                            <div style="font-size:1.2rem; color:var(--color-text-secondary);">
                                                Преподавателей: ${f.teachers ? f.teachers.length : 0} • Статус: ${f.isActive ? '<span style="color:var(--color-green); font-weight:700;">Активен</span>' : '<span style="color:var(--color-text-secondary);">Отключен</span>'}
                                            </div>
                                        </div>
                                        <button class="delete-single-cons-btn" data-id="${f.id}" title="Удалить файл" style="width:32px; height:32px; border-radius:50% !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; background:rgba(255,59,48,0.1) !important; color:var(--color-red) !important; border:1px solid rgba(255,59,48,0.2) !important; padding:0 !important; margin:0 !important; cursor:pointer; flex-shrink:0;">
                                            <span class="material-icons" style="font-size:1.8rem !important; color:var(--color-red) !important;">delete_outline</span>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        `;
            }
        } else if (currentView === 'details_external_cals') {
            title = 'Внешние календари';
            backTarget = 'data';
            let cals = typeof migrateExternalCals === 'function' ? migrateExternalCals() : [];

            if (cals.length === 0) {
                contentHTML = `<div style="text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary); font-size:1.4rem;">У вас пока нет подключенных внешних календарей.</div>`;
            } else {
                contentHTML = `
                            <div class="ios-settings-group">
                                ${cals.map((c, idx) => `
                                    <div class="ios-settings-row" style="cursor:default !important; padding: 1.4rem 1.6rem !important;">
                                        <div style="display:flex; align-items:center; gap:12px; overflow:hidden; flex:1; min-width:0; padding-right:12px; text-align:left;">
                                            <div style="width:14px; height:14px; border-radius:50%; background:${c.color || '#AF52DE'}; flex-shrink:0;"></div>
                                            <div style="font-size:1.35rem; font-weight:600; color:var(--color-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${c.url}">${c.url}</div>
                                        </div>
                                        <button class="delete-single-cal-btn" data-idx="${idx}" title="Удалить календарь" style="width:32px; height:32px; border-radius:50% !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; background:rgba(255,59,48,0.1) !important; color:var(--color-red) !important; border:1px solid rgba(255,59,48,0.2) !important; padding:0 !important; margin:0 !important; cursor:pointer; flex-shrink:0;">
                                            <span class="material-icons" style="font-size:1.8rem !important; color:var(--color-red) !important;">delete_outline</span>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        `;
            }
        } else if (currentView === 'sync_options') {
            title = 'Настройки синхронизации';
            backTarget = 'data';

            const toggles = getSyncToggles();
            const makeToggle = (key, label, desc) => `
                        <label>
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">${label}</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">${desc}</span>
                            </div>
                            <input type="checkbox" class="tumbler-checkbox sync-option-toggle" data-key="${key}" ${toggles[key] !== false ? 'checked' : ''}>
                        </label>
                    `;

            let meta = safeParseJSON(localStorage.getItem('etis_sync_meta'), {});
            let devices = meta.devices || {};
            let deviceId = localStorage.getItem('etis_device_id');
            let devicesCount = Object.keys(devices).length;

            let devicesHtml = '';
            if (devicesCount > 0) {
                devicesHtml = `<div class="ios-settings-group" style="margin-bottom: 2rem;">`;
                for (const [id, dev] of Object.entries(devices)) {
                    const isCurrent = id === deviceId;
                    const activeTime = dev.lastActive || dev.added;
                    const dateStr = new Date(activeTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                    let rightActionHtml = isCurrent ? `
                                <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex-shrink: 0; margin-right: 2px;">
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--color-green) !important; box-shadow: 0 0 6px var(--color-green);" title="Текущее устройство"></div>
                                </div>
                            ` : `
                                <button class="delete-device-btn" data-id="${id}" style="width: 32px; height: 32px; border-radius: 50% !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; background: rgba(255, 59, 48, 0.1) !important; color: var(--color-red) !important; border: 1px solid rgba(255, 59, 48, 0.2) !important; padding: 0 !important; margin: 0 !important; cursor: pointer; flex-shrink: 0; box-shadow: none !important;">
                                    <span class="material-icons" style="font-size: 1.8rem !important; margin: 0 !important; padding: 0 !important; line-height: 1 !important; color: inherit !important;">remove</span>
                                </button>
                            `;

                    devicesHtml += `
                                <div class="ios-settings-row" style="cursor: default !important; padding: 1.4rem 1.6rem !important;">
                                    <div style="text-align: left; display:flex; align-items:center; gap:12px; overflow:hidden; flex:1;">
                                        <span class="material-icons" style="color:var(--color-text-secondary); font-size:2.4rem; flex-shrink:0;">
                                            ${dev.os.toLowerCase().includes('android') || dev.os.toLowerCase().includes('ios') ? 'smartphone' : 'laptop'}
                                        </span>
                                        <div style="overflow:hidden; flex:1;">
                                            <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary); display:flex; align-items:center; gap:6px; overflow:hidden;">
                                                <input type="text" class="device-rename-input" data-id="${id}" value="${dev.name}" style="background:transparent !important; border:none !important; box-shadow:none !important; color:inherit !important; font-size:inherit !important; font-weight:inherit !important; padding:0 !important; margin:0 !important; outline:none !important; text-overflow:ellipsis; width: 100%; max-width: 180px;" ${isCurrent ? '' : 'disabled'}>
                                            </div>
                                            <div style="font-size: 1.15rem; color: var(--color-text-secondary); margin-top: 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                                ${dev.os} • В сети: ${dateStr}
                                            </div>
                                        </div>
                                    </div>
                                    ${rightActionHtml}
                                </div>
                            `;
                }
                devicesHtml += `</div>`;
            }

            contentHTML = `
                        ${devicesHtml}
                        <div style="height: 12px; width: 100%;"></div>
                        <div class="ios-settings-group">
                            ${makeToggle('custom_pairs', 'Свои пары', 'Синхронизация созданных вручную занятий')}
                            ${makeToggle('subject_notes', 'Заметки и ДЗ', 'Синхронизация заметок, ДЗ и важных пар')}
                            ${makeToggle('diary_tasks', 'Дневник и дедлайны', 'Синхронизация задач, дедлайнов и напоминаний')}
                            ${makeToggle('accent_config', 'Цветовая тема', 'Синхронизация палитры, градиентов и режима темы')}
                            ${makeToggle('general_config', 'Настройки интерфейса', 'Синхронизация настроек (окна, сокращения и т.д.)')}
                            ${makeToggle('grades_snapshot', 'История оценок', `Синхронизация баллов в ${getTermWord('prep_pl')} и сессиях`)}
                            ${makeToggle('consultation_files', 'Файлы консультаций', 'Синхронизация загруженных DOCX-календарей')}
                            ${makeToggle('external_cals', 'Внешние календари', 'Синхронизация импортируемых .ics-ссылок')}
                            ${makeToggle('weekly_pairs_history', 'История расписания', 'Синхронизация сводки по нагрузке')}
                        </div>
                    `;
        } else if (currentView === 'achievements') {
            title = 'Мои достижения';
            backTarget = 'main';
            const unlockDates = JSON.parse(localStorage.getItem('etis_statuses_unlocked_dates_v1') || '{}');
            const statusesList = getAchievementsList();

            // Сокращает год в дате до двух цифр
            const formatShortDate = (dateStr) => {
                if (!dateStr) return '';
                const parts = dateStr.split('.');
                if (parts.length === 3 && parts[2].length === 4) {
                    return `${parts[0]}.${parts[1]}.${parts[2].slice(-2)}`;
                }
                return dateStr;
            };

            let listHtml = '<div style="display:flex; flex-direction:column; gap:1.2rem;">';
            statusesList.forEach(s => {
                const isUnlocked = s.cond();
                const opacity = isUnlocked ? '1.0' : '0.45';
                const uDate = unlockDates[s.level] || '';

                listHtml += `
                            <div style="background:var(--color-card); padding:1.4rem 1.6rem; border-radius:var(--radius-large); border:1px solid var(--color-table-border); display:flex; align-items:center; gap:1.6rem; opacity:${opacity}; transition:opacity 0.2s;">
                                <div style="font-size:2.8rem; width:44px; height:44px; background:var(--color-highlight); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                    ${s.emoji}
                                </div>
                                <div style="flex-grow:1; text-align:left;">
                                    <div style="font-size:1.4rem; font-weight:800; color:var(--color-text-primary); margin-bottom:4px;">${s.text}</div>
                                    <div style="font-size:1.15rem; color:var(--color-text-secondary); line-height:1.4;">${s.desc}</div>
                                </div>
                                ${isUnlocked ? `
                                    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                                        <span style="font-size:1.2rem; font-weight:700; color:var(--color-text-secondary);">${formatShortDate(uDate)}</span>
                                        <span class="material-icons" style="color:var(--color-green); font-size:2.2rem;">check_circle</span>
                                    </div>
                                ` : `
                                    <div style="display:flex; align-items:center; flex-shrink:0;">
                                        <span class="material-icons" style="color:var(--color-text-secondary); font-size:2.2rem; opacity:0.5;">lock</span>
                                    </div>
                                `}
                            </div>
                        `;
            });
            listHtml += '</div>';
            contentHTML = listHtml;
        }

        const isMainMobile = currentView === 'menu';
        const showBackBtnOnPC = currentView !== 'menu' && currentView !== 'main' && currentView !== 'data';
        const backBtnClass = showBackBtnOnPC ? 'back-modal-btn' : 'back-modal-btn settings-mobile-header';
        const backBtnStyle = showBackBtnOnPC ? 'display: inline-block !important;' : 'display: none;';

        const shareBtnHtml = (currentView === 'main' && !isMacSafari) ? `
                    <button id="share-bento-btn" title="Поделиться профилем" style="background:transparent!important; border:none!important; box-shadow:none!important; padding:0!important; margin:0!important; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <span class="material-icons" style="color:var(--color-text-secondary); font-size:24px; transition:color 0.2s;">ios_share</span>
                    </button>
                ` : '';

        modal.innerHTML = `
                    <div class="settings-layout">
                        <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Профиль</div>
                            <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons back-to-drawer-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                    <span>Профиль</span>
                                </div>
                                <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                            </div>

                            <div class="sidebar-tabs-container">
                                <div class="settings-sidebar-btn ${currentView === 'main' || currentView === 'achievements' ? 'active' : ''}" data-target="main">
                                    <span class="material-icons">account_circle</span><span class="sidebar-btn-text">Мой профиль</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'data' || currentView.startsWith('details_') || currentView === 'sync_options' ? 'active' : ''}" data-target="data">
                                    <span class="material-icons">storage</span><span class="sidebar-btn-text">Мои данные</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="settings-content-scroll">
                                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <span class="material-icons ${backBtnClass}" data-back="${backTarget}" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem; ${backBtnStyle}">arrow_back</span>
                                        <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${title}</span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:16px;">
                                        ${shareBtnHtml}
                                        <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                                    </div>
                                </div>
                                <div style="padding: 0.8rem 0 4rem 0;">
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
        modal.querySelectorAll('.back-to-drawer-btn').forEach(btn => {
            btn.onclick = () => returnToDrawer(modal, overlay);
        });

        if (currentView === 'main') {
            const allAchBtn = modal.querySelector('#view-all-achievements-btn');
            if (allAchBtn) {
                allAchBtn.onclick = (e) => {
                    e.preventDefault();
                    renderView('achievements');
                };
            }

            // Меняет порядок карточек достижений и сохраняет его
            const swapAchievements = (fromIdx, toIdx) => {
                if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= topAchievements.length || toIdx >= topAchievements.length) return;

                const [moved] = topAchievements.splice(fromIdx, 1);
                topAchievements.splice(toIdx, 0, moved);

                // Формируем новый глобальный порядок
                const newOrderIds = topAchievements.map(a => a.id);
                allUnlocked.forEach(a => {
                    if (!newOrderIds.includes(a.id)) newOrderIds.push(a.id);
                });

                saveSyncData('etis_custom_achievements_order_v1', JSON.stringify(newOrderIds));
                if (navigator.vibrate) navigator.vibrate(15);
                renderView('main');
            };

            const container = modal.querySelector('#status-bento-cards-container');
            if (container && topAchievements.length > 1) {
                let draggedIdx = null;

                // 1. Drag and Drop для ПК
                container.querySelectorAll('.status-bento-subcard').forEach(card => {
                    card.addEventListener('dragstart', (e) => {
                        draggedIdx = parseInt(card.getAttribute('data-idx'), 10);
                        card.style.opacity = '0.4';
                        e.dataTransfer.effectAllowed = 'move';
                    });

                    card.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    });

                    card.addEventListener('dragenter', () => {
                        card.style.transform = 'scale(1.05)';
                    });

                    card.addEventListener('dragleave', () => {
                        card.style.transform = 'scale(1)';
                    });

                    card.addEventListener('drop', (e) => {
                        e.preventDefault();
                        card.style.transform = 'scale(1)';
                        const targetIdx = parseInt(card.getAttribute('data-idx'), 10);
                        if (draggedIdx !== null && targetIdx !== draggedIdx) {
                            swapAchievements(draggedIdx, targetIdx);
                        }
                    });

                    card.addEventListener('dragend', () => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                        draggedIdx = null;
                    });

                    // 2. Свайпы для мобильных устройств
                    let touchStartX = 0;
                    let touchStartY = 0;
                    let isHorizontalSwipe = false;

                    card.addEventListener('touchstart', (e) => {
                        touchStartX = e.touches[0].clientX;
                        touchStartY = e.touches[0].clientY;
                        isHorizontalSwipe = false;
                    }, { passive: true });

                    card.addEventListener('touchmove', (e) => {
                        const diffX = e.touches[0].clientX - touchStartX;
                        const diffY = e.touches[0].clientY - touchStartY;
                        if (!isHorizontalSwipe && Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
                            isHorizontalSwipe = true;
                        }
                        if (isHorizontalSwipe) {
                            card.style.transform = `translateX(${diffX * 0.4}px)`;
                        }
                    }, { passive: true });

                    card.addEventListener('touchend', (e) => {
                        const diffX = e.changedTouches[0].clientX - touchStartX;
                        card.style.transform = 'translateX(0)';
                        const currentIdx = parseInt(card.getAttribute('data-idx'), 10);

                        if (Math.abs(diffX) > 40) {
                            if (diffX < 0 && currentIdx < topAchievements.length - 1) {
                                // Свайп влево -> сдвиг вправо по списку
                                swapAchievements(currentIdx, currentIdx + 1);
                            } else if (diffX > 0 && currentIdx > 0) {
                                // Свайп вправо -> сдвиг влево по списку
                                swapAchievements(currentIdx, currentIdx - 1);
                            }
                        }
                    });
                });
            }

            const shareBtn = modal.querySelector('#share-bento-btn');
            if (shareBtn) {
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const bentoArea = document.getElementById('bento-capture-area');
                    if (bentoArea && typeof openExportPreviewModal === 'function') {
                        openExportPreviewModal(bentoArea, 'EtisProfile.png', false);
                    }
                };
            }
        }

        if (currentView === 'data') {
            const activeMasterKey = getMasterKey();
            if (activeMasterKey && !isDemoUser()) {
                downloadDataFromCloud(activeMasterKey).then(success => {
                    if (success) {
                        const updatedMeta = safeParseJSON(localStorage.getItem('etis_sync_meta'), {});
                        const updatedDevCount = Object.keys(updatedMeta.devices || {}).length;
                        const devSubtitleEl = modal.querySelector('#sync-devices-subtitle');
                        if (devSubtitleEl) devSubtitleEl.textContent = `Управление устройствами (${updatedDevCount}) и типами данных`;

                        const newCpCount = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]').length;
                        const newNotesObj = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                        const newNotesCount = Object.keys(newNotesObj.specific || {}).length + Object.keys(newNotesObj.next_unbound || {}).length;
                        const newGradesCount = Object.keys(JSON.parse(localStorage.getItem('etis_reborn_grades_snapshot_v3') || '{"grades":{}}').grades || {}).length;
                        const newConsCount = JSON.parse(localStorage.getItem('etis_consultation_files_v1') || '[]').length;
                        const newWeeklyCount = Object.keys(JSON.parse(localStorage.getItem('etis_weekly_pairs_history_v1') || '{}')).length;
                        const newCalsCount = typeof migrateExternalCals === 'function' ? migrateExternalCals().length : 0;
                        const newAccent = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'], isGlass: false, isColoredGlass: true };

                        const cpLocEl = modal.querySelector('#local-val-etis-custom-pairs-v1');
                        const notesLocEl = modal.querySelector('#local-val-etis-subject-notes-v2');
                        const gradesLocEl = modal.querySelector('#local-val-etis-reborn-grades-snapshot-v3');
                        const consLocEl = modal.querySelector('#local-val-etis-consultation-files-v1');
                        const weeklyLocEl = modal.querySelector('#local-val-etis-weekly-pairs-history-v1');
                        const calsLocEl = modal.querySelector('#local-val-etis-external-cals-v2');
                        const themeLocEl = modal.querySelector('#local-val-etis-accent-config');
                        const newGpaVal = localStorage.getItem('etis_diploma_gpa') || '—';
                        const newNotifsCount = JSON.parse(localStorage.getItem('etis_notifications_history_v1') || '[]').length;
                        const gpaLocEl = modal.querySelector('#local-val-etis-diploma-gpa');
                        const notifsLocEl = modal.querySelector('#local-val-etis-notifications-history-v1');
                        
                        if (cpLocEl) cpLocEl.textContent = newCpCount;
                        if (notesLocEl) notesLocEl.textContent = newNotesCount;
                        if (gradesLocEl) gradesLocEl.textContent = newGradesCount;
                        if (consLocEl) consLocEl.textContent = newConsCount;
                        if (weeklyLocEl) weeklyLocEl.textContent = newWeeklyCount;
                        if (calsLocEl) calsLocEl.textContent = newCalsCount;
                        if (themeLocEl) themeLocEl.innerHTML = getColorsIndicator(newAccent);
                        let formattedNewGpa = '—';
                        if (newGpaVal && newGpaVal !== '—') {
                            if (newGpaVal === 'none' || newGpaVal === '0') formattedNewGpa = 'Нет';
                            else if (newGpaVal === 'debts') formattedNewGpa = 'Долги';
                            else {
                                const p = parseFloat(newGpaVal);
                                formattedNewGpa = (isNaN(p) || p === 0) ? 'Нет' : p.toFixed(2);
                            }
                        }
                        if (gpaLocEl) gpaLocEl.textContent = formattedNewGpa;
                        if (notifsLocEl) notifsLocEl.textContent = newNotifsCount;
                    }
                });
            }

            modal.querySelectorAll('.details-data-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault();
                    const target = btn.getAttribute('data-target');
                    if (target === 'quick_login_redirect') {
                        closeAll();
                        openSettingsModal('quick_login_settings');
                    } else if (target === 'notifications_modal_redirect') {
                        closeAll();
                        openNotificationsModal();
                    } else {
                        renderView(target);
                    }
                };
            });

            modal.querySelectorAll('.clear-data-btn').forEach(btn => {
                btn.onclick = () => {
                    const key = btn.getAttribute('data-key');
                    if (confirm('Очистить эти данные?')) {
                        
                        if (key === 'etis_offline_cache') {
                            const offlineKeys = [
                                'etis_offline_timetable_html', 'etis_offline_signs_session_html', 'etis_offline_signs_current_html',
                                'etis_offline_signs_rating_html', 'etis_offline_signs_diplom_html', 'etis_offline_announces_html',
                                'etis_offline_notes_html', 'etis_offline_teach_plan_advanced_html', 'etis_offline_teach_plan_short_html',
                                'etis_offline_student_info_html'
                            ];
                            offlineKeys.forEach(k => localStorage.removeItem(k));
                            
                            // Если пользователь сейчас находится в оффлайн-режиме, мгновенно выбрасываем его на страницу входа
                            if (sessionStorage.getItem('etis_demo_mode') === 'true' && sessionStorage.getItem('etis_pure_demo_mode') !== 'true') {
                                sessionStorage.removeItem('etis_demo_mode');
                                sessionStorage.removeItem('etis_demo_page');
                                window.location.href = 'stu.login';
                                return;
                            }
                            renderView('data');
                            return;
                        }

                        const emptyValues = {
                            'etis_custom_pairs_v1': '[]',
                            'etis_subject_notes_v2': '{"specific":{},"next_unbound":{}}',
                            'etis_reborn_grades_snapshot_v3': '{"grades":{}}',
                            'etis_diploma_gpa': 'none',
                            'etis_notifications_history_v1': '[]',
                            'etis_consultation_files_v1': '[]',
                            'etis_weekly_pairs_history_v1': '{}',
                            'etis_accent_config': '{"isGradient":true,"isThreeColors":false,"colors":["blue","lightblue"],"isGlass":false}',
                            'etis_reborn_time_spent': '0',
                            'etis_external_cals_v2': '[]'
                        };

                        if (key === 'etis_quick_login_creds') {
                            if (typeof GM_setValue !== 'undefined') GM_setValue('ql_accounts_v2', '[]');
                        } else {
                            const emptyVal = emptyValues[key] !== undefined ? emptyValues[key] : '';
                            saveSyncData(key, emptyVal);

                            if (key === 'etis_consultation_files_v1') setConsultationsFiles([]);
                            if (key === 'etis_accent_config') {
                                localStorage.removeItem('etis_accent_config');
                                applyAccentColor();
                            }
                            if (key === 'etis_notifications_history_v1') updateBellCounter();
                        }
                        renderView('data');
                    }
                };
            });

            const syncSettingsBtn = modal.querySelector('#sync-settings-btn');
            if (syncSettingsBtn) {
                syncSettingsBtn.onclick = (e) => {
                    e.preventDefault();
                    renderView('sync_options');
                };
            }

            const masterKeyForStats = getMasterKey();
            if (masterKeyForStats && !isDemoUser()) {
                EtisCrypto.getCloudVaultId(masterKeyForStats).then(vaultId => {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: `${FIREBASE_DB_URL}sync/${vaultId}.json?t=${Date.now()}`,
                        onload: async function(res) {
                            if (res.status === 200 && res.responseText) {
                                let rawData = null;
                                try { rawData = JSON.parse(res.responseText); } catch(e){}
                                if (!rawData || !rawData.vaultSalt) return;

                                // 1. Восстанавливаем соль хранилища и один раз выводим ключ AES
                                const saltBytes = Uint8Array.from(atob(rawData.vaultSalt), c => c.charCodeAt(0));
                                const aesKey = await EtisCrypto.deriveAesKey(masterKeyForStats, saltBytes);

                                const data = {};
                                for (const [key, value] of Object.entries(rawData)) {
                                    if (value && typeof value === 'string' && key !== 'vaultSalt' && key !== 'writeToken') {
                                        try {
                                            data[key] = await EtisCrypto.decryptWithKey(value, aesKey);
                                        } catch (err) {
                                            data[key] = value;
                                        }
                                    } else {
                                        data[key] = value;
                                    }
                                }

                                const cloudCP = safeParseJSON(data.custom_pairs, []).length;
                                const parsedNotes = safeParseJSON(data.subject_notes, {specific:{}, next_unbound:{}});
                                const cloudNotes = Object.keys(parsedNotes.specific || {}).length + Object.keys(parsedNotes.next_unbound || {}).length;
                                const cloudGrades = Object.keys(safeParseJSON(data.grades_snapshot, {grades:{}}).grades || {}).length;
                                const cloudCons = safeParseJSON(data.consultation_files, []).length;
                                const cloudWeekly = Object.keys(safeParseJSON(data.weekly_pairs_history, {})).length;
                                const cloudAccentObj = safeParseJSON(data.accent_config, null);

                                let cloudCalsCount = 0;
                                const parsedCals = safeParseJSON(data.external_cals, null);
                                if (Array.isArray(parsedCals)) {
                                    cloudCalsCount = parsedCals.length;
                                } else {
                                    const parsedImp = safeParseJSON(data.important_pairs, null);
                                    if (parsedImp && typeof parsedImp === 'object' && parsedImp.external_cals) {
                                        cloudCalsCount = parsedImp.external_cals.length;
                                    }
                                }

                                let cloudTimeSpent = '—';
                                if (data.time_spent) {
                                    cloudTimeSpent = `${Math.round(parseInt(data.time_spent, 10) / 60)} мин`;
                                } else if (data.install_date) {
                                    const parts = data.install_date.toString().split('|');
                                    cloudTimeSpent = parts[1] ? `${Math.round(parseInt(parts[1], 10) / 60)} мин` : '—';
                                }

                                let cloudGPA = '—';
                                if (data.diploma_gpa) {
                                    if (data.diploma_gpa === 'none' || data.diploma_gpa === '0') cloudGPA = 'Нет';
                                    else if (data.diploma_gpa === 'debts') cloudGPA = 'Долги';
                                    else {
                                        const p = parseFloat(data.diploma_gpa);
                                        cloudGPA = isNaN(p) || p === 0 ? 'Нет' : p.toFixed(2);
                                    }
                                }
                                const cloudNotifs = safeParseJSON(data.notifications_history, []).length;

                                // Сохраняем в локальный кэш счетчиков
                                localStorage.setItem('etis_last_cloud_counts_v1', JSON.stringify({
                                    cp: cloudCP,
                                    notes: cloudNotes,
                                    grades: cloudGrades,
                                    cons: cloudCons,
                                    weekly: cloudWeekly,
                                    timeSpent: cloudTimeSpent,
                                    cals: cloudCalsCount,
                                    gpa: cloudGPA,
                                    notifs: cloudNotifs,
                                    theme: cloudAccentObj ? 'ok' : '—',
                                    themeSig: cloudAccentObj ? accentSignature(cloudAccentObj) : undefined
                                }));

                                // Обновляет текстовое содержимое элемента статистики по ID
                                const updateEl = (id, val) => {
                                    const el = modal.querySelector(`#${id}`);
                                    if (el) el.textContent = val;
                                };

                                updateEl('cloud-val-cp', cloudCP);
                                updateEl('cloud-val-notes', cloudNotes);
                                updateEl('cloud-val-grades', cloudGrades);
                                updateEl('cloud-val-cons', cloudCons);
                                updateEl('cloud-val-weekly', cloudWeekly);
                                updateEl('cloud-val-time-spent', cloudTimeSpent);
                                updateEl('cloud-val-cals', cloudCalsCount);
                                updateEl('cloud-val-gpa', cloudGPA);
                                updateEl('cloud-val-notifs', cloudNotifs);

                                const themeEl = modal.querySelector('#cloud-val-theme');
                                if (themeEl && cloudAccentObj) themeEl.innerHTML = getColorsIndicator(cloudAccentObj);
                            }
                        }
                    });
                });
            }

            // Клик по самому тексту ключа снимает/возвращает блюр
            const keyDisplayEl = modal.querySelector('#master-key-display');
            if (keyDisplayEl) {
                keyDisplayEl.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    keyDisplayEl.classList.toggle('revealed');
                };
            }

        }

        if (currentView === 'details_custom_pairs') {
            modal.querySelectorAll('.delete-single-cp-btn').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    let pairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                    pairs = pairs.filter(p => p.id !== id);
                    saveSyncData('etis_custom_pairs_v1', JSON.stringify(pairs));
                    renderView('details_custom_pairs');
                };
            });
        }

        if (currentView === 'details_subject_notes') {
            modal.querySelectorAll('.delete-single-note-btn').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const type = btn.getAttribute('data-type');
                    let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                    if (type === 'specific') delete notesData.specific[id];
                    else if (type === 'unbound') delete notesData.next_unbound[id];
                    saveSyncData('etis_subject_notes_v2', JSON.stringify(notesData));
                    renderView('details_subject_notes');
                };
            });
        }

        if (currentView === 'details_consultations') {
            modal.querySelectorAll('.delete-single-cons-btn').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    let files = JSON.parse(localStorage.getItem('etis_consultation_files_v1') || '[]');
                    files = files.filter(f => f.id !== id);
                    setConsultationsFiles(files); // Обновляем массив в оперативной памяти
                    saveConsultationsState();
                    renderView('details_consultations');
                };
            });
        }

        if (currentView === 'details_external_cals') {
            modal.querySelectorAll('.delete-single-cal-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.getAttribute('data-idx'), 10);
                    let cals = typeof migrateExternalCals === 'function' ? migrateExternalCals() : [];
                    cals.splice(idx, 1);
                    saveSyncData('etis_external_cals_v2', JSON.stringify(cals));
                    renderView('details_external_cals');
                };
            });
        }

        if (currentView === 'sync_options') {
            modal.querySelectorAll('.sync-option-toggle').forEach(checkbox => {
                checkbox.onchange = (e) => {
                    const key = e.target.getAttribute('data-key');
                    const toggles = getSyncToggles();
                    toggles[key] = e.target.checked;
                    localStorage.setItem('etis_sync_toggles', JSON.stringify(toggles));
                    if (typeof triggerSilentCloudUpload === 'function') triggerSilentCloudUpload();
                };
            });

            modal.querySelectorAll('.delete-device-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.preventDefault();
                    const id = btn.getAttribute('data-id');
                    if (confirm('Отключить это устройство от аккаунта?')) {
                        let meta = safeParseJSON(localStorage.getItem('etis_sync_meta'), {});
                        if (meta.devices) {
                            delete meta.devices[id];
                            if (!meta.removed) meta.removed = {};
                            meta.removed[id] = Date.now();
                            localStorage.setItem('etis_sync_meta', JSON.stringify(meta));
                            btn.innerHTML = '<span class="material-icons" style="animation:spin 1s linear infinite; font-size:1.8rem !important;">sync</span>';
                            btn.style.pointerEvents = 'none';
                            
                            // Передаем true (skipPreDownload), чтобы не стягивать старый список из облака
                            await uploadDataToCloud(true);
                            renderView('sync_options');
                        }
                    }
                };
            });

            modal.querySelectorAll('.device-rename-input').forEach(input => {
                input.onchange = async () => {
                    const id = input.getAttribute('data-id');
                    const newName = input.value.trim();
                    if (!newName) return;
                    let meta = safeParseJSON(localStorage.getItem('etis_sync_meta'), {});
                    if (meta.devices && meta.devices[id]) {
                        meta.devices[id].name = newName;
                        meta.devices[id].lastActive = Date.now();
                        localStorage.setItem('etis_sync_meta', JSON.stringify(meta));
                        localStorage.setItem('etis_device_name', newName);
                        await uploadDataToCloud(true);
                        renderView('sync_options');
                    }
                };
            });

            const activeKeyForOptions = getMasterKey();
            if (activeKeyForOptions && !isDemoUser() && !modal.dataset.syncOptionsFetching) {
                modal.dataset.syncOptionsFetching = '1';
                downloadDataFromCloud(activeKeyForOptions).then((ok) => {
                    if (ok && modal.classList.contains('active') && modal.querySelector('.sync-option-toggle')) {
                        const activeEl = document.activeElement;
                        if (!activeEl || !activeEl.classList.contains('device-rename-input')) {
                            renderView('sync_options');
                        }
                    }
                }).finally(() => {
                    setTimeout(() => { delete modal.dataset.syncOptionsFetching; }, 3000);
                });
            }
        }

        const copyKeyBtn = modal.querySelector('#copy-master-key-btn');
        if (copyKeyBtn) {
            copyKeyBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const key = getMasterKey();
                if (key) {
                    navigator.clipboard.writeText(key).then(() => {
                        copyKeyBtn.innerHTML = '<span class="material-icons" style="font-size:18px; color:var(--color-green);">check</span>';
                        setTimeout(() => {
                            copyKeyBtn.innerHTML = '<span class="material-icons" style="font-size:18px;">content_copy</span>';
                        }, 1500);
                    });
                }
            };
        }

        const setupNewBtn = modal.querySelector('#setup-new-sync-btn');
        if (setupNewBtn) {
            setupNewBtn.onclick = async (e) => {
                e.preventDefault();
                const newKey = EtisCrypto.generateMasterKey();
                setMasterKey(newKey);
                registerCurrentDevice();

                alert(`Ваш секретный ключ восстановления:\n\n${newKey}\n\nОбязательно сохраните его! Он потребуется для входа с других устройств.`);

                await uploadDataToCloud(true);
                renderView('data');
            };
        }

        const enterExistingBtn = modal.querySelector('#enter-existing-sync-btn');
        if (enterExistingBtn) {
            enterExistingBtn.onclick = async (e) => {
                e.preventDefault();
                const inputKey = prompt("Введите 25-значный мастер-ключ (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX):");
                if (inputKey && inputKey.trim().replace(/[^A-Z0-9]/gi, '').length >= 25) {
                    setMasterKey(inputKey.trim());
                    const success = await downloadDataFromCloud();
                    if (success) {
                        registerCurrentDevice();
                        await uploadDataToCloud(true);
                        alert("Устройство успешно подключено к вашему облаку!");
                    } else {
                        clearMasterKey();
                        alert("Не удалось загрузить данные по этому ключу. Проверьте правильность ввода символов.");
                    }
                    renderView('data');
                }
            };
        }

        const unlinkBtn = modal.querySelector('#unlink-sync-btn');
        if (unlinkBtn) {
            unlinkBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm("Отключить синхронизацию на этом устройстве? Все локальные пары и заметки сохранятся, но обмен с облаком прекратится.")) {
                    clearMasterKey();
                    renderView('data');
                }
            };
        }

        const syncSettingsBtn = modal.querySelector('#sync-settings-btn');
        if (syncSettingsBtn) {
            syncSettingsBtn.onclick = (e) => {
                e.preventDefault();
                renderView('sync_options');
            };
        }

    };

    renderView(window.innerWidth <= 960 ? 'menu' : 'main');

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}
