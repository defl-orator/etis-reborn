import { pageCtx } from '../../app/context.js';
import { updateLiveTimetable } from '../../features/live-timetable.js';
import { downloadICSFile, generatePairICS, getPairDateTime, openDirectAppleCalendar, openGoogleCalendarWeb, openYandexCalendarWeb } from './ics-export.js';
import { saveSyncData } from '../../sync/data.js';
import { parseDayDateStrToISO } from '../../utils/dates.ts';
import { isIOS, isMacSafari } from '../../utils/platform.ts';

export const extractCleanLocation = (r) => {
    const audEl = r.querySelector('.pair_info .aud');
    if (!audEl) return '';
    const clone = audEl.cloneNode(true);
    clone.querySelectorAll('.pair-teacher-wrap, .note-btn-wrapper, .material-icons, a').forEach(el => el.remove());
    return clone.textContent.trim();
};

export const extractCleanTeacher = (r) => {
    const tWrap = r.querySelector('.pair-teacher-wrap');
    if (tWrap) {
        const clone = tWrap.cloneNode(true);
        clone.querySelectorAll('.material-icons').forEach(el => el.remove());
        return clone.textContent.trim();
    }
    const tEl = r.querySelector('.pair_teacher a:not(.eval)');
    if (tEl) return tEl.textContent.trim();
    return '';
};

// Модальное окно для всех типов пар
export function openPairModal(row, dispSubject, origSubject, pairId, dayDateStr, rawPairNum, currentIndex, allRowsArray, currentNote, isExternal, isPureCustom) {
    // Безопасная инициализация названия предмета
    const cleanSubjectName = (dispSubject || origSubject || 'Занятие').replace(/edit$/i, '').trim();

    let overlay = document.querySelector('.analytics-overlay.notes-overlay');
    let modal = document.querySelector('.analytics-modal.notes-modal');

    if (!overlay || !modal) {
        overlay = document.createElement('div');
        overlay.className = 'analytics-overlay notes-overlay';
        document.body.appendChild(overlay);

        modal = document.createElement('div');
        modal.className = 'analytics-modal notes-modal';
        document.body.appendChild(modal);
    }

    const formatEveryDayPhrase = (dName) => {
        if (!dName) return 'Каждую неделю';
        const clean = dName.trim().toLowerCase();
        const map = {
            'понедельник': 'Каждый понедельник',
            'вторник':     'Каждый вторник',
            'среда':       'Каждую среду',
            'четверг':     'Каждый четверг',
            'пятница':     'Каждую пятницу',
            'суббота':     'Каждую субботу',
            'воскресенье': 'Каждое воскресенье'
        };
        return map[clean] || `Каждый день (${dName})`;
    };

    let currentLoc = "";
    let currentTeacher = "";
    let isSeries = false;
    let currentType = '';

    const cpId = row.getAttribute('data-custom-id');
    let customPairsList = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
    let foundCustomPair = cpId ? customPairsList.find(p => p.id === cpId) : null;
    if (foundCustomPair && foundCustomPair.type) currentType = foundCustomPair.type;

    if (!currentType) {
        const badgeEl = row.querySelector('.pair-type-badge');
        if (badgeEl) {
            const bClone = badgeEl.cloneNode(true);
            bClone.querySelectorAll('.material-icons, button, .pair-important-btn').forEach(el => el.remove());
            currentType = bClone.textContent.trim().toLowerCase();
        }
    }

    if (isExternal) {
        origSubject = row.getAttribute('data-ext-orig-title') || origSubject;
        currentLoc = row.getAttribute('data-ext-disp-loc') || '';
        currentTeacher = row.getAttribute('data-ext-disp-teacher') || '';
        isSeries = row.getAttribute('data-ext-is-series') === 'true';
        currentType = row.getAttribute('data-ext-disp-type') || 'лич';
    } else if (isPureCustom) {
        currentLoc = foundCustomPair ? (foundCustomPair.aud || '') : extractCleanLocation(row);
        currentTeacher = foundCustomPair ? (foundCustomPair.teacher || '') : extractCleanTeacher(row);
    } else {
        currentLoc = extractCleanLocation(row);
        currentTeacher = extractCleanTeacher(row);
        isSeries = row.getAttribute('data-ext-is-series') === 'true';
        const overType = row.getAttribute('data-ext-disp-type');
        if (overType !== null) currentType = overType;
    }

    const timeEl = row.querySelector('.pair_num .eval');
    const timeMatch = timeEl ? timeEl.textContent.match(/\d{1,2}:\d{2}/) : null;
    let startVal = foundCustomPair ? (foundCustomPair.startTime || '08:00') : (timeMatch ? timeMatch[0] : '08:00');
    let endVal = foundCustomPair ? (foundCustomPair.endTime || '') : (row.getAttribute('data-end-time') || '');

    if (!endVal && startVal && startVal.includes(':')) {
        let [h, m] = startVal.split(':').map(Number);
        let total = (h || 0) * 60 + (m || 0) + 90;
        endVal = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }

    modal.innerHTML = `
                            <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="ui-dialog-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%;">${cleanSubjectName}</span>
                                <button class="close-notes" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                            </div>
                            <div class="ui-dialog-content" style="padding: 2.4rem;">
                                <div class="sync-tabs">
                                    <button class="sync-tab active" data-tab="notes">Заметка</button>
                                    <button class="sync-tab" data-tab="reminder">Напоминание</button>
                                    <button class="sync-tab" data-tab="edit">Настройки</button>
                                </div>

                                <!-- ВКЛАДКА 1: Заметка -->
                                <div class="tab-content active" id="tab-notes">
                                    <div style="margin-bottom: 1.2rem;">
                                        <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; text-transform: uppercase;">Что нужно сделать:</div>
                                        <textarea class="note-modal-textarea" id="cp-notes-area" style="min-height: 70px !important;" placeholder="Краткая суть (например: Сдать реферат)...">${currentNote}</textarea>
                                    </div>

                                    <div style="margin-bottom: 1.6rem;">
                                        <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; text-transform: uppercase;">Само задание:</div>
                                        <textarea class="note-modal-textarea" id="cp-task-details-area" style="min-height: 90px !important;" placeholder="Условия, номера задач, полезные ссылки...">${(() => {
                        const tasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
                        const t = tasks.find(x => x.pairId === pairId);
                        return t ? (t.details || '') : '';
                    })()}</textarea>
                                    </div>

                                    <div style="margin: 1.5rem 0;">
                                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-card) !important; border-radius: 16px; box-shadow: var(--shadow-main) !important; border: 1px solid var(--color-table-border) !important;">
                                            <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">На следующую пару</span>
                                                <span style="font-size:1.1rem; color:var(--color-text-secondary);">Перенести заметку к следующему занятию</span>
                                            </div>
                                            <input type="checkbox" id="note-next-class-cb" class="tumbler-checkbox">
                                        </label>
                                    </div>
                                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                                        ${currentNote ? `<button class="answer-btn-custom clear-note-btn" style="background: var(--color-red) !important; color: #fff !important; border: none !important; box-shadow: none !important;">Удалить</button>` : ''}
                                        <button class="answer-btn-custom save-note-btn" style="border: none !important; box-shadow: none !important;">Сохранить</button>
                                    </div>
                                </div>

                                <!-- ВКЛАДКА 2: Напоминание -->
                                <div class="tab-content" id="tab-reminder">
                                    <div style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 1.6rem; text-align: left; padding: 0 4px;">
                                        Добавьте пару в календарь с точным временем, аудиторией и напоминанием.
                                    </div>
                                    <div class="ios-settings-group" style="margin-bottom: 2rem;">
                                        <div class="ios-settings-row" style="cursor: default !important; padding: 1.2rem 1.6rem !important;">
                                            <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Платформа</span>
                                            <select id="ics-platform" style="background: var(--color-input) !important; border: 1px solid var(--color-table-border) !important; border-radius: var(--radius-small) !important; padding: 0.6rem 2.8rem 0.6rem 1.2rem !important; color: var(--color-text-primary) !important; font-size: 1.3rem !important; font-weight: 600; cursor: pointer; outline: none; appearance: none;">
                                                <option value="apple_ics" selected>Apple / Файл (.ics)</option>
                                                <option value="google">Google Календарь</option>
                                                <option value="yandex">Яндекс Календарь</option>
                                            </select>
                                        </div>
                                        <div class="ios-settings-row" style="cursor: default !important; padding: 1.2rem 1.6rem !important;">
                                            <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Напомнить за</span>
                                            <select id="ics-alarm-offset" style="background: var(--color-input) !important; border: 1px solid var(--color-table-border) !important; border-radius: var(--radius-small) !important; padding: 0.6rem 2.8rem 0.6rem 1.2rem !important; color: var(--color-text-primary) !important; font-size: 1.3rem !important; font-weight: 600; cursor: pointer; outline: none; appearance: none;">
                                                <option value="15">15 минут</option>
                                                <option value="30">30 минут</option>
                                                <option value="60" selected>1 час</option>
                                                <option value="120">2 часа</option>
                                                <option value="1440">1 день</option>
                                                <option value="0">В момент начала</option>
                                            </select>
                                        </div>
                                        ${currentNote ? `
                                        <label style="cursor: pointer; padding: 1.2rem 1.6rem !important;">
                                            <div style="display: flex; flex-direction: column; gap: 2px; text-align: left;">
                                                <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">Включить заметку</span>
                                                <span style="font-size: 1.1rem; color: var(--color-text-secondary);">Добавить текст ДЗ в описание события</span>
                                            </div>
                                            <input type="checkbox" id="ics-include-notes" class="tumbler-checkbox" checked>
                                        </label>` : ''}
                                    </div>
                                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                                        <button class="answer-btn-custom submit-reminder-btn" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important; display: inline-flex; align-items: center; gap: 8px;">
                                            <span class="material-icons" style="font-size: 1.8rem;">event</span>Добавить
                                        </button>
                                    </div>
                                </div>

                                <!-- ВКЛАДКА 3: Маршрут (скрыта) -->
                                <div class="tab-content" id="tab-route" style="display: none !important;">
                                    <input type="text" id="route-from-input" value="">
                                    <input type="text" id="route-to-input" value="${currentLoc}">
                                    <button id="route-swap-btn"></button>
                                    <button id="build-route-btn"></button>
                                    <div id="route-result-container"></div>
                                </div>

                                <!-- ВКЛАДКА 4: Настройки (Редактирование пары и времени) -->
                                <div class="tab-content" id="tab-edit" style="padding: 6px 4px;">
                                    ${(() => {
                    if (isPureCustom) return '';
                    const origTimeVal = row.getAttribute('data-orig-start-time') || '';
                    const isTitleChanged = origSubject && origSubject.trim().toLowerCase() !== cleanSubjectName.trim().toLowerCase();
                    const isTimeChanged = origTimeVal && startVal && origTimeVal !== startVal;

                    if (!isTitleChanged && !isTimeChanged) return '';

                    return `
                                            <div class="ios-settings-group" style="margin-bottom: 1.4rem; padding: 1.4rem 1.6rem; background: var(--color-card) !important; border: 1px solid var(--color-table-border); box-shadow: var(--shadow-main); display:flex; flex-direction:column; gap:6px; text-align:left;">
                                                ${isTitleChanged ? `<div style="font-size: 1.25rem; color: var(--color-text-secondary);">Оригинальное название: <b style="color: var(--color-text-primary);">${origSubject}</b></div>` : ''}
                                                ${isTimeChanged ? `<div style="font-size: 1.25rem; color: var(--color-text-secondary);">Оригинальное время: <b style="color: var(--color-text-primary);">${origTimeVal}</b></div>` : ''}
                                            </div>
                                        `;
                })()}

                                    <!-- Название предмета -->
                                    <div class="custom-pair-input-group">
                                        <div class="cp-input-wrap">
                                            <span class="material-icons">menu_book</span>
                                            <input type="text" id="cp-subject-edit" placeholder="Название предмета *" value="${cleanSubjectName}">
                                        </div>
                                    </div>

                                    <!-- Время начала и окончания -->
                                    <div class="custom-pair-input-group">
                                        <div class="cp-input-wrap">
                                            <span class="material-icons">schedule</span>
                                            <input type="time" id="cp-start-edit" value="${startVal}" required title="Время начала">
                                        </div>
                                        <div class="cp-input-wrap">
                                            <span class="material-icons">flag</span>
                                            <input type="time" id="cp-end-edit" value="${endVal}" required title="Время окончания">
                                        </div>
                                    </div>

                                    <!-- Тип пары и Преподаватель -->
                                    <div class="custom-pair-input-group">
                                        <div class="cp-input-wrap" style="flex: 0.85;">
                                            <span class="material-icons">category</span>
                                            <select id="cp-type-edit">
                                                <option value="лек" ${currentType === 'лек' ? 'selected' : ''}>Лекция</option>
                                                <option value="практ" ${currentType === 'практ' ? 'selected' : ''}>Практика</option>
                                                <option value="лаб" ${currentType === 'лаб' ? 'selected' : ''}>Лабораторная</option>
                                                <option value="экз" ${currentType === 'экз' ? 'selected' : ''}>Экзамен</option>
                                                <option value="зач" ${currentType === 'зач' ? 'selected' : ''}>Зачет</option>
                                                <option value="конс" ${currentType === 'конс' ? 'selected' : ''}>Консультация</option>
                                                <option value="лич" ${currentType === 'лич' || !currentType ? 'selected' : ''}>Личное</option>
                                            </select>
                                        </div>
                                        <div class="cp-input-wrap">
                                            <span class="material-icons">person</span>
                                            <input type="text" id="cp-teacher-edit" placeholder="Преподаватель" value="${currentTeacher}">
                                        </div>
                                    </div>

                                    <!-- Аудитория / Ссылка -->
                                    <div class="custom-pair-input-group">
                                        <div class="cp-input-wrap">
                                            <span class="material-icons">place</span>
                                            <input type="text" id="cp-aud-edit" placeholder="Аудитория / Ссылка" value="${currentLoc}">
                                        </div>
                                    </div>

                                    ${!isPureCustom ? (() => {
                    const origTimeVal = row.getAttribute('data-orig-start-time') || startVal;
                    const currentDayName = row.closest('.day')?.getAttribute('data-orig-day-name') ||
                                           row.closest('.day')?.querySelector('.day-name')?.textContent.trim() || 'этот день';

                    const allOverrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                    const thisSingleKey = `SINGLE_${dayDateStr}_${rawPairNum}_${origSubject}`;
                    const currentSingleData = allOverrides[thisSingleKey] || {};

                    // Восстановление сохранённых состояний тумблеров
                    const checkedAll = currentSingleData.applyAll === true || !!allOverrides[`SERIES_ALL_${origSubject}`];
                    const checkedTime = currentSingleData.applyTimeSeries === true || !!allOverrides[`SERIES_TIME_${origTimeVal}_${origSubject}`];
                    const checkedDayTime = currentSingleData.applyDayTimeSeries === true || !!allOverrides[`SERIES_DAY_TIME_${currentDayName}_${origTimeVal}_${origSubject}`];

                    return `
                                        <div class="ios-settings-group" style="margin: 1.6rem 0;">
                                            <!-- Тумблер 1: Ко всем парам предмета -->
                                            <label>
                                                <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Применить ко всем парам предмета</span>
                                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Ко всем занятиям с названием «${origSubject}»</span>
                                                </div>
                                                <input type="checkbox" id="ext-apply-all" class="tumbler-checkbox" ${checkedAll ? 'checked' : ''}>
                                            </label>

                                            <!-- Тумблер 2: Ко всем в этот день и время -->
                                            <label>
                                                <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Применить ко всем в этот день и время</span>
                                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">${formatEveryDayPhrase(currentDayName)} в исходные ${origTimeVal}</span>
                                                </div>
                                                <input type="checkbox" id="ext-apply-day-time-series" class="tumbler-checkbox" ${checkedDayTime ? 'checked' : ''}>
                                            </label>

                                            <!-- Тумблер 3: Ко всем парам в это исходное время -->
                                            <label>
                                                <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Применить ко всем в это время</span>
                                                    <span style="font-size:1.1rem; color:var(--color-text-secondary);">Для всех дней недели в исходные ${origTimeVal}</span>
                                                </div>
                                                <input type="checkbox" id="ext-apply-time-series" class="tumbler-checkbox" ${checkedTime ? 'checked' : ''}>
                                            </label>
                                        </div>`;
                })() : ''}

                                    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 2rem;">
                                        ${isPureCustom ? `
                                            <button type="button" class="delete-cp-btn-modal" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; background: var(--color-red) !important; color: #fff !important; border: none !important; border-radius: 50px !important; padding: 0.8rem 1.8rem !important; font-size: 1.35rem !important; font-weight: 700 !important; cursor: pointer !important; box-shadow: 0 4px 12px rgba(255,59,48,0.2) !important; transition: all 0.2s ease !important;">
                                                Удалить пару
                                            </button>
                                        ` : `
                                            <button type="button" class="reset-edit-btn" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; background: rgba(255, 59, 48, 0.12) !important; color: var(--color-red) !important; border: 1px solid rgba(255, 59, 48, 0.25) !important; border-radius: 50px !important; padding: 0.8rem 1.8rem !important; font-size: 1.35rem !important; font-weight: 700 !important; cursor: pointer !important; box-shadow: none !important; transition: all 0.2s ease !important;">
                                                Сбросить
                                            </button>
                                        `}
                                        <button type="button" class="save-edit-btn" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; border: none !important; border-radius: 50px !important; padding: 0.8rem 2.2rem !important; font-size: 1.35rem !important; font-weight: 700 !important; cursor: pointer !important; transition: all 0.2s ease !important;">
                                            Сохранить настройки
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;

    const closeModal = () => {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.classList.remove('modal-open-body');
        }, 150);
    };
    overlay.onclick = closeModal;
    modal.querySelector('.close-notes').onclick = closeModal;

    const tabs = modal.querySelectorAll('.sync-tab');
    const contents = modal.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            modal.querySelector(`#tab-${tab.getAttribute('data-tab')}`).classList.add('active');
        });
    });

    const startEditInput = modal.querySelector('#cp-start-edit');
    const endEditInput = modal.querySelector('#cp-end-edit');
    if (startEditInput && endEditInput) {
        startEditInput.addEventListener('change', (e) => {
            if (e.target.value) {
                let [hours, minutes] = e.target.value.split(':').map(Number);
                let total = (hours || 0) * 60 + (minutes || 0) + 90;
                endEditInput.value = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
            }
        });
    }

    // Сохранение заметки, перенос на следующую пару и синхронизация с Дневником
    modal.querySelector('.save-note-btn').onclick = () => {
        const val = modal.querySelector('#cp-notes-area').value.trim();
        const isNext = modal.querySelector('#note-next-class-cb').checked;
        let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
        const currentWeekEl = document.querySelector('.week.current');
        const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 1;

        // 1. Очищаем старые ключи текущей пары
        delete notesData.specific[pairId];

        // 2. Поиск следующего занятия
        let nextInfo = { found: false };

        if (val && isNext) {
            // А. Ищем позже на этой же неделе
            for (let i = currentIndex + 1; i < allRowsArray.length; i++) {
                const r = allRowsArray[i];
                const dCont = r.querySelector('.pair_info .dis');
                const tEl = dCont ? (dCont.querySelector('a') || dCont) : null;
                if (tEl) {
                    let cleanRSubj = tEl.cloneNode(true);
                    cleanRSubj.querySelectorAll('.material-icons, .note-btn-wrapper, .delete-custom-pair-btn').forEach(el => el.remove());
                    if (cleanRSubj.textContent.trim().toLowerCase() === cleanSubjectName.toLowerCase()) {
                        const dD = r.closest('.day')?.querySelector('.day-date');
                        const dStr = dD ? dD.textContent.trim() : 'UnknownDate';
                        const nTd = r.querySelector('.pair_num');
                        let rNum = "";
                        if (nTd) {
                            Array.from(nTd.childNodes).forEach(n => {
                                if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) rNum = n.nodeValue.trim();
                            });
                        }
                        const tMatch = r.querySelector('.eval')?.textContent.match(/\d{1,2}:\d{2}/);
                        nextInfo = {
                            found: true,
                            week: currentWeek,
                            dayName: r.closest('.day')?.querySelector('.day-name')?.textContent.trim() || '',
                            time: tMatch ? tMatch[0] : '08:00',
                            dateIso: parseDayDateStrToISO(dStr),
                            pairId: `${dStr}_${rNum || '1 пара'}_${cleanSubjectName}`
                        };
                        break;
                    }
                }
            }

            // Б. Если на этой неделе больше нет — ищем в сохраненных будущих неделях и двухнедельных парах
            if (!nextInfo.found) {
                let allCached = JSON.parse(localStorage.getItem('etis_cached_weeks_schedule_v1') || '{}');
                const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
                const now = new Date();
                const diffToMon = now.getDay() === 0 ? -6 : 1 - now.getDay();
                const calendarMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
                const actualW = parseInt(localStorage.getItem('etis_actual_week') || currentWeek, 10);
                const pad = (n) => String(n).padStart(2, '0');

                for (let w = currentWeek + 1; w <= currentWeek + 8; w++) {
                    const weekPairs = allCached[w] || [];
                    for (const p of weekPairs) {
                        if (p.subject.toLowerCase() === cleanSubjectName.toLowerCase()) {
                            const dIdx = daysMap.indexOf(p.dayName);
                            const dayOffset = dIdx !== -1 ? (dIdx === 0 ? 6 : dIdx - 1) : 0;
                            const targetDate = new Date(calendarMon.getFullYear(), calendarMon.getMonth(), calendarMon.getDate() + ((w - actualW) * 7) + dayOffset);
                            const monthsGen = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                            const dFormatted = `${targetDate.getDate()} ${monthsGen[targetDate.getMonth()]}`;

                            nextInfo = {
                                found: true,
                                week: w,
                                dayName: p.dayName,
                                time: p.startTime || '08:00',
                                dateIso: `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`,
                                pairId: `${dFormatted}_${p.rNum || '1 пара'}_${cleanSubjectName}`
                            };
                            break;
                        }
                    }
                    if (nextInfo.found) break;

                    // Проверка кастомных двухнедельных пар
                    const cpList = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                    for (const cp of cpList) {
                        if (cp.subject?.toLowerCase() === cleanSubjectName.toLowerCase()) {
                            let fallsOnW = cp.recurrence === 'every' || (cp.recurrence === 'biweekly' && ((w % 2) === (cp.addedWeek % 2)));
                            if (fallsOnW) {
                                const dIdx = daysMap.indexOf(cp.dayName);
                                const dayOffset = dIdx !== -1 ? (dIdx === 0 ? 6 : dIdx - 1) : 0;
                                const targetDate = new Date(calendarMon.getFullYear(), calendarMon.getMonth(), calendarMon.getDate() + ((w - actualW) * 7) + dayOffset);
                                const monthsGen = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                                const dFormatted = `${targetDate.getDate()} ${monthsGen[targetDate.getMonth()]}`;

                                nextInfo = {
                                    found: true,
                                    week: w,
                                    dayName: cp.dayName,
                                    time: cp.startTime || '08:00',
                                    dateIso: `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`,
                                    pairId: `${dFormatted}_1 пара_${cleanSubjectName}`
                                };
                                break;
                            }
                        }
                    }
                    if (nextInfo.found) break;
                }
            }

            if (nextInfo.found) {
                notesData.specific[nextInfo.pairId] = val;
            } else {
                // В сохраненных неделях пары нет — ставим плавающую привязку
                if (!notesData.next_unbound) notesData.next_unbound = {};
                notesData.next_unbound[cleanSubjectName] = { text: val, week: currentWeek };
            }
        } else if (val) {
            notesData.specific[pairId] = val;
        } else {
            // Если заметка очищена/удалена — удаляем плавающую запись
            if (notesData.next_unbound) delete notesData.next_unbound[cleanSubjectName];
        }

        saveSyncData('etis_subject_notes_v2', JSON.stringify(notesData));

        // --- Синхронизация с Дневником ---
        const taskDetailsEl = modal.querySelector('#cp-task-details-area');
        const taskDetails = taskDetailsEl ? taskDetailsEl.value.trim() : '';
        let diaryTasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
        const rowDateIso = parseDayDateStrToISO(dayDateStr);

        // Полное удаление старой привязки из Дневника
        diaryTasks = diaryTasks.filter(t => {
            if (t.pairId === pairId) return false;
            if (nextInfo.found && t.pairId === nextInfo.pairId) return false;
            if (!val) {
                const cleanTSubj = (t.subject || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
                const cleanRSubj = cleanSubjectName.replace(/\(.*?\)/g, '').trim().toLowerCase();
                if (cleanTSubj === cleanRSubj || cleanTSubj.includes(cleanRSubj) || cleanRSubj.includes(cleanTSubj)) {
                    if (t.isFloatingNext) return false;
                    if (t.deadlineDate === rowDateIso) return false;
                    if (currentNote && t.title?.trim().toLowerCase() === currentNote.trim().toLowerCase()) return false;
                }
            }
            return true;
        });

        if (val) {
            if (isNext) {
                if (nextInfo.found) {
                    diaryTasks.push({
                        id: 'diary_' + Date.now(),
                        pairId: nextInfo.pairId,
                        subject: cleanSubjectName,
                        title: val,
                        details: taskDetails,
                        deadlineDate: nextInfo.dateIso,
                        deadlineTime: nextInfo.time,
                        week: nextInfo.week,
                        dayName: nextInfo.dayName,
                        isFloatingNext: false,
                        completed: false,
                        completedAt: null
                    });
                } else {
                    // Не найдено в сохраненных неделях -> создаем задачу "К следующей паре"
                    diaryTasks.push({
                        id: 'diary_' + Date.now(),
                        pairId: null,
                        subject: cleanSubjectName,
                        title: val,
                        details: taskDetails,
                        deadlineDate: null,
                        deadlineTime: null,
                        isFloatingNext: true,
                        week: null,
                        dayName: null,
                        completed: false,
                        completedAt: null
                    });
                }
            } else {
                const { startDate } = getPairDateTime(dayDateStr, startVal);
                const pad = (n) => String(n).padStart(2, '0');
                diaryTasks.push({
                    id: 'diary_' + Date.now(),
                    pairId: pairId,
                    subject: cleanSubjectName,
                    title: val,
                    details: taskDetails,
                    deadlineDate: `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`,
                    deadlineTime: startVal || '08:00',
                    week: currentWeek,
                    dayName: row.closest('.day')?.querySelector('.day-name')?.textContent.trim() || '',
                    isFloatingNext: false,
                    completed: false,
                    completedAt: null
                });
            }
        }

        saveSyncData('etis_diary_tasks_v1', JSON.stringify(diaryTasks));
        closeModal();
        if (typeof window.renderNotes === 'function') window.renderNotes();
    };

    // Обработчик кнопки «Удалить»
    const clearNoteBtn = modal.querySelector('.clear-note-btn');
    if (clearNoteBtn) {
        clearNoteBtn.onclick = () => {
            const notesArea = modal.querySelector('#cp-notes-area');
            if (notesArea) notesArea.value = '';
            const taskDetailsArea = modal.querySelector('#cp-task-details-area');
            if (taskDetailsArea) taskDetailsArea.value = '';
            const nextCb = modal.querySelector('#note-next-class-cb');
            if (nextCb) nextCb.checked = false;
            modal.querySelector('.save-note-btn').click();
        };
    }

    // Обработчик кнопки «Добавить» во вкладке «Напоминание»
    const reminderBtn = modal.querySelector('.submit-reminder-btn');
    if (reminderBtn) {
        reminderBtn.onclick = () => {
            const platform = modal.querySelector('#ics-platform')?.value || 'apple_ics';
            const offsetVal = modal.querySelector('#ics-alarm-offset')?.value;
            const alarmMinutes = offsetVal !== undefined ? parseInt(offsetVal, 10) : 60;
            const includeNotes = modal.querySelector('#ics-include-notes')?.checked || false;

            // Расчет времени и формирование описания
            const { startDate, endDate } = getPairDateTime(dayDateStr, startVal);
            const description = (includeNotes && currentNote) ? currentNote : '';

            // Маршрутизация по выбранной платформе
            if (platform === 'google') {
                openGoogleCalendarWeb({
                    title: cleanSubjectName,
                    location: currentLoc,
                    description: description,
                    startDate,
                    endDate
                });
            } else if (platform === 'yandex') {
                openYandexCalendarWeb({
                    title: cleanSubjectName,
                    location: currentLoc,
                    description: description,
                    startDate,
                    endDate
                });
            } else {
                // Apple Календарь / Прямой файл .ics
                const icsContent = generatePairICS({
                    title: cleanSubjectName,
                    location: currentLoc,
                    teacher: currentTeacher,
                    description: description,
                    startDate,
                    endDate,
                    alarmMinutes
                });

                if (isIOS || isMacSafari) {
                    openDirectAppleCalendar(icsContent);
                } else {
                    downloadICSFile(`${cleanSubjectName}.ics`, icsContent);
                }
            }

            if (window.showEtisPush) {
                window.showEtisPush(
                    'Напоминание создано',
                    cleanSubjectName,
                    'Событие добавлено в календарь',
                    'success',
                    'alarm_on',
                    null,
                    null,
                    false
                );
            }

            closeModal();
        };
    }

    // Удаление кастомной пары
    const deleteCpBtn = modal.querySelector('.delete-cp-btn-modal');
    if (deleteCpBtn) {
        deleteCpBtn.onclick = () => {
            if (confirm(`Удалить пару "${cleanSubjectName}"?`)) {
                const customId = row.getAttribute('data-custom-id');
                let cp = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                cp = cp.filter(p => p.id !== customId);
                saveSyncData('etis_custom_pairs_v1', JSON.stringify(cp));
                closeModal();

                if (window.location.href.includes('timetable')) {
                    document.querySelectorAll('.custom-pair-row').forEach(el => el.remove());
                    if (typeof window.injectCustomPairs === 'function') window.injectCustomPairs();
                    if (typeof window.renderNotes === 'function') window.renderNotes();
                    if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                    if (typeof window.applyDimming === 'function') window.applyDimming();
                }
            }
        };
    }

    // Сохранение настроек и времени
    const saveEditBtn = modal.querySelector('.save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.onclick = () => {
            const newTitle = modal.querySelector('#cp-subject-edit').value.trim();
            const newLoc = modal.querySelector('#cp-aud-edit').value.trim();
            const newTeacher = modal.querySelector('#cp-teacher-edit').value.trim();
            const newType = modal.querySelector('#cp-type-edit').value.trim();
            const newStartTime = modal.querySelector('#cp-start-edit')?.value.trim() || startVal;
            const newEndTime = modal.querySelector('#cp-end-edit')?.value.trim() || endVal;

            if (!newTitle) return alert('Введите название предмета!');

            if (isPureCustom) {
                let customPairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                const customId = row.getAttribute('data-custom-id');
                const cpIndex = customPairs.findIndex(p => p.id === customId);
                if (cpIndex > -1) {
                    customPairs[cpIndex].subject = newTitle;
                    customPairs[cpIndex].aud = newLoc;
                    customPairs[cpIndex].teacher = newTeacher;
                    customPairs[cpIndex].type = newType;
                    customPairs[cpIndex].startTime = newStartTime;
                    customPairs[cpIndex].endTime = newEndTime;
                    saveSyncData('etis_custom_pairs_v1', JSON.stringify(customPairs));

                    closeModal();

                    if (window.location.href.includes('timetable') || (typeof pageCtx.isDemoActive !== 'undefined' && pageCtx.isDemoActive)) {
                        document.querySelectorAll('.custom-pair-row').forEach(el => el.remove());
                        if (typeof window.injectCustomPairs === 'function') window.injectCustomPairs();
                        if (typeof window.renderNotes === 'function') window.renderNotes();
                        if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                        if (typeof window.applyDimming === 'function') window.applyDimming();
                        if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                    }
                }
            } else {
                const applyAll = document.getElementById('ext-apply-all')?.checked || false;
                const applyDayTimeSeries = document.getElementById('ext-apply-day-time-series')?.checked || false;
                const applyTimeSeries = document.getElementById('ext-apply-time-series')?.checked || false;

                let overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');

                let timeKey = rawPairNum;
                let dateKey = dayDateStr;
                if (isExternal) {
                    timeKey = row.getAttribute('data-ext-time');
                    dateKey = row.getAttribute('data-ext-date');
                }

                const origStartTime = row.getAttribute('data-orig-start-time') || startVal;
                const origDayName = row.closest('.day')?.getAttribute('data-orig-day-name') ||
                                    row.closest('.day')?.querySelector('.day-name')?.textContent.trim() || '';

                const singleKey = `SINGLE_${dateKey}_${timeKey}_${origSubject}`;
                const seriesKey = `SERIES_ALL_${origSubject}`;
                const timeSeriesKey = `SERIES_TIME_${origStartTime}_${origSubject}`;
                const dayTimeSeriesKey = `SERIES_DAY_TIME_${origDayName}_${origStartTime}_${origSubject}`;

                const overrideData = {
                    title: newTitle,
                    loc: newLoc,
                    teacher: newTeacher,
                    type: newType,
                    timeStart: newStartTime,
                    timeEnd: newEndTime
                };

                overrides[singleKey] = {
                    ...overrideData,
                    applyAll,
                    applyDayTimeSeries,
                    applyTimeSeries
                };

                if (applyAll) {
                    overrides[seriesKey] = {
                        title: newTitle,
                        loc: newLoc,
                        teacher: newTeacher,
                        type: newType
                    };
                } else {
                    delete overrides[seriesKey];
                }

                if (applyDayTimeSeries) {
                    overrides[dayTimeSeriesKey] = overrideData;
                } else {
                    delete overrides[dayTimeSeriesKey];
                }

                if (applyTimeSeries) {
                    overrides[timeSeriesKey] = overrideData;
                } else {
                    delete overrides[timeSeriesKey];
                }

                saveSyncData('etis_ext_overrides', JSON.stringify(overrides));

                closeModal();

                // Мгновенное бесшовное обновление интерфейса без сбоя сети
                if (window.location.href.includes('timetable') || (typeof pageCtx.isDemoActive !== 'undefined' && pageCtx.isDemoActive)) {
                    if (typeof window.renderNotes === 'function') window.renderNotes();
                    if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                    if (typeof window.applyDimming === 'function') window.applyDimming();
                    if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                } else {
                    setTimeout(() => window.location.reload(), 150);
                }
            }
        };
    }

    // Сброс настроек
    const resetEditBtn = modal.querySelector('.reset-edit-btn');
    if (resetEditBtn) {
        resetEditBtn.onclick = () => {
            let overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
            let timeKey = isExternal ? row.getAttribute('data-ext-time') : rawPairNum;
            let dateKey = isExternal ? row.getAttribute('data-ext-date') : dayDateStr;
            const origStartTime = row.getAttribute('data-orig-start-time') || startVal;
            const origDayName = row.closest('.day')?.getAttribute('data-orig-day-name') ||
                                row.closest('.day')?.querySelector('.day-name')?.textContent.trim() || '';

            const singleKey = `SINGLE_${dateKey}_${timeKey}_${origSubject}`;
            const seriesKey = `SERIES_ALL_${origSubject}`;
            const timeSeriesKey = `SERIES_TIME_${origStartTime}_${origSubject}`;
            const dayTimeSeriesKey = `SERIES_DAY_TIME_${origDayName}_${origStartTime}_${origSubject}`;

            delete overrides[singleKey];
            delete overrides[seriesKey];
            delete overrides[timeSeriesKey];
            delete overrides[dayTimeSeriesKey];

            saveSyncData('etis_ext_overrides', JSON.stringify(overrides));
            closeModal();

            // Мгновенный пересчет и сброс вида без перезагрузки страницы
            if (typeof window.renderNotes === 'function') window.renderNotes();
            if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            if (typeof window.applyDimming === 'function') window.applyDimming();
            if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
        };
    }

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.classList.add('modal-open-body');
}
