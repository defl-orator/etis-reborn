import { saveSyncData } from '../sync/data.ts';

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

        // Очищаем ВСЕ старые точки и иконки статуса в этом дне
        dayBlock.querySelectorAll('.live-dot, .day-status-icon').forEach(dot => dot.remove());

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
                        const match = timeEl.textContent.match(/\d{1,2}:\d{2}/);
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

                // --- АВТО-СБРОС ВАЖНОЙ ПАРЫ ПРИ ЕЁ НАЧАЛЕ ---
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

                            // Мгновенно убираем стили
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
                            timeElInner.appendChild(dot);
                        } else {
                            row.querySelector('.pair_num')?.appendChild(dot);
                        }
                    }
                }
            });

            // --- Умная индикация для заголовка текущего дня ---

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
