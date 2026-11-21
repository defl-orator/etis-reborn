import { generalConfig } from '../../core/config.js';

// Затемняет прошедшие пары и окна на текущей и прошлых датах.
export function dimPastPairs() {
    const days = document.querySelectorAll('.span9 .day');
    const now = new Date();
    const todayMins = now.getHours() * 60 + now.getMinutes();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    days.forEach(day => {
        const dateEl = day.querySelector('.day-date');
        if (!dateEl) return;

        let classDateObj = new Date();
        const dateStr = dateEl.textContent.trim();
        const match = dateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);

        if (match) {
            const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
            classDateObj.setMonth(m);
            classDateObj.setDate(parseInt(match[1]));
        } else {
            const isoMatch = dateStr.match(/(\d{2})\.(\d{2})/);
            if (isoMatch) {
                classDateObj.setMonth(parseInt(isoMatch[2])-1);
                classDateObj.setDate(parseInt(isoMatch[1]));
            }
        }
        classDateObj.setHours(0,0,0,0);
        const classTime = classDateObj.getTime();

        const isPastDay = classTime < todayZero;
        const isToday = classTime === todayZero;

        // захватываем и строки выходных
        day.querySelectorAll('.timetable-grid tr').forEach(row => {
            let isPassed = false;

            if (isPastDay) {
                isPassed = true;
            } else if (isToday) {
                let startMins = -1;
                let endMins = -1;

                if (row.classList.contains('timetable-gap-row')) {
                    const startStr = row.getAttribute('data-gap-start');
                    const count = parseInt(row.getAttribute('data-gap-count') || "1");
                    const duration = count === 0 ? 30 : ((count * 90) + ((count - 1) * 10));
                    if (startStr && startStr !== "00:00") {
                        const p = startStr.split(':');
                        startMins = parseInt(p[0]) * 60 + parseInt(p[1]);
                        endMins = startMins + duration;
                    }
                } else if (row.classList.contains('custom-no-pairs')) {
                    isPassed = false;
                } else {
                    const timeEl = row.querySelector('.eval');
                    if (timeEl && !timeEl.textContent.includes("Весь день")) {
                        const timeMatch = timeEl.textContent.match(/(\d{1,2}):(\d{2})/);
                        if (timeMatch) {
                            startMins = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);

                            const explicitEndTime = row.getAttribute('data-end-time');
                            if (explicitEndTime) {
                                const ep = explicitEndTime.split(':');
                                endMins = parseInt(ep[0]) * 60 + parseInt(ep[1]);
                            } else {
                                endMins = startMins + 90; // Стандартная пара ЕТИС
                            }
                        }
                    }
                }

                if (startMins !== -1 && endMins !== -1) {
                    if (todayMins >= endMins) isPassed = true;
                }
            }

            if (isPassed && generalConfig.dimPastPairs) {
                row.classList.add('pair-passed');
            } else {
                row.classList.remove('pair-passed');
            }
        });
    });
}
