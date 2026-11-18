import { consultationsFiles } from '../features/consultations/state.js';
import { openConsultationsModal } from './consultations.js';
import { openDiaryModal } from './diary.js';
import { openProfileModal } from './profile.js';
import { openSettingsModal } from './settings.js';
import { openSyncModal } from './sync.js';
import { saveSyncData } from '../sync/data.js';

export function openGlobalSearchModal() {
    let overlay = document.getElementById('etis-globalsearch-overlay');
    let modal = document.getElementById('etis-globalsearch-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-globalsearch-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-globalsearch-modal';
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

    // --- СБОР И ИНДЕКСАЦИЯ ВСЕХ ДАННЫХ ИЗ ПАМЯТИ ---
    const buildSearchIndex = () => {
        const index = [];

        // 1. Основные страницы и разделы ЕТИС
        const baseNavPages = [
            { title: 'Мое расписание', sub: 'Сетка пар и консультаций', cat: 'Раздел', icon: 'calendar_month', url: 'stu.timetable' },
            { title: 'Мои оценки', sub: 'Сессии, рейтинги, текущие баллы', cat: 'Раздел', icon: 'bar_chart_4_bars', url: 'stu.signs' },
            { title: 'Оценки за сессии', sub: 'Экзамены и зачеты за все семестры', cat: 'Раздел', icon: 'grade', url: 'stu.signs?p_mode=session' },
            { title: 'Оценки в семестре', sub: 'Текущие контрольные мероприятия', cat: 'Раздел', icon: 'fact_check', url: 'stu.signs?p_mode=current' },
            { title: 'Оценки в диплом', sub: 'Выписка и расчет среднего балла', cat: 'Раздел', icon: 'school', url: 'stu.signs?p_mode=diplom' },
            { title: 'Итоговый рейтинг', sub: 'Рейтинг в группе, курсе и факультете', cat: 'Раздел', icon: 'emoji_events', url: 'stu.signs?p_mode=rating' },
            { title: 'Мой учебный план', sub: 'План процесса и сводные данные', cat: 'Раздел', icon: 'school', url: 'stu.teach_plan?p_mode=short' },
            { title: 'Подробный учебный план', sub: 'Календарный учебный график', cat: 'Раздел', icon: 'event_note', url: 'stu.teach_plan?p_mode=advanced' },
            { title: 'Дисциплины по выбору', sub: 'Указать факультативы и курсы по выбору', cat: 'Раздел', icon: 'how_to_vote', url: 'stu.teach_plan?p_mode=choose_dis' },
            { title: 'Элективы', sub: 'Выбор общеуниверситетских элективов', cat: 'Раздел', icon: 'interests', url: 'ebl_stu.ebl_choice' },
            { title: 'Факультативы', sub: 'Порядок освоения факультативных дисциплин', cat: 'Раздел', icon: 'interests', url: 'stu.fcl_choice' },
            { title: 'Объявления', sub: 'Официальные объявления деканата и вуза', cat: 'Раздел', icon: 'campaign', url: 'stu_ann.announces' },
            { title: 'Сообщения от преподавателей', sub: 'Входящие письма от преподавателей', cat: 'Раздел', icon: 'mail', url: 'stu.teacher_notes' },
            { title: 'Преподаватели', sub: 'Список преподавателей и кафедр', cat: 'Раздел', icon: 'people', url: 'stu.teachers' },
            { title: 'Журнал посещений', sub: 'Посещаемость учебных пар', cat: 'Раздел', icon: 'playlist_add_check', url: 'stu_jour.group_tt' },
            { title: 'Пропущенные занятия', sub: 'Пропуски занятий по уважительным причинам', cat: 'Раздел', icon: 'auto_stories_off', url: 'stu.absence' },
            { title: 'Приказы', sub: 'Архив приказов о переводе, зачислении и благодарностях', cat: 'Раздел', icon: 'assignment', url: 'stu.orders' },
            { title: 'Библиотека', sub: 'Рекомендуемая литература и электронный каталог', cat: 'Раздел', icon: 'book_2', url: 'stu.library' },
            { title: 'Договоры', sub: 'Договоры на обучение и онлайн-оплата', cat: 'Раздел', icon: 'receipt', url: 'stu_pay.contract_list' },
            { title: 'Заказ справок', sub: 'Заказ справок об обучении онлайн', cat: 'Раздел', icon: 'description', url: 'cert_pkg.stu_certif' },
            { title: 'Бланки форм и документов', sub: 'Шаблоны заявлений и справок', cat: 'Раздел', icon: 'insert_drive_file', url: 'stu_plus.blank_forms' },
            { title: 'Портфолио', sub: 'Научные публикации, патенты и достижения', cat: 'Раздел', icon: 'folder_shared', url: 'stu.sc_portfolio' },
            { title: 'Электронные ресурсы', sub: 'Wi-Fi, LDAP, доступ к базам данных', cat: 'Раздел', icon: 'public', url: 'stu.electr' },
            { title: 'О ресурсе', sub: 'Справочная информация о системе ЕТИС', cat: 'Раздел', icon: 'info', url: 'stu.about' }
        ];

        baseNavPages.forEach(p => {
            index.push({
                id: 'nav_' + p.url,
                title: p.title,
                sub: p.sub,
                cat: p.cat,
                icon: p.icon,
                action: () => { window.location.href = p.url; }
            });
        });

        // 2. Встроенные модальные окна и инструменты скрипта
        const tools = [
            { id: 'tool_diary', title: 'Дневник и дедлайны', sub: 'Список заданий, дедлайны и заметки', cat: 'Инструмент', icon: 'menu_book', action: () => openDiaryModal() },
            { id: 'tool_settings', title: 'Настройки ЕТИС Reborn', sub: 'Тема, акцентные цвета, окна, скрытие дней', cat: 'Инструмент', icon: 'settings', action: () => openSettingsModal('general') },
            { id: 'tool_appearance', title: 'Цветовая тема', sub: 'Выбор палитры, градиента и стиля стекла', cat: 'Инструмент', icon: 'palette', action: () => openSettingsModal('appearance') },
            { id: 'tool_profile', title: 'Мой профиль', sub: 'Достижения, бенто-карточка и статистика использования', cat: 'Инструмент', icon: 'account_circle', action: () => openProfileModal(window.innerWidth <= 960 ? 'menu' : 'main') },
            { id: 'tool_consultations', title: 'Консультации', sub: 'DOCX-графики преподавателей и расписание', cat: 'Инструмент', icon: 'support_agent', action: () => openConsultationsModal() },
            { id: 'tool_sync', title: 'Синхронизация', sub: 'Экспорт расписания в Google/Apple и облако', cat: 'Инструмент', icon: 'cloud_sync', action: () => openSyncModal('export') },
            { id: 'tool_guide', title: 'Обучение', sub: 'Подсказки, жесты и скрытые возможности', cat: 'Инструмент', icon: 'auto_stories', action: () => openSettingsModal('guide') }
        ];

        tools.forEach(t => index.push(t));

        // 3. Оценки и баллы по предметам из кэша успеваемости
        try {
            const gradesData = JSON.parse(localStorage.getItem('etis_reborn_grades_snapshot_v3') || '{"grades":{}}');
            const grades = gradesData.grades || {};

            for (const [key, g] of Object.entries(grades)) {
                if (!g || !g.subject) continue;
                let subDesc = g.term || '';
                let badgeVal = '';

                if (g.type === 'term') {
                    subDesc += ` • ${g.score} из ${g.max} баллов`;
                    badgeVal = `${g.score} б.`;
                } else if (g.type === 'session') {
                    subDesc += ` • Итоговая оценка: ${g.mark}`;
                    badgeVal = g.mark;
                }

                const cleanSubj = g.subject.replace(/\[.*?\]/g, '').replace(/[\s\xa0\u200B-\u200D\uFEFF]+/g, ' ').trim();

                // Чистые ссылки ЕТИСа
                let targetUrl = 'stu.signs';
                const termNumMatch = g.term ? g.term.match(/\d+/) : null;
                if (g.type === 'term') {
                    targetUrl = `stu.signs?p_mode=current${termNumMatch ? '&p_term=' + termNumMatch[0] : ''}`;
                } else {
                    targetUrl = 'stu.signs';
                }

                index.push({
                    id: 'grade_' + key,
                    title: cleanSubj,
                    sub: subDesc,
                    cat: 'Оценка',
                    icon: 'analytics',
                    badge: badgeVal,
                    action: () => {
                        const curPath = window.location.pathname.split('/').pop() || '';
                        const curParams = new URLSearchParams(window.location.search);
                        const curMode = curParams.get('p_mode') || 'session';
                        const curTerm = curParams.get('p_term');
                        const targetTerm = termNumMatch ? termNumMatch[0] : null;

                        const isSameMode = (g.type === 'term' && curMode === 'current') || 
                                           (g.type === 'session' && (curMode === 'session' || !curParams.get('p_mode')));
                        const isSameTerm = (!targetTerm || curTerm === targetTerm);

                        // Если мы уже находимся на нужной странице и семестре — фильтруем на лету
                        if (curPath.includes('stu.signs') && isSameMode && isSameTerm) {
                            const searchContainer = document.querySelector('.term-controls-wrapper');
                            const searchInput = document.querySelector('.signs-local-input, .term-local-input');
                            if (searchContainer && searchInput) {
                                searchContainer.classList.add('is-searching');
                                searchInput.value = cleanSubj;
                                searchInput.dispatchEvent(new Event('input'));
                                setTimeout(() => searchInput.focus(), 150);
                            }
                        } else {
                            // Сохраняем запрос во временное хранилище браузера и переходим по чистому URL
                            sessionStorage.setItem('etis_auto_search_grade', cleanSubj);
                            window.location.href = targetUrl;
                        }
                    }
                });
            }
        } catch (e) {}

        // 4. Задания из Дневника
        try {
            const tasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
            tasks.forEach(t => {
                index.push({
                    id: 'task_' + t.id,
                    title: t.title,
                    sub: `${t.subject} • Срок: ${t.deadlineDate || 'Без даты'} (${t.completed ? 'Сдано' : 'В процессе'})`,
                    cat: 'Дневник',
                    icon: 'task_alt',
                    badge: t.completed ? 'Сдано' : 'Задание',
                    action: () => openDiaryModal('tasks')
                });
            });
        } catch (e) {}

        // 5. Созданные вручную пары
        try {
            const pairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
            pairs.forEach(p => {
                index.push({
                    id: 'cp_' + p.id,
                    title: p.subject,
                    sub: `${p.dayName || ''} • ${p.startTime || ''}-${p.endTime || ''} ${p.aud ? '• ' + p.aud : ''}`,
                    cat: 'Своя пара',
                    icon: 'event',
                    badge: p.type?.toUpperCase() || 'ЛИЧ',
                    action: () => { window.location.href = 'stu.timetable'; }
                });
            });
        } catch (e) {}

        // 6. Заметки к предметам
        try {
            const notes = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
            for (const [subj, val] of Object.entries(notes.next_unbound || {})) {
                index.push({
                    id: 'note_unbound_' + subj,
                    title: `Заметка: ${subj}`,
                    sub: typeof val === 'object' ? (val.text || '') : val,
                    cat: 'Заметка',
                    icon: 'edit_note',
                    action: () => { window.location.href = 'stu.timetable'; }
                });
            }
            for (const [pairKey, text] of Object.entries(notes.specific || {})) {
                index.push({
                    id: 'note_spec_' + pairKey,
                    title: `Заметка: ${pairKey.replace(/_/g, ' ')}`,
                    sub: text,
                    cat: 'Заметка',
                    icon: 'edit_note',
                    action: () => { window.location.href = 'stu.timetable'; }
                });
            }
        } catch (e) {}

        // Индексация преподавателей из файлов консультаций
        try {
            // Безопасное определение целевого массива (работает и внутри, и снаружи buildSearchIndex)
            const targetList = (typeof index !== 'undefined' && Array.isArray(index)) 
                ? index 
                : ((typeof searchIndex !== 'undefined' && Array.isArray(searchIndex)) ? searchIndex : null);

            if (targetList) {
                const consFiles = (typeof consultationsFiles !== 'undefined' && consultationsFiles.length > 0)
                    ? consultationsFiles
                    : JSON.parse(localStorage.getItem('etis_consultation_files_v1') || '[]');

                consFiles.forEach(f => {
                    if (!f || !f.teachers) return;
                    f.teachers.forEach(t => {
                        if (!t || !t.name) return;

                        const cleanName = t.name.replace(/[\s\xa0\u200B-\u200D\uFEFF]+/g, ' ').trim();

                        let scheduleSummary = '';
                        if (t.events && t.events.length > 0) {
                            scheduleSummary = t.events.map(ev => `${ev.dayName} ${ev.startTime}${ev.endTime ? '-' + ev.endTime : ''}`).join(', ');
                        }

                        const auds = t.events ? [...new Set(t.events.map(e => e.aud).filter(Boolean))].join(', ') : '';
                        const degreeText = t.degree ? ` • ${t.degree}` : '';
                        const subText = scheduleSummary 
                            ? `${scheduleSummary}${auds ? ' • ' + auds : ''}${degreeText} (${f.title})`
                            : `${f.title}${degreeText}`;

                        targetList.push({
                            id: 'cons_teacher_' + f.id + '_' + cleanName,
                            title: cleanName,
                            sub: subText,
                            cat: 'Консультация',
                            icon: 'support_agent',
                            badge: t.isActive ? 'В расписании' : null,
                            action: () => {
                                openConsultationsModal(f.id, cleanName);
                            }
                        });
                    });
                });
            }
        } catch (e) {
            console.error('[Search Index] Ошибка чтения консультаций:', e);
        }

        return index;
    };

    const searchIndex = buildSearchIndex();

    // Недавние открытые элементы
    const getRecentHistory = () => {
        return JSON.parse(localStorage.getItem('etis_recent_search_items_v1') || '[]');
    };

    const pushToRecentHistory = (item) => {
        let history = getRecentHistory();
        history = history.filter(h => h.id !== item.id);
        history.unshift({
            id: item.id,
            title: item.title,
            sub: item.sub,
            cat: item.cat,
            icon: item.icon,
            badge: item.badge
        });
        if (history.length > 8) history = history.slice(0, 8);
        saveSyncData('etis_recent_search_items_v1', JSON.stringify(history));
    };

    modal.innerHTML = `
                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2.4rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-icons" style="color:var(--color-accent); font-size:24px;">travel_explore</span>
                        <span style="font-size: 1.7rem; font-weight: 800; color: var(--color-text-primary);">Глобальный поиск</span>
                    </div>
                    <span class="material-icons close-global-search-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                </div>
                <div class="ui-dialog-content" style="padding: 2rem 2.4rem 3rem 2.4rem; max-height: 80vh; overflow-y: auto;">
                    
                    <div class="search-modal-input-wrap">
                        <span class="material-icons" style="font-size: 22px; color: var(--color-text-secondary);">search</span>
                        <input type="text" id="global-search-field" placeholder="Предмет, оценка, раздел, задание..." autocomplete="off">
                        <span class="material-icons" id="global-search-clear" style="font-size: 20px; color: var(--color-text-secondary); cursor: pointer; display: none;">cancel</span>
                    </div>

                    <div id="global-search-results-area"></div>
                </div>
            `;

    modal.querySelector('.close-global-search-btn').onclick = closeAll;

    const inputField = modal.querySelector('#global-search-field');
    const clearBtn = modal.querySelector('#global-search-clear');
    const resultsArea = modal.querySelector('#global-search-results-area');

    let selectedSearchIndex = 0; // Храним индекс выбранного элемента

    // Функция визуального обновления выбора (для клавиатуры и мыши)
    const updateSearchSelection = (rows) => {
        rows.forEach((row, idx) => {
            if (idx === selectedSearchIndex) {
                row.classList.add('is-selected');
                row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                row.classList.remove('is-selected');
            }
        });
    };

    const renderResults = (query = '') => {
        const cleanQuery = query.toLowerCase().trim();
        selectedSearchIndex = 0; // Сбрасываем выбор при новом поиске

        clearBtn.classList.toggle('is-visible', Boolean(cleanQuery));

        if (!cleanQuery) {
            const recent = getRecentHistory();
            if (recent.length === 0) {
                resultsArea.innerHTML = `
                            <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary); display: flex; flex-direction: column; align-items: center; gap: 10px;">
                                <span class="material-icons" style="font-size: 44px; opacity: 0.35;">search</span>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary);">Начните вводить запрос</div>
                                <div style="font-size: 1.25rem; max-width: 320px; line-height: 1.5;">Мгновенный поиск по вкладкам, окнам и заметкам.</div>
                            </div>
                        `;
                return;
            }

            resultsArea.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.2rem; padding: 0 4px;">
                            <span style="font-size: 1.15rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: var(--color-text-secondary);">Недавнее</span>
                            <span id="clear-recent-search-btn" style="font-size: 1.2rem; color: var(--color-accent); font-weight: 600; cursor: pointer;">Очистить</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap: 8px;">
                            ${recent.map((item, idx) => `
                                <div class="search-result-row" data-history-idx="${idx}">
                                    <div style="width: 38px; height: 38px; border-radius: 12px; background: var(--color-highlight); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="font-size: 20px; color: var(--color-accent);">${item.icon || 'history'}</span>
                                    </div>
                                    <div style="flex: 1; min-width: 0; text-align: left;">
                                        <div class="search-result-title-box">${item.title}</div>
                                        <div style="font-size: 1.2rem; color: var(--color-text-secondary); line-height: 1.3; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.sub}</div>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                                        <div class="search-enter-hint">
                                            <span>Открыть</span>
                                            <span class="material-icons" style="font-size: 1.8rem; margin:0;">keyboard_return</span>
                                        </div>
                                        <span style="background: var(--color-highlight); color: var(--color-text-secondary); padding: 3px 8px; border-radius: 6px; font-size: 1rem; font-weight: 800; text-transform: uppercase;">${item.cat}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;

            const clearRecentBtn = resultsArea.querySelector('#clear-recent-search-btn');
            if (clearRecentBtn) {
                clearRecentBtn.onclick = () => {
                    localStorage.removeItem('etis_recent_search_items_v1');
                    renderResults('');
                };
            }

            const rows = resultsArea.querySelectorAll('.search-result-row');
            if (rows.length > 0) updateSearchSelection(rows);

            rows.forEach((row, idx) => {
                // Синхронизация мыши со стрелочками
                row.addEventListener('mouseenter', () => {
                    selectedSearchIndex = idx;
                    updateSearchSelection(rows);
                });

                row.onclick = () => {
                    const hIdx = parseInt(row.getAttribute('data-history-idx'), 10);
                    const item = recent[hIdx];
                    const original = searchIndex.find(x => x.id === item.id);
                    closeAll();
                    if (original && original.action) original.action();
                    else if (item.id.startsWith('nav_')) window.location.href = item.id.replace('nav_', '');
                };
            });
            return;
        }

        clearBtn.style.display = 'block';

        // Фильтрация
        const filtered = searchIndex.filter(item => {
            const inTitle = item.title.toLowerCase().includes(cleanQuery);
            const inSub = (item.sub || '').toLowerCase().includes(cleanQuery);
            const inCat = (item.cat || '').toLowerCase().includes(cleanQuery);
            return inTitle || inSub || inCat;
        });

        // Сортировка (Скоринг: Заголовок > Категория > Описание)
        filtered.sort((a, b) => {
            const getScore = (item) => {
                const title = item.title.toLowerCase();
                const sub = (item.sub || '').toLowerCase();
                const cat = (item.cat || '').toLowerCase();
                let score = 0;
                
                if (title === cleanQuery) score += 100;
                else if (title.startsWith(cleanQuery)) score += 80;
                else if (title.includes(cleanQuery)) score += 60;
                
                if (cat === cleanQuery) score += 50;
                else if (cat.includes(cleanQuery)) score += 40;
                
                if (sub.startsWith(cleanQuery)) score += 30;
                else if (sub.includes(cleanQuery)) score += 20;
                
                return score;
            };
            const diff = getScore(b) - getScore(a);
            if (diff !== 0) return diff;
            // Если баллы равны, сортируем по алфавиту
            return a.title.localeCompare(b.title);
        });

        if (filtered.length === 0) {
            resultsArea.innerHTML = `
                        <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                            <span class="material-icons" style="font-size: 40px; opacity: 0.35;">search_off</span>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary);">Ничего не нашлось</div>
                            <div style="font-size: 1.25rem;">По запросу «${query}» совпадений не обнаружено</div>
                        </div>
                    `;
            return;
        }

        const highlight = (str) => {
            if (!str) return '';
            const esc = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return str.replace(new RegExp(`(${esc})`, 'gi'), '<mark class="search-highlight">$1</mark>');
        };

        resultsArea.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap: 8px;">
                        ${filtered.map((item, idx) => `
                            <div class="search-result-row" data-search-idx="${idx}">
                                <div style="width: 38px; height: 38px; border-radius: 12px; background: var(--color-accent-active); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <span class="material-icons" style="font-size: 20px; color: var(--color-accent);">${item.icon || 'search'}</span>
                                </div>
                                <div style="flex: 1; min-width: 0; text-align: left;">
                                    <div class="search-result-title-box">
                                        ${highlight(item.title)}
                                    </div>
                                    <div style="font-size: 1.2rem; color: var(--color-text-secondary); line-height: 1.3; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        ${highlight(item.sub)}
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                                    <div class="search-enter-hint">
                                        <span>Открыть</span>
                                        <span class="material-icons" style="font-size: 1.8rem; margin:0;">keyboard_return</span>
                                    </div>
                                    ${item.badge ? `<span style="background: rgba(52, 199, 89, 0.15); color: var(--color-green); padding: 3px 8px; border-radius: 6px; font-size: 1.1rem; font-weight: 800;">${item.badge}</span>` : ''}
                                    <span style="background: var(--color-highlight); color: var(--color-text-secondary); padding: 3px 8px; border-radius: 6px; font-size: 1rem; font-weight: 800; text-transform: uppercase;">${item.cat}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;

        const rows = resultsArea.querySelectorAll('.search-result-row');
        if (rows.length > 0) updateSearchSelection(rows);

        rows.forEach((row, idx) => {
            row.addEventListener('mouseenter', () => {
                selectedSearchIndex = idx;
                updateSearchSelection(rows);
            });

            row.onclick = () => {
                const sIdx = parseInt(row.getAttribute('data-search-idx'), 10);
                const item = filtered[sIdx];
                pushToRecentHistory(item);
                closeAll();
                if (item.action) item.action();
            };
        });
    };

    inputField.addEventListener('input', (e) => renderResults(e.target.value));

    clearBtn.onclick = () => {
        inputField.value = '';
        renderResults('');
        inputField.focus();
    };

    // Обработка стрелочек Вверх/Вниз и Enter
    inputField.addEventListener('keydown', (e) => {
        const rows = resultsArea.querySelectorAll('.search-result-row');
        if (rows.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSearchIndex = (selectedSearchIndex + 1) % rows.length;
            updateSearchSelection(rows);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSearchIndex = (selectedSearchIndex - 1 + rows.length) % rows.length;
            updateSearchSelection(rows);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedRow = rows[selectedSearchIndex];
            if (selectedRow) selectedRow.click(); // Симулируем клик мыши
        }
    });

    renderResults('');

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.classList.add('modal-open-body');
    inputField.focus(); // Синхронный фокус
    setTimeout(() => inputField.focus(), 150);
}
