import { saveSyncData } from '../sync/data.js';
import { returnToDrawer } from '../ui/drawer.js';

export function openDiaryModal(startView = window.innerWidth <= 960 ? 'menu' : 'tasks') {
    let overlay = document.getElementById('etis-diary-overlay');
    let modal = document.getElementById('etis-diary-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-diary-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-diary-modal';
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

    const daysArr = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const dayShortMap = {
        'Понедельник': 'Пн', 'Вторник': 'Вт', 'Среда': 'Ср',
        'Четверг': 'Чт', 'Пятница': 'Пт', 'Суббота': 'Сб', 'Воскресенье': 'Вс'
    };

    const now = new Date();
    const todayName = daysArr[now.getDay()];
    let selectedDay = daysArr[now.getDay() === 0 ? 1 : now.getDay()];

    const currentWeekEl = document.querySelector('.weeks .week.current');
    const actualWeekNum = parseInt(localStorage.getItem('etis_actual_week') || (currentWeekEl ? currentWeekEl.textContent.replace(/\D/g, '').trim() : '1'), 10);
    let selectedWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.replace(/\D/g, '').trim(), 10) : actualWeekNum;

    const getTotalWeeks = () => {
        const weekEls = document.querySelectorAll('.weeks .week');
        if (weekEls.length > 0) {
            let maxW = 18;
            weekEls.forEach(w => {
                const num = parseInt(w.textContent.replace(/\D/g, ''), 10);
                if (!isNaN(num) && num > maxW) maxW = num;
            });
            return maxW;
        }
        return 18;
    };
    const totalWeeks = getTotalWeeks();

    let editingTask = null;
    let editorOrigin = 'tasks';

    // Собираем предметы
    const getAvailableSubjects = () => {
        const subjs = new Map();

        // 1. Если открыта страница расписания — парсим живой DOM и сразу обновляем кэш
        const domRows = document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)');
        if (domRows.length > 0) {
            domRows.forEach(r => {
                const disA = r.querySelector('.pair_info .dis a') || r.querySelector('.pair_info .dis');
                const typeBadge = r.querySelector('.pair-type-badge');
                if (disA) {
                    let s = disA.textContent.replace(/\(.*?\)/g, '').replace(/[«»"']/g, '').trim();
                    let t = '';
                    if (typeBadge) {
                        const bClone = typeBadge.cloneNode(true);
                        bClone.querySelectorAll('.material-icons, button, .pair-important-btn').forEach(el => el.remove());
                        t = bClone.textContent.trim().toLowerCase();
                    }
                    if (t && t !== 'лич' && t !== 'конс' && t !== 'вых') s += ` (${t})`;
                    if (s && !s.toLowerCase().includes('выходной') && !s.toLowerCase().includes('консультация')) {
                        subjs.set(s.toLowerCase(), s);
                    }
                }
            });

            // Сохраняем спарсенные предметы в долгосрочный кэш
            if (subjs.size > 0) {
                try {
                    localStorage.setItem('etis_cached_timetable_subjects', JSON.stringify(Array.from(subjs.values())));
                } catch(e) {}
            }
        }

        // 2. Если мы на другой странице — читаем предметы из сохраненного кэша расписания
        try {
            const cachedSubjs = JSON.parse(localStorage.getItem('etis_cached_timetable_subjects') || '[]');
            cachedSubjs.forEach(s => {
                if (s) subjs.set(s.toLowerCase(), s);
            });
        } catch(e) {}

        // 3. Подстраховка: берем предметы из кэша оценок (там тоже список дисциплин семестра)
        try {
            const gradesData = JSON.parse(localStorage.getItem('etis_reborn_grades_snapshot_v3') || '{"grades":{}}');
            Object.values(gradesData.grades || {}).forEach(g => {
                if (g && g.subject) {
                    const clean = g.subject.replace(/\(.*?\)/g, '').replace(/[«»"']/g, '').trim();
                    if (clean && !subjs.has(clean.toLowerCase())) {
                        subjs.set(clean.toLowerCase(), clean);
                    }
                }
            });
        } catch(e) {}

        // 4. Подстраховка: если кэша предметов еще нет, парсим сохраненный оффлайн-HTML расписания
        if (subjs.size === 0) {
            try {
                const offlineHtml = localStorage.getItem('etis_offline_timetable_html');
                if (offlineHtml) {
                    const tmp = document.createElement('div');
                    tmp.innerHTML = offlineHtml;
                    tmp.querySelectorAll('.dis a, .dis').forEach(d => {
                        const s = d.textContent.replace(/\(.*?\)/g, '').replace(/[«»"']/g, '').trim();
                        if (s && !s.toLowerCase().includes('выходной') && !s.toLowerCase().includes('консультация')) {
                            subjs.set(s.toLowerCase(), s);
                        }
                    });
                }
            } catch(e) {}
        }

        // 5. Пользовательские пары
        const customPairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
        customPairs.forEach(p => { 
            if (p.subject) {
                let s = p.subject.trim();
                if (p.type && p.type !== 'лич' && p.type !== 'конс') s += ` (${p.type})`;
                subjs.set(s.toLowerCase(), s);
            }
        });

        // 6. Заметки к парам
        const notes = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
        Object.keys(notes.next_unbound || {}).forEach(s => subjs.set(s.toLowerCase(), s));

        return Array.from(subjs.values()).sort();
    };

    const getDeadlineCountdown = (dateStr, timeStr) => {
        const target = new Date(`${dateStr}T${timeStr || '23:59'}:00`);
        const diffMs = target - new Date();
        const isOverdue = diffMs < 0;
        const absDiff = Math.abs(diffMs);
        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return { text: `${isOverdue ? 'Просрочено на' : ''} ${days} дн.`.trim(), isOverdue };
        if (hours > 0) return { text: `${isOverdue ? 'Просрочено на' : ''} ${hours} ч.`.trim(), isOverdue };
        return { text: isOverdue ? 'Срок истек' : 'Меньше часа', isOverdue };
    };

    const getDateForWeekAndDay = (weekNum, dayName) => {
        const daysOrder = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
        const targetDayIdx = daysOrder.indexOf(dayName);
        const dayOffset = targetDayIdx !== -1 ? targetDayIdx : 0;
        const currentDay = now.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
        const weekDiff = weekNum - actualWeekNum;
        const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (weekDiff * 7) + dayOffset);
        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const dd = String(targetDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Генератор карточки задачи
    const generateTaskCardHtml = (t, viewMode = 'tasks') => {
        let footerInfoHtml = '';
        let footerIcon = 'event';
        let footerIconColor = 'var(--color-text-secondary)';
        const isFloating = t.isFloatingNext || !t.deadlineDate;

        if (isFloating) {
            footerIcon = 'event_repeat';
            footerIconColor = 'var(--color-accent)';
            footerInfoHtml = `<span style="color: var(--color-accent); font-weight: 700;">К следующей паре</span>`;
        } else {
            const cd = getDeadlineCountdown(t.deadlineDate, t.deadlineTime);
            const d = new Date(t.deadlineDate);
            const monthsGen = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const formattedDate = `${d.getDate()} ${monthsGen[d.getMonth()]}`;

            if (viewMode === 'tasks') {
                footerIcon = 'event';
                footerIconColor = 'var(--color-text-secondary)';
                footerInfoHtml = `<span>Срок: ${formattedDate}${t.deadlineTime ? ' в ' + t.deadlineTime : ''}</span>`;
            } else {
                footerIcon = 'alarm';
                if (t.completed) {
                    footerIconColor = 'var(--color-green)';
                    footerInfoHtml = `<span style="color: var(--color-green); font-weight: 700;">Сдано</span>`;
                } else if (cd.isOverdue) {
                    footerIconColor = 'var(--color-red)';
                    footerInfoHtml = `<span style="color: var(--color-red); font-weight: 700;">${cd.text}</span>`;
                } else {
                    footerIconColor = 'var(--color-text-primary)';
                    footerInfoHtml = `<span style="color: var(--color-text-primary); font-weight: 700;">Осталось: ${cd.text.replace(/^через\s*/i, '')}</span>`;
                }
            }
        }

        return `
                    <div class="diary-task-card ${t.completed ? 'is-completed' : ''}" data-id="${t.id}" style="background: var(--color-card); border: none; border-radius: var(--radius-large); padding: 1.6rem; box-shadow: var(--shadow-main); display: flex; flex-direction: column; gap: 1rem; text-align: left;">
                        <div>
                            <div style="margin-bottom: 6px;">
                                <span style="display: inline-block; max-width: 100%; word-break: break-word; background: var(--color-accent-active); color: var(--color-accent); padding: 4px 10px; border-radius: 8px; font-size: 1.15rem; font-weight: 800; text-transform: uppercase; line-height: 1.4;">
                                    ${t.subject}
                                </span>
                            </div>
                            <div class="task-card-title" style="font-size: 1.55rem; font-weight: 700; color: var(--color-text-primary); margin-top: 4px; line-height: 1.3;">
                                ${t.title}
                            </div>
                        </div>

                        ${t.details ? `
                            <div style="font-size: 1.35rem; color: var(--color-text-primary); line-height: 1.5; white-space: pre-wrap; background: var(--color-input); padding: 12px 16px; border-radius: var(--radius-medium); border: none; text-align: left;">${t.details}</div>
                        ` : ''}

                        <!-- Нижняя панель: срок/таймер слева, чекбокс "Сдано" и действия справа -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px; padding-top: 1rem; border-top: 1px solid var(--color-table-border); font-size: 1.25rem; color: var(--color-text-secondary); flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span class="material-icons" style="font-size: 1.6rem; color: ${footerIconColor};">${footerIcon}</span>
                                ${footerInfoHtml}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-left: auto;">
                                <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; -webkit-tap-highlight-color: transparent;">
                                    <input type="checkbox" class="toggle-task-complete" data-id="${t.id}" ${t.completed ? 'checked' : ''} style="margin: 0; transform: scale(1.15); cursor: pointer;">
                                    <span style="font-weight: 700; font-size: 1.3rem; color: var(--color-text-primary); user-select: none;">Сдано</span>
                                </label>
                                <div style="display: flex; align-items: center; gap: 2px;">
                                    <button class="edit-diary-task-btn" data-id="${t.id}" title="Редактировать">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button class="delete-diary-task-btn" data-id="${t.id}" title="Удалить">
                                        <span class="material-icons">delete_outline</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    };

    const renderView = (currentView, skipScroll = false) => {
        if (currentView === 'menu' && window.innerWidth > 960) currentView = 'tasks';

        let lastWeeksScroll = 0;
        const scrollBoxOld = modal.querySelector('#diary-weeks-scroll');
        if (scrollBoxOld) lastWeeksScroll = scrollBoxOld.scrollLeft;

        const tasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
        let headerTitle = 'Дневник';
        let contentHTML = '';
        let backTarget = 'menu';

        if (currentView === 'tasks') {
            headerTitle = 'Задания';
            backTarget = 'menu';

            const currentDayIdx = now.getDay();
            const diffToMonday = currentDayIdx === 0 ? -6 : 1 - currentDayIdx;
            const curMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
            const weekDiff = selectedWeek - actualWeekNum;
            const targetMon = new Date(curMonday.getFullYear(), curMonday.getMonth(), curMonday.getDate() + (weekDiff * 7));
            const targetSun = new Date(targetMon.getFullYear(), targetMon.getMonth(), targetMon.getDate() + 6);

            const pad = (n) => String(n).padStart(2, '0');
            const weekRangeStr = `${pad(targetMon.getDate())}.${pad(targetMon.getMonth() + 1)} - ${pad(targetSun.getDate())}.${pad(targetSun.getMonth() + 1)}`;

            const filteredTasks = tasks.filter(t => {
                if (t.week && t.week !== selectedWeek) return false;
                if (t.deadlineDate) {
                    const d = new Date(t.deadlineDate);
                    return daysArr[d.getDay()] === selectedDay;
                }
                return t.dayName === selectedDay;
            });

            contentHTML = `
                        <div class="week-select-wrapper" style="margin-bottom: 6px !important; height: 4.6rem; border-radius: 50px; background: var(--color-card); border: 1px solid var(--color-table-border); box-shadow: var(--shadow-main); padding: 4px; box-sizing: border-box; display: flex; align-items: center; gap: 8px;">
                            <div class="weeks" id="diary-weeks-scroll" style="display: flex; flex: 1 1 auto; min-width: 0; align-items: center; gap: 4px; overflow-x: auto; scrollbar-width: none; background: var(--color-highlight); border-radius: 50px; height: 3.8rem; padding: 3px; box-sizing: border-box;">
                                ${Array.from({length: totalWeeks}, (_, i) => i + 1).map(w => {
                            const isCurrent = w === selectedWeek;
                            const isActual = w === actualWeekNum;
                            if (isCurrent) {
                                return `
                                            <div class="week current" data-week="${w}" style="cursor: pointer; height: 3.2rem !important; border-radius: 50px !important;">
                                                <span><b style="font-weight: 800;">${w}</b>&nbsp;<span style="font-weight: 800;">Неделя</span></span>
                                            </div>
                                        `;
                            } else {
                                return `
                                            <div class="week ${isActual ? 'actual-week' : ''}" data-week="${w}" style="cursor: pointer; height: 3.2rem !important;">
                                                <span style="${isActual ? 'color: var(--color-accent); font-weight: 800;' : ''}">${w}</span>
                                            </div>
                                        `;
                            }
                        }).join('')}
                            </div>
                            <div class="week-date-styled" style="flex: 0 0 auto; height: 3.8rem; padding: 0 16px; border-radius: 50px; background: var(--color-highlight); font-size: 1.3rem; font-weight: 700; color: var(--color-text-secondary); display: inline-flex; align-items: center; justify-content: center; white-space: nowrap;">
                                ${weekRangeStr}
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; width: 100%; height: 4.6rem; box-sizing: border-box; border-radius: 50px; background: var(--color-card); box-shadow: var(--shadow-main); border: none; padding: 4px; margin-bottom: 1.6rem;">
                            <div class="sync-tabs" style="display: flex; flex: 1 1 auto; min-width: 0; align-items: center; gap: 2px; height: 3.8rem; padding: 3px; margin: 0 !important; background: var(--color-highlight) !important; border: none !important; box-shadow: none !important; border-radius: 50px !important; box-sizing: border-box;">
                                ${["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"].map(d => {
                            const isSel = selectedDay === d;
                            const isToday = todayName === d;
                            const textStyle = (isToday && !isSel) ? 'color: var(--color-accent); font-weight: 800;' : '';

                            // Подсчет активных (несданных) заданий на этот день на выбранной неделе
                            const dayTasksCount = tasks.filter(t => {
                                if (t.completed) return false;
                                if (t.week && t.week !== selectedWeek) return false;
                                if (t.deadlineDate) {
                                    const dObj = new Date(t.deadlineDate);
                                    return daysArr[dObj.getDay()] === d;
                                }
                                return t.dayName === d;
                            }).length;

                            const badgeHtml = dayTasksCount > 0 ? `
                                        <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 50px; font-size: 1.05rem; font-weight: 800; line-height: 1; background: ${isSel ? 'rgba(255, 255, 255, 0.28)' : 'var(--color-accent)'}; color: ${isSel ? '#ffffff' : 'var(--color-text-primary-invert)'}; box-sizing: border-box; margin-left: 5px;">
                                            ${dayTasksCount}
                                        </span>
                                    ` : '';

                            return `
                                        <button class="sync-tab ${isSel ? 'active' : ''}" data-day="${d}" style="padding: 0 8px !important; height: 3.2rem !important; border-radius: 50px !important; font-size: 1.25rem !important; flex: 1 1 0 !important; justify-content: center !important; font-weight: ${isSel ? '800' : '600'}; line-height: 1 !important; display: inline-flex !important; align-items: center !important;">
                                            <span style="${textStyle}">${dayShortMap[d]}</span>
                                            ${badgeHtml}
                                        </button>
                                    `;
                        }).join('')}
                            </div>

                            <button id="add-diary-task-btn" style="width: 3.2rem !important; height: 3.2rem !important; min-width: 3.2rem !important; max-width: 3.2rem !important; border-radius: 50% !important; border: none !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; padding: 0 !important; margin: 0 !important; flex: 0 0 3.2rem !important;" title="Добавить задание">
                                <span class="material-icons" style="font-size: 18px; line-height: 1;">add</span>
                            </button>
                        </div>

                        ${filteredTasks.length === 0 ? `
                            <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <span class="material-icons" style="font-size: 44px; opacity: 0.35;">task_alt</span>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary);">Заданий нет</div>
                                <div style="font-size: 1.3rem; max-width: 300px; line-height: 1.4;">Нажмите на «+» справа, чтобы записать ДЗ или задачу</div>
                            </div>
                        ` : `
                            <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                                ${filteredTasks.map(t => generateTaskCardHtml(t, 'tasks')).join('')}
                            </div>
                        `}
                    `;
        } 
        else if (currentView === 'deadlines') {
            headerTitle = 'Дедлайны';
            backTarget = 'menu';

            // Поддерживаем задачи с конкретной датой и задачи со статусом "К следующей паре"
            let activeTasks = tasks.filter(t => !t.completed && (t.deadlineDate || t.isFloatingNext));
            
            activeTasks.sort((a, b) => {
                // Плавающие задачи ставим в конец списка дедлайнов
                if (a.isFloatingNext && !b.isFloatingNext) return 1;
                if (!a.isFloatingNext && b.isFloatingNext) return -1;
                if (a.isFloatingNext && b.isFloatingNext) return 0;
                const dateA = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}:00`);
                const dateB = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}:00`);
                return dateA - dateB;
            });

            if (activeTasks.length === 0) {
                contentHTML = `
                            <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <span class="material-icons" style="font-size: 44px; opacity: 0.35;">alarm_on</span>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary);">Нет активных дедлайнов</div>
                                <div style="font-size: 1.3rem; max-width: 300px; line-height: 1.4;">Все текущие задачи выполнены. Вы можете спать спокойно.</div>
                            </div>
                        `;
            } else {
                contentHTML = `
                            <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                                ${activeTasks.map(t => generateTaskCardHtml(t, 'deadlines')).join('')}
                            </div>
                        `;
            }
        }
        else if (currentView === 'task_editor') {
            headerTitle = editingTask ? 'Редактировать задание' : 'Новое задание';
            backTarget = editorOrigin;

            const subjectsList = getAvailableSubjects();
            const defDate = editingTask ? editingTask.deadlineDate : getDateForWeekAndDay(selectedWeek, selectedDay);
            const defTime = editingTask ? (editingTask.deadlineTime || '11:30') : '11:30';

            contentHTML = `
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            
                            <!-- Предмет с автокомплитом -->
                            <div class="custom-pair-input-group" style="margin-bottom: 0 !important; position: relative;">
                                <div class="cp-input-wrap" style="position: relative; overflow: visible !important;">
                                    <span class="material-icons">menu_book</span>
                                    <input type="text" id="task-input-subject" autocomplete="off" placeholder="Предмет *" value="${editingTask ? editingTask.subject : ''}">
                                    <div id="subject-autocomplete-list" style="display:none; position:absolute; top:calc(100% + 4px); left:0; width:100%; z-index:2000005; max-height:180px; overflow-y:auto; background:var(--color-card); border:1px solid var(--color-table-border); border-radius:var(--radius-small); box-shadow:var(--shadow-dialog);"></div>
                                </div>
                            </div>

                            <div class="custom-pair-input-group" style="margin-bottom: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">task_alt</span>
                                    <input type="text" id="task-input-title" placeholder="Что нужно сделать *" value="${editingTask ? editingTask.title : ''}">
                                </div>
                            </div>

                            <div style="margin-bottom: 0 !important;">
                                <textarea class="note-modal-textarea" id="task-input-details" placeholder="Задание подробно, условия, ссылки (опционально)..." style="min-height: 110px; margin-top: 0 !important; text-align: left !important;">${editingTask ? (editingTask.details || '') : ''}</textarea>
                            </div>

                            <!-- Умный выбор конкретной пары -->
                            <div class="custom-pair-input-group" id="pair-select-group" style="display: none; margin-bottom: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">event_available</span>
                                    <select id="task-input-pair"></select>
                                </div>
                            </div>

                            <!-- Ручной ввод даты и времени -->
                            <div class="custom-pair-input-group" id="custom-datetime-group" style="margin-bottom: 0 !important; display: ${editingTask ? 'flex' : 'none'};">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">event</span>
                                    <input type="date" id="task-input-date" value="${defDate}" required>
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">schedule</span>
                                    <input type="time" id="task-input-time" value="${defTime}">
                                </div>
                            </div>

                            <!-- Выбор напоминания -->
                            <div class="custom-pair-input-group" id="task-reminder-group" style="margin-bottom: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">alarm</span>
                                    <select id="task-input-reminder" style="appearance: none; cursor: pointer;">
                                        <!-- Опции генерируются динамически -->
                                    </select>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 0.8rem;">
                                <button class="answer-btn-custom" id="cancel-task-edit-btn" style="background: var(--color-highlight) !important; color: var(--color-text-secondary) !important; border: 1px solid var(--color-table-border) !important; box-shadow: none !important;">
                                    Отмена
                                </button>
                                <button class="answer-btn-custom" id="save-task-submit-btn" style="border: none !important;">
                                    ${editingTask ? 'Сохранить' : 'Добавить'}
                                </button>
                            </div>
                        </div>
                    `;
        }

        const isMainMobile = currentView === 'menu';
        const showBackBtn = currentView === 'task_editor' || (window.innerWidth <= 960 && currentView !== 'menu');
        const backBtnClass = showBackBtn ? 'back-modal-btn' : 'back-modal-btn settings-mobile-header';
        const backBtnStyle = showBackBtn ? 'display: inline-block !important;' : '';

        modal.innerHTML = `
                    <div class="settings-layout">
                        <!-- САЙДБАР -->
                        <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Дневник</div>
                            <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons back-to-drawer-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                    <span>Дневник</span>
                                </div>
                                <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                            </div>

                            <div class="sidebar-tabs-container">
                                <div class="settings-sidebar-btn ${currentView === 'tasks' || currentView === 'task_editor' ? 'active' : ''}" data-target="tasks">
                                    <span class="material-icons">task</span>
                                    <span class="sidebar-btn-text">Задания</span>
                                    <span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'deadlines' ? 'active' : ''}" data-target="deadlines">
                                    <span class="material-icons">alarm</span>
                                    <span class="sidebar-btn-text">Дедлайны</span>
                                    <span class="material-icons chevron">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        <!-- КОНТЕНТНАЯ ЧАСТЬ -->
                        <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="settings-content-scroll">
                                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <span class="material-icons ${backBtnClass}" data-back="${backTarget}" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem; ${backBtnStyle}">arrow_back</span>
                                        <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${headerTitle}</span>
                                    </div>
                                    <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                                </div>
                                <div style="padding: 0.8rem 0 4rem 0;">
                                    ${contentHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeAll);
        modal.querySelectorAll('.back-modal-btn').forEach(btn => btn.onclick = () => renderView(btn.getAttribute('data-back'), true));
        modal.querySelectorAll('.settings-sidebar-btn').forEach(btn => {
            btn.onclick = () => renderView(btn.getAttribute('data-target'));
        });
        modal.querySelectorAll('.back-to-drawer-btn').forEach(btn => {
            btn.onclick = () => returnToDrawer(modal, overlay);
        });

        if (currentView === 'tasks') {
            const newScrollBox = modal.querySelector('#diary-weeks-scroll');
            if (newScrollBox) {
                if (skipScroll) {
                    newScrollBox.scrollLeft = lastWeeksScroll;
                } else {
                    setTimeout(() => {
                        const curW = newScrollBox.querySelector('.current');
                        if (curW) {
                            const target = curW.offsetLeft - (newScrollBox.offsetWidth / 2) + (curW.offsetWidth / 2);
                            newScrollBox.scrollLeft = target;
                        }
                    }, 20);
                }
            }

            modal.querySelectorAll('.weeks .week[data-week]').forEach(wEl => {
                wEl.onclick = () => {
                    selectedWeek = parseInt(wEl.getAttribute('data-week'), 10);
                    renderView('tasks', false); // Здесь скролл нужен, так как сменили неделю
                };
            });

            modal.querySelectorAll('.sync-tab[data-day]').forEach(btn => {
                btn.onclick = () => {
                    selectedDay = btn.getAttribute('data-day');
                    renderView('tasks', true); // skipScroll = true
                };
            });

            const addBtn = modal.querySelector('#add-diary-task-btn');
            if (addBtn) {
                addBtn.onclick = () => {
                    editingTask = null;
                    editorOrigin = 'tasks';
                    renderView('task_editor');
                };
            }
        }

        // Галочка выполнения для обеих вкладок
        modal.querySelectorAll('.toggle-task-complete').forEach(cb => {
            cb.onchange = (e) => {
                const id = cb.getAttribute('data-id');
                let allTasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
                const item = allTasks.find(x => x.id === id);
                if (item) {
                    item.completed = e.target.checked;
                    item.completedAt = e.target.checked ? Date.now() : null;
                    saveSyncData('etis_diary_tasks_v1', JSON.stringify(allTasks));
                    renderView(currentView, true);
                }
            };
        });

        // Кнопки редактирования и удаления на карточках
        modal.querySelectorAll('.edit-diary-task-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const t = tasks.find(x => x.id === id);
                if (t) {
                    editingTask = t;
                    editorOrigin = currentView;
                    renderView('task_editor');
                }
            };
        });

        modal.querySelectorAll('.delete-diary-task-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                // Заменяем красный цвет при наведении с помощью CSS, убрав inline hover если он был, или просто стилизуем.
                if (confirm('Удалить это задание?')) {
                    const id = btn.getAttribute('data-id');
                    let allTasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
                    const target = allTasks.find(x => x.id === id);
                    allTasks = allTasks.filter(x => x.id !== id);
                    saveSyncData('etis_diary_tasks_v1', JSON.stringify(allTasks));

                    if (target && target.pairId) {
                        let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                        delete notesData.specific[target.pairId];
                        saveSyncData('etis_subject_notes_v2', JSON.stringify(notesData));
                        if (typeof window.renderNotes === 'function') window.renderNotes();
                    }
                    renderView(currentView, true);
                }
            };
        });
        
        // Стиль для красной кнопки удаления при наведении
        modal.querySelectorAll('.delete-diary-task-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(255, 59, 48, 0.1)'; });
            btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });
        });
        // Стиль для кнопки редактирования при наведении
        modal.querySelectorAll('.edit-diary-task-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--color-highlight-light)'; btn.style.color = 'var(--color-text-primary)'; });
            btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = 'var(--color-text-secondary)'; });
        });

        if (currentView === 'task_editor') {
            const cancelBtn = modal.querySelector('#cancel-task-edit-btn');
            if (cancelBtn) cancelBtn.onclick = () => renderView(editorOrigin, true);

            const subjInput = modal.querySelector('#task-input-subject');
            const subjList = modal.querySelector('#subject-autocomplete-list');
            const pairSelectGroup = modal.querySelector('#pair-select-group');
            const pairSelect = modal.querySelector('#task-input-pair');
            const customDateGroup = modal.querySelector('#custom-datetime-group');
            const dDateInput = modal.querySelector('#task-input-date');
            const dTimeInput = modal.querySelector('#task-input-time');
            const reminderSelect = modal.querySelector('#task-input-reminder');

            const subjectsList = getAvailableSubjects();

            // --- ФУНКЦИЯ ДИНАМИЧЕСКОГО РАСЧЕТА НАПОМИНАНИЙ ---
            const updateReminderOptions = () => {
                if (!reminderSelect) return;

                const dDate = dDateInput ? dDateInput.value.trim() : '';
                const dTime = dTimeInput ? dTimeInput.value.trim() : '23:59';
                if (!dDate) return;

                const target = new Date(`${dDate}T${dTime || '23:59'}:00`);
                const diffMinutes = Math.floor((target.getTime() - Date.now()) / (1000 * 60));

                // Если до дедлайна меньше часа — напоминание сделать нельзя
                if (diffMinutes < 60) {
                    reminderSelect.innerHTML = `<option value="">До дедлайна меньше часа (напоминание недоступно)</option>`;
                    reminderSelect.disabled = true;
                    reminderSelect.style.opacity = '0.55';
                    reminderSelect.style.cursor = 'not-allowed';
                    return;
                }

                reminderSelect.disabled = false;
                reminderSelect.style.opacity = '1';
                reminderSelect.style.cursor = 'pointer';

                const currentSavedValue = editingTask ? String(editingTask.reminderMinutes || '') : (reminderSelect.value || '');

                let options = `<option value="">Без напоминания</option>`;
                if (diffMinutes >= 60)   options += `<option value="60">За 1 час</option>`;
                if (diffMinutes >= 720)  options += `<option value="720">За 12 часов</option>`;
                if (diffMinutes >= 1440) options += `<option value="1440">За 1 день</option>`;
                if (diffMinutes >= 4320) options += `<option value="4320">За 3 дня</option>`;

                reminderSelect.innerHTML = options;

                if (currentSavedValue && reminderSelect.querySelector(`option[value="${currentSavedValue}"]`)) {
                    reminderSelect.value = currentSavedValue;
                }
            };

            // Привязываем пересчет ко всем изменениям даты и времени
            if (dDateInput) dDateInput.addEventListener('input', updateReminderOptions);
            if (dTimeInput) dTimeInput.addEventListener('input', updateReminderOptions);

            // --- ИНТЕЛЛЕКТУАЛЬНЫЙ ПОДБОР БЛИЖАЙШЕЙ ПАРЫ ---
            const updatePairSelect = (subjectName) => {
                if (!subjectName) {
                    pairSelectGroup.style.display = 'none';
                    customDateGroup.style.display = 'none';
                    return;
                }

                const cleanSubj = subjectName.replace(/\(.*?\)/g, '').trim().toLowerCase();
                const now = new Date();
                const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

                const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
                const monthsGen = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
                const monthsGenFull = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

                let rowNodes = Array.from(document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)'));
                if (rowNodes.length === 0) {
                    const offlineHtml = localStorage.getItem('etis_offline_timetable_html');
                    if (offlineHtml) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = offlineHtml;
                        rowNodes = Array.from(tempDiv.querySelectorAll('.timetable-grid tr, .timetable tr, table tr')).filter(r => {
                            const info = r.querySelector('.pair_info') || r.querySelector('.dis');
                            return info && info.textContent.trim().length > 0;
                        });
                    }
                }

                const subjectTemplates = [];

                rowNodes.forEach(r => {
                    const dis = r.querySelector('.pair_info .dis') || r.querySelector('.dis');
                    if (!dis) return;

                    let tempSubjEl = (dis.querySelector('a') || dis).cloneNode(true);
                    tempSubjEl.querySelectorAll('.material-icons, .note-btn-wrapper, .delete-custom-pair-btn').forEach(el => el.remove());
                    const exactSubj = tempSubjEl.textContent.trim();
                    const rSubj = exactSubj.toLowerCase();

                    if (rSubj.includes(cleanSubj) || cleanSubj.includes(rSubj)) {
                        const dayContainer = r.closest('.day');
                        const dayName = dayContainer?.getAttribute('data-orig-day-name') || 
                                        dayContainer?.querySelector('.day-name')?.textContent.trim() || 
                                        dayContainer?.querySelector('h3')?.textContent.split(',')[0].trim() || 'Понедельник';

                        const timeStr = r.querySelector('.eval')?.textContent.match(/\d{1,2}:\d{2}/)?.[0] || '08:00';
                        
                        const typeBadge = r.querySelector('.pair-type-badge');
                        let typeStr = '';
                        if (typeBadge) {
                            const bClone = typeBadge.cloneNode(true);
                            bClone.querySelectorAll('.material-icons, button, .pair-important-btn').forEach(el => el.remove());
                            typeStr = bClone.textContent.trim().toUpperCase();
                        }

                        const numTd = r.querySelector('.pair_num');
                        let rNum = "";
                        if (numTd) {
                            Array.from(numTd.childNodes).forEach(n => {
                                if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) rNum = n.nodeValue.trim();
                            });
                        }
                        if (!rNum && numTd) rNum = numTd.textContent.trim().split(' ')[0] + ' пара';

                        if (!subjectTemplates.some(t => t.dayName === dayName && t.time === timeStr)) {
                            subjectTemplates.push({
                                dayName,
                                time: timeStr,
                                type: typeStr,
                                rNum,
                                exactSubj,
                                source: 'timetable'
                            });
                        }
                    }
                });

                // Добавляем кастомные пары
                try {
                    const customPairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                    customPairs.forEach(cp => {
                        if (cp.subject && (cp.subject.toLowerCase().includes(cleanSubj) || cleanSubj.includes(cp.subject.toLowerCase()))) {
                            subjectTemplates.push({
                                dayName: cp.dayName || 'Понедельник',
                                time: cp.startTime || '08:00',
                                type: cp.type ? cp.type.toUpperCase() : 'ЛИЧ',
                                rNum: '1 пара',
                                exactSubj: cp.subject,
                                source: 'custom',
                                recurrence: cp.recurrence || 'once',
                                addedWeek: cp.addedWeek
                            });
                        }
                    });
                } catch(e) {}

                if (subjectTemplates.length === 0) {
                    pairSelectGroup.style.display = 'none';
                    customDateGroup.style.display = 'flex';
                    updateReminderOptions();
                    return;
                }

                const foundPairs = [];
                const currentDayIdx = now.getDay();
                const diffToMonday = currentDayIdx === 0 ? -6 : 1 - currentDayIdx;
                const calendarMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
                calendarMonday.setHours(0, 0, 0, 0);

                for (let offset = 0; offset <= 21; offset++) {
                    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
                    targetDate.setHours(0, 0, 0, 0);

                    const dayName = daysMap[targetDate.getDay()];
                    const diffWeeks = Math.floor((targetDate.getTime() - calendarMonday.getTime()) / (7 * 24 * 3600 * 1000));
                    const targetWeekNum = actualWeekNum + diffWeeks;

                    subjectTemplates.forEach(tpl => {
                        if (tpl.dayName.toLowerCase() !== dayName.toLowerCase()) return;

                        if (tpl.source === 'custom') {
                            if (tpl.recurrence === 'once' && tpl.addedWeek !== targetWeekNum) return;
                            if (tpl.recurrence === 'biweekly' && ((targetWeekNum % 2) !== (tpl.addedWeek % 2))) return;
                        }

                        const [h, m] = tpl.time.split(':').map(Number);
                        const slotTotalMinutes = (h * 60) + m;

                        if (offset === 0 && slotTotalMinutes <= nowTotalMinutes) return;

                        const pad = (n) => String(n).padStart(2, '0');
                        const dateIso = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
                        
                        // Формируем точные строковые даты для совпадения с заголовками дней в расписании
                        const dateTextFormat = `${targetDate.getDate()} ${monthsGenFull[targetDate.getMonth()]}`;
                        const dateNumFormat = `${pad(targetDate.getDate())}.${pad(targetDate.getMonth() + 1)}`;
                        
                        const pairIdText = `${dateTextFormat}_${tpl.rNum}_${tpl.exactSubj}`;
                        const pairIdNum = `${dateNumFormat}_${tpl.rNum}_${tpl.exactSubj}`;

                        let prefix = '';
                        if (offset === 0) prefix = 'Сегодня';
                        else if (offset === 1) prefix = 'Завтра';
                        else if (diffWeeks === 0) prefix = `${dayName}`;
                        else if (diffWeeks === 1) prefix = `След. неделя, ${dayName}`;
                        else prefix = `${diffWeeks}-я нед, ${dayName}`;

                        const dateFormatted = `${targetDate.getDate()} ${monthsGen[targetDate.getMonth()]}`;
                        const label = `${prefix} (${dateFormatted}, ${tpl.time}${tpl.type ? ' — ' + tpl.type : ''})`;

                        foundPairs.push({
                            label,
                            date: dateIso,
                            time: tpl.time,
                            week: targetWeekNum,
                            dayName: dayName,
                            pairIdText: pairIdText,
                            pairIdNum: pairIdNum,
                            rNum: tpl.rNum,
                            exactSubj: tpl.exactSubj,
                            timestamp: targetDate.getTime() + (slotTotalMinutes * 60 * 1000)
                        });
                    });
                }

                foundPairs.sort((a, b) => a.timestamp - b.timestamp);
                window._diaryFoundPairs = foundPairs;

                if (foundPairs.length > 0) {
                    let opts = `<option value="custom">Указать дату и время вручную...</option>`;
                    foundPairs.forEach((p, i) => {
                        const closestBadge = i === 0 ? ' ★ Ближайшее' : '';
                        opts += `<option value="${i}">${p.label}${closestBadge}</option>`;
                    });
                    pairSelect.innerHTML = opts;
                    pairSelectGroup.style.display = 'flex';

                    pairSelect.value = "0";
                    customDateGroup.style.display = 'none';
                    dDateInput.value = foundPairs[0].date;
                    dTimeInput.value = foundPairs[0].time;
                    selectedWeek = foundPairs[0].week;

                    updateReminderOptions();

                    pairSelect.onchange = () => {
                        if (pairSelect.value === 'custom') {
                            customDateGroup.style.display = 'flex';
                        } else {
                            customDateGroup.style.display = 'none';
                            const p = foundPairs[pairSelect.value];
                            dDateInput.value = p.date;
                            dTimeInput.value = p.time;
                            selectedWeek = p.week;
                        }
                        updateReminderOptions();
                    };
                } else {
                    pairSelectGroup.style.display = 'none';
                    customDateGroup.style.display = 'flex';
                    updateReminderOptions();
                }
            };

            // Слушатели автокомплита
            if (subjInput && subjList) {
                const populateList = (val) => {
                    const filtered = subjectsList.filter(s => s.toLowerCase().includes(val.toLowerCase()));
                    if (filtered.length === 0 || !val) {
                        subjList.style.display = 'none';
                        return;
                    }
                    subjList.innerHTML = filtered.map(s => `
                                <div class="subj-autocomplete-item" style="padding: 10px 16px; cursor: pointer; border-bottom: 1px solid var(--color-table-border); font-size: 1.35rem; color: var(--color-text-primary); transition: background 0.2s; text-align: left;">
                                    ${s}
                                </div>`).join('');
                    subjList.style.display = 'block';

                    subjList.querySelectorAll('.subj-autocomplete-item').forEach(item => {
                        item.onmouseenter = () => item.style.background = 'var(--color-highlight)';
                        item.onmouseleave = () => item.style.background = 'transparent';
                        item.onclick = () => {
                            const selectedVal = item.textContent.trim();
                            subjInput.value = selectedVal;
                            subjList.style.display = 'none';
                            updatePairSelect(selectedVal);
                        };
                    });
                };

                subjInput.addEventListener('input', (e) => {
                    populateList(e.target.value.trim());
                    updatePairSelect(e.target.value.trim());
                });
                subjInput.addEventListener('focus', (e) => populateList(e.target.value.trim()));
                document.addEventListener('click', (e) => {
                    if (!subjInput.contains(e.target) && !subjList.contains(e.target)) {
                        subjList.style.display = 'none';
                    }
                });

                if (editingTask && editingTask.subject) {
                    updatePairSelect(editingTask.subject);
                    pairSelect.value = "custom";
                    customDateGroup.style.display = 'flex';
                    updateReminderOptions();
                } else {
                    updateReminderOptions();
                }
            }

            // --- СОХРАНЕНИЕ ЗАДАНИЯ И ПРИВЯЗКА К СЕТКЕ РАСПИСАНИЯ ---
            const saveBtn = modal.querySelector('#save-task-submit-btn');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const rawSubj = subjInput ? subjInput.value.replace(/\(.*?\)/g, '').trim() : '';
                    const taskTitle = modal.querySelector('#task-input-title').value.trim();
                    const details = modal.querySelector('#task-input-details').value.trim();
                    const dDate = modal.querySelector('#task-input-date').value;
                    const dTime = modal.querySelector('#task-input-time').value;

                    if (!rawSubj || !taskTitle || !dDate) {
                        alert('Пожалуйста, укажите предмет, суть задания и дату сдачи!');
                        return;
                    }

                    let allTasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
                    const taskId = editingTask ? editingTask.id : ('diary_' + Date.now());

                    const monthsGenFull = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                    const pad = (n) => String(n).padStart(2, '0');
                    const targetDateObj = new Date(dDate);
                    const dateFormattedText = `${targetDateObj.getDate()} ${monthsGenFull[targetDateObj.getMonth()]}`;
                    const dateFormattedNum = `${pad(targetDateObj.getDate())}.${pad(targetDateObj.getMonth() + 1)}`;

                    let matchedPairId = null;
                    let exactSubj = rawSubj;
                    let tplRNum = '1 пара';

                    if (pairSelect && pairSelect.value !== 'custom' && window._diaryFoundPairs && window._diaryFoundPairs[pairSelect.value]) {
                        const p = window._diaryFoundPairs[pairSelect.value];
                        matchedPairId = p.pairIdText; // Используем правильный строковый ключ даты
                        exactSubj = p.exactSubj;
                        tplRNum = p.rNum || '1 пара';
                    } else {
                        matchedPairId = `${dateFormattedText}_1 пара_${exactSubj}`;
                    }

                    const dueDayName = daysArr[targetDateObj.getDay()];
                    let targetTaskWeek = selectedWeek;
                    if (pairSelect && pairSelect.value !== 'custom' && window._diaryFoundPairs && window._diaryFoundPairs[pairSelect.value]) {
                        targetTaskWeek = window._diaryFoundPairs[pairSelect.value].week || selectedWeek;
                    }

                    const reminderVal = modal.querySelector('#task-input-reminder')?.value;
                    const reminderMinutes = reminderVal ? parseInt(reminderVal, 10) : null;

                    const updatedItem = {
                        id: taskId,
                        pairId: matchedPairId,
                        subject: exactSubj,
                        title: taskTitle,
                        details: details,
                        deadlineDate: dDate,
                        deadlineTime: dTime,
                        week: targetTaskWeek,
                        dayName: dueDayName,
                        completed: editingTask ? editingTask.completed : false,
                        completedAt: editingTask ? editingTask.completedAt : null,
                        reminderMinutes: reminderMinutes,
                        reminderTriggered: false
                    };

                    if (editingTask) {
                        allTasks = allTasks.map(x => x.id === taskId ? updatedItem : x);
                    } else {
                        allTasks.push(updatedItem);
                    }
                    saveSyncData('etis_diary_tasks_v1', JSON.stringify(allTasks));

                    // Записываем заметку во все возможные варианты формата даты (текстовый и числовой),
                    // чтобы иконка карандаша гарантированно загорелась в расписании
                    let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                    notesData.specific[`${dateFormattedText}_${tplRNum}_${exactSubj}`] = taskTitle;
                    notesData.specific[`${dateFormattedNum}_${tplRNum}_${exactSubj}`] = taskTitle;
                    if (matchedPairId) notesData.specific[matchedPairId] = taskTitle;

                    saveSyncData('etis_subject_notes_v2', JSON.stringify(notesData));

                    // Мгновенное обновление и зажигание желтого карандаша в расписании
                    if (typeof window.renderNotes === 'function') window.renderNotes();

                    renderView(editorOrigin, true);
                };
            }
        }
    };

    renderView(startView);

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}
