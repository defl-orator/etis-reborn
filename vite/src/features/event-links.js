import { saveSyncData } from '../sync/data.js';

// Словарь месяцев в родительном падеже для парсинга дат
const monthsDict = { 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 };

// Подсветка дат и событий в HTML объявления для быстрого добавления
export function highlightDatesInHTML(html, msgTitle) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // 1. Текстовая дата: поддерживает дни недели до/после, года и диапазоны времени ("29 сентября (вторник) с 10.00 до 16.00")
    const regex1 = /(?:(?:в|во)\s+(?:понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс)[,\s]+)?(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+20\d{2}(?:\s*г(?:ода|\.)?)?)?(?:[,\s]*\((?:понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс)\)|,\s*(?:понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс))?(?:\s*(?:(?:в|с|к)\s+)?(\d{1,2})[:.](\d{2})(?:\s*(?:(?:до|[-–—]|по)\s*|[-–—]\s*)(\d{1,2})[:.](\d{2}))?(?:\s*(?:час(?:ов|а)?|ч\.?))?)?/ig;

    // 2. Числовая дата: "29.09.2026 с 10.00 до 16.00" или "29.09 в 10:00"
    const regex2 = /(?:(?:в|во)\s+(?:понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс)[,\s]+)?(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])(?:\.(?:20)?\d{2})?(?:[,\s]*\((?:понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс)\)|,\s*(?:понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс))?(?:\s*(?:(?:в|с|к)\s+)?(\d{1,2})[:.](\d{2})(?:\s*(?:(?:до|[-–—]|по)\s*|[-–—]\s*)(\d{1,2})[:.](\d{2}))?(?:\s*(?:час(?:ов|а)?|ч\.?))?)?/ig;

    // УМНЫЙ ПОИСК АУДИТОРИИ И МЕСТ КАМПУСА
    let aud = '';
    // Ауд / каб с корпусом через слэш или "к.": "ауд. 413/8", "каб. 214 к. 8"
    let audMatch = html.match(/(?:в\s+)?(?:ауд(?:итории|\.)?|каб(?:инет[е]?|\.)?)\s*№?\s*(\d+[а-яa-z]*)\s*(?:[\/\\]|,\s*(?:к(?:орп(?:ус)?)?\.?\s*№?|\s*к\.))\s*(\d+[а-яa-z]*)/i);
    if (audMatch) {
        let room = audMatch[1];
        let building = audMatch[2];
        let floor = room.charAt(0);
        aud = `ауд. ${room}, к. ${building}, э. ${floor}`;
    } else {
        // Корпус в скобках: "кабинет 319 (корпус №2)"
        let audMatchParen = html.match(/(?:каб(?:инет[е]?|\.)?|ауд(?:итории|\.)?)\s*№?\s*(\d+[а-яa-z]*)\s*\((?:корпус\s*№?|к\.)\s*(\d+)\)/i);
        if (audMatchParen) {
            let room = audMatchParen[1];
            let building = audMatchParen[2];
            let floor = room.charAt(0);
            aud = `ауд. ${room}, к. ${building}, э. ${floor}`;
        } else {
            // Одиночная аудитория или кабинет
            let audMatchSingle = html.match(/(?:в\s+)?(?:ауд(?:итории|\.)?|каб(?:инет[е]?|\.)?)\s*№?\s*(\d+[а-яa-z]*)/i);
            if (audMatchSingle) {
                let room = audMatchSingle[1];
                let floor = room.charAt(0);
                aud = `ауд. ${room}, э. ${floor}`;
            } else {
                // Локации типа "на втором этаже СДК", "в актовом зале", "читальный зал"
                let placeMatch = html.match(/(?:(?:на|в)\s+)?((?:[1-9]|первом|втором|третьем|четв[её]ртом|пятом)\s+этаже?\s+)?(сдк|актов(?:ом|ый)\s*зал|спортзал[е]?|манеж[е]?|читальн(?:ом|ый)\s*зал|деканат[е]?)/i);
                if (placeMatch) {
                    const floorWordMap = { 'первом': '1', 'втором': '2', 'третьем': '3', 'четвертом': '4', 'четвёртом': '4', 'пятом': '5' };
                    let floorPart = placeMatch[1] ? placeMatch[1].replace(/этаже?/i, '').trim().toLowerCase() : '';
                    let floorNum = floorWordMap[floorPart] || (floorPart.match(/\d/) ? floorPart.match(/\d/)[0] : '');
                    let placeName = placeMatch[2].trim();
                    if (/^сдк$/i.test(placeName)) placeName = 'СДК';
                    else placeName = placeName.charAt(0).toUpperCase() + placeName.slice(1);
                    aud = floorNum ? `${placeName}, ${floorNum} этаж` : placeName;
                }
            }
        }
    }

    // Онлайн ссылки (Zoom, Телемост)
    if (!aud) {
        let linkMatch = html.match(/href="(https?:\/\/[^"]+)"/i);
        if (linkMatch && (linkMatch[1].includes('zoom') || linkMatch[1].includes('telemost'))) {
            aud = linkMatch[1];
        }
    }

    // Определение лучшего заголовка для события
    let fallbackTitle = msgTitle;
    if (!fallbackTitle || fallbackTitle === 'Объявление') {
        const cleanAllText = temp.textContent.replace(/\s+/g, ' ').trim();
        const sentences = cleanAllText.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 10);
        if (sentences.length > 0) {
            fallbackTitle = sentences[0];
            if (fallbackTitle.length > 60) fallbackTitle = fallbackTitle.substring(0, 60) + '...';
        } else {
            fallbackTitle = 'Объявление';
        }
    }

    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    let node;

    while (node = walker.nextNode()) {
        if (node.parentNode && (node.parentNode.tagName === 'A' || node.parentNode.classList.contains('msg-event-link'))) continue;
        nodesToReplace.push(node);
    }

    nodesToReplace.forEach(txtNode => {
        let text = txtNode.nodeValue;
        let replaced = false;

        regex1.lastIndex = 0;
        if (regex1.test(text)) {
            regex1.lastIndex = 0;
            text = text.replace(regex1, (match, d, m, hr, min, endHr, endMin) => {
                replaced = true;
                return createEventTag(match, d, monthsDict[m.toLowerCase()], hr, min, fallbackTitle, aud, endHr, endMin);
            });
        }

        regex2.lastIndex = 0;
        if (regex2.test(text)) {
            regex2.lastIndex = 0;
            text = text.replace(regex2, (match, d, m, hr, min, endHr, endMin) => {
                replaced = true;
                return createEventTag(match, d, parseInt(m, 10) - 1, hr, min, fallbackTitle, aud, endHr, endMin);
            });
        }

        if (replaced) {
            const span = document.createElement('span');
            span.innerHTML = text;
            txtNode.parentNode.replaceChild(span, txtNode);
        }
    });

    return temp.innerHTML;
}

// Формирование HTML-тега события с очищенным заголовком и метаданными
function createEventTag(match, d, m, hr, min, title, aud, endHr, endMin) {
    let cleanTitle = (title || 'Объявление');

    // Очистка названия от времени, дат и мест
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:в|с|до|по)?\s*\d{1,2}[:.]\d{2}(?:\s*(?:до|[-–—]|по)\s*\d{1,2}[:.]\d{2})?(?=\s|$|[.,])/ig, ' ');
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:в|во)?\s*(?:\([а-яa-z]+\)|понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс)(?=\s|$|[.,\)])/ig, ' ');
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:с|до|по)?\s*\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+20\d{2}(?:\s*г(?:ода|\.)?)?)?/ig, ' ');
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:с|до|по)?\s*\d{2}\.\d{2}(?:\.\d{2,4})?/ig, ' ');
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:в|на)?\s*(?:ауд(?:итории|\.)?|каб(?:инет[е]?|\.)?)\s*№?\s*\d+[/а-яa-z0-9\\]*/ig, ' ');
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:на\s+)?(?:[1-9]|первом|втором|третьем|четв[её]ртом|пятом)\s+этаже?\s+сдк/ig, ' ');
    cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:состоится|пройдет|пройдёт)(?=\s|$)/ig, ' ');

    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
    cleanTitle = cleanTitle.replace(/\s+(в|во|с|на|до|по|к|от)$/ig, '').trim();
    cleanTitle = cleanTitle.replace(/^[.,\s\-:;()]+|[.,\s\-:;()]+$/g, '').trim();

    if (!cleanTitle || cleanTitle.length < 3) cleanTitle = 'Мероприятие';

    cleanTitle = cleanTitle.replace(/"/g, '&quot;');
    const cleanAud = (aud || '').replace(/"/g, '&quot;');

    const startH = (hr || '08').padStart(2, '0');
    const startM = (min || '00').padStart(2, '0');
    const endH = endHr ? endHr.padStart(2, '0') : '';
    const endM = endMin ? endMin.padStart(2, '0') : '';

    const hash = `evt_${d}_${m}_${startH}_${startM}_${cleanTitle.substring(0,8)}`.replace(/\s+/g, '');
    return `<span class="msg-event-link" data-hash="${hash}" data-d="${d}" data-m="${m}" data-hr="${startH}" data-min="${startM}" ${endH ? `data-endhr="${endH}" data-endmin="${endM}"` : ''} data-title="${cleanTitle}" data-aud="${cleanAud}">${match}</span>`;
}

// Инициализация кликов по выделенным событиям для добавления в расписание или дневник
export function initEventLinks() {
    document.querySelectorAll('.msg-event-link').forEach(el => {
        const hash = el.getAttribute('data-hash');

        const checkAdded = () => {
            const added = JSON.parse(localStorage.getItem('etis_added_msg_events') || '[]');
            return added.includes(hash);
        };

        if (checkAdded()) el.classList.add('added');

        el.onclick = (e) => {
            e.stopPropagation();

            const d = parseInt(el.dataset.d, 10);
            const m = parseInt(el.dataset.m, 10);
            const hr = (el.dataset.hr || '08').padStart(2, '0');
            const min = (el.dataset.min || '00').padStart(2, '0');
            const aud = el.dataset.aud || '';
            const endHr = el.dataset.endhr;
            const endMin = el.dataset.endmin;
            const title = el.dataset.title;

            // Расчет целевой даты и недели
            const now = new Date();
            let targetDate = new Date(now.getFullYear(), m, d);
            if (targetDate < now && (now.getMonth() - m) > 6) targetDate.setFullYear(now.getFullYear() + 1);

            const getMon = (date) => {
                const dt = new Date(date);
                dt.setDate(dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1));
                return dt.setHours(0, 0, 0, 0);
            };
            const weekDiff = Math.round((getMon(targetDate) - getMon(now)) / (7 * 24 * 3600 * 1000));
            const targetWeek = parseInt(localStorage.getItem('etis_actual_week') || '1', 10) + weekDiff;

            let endTimeStr = '';
            if (endHr && endMin) {
                endTimeStr = `${endHr.padStart(2, '0')}:${endMin.padStart(2, '0')}`;
            } else {
                let eM = parseInt(min, 10) + 90;
                let eH = parseInt(hr, 10) + Math.floor(eM / 60);
                endTimeStr = `${(eH % 24).toString().padStart(2, '0')}:${(eM % 60).toString().padStart(2, '0')}`;
            }

            const dayName = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"][targetDate.getDay()];
            const yyyy = targetDate.getFullYear();
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const dd = String(targetDate.getDate()).padStart(2, '0');
            const dateIso = `${yyyy}-${mm}-${dd}`;

            // Проверяем статус в расписании и в дедлайнах
            let addedMsgs = JSON.parse(localStorage.getItem('etis_added_msg_events') || '[]');
            let cp = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
            let diaryTasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');

            const isInTimetable = cp.some(p => p.msgHash === hash);
            const isInDiary = diaryTasks.some(t => t.id === 'diary_' + hash);

            let overlay = document.getElementById('etis-event-choice-overlay');
            let modal = document.getElementById('etis-event-choice-modal');

            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'etis-event-choice-overlay';
                overlay.className = 'analytics-overlay';
                document.body.appendChild(overlay);
            }
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'etis-event-choice-modal';
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
                                <span style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary);">Действие с событием</span>
                                <span class="material-icons close-choice-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                            </div>
                            <div class="ui-dialog-content" style="padding: 2rem 2.4rem 2.4rem 2.4rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px; line-height: 1.3;">${title}</div>
                                <div style="font-size: 1.25rem; color: var(--color-text-secondary); margin-bottom: 2rem; line-height: 1.4;">
                                    ${dayName}, ${d}.${String(m + 1).padStart(2, '0')} (${hr}:${min}${endTimeStr ? '–' + endTimeStr : ''}) ${aud ? '• ' + aud : ''}
                                </div>

                                <div class="ios-settings-group" style="margin-bottom: 0 !important;">
                                    <!-- В расписание -->
                                    <div class="ios-settings-row" id="add-to-timetable-action" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span class="material-icons" style="color: var(--color-blue); font-size: 2.2rem;">calendar_month</span>
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">
                                                    ${isInTimetable ? 'Удалить из расписания' : 'Добавить в расписание'}
                                                </span>
                                                <span style="font-size: 1.15rem; color: var(--color-text-secondary);">
                                                    ${isInTimetable ? 'Пара уже добавлена' : 'Появится в сетке пар как занятие'}
                                                </span>
                                            </div>
                                        </div>
                                        <span class="material-icons" style="color: ${isInTimetable ? 'var(--color-red)' : 'var(--color-accent)'};">
                                            ${isInTimetable ? 'delete_outline' : 'chevron_right'}
                                        </span>
                                    </div>

                                    <!-- Как дедлайн в дневник -->
                                    <div class="ios-settings-row" id="add-to-diary-action" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span class="material-icons" style="color: var(--color-warning); font-size: 2.2rem;">alarm</span>
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-size: 1.4rem; font-weight: 600; color: var(--color-text-primary);">
                                                    ${isInDiary ? 'Удалить из дедлайнов' : 'Добавить как дедлайн'}
                                                </span>
                                                <span style="font-size: 1.15rem; color: var(--color-text-secondary);">
                                                    ${isInDiary ? 'Задача уже в дневнике' : 'Будет отображаться во вкладке «Дедлайны»'}
                                                </span>
                                            </div>
                                        </div>
                                        <span class="material-icons" style="color: ${isInDiary ? 'var(--color-red)' : 'var(--color-accent)'};">
                                            ${isInDiary ? 'delete_outline' : 'chevron_right'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;

            modal.querySelector('.close-choice-btn').onclick = closeModal;

            modal.querySelector('#add-to-timetable-action').onclick = () => {
                closeModal();
                let currentCP = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                let currentAdded = JSON.parse(localStorage.getItem('etis_added_msg_events') || '[]');

                if (isInTimetable) {
                    currentCP = currentCP.filter(p => p.msgHash !== hash);
                    currentAdded = currentAdded.filter(h => h !== hash);
                    el.classList.remove('added');
                    if (window.showEtisPush) window.showEtisPush('Удалено', title, 'Событие убрано из расписания', 'info', 'event_busy', null, null, false);
                } else {
                    let eventType = 'лич';
                    const lowerTitle = title.toLowerCase();
                    if (lowerTitle.includes('консультац')) eventType = 'конс';
                    else if (lowerTitle.includes('лаб')) eventType = 'лаб';
                    else if (lowerTitle.includes('практ') || lowerTitle.includes('семинар')) eventType = 'практ';
                    else if (lowerTitle.includes('лекц')) eventType = 'лек';
                    else if (lowerTitle.includes('экзамен') || lowerTitle.includes('пересдач') || lowerTitle.includes('зачет') || lowerTitle.includes('зачёт')) eventType = 'экз';

                    currentCP.push({
                        id: 'cp_' + Date.now(),
                        addedWeek: targetWeek,
                        dayName: dayName,
                        subject: title,
                        startTime: `${hr}:${min}`,
                        endTime: endTimeStr,
                        type: eventType,
                        recurrence: 'once',
                        aud: aud,
                        teacher: '',
                        msgHash: hash
                    });

                    if (!currentAdded.includes(hash)) currentAdded.push(hash);
                    el.classList.add('added');

                    if (window.showEtisPush) {
                        window.showEtisPush('Добавлено в расписание', title, `${targetWeek} нед, ${dayName} (${hr}:${min})`, 'success', 'event_available', null, null, false);
                    }
                }

                saveSyncData('etis_custom_pairs_v1', JSON.stringify(currentCP));
                localStorage.setItem('etis_added_msg_events', JSON.stringify(currentAdded));
            };

            modal.querySelector('#add-to-diary-action').onclick = () => {
                closeModal();
                let currentDiary = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');

                if (isInDiary) {
                    currentDiary = currentDiary.filter(t => t.id !== 'diary_' + hash);
                    if (window.showEtisPush) window.showEtisPush('Удалено', title, 'Дедлайн убран из дневника', 'info', 'alarm_off', null, null, false);
                } else {
                    currentDiary.push({
                        id: 'diary_' + hash,
                        pairId: null,
                        subject: 'Объявление',
                        title: title,
                        details: aud ? `Аудитория/место: ${aud}` : '',
                        deadlineDate: dateIso,
                        deadlineTime: `${hr}:${min}`,
                        week: targetWeek,
                        dayName: dayName,
                        completed: false,
                        completedAt: null
                    });
                    if (window.showEtisPush) window.showEtisPush('Дедлайн добавлен', title, `Срок сдачи: ${dateIso} ${hr}:${min}`, 'success', 'alarm_on', null, null, false);
                }

                saveSyncData('etis_diary_tasks_v1', JSON.stringify(currentDiary));
            };

            requestAnimationFrame(() => {
                overlay.classList.add('active');
                modal.classList.add('active');
                document.body.classList.add('modal-open-body');
            });
        };
    });
}
