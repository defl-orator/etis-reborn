import { pageCtx } from '../../app/context.js';
import { generalConfig } from '../../core/config.js';
import { showPush } from '../../features/push.js';
import { renderCurrentSigns } from './current.js';
import { renderDiplomSigns } from './diplom.js';
import { renderRatingSigns } from './rating.js';
import { renderSessionSigns } from './session.js';
import { saveSyncData } from '../../sync/data.js';
import { getTermWord } from '../../utils/term-system.ts';

export function renderSignsPage() {
    if (!document.getElementById('etis-reborn-grades-tooltip-css')) {
        const css = document.createElement('style');
        css.id = 'etis-reborn-grades-tooltip-css';
        css.innerHTML = `
                                .kt-score-capsule { position: relative; cursor: pointer; -webkit-tap-highlight-color: transparent; }
                                .grade-cell-tooltip {
                                    right: 0 !important;
                                    left: auto !important;
                                    transform: translateY(10px) !important;
                                    bottom: 140% !important;
                                    pointer-events: none;
                                    z-index: 1000 !important;
                                }
                                .grade-cell-tooltip::after {
                                    right: 15px !important;
                                    left: auto !important;
                                    transform: none !important;
                                }
                                .kt-score-capsule:hover .grade-cell-tooltip,
                                .kt-score-capsule:active .grade-cell-tooltip {
                                    transform: translateY(0) !important;
                                    opacity: 1;
                                    visibility: visible;
                                }

                                html body table td.align-right-cell,
                                html body table th.align-right-cell,
                                html body div.span9 table.common tr td.align-right-cell,
                                html body div.span9 table.common tr th.align-right-cell {
                                    text-align: right !important;
                                    padding-right: 16px !important;
                                    vertical-align: middle !important;
                                }
                                @media (max-width: 768px) {
                                    html body table td.align-right-cell,
                                    html body table th.align-right-cell,
                                    html body div.span9 table.common tr td.align-right-cell,
                                    html body div.span9 table.common tr th.align-right-cell {
                                        padding-right: 8px !important;
                                    }
                                }
                            `;
        document.head.appendChild(css);
    }

    // УНИФИКАЦИЯ ПОДМЕНЮ
    pageCtx.span9.querySelectorAll('.submenu').forEach(menu => {
        // Определяем тип периода (семестр или триместр) на основе текста вкладок
        let termType = getTermWord('nom_sg');

        Array.from(menu.children).forEach(child => {
            if (child.tagName === 'A') {
                // Убираем слово, оставляем цифру (ищет и триместр, и семестр)
                const match = child.textContent.match(/(\d+)\s*(триместр|семестр)/i);
                if (match) {
                    child.textContent = match[1];
                }
            } else if (child.tagName === 'B') {
                // У активной вкладки гарантируем наличие правильного слова
                let text = child.textContent.trim();
                if (/^\d+$/.test(text)) {
                    child.innerHTML = text + '&nbsp;<span style="font-weight: 800;">' + termType + '</span>';
                }
            }
        });
    });

    // ГЛОБАЛЬНАЯ ОЧИСТКА ТАБЛИЦ
    pageCtx.span9.querySelectorAll('table.common').forEach(table => {
        table.removeAttribute('width');
        table.style.width = "100%";
        table.querySelectorAll('tr, td, th').forEach(el => {
            el.removeAttribute('width');
            el.removeAttribute('style');
            el.removeAttribute('bgcolor');
            el.removeAttribute('align');
            el.removeAttribute('valign');
            el.removeAttribute('onmouseover');
            el.removeAttribute('onmouseout');
        });
    });

    // ОБРАБОТКА "ОЦЕНКИ ЗА СЕССИИ"
    renderSessionSigns();

    // ОБРАБОТКА "ОЦЕНКИ В ТРИМЕСТРЕ"
    renderCurrentSigns();

    // ОБРАБОТКА "ОЦЕНКИ В ДИПЛОМ"
    renderDiplomSigns();

    // ОБРАБОТКА "ИТОГОВЫЙ РЕЙТИНГ"
    renderRatingSigns();

    // --- ЛОГИКА УВЕДОМЛЕНИЙ ОБ ИЗМЕНЕНИИ ОЦЕНОК (СЕССИИ + СЕМЕСТРЫ) ---
    setTimeout(() => {
        // Защита от срабатываний при активном локальном поиске
        const termSearch = document.querySelector('.term-local-input');
        const sessionSearch = document.querySelector('.signs-local-input');
        if ((termSearch && termSearch.value.trim() !== '') || (sessionSearch && sessionSearch.value.trim() !== '')) {
            return;
        }

        const cleanTermName = (raw) => {
            if (!raw) return '1';
            const m = raw.match(/(\d+)/);
            return m ? m[1] : raw.trim();
        };

        const currentSnapshot = {};

        // 1. Сбор баллов в семестре (Контрольные точки)
        if (pageCtx.pageMode === 'current') {
            const activeSubmenu = document.querySelector('.submenu b');
            const termNum = activeSubmenu ? cleanTermName(activeSubmenu.textContent) : 'current';

            document.querySelectorAll('.term-subject-group').forEach(wrapper => {
                let name = wrapper.getAttribute('data-subject-name');
                if (!name) {
                    const h3 = wrapper.previousElementSibling;
                    if (h3) name = h3.textContent.replace(/\d+\s*\/\s*\d+/, '').trim();
                }
                if (!name) return;
                name = name.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

                const currentScore = parseFloat(wrapper.getAttribute('data-score-current')) || 0;
                const maxScore = parseFloat(wrapper.getAttribute('data-score-max')) || 0;

                const normKey = `term_${termNum}_${name.toLowerCase()}`;
                currentSnapshot[normKey] = {
                    subject: name,
                    term: `${termNum}-й ${getTermWord('nom_sg')}`,
                    score: currentScore,
                    max: maxScore,
                    mark: null,
                    type: 'term',
                    targetUrl: 'stu.signs?p_mode=current'
                };
            });
        }

        // 2. Сбор итоговых оценок за сессии
        if (pageCtx.pageMode === 'session') {
            document.querySelectorAll('.session-term-table-group').forEach(wrapper => {
                let rawTermName = wrapper.getAttribute('data-term-name') || '';
                const termNum = cleanTermName(rawTermName);

                wrapper.querySelectorAll('tbody tr').forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        let subjName = cells[0].textContent.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
                        let markText = cells[1].textContent.replace(/\s+/g, ' ').trim();

                        if (subjName && markText && markText !== 'н' && !markText.toLowerCase().includes('нет') && !markText.toLowerCase().includes('неизвестно')) {
                            const normKey = `session_${termNum}_${subjName.toLowerCase()}`;
                            currentSnapshot[normKey] = {
                                subject: subjName,
                                term: `${termNum}-й ${getTermWord('nom_sg')}`,
                                score: null,
                                max: null,
                                mark: markText,
                                type: 'session',
                                targetUrl: 'stu.signs'
                            };
                        }
                    }
                });
            });
        }

        // 3. Загрузка базы снимков
        const storageKey = 'etis_reborn_grades_snapshot_v3';
        let storedData = JSON.parse(localStorage.getItem(storageKey) || '{"grades":{}, "isInitialized":false, "lastUpdated":null}');
        let previousGrades = storedData.grades || {};
        const isFirstRun = !storedData.isInitialized || Object.keys(previousGrades).length === 0;

        const scoreUpdates = [];
        const markUpdates = [];

        // 4. Сравнение изменений
        for (const [key, currData] of Object.entries(currentSnapshot)) {
            const prevData = previousGrades[key];

            if (!prevData) {
                previousGrades[key] = currData;
                // Если база уже создана, появление новой строки сессии фиксируется как новое событие
                if (!isFirstRun && currData.type === 'session' && currData.mark) {
                    markUpdates.push({ subj: currData.subject, term: currData.term, oldMark: '—', newMark: currData.mark, targetUrl: currData.targetUrl });
                }
                continue;
            }

            if (!isFirstRun) {
                // Баллы в семестре
                if (currData.type === 'term') {
                    const prevScore = parseFloat(prevData.score) || 0;
                    const currScore = parseFloat(currData.score) || 0;

                    if (currScore > prevScore) {
                        const diff = Math.round((currScore - prevScore) * 100) / 100;
                        scoreUpdates.push({ subj: currData.subject, term: currData.term, diff, newScore: currScore, max: currData.max, targetUrl: currData.targetUrl });
                    }
                }

                // Оценки в сессии
                if (currData.type === 'session') {
                    if (prevData.mark && prevData.mark !== currData.mark) {
                        markUpdates.push({ subj: currData.subject, term: currData.term, oldMark: prevData.mark, newMark: currData.mark, targetUrl: currData.targetUrl });
                    }
                }
            }

            previousGrades[key] = currData;
        }

        storedData.grades = previousGrades;
        storedData.isInitialized = true;

        // 5. Всплывающее Push-уведомление (без добавления в колокольчик)
        const totalUpdates = scoreUpdates.length + markUpdates.length;

        if (totalUpdates > 0 && !isFirstRun) {
            storedData.lastUpdated = Date.now();

            if (generalConfig.gradeNotifications !== false) {
                if (totalUpdates === 1) {
                    if (scoreUpdates.length === 1) {
                        const u = scoreUpdates[0];
                        showPush(`Новые баллы: +${u.diff}`, u.subj, `Теперь у вас ${u.newScore} из ${u.max}`, 'info', 'trending_up', null, u.targetUrl, true);
                    } else {
                        const u = markUpdates[0];
                        let statusTitle = 'Выставлена оценка';
                        let pushType = 'info';
                        let icon = 'assignment_turned_in';

                        const markLow = u.newMark.toLowerCase();
                        if (markLow.includes('зачет') || ['5', '4', 'отлично', 'хорошо'].some(m => markLow.includes(m))) {
                            statusTitle = 'Сессия: Оценка выставлена!';
                            pushType = 'success';
                            icon = 'emoji_events';
                        } else if (['2', 'незачет', 'неуд'].some(m => markLow.includes(m))) {
                            statusTitle = 'Сессия: Внимание';
                            pushType = 'warning';
                            icon = 'priority_high';
                        }

                        const descText = u.oldMark && u.oldMark !== '—' 
                            ? `${u.term}: ${u.oldMark} ➔ ${u.newMark}` 
                            : `${u.term}: ${u.newMark}`;

                        showPush(statusTitle, u.subj, descText, pushType, icon, null, u.targetUrl, true);
                    }
                } else {
                    let subjList = [...new Set([...scoreUpdates.map(u => u.subj), ...markUpdates.map(u => u.subj)])];
                    let bodyText = subjList.slice(0, 2).join(', ');
                    if (subjList.length > 2) bodyText += ` и ещё ${subjList.length - 2}`;

                    showPush('Обновление успеваемости', `Изменения по ${totalUpdates} предметам`, bodyText, 'info', 'dynamic_feed', null, 'stu.signs', true);
                }
            }
        }

        saveSyncData(storageKey, JSON.stringify(storedData));
    }, 600);

    return;
}
