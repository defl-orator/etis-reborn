import { pageCtx } from '../app/context.js';
import { DEMO_ANNOUNCES_HTML, DEMO_NOTES_HTML, DEMO_SIGNS_CURRENT_HTML, DEMO_SIGNS_DIPLOM_HTML, DEMO_SIGNS_HTML, DEMO_SIGNS_RATING_HTML, DEMO_TEACH_PLAN_ADVANCED_HTML, DEMO_TEACH_PLAN_SHORT_HTML, DEMO_TIMETABLE_HTML } from './templates.js';

export function renderOfflineDemoPage() {
    if (pageCtx.isDemoActive) {
        // Вспомогательный генератор каркаса страницы ЕТИС для подстановки кэша
        const buildOfflinePageHTML = (contentHtml, activeHref = '') => {
            const studentInfo = localStorage.getItem('etis_offline_student_info_html') || `
                        <span style="color: #808080;white-space:nowrap;">Студент (Оффлайн-режим)
                            <span style="margin-left: 10px;">ПГНИУ</span>
                        </span>
                    `;
            return `
                        <div class="navbar navbar-static-top">
                            <div class="navbar-inner">
                                <div class="container">
                                    <a class="brand" href="stu.main" style="white-space:nowrap;">ЕТИС ПГНИУ:Студенты - управление вузом</a>
                                    <div class="row" style="clear:both;">
                                        <div class="span12" style="margin-top: -6px;margin-bottom: 7px;">
                                            ${studentInfo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="container" style="padding-top: 20px;">
                            <div class="row">
                                <div class="span3">
                                    <ul class="nav nav-tabs nav-stacked">
                                        <li class="${activeHref.includes('timetable') ? 'active' : ''}"><a href="stu.timetable">Мое расписание</a></li>
                                        <li class="${activeHref.includes('signs') ? 'active' : ''}"><a href="stu.signs">Мои оценки</a></li>
                                        <li class="${activeHref.includes('announces') ? 'active' : ''}"><a href="stu_ann.announces">Объявления</a></li>
                                        <li class="${activeHref.includes('notes') ? 'active' : ''}"><a href="stu.teacher_notes">Сообщения от преподавателей</a></li>
                                        <li class="${activeHref.includes('teach_plan') ? 'active' : ''}"><a href="stu.teach_plan">Мой учебный план</a></li>
                                        <li><a href="stu.logout" class="need_redirect">Выход из оффлайн-режима</a></li>
                                    </ul>
                                </div>
                                <div class="span9">
                                    ${contentHtml}
                                </div>
                            </div>
                        </div>
                    `;
        };

        if (pageCtx.demoPage === 'signs' || pageCtx.demoPage === 'signs_session') {
            const cached = localStorage.getItem('etis_offline_signs_session_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.signs') : DEMO_SIGNS_HTML;
        } else if (pageCtx.demoPage === 'signs_current') {
            const cached = localStorage.getItem('etis_offline_signs_current_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.signs') : DEMO_SIGNS_CURRENT_HTML;
        } else if (pageCtx.demoPage === 'signs_rating') {
            const cached = localStorage.getItem('etis_offline_signs_rating_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.signs') : DEMO_SIGNS_RATING_HTML;
        } else if (pageCtx.demoPage === 'signs_diplom') {
            const cached = localStorage.getItem('etis_offline_signs_diplom_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.signs') : DEMO_SIGNS_DIPLOM_HTML;
        } else if (pageCtx.demoPage === 'announces') {
            const cached = localStorage.getItem('etis_offline_announces_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu_ann.announces') : DEMO_ANNOUNCES_HTML;
        } else if (pageCtx.demoPage === 'notes') {
            const cached = localStorage.getItem('etis_offline_notes_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.teacher_notes') : DEMO_NOTES_HTML;
        } else if (pageCtx.demoPage === 'teach_plan_advanced') {
            const cached = localStorage.getItem('etis_offline_teach_plan_advanced_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.teach_plan') : DEMO_TEACH_PLAN_ADVANCED_HTML;
        } else if (pageCtx.demoPage === 'teach_plan' || pageCtx.demoPage === 'teach_plan_short') {
            const cached = localStorage.getItem('etis_offline_teach_plan_short_html');
            document.body.innerHTML = cached ? buildOfflinePageHTML(cached, 'stu.teach_plan') : DEMO_TEACH_PLAN_SHORT_HTML;
        } else {
            const isPureDemo = sessionStorage.getItem('etis_pure_demo_mode') === 'true';
            const cachedUserTimetable = isPureDemo ? null : localStorage.getItem('etis_offline_timetable_html');    
            if (cachedUserTimetable) {
                document.body.innerHTML = buildOfflinePageHTML(cachedUserTimetable, 'stu.timetable');
            } else {
                // Стандартная генерация демо-расписания по умолчанию
                const now = new Date();
                const currentDay = now.getDay();
                const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
                const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

                const monthsGenitive = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                const pad = (n) => String(n).padStart(2, '0');

                const weekDates = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
                    weekDates.push({
                        dayNum: d.getDate(),
                        monthName: monthsGenitive[d.getMonth()],
                        fullStr: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
                    });
                }

                const weekRangeStr = `Неделя с ${weekDates[0].fullStr} по ${weekDates[6].fullStr}`;

                let demoHtml = DEMO_TIMETABLE_HTML;
                demoHtml = demoHtml.replace(/Неделя с 01\.09\.2025 по 07\.09\.2025/g, weekRangeStr);
                demoHtml = demoHtml.replace(/Понедельник, 1 сентября/g, `Понедельник, ${weekDates[0].dayNum} ${weekDates[0].monthName}`);
                demoHtml = demoHtml.replace(/Вторник, 2 сентября/g, `Вторник, ${weekDates[1].dayNum} ${weekDates[1].monthName}`);
                demoHtml = demoHtml.replace(/Среда, 3 сентября/g, `Среда, ${weekDates[2].dayNum} ${weekDates[2].monthName}`);
                demoHtml = demoHtml.replace(/Четверг, 4 сентября/g, `Четверг, ${weekDates[3].dayNum} ${weekDates[3].monthName}`);
                demoHtml = demoHtml.replace(/Пятница, 5 сентября/g, `Пятница, ${weekDates[4].dayNum} ${weekDates[4].monthName}`);
                demoHtml = demoHtml.replace(/Суббота, 6 сентября/g, `Суббота, ${weekDates[5].dayNum} ${weekDates[5].monthName}`);

                document.body.innerHTML = demoHtml;
            }
        }
    }
}
