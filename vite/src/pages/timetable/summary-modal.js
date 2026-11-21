import { pageCtx } from '../../app/context.js';

// Открывает модальное окно сводки учебной нагрузки за текущую неделю.
export const openSummaryModal = () => {
    let lek = 0, pract = 0, lab = 0, cons = 0, exam = 0;
    pageCtx.span9.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
        if (row.style.display === 'none' || row.classList.contains('hidden-by-filter')) return;
        if (!row.querySelector('.pair_info')) return;
        const typeBadge = row.querySelector('.pair-type-badge');
        const disName = row.querySelector('.dis') ? row.querySelector('.dis').textContent.toLowerCase() : '';
        let counted = false;
        if (typeBadge) {
            const t = typeBadge.textContent.toLowerCase();
            if (t.includes('лек')) { lek++; counted = true; }
            else if (t.includes('практ')) { pract++; counted = true; }
            else if (t.includes('лаб')) { lab++; counted = true; }
            else if (t.includes('экз') || t.includes('зач')) { exam++; counted = true; }
        }
        if (!counted) {
            if (disName.includes('консультация')) { cons++; counted = true; }
            else if (disName.includes('экзамен') || disName.includes('зачет') || disName.includes('зачёт')) { exam++; counted = true; }
        }
    });

    const total = lek + pract + lab + cons + exam;
    const totalMins = total * 90;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const timeStr = hours > 0 ? `${hours} ч ${mins > 0 ? mins + ' мин' : ''}` : '0 ч';

    const storageKey = 'etis_weekly_pairs_history_v1';
    const history = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const keys = Object.keys(history);

    let comparisonHtml = '';
    let avgHtml = '';

    // Склоняет слово «пара» в зависимости от числа.
    const getPairsWord = (n) => {
        const absN = Math.abs(Math.round(n));
        if (absN % 10 === 1 && absN % 100 !== 11) return 'пару';
        if (absN % 10 >= 2 && absN % 10 <= 4 && (absN % 100 < 10 || absN % 100 >= 20)) return 'пары';
        return 'пар';
    };

    if (keys.length >= 5) {
        const sum = Object.values(history).reduce((a, b) => a + b, 0);
        const avgVal = sum / keys.length;
        const avgRounded = Math.round(avgVal * 10) / 10;
        const diff = Math.round((total - avgVal) * 10) / 10;
        const absDiff = Math.abs(diff);
        const word = getPairsWord(diff);

        if (diff > 0) comparisonHtml = `<span style="color:var(--color-red); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem;">(выше среднего на ${diff} ${word})</span>`;
        else if (diff < 0) comparisonHtml = `<span style="color:var(--color-green); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem;">(ниже на ${absDiff} ${word})</span>`;
        else comparisonHtml = `<span style="color:var(--color-text-secondary); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem; opacity: 0.8;">(в пределах нормы)</span>`;

        const avgTotalMins = avgRounded * 90;
        const avgHours = Math.floor(avgTotalMins / 60);
        const avgMins = Math.round(avgTotalMins % 60);
        const avgTimeStr = avgHours > 0 ? `${avgHours} ч ${avgMins > 0 ? avgMins + ' мин' : ''}` : '0 ч';

        avgHtml = `
                                <div style="margin-top: 2.4rem;">
                                    <div style="font-size: 1.2rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 1.2rem; letter-spacing: 0.5px;">
                                        В среднем за неделю <span style="text-transform: none; font-weight: 500; font-size: 1.1rem;">(на основе ${keys.length} нед.)</span>
                                    </div>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.2rem;">
                                        <div class="stat-box">
                                            <span class="stat-box-title">Учебных пар</span>
                                            <span class="stat-box-value">${avgRounded}</span>
                                        </div>
                                        <div class="stat-box">
                                            <span class="stat-box-title">Времени на учебе</span>
                                            <span class="stat-box-value accent-stat">${avgTimeStr}</span>
                                        </div>
                                    </div>
                                </div>`;
    } else {
        avgHtml = `
                                <div style="margin-top: 2.4rem;">
                                    <div style="font-size: 1.2rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 0.8rem; letter-spacing: 0.5px;">В среднем за неделю</div>
                                    <div style="font-size:1.3rem; color: var(--color-text-secondary); line-height: 1.5; background: var(--color-highlight); padding: 1.6rem; border-radius: var(--radius-medium);">
                                        Откройте еще <b>${5 - keys.length} нед.</b> расписания, чтобы система рассчитала среднюю нагрузку.
                                    </div>
                                </div>`;
    }

    let badgesHtml = '';
    if (lek > 0) badgesHtml += `<div style="background: rgba(0, 122, 255, 0.1); color: var(--color-blue); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Лекции: ${lek}</div>`;
    if (pract > 0) badgesHtml += `<div style="background: rgba(52, 199, 89, 0.1); color: var(--color-green); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Практики: ${pract}</div>`;
    if (lab > 0) badgesHtml += `<div style="background: rgba(255, 149, 0, 0.1); color: var(--color-warning); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Лабы: ${lab}</div>`;
    if (exam > 0) badgesHtml += `<div style="background: rgba(255, 59, 48, 0.1); color: var(--color-red); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Зачет/Экзамен: ${exam}</div>`;
    if (cons > 0) badgesHtml += `<div style="background: var(--color-highlight); color: var(--color-text-primary); border: 1px solid var(--color-table-border); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Консультации: ${cons}</div>`;
    if (total === 0) badgesHtml += `<div style="color: var(--color-text-secondary); font-size: 1.3rem;">На этой неделе учебных пар нет! ☕</div>`;

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

    modal.innerHTML = `
                            <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="ui-dialog-title">Сводка</span>
                                <button class="close-analytics" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                            </div>
                            <div class="ui-dialog-content" style="padding: 2.4rem;">
                                <div>
                                    <div style="display: flex; align-items: center; margin-bottom: 1.2rem;">
                                        <span style="font-size: 1.2rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">За текущую неделю</span>
                                        ${comparisonHtml}
                                    </div>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.2rem;">
                                        <div class="stat-box">
                                            <span class="stat-box-title">Учебных пар</span>
                                            <span class="stat-box-value">${total}</span>
                                        </div>
                                        <div class="stat-box">
                                            <span class="stat-box-title">Времени на учебе</span>
                                            <span class="stat-box-value accent-stat">${timeStr}</span>
                                        </div>
                                    </div>
                                    <div style="margin-top: 1.2rem;">
                                        <div style="display:flex; gap: 0.8rem; flex-wrap: wrap;">${badgesHtml}</div>
                                    </div>
                                </div>
                                ${avgHtml}
                            </div>
                        `;

    // Закрывает модальное окно сводки.
    const closeAnalytics = () => {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open-body');
    };
    overlay.onclick = closeAnalytics;
    modal.querySelector('.close-analytics').onclick = closeAnalytics;

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.classList.add('modal-open-body');
};
