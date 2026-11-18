import { generalConfig } from '../../core/config.js';

// Функция объединения дат (например: "7 сентября" и "9 сентября" -> "7–9 сентября")
function formatMergedDateRange(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return startDateStr || endDateStr || '';
    if (startDateStr === endDateStr) return startDateStr;

    const s1 = startDateStr.replace(/\s*г\.?$/i, '').trim();
    const s2 = endDateStr.replace(/\s*г\.?$/i, '').trim();

    const textRegex = /^(\d{1,2})\s+([а-яёА-ЯЁ]+)(?:\s+(\d{4}))?/i;
    const m1 = s1.match(textRegex);
    const m2 = s2.match(textRegex);

    if (m1 && m2) {
        const d1 = m1[1];
        const month1 = m1[2].toLowerCase();
        const d2 = m2[1];
        const month2 = m2[2].toLowerCase();
        const y2 = m2[3] || m1[3] || '';

        if (month1 === month2) {
            return `${d1}–${d2} ${m1[2]}${y2 ? ' ' + y2 : ''}`;
        } else {
            return `${d1} ${m1[2]} – ${d2} ${m2[2]}${y2 ? ' ' + y2 : ''}`;
        }
    }

    const numRegex = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/;
    const n1 = s1.match(numRegex);
    const n2 = s2.match(numRegex);
    if (n1 && n2) {
        if (n1[2] === n2[2]) {
            return `${parseInt(n1[1], 10)}–${parseInt(n2[1], 10)}.${n1[2]}${n2[3] ? '.' + n2[3] : ''}`;
        }
        return `${s1} – ${s2}`;
    }

    return `${s1}–${s2}`;
}

// Сброс объединения в исходное состояние
export function unmergeDaysOff() {
    const days = document.querySelectorAll('.span9 .day');
    days.forEach(day => {
        if (day.classList.contains('merged-day-off-head')) {
            day.classList.remove('merged-day-off-head');
            day.removeAttribute('data-merged-days');
            const origName = day.getAttribute('data-orig-day-name');
            const origDate = day.getAttribute('data-orig-date');
            const nameEl = day.querySelector('.day-name');
            if (nameEl && origName) nameEl.textContent = origName;
            const dateEl = day.querySelector('.day-date');
            if (dateEl && origDate !== null) dateEl.textContent = origDate;

            const capsule = day.querySelector('.custom-no-pairs .pair_info div');
            if (capsule) {
                capsule.innerHTML = `
                                        <span class="material-icons" style="font-size: 1.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">free_breakfast</span>
                                        Выходной
                                    `;
            }
        }
        if (day.classList.contains('merged-day-off-hidden')) {
            day.classList.remove('merged-day-off-hidden');
            day.style.removeProperty('display');
        }
    });
}

// Объединение идущих подряд выходных
export function mergeConsecutiveDaysOff() {
    unmergeDaysOff();

    if (generalConfig.mergeDaysOff === false) return;

    const days = Array.from(document.querySelectorAll('.span9 .day'));
    if (days.length < 2) return;

    const isDayOff = (day) => {
        const visibleRows = Array.from(day.querySelectorAll('.timetable-grid tr')).filter(r =>
            r.style.display !== 'none' && !r.classList.contains('hidden-by-filter') && !r.classList.contains('timetable-gap-row')
        );
        return visibleRows.length === 0 || (visibleRows.length === 1 && visibleRows[0].classList.contains('custom-no-pairs'));
    };

    const groups = [];
    let currentGroup = [];

    days.forEach(day => {
        if (isDayOff(day)) {
            currentGroup.push(day);
        } else {
            if (currentGroup.length > 1) groups.push([...currentGroup]);
            currentGroup = [];
        }
    });
    if (currentGroup.length > 1) groups.push([...currentGroup]);

    groups.forEach(group => {
        const headDay = group[0];
        const lastDay = group[group.length - 1];

        headDay.classList.add('merged-day-off-head');

        // Сохраняем список дней для живой индикации
        const groupDayNames = group.map(d => d.getAttribute('data-orig-day-name') || d.querySelector('.day-name')?.textContent.trim());
        headDay.setAttribute('data-merged-days', groupDayNames.join(','));

        const startName = headDay.getAttribute('data-orig-day-name') || headDay.querySelector('.day-name')?.textContent.trim() || '';
        const endName = lastDay.getAttribute('data-orig-day-name') || lastDay.querySelector('.day-name')?.textContent.trim() || '';

        const startDate = headDay.getAttribute('data-orig-date') || headDay.querySelector('.day-date')?.textContent.trim() || '';
        const endDate = lastDay.getAttribute('data-orig-date') || lastDay.querySelector('.day-date')?.textContent.trim() || '';

        const mergedDayName = `${startName}–${endName.toLowerCase()}`;
        const mergedDate = formatMergedDateRange(startDate, endDate);

        const nameEl = headDay.querySelector('.day-name');
        if (nameEl) nameEl.textContent = mergedDayName;

        const dateEl = headDay.querySelector('.day-date');
        if (dateEl) dateEl.textContent = mergedDate;

        // Меняем капсулу на "Выходные"
        const capsule = headDay.querySelector('.custom-no-pairs .pair_info div');
        if (capsule) {
            capsule.innerHTML = `
                                    <span class="material-icons" style="font-size: 1.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">free_breakfast</span>
                                    Выходные
                                `;
        }

        // Скрываем остальные дни группы
        for (let i = 1; i < group.length; i++) {
            group[i].classList.add('merged-day-off-hidden');
            group[i].style.setProperty('display', 'none', 'important');
        }
    });
}
