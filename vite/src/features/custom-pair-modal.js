import { saveSyncData } from '../sync/data.js';
import { declineSubjectDative } from '../utils/declension.ts';

// Вспомогательное окно выбора дня для объединенных выходных
export function showChooseDayModal(daysList, onSelect) {
    let overlay = document.getElementById('etis-choose-day-overlay');
    let modal = document.getElementById('etis-choose-day-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-choose-day-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-choose-day-modal';
        modal.className = 'analytics-modal';
        document.body.appendChild(modal);
    }

    const closeModal = () => {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open-body');
    };
    overlay.onclick = closeModal;

    modal.innerHTML = `
                    <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2.4rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                        <span class="ui-dialog-title" style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary);">Выберите день</span>
                        <button class="close-choose-day" style="background:none; border:none; cursor:pointer; font-size:0; padding:0; display:flex; align-items:center;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                    </div>
                    <div class="ui-dialog-content" style="padding: 2rem 2.4rem 2.4rem 2.4rem;">
                        <div style="font-size: 1.3rem; color: var(--color-text-secondary); margin-bottom: 1.6rem; text-align: left; line-height: 1.5;">
                            Эта карточка объединяет несколько дней без занятий. Выберите день, в который нужно добавить пару:
                        </div>
                        <div class="ios-settings-group" style="margin-bottom: 0 !important;">
                            ${daysList.map(d => `
                                <div class="ios-settings-row select-day-option" data-day="${d}" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <span class="material-icons" style="color: var(--color-accent); font-size: 2.2rem;">calendar_today</span>
                                        <span style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-primary); text-transform: capitalize;">${d}</span>
                                    </div>
                                    <span class="material-icons chevron" style="color: var(--color-text-secondary);">chevron_right</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

    modal.querySelector('.close-choose-day').onclick = closeModal;

    modal.querySelectorAll('.select-day-option').forEach(btn => {
        btn.onclick = () => {
            const chosenDay = btn.getAttribute('data-day');
            closeModal();
            setTimeout(() => {
                onSelect(chosenDay);
            }, 120);
        };
    });

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}

// Модальное окно создания/редактирования пары
export function openCustomPairModal(dayName, isFromToolbar = false, existingPair = null) {
    const dispSubject = existingPair ? (existingPair.subject || '') : '';

    // Проверка объединенных выходных дней
    if (!existingPair && dayName) {
        let mergedDays = null;
        const dayBlock = Array.from(document.querySelectorAll('.span9 .day')).find(d => {
            const nameEl = d.querySelector('.day-name');
            return nameEl && nameEl.textContent.trim().toLowerCase() === dayName.toLowerCase();
        });

        if (dayBlock && dayBlock.getAttribute('data-merged-days')) {
            mergedDays = dayBlock.getAttribute('data-merged-days').split(',').map(s => s.trim()).filter(Boolean);
        } else if (/[-–—]/.test(dayName)) {
            const parts = dayName.split(/[-–—]/).map(s => s.trim());
            const daysList = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
            const startIdx = daysList.findIndex(d => d.toLowerCase() === parts[0].toLowerCase());
            const endIdx = daysList.findIndex(d => d.toLowerCase() === parts[parts.length - 1].toLowerCase());
            if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
                mergedDays = daysList.slice(startIdx, endIdx + 1);
            } else {
                mergedDays = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
            }
        }

        if (mergedDays && mergedDays.length > 1) {
            showChooseDayModal(mergedDays, (selectedDay) => {
                openCustomPairModal(selectedDay, isFromToolbar, null);
            });
            return;
        }
    }

    let overlay = document.querySelector('.analytics-overlay');
    let modal = document.querySelector('.analytics-modal');

    if (!overlay || !modal) {
        overlay = document.createElement('div');
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);

        modal = document.createElement('div');
        modal.className = 'analytics-modal';
        document.body.appendChild(modal);
    }

    const getAccusativeDay = (d) => {
        if (!d) return '';
        const map = {
            'понедельник': 'понедельник',
            'вторник': 'вторник',
            'среда': 'среду',
            'четверг': 'четверг',
            'пятница': 'пятницу',
            'суббота': 'субботу',
            'воскресенье': 'воскресенье'
        };
        return map[d.trim().toLowerCase()] || d.toLowerCase();
    };

    const isAnnouncementEvent = !!(existingPair && existingPair.msgHash);

    const title = isAnnouncementEvent
        ? `Редактировать событие`
        : (existingPair ? `Редактировать пару` : (isFromToolbar ? `Добавить пару` : `Добавить на ${getAccusativeDay(dayName)}`));

    const pairId = existingPair ? existingPair.id : ('cp_' + Date.now());

    let defStart = existingPair ? existingPair.startTime : "08:00";
    let defEnd = existingPair ? existingPair.endTime : "09:30";

    const daysArr = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const todayNamePlaceholder = daysArr[new Date().getDay()];

    const timetableSubjects = [];
    document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
        const disA = row.querySelector('.pair_info .dis a') || row.querySelector('.pair_info .dis');
        if (disA) {
            let s = disA.textContent.replace(/\(.*?\)/g, '').replace(/[«»"']/g, '').replace(/[\s\xa0\u200B-\u200D\uFEFF]+/g, ' ').trim();
            if (s && !timetableSubjects.includes(s) && !s.toLowerCase().includes('консультация') && !s.toLowerCase().includes('выходной') && s.length < 50) {
                timetableSubjects.push(s);
            }
        }
    });

    const daysAccMap = {
        0: 'воскресенье', 1: 'понедельник', 2: 'вторник', 3: 'среду',
        4: 'четверг', 5: 'пятницу', 6: 'субботу'
    };
    const currentAccDay = daysAccMap[new Date().getDay()] || 'понедельник';

    const raw1 = timetableSubjects[0] || 'Математический анализ';
    const raw2 = timetableSubjects[1] || 'Программирование';
    const raw3 = timetableSubjects[2] || 'Иностранный язык в сфере IT';
    const raw4 = timetableSubjects[3] || 'Физика';

    const s1 = declineSubjectDative(raw1);
    const s2 = declineSubjectDative(raw2);
    const s3 = declineSubjectDative(raw3);
    const s4 = declineSubjectDative(raw4);

    const placeholders = isFromToolbar ? [
        `Лабораторная по ${s3} в 17:00 в ${currentAccDay}...`,
        `Практика по ${s1} в 13:30 в 413/8...`,
        `Физ-ра в 9:45...`,
        `Лекция по ${s2} завтра в 11:30...`,
        `Консультация по ${s4} в пятницу в 15:15...`
    ] : [
        `Лабораторная по ${s3} в 17:00...`,
        `Практика по ${s1} в 13:30 в 413/8...`,
        `Физ-ра в 9:45...`,
        `Лекция по ${s2} в 11:30...`,
        `Консультация по ${s4} в 15:15...`
    ];

    let placeholderTimer = null;

    modal.innerHTML = `
                    <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                        <span class="ui-dialog-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%;">${title}</span>
                        <button class="close-modal" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                    </div>
                    <div class="ui-dialog-content" style="padding: 1.6rem 2rem 3rem 2rem;">
                        ${(existingPair && !isAnnouncementEvent) ? `
                        <div class="sync-tabs">
                            <button class="sync-tab" data-tab="notes">Заметки / ДЗ</button>
                            <button class="sync-tab active" data-tab="edit">Настройки пары</button>
                        </div>
                        <div class="tab-content" id="tab-notes" style="padding: 6px 4px;">
                            <textarea class="note-modal-textarea" id="cp-notes-area" placeholder="Что нужно сделать?">${existingPair.notes || ''}</textarea>
                            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                                ${existingPair.notes ? `<button class="answer-btn-custom clear-cp-note-btn" style="background: var(--color-red) !important; color: #fff !important; border: none !important; box-shadow: none !important;">Удалить</button>` : ''}
                                <button class="answer-btn-custom save-cp-note-btn" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important;">Сохранить заметку</button>
                            </div>
                        </div>
                        ` : ''}

                        <div class="tab-content active" id="tab-edit" style="padding: 6px 4px;">
                            ${!existingPair ? `
                            <div style="display: flex; align-items: center; position: relative; margin-bottom: 1.6rem;">
                                <span class="material-icons" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-accent); font-size: 22px; pointer-events: none; z-index: 2;">auto_awesome</span>
                                <input type="text" id="cp-smart-add" placeholder="${placeholders[0]}" style="width: 100%; padding: 1.2rem 1.6rem 1.2rem 44px !important; margin: 0 !important; box-sizing: border-box; background: var(--color-card) !important; border: 1px solid var(--color-table-border) !important; border-radius: var(--radius-medium) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important; box-shadow: var(--shadow-main) !important;">
                            </div>
                            ` : ''}

                            <!-- Название предмета -->
                            <div class="custom-pair-input-group">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">menu_book</span>
                                    <input type="text" id="cp-subject" placeholder="Название предмета *" value="${existingPair ? existingPair.subject : (dispSubject || '')}">
                                </div>
                            </div>

                            <!-- День недели / Время -->
                            <div class="custom-pair-input-group">
                                ${isFromToolbar ? `
                                    <div class="cp-input-wrap" style="flex: 0.85;">
                                        <span class="material-icons">calendar_today</span>
                                        <input type="text" id="cp-date-input" placeholder="${todayNamePlaceholder}" value="${existingPair ? existingPair.dayName : ''}">
                                    </div>
                                ` : `
                                    <input type="hidden" id="cp-date-input" value="${dayName}">
                                `}
                                <div class="cp-input-wrap">
                                    <span class="material-icons">schedule</span>
                                    <input type="time" id="cp-start" value="${defStart}" required title="Время начала">
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">flag</span>
                                    <input type="time" id="cp-end" value="${defEnd}" required title="Время окончания">
                                </div>
                            </div>

                            <!-- Тип пары и повторение -->
                            <div class="custom-pair-input-group">
                                <div class="cp-input-wrap" style="flex: 0.85;">
                                    <span class="material-icons">category</span>
                                    <select id="cp-type">
                                        <option value="лек" ${existingPair?.type === 'лек' ? 'selected' : ''}>Лекция</option>
                                        <option value="практ" ${existingPair?.type === 'практ' ? 'selected' : ''}>Практика</option>
                                        <option value="лаб" ${existingPair?.type === 'лаб' ? 'selected' : ''}>Лабораторная</option>
                                        <option value="экз" ${existingPair?.type === 'экз' ? 'selected' : ''}>Экзамен</option>
                                        <option value="зач" ${existingPair?.type === 'зач' ? 'selected' : ''}>Зачет</option>
                                        <option value="конс" ${existingPair?.type === 'конс' ? 'selected' : ''}>Консультация</option>
                                        <option value="лич" ${existingPair?.type === 'лич' || !existingPair?.type ? 'selected' : ''}>Личное</option>
                                    </select>
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">event_repeat</span>
                                    <select id="cp-recurrence">
                                        <option value="once" ${existingPair?.recurrence === 'once' ? 'selected' : ''}>Эта неделя</option>
                                        <option value="every" ${existingPair?.recurrence === 'every' ? 'selected' : ''}>Каждую неделю</option>
                                        <option value="biweekly" ${existingPair?.recurrence === 'biweekly' ? 'selected' : ''}>Раз в 2 недели</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Аудитория и преподаватель -->
                            <div class="custom-pair-input-group">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">place</span>
                                    <input type="text" id="cp-aud" placeholder="Аудитория / Ссылка" value="${existingPair ? existingPair.aud : ''}">
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">person</span>
                                    <input type="text" id="cp-teacher" placeholder="Преподаватель" value="${existingPair ? existingPair.teacher : ''}">
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
                                <button class="answer-btn-custom save-cp-btn">${existingPair ? 'Сохранить' : 'Добавить'}</button>
                            </div>
                        </div>
                    </div>
                `;

    const closeModal = () => {
        if (placeholderTimer) clearInterval(placeholderTimer);
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open-body');
    };
    overlay.onclick = closeModal;
    modal.querySelector('.close-modal').onclick = closeModal;

    const smartInput = modal.querySelector('#cp-smart-add');
    const subjectInput = modal.querySelector('#cp-subject');
    const dateInput = modal.querySelector('#cp-date-input');
    const timeStartInput = modal.querySelector('#cp-start');
    const timeEndInput = modal.querySelector('#cp-end');
    const typeInput = modal.querySelector('#cp-type');
    const audInput = modal.querySelector('#cp-aud');
    const teacherInput = modal.querySelector('#cp-teacher');

    if (smartInput) {
        let pIdx = 0;
        placeholderTimer = setInterval(() => {
            pIdx = (pIdx + 1) % placeholders.length;
            smartInput.placeholder = placeholders[pIdx];
        }, 2500);

        smartInput.addEventListener('input', (e) => {
            let text = " " + e.target.value + " ";
            if (!text.trim()) return;
            let extractedDate = "";
            let m1 = text.match(/\s(\d{1,2}\.\d{1,2}(?:\.\d{2,4})?)\s/);
            let m2 = text.match(/\s(\d{1,2}\s+(?:янв|фев|мар|апр|ма[яй]|июн|июл|авг|сен|окт|ноя|дек)[а-я]*)\s/i);
            let m3 = text.match(/\s(?:в\s|во\s)?(понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье)\s/i);
            let m4 = text.match(/\s(сегодня|завтра|послезавтра)\s/i);
            if (m1) { extractedDate = m1[1]; text = text.replace(m1[0], ' '); }
            else if (m2) { extractedDate = m2[1]; text = text.replace(m2[0], ' '); }
            else if (m3) { extractedDate = m3[1]; text = text.replace(m3[0], ' '); }
            else if (m4) { extractedDate = m4[1]; text = text.replace(m4[0], ' '); }
            if (extractedDate && isFromToolbar) {
                let cleanDate = extractedDate.charAt(0).toUpperCase() + extractedDate.slice(1);
                cleanDate = cleanDate.replace(/среду/i, 'Среда').replace(/пятницу/i, 'Пятница').replace(/субботу/i, 'Суббота');
                dateInput.value = cleanDate;
            }
            let timeParsed = false;
            let naturalTimeMatch = text.match(/\s(?:в|на|к)?\s*(\d{1,2})\s+(утра|вечера|дня|ночи|часов|час|часа)\s/i);
            if (naturalTimeMatch) {
                let h = parseInt(naturalTimeMatch[1], 10);
                const mod = naturalTimeMatch[2].toLowerCase();
                if (mod.includes('вечер') && h < 12) h += 12;
                else if (mod.includes('дня') && h < 12 && h >= 1) h += 12;
                else if (mod.includes('ноч') && h === 12) h = 0;
                timeStartInput.value = `${String(h).padStart(2, '0')}:00`;
                let totalM = h * 60 + 90;
                timeEndInput.value = `${String(Math.floor(totalM/60)%24).padStart(2,'0')}:${String(totalM%60).padStart(2,'0')}`;
                text = text.replace(naturalTimeMatch[0], ' ');
                timeParsed = true;
            }
            if (!timeParsed) {
                let strictTimeMatch = text.match(/\s(?:в|на|к)?\s*(\d{1,2})[:.-](\d{2})\s/i);
                if (strictTimeMatch) {
                    let h = strictTimeMatch[1].padStart(2, '0');
                    let m = strictTimeMatch[2].padStart(2, '0');
                    timeStartInput.value = `${h}:${m}`;
                    let totalM = parseInt(h)*60 + parseInt(m) + 90;
                    timeEndInput.value = `${String(Math.floor(totalM/60)%24).padStart(2,'0')}:${String(totalM%60).padStart(2,'0')}`;
                    text = text.replace(strictTimeMatch[0], ' ');
                } else if (text.match(/\sпосле обеда\s/i)) {
                    timeStartInput.value = '13:30'; timeEndInput.value = '15:00';
                    text = text.replace(/\sпосле обеда\s/i, ' ');
                }
            }
            let typeMatch = text.match(/\s(лекци[яию]|лек\b|практик[ауи]|практ\b|лабораторн[аяую]|лаба\b|лаб\b)\s/i);
            if (typeMatch) {
                let t = typeMatch[1].toLowerCase();
                if (t.startsWith('лек')) typeInput.value = 'лек';
                if (t.startsWith('практ')) typeInput.value = 'практ';
                if (t.startsWith('лаб')) typeInput.value = 'лаб';
                text = text.replace(typeMatch[0], ' ');
            }
            let aud = '', bldg = '';
            let matchLocA = text.match(/\s(?:в|на)?\s*(\d+)\s*корпус[еа]?\s*(?:в\s+)?(?:ауд\.?|каб\.?|кабинет[е]?|аудитори[ия])?\s*(\d+[a-zа-я]?)\s*(?:кабинет[е]?|аудитори[ия])?\s/i);
            if (matchLocA) { bldg = matchLocA[1]; aud = matchLocA[2]; text = text.replace(matchLocA[0], ' '); }
            else {
                let matchLocB = text.match(/\s(?:(?:в\s+)?(?:ауд\.?|каб\.?|кабинет[е]?|аудитори[ия])?\s*)?(\d+[a-zа-я]?)\s*(?:кабинет[е]?|аудитори[ия])?\s*(?:в\s+)?(\d+)\s*корпус[еа]\s/i);
                if (matchLocB) { aud = matchLocB[1]; bldg = matchLocB[2]; text = text.replace(matchLocB[0], ' '); }
                else {
                    let matchLocC = text.match(/\s(\d+[a-zа-я]?)\s*[\/\\]\s*(\d+)\s/i);
                    if (matchLocC) { aud = matchLocC[1]; bldg = matchLocC[2]; text = text.replace(matchLocC[0], ' '); }
                    else {
                        let matchLocD = text.match(/\s(?:(?:в\s+)?(?:ауд\.?|каб\.?|кабинет[е]?|аудитори[ия])\s*(\d+[a-zа-я]?))|(?:(?:в\s+)?(\d+[a-zа-я]?)\s*(?:каб\.?|кабинет[е]?|ауд\.?|аудитори[ия]))\s/i);
                        if (matchLocD) { aud = matchLocD[1] || matchLocD[2]; text = text.replace(matchLocD[0], ' '); }
                    }
                }
            }
            if (aud) audInput.value = bldg ? `${aud}/${bldg}` : aud;
            let subject = text.replace(/\s+/g, ' ').trim();
            subject = subject.replace(/^(по|в|на|с)\s+/i, '').replace(/\s+(по|в|на|с)$/i, '').trim();
            if (subject.length > 0) subject = subject.charAt(0).toUpperCase() + subject.slice(1);
            subjectInput.value = subject;
        });
    }

    timeStartInput.addEventListener('change', (e) => {
        if (e.target.value) {
            let [hours, minutes] = e.target.value.split(':').map(Number);
            minutes += 90; hours += Math.floor(minutes / 60); minutes = minutes % 60; hours = hours % 24;
            timeEndInput.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    });

    const internalResolveDate = (inputStr) => {
        inputStr = inputStr.trim().toLowerCase();
        const now = new Date(); now.setHours(0,0,0,0);
        let targetDate = null;
        let m = inputStr.match(/^(\d{1,2})\.(\d{1,2})/);
        if (m) targetDate = new Date(now.getFullYear(), parseInt(m[2], 10)-1, parseInt(m[1], 10));
        else {
            m = inputStr.match(/^(\d{1,2})\s+(янв|фев|мар|апр|ма|июн|июл|авг|сен|окт|ноя|дек)/);
            if (m) {
                const months = { 'янв':0, 'фев':1, 'мар':2, 'апр':3, 'ма':4, 'июн':5, 'июл':6, 'авг':7, 'сен':8, 'окт':9, 'ноя':10, 'дек':11 };
                targetDate = new Date(now.getFullYear(), months[m[2]], parseInt(m[1], 10));
            }
        }
        const actualWeek = parseInt(localStorage.getItem('etis_actual_week') || '1', 10);
        if (targetDate) {
            if (targetDate < now && (now.getMonth() - targetDate.getMonth()) > 6) targetDate.setFullYear(now.getFullYear() + 1);
            const dArr = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
            const getMon = (d) => { const nd = new Date(d); nd.setDate(nd.getDate() - (nd.getDay() || 7) + 1); return nd.setHours(0,0,0,0); };
            const weekDiff = Math.round((getMon(targetDate) - getMon(now)) / (7 * 24 * 3600 * 1000));
            return { dayName: dArr[targetDate.getDay()], addedWeek: actualWeek + weekDiff };
        }
        const dMap = { 'понедельник': 'Понедельник', 'вторник': 'Вторник', 'сред': 'Среда', 'четверг': 'Четверг', 'пятниц': 'Пятница', 'суббот': 'Суббота', 'воскресенье': 'Воскресенье' };
        let foundDay = Object.keys(dMap).find(k => inputStr.startsWith(k));
        if (foundDay) return { dayName: dMap[foundDay], addedWeek: actualWeek };
        return { dayName: todayNamePlaceholder, addedWeek: actualWeek };
    };

    modal.querySelector('.save-cp-btn').onclick = () => {
        const subject = subjectInput.value.trim();
        if (!subject) return alert('Введите название предмета!');

        let finalDayName = existingPair ? existingPair.dayName : dayName;
        let finalAddedWeek = existingPair ? existingPair.addedWeek : parseInt(document.querySelector('.week.current')?.textContent.trim() || '1', 10);

        if (isFromToolbar) {
            const dateInputVal = dateInput.value.trim() || todayNamePlaceholder;
            const resolved = internalResolveDate(dateInputVal);
            finalDayName = resolved.dayName;
            finalAddedWeek = resolved.addedWeek;
        }

        const pair = {
            id: pairId,
            addedWeek: finalAddedWeek,
            dayName: finalDayName,
            subject: subject,
            startTime: timeStartInput.value,
            endTime: timeEndInput.value,
            type: typeInput.value,
            recurrence: modal.querySelector('#cp-recurrence').value,
            aud: audInput.value.trim() || '',
            teacher: teacherInput.value.trim() || '',
            ...(existingPair && existingPair.msgHash ? { msgHash: existingPair.msgHash } : {})
        };

        let cp = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
        if (existingPair) cp = cp.filter(p => p.id !== pairId);
        cp.push(pair);
        saveSyncData('etis_custom_pairs_v1', JSON.stringify(cp));

        closeModal();

        if (window.location.href.includes('timetable')) {
            document.querySelectorAll('.custom-pair-row').forEach(el => el.remove());
            if (typeof window.injectCustomPairs === 'function') window.injectCustomPairs();
            if (typeof window.renderNotes === 'function') window.renderNotes();
            if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            if (typeof window.applyDimming === 'function') window.applyDimming();
        }
    };

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.classList.add('modal-open-body');
    if (!existingPair) setTimeout(() => smartInput.focus(), 100);
}

// Экспорт функции открытия модального окна пары в глобальную область
export function exposeCustomPairModal() {
    window.openCustomPairModal = openCustomPairModal;
}
