import { generalConfig } from '../core/config.ts';
import { saveSyncData } from '../sync/data.ts';

// Форматирует оставшееся количество минут в компактный вид для таймера пары
function formatTimerDuration(mins) {
    if (mins <= 0) return '< 1 мин';
    if (mins < 60) return `${mins} мин`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} ч` : `${h}ч ${m}м`;
}

// Обновление индикаторов текущих, скорых и завершающихся пар в расписании
export function updateLiveTimetable() {
    const actualWeek = localStorage.getItem('etis_actual_week');

    // 1. Проверяем параметры URL (у студентов p_week, у преподавателей P_WEEK)
    const urlParams = new URLSearchParams(window.location.search);
    const urlWeek = urlParams.get('p_week') || urlParams.get('P_WEEK');
    if (urlWeek && urlWeek !== actualWeek) return;

    // 2. Проверяем напрямую элемент в DOM (т.к. у преподов неделя переключается через POST запрос без смены URL)
    const currentWeekEl = document.querySelector('.weeks .week.current');
    if (currentWeekEl && actualWeek) {
        const viewedWeek = currentWeekEl.textContent.replace(/\D/g, '').trim();
        if (viewedWeek && viewedWeek !== actualWeek) return;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const daysMap =["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const todayName = daysMap[currentDay];

    document.querySelectorAll('.day').forEach(dayBlock => {
        const dayHeaderName = dayBlock.querySelector('.day-name');
        if (!dayHeaderName) return;

        // Очищаем ВСЕ старые точки, таймеры и иконки статуса в этом дне и восстанавливаем исходное время
        dayBlock.querySelectorAll('.live-dot, .live-timer-badge, .day-status-icon').forEach(dot => dot.remove());
        dayBlock.querySelectorAll('.pair_num .eval[data-orig-time]').forEach(el => {
            el.textContent = el.getAttribute('data-orig-time');
            el.removeAttribute('data-orig-time');
            el.style.color = '';
            el.style.fontWeight = '';
            el.style.lineHeight = '';
            el.style.flexDirection = '';
            el.style.gap = '';
        });

        const mergedDaysAttr = dayBlock.getAttribute('data-merged-days');
        const isToday = (dayHeaderName.textContent.trim() === todayName) ||
                        (mergedDaysAttr && mergedDaysAttr.split(',').includes(todayName));

        if (isToday) {
            let hasRealPairs = false;
            let lastPairEnd = 0;
            let firstPairStart = 24 * 60; // Для отслеживания начала первой пары

            dayBlock.querySelectorAll('.timetable-grid tr').forEach(row => {
                if (row.classList.contains('custom-no-pairs') || row.style.display === 'none') return;

                let startTimeStr = "";
                let duration = 90;
                let explicitEndTimeStr = row.getAttribute('data-end-time');

                if (row.classList.contains('timetable-gap-row')) {
                    startTimeStr = row.getAttribute('data-gap-start');
                    const count = parseInt(row.getAttribute('data-gap-count') || "1");
                    duration = count === 0 ? 30 : ((count * 90) + ((count - 1) * 10));
                } else {
                    const timeEl = row.querySelector('.eval');
                    if (timeEl) {
                        const rawTime = timeEl.getAttribute('data-orig-time') || timeEl.textContent;
                        const match = rawTime.match(/\d{1,2}:\d{2}/);
                        if (match) startTimeStr = match[0];
                    }
                }

                if (!startTimeStr || startTimeStr === "00:00" || startTimeStr === "Весь день") return;

                hasRealPairs = true;
                const parts = startTimeStr.split(':');
                const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);

                let endMins;
                if (explicitEndTimeStr) {
                    const endParts = explicitEndTimeStr.split(':');
                    endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                } else {
                    endMins = startMins + duration;
                }

                if (startMins < firstPairStart) firstPairStart = startMins;
                if (endMins > lastPairEnd) lastPairEnd = endMins;

                let type = "";
                if (currentTime >= startMins && currentTime <= endMins) {
                    type = (endMins - currentTime <= 15) ? 'ending' : 'active';
                } else if (startMins - currentTime <= 20 && startMins - currentTime > 0) {
                    type = 'soon';
                }

                // Автоматический сброс пометки важной пары при её начале
                if (currentTime >= startMins) {
                    const disContainer = row.querySelector('.pair_info .dis');
                    const numTd = row.querySelector('.pair_num');
                    if (disContainer && numTd) {
                        const targetEl = disContainer.querySelector('a') || disContainer;
                        const cleanSubjectName = targetEl.textContent.trim();
                        const dayDateStr = dayBlock.querySelector('.day-date')?.textContent.trim() || 'UnknownDate';

                        let rawPairNum = "";
                        Array.from(numTd.childNodes).forEach(n => {
                            if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) {
                                rawPairNum = n.nodeValue.trim();
                            }
                        });
                        if (!rawPairNum) rawPairNum = numTd.textContent.trim().split(' ')[0] + ' пара';

                        let pairId = `${dayDateStr}_${rawPairNum}_${cleanSubjectName}`;
                        if (cleanSubjectName.toLowerCase().includes('консультация')) {
                            const timeEl = row.querySelector('.eval');
                            if (timeEl) pairId += `_${timeEl.textContent.trim()}`;
                            const teacherEl = row.querySelector('.pair_teacher a');
                            if (teacherEl) pairId += `_${teacherEl.textContent.trim()}`;
                        }
                        let imp = JSON.parse(localStorage.getItem('etis_important_pairs_v1') || '[]');
                        if (imp.includes(pairId)) {
                            imp = imp.filter(id => id !== pairId);
                            saveSyncData('etis_important_pairs_v1', JSON.stringify(imp));

                            row.classList.remove('is-important');
                            const impBtn = numTd.querySelector('.pair-important-btn');
                            if (impBtn) {
                                impBtn.classList.remove('is-active');
                                impBtn.innerHTML = '<span class="material-icons" style="font-size:1.6rem;">notifications_none</span>';
                            }
                        }
                    }
                }

                if (type) {
                    const dot = document.createElement('span');
                    dot.className = `live-dot ${type}`;

                    if (row.classList.contains('timetable-gap-row')) {
                        row.querySelector('.timetable-gap-capsule')?.appendChild(dot);
                    } else {
                        const timeElInner = row.querySelector('.pair_num .eval');
                        if (timeElInner) {
                            if (generalConfig.liveTimer !== false) {
                                const origTime = timeElInner.textContent.trim();
                                timeElInner.setAttribute('data-orig-time', origTime);
                                const timerColor = type === 'soon'
                                    ? 'var(--color-warning)'
                                    : (type === 'ending' ? 'var(--color-red)' : 'var(--color-green)');
                                const prefix = type === 'soon' ? 'через' : 'ещё';
                                const durationStr = type === 'soon'
                                    ? formatTimerDuration(startMins - currentTime)
                                    : formatTimerDuration(endMins - currentTime);
                                timeElInner.innerHTML = `<span style="line-height: 1.15;">${prefix}</span><span class="live-timer-row" style="display: inline-flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap; line-height: 1.15;"><span>${durationStr}</span></span>`;
                                timeElInner.style.flexDirection = 'column';
                                timeElInner.style.gap = '2px';
                                timeElInner.style.lineHeight = '1.15';
                                timeElInner.style.color = timerColor;
                                timeElInner.style.fontWeight = '700';
                                timeElInner.querySelector('.live-timer-row')?.appendChild(dot);
                            } else {
                                timeElInner.appendChild(dot);
                            }
                        } else {
                            row.querySelector('.pair_num')?.appendChild(dot);
                        }
                    }
                }
            });

            // Индикация общего статуса текущего дня в заголовке

            // 1. Всегда добавляем статичный зеленый кружок
            const dayDot = document.createElement('span');
            dayDot.className = 'day-status-icon';
            dayDot.style.cssText = 'display: inline-block; width: 8px; height: 8px; background-color: var(--color-green); border-radius: 50%; flex-shrink: 0;';

            // 2. Определяем пояснительную иконку
            let iconName = '';
            let iconTitle = '';
            let iconColor = 'var(--color-text-secondary)';

            if (!hasRealPairs) {
                iconName = 'free_breakfast';
                iconTitle = 'Выходной';
                iconColor = 'var(--color-green)';
            } else if (currentTime > lastPairEnd) {
                iconName = 'done_all';
                iconTitle = 'Пары закончились';
            } else if (currentTime < firstPairStart) {
                iconName = 'schedule';
                iconTitle = 'Скоро пары';
                iconColor = 'var(--color-yellow)';
            } else {
                iconName = 'play_circle';
                iconTitle = 'Пары идут';
                iconColor = 'var(--color-accent)';
            }

            const icon = document.createElement('span');
            icon.className = 'material-icons day-status-icon';
            icon.style.cssText = `font-size: 1.8rem; color: ${iconColor}; flex-shrink: 0;`;
            icon.textContent = iconName;
            icon.title = iconTitle;

            // Находим обертку текста, чтобы иконка статуса ставилась после всей фразы (с датой)
            let targetEl = dayHeaderName.closest('.day-title-text-wrap') || dayHeaderName;

            targetEl.after(icon);
            targetEl.after(dayDot);
        }
    });
}
