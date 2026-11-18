import { pageCtx } from '../../app/context.js';
import { generalConfig } from '../../core/config.js';
import { consultationsFiles, setConsultationsFiles } from '../../features/consultations/state.js';
import { openCustomPairModal, showChooseDayModal } from '../../features/custom-pair-modal.js';
import { openExportPreviewModal } from '../../features/export.js';
import { migrateExternalCals } from '../../features/external-cals.js';
import { updateLiveTimetable } from '../../features/live-timetable.js';
import { openConsultationsModal } from '../../modals/consultations.js';
import { openSyncModal } from '../../modals/sync.js';
import { mergeConsecutiveDaysOff, unmergeDaysOff } from './days-off.js';
import { dimPastPairs } from './dim-past-pairs.js';
import { eventOccursOnDate, parseICS } from './external-calendar.js';
import { initMobileSwipes } from './mobile-swipes.js';
import { extractCleanLocation, extractCleanTeacher, openPairModal } from './pair-modal.js';
import { openSummaryModal } from './summary-modal.js';
import { triggerSilentCloudUpload } from '../../sync/cloud.js';
import { safeParseJSON } from '../../sync/crypto.ts';
import { saveSyncData } from '../../sync/data.js';
import { updateEmptyState } from '../../ui/empty-state.js';
import { parseDayDateStrToISO } from '../../utils/dates.ts';
import { isMacSafari } from '../../utils/platform.ts';
import { escapeHTML, sanitizeUrl } from '../../utils/security.ts';

export function renderTimetablePage() {
    if (generalConfig.showSunday) {
        const days = Array.from(pageCtx.span9.querySelectorAll('div.day'));
        if (days.length > 0) {
            const lastDay = days[days.length - 1];
            const lastH3 = lastDay.querySelector('h3');

            // Проверяем, нет ли уже Воскресенья (на всякий случай)
            if (lastH3 && !lastH3.textContent.includes('Воскресенье')) {
                const text = lastH3.textContent.trim();
                let nextDateStr = "";

                // Ищем дату в формате "Суббота, 18 мая 2024" или "Суббота, 18.05.2024"
                const matchText = text.match(/,\s*(\d{1,2})\s+([а-яА-Я]+)(?:\s+(\d{4}))?/i);
                const matchNum = text.match(/,\s*(\d{2})\.(\d{2})(?:\.(\d{4}))?/);

                if (matchText) {
                    const d = parseInt(matchText[1], 10);
                    const mStr = matchText[2].toLowerCase();
                    const monthsMap = { 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 };
                    const monthsArr = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                    const m = monthsMap[mStr];
                    let y = matchText[3] ? parseInt(matchText[3], 10) : new Date().getFullYear();

                    if (m !== undefined) {
                        let dateObj = new Date(y, m, d);
                        dateObj.setDate(dateObj.getDate() + 1); // Прибавляем 1 день
                        nextDateStr = `${dateObj.getDate()} ${monthsArr[dateObj.getMonth()]}${matchText[3] ? ' ' + dateObj.getFullYear() : ''}`;
                    }
                } else if (matchNum) {
                    const d = parseInt(matchNum[1], 10);
                    const m = parseInt(matchNum[2], 10) - 1;
                    let y = matchNum[3] ? parseInt(matchNum[3], 10) : new Date().getFullYear();

                    let dateObj = new Date(y, m, d);
                    dateObj.setDate(dateObj.getDate() + 1);
                    nextDateStr = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth()+1).padStart(2, '0')}${matchNum[3] ? '.' + dateObj.getFullYear() : ''}`;
                }

                // Создаем структуру как у оригинального ЕТИСа
                const sundayDiv = document.createElement('div');
                sundayDiv.className = 'day';
                sundayDiv.innerHTML = `<h3>Воскресенье${nextDateStr ? ', ' + nextDateStr : ''}</h3><div class="no_pairs">Занятий нет</div>`;
                lastDay.parentNode.insertBefore(sundayDiv, lastDay.nextSibling);
            }
        }
    }

    // --- ОФОРМЛЕНИЕ ВЫХОДНЫХ ДНЕЙ (0 ПАР) ---
    pageCtx.span9.querySelectorAll('.no_pairs').forEach(el => {
        const table = document.createElement('table');
        table.className = 'timetable-grid';

        table.innerHTML = `
                            <tbody>
                                <tr class="custom-no-pairs">
                                    <td class="pair_num" style="border-bottom: none !important; border-right: none !important;">
                                        <div class="pair-badge-wrapper">
                                            <span class="pair-type-badge type-badge-holiday">ВЫХ</span>
                                        </div>
                                        0 пар<br><font class="eval">00:00</font>
                                    </td>
                                    <td class="pair_info" style="border-bottom: none !important; border-left: none !important;">
                                        <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(52, 199, 89, 0.12); color: var(--color-green); padding: 0.6rem 1.4rem; border-radius: 50px; font-weight: 700; font-size: 1.3rem; line-height: 1;">
                                            <span class="material-icons" style="font-size: 1.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">free_breakfast</span>
                                            Выходной
                                        </div>
                                    </td>
                                    <td class="pair_teacher" style="border-bottom: none !important;"></td>
                                </tr>
                            </tbody>
                        `;

        el.parentNode.replaceChild(table, el);
    });
    pageCtx.span9.querySelectorAll('.day table').forEach(t => t.classList.add('timetable-grid'));
    
    // --- 1. СБОР ССЫЛОК И СИСТЕМНЫХ ДАННЫХ ИЗ СТРАНИЦЫ ---
    pageCtx.span9.querySelectorAll('.timetable-grid tr').forEach(row => {
        const dis = row.querySelector('.dis');
        if (dis && dis.textContent.toLowerCase().includes('консультация')) {
            row.classList.add('consultation-row');
        }
    });

    if (localStorage.getItem('etis_show_consultations') === 'false') {
        pageCtx.span9.querySelectorAll('.consultation-row').forEach(row => {
            row.classList.add('hidden-by-filter');
            row.style.display = 'none';
        });
    }

    const consultDiv = Array.from(pageCtx.span9.querySelectorAll('div')).find(div =>
        div.querySelector('input[type="checkbox"]') && div.textContent.includes('Консультации')
    );
    if (consultDiv) consultDiv.remove();

    const syncHeader = Array.from(document.querySelectorAll('h2')).find(h2 => h2.querySelector('#tb_show') || h2.textContent.includes('Синхронизация'));
    if (syncHeader) {
        const resourcesDiv = document.getElementById('resources');
        if (resourcesDiv) resourcesDiv.style.display = 'none';
        syncHeader.remove();
    }

    let detailHref = '';
    const detailLink = Array.from(pageCtx.span9.querySelectorAll('a')).find(a => a.textContent.includes('Подробное расписание'));
    if (detailLink) {
        detailHref = detailLink.href;
        detailLink.remove();
    }

    let feedbackHref = '';
    const feedbackLink = Array.from(pageCtx.span9.querySelectorAll('a')).find(a => 
        a.textContent.includes('Напишите, что вы думаете о расписании') ||
        a.classList.contains('estimate_tt') ||
        (a.getAttribute('href') && a.getAttribute('href').includes('estimate_tt'))
    );
    if (feedbackLink) {
        feedbackHref = feedbackLink.getAttribute('href') || feedbackLink.href;
        window.etisEstimateTTHref = feedbackHref;
        let oldParent = feedbackLink.parentElement;
        feedbackLink.remove();
        if (oldParent && oldParent.textContent.trim() === '') oldParent.remove();
    }

    // Сохранение недель в историю для сводки
    const saveWeekToHistory = () => {
        const currentWeekEl = pageCtx.span9.querySelector('.week.current');
        const weekNum = currentWeekEl ? currentWeekEl.textContent.replace(/\D/g, '').trim() : null;
        if (weekNum) {
            let totalCount = 0;
            pageCtx.span9.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
                if (row.style.display !== 'none' && !row.classList.contains('hidden-by-filter')) {
                    const typeBadge = row.querySelector('.pair-type-badge');
                    const disName = row.querySelector('.dis') ? row.querySelector('.dis').textContent.toLowerCase() : '';
                    if (typeBadge) {
                        const t = typeBadge.textContent.toLowerCase();
                        if (t.includes('лек') || t.includes('практ') || t.includes('лаб') || t.includes('экз') || t.includes('зач')) totalCount++;
                    } else if (disName.includes('консультация') || disName.includes('экзамен') || disName.includes('зачет') || disName.includes('зачёт')) {
                        totalCount++;
                    }
                }
            });
            const storageKey = 'etis_weekly_pairs_history_v1';
            let history = JSON.parse(localStorage.getItem(storageKey) || '{}');
            history[weekNum] = totalCount;
            saveSyncData(storageKey, JSON.stringify(history));
        }
    };
    setTimeout(saveWeekToHistory, 500);

    // Сохранение расписания посещённых недель для поиска будущих пар
    function cacheCurrentWeekSchedule() {
        const currentWeekEl = document.querySelector('.weeks .week.current');
        if (!currentWeekEl) return;
        const weekNum = parseInt(currentWeekEl.textContent.replace(/\D/g, '').trim(), 10);
        if (isNaN(weekNum)) return;

        const weekSchedule = [];
        document.querySelectorAll('.span9 .day').forEach(day => {
            const dayName = day.getAttribute('data-orig-day-name') || day.querySelector('.day-name')?.textContent.trim() || '';
            const dayDateStr = day.getAttribute('data-orig-date') || day.querySelector('.day-date')?.textContent.trim() || '';

            day.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
                const dis = row.querySelector('.pair_info .dis');
                if (!dis) return;
                let cleanSubj = (dis.querySelector('a') || dis).cloneNode(true);
                cleanSubj.querySelectorAll('.material-icons, .note-btn-wrapper, .delete-custom-pair-btn').forEach(el => el.remove());
                const subjText = cleanSubj.textContent.trim();
                if (!subjText || subjText.toLowerCase().includes('выходной')) return;

                const timeStr = row.querySelector('.eval')?.textContent.match(/\d{1,2}:\d{2}/)?.[0] || '08:00';
                const numTd = row.querySelector('.pair_num');
                let rNum = "";
                if (numTd) {
                    Array.from(numTd.childNodes).forEach(n => {
                        if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) rNum = n.nodeValue.trim();
                    });
                }
                if (!rNum && numTd) rNum = numTd.textContent.trim().split(' ')[0] + ' пара';

                weekSchedule.push({ dayName, dayDateStr, subject: subjText, startTime: timeStr, rNum });
            });
        });

        if (weekSchedule.length > 0) {
            try {
                let allCached = JSON.parse(localStorage.getItem('etis_cached_weeks_schedule_v1') || '{}');
                allCached[weekNum] = weekSchedule;
                localStorage.setItem('etis_cached_weeks_schedule_v1', JSON.stringify(allCached));
            } catch (e) {}
        }
    }
    cacheCurrentWeekSchedule();

    // 6. Перенос преподавателя в строку с аудиторией
    const pairs = pageCtx.span9.querySelectorAll("div.day > table > tbody > tr");
    pairs.forEach(pair => {
        const teacher = pair.querySelector('span.teacher');
        const aud = pair.querySelector('.aud');
        const pairJour = pair.querySelector('td.pair_jour');
        if (pairJour) pairJour.remove();

        let teacherHtml = '';
        if (teacher) {
            const teacherLink = teacher.querySelector('a') || teacher;
            const teacherName = teacherLink.textContent.trim();
            const href = teacherLink.getAttribute ? teacherLink.getAttribute('href') : '';

            if (href) {
                teacherHtml = `<div class="pair-teacher-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem; color: var(--color-text-secondary);">person</span><a href="${href}">${teacherName}</a></div>`;
            } else if (teacherName) {
                teacherHtml = `<div class="pair-teacher-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem; color: var(--color-text-secondary);">person</span><span>${teacherName}</span></div>`;
            }
            teacher.remove();
        }

        let pairTeacher = pair.querySelector('td.pair_teacher');
        if (!pairTeacher) {
            pairTeacher = document.createElement('td');
            pairTeacher.className = 'pair_teacher';
            pair.appendChild(pairTeacher);
        }

        if (aud && teacherHtml) {
            aud.insertAdjacentHTML('beforeend', teacherHtml);
        }
    });

    // 7. ОБЪЕДИНЕННЫЙ БЛОК: НЕДЕЛИ СЛЕВА + ДАТА + КНОПКА "..." СПРАВА
    const weekSelect = pageCtx.span9.querySelector('.week-select');
    if (weekSelect) {
        const dateDiv = weekSelect.querySelector('div[style*="text-align:center"]');
        const weeksUl = weekSelect.querySelector('.weeks');

        let dateText = '';
        let holidayText = '';

        if (dateDiv) {
            const holidayEl = dateDiv.querySelector('.holiday');
            if (holidayEl) {
                holidayText = holidayEl.textContent.trim().replace(/\.\d{4}/g, '');
                holidayEl.remove();
            }

            const dateSpan = dateDiv.querySelector('span');
            let raw = (dateSpan ? dateSpan.textContent : dateDiv.textContent).trim();

            const m = raw.match(/(\d{1,2}\.\d{1,2})(?:\.\d{2,4})?.*?(\d{1,2}\.\d{1,2})(?:\.\d{2,4})?/);
            if (m) {
                dateText = `${m[1]} - ${m[2]}`;
            } else {
                dateText = raw.replace(/^Неделя\s+/i, '').replace(/^с\s+/i, '').replace(/\s*по\s*/i, ' - ').replace(/\.\d{4}/g, '').trim();
            }
        }

        if (weeksUl) {
            const wrapper = document.createElement('div');
            wrapper.className = 'week-select-wrapper';
            
            wrapper.appendChild(weeksUl);

            if (dateText || holidayText) {
                const dateCapsule = document.createElement('div');
                dateCapsule.className = 'week-date-styled';

                if (holidayText) {
                    dateCapsule.style.setProperty('background', 'rgba(52, 199, 89, 0.15)', 'important');
                    dateCapsule.style.setProperty('color', 'var(--color-green)', 'important');
                    dateCapsule.innerHTML = `<span class="material-icons" style="font-size: 1.6rem; color: var(--color-green);">celebration</span><span>${holidayText}</span>`;
                } else {
                    dateCapsule.textContent = dateText;
                }
                wrapper.appendChild(dateCapsule);
            }

            // 3. Обертка кнопки "..." и меню
            const moreWrap = document.createElement('div');
            moreWrap.className = 'timetable-more-wrap';

            const moreBtn = document.createElement('button');
            moreBtn.className = 'timetable-more-btn';
            moreBtn.title = 'Действия';
            moreBtn.innerHTML = '<span class="material-icons">more_horiz</span>';

            const dropdown = document.createElement('div');
            dropdown.className = 'timetable-more-dropdown';

            dropdown.innerHTML = `
                                ${!isMacSafari ? `
                                <button type="button" class="menu-item share-week-btn" id="tt-act-share">
                                    <span class="material-icons">ios_share</span>Поделиться неделей
                                </button>` : ''}
                                <button type="button" class="menu-item" id="tt-act-summary">
                                    <span class="material-icons">pie_chart</span>Сводка нагрузки
                                </button>
                                <button type="button" class="menu-item" id="tt-act-add">
                                    <span class="material-icons">add_circle_outline</span>Добавить пару
                                </button>
                                <div class="menu-divider"></div>
                                <button type="button" class="menu-item" id="tt-act-consult">
                                    <span class="material-icons">support_agent</span>Консультации
                                </button>
                                <button type="button" class="menu-item" id="tt-act-sync">
                                    <span class="material-icons">sync</span>Синхронизация
                                </button>
                                ${detailHref ? `
                                <a href="${detailHref}" class="menu-item">
                                    <span class="material-icons">event_note</span>Подробное расписание
                                </a>` : ''}
                                ${feedbackHref ? `
                                <a href="${feedbackHref}" class="menu-item">
                                    <span class="material-icons">feedback</span>Оставить отзыв
                                </a>` : ''}
                            `;

            moreWrap.appendChild(moreBtn);
            moreWrap.appendChild(dropdown);
            wrapper.appendChild(moreWrap);

            weekSelect.remove();
            pageCtx.span9.prepend(wrapper);

            let nextNode = wrapper.nextSibling;
            while (nextNode && !nextNode.classList?.contains('timetable') && !nextNode.classList?.contains('day')) {
                const toDel = nextNode;
                nextNode = nextNode.nextSibling;
                toDel.remove();
            }

            moreBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('is-open');
            };

            document.addEventListener('click', (e) => {
                if (!moreWrap.contains(e.target)) {
                    dropdown.classList.remove('is-open');
                }
            });

            const shareWeekBtnEl = dropdown.querySelector('#tt-act-share');
            if (shareWeekBtnEl) {
                shareWeekBtnEl.onclick = () => {
                    dropdown.classList.remove('is-open');
                    openExportPreviewModal(null, 'Расписание.png', true);
                };
            }

            dropdown.querySelector('#tt-act-summary').onclick = () => {
                dropdown.classList.remove('is-open');
                openSummaryModal();
            };

            dropdown.querySelector('#tt-act-add').onclick = () => {
                dropdown.classList.remove('is-open');
                openCustomPairModal(null, true);
            };

            dropdown.querySelector('#tt-act-consult').onclick = () => {
                dropdown.classList.remove('is-open');
                openConsultationsModal(window.innerWidth <= 960 ? 'main_menu' : 'system_etis');
            };

            dropdown.querySelector('#tt-act-sync').onclick = () => {
                dropdown.classList.remove('is-open');
                openSyncModal('export');
            };

            dropdown.querySelectorAll('a.menu-item').forEach(a => {
                a.onclick = () => { dropdown.classList.remove('is-open'); };
            });
        }
    }

    // 8. Центрирование активной недели при загрузке (Мобильные)
    if (window.innerWidth <= 960) {
        const weeksContainer = pageCtx.span9.querySelector('.weeks');
        const activeWeek = pageCtx.span9.querySelector('.week.current');

        if (activeWeek && weeksContainer) {
            const performScroll = (behavior = 'smooth') => {
                const containerWidth = weeksContainer.offsetWidth;
                const weekWidth = activeWeek.offsetWidth;
                const weekLeft = activeWeek.offsetLeft;

                // Если ширина всё еще 0, значит DOM не готов, пропускаем
                if (containerWidth === 0) return;

                const scrollTarget = weekLeft - (containerWidth / 2) + (weekWidth / 2);

                weeksContainer.scrollTo({
                    left: scrollTarget,
                    behavior: behavior
                });
            };

            // 1. Пытаемся проскроллить мгновенно, как только скрипт дошел до этой точки
            requestAnimationFrame(() => performScroll('auto'));

            // 2. Пытаемся еще раз через 100мс (когда применятся CSS-трансформации)
            setTimeout(() => performScroll('smooth'), 100);

            // 3. Финальная попытка через 500мс (на случай долгой подгрузки шрифтов)
            setTimeout(() => performScroll('smooth'), 500);
        }
    }

    // --- ПОДСВЕТКА АКТУАЛЬНОЙ НЕДЕЛИ ---
    const urlParamsTT = new URLSearchParams(window.location.search);
    const weeksList = pageCtx.span9.querySelectorAll('.weeks .week');

    // Если в ссылке нет параметра p_week, значит мы на настоящей (текущей) неделе
    if (!urlParamsTT.has('p_week')) {
        const currentWeekEl = pageCtx.span9.querySelector('.week.current');
        if (currentWeekEl) {
            localStorage.setItem('etis_actual_week', currentWeekEl.textContent.trim());
        }
    }

    const actualWeekNum = localStorage.getItem('etis_actual_week');
    if (actualWeekNum) {
        weeksList.forEach(w => {
            // Красим текст, если это актуальная неделя, но мы сейчас НЕ на ней (нет класса current)
            if (w.textContent.trim() === actualWeekNum && !w.classList.contains('current')) {
                w.classList.add('actual-week');
            }
        });
    }

    // --- ЛОГИКА КАСТОМНЫХ ПАР ---
    const CUSTOM_PAIRS_KEY = 'etis_custom_pairs_v1';
    let customPairsRaw = JSON.parse(localStorage.getItem(CUSTOM_PAIRS_KEY) || '[]');

    // Умная функция дедупликации (помогает при слиянии данных с разных устройств)
    const deduplicatePairs = (pairs) => {
        const seenIds = new Set();
        const seenSignatures = new Set();
        return pairs.filter(p => {
            const cleanSubj = (p.subject || '').trim().toLowerCase();
            const cleanDay = (p.dayName || '').trim().toLowerCase();
            const cleanTime = (p.startTime || '').trim();
            const rec = (p.recurrence || 'once').trim().toLowerCase();

            // Формируем признак недели в зависимости от типа повторения
            const week = rec === 'every' ? 'every' : (rec === 'biweekly' ? ('biweekly_' + (p.addedWeek % 2)) : p.addedWeek);
            const signature = `${cleanDay}_${week}_${cleanTime}_${cleanSubj}`;

            if (seenIds.has(p.id) || seenSignatures.has(signature)) {
                return false;
            }
            seenIds.add(p.id);
            seenSignatures.add(signature);
            return true;
        });
    };

    let customPairs = deduplicatePairs(customPairsRaw);
    // Если локально были обнаружены и убраны дубликаты, перезаписываем чистую версию
    if (customPairs.length !== customPairsRaw.length) {
        localStorage.setItem(CUSTOM_PAIRS_KEY, JSON.stringify(customPairs));
    }

    function saveCustomPair(pair) {
        const existingIndex = customPairs.findIndex(p => p.id === pair.id);
        if (existingIndex > -1) customPairs[existingIndex] = pair;
        else customPairs.push(pair);
        saveSyncData(CUSTOM_PAIRS_KEY, JSON.stringify(customPairs));
    }

    function removeCustomPair(id) {
        customPairs = customPairs.filter(p => p.id !== id);
        saveSyncData(CUSTOM_PAIRS_KEY, JSON.stringify(customPairs));
    }

    // Вставка кастомных пар в DOM
    window.injectCustomPairs = function() {
        // Принудительно читаем самые свежие данные перед рендером
        customPairs = safeParseJSON(localStorage.getItem('etis_custom_pairs_v1'), []);

        const currentWeekEl = document.querySelector('.week.current');
        const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 1;

        const days = pageCtx.span9.querySelectorAll("div.day");
        days.forEach(day => {
            const dayNameEl = day.querySelector('.day-name');
            if (!dayNameEl) return;

            const currentDayName = dayNameEl.textContent.trim();
            const table = day.querySelector('table');
            if (!table) return;
            const tbody = table.querySelector('tbody') || table;

            customPairs.forEach(pair => {
                if (pair.dayName !== currentDayName) return;

                let shouldShow = false;
                if (pair.recurrence === 'once' && pair.addedWeek === currentWeek) shouldShow = true;
                if (pair.recurrence === 'every') shouldShow = true;
                if (pair.recurrence === 'biweekly' && (currentWeek % 2 === pair.addedWeek % 2)) shouldShow = true;

                if (shouldShow) {
                    // Жестко вычищаем плашку "Выходной / 0 пар", чтобы она не дублировалась
                    Array.from(tbody.querySelectorAll('tr')).forEach(r => {
                        if (r.textContent.includes('0 пар') || r.textContent.includes('Выходной')) r.remove();
                    });

                    let typeClass = 'type-badge-lek';
                    let typeColor = '';
                    if (pair.type === 'практ') typeClass = 'type-badge-pract';
                    else if (pair.type === 'лаб') typeClass = 'type-badge-lab';
                    else if (pair.type === 'экз' || pair.type === 'зач') typeClass = 'type-badge-exam';
                    else if (pair.type === 'конс') typeClass = 'type-badge-cons';
                    else if (pair.type === 'лич') { typeClass = ''; typeColor = 'color: #AF52DE;'; }

                    const tr = document.createElement('tr');
                    tr.className = 'custom-pair-row';
                    tr.setAttribute('data-custom-id', pair.id);
                    if (pair.endTime) tr.setAttribute('data-end-time', pair.endTime);

                    // Умное форматирование аудитории перед отрисовкой
                    let displayAud = pair.aud;
                    if (displayAud) {
                        if (generalConfig.shortAudFormat) {
                            // Если включен компактный вид, преобразуем "ауд. 413, к. 8, э. 4" -> "413/8"
                            const m = displayAud.match(/(?:ауд\.?\s*)?([0-9А-Яа-яa-zA-Z]+),\s*(?:к\.?\s*)?([0-9А-Яа-яa-zA-Z]+)/i);
                            if (m) {
                                displayAud = `${m[1]}/${m[2]}`;
                            }
                        } else {
                            // Если компактный вид выключен, расширяем "413/8" -> "ауд. 413, к. 8, э. 4"
                            if (displayAud.includes('/') && !displayAud.includes('http')) {
                                const parts = displayAud.split('/');
                                if (parts.length === 2) {
                                    const room = parts[0].trim();
                                    const building = parts[1].trim();
                                    const floorMatch = room.match(/\d/);
                                    const floor = floorMatch ? floorMatch[0] : '1';
                                    displayAud = `ауд. ${room}, к. ${building}, э. ${floor}`;
                                }
                            }
                        }
                    }

                    let teacherHtml = pair.teacher ? `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem;">person</span><span>${pair.teacher}</span></div>` : '';

                    tr.innerHTML = `
                                        <td class="pair_num">
                                            <div class="pair-badge-wrapper">
                                                <span class="pair-type-badge ${typeClass}" ${typeColor ? `style="${typeColor}"` : ''}>${pair.type === 'лич' ? 'ЛИЧ' : pair.type}</span>
                                            </div>
                                            1 пара<br><font class="eval">${pair.startTime}</font>
                                        </td>
                                        <td class="pair_info">
                                            <div class="dis" style="display: flex; align-items: center; flex-wrap: wrap;">
                                                <a href="#" style="pointer-events: none;">${pair.subject}</a>
                                            </div>
                                            ${(displayAud || teacherHtml) ? `
                                            <div class="aud" style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 6px;">
                                                ${displayAud ? `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>${displayAud}</div>` : ''}
                                                ${teacherHtml}
                                            </div>` : ''}
                                        </td>
                                        <td class="pair_teacher"></td>
                                    `;

                    tbody.appendChild(tr);
                }
            });

            // Сортировка строк по времени начала, чтобы пара встала в правильное место по времени
            const rows = Array.from(tbody.querySelectorAll('tr:not(.timetable-gap-row):not(.custom-no-pairs)'));
            rows.sort((a, b) => {
                const timeAStr = a.querySelector('.eval')?.textContent.split(':') || ['23','59'];
                const timeBStr = b.querySelector('.eval')?.textContent.split(':') || ['23','59'];
                return (parseInt(timeAStr[0])*60 + parseInt(timeAStr[1])) - (parseInt(timeBStr[0])*60 + parseInt(timeBStr[1]));
            });
            rows.forEach(r => tbody.appendChild(r));
        });
    }

    window.injectConsultationPairs = function() {
        if (typeof unmergeDaysOff === 'function') unmergeDaysOff();
        // Принудительно читаем самые свежие данные перед рендером
        setConsultationsFiles(safeParseJSON(localStorage.getItem('etis_consultation_files_v1'), []));

        const currentWeekEl = document.querySelector('.week.current');
        const currentWeekNum = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 1;
        const isEvenWeek = currentWeekNum % 2 === 0;

        const span9 = document.querySelector('.span9');
        if (!span9) return;
        const days = span9.querySelectorAll("div.day");

        const shortenName = (fullName) => {
            const parts = fullName.trim().split(/\s+/);
            if (parts.length >= 3) return `${parts[0]} ${parts[1][0].toUpperCase()}.${parts[2][0].toUpperCase()}.`;
            else if (parts.length === 2) return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
            return fullName;
        };

        consultationsFiles.forEach(file => {
            if (!file.isActive) return;

            file.teachers.forEach(teacher => {
                if (teacher.isActive !== true) return; // Добавляем в расписание только явно включенных преподавателей

                teacher.events.forEach(ev => {
                    if (ev.weekType === 'even' && !isEvenWeek) return;
                    if (ev.weekType === 'odd' && isEvenWeek) return;

                    days.forEach(day => {
                        const origDayName = day.getAttribute('data-orig-day-name') || day.querySelector('.day-name')?.textContent.trim() || '';
                        if (!origDayName || origDayName.toLowerCase() !== ev.dayName.toLowerCase()) return;

                        const table = day.querySelector('table');
                        if (!table) return;
                        const tbody = table.querySelector('tbody') || table;

                        Array.from(tbody.querySelectorAll('tr')).forEach(r => {
                            if (r.classList.contains('custom-no-pairs') || r.textContent.includes('0 пар') || r.textContent.includes('Выходной')) r.remove();
                        });

                        let audHtml = '';
                        if (ev.aud) {
                            let displayAud = ev.aud;
                            const m = ev.aud.match(/(\d+[а-яa-z]*)\s*[\/\\]\s*(\d+[а-яa-z]*)/i);
                            if (m) {
                                if (generalConfig.shortAudFormat) {
                                    displayAud = `${m[1]}/${m[2]}`;
                                } else {
                                    const floor = m[1].charAt(0);
                                    displayAud = `ауд. ${m[1]}, к. ${m[2]}, э. ${floor}`;
                                }
                            }
                            audHtml += `<div class="pair-aud-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem;">place</span><span>${displayAud}</span></div>`;
                        }

                        if (ev.link) {
                            let pName = "Онлайн";
                            let pClass = "";
                            let pColor = "#AF52DE";
                            if (ev.link.includes('zoom')) { pName = "Zoom"; pClass = "zoom-link"; pColor = "#2D8CFF"; }
                            else if (ev.link.includes('telemost')) { pName = "Телемост"; pClass = "telemost-link"; pColor = "#FF9500"; }
                            audHtml += `<a href="${sanitizeUrl(ev.link)}" target="_blank" rel="noopener noreferrer" class="pair-online-link ${pClass}" style="color: ${pColor} !important;"><span class="material-icons" style="font-size: 1.5rem; color: ${pColor} !important;">public</span><span>${pName}</span></a>`;
                        }

                        const tr = document.createElement('tr');
                        tr.className = 'custom-pair-row docx-consultation-row';
                        if (ev.endTime) tr.setAttribute('data-end-time', ev.endTime);

                        let timeHtml = `<font class="eval" style="font-size: 1.2rem; color: var(--color-text-primary); font-weight: 500; display: block;">${ev.startTime}</font>`;
                        if (ev.endTime) {
                            timeHtml += `<span style="font-size: 1.05rem; color: var(--color-text-secondary); display: block; margin-top: 2px;">${ev.endTime}</span>`;
                        }

                        let teacherHtml = `<div class="pair-teacher-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem; color: var(--color-text-secondary);">person</span><span>${shortenName(teacher.name)}</span></div>`;

                        tr.innerHTML = `
                                            <td class="pair_num">
                                                <div class="pair-badge-wrapper" style="margin-bottom: 6px;">
                                                    <span class="pair-type-badge" style="color: var(--color-text-secondary); font-weight: 800; font-size: 1.05rem; letter-spacing: 0.5px;">КОНС</span>
                                                </div>
                                                ${timeHtml}
                                            </td>
                                            <td class="pair_info">
                                                <div class="dis" style="display: flex; align-items: center; flex-wrap: wrap;">
                                                    <span style="font-weight: normal; font-size: 1.4rem; color: var(--color-text-primary);">Консультация</span>
                                                </div>
                                                <div class="aud" style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 6px;">
                                                    ${audHtml}
                                                    ${teacherHtml}
                                                </div>
                                            </td>
                                            <td class="pair_teacher"></td>
                                        `;

                        tbody.appendChild(tr);
                    });
                });
            });
        });

        // Сортировка времени
        days.forEach(day => {
            const table = day.querySelector('table');
            if (!table) return;
            const tbody = table.querySelector('tbody') || table;

            const rows = Array.from(tbody.querySelectorAll('tr:not(.timetable-gap-row):not(.custom-no-pairs)'));
            rows.sort((a, b) => {
                const timeAStr = a.querySelector('.eval')?.textContent.split(':') ||['23','59'];
                const timeBStr = b.querySelector('.eval')?.textContent.split(':') ||['23','59'];
                return (parseInt(timeAStr[0])*60 + parseInt(timeAStr[1])) - (parseInt(timeBStr[0])*60 + parseInt(timeBStr[1]));
            });
            rows.forEach(r => tbody.appendChild(r));
        });
    };

    // Вызываем сразу после объявления
    window.injectConsultationPairs();

    // --- ОФОРМЛЕНИЕ ЗАГОЛОВКОВ ДНЕЙ (ДАТЫ), КНОПКИ "+" И ШЕРИНГА ---
    const dayHeaders = pageCtx.span9.querySelectorAll('.day h3');
    dayHeaders.forEach(header => {
        const text = header.textContent.trim();
        const parts = text.split(',');

        let dayOfWeek = text;
        let datePart = '';

        if (parts.length >= 2) {
            dayOfWeek = parts[0].trim();
            datePart = parts.slice(1).join(',').trim();
        }

        const dayCard = header.closest('.day');
        if (dayCard) {
            dayCard.setAttribute('data-orig-day-name', dayOfWeek);
            dayCard.setAttribute('data-orig-date', datePart);
        }

        let leftDateHTML = '';
        let rightDateHTML = '';

        if (datePart) {
            if (generalConfig.datesLeft) {
                leftDateHTML = `<span>,</span>&nbsp;<span class="day-date" style="font-size: 1.4rem; color: var(--color-text-secondary); font-weight: 500;">${datePart}</span>`;
            } else {
                rightDateHTML = `<span class="day-date">${datePart}</span>`;
            }
        }

        const isInitialDayOff = dayCard && (
            dayCard.querySelector('.no_pairs') || 
            dayCard.querySelector('.custom-no-pairs') || 
            dayCard.textContent.includes('Выходной')
        );

        header.innerHTML = `
                            <div style="display:flex; align-items:center; gap: 6px;">
                                <div class="day-title-text-wrap" style="display:flex; align-items:center;">
                                    <span class="day-name">${dayOfWeek}</span>${leftDateHTML}
                                </div>
                                <span class="material-icons add-custom-pair-btn" title="Добавить свою пару">add</span>
                            </div>
                            <div class="day-header-right">
                                ${rightDateHTML}
                                <span class="material-icons share-day-btn" title="Поделиться днем" style="${isInitialDayOff ? 'display: none !important;' : ''}">ios_share</span>
                            </div>
                        `;

        header.querySelector('.add-custom-pair-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const dayCard = header.closest('.day');
            const isMerged = dayCard && dayCard.classList.contains('merged-day-off-head');
            
            // Если дни объединены — открываем выбор дня из сохраненного списка
            if (isMerged) {
                const mergedDays = (dayCard.getAttribute('data-merged-days') || '').split(',').map(s => s.trim()).filter(Boolean);
                if (mergedDays.length > 1) {
                    showChooseDayModal(mergedDays, (selectedDay) => {
                        openCustomPairModal(selectedDay, false, null);
                    });
                    return;
                }
            }
            
            const dayTitle = header.querySelector('.day-name')?.textContent.trim() || dayOfWeek;
            openCustomPairModal(dayTitle, false);
        });

        header.querySelector('.share-day-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const dayBlock = header.closest('.day');
            const fileName = `Расписание (${datePart || dayOfWeek}).png`;
            openExportPreviewModal(dayBlock, fileName, false);
        });
    });

    // Вставляем кастомные пары до пересчета расписания
    if (window.injectCustomPairs) window.injectCustomPairs();

    // --- ЛОГИКА ОПРЕДЕЛЕНИЯ ДЛИННЫХ СТРОК (ДЛЯ СДВИГА ПРЕПОДАВАТЕЛЯ) ---
    function markLongRows() {
        const isMobile = window.innerWidth <= 960;
        pageCtx.span9.querySelectorAll('.timetable-grid tr').forEach(row => {
            row.classList.remove('tr-needs-space'); // Сброс

            const aud = row.querySelector('.pair_info .aud');
            if (!aud) return;

            const isOnline = aud.querySelector('a') || aud.textContent.toLowerCase().includes('онлайн');
            const textLength = aud.textContent.trim().length;

            // Помечаем только реально "опасные" строки
            if (isOnline || textLength > 20) {
                row.classList.add('tr-needs-space');
            }
        });
    }
    markLongRows();

    // --- УМНЫЕ НАЗВАНИЯ НЕДЕЛЬ ---
    const weeksItems = pageCtx.span9.querySelectorAll('.weeks .week');
    weeksItems.forEach(w => {
        const link = w.querySelector('a');
        if (w.classList.contains('current')) {
            // Активная неделя - пишем "Х Неделя"
            const text = w.textContent.trim();
            const numMatch = text.match(/\d+/);
            if (numMatch) {
                if (link) link.innerHTML = '<span style="font-weight: 800;">' + numMatch[0] + '</span>&nbsp;<span style="font-weight: 800;">Неделя</span>';
                else w.innerHTML = '<span style="font-weight: 800;">' + numMatch[0] + '</span>&nbsp;<span style="font-weight: 800;">Неделя</span>';
            }
        } else if (link) {
            // Неактивная неделя - оставляем только цифру
            const text = link.textContent.trim();
            const numMatch = text.match(/\d+/);
            if (numMatch) {
                link.textContent = numMatch[0];
            }
        }
    });

   // --- ПАРСИНГ АУДИТОРИЙ И ОБЪЕДИНЕНИЕ С ПРЕПОДАВАТЕЛЕМ ---
    pageCtx.span9.querySelectorAll('.pair_info .aud').forEach(aud => {
        // 1. Сначала извлекаем и временно удаляем блок преподавателя
        const teacherWrap = aud.querySelector('.pair-teacher-wrap');
        let teacherWrapHtml = teacherWrap ? teacherWrap.outerHTML : '';
        if (teacherWrap) teacherWrap.remove();

        // 2. Читаем чистый текст только самой аудитории
        let text = aud.innerHTML;
        const linkEl = aud.querySelector('a[href*="zoom"], a[href*="telemost"], a.btn-generic-online, a[href*="http"]');

        const isOnlineText = /Дистанционно|on-line/i.test(text);
        const isZoom = linkEl && linkEl.href.includes('zoom');
        const isTelemost = linkEl && linkEl.href.includes('telemost');

        let locHtml = '';

        if (isOnlineText || linkEl) {
            let href = linkEl ? linkEl.href : '#';
            let pName = "Онлайн";
            let pClass = "";
            let pColor = "#AF52DE";

            if (isZoom) { pName = "Zoom"; pClass = "zoom-link"; pColor = "#2D8CFF"; }
            else if (isTelemost) { pName = "Телемост"; pClass = "telemost-link"; pColor = "#FF9500"; }

            if (linkEl) {
                locHtml = `<a href="${href}" target="_blank" class="pair-online-link ${pClass}" style="color: ${pColor} !important;"><span class="material-icons" style="font-size: 1.5rem; color: ${pColor} !important;">public</span><span>${pName}</span></a>`;
            } else {
                locHtml = `<div class="pair-online-link" style="display: inline-flex; align-items: center; gap: 4px; color: #AF52DE; font-size: 1.25rem; font-weight: 600;"><span class="material-icons" style="font-size: 1.5rem; color: #AF52DE;">public</span><span>Онлайн</span></div>`;
            }
        } else {
            let roomNumber = '';
            let building = '';

            const matchPhysical = text.match(/ауд\.\s*(.+?)\s*\((.+?)\s*корпус,\s*(.*?)\s*этаж\)/i);
            if (matchPhysical) {
                roomNumber = matchPhysical[1].trim();
                building = matchPhysical[2].trim();
                if (roomNumber.includes('/')) roomNumber = roomNumber.split('/')[0].trim();
            } else {
                const matchSlash = text.match(/(?:ауд\.?\s*)?(\d+[а-яa-z]*)\s*[\/\\]\s*(\d+[а-яa-z]*)/i);
                if (matchSlash) {
                    roomNumber = matchSlash[1].trim();
                    building = matchSlash[2].trim();
                } else {
                    const matchSingle = text.match(/ауд\.?\s*(\d+[а-яa-z]*)/i);
                    if (matchSingle) roomNumber = matchSingle[1].trim();
                }
            }

            if (roomNumber) {
                const audDisplay = building ? `${roomNumber}/${building}` : roomNumber;
                locHtml = `<div class="pair-aud-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem;">place</span><span>${audDisplay}</span></div>`;
            }
        }

        // 3. Собираем обратно в одну строку
        aud.innerHTML = locHtml + teacherWrapHtml;
    });

    // --- ПАРСИНГ ТИПА ПАРЫ (ЛЕК, ПРАКТ, ЛАБ, КОНС) ---
    pageCtx.span9.querySelectorAll('.timetable-grid tr').forEach(row => {
        // Пропускаем уже отформатированные DOCX консультации, кастомные и внешние события
        if (row.classList.contains('docx-consultation-row') || row.classList.contains('custom-pair-row') || row.classList.contains('external-event-row')) return;

        const disContainer = row.querySelector('.pair_info .dis');
        const numTd = row.querySelector('.pair_num');

        if (disContainer && numTd) {
            const targetEl = disContainer.querySelector('a') || disContainer;
            const text = targetEl.textContent;

            const match = text.match(/\s*\((лек|практ|лаб|зач|экз)\)\s*$/i);
            let type = '';
            let typeClass = 'type-badge-lek';

            const overType = row.getAttribute('data-ext-disp-type');

            if (overType !== null) {
                type = overType;
                if (match) targetEl.textContent = text.replace(match[0], '');
            } else {
                if (match) {
                    type = match[1].toLowerCase();
                    targetEl.textContent = text.replace(match[0], '');
                } else if (text.toLowerCase().includes('консультация')) {
                    type = 'конс';
                }
            }

            if (type) {
                if (type === 'лек') typeClass = 'type-badge-lek';
                else if (type === 'практ') typeClass = 'type-badge-pract';
                else if (type === 'лаб') typeClass = 'type-badge-lab';
                else if (type === 'зач' || type === 'экз') typeClass = 'type-badge-exam';
                else if (type === 'конс') typeClass = 'type-badge-cons';
                else if (type === 'лич') typeClass = '';

                const existingBadge = row.querySelector('.pair-type-badge');
                if (existingBadge) {
                    existingBadge.className = `pair-type-badge ${typeClass}`;
                    if (type === 'лич') { existingBadge.style.color = '#AF52DE'; existingBadge.textContent = 'ЛИЧ'; }
                    else { existingBadge.style.color = ''; existingBadge.textContent = type; }
                } else {
                    const badge = document.createElement('span');
                    badge.className = `pair-type-badge ${typeClass}`;
                    if (type === 'лич') { badge.style.color = '#AF52DE'; type = 'ЛИЧ'; }
                    badge.textContent = type;

                    const badgeWrapper = document.createElement('div');
                    badgeWrapper.className = 'pair-badge-wrapper';
                    badgeWrapper.appendChild(badge);

                    numTd.prepend(badgeWrapper);
                }
            }
        }
    });

    // Вызываем инъекцию DOCX перед основным пересчетом, чтобы они появились при первой загрузке!
    if (window.injectConsultationPairs) window.injectConsultationPairs();

    // --- ЛОГИКА СКРЫТИЯ ПУСТЫХ ПАР И ОБРАБОТКИ ОКОН ---
    window.recalculateTimetable = function() {
        if (typeof unmergeDaysOff === 'function') unmergeDaysOff();
        const days = pageCtx.span9.querySelectorAll("div.day");
        days.forEach(day => {
            const table = day.querySelector('table');
            if (!table) return;

            // Сначала удаляем все старые окна и плашки выходных
            table.querySelectorAll('.timetable-gap-row, .custom-no-pairs').forEach(r => r.remove());

            const rows = Array.from(table.querySelectorAll('tr'));
            if (rows.length === 1 && rows[0].textContent.includes('0 пар')) {
                rows[0].classList.add('custom-no-pairs');
                return;
            }

            // Отбираем только "занятые" строки
            const occupiedRows = rows.filter(row => {
                const info = row.querySelector('.pair_info');
                return info && info.textContent.replace(/\u00a0/g, ' ').trim().length > 0 && !row.classList.contains('hidden-by-filter');
            });

            // Скрываем все пустые "системные" строки ЕТИСа
            rows.forEach(r => {
                if (!occupiedRows.includes(r)) r.style.display = 'none';
                else r.style.display = '';
            });

            const tbody = table.querySelector('tbody') || table;

            if (occupiedRows.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'custom-no-pairs';
            tr.innerHTML = `
                                <td class="pair_num" style="border-bottom: none !important; border-right: none !important;">
                                    <div class="pair-badge-wrapper">
                                        <span class="pair-type-badge type-badge-holiday">ВЫХ</span>
                                    </div>
                                    0 пар<br><font class="eval">00:00</font>
                                </td>
                                <td class="pair_info" style="border-bottom: none !important; border-left: none !important;">
                                    <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(52, 199, 89, 0.12); color: var(--color-green); padding: 0.6rem 1.4rem; border-radius: 50px; font-weight: 700; font-size: 1.3rem; line-height: 1;">
                                        <span class="material-icons" style="font-size: 1.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">free_breakfast</span>
                                        Выходной
                                    </div>
                                </td>
                                <td class="pair_teacher" style="border-bottom: none !important;"></td>
                            `;
            tbody.appendChild(tr);
            
            // Скрываем кнопку поделиться у выходного дня
            const shareBtn = day.querySelector('.share-day-btn');
            if (shareBtn) shareBtn.style.setProperty('display', 'none', 'important');
            return;
        }

        // Если в дне есть занятия — показываем кнопку
        const shareBtn = day.querySelector('.share-day-btn');
        if (shareBtn) shareBtn.style.removeProperty('display');

            // Сортируем занятые строки по времени (на случай кастомных вставок)
            occupiedRows.sort((a, b) => {
                const timeA = a.querySelector('.eval')?.textContent || '';
                const timeB = b.querySelector('.eval')?.textContent || '';
                if (timeA === "Весь день") return -1;
                if (timeB === "Весь день") return 1;
                const pA = timeA.split(':');
                const pB = timeB.split(':');
                return (parseInt(pA[0]||0)*60 + parseInt(pA[1]||0)) - (parseInt(pB[0]||0)*60 + parseInt(pB[1]||0));
            });

            // Перевставляем в правильном порядке
            occupiedRows.forEach(r => tbody.appendChild(r));

            // --- ЛОГИКА РАСЧЕТА ОКОН И БОЛЬШОЙ ПЕРЕМЕНЫ ПО ВРЕМЕНИ ---
            if (generalConfig.showGaps) {
                for (let i = 1; i < occupiedRows.length; i++) {
                    const prevRow = occupiedRows[i - 1];
                    const currRow = occupiedRows[i];

                    const prevEval = prevRow.querySelector('.eval')?.textContent || '';
                    const currEval = currRow.querySelector('.eval')?.textContent || '';

                    if (prevEval === "Весь день" || currEval === "Весь день") continue;

                    let prevStartMins = 0, prevEndMins = 0;
                    const prevMatch = prevEval.match(/(\d{1,2}):(\d{2})/);
                    if (prevMatch) {
                        prevStartMins = parseInt(prevMatch[1]) * 60 + parseInt(prevMatch[2]);
                        const explicitEnd = prevRow.getAttribute('data-end-time');
                        if (explicitEnd) {
                            const ep = explicitEnd.split(':');
                            prevEndMins = parseInt(ep[0]) * 60 + parseInt(ep[1]);
                        } else {
                            prevEndMins = prevStartMins + 90;
                        }
                    }

                    let currStartMins = 0;
                    const currMatch = currEval.match(/(\d{1,2}):(\d{2})/);
                    if (currMatch) {
                        currStartMins = parseInt(currMatch[1]) * 60 + parseInt(currMatch[2]);
                    }

                    if (prevEndMins > 0 && currStartMins > 0) {
                        const gapMins = currStartMins - prevEndMins;

                        // 1. БОЛЬШАЯ ПЕРЕМЕНА (13:00 - 13:30 между 3 и 4 парой)
                        const isPrevAround3rd = (prevEndMins >= 765 && prevEndMins <= 795); // ~13:00
                        const isCurrAround4th = (currStartMins >= 800 && currStartMins <= 825); // ~13:30

                        if (generalConfig.showBigBreak !== false && isPrevAround3rd && isCurrAround4th) {
                            const breakRow = document.createElement('tr');
                            breakRow.className = 'timetable-gap-row timetable-break-row';
                            breakRow.setAttribute('data-gap-start', '13:00');
                            breakRow.setAttribute('data-gap-count', '0');

                            breakRow.innerHTML = `
                                                <td class="pair_num"></td>
                                                <td class="pair_info">
                                                    <div class="timetable-gap-capsule timetable-break-capsule">
                                                        <span class="material-icons">restaurant</span>
                                                        Перемена 30 минут
                                                    </div>
                                                </td>
                                                <td class="pair_teacher"></td>
                                            `;
                            currRow.parentNode.insertBefore(breakRow, currRow);
                        }
                        // 2. ОБЫЧНЫЕ ОКНА (>= 80 минут)
                        else if (generalConfig.showGaps && gapMins >= 80) {
                            const gapCount = Math.round(gapMins / 100);

                            if (gapCount > 0) {
                                const isPrevCustom = prevRow.classList.contains('custom-pair-row') || prevRow.classList.contains('external-event-row') || prevRow.classList.contains('docx-consultation-row');
                                const isCurrCustom = currRow.classList.contains('custom-pair-row') || currRow.classList.contains('external-event-row') || currRow.classList.contains('docx-consultation-row');

                                if ((isPrevCustom || isCurrCustom) && !generalConfig.showGapsCustom) {
                                    continue;
                                }

                                const gapRow = document.createElement('tr');
                                gapRow.className = 'timetable-gap-row';
                                gapRow.setAttribute('data-gap-start', `${String(Math.floor(prevEndMins/60)).padStart(2,'0')}:${String(prevEndMins%60).padStart(2,'0')}`);
                                gapRow.setAttribute('data-gap-count', gapCount);

                                let pairWord = 'пар';
                                if (gapCount === 1) pairWord = 'пара';
                                else if (gapCount >= 2 && gapCount <= 4) pairWord = 'пары';

                                gapRow.innerHTML = `
                                                    <td class="pair_num"></td>
                                                    <td class="pair_info">
                                                        <div class="timetable-gap-capsule">
                                                            <span class="material-icons" style="font-size: 14px;">hourglass_empty</span>
                                                            Окно: ${gapCount} ${pairWord}
                                                        </div>
                                                    </td>
                                                    <td class="pair_teacher"></td>
                                                `;
                                currRow.parentNode.insertBefore(gapRow, currRow);
                            }
                        }
                    }
                }
            }

            Array.from(table.querySelectorAll('tr')).forEach(r => r.style.removeProperty('background-image'));

            const visibleRows = Array.from(table.querySelectorAll('tr')).filter(r =>
                r.style.display !== 'none' && !r.classList.contains('hidden-by-filter')
            );

            if (visibleRows.length > 0) {
                visibleRows[visibleRows.length - 1].style.setProperty('background-image', 'none', 'important');
            }

            // --- ДИНАМИЧЕСКАЯ НУМЕРАЦИЯ, ОЧИСТКА И УНИФИКАЦИЯ ---
            const shortenName = (fullName) => {
                const parts = fullName.trim().split(/\s+/);
                if (parts.length >= 3) return `${parts[0]} ${parts[1][0].toUpperCase()}.${parts[2][0].toUpperCase()}.`;
                else if (parts.length === 2) return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
                return fullName;
            };

            let pairCounter = 1;
            visibleRows.forEach(row => {
                if (row.classList.contains('timetable-gap-row') || row.classList.contains('custom-no-pairs')) return;

                const numTd = row.querySelector('.pair_num');
                const typeBadge = row.querySelector('.pair-type-badge');
                const typeText = typeBadge ? typeBadge.textContent.toLowerCase() : '';
                const disText = row.querySelector('.dis')?.textContent.toLowerCase() || '';

                const isCons = row.classList.contains('consultation-row') ||
                            row.classList.contains('docx-consultation-row') ||
                            typeText.includes('конс') ||
                            disText.includes('консультация');

                const isPersonal = row.classList.contains('external-event-row') || typeText.includes('лич');

                if (isCons) {
                    // Унификация левой колонки для системных консультаций
                    if (row.classList.contains('consultation-row') && numTd) {
                        const timeEl = numTd.querySelector('.eval');
                        let timeText = timeEl ? (timeEl.textContent.match(/\d{1,2}:\d{2}/)?.[0] || '') : '';
                        numTd.innerHTML = `
                                            <div class="pair-badge-wrapper" style="margin-bottom: 6px;">
                                                <span class="pair-type-badge" style="color: var(--color-text-secondary); font-weight: 800; font-size: 1.05rem; letter-spacing: 0.5px;">КОНС</span>
                                            </div>
                                            <font class="eval" style="font-size: 1.2rem; color: var(--color-text-primary); font-weight: 500;">${timeText}</font>
                                        `;

                        const dis = row.querySelector('.dis');
                        if (dis) {
                            dis.innerHTML = `<span style="font-weight: normal; font-size: 1.4rem; color: var(--color-text-primary);">Консультация</span>`;
                        }

                        const teacherEl = row.querySelector('.pair_teacher a:not(.eval)');
                        if (teacherEl) {
                            teacherEl.textContent = shortenName(teacherEl.textContent);
                        }
                    }
                } else if (isPersonal) {
                    // Ничего не делаем, счетчик пар не увеличиваем (Личное событие из календаря)
                } else {
                    // Обычная нумерация для учебных пар (Лекции, Практики, и т.д.)
                    if (numTd) {
                        Array.from(numTd.childNodes).forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE && /пара/i.test(node.nodeValue)) {
                                node.nodeValue = node.nodeValue.replace(/\d+\s*пара/i, `${pairCounter} пара`);
                            }
                        });
                    }
                    pairCounter++;
                }
            });
        });

        if (typeof mergeConsecutiveDaysOff === 'function') mergeConsecutiveDaysOff();
        if (typeof window.applyHideDaysOff === 'function') window.applyHideDaysOff();
        if (typeof window.applyDimming === 'function') window.applyDimming();
        if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
    }

    // Экспортируем функцию скрытия дней наружу
    window.applyHideDaysOff = function() {
        if (typeof mergeConsecutiveDaysOff === 'function') {
            mergeConsecutiveDaysOff();
        }

        const days = document.querySelectorAll('.span9 .day');
        let visibleDaysCount = 0;

        days.forEach(day => {
            if (day.classList.contains('merged-day-off-hidden')) return;

            const visibleRows = Array.from(day.querySelectorAll('.timetable-grid tr')).filter(r => r.style.display !== 'none' && !r.classList.contains('hidden-by-filter'));
            const isDayOff = (visibleRows.length === 1 && visibleRows[0].classList.contains('custom-no-pairs')) || day.classList.contains('merged-day-off-head');

            if (generalConfig.hideDaysOff && isDayOff) {
                day.style.display = 'none';
            } else {
                day.style.display = '';
                visibleDaysCount++;
            }
        });

        const span9 = document.querySelector('.span9');
        if (span9) {
            updateEmptyState(span9, visibleDaysCount > 0, '', 'timetable');
        }
    };

    // --- ЗАМЕТКИ И РЕДАКТОР ПАР ---
    window.renderNotes = function() {
        let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
        const seenSubjects = new Set();
        const allRowsArray = Array.from(document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)'));

        const currentWeekEl = document.querySelector('.week.current');
        const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 0;

        allRowsArray.forEach((row, index) => {
            const disContainer = row.querySelector('.pair_info .dis');
            const numTd = row.querySelector('.pair_num');
            if (!disContainer || !numTd) return;

            const targetEl = disContainer.querySelector('a') || disContainer;

            let origSubject = row.getAttribute('data-orig-subject');
            if (!origSubject) {
                origSubject = targetEl.textContent.trim();
                row.setAttribute('data-orig-subject', origSubject);
            }

            const dayContainer = row.closest('.day');
            const dayDateEl = dayContainer ? dayContainer.querySelector('.day-date') : null;
            const dayDateStr = dayDateEl ? dayDateEl.textContent.trim() : 'UnknownDate';

            let rawPairNum = "";
            Array.from(numTd.childNodes).forEach(n => {
                if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) {
                    rawPairNum = n.nodeValue.trim();
                }
            });
            if (!rawPairNum) rawPairNum = numTd.textContent.trim().split(' ')[0] + ' пара';

            // Применение переопределений для стандартных пар
            const isExternal = row.classList.contains('external-event-row');
            const isPureCustom = row.classList.contains('custom-pair-row') && !isExternal;
            let isSeriesOverride = false;

            if (!isPureCustom && !isExternal) {
                const overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                const singleKey = `SINGLE_${dayDateStr}_${rawPairNum}_${origSubject}`;
                const seriesKey = `SERIES_ALL_${origSubject}`;

                // Фиксируем исходное системное время пары
                let origStartTime = row.getAttribute('data-orig-start-time');
                if (!origStartTime) {
                    const tMatch = numTd.querySelector('.eval')?.textContent.match(/\d{1,2}:\d{2}/);
                    origStartTime = tMatch ? tMatch[0] : '';
                    if (origStartTime) row.setAttribute('data-orig-start-time', origStartTime);
                }

                // Точное имя дня недели (Понедельник, Вторник и т.д.)
                const origDayName = row.closest('.day')?.getAttribute('data-orig-day-name') ||
                                    row.closest('.day')?.querySelector('.day-name')?.textContent.trim() || '';

                // Ключи безопасных серий
                const timeSeriesKey = `SERIES_TIME_${origStartTime}_${origSubject}`;
                const dayTimeSeriesKey = `SERIES_DAY_TIME_${origDayName}_${origStartTime}_${origSubject}`;

                let activeSingle = overrides[singleKey];
                let activeSeries = overrides[seriesKey];
                let activeTimeSeries = overrides[timeSeriesKey];
                let activeDayTimeSeries = overrides[dayTimeSeriesKey];

                let mergedOverride = {};
                let hasOverride = false;

                // 1. Серия: по названию предмета
                if (activeSeries) {
                    if (activeSeries.title) mergedOverride.title = activeSeries.title;
                    if (activeSeries.loc !== undefined) mergedOverride.loc = activeSeries.loc;
                    if (activeSeries.teacher !== undefined) mergedOverride.teacher = activeSeries.teacher;
                    if (activeSeries.type !== undefined) mergedOverride.type = activeSeries.type;
                    isSeriesOverride = true;
                    hasOverride = true;
                }
                // 2. Серия: по исходному времени + предмету
                if (activeTimeSeries) {
                    if (activeTimeSeries.title) mergedOverride.title = activeTimeSeries.title;
                    if (activeTimeSeries.loc !== undefined) mergedOverride.loc = activeTimeSeries.loc;
                    if (activeTimeSeries.teacher !== undefined) mergedOverride.teacher = activeTimeSeries.teacher;
                    if (activeTimeSeries.type !== undefined) mergedOverride.type = activeTimeSeries.type;
                    if (activeTimeSeries.timeStart) mergedOverride.timeStart = activeTimeSeries.timeStart;
                    if (activeTimeSeries.timeEnd) mergedOverride.timeEnd = activeTimeSeries.timeEnd;
                    hasOverride = true;
                }
                // 3. Серия: по дню недели + исходному времени + предмету
                if (activeDayTimeSeries) {
                    if (activeDayTimeSeries.title) mergedOverride.title = activeDayTimeSeries.title;
                    if (activeDayTimeSeries.loc !== undefined) mergedOverride.loc = activeDayTimeSeries.loc;
                    if (activeDayTimeSeries.teacher !== undefined) mergedOverride.teacher = activeDayTimeSeries.teacher;
                    if (activeDayTimeSeries.type !== undefined) mergedOverride.type = activeDayTimeSeries.type;
                    if (activeDayTimeSeries.timeStart) mergedOverride.timeStart = activeDayTimeSeries.timeStart;
                    if (activeDayTimeSeries.timeEnd) mergedOverride.timeEnd = activeDayTimeSeries.timeEnd;
                    hasOverride = true;
                }
                // 4. Индивидуально для конкретного дня
                if (activeSingle) {
                    if (activeSingle.title) mergedOverride.title = activeSingle.title;
                    if (activeSingle.loc !== undefined) mergedOverride.loc = activeSingle.loc;
                    if (activeSingle.teacher !== undefined) mergedOverride.teacher = activeSingle.teacher;
                    if (activeSingle.type !== undefined) mergedOverride.type = activeSingle.type;
                    if (activeSingle.timeStart) mergedOverride.timeStart = activeSingle.timeStart;
                    if (activeSingle.timeEnd) mergedOverride.timeEnd = activeSingle.timeEnd;
                    hasOverride = true;
                }

                if (hasOverride) {
                    if (mergedOverride.title) targetEl.textContent = mergedOverride.title;

                    let audEl = row.querySelector('.pair_info .aud');
                    if (!audEl && (mergedOverride.loc !== undefined || mergedOverride.teacher !== undefined)) {
                        audEl = document.createElement('div');
                        audEl.className = 'aud';
                        audEl.style.cssText = 'display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 6px;';
                        disContainer.parentNode.appendChild(audEl);
                    }

                    if (audEl) {
                        let locText = mergedOverride.loc !== undefined ? mergedOverride.loc : extractCleanLocation(row);
                        let teacherText = mergedOverride.teacher !== undefined ? mergedOverride.teacher : extractCleanTeacher(row);

                        let locHtml = '';
                        if (locText) {
                            locHtml = `<div class="pair-aud-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem;">place</span><span>${locText}</span></div>`;
                        }

                        let teacherHtml = '';
                        if (teacherText) {
                            teacherHtml = `<div class="pair-teacher-wrap" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem; color: var(--color-text-secondary);">person</span><span>${teacherText}</span></div>`;
                        }

                        audEl.innerHTML = locHtml + teacherHtml;

                        const teacherInRightCol = row.querySelector('.pair_teacher a:not(.eval), .pair_teacher span:not(.eval)');
                        if (teacherInRightCol) teacherInRightCol.remove();
                    }

                    if (mergedOverride.type !== undefined) {
                        row.setAttribute('data-ext-disp-type', mergedOverride.type);
                    }

                    if (mergedOverride.timeStart) {
                        const evalTimeEl = numTd.querySelector('.eval');
                        if (evalTimeEl) {
                            evalTimeEl.textContent = mergedOverride.timeStart;
                        }
                    }
                    if (mergedOverride.timeEnd) {
                        row.setAttribute('data-end-time', mergedOverride.timeEnd);
                    }
                    row.setAttribute('data-ext-is-series', isSeriesOverride);
                } else if (!isPureCustom && !isExternal) {
                    if (origSubject) targetEl.textContent = origSubject;
                    if (origStartTime) {
                        const evalTimeEl = numTd.querySelector('.eval');
                        if (evalTimeEl) evalTimeEl.textContent = origStartTime;
                    }
                    row.removeAttribute('data-ext-disp-type');
                    row.removeAttribute('data-end-time');
                    row.setAttribute('data-ext-is-series', 'false');
                }
            }

            let tempSubjEl = targetEl.cloneNode(true);
            tempSubjEl.querySelectorAll('.material-icons, .note-btn-wrapper, .delete-custom-pair-btn').forEach(el => el.remove());
            const cleanSubjectName = tempSubjEl.textContent.trim();

            let pairId = `${dayDateStr}_${rawPairNum}_${cleanSubjectName}`;
            if (cleanSubjectName.toLowerCase().includes('консультация')) {
                const timeEl = row.querySelector('.eval');
                if (timeEl) pairId += `_${timeEl.textContent.trim()}`;
                const teacherEl = row.querySelector('.pair_teacher a:not(.eval)');
                if (teacherEl) pairId += `_${teacherEl.textContent.trim()}`;
            }

            if (notesData.next_unbound && notesData.next_unbound[cleanSubjectName] && !seenSubjects.has(cleanSubjectName)) {
                const unbound = notesData.next_unbound[cleanSubjectName];
                if (currentWeek > unbound.week) {
                    notesData.specific[pairId] = unbound.text;
                    delete notesData.next_unbound[cleanSubjectName];
                    saveSyncData('etis_subject_notes_v2', JSON.stringify(notesData));

                    // Автоматически привязываем задачу Дневника к этой реальной паре
                    let dTasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
                    const floating = dTasks.find(x => x.isFloatingNext && x.subject?.toLowerCase() === cleanSubjectName.toLowerCase());
                    if (floating) {
                        const dDateIso = parseDayDateStrToISO(dayDateStr);
                        const tMatch = numTd.querySelector('.eval')?.textContent.match(/\d{1,2}:\d{2}/);
                        floating.pairId = pairId;
                        floating.deadlineDate = dDateIso;
                        floating.deadlineTime = tMatch ? tMatch[0] : '08:00';
                        floating.week = currentWeek;
                        floating.dayName = dayContainer?.querySelector('.day-name')?.textContent.trim() || '';
                        floating.isFloatingNext = false;
                        saveSyncData('etis_diary_tasks_v1', JSON.stringify(dTasks));
                    }
                }
            }
            seenSubjects.add(cleanSubjectName);

            const currentNote = notesData.specific[pairId] || '';

            let isPassed = false;
            if (dayDateStr !== 'UnknownDate') {
                const match = dayDateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                let classDate = new Date();
                if (match) {
                    const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                    if (m !== undefined) { classDate.setMonth(m); classDate.setDate(parseInt(match[1])); }
                } else {
                    const isoMatch = dayDateStr.match(/(\d{2})\.(\d{2})/);
                    if (isoMatch) { classDate.setMonth(parseInt(isoMatch[2])-1); classDate.setDate(parseInt(isoMatch[1])); }
                }
                classDate.setHours(0,0,0,0);
                const today = new Date(); today.setHours(0,0,0,0);

                if (classDate.getTime() < today.getTime()) isPassed = true;
                else if (classDate.getTime() === today.getTime()) {
                    const timeEl = numTd.querySelector('.eval');
                    if (timeEl) {
                        const parts = timeEl.textContent.trim().split(':');
                        if (parts.length === 2) {
                            const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                            const currentMins = new Date().getHours() * 60 + new Date().getMinutes();
                            if (currentMins >= startMins) isPassed = true;
                        }
                    }
                }
            }

            // Колокольчик важной пары
            const importantPairs = JSON.parse(localStorage.getItem('etis_important_pairs_v1') || '[]');
            const isImportant = importantPairs.includes(pairId);

            if (isImportant) row.classList.add('is-important');
            else row.classList.remove('is-important');

            row.querySelectorAll('.pair-important-btn').forEach(btn => btn.remove());

            if (!isPassed || isImportant) {
                const impBtn = document.createElement('button');
                impBtn.className = 'pair-important-btn';
                impBtn.title = isImportant ? "Снять отметку" : "Пометить как важную";
                impBtn.innerHTML = isImportant ? '<span class="material-icons" style="font-size:1.6rem;">notification_important</span>' : '<span class="material-icons" style="font-size:1.6rem;">notifications_none</span>';
                if (isImportant) impBtn.classList.add('is-active');

                impBtn.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    let imp = JSON.parse(localStorage.getItem('etis_important_pairs_v1') || '[]');
                    if (imp.includes(pairId)) imp = imp.filter(id => id !== pairId);
                    else imp.push(pairId);
                    saveSyncData('etis_important_pairs_v1', JSON.stringify(imp));
                    if (typeof window.renderNotes === 'function') window.renderNotes();
                });

                const typeBadge = numTd.querySelector('.pair-type-badge');
                if (typeBadge) typeBadge.appendChild(impBtn);
                else {
                    const fallbackWrapper = document.createElement('div');
                    fallbackWrapper.className = 'pair-badge-wrapper';
                    impBtn.style.position = 'static'; impBtn.style.transform = 'none';
                    fallbackWrapper.appendChild(impBtn);
                    numTd.prepend(fallbackWrapper);
                }
            }

            // Кнопка карандаша
            const noteBtn = document.createElement('button');
            noteBtn.className = 'subject-note-btn';
            if (currentNote) noteBtn.classList.add('has-note');
            noteBtn.title = "Заметки и настройки";
            noteBtn.innerHTML = '<span class="material-icons">edit</span>';

            noteBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                openPairModal(row, cleanSubjectName, origSubject, pairId, dayDateStr, rawPairNum, index, allRowsArray, currentNote, isExternal, isPureCustom);
            });

            const noteWrapper = document.createElement('span');
            noteWrapper.className = 'note-btn-wrapper';
            noteWrapper.style.display = 'inline-flex';
            noteWrapper.appendChild(noteBtn);

            const audContainer = row.querySelector('.pair_info .aud');
            let targetContainer = audContainer && audContainer.textContent.trim() !== '' ? audContainer : disContainer;
            
            targetContainer.querySelectorAll('.note-btn-wrapper, .pair-eval-btn').forEach(w => w.remove());
            targetContainer.appendChild(noteWrapper);

            // Кнопка оценки прошедшей пары доступна ТОЛЬКО для оригинальных системных пар ЕТИСа
            const isCustom = row.classList.contains('custom-pair-row');
            const isConsultation = row.classList.contains('docx-consultation-row') || row.classList.contains('consultation-row');
            const isNoPairs = row.classList.contains('custom-no-pairs');

            if (isPassed && !isExternal && !isCustom && !isConsultation && !isNoPairs) {
                const evalHref = window.etisEstimateTTHref || document.querySelector('a[href*="estimate_tt"]')?.getAttribute('href') || 'cust.estimate_tt_form';
                const evalA = document.createElement('a');
                evalA.className = 'eval pair-eval-btn';
                evalA.href = evalHref;
                evalA.title = 'Оценить занятие';
                evalA.innerHTML = '<span class="material-icons">star_rate</span><span>Оценить</span>';
                targetContainer.appendChild(evalA);
            }
        });
        markLongRows();
    };

    // Вызываем инициализацию свайпов
    initMobileSwipes();

    // Вызываем перерасчет сразу при загрузке расписания
    if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();

    // Запускаем отрисовку заметок при загрузке страницы
    if (window.renderNotes) window.renderNotes();

    // --- 10. ИМПОРТ И ПАРСИНГ ВНЕШНЕГО КАЛЕНДАРЯ (iCloud / Google) ---
    window.loadExternalCalendar = function() {
        let cals = migrateExternalCals();
        if (cals.length === 0) return;

        cals.forEach(cal => {
            let fetchUrl = cal.url.trim();
            const calColor = cal.color || '#AF52DE';

            if (fetchUrl.startsWith('webcal://')) {
                fetchUrl = fetchUrl.replace(/^webcal:\/\//i, 'https://');
            } else if (!fetchUrl.startsWith('http')) {
                fetchUrl = 'https://' + fetchUrl;
            }

            console.log("[ETIS Calendar] Отправляем запрос на:", fetchUrl);

            GM_xmlhttpRequest({
                method: "GET",
                url: fetchUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/calendar, text/plain, */*",
                    "Cache-Control": "no-cache"
                },
                timeout: 15000,
                onload: function(res) {
                    if (res.status >= 200 && res.status < 400) {
                        if (!res.responseText.includes('BEGIN:VCALENDAR')) {
                            console.error("[ETIS Calendar] Файл не является iCal.");
                            return;
                        }
                        try {
                            const events = parseICS(res.responseText);
                            console.log(`[ETIS Calendar] Успешно распарсено событий: ${events.length}`);
                            injectExternalEvents(events, calColor);
                        } catch (e) {
                            console.error("[ETIS Calendar] Ошибка при парсинге календаря:", e);
                        }
                    } else {
                        console.error(`[ETIS Calendar] Ошибка сервера: ${res.status}`);
                    }
                },
                onerror: function(err) {
                    console.error("[ETIS Calendar] Ошибка сети (Network Error):", err);
                }
            });
        });
    }

    function injectExternalEvents(parsedEvents, calColor) {
        let injectedAnything = false;
        const days = pageCtx.span9.querySelectorAll("div.day");

        console.log(`[ETIS Calendar] Поиск совпадений для ${days.length} дней на странице...`);

        days.forEach(day => {
            const dateSpan = day.querySelector('.day-date');
            if (!dateSpan) return;

            const dateStr = dateSpan.textContent.trim();
            let targetDate = null;

            const dateMatch = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (dateMatch) {
                targetDate = new Date(parseInt(dateMatch[3], 10), parseInt(dateMatch[2], 10)-1, parseInt(dateMatch[1], 10));
            } else {
                const monthsMap = { 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 };
                const textMatch = dateStr.match(/(\d{1,2})\s+([а-я]+)(?:\s+(\d{4}))?/i);

                if (textMatch && monthsMap[textMatch[2].toLowerCase()] !== undefined) {
                    const d = parseInt(textMatch[1], 10);
                    const m = monthsMap[textMatch[2].toLowerCase()];
                    let y;

                    if (textMatch[3]) {
                        y = parseInt(textMatch[3], 10);
                    } else {
                        const now = new Date();
                        y = now.getFullYear();
                        const curM = now.getMonth();

                        if (curM >= 9 && m <= 5) y++;
                        else if (curM <= 2 && m >= 7) y--;
                    }
                    targetDate = new Date(y, m, d);
                }
            }

            if (!targetDate) {
                console.warn("[ETIS Calendar] Не удалось распознать дату из заголовка ЕТИС:", dateStr);
                return;
            }
            targetDate.setHours(0, 0, 0, 0);

            const dayEvents = parsedEvents.filter(ev => eventOccursOnDate(ev, targetDate));
            if (dayEvents.length === 0) return;

            const table = day.querySelector('table');
            if (!table) return;
            const tbody = table.querySelector('tbody') || table;

            dayEvents.forEach((ev, idx) => {
                injectedAnything = true;

                Array.from(tbody.querySelectorAll('tr')).forEach(r => {
                    if (r.textContent.includes('0 пар') || r.textContent.includes('Выходной')) r.remove();
                });

                const isAllDay = ev.start.getHours() === 0 && ev.start.getMinutes() === 0 && (!ev.end || (ev.end.getHours() === 0 && ev.end.getMinutes() === 0));

                // Подготавливаем ключи для системы переопределений (Overrides)
                const originalTitle = ev.summary || 'Личное событие';
                const originalLoc = ev.location || '';
                const timeKey = isAllDay ? "Весь день" : `${String(ev.start.getHours()).padStart(2, '0')}:${String(ev.start.getMinutes()).padStart(2, '0')}`;
                const dateKey = `${targetDate.getFullYear()}${String(targetDate.getMonth()+1).padStart(2,'0')}${String(targetDate.getDate()).padStart(2,'0')}`;

                const overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                const singleKey = `SINGLE_${dateKey}_${timeKey}_${originalTitle}`;
                const seriesKey = `SERIES_${timeKey}_${originalTitle}`;

                let activeOverride = null;
                let isSeries = false;

                if (overrides[singleKey]) {
                    activeOverride = overrides[singleKey];
                } else if (overrides[seriesKey]) {
                    activeOverride = overrides[seriesKey];
                    isSeries = true;
                }

                // Применяем переопределения, если они есть
                const displayTitle = activeOverride && activeOverride.title ? activeOverride.title : originalTitle;
                const displayLoc = activeOverride && activeOverride.loc !== undefined ? activeOverride.loc : originalLoc;
                const displayTeacher = activeOverride && activeOverride.teacher ? activeOverride.teacher : '';
                const displayType = activeOverride && activeOverride.type !== undefined ? activeOverride.type : 'лич';

                // ИЗВЛЕЧЕНИЕ ССЫЛОК ИЗ КАЛЕНДАРЯ
                let extractedUrl = ev.url || '';
                if (!extractedUrl && ev.description) {
                    // Ищем любую ссылку в описании события
                    const urlMatch = ev.description.match(/(https?:\/\/[^\s<]+)/i);
                    if (urlMatch) extractedUrl = urlMatch[1];
                }
                if (!extractedUrl && originalLoc) {
                    // Или ищем ссылку в поле локации
                    const urlMatch = originalLoc.match(/(https?:\/\/[^\s<]+)/i);
                    if (urlMatch) extractedUrl = urlMatch[1];
                }

                // Генерируем контент для блока аудитории
                let audContent = '';
                if (displayLoc && !displayLoc.match(/^https?:\/\//i)) {
                    // Если локация это текст, а не ссылка, выводим с иконкой метки
                    audContent += `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>${displayLoc}</div>`;
                }
                if (extractedUrl) {
                    // Формируем красивую капсулу-кнопку для ссылки
                    let platformName = "Онлайн";
                    let linkClass = "btn-generic-online";

                    if (extractedUrl.includes('zoom.us')) { platformName = "Zoom"; linkClass = ""; }
                    else if (extractedUrl.includes('telemost')) { platformName = "Телемост"; linkClass = ""; }

                    audContent += `<a href="${extractedUrl}" target="_blank" class="${linkClass}">${platformName}</a>`;
                }

                // Форматируем время вывода
                let timeHtml = '';
                let endStr = '';
                if (isAllDay) {
                    timeHtml = `<font class="eval" style="display: flex !important; justify-content: center !important; font-size: 1.25rem !important; font-weight: 600 !important; color: var(--color-text-primary) !important; line-height: 1.2 !important; width: 100% !important;">Весь день</font>`;
                } else {
                    const startStr = timeKey;
                    endStr = ev.end ? `${String(ev.end.getHours()).padStart(2, '0')}:${String(ev.end.getMinutes()).padStart(2, '0')}` : '';

                    timeHtml = `<font class="eval" style="display: flex !important; justify-content: center !important; font-size: 1.25rem !important; font-weight: 600 !important; color: var(--color-text-primary) !important; margin-bottom: 2px !important; line-height: 1.2 !important; width: 100% !important;">${startStr}</font>`;
                    if (endStr) {
                        timeHtml += `<span style="display: block !important; text-align: center !important; font-size: 1.1rem !important; color: var(--color-text-secondary) !important; line-height: 1.2 !important; width: 100% !important;">${endStr}</span>`;
                    }
                }

                // Создаем строку, зашивая в data-атрибуты оригинальные данные (для редактора)
                const tr = document.createElement('tr');
                tr.className = 'custom-pair-row external-event-row';
                tr.style.setProperty('--ext-anim-delay', `${idx * 0.06}s`);
                tr.setAttribute('data-ext-orig-title', originalTitle.replace(/"/g, '&quot;'));
                tr.setAttribute('data-ext-orig-loc', originalLoc.replace(/"/g, '&quot;'));
                tr.setAttribute('data-ext-time', timeKey);
                tr.setAttribute('data-ext-date', dateKey);
                tr.setAttribute('data-ext-disp-title', displayTitle.replace(/"/g, '&quot;'));
                tr.setAttribute('data-ext-disp-loc', displayLoc.replace(/"/g, '&quot;'));
                tr.setAttribute('data-ext-disp-teacher', displayTeacher.replace(/"/g, '&quot;'));
                tr.setAttribute('data-ext-is-series', isSeries);
                tr.setAttribute('data-ext-disp-type', displayType);

                // Передаем спарсенное время окончания системным функциям скрипта
                if (endStr) {
                    tr.setAttribute('data-end-time', endStr);
                }

                let typeColor = '';
                let typeClass = '';
                if (displayType === 'лек') typeClass = 'type-badge-lek';
                else if (displayType === 'практ') typeClass = 'type-badge-pract';
                else if (displayType === 'лаб') typeClass = 'type-badge-lab';
                else if (displayType === 'зач' || displayType === 'экз') typeClass = 'type-badge-exam';
                else if (displayType === 'конс') typeClass = 'type-badge-cons';
                else if (displayType === 'лич') { typeColor = `color: ${calColor};`; }

                let teacherHtml = displayTeacher ? `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); font-size: 1.25rem;"><span class="material-icons" style="font-size: 1.5rem;">person</span><span>${displayTeacher}</span></div>` : '';

                tr.innerHTML = `
                                    <td class="pair_num">
                                        <div class="pair-badge-wrapper">
                                            <span class="pair-type-badge ${typeClass}" style="${typeColor}">${displayType === 'лич' ? 'ЛИЧ' : displayType}</span>
                                        </div>
                                        ${timeHtml}
                                    </td>
                                    <td class="pair_info">
                                        <div class="dis" style="display: flex; align-items: center; flex-wrap: wrap;">
                                            <span style="font-weight:700; color:var(--color-text-primary); pointer-events:none;">${displayTitle}</span>
                                        </div>
                                        ${(audContent || teacherHtml) ? `
                                        <div class="aud" style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 6px;">
                                            ${audContent}
                                            ${teacherHtml}
                                        </div>` : ''}
                                    </td>
                                    <td class="pair_teacher"></td>
                                `;
                tbody.appendChild(tr);
            });

            const rows = Array.from(tbody.querySelectorAll('tr:not(.timetable-gap-row):not(.custom-no-pairs)'));
            rows.sort((a, b) => {
                const timeA = a.querySelector('.eval')?.textContent || '';
                const timeB = b.querySelector('.eval')?.textContent || '';

                if (timeA === "Весь день") return -1;
                if (timeB === "Весь день") return 1;

                const timeAStr = timeA.split(':');
                const timeBStr = timeB.split(':');

                const valA = (parseInt(timeAStr[0], 10) || 0) * 60 + (parseInt(timeAStr[1], 10) || 0);
                const valB = (parseInt(timeBStr[0], 10) || 0) * 60 + (parseInt(timeBStr[1], 10) || 0);

                return valA - valB;
            });
            rows.forEach(r => tbody.appendChild(r));
        });

        if (injectedAnything) {
            if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            if (typeof window.renderNotes === 'function') window.renderNotes();
            if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
            if (typeof dimPastPairs === 'function') dimPastPairs();
        }
    }

    // Запуск логики
    if (window.loadExternalCalendar) window.loadExternalCalendar();

    updateLiveTimetable();

    window.applyDimming = dimPastPairs;

    // Сохранение расписания в кэш для Оффлайн-режима
    if (!pageCtx.isDemoActive) {
        try {
            const timetableContainer = document.querySelector('.span9');
            if (timetableContainer) {
                const clone = timetableContainer.cloneNode(true);

                // 1. Удаляем динамические элементы скрипта
                clone.querySelectorAll('.custom-pair-row, .docx-consultation-row, .timetable-toolbar, #swipe-action-bubble, .timetable-gap-row').forEach(el => el.remove());

                // 2. Восстанавливаем оригинальные дни недели, если они были объединены
                clone.querySelectorAll('.merged-day-off-hidden').forEach(d => {
                    d.style.removeProperty('display');
                    d.classList.remove('merged-day-off-hidden');
                });

                // 3. Очищаем заголовки h3 обратно в чистый исходный формат ЕТИС: "Понедельник, 7 сентября"
                clone.querySelectorAll('.day').forEach(dayEl => {
                    const origName = dayEl.getAttribute('data-orig-day-name') || dayEl.querySelector('.day-name')?.textContent.trim();
                    const origDate = dayEl.getAttribute('data-orig-date') || dayEl.querySelector('.day-date')?.textContent.trim();

                    const h3 = dayEl.querySelector('h3');
                    if (h3 && origName) {
                        h3.className = '';
                        h3.removeAttribute('style');
                        h3.innerHTML = origDate ? `${escapeHTML(origName)}, ${escapeHTML(origDate)}` : escapeHTML(origName);
                    }
                });

                localStorage.setItem('etis_offline_timetable_html', clone.innerHTML);
            }
        } catch(e) { console.error('[Offline Cache Error]', e); }
    }

    // Запуск расчета индикаторов и затемнения сразу
    updateLiveTimetable();
    dimPastPairs();

    // Регулярный опрос в реальном времени каждые 15 секунд
    setInterval(() => {
        updateLiveTimetable();
        dimPastPairs();
    }, 15000);

    // Мгновенный пересчет при переключении/возвращении на вкладку
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateLiveTimetable();
            dimPastPairs();
        }
    });
    window.addEventListener('focus', () => {
        updateLiveTimetable();
        dimPastPairs();
    });

    return;
}
