import { processDocxFile } from '../features/consultations/docx.js';
import { consultationsFiles, saveConsultationsState, setConsultationsFiles } from '../features/consultations/state.js';
import { updateLiveTimetable } from '../features/live-timetable.js';
import { escapeHTML, sanitizeUrl } from '../utils/security.ts';

export function openConsultationsModal(viewId = window.innerWidth <= 960 ? 'main_menu' : 'system_etis', initialSearch = '') {
    let overlay = document.getElementById('etis-cons-overlay');
    let modal = document.getElementById('etis-cons-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-cons-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-cons-modal';
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

    // Вспомогательное модальное окно добавления/редактирования преподавателя
    const openTeacherEditorModal = (fileId, teacherIndex = null, onSaved = null) => {
        const targetFile = consultationsFiles.find(f => f.id === fileId);
        if (!targetFile) return;

        const isEdit = teacherIndex !== null && targetFile.teachers[teacherIndex];
        const teacher = isEdit ? targetFile.teachers[teacherIndex] : {
            name: '',
            degree: '',
            email: '',
            notes: '',
            isActive: true,
            events: []
        };

        // Берём данные первого события (или пустые)
        const firstEvent = (teacher.events && teacher.events[0]) ? teacher.events[0] : {
            dayName: 'Понедельник',
            startTime: '15:15',
            endTime: '16:45',
            weekType: 'all',
            aud: '',
            link: ''
        };

        let editorOverlay = document.getElementById('etis-cons-teacher-editor-overlay');
        let editorModal = document.getElementById('etis-cons-teacher-editor-modal');
        if (!editorOverlay) {
            editorOverlay = document.createElement('div');
            editorOverlay.id = 'etis-cons-teacher-editor-overlay';
            editorOverlay.className = 'analytics-overlay';
            editorOverlay.style.zIndex = '2000005';
            document.body.appendChild(editorOverlay);
        }
        if (!editorModal) {
            editorModal = document.createElement('div');
            editorModal.id = 'etis-cons-teacher-editor-modal';
            editorModal.className = 'analytics-modal';
            editorModal.style.zIndex = '2000006';
            document.body.appendChild(editorModal);
        }

        const closeEditor = () => {
            editorOverlay.classList.remove('active');
            editorModal.classList.remove('active');
        };
        editorOverlay.onclick = closeEditor;

        const daysOptions = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'По договоренности']
            .map(d => `<option value="${d}" ${firstEvent.dayName === d ? 'selected' : ''}>${d}</option>`).join('');

        editorModal.innerHTML = `
                    <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2.4rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                        <span style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary);">${isEdit ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</span>
                        <span class="material-icons close-teacher-editor-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                    </div>
                    <div class="ui-dialog-content" style="padding: 2rem 2.4rem 2.4rem 2.4rem; max-height: 80vh; overflow-y: auto;">
                        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                            
                            <div class="custom-pair-input-group" style="margin: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">person</span>
                                    <input type="text" id="t-edit-name" placeholder="ФИО преподавателя *" value="${teacher.name || ''}">
                                </div>
                            </div>

                            <div class="custom-pair-input-group" style="margin: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">school</span>
                                    <input type="text" id="t-edit-degree" placeholder="Должность / кафедра (напр. доцент каф. ПИ)" value="${teacher.degree || ''}">
                                </div>
                            </div>

                            <div class="custom-pair-input-group" style="margin: 0 !important;">
                                <div class="cp-input-wrap" style="flex: 1.2;">
                                    <span class="material-icons">calendar_today</span>
                                    <select id="t-edit-day">${daysOptions}</select>
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">event_repeat</span>
                                    <select id="t-edit-weektype">
                                        <option value="all" ${firstEvent.weekType === 'all' ? 'selected' : ''}>Все недели</option>
                                        <option value="even" ${firstEvent.weekType === 'even' ? 'selected' : ''}>Чётные</option>
                                        <option value="odd" ${firstEvent.weekType === 'odd' ? 'selected' : ''}>Нечётные</option>
                                    </select>
                                </div>
                            </div>

                            <div class="custom-pair-input-group" style="margin: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">schedule</span>
                                    <input type="time" id="t-edit-start" value="${firstEvent.startTime && firstEvent.startTime.includes(':') ? firstEvent.startTime : '15:15'}" title="Начало">
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">flag</span>
                                    <input type="time" id="t-edit-end" value="${firstEvent.endTime && firstEvent.endTime.includes(':') ? firstEvent.endTime : '16:45'}" title="Окончание">
                                </div>
                            </div>

                            <div class="custom-pair-input-group" style="margin: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">place</span>
                                    <input type="text" id="t-edit-aud" placeholder="Аудитория (напр. 308/8)" value="${firstEvent.aud || ''}">
                                </div>
                                <div class="cp-input-wrap">
                                    <span class="material-icons">alternate_email</span>
                                    <input type="text" id="t-edit-email" placeholder="Email (напр. teacher@psu.ru)" value="${teacher.email || ''}">
                                </div>
                            </div>

                            <div class="custom-pair-input-group" style="margin: 0 !important;">
                                <div class="cp-input-wrap">
                                    <span class="material-icons">link</span>
                                    <input type="text" id="t-edit-link" placeholder="Ссылка на онлайн-комнату (Zoom, Телемост...)" value="${firstEvent.link || ''}">
                                </div>
                            </div>

                            <div style="margin: 0 !important;">
                                <textarea class="note-modal-textarea" id="t-edit-notes" placeholder="Примечания (напр. По предварительной записи за 2 дня)..." style="min-height: 80px; margin-top: 0 !important; font-size: 1.35rem;">${teacher.notes || ''}</textarea>
                            </div>

                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 0.8rem;">
                                <button type="button" class="answer-btn-custom" id="t-edit-cancel-btn" style="background: var(--color-highlight) !important; color: var(--color-text-secondary) !important; border: 1px solid var(--color-table-border) !important; box-shadow: none !important;">Отмена</button>
                                <button type="button" class="answer-btn-custom" id="t-edit-save-btn">Сохранить</button>
                            </div>

                        </div>
                    </div>
                `;

        editorModal.querySelector('.close-teacher-editor-btn').onclick = closeEditor;
        editorModal.querySelector('#t-edit-cancel-btn').onclick = closeEditor;

        editorModal.querySelector('#t-edit-save-btn').onclick = () => {
            const name = editorModal.querySelector('#t-edit-name').value.trim();
            if (!name) {
                alert('Укажите ФИО преподавателя!');
                return;
            }

            const degree = editorModal.querySelector('#t-edit-degree').value.trim();
            const dayName = editorModal.querySelector('#t-edit-day').value;
            const weekType = editorModal.querySelector('#t-edit-weektype').value;
            const startTime = editorModal.querySelector('#t-edit-start').value;
            const endTime = editorModal.querySelector('#t-edit-end').value;
            const aud = editorModal.querySelector('#t-edit-aud').value.trim();
            const email = editorModal.querySelector('#t-edit-email').value.trim();
            const link = editorModal.querySelector('#t-edit-link').value.trim();
            const notes = editorModal.querySelector('#t-edit-notes').value.trim();

            const eventObj = {
                dayName,
                weekType,
                startTime: dayName === 'По договоренности' ? 'По дог.' : (startTime || '15:15'),
                endTime: dayName === 'По договоренности' ? '' : endTime,
                aud,
                link
            };

            const updatedTeacher = {
                name,
                degree,
                email,
                notes,
                isActive: isEdit ? teacher.isActive : true,
                events: [eventObj]
            };

            if (isEdit) {
                targetFile.teachers[teacherIndex] = updatedTeacher;
            } else {
                targetFile.teachers.push(updatedTeacher);
            }

            saveConsultationsState();
            closeEditor();

            if (typeof onSaved === 'function') onSaved();

            // Мгновенно обновляем расписание
            if (typeof window.injectConsultationPairs === 'function') {
                document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                window.injectConsultationPairs();
                if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
            }
        };

        requestAnimationFrame(() => {
            editorOverlay.classList.add('active');
            editorModal.classList.add('active');
        });
    };

    const renderView = (activeFileId, autoFilterQuery = '') => {
         if (activeFileId === 'main_menu' && window.innerWidth > 960) activeFileId = 'system_etis';
        const isMainMobile = activeFileId === 'main_menu';

        let sidebarHtml = `
                    <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Консультации</div>
                    <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                        Консультации
                        <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                    </div>

                    <div class="sidebar-tabs-container">
                        <div class="settings-sidebar-btn ${activeFileId === 'system_etis' ? 'active' : ''}" data-file-id="system_etis">
                            <span class="material-icons" style="margin-right: 12px; ${activeFileId === 'system_etis' ? '' : 'color: var(--color-text-secondary);'}">school</span>
                            <span class="sidebar-btn-text" style="flex-grow: 1; font-weight: 600;">Расписание ЕТИС</span>
                            <span class="material-icons chevron" style="color: var(--color-text-secondary);">chevron_right</span>
                        </div>

                        <div class="settings-sidebar-btn ${activeFileId === 'upload_cons' ? 'active' : ''}" data-file-id="upload_cons">
                            <span class="material-icons" style="margin-right: 12px; ${activeFileId === 'upload_cons' ? '' : 'color: var(--color-text-secondary);'}">upload_file</span>
                            <span class="sidebar-btn-text" style="flex-grow: 1; font-weight: 600;">Добавить / Создать</span>
                            <span class="material-icons chevron" style="color: var(--color-text-secondary);">chevron_right</span>
                        </div>
                `;

        consultationsFiles.forEach(file => {
            const shortTitle = file.title.substring(0, 25) + (file.title.length > 25 ? '...' : '');
            const isActiveClass = activeFileId === file.id ? 'active' : '';
            sidebarHtml += `
                        <div class="settings-sidebar-btn ${isActiveClass}" data-file-id="${file.id}">
                            <span class="material-icons" style="margin-right: 12px; ${activeFileId === file.id ? '' : 'color: var(--color-text-secondary);'}">description</span>
                            <span class="sidebar-btn-text" title="${file.title}" style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600;">${shortTitle}</span>
                            <span class="material-icons chevron" style="color: var(--color-text-secondary);">chevron_right</span>
                        </div>
                    `;
        });

        sidebarHtml += `</div>`;

        let contentHtml = '';
        let headerTitle = 'Информация';
        const activeFile = consultationsFiles.find(f => f.id === activeFileId);

        if (activeFileId === 'system_etis') {
            headerTitle = 'Встроенные консультации';
            const isSystemShow = localStorage.getItem('etis_show_consultations') !== 'false';

            const hasSystemConsultations = Array.from(document.querySelectorAll('.span9 .timetable-grid tr:not(.docx-consultation-row):not(.custom-pair-row)')).some(row => {
                const dis = row.querySelector('.dis');
                return dis && dis.textContent.toLowerCase().includes('консультация');
            });

            const descText = hasSystemConsultations
                ? 'Это консультации, которые система ЕТИС автоматически добавила в ваше расписание.'
                : 'Это консультации, которые система ЕТИС автоматически добавила в ваше расписание. На этой неделе у преподавателей консультаций нет.';

            contentHtml = `
                        <div style="background: var(--color-card); padding: 1.6rem; border-radius: var(--radius-large); margin-bottom: 2.4rem; border: none; box-shadow: var(--shadow-main);">
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 1.6rem; line-height: 1.4;">За текущий период</div>
                            <p style="font-size: 1.3rem; color: var(--color-text-secondary); margin-bottom: 0; line-height: 1.5;">
                                ${descText}
                            </p>
                        </div>
                        ${hasSystemConsultations ? `
                        <div class="ios-settings-group">
                            <label>
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Отображать в расписании</span>
                                <input type="checkbox" id="system-cons-toggle" class="tumbler-checkbox" ${isSystemShow ? 'checked' : ''}>
                            </label>
                        </div>
                        ` : ''}
                    `;
        } else if (activeFileId === 'upload_cons') {
            headerTitle = 'Добавить расписание';
            contentHtml = `
                        <!-- Создание собственного пустого списка -->
                        <div class="ios-settings-group" style="margin-bottom: 2rem;">
                            <div class="ios-settings-row" id="create-manual-cons-list-btn" style="cursor: pointer; padding: 1.4rem 1.6rem !important;">
                                <div style="display: flex; align-items: center; gap: 14px;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--color-accent-active); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="color: var(--color-accent); font-size: 22px;">playlist_add</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; text-align: left;">
                                        <span style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-primary);">Создать список вручную</span>
                                        <span style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 2px;">Создать вкладку и добавить своих преподавателей</span>
                                    </div>
                                </div>
                                <span class="material-icons chevron" style="color: var(--color-text-secondary); opacity: 0.5;">chevron_right</span>
                            </div>
                        </div>

                        <!-- Загрузка из DOCX -->
                        <div style="background: var(--color-card); padding: 2rem; border-radius: var(--radius-large); margin-bottom: 2.4rem; border: none; box-shadow: var(--shadow-main);">
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 1.2rem; line-height: 1.4;">Загрузка файла .docx</div>
                            <p style="font-size: 1.3rem; color: var(--color-text-secondary); margin-bottom: 2rem; line-height: 1.5;">
                                Зайдите в <a href="stu_ann.announces" style="color: var(--color-accent); font-weight: 800; text-decoration: none;">Объявления</a>, впишите в поиск <span class="copy-word-hint" title="Нажмите, чтобы скопировать" data-copy="консультаций">"консультаций"</span>, нажмите "В расписание", либо скачайте DOCX-файл и перетащите в поле ниже:
                            </p>

                            <div id="cons-drop-zone" style="border: 2px dashed var(--color-accent); border-radius: var(--radius-medium); padding: 3.6rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--color-card);">
                                <span class="material-icons" style="font-size: 4rem; color: var(--color-accent); margin-bottom: 1rem;">cloud_upload</span>
                                <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.5rem;">Нажмите или перетащите файл сюда</div>
                                <div style="font-size: 1.2rem; color: var(--color-text-secondary);">Поддерживаются файлы .docx</div>
                                <input type="file" id="upload-cons-docx" accept=".docx" style="display: none;">
                            </div>
                        </div>
                    `;
        } else if (activeFile) {
            headerTitle = activeFile.title;
            const isFileActive = activeFile.isActive;

            contentHtml = `
                        <div class="ios-settings-group" style="margin-bottom: 1.6rem;">
                            <label>
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Отображать в расписании</span>
                                <input type="checkbox" class="tumbler-checkbox toggle-cons-file" data-id="${activeFile.id}" ${isFileActive ? 'checked' : ''}>
                            </label>
                            <!-- Добавить преподавателя в текущий файл -->
                            <div class="ios-settings-row add-teacher-to-file-btn" data-id="${activeFile.id}" style="cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span class="material-icons" style="color: var(--color-accent);">person_add</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Добавить преподавателя</span>
                                </div>
                                <span class="material-icons chevron" style="color: var(--color-text-secondary); opacity: 0.5;">chevron_right</span>
                            </div>
                            <!-- Переименовать вкладку -->
                            <div class="ios-settings-row rename-cons-file-btn" data-id="${activeFile.id}" style="cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span class="material-icons" style="color: var(--color-text-secondary);">drive_file_rename_outline</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Переименовать вкладку</span>
                                </div>
                                <span class="material-icons chevron" style="color: var(--color-text-secondary); opacity: 0.5;">chevron_right</span>
                            </div>
                            <!-- Удалить файл -->
                            <div class="ios-settings-row delete-cons-file" data-id="${activeFile.id}" style="cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span class="material-icons" style="color: var(--color-red);">delete_outline</span>
                                    <span style="font-size:1.4rem; font-weight:600; color:var(--color-red);">Удалить вкладку</span>
                                </div>
                            </div>
                        </div>

                        <div class="teacher-search-wrapper" style="margin-top: 0; margin-bottom: 1.6rem;">
                            <div class="search-capsule" style="max-width: 100%;">
                                <span class="material-icons search-icon">search</span>
                                <input type="text" class="search-input" id="cons-search-input" placeholder="Поиск преподавателя..." style="padding-left: 44px !important;">
                            </div>
                        </div>

                        <div id="cons-teachers-list" style="display: flex; flex-direction: column; gap: 1.2rem;">
                    `;

            if (!activeFile.teachers || activeFile.teachers.length === 0) {
                contentHtml += `
                            <div style="text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary);">
                                В этом списке пока нет преподавателей. Нажмите «Добавить преподавателя» выше.
                            </div>
                        `;
            } else {
                activeFile.teachers.forEach((t, tIdx) => {
                    let eventsHtml = (t.events || []).map(ev =>
                        `<span style="background: var(--color-accent-active); color: var(--color-accent); padding: 2px 8px; border-radius: 6px; font-size: 1.1rem; font-weight: 700; white-space: nowrap;">
                                    ${ev.weekType === 'even' ? '(Чёт) ' : ev.weekType === 'odd' ? '(Нечёт) ' : ''}${ev.dayName} ${ev.startTime}${ev.endTime ? '-' + ev.endTime : ''}
                                </span>`
                    ).join(' ');

                    const isTeacherActive = t.isActive === true;
                    const cardOpacity = (!isFileActive || isTeacherActive) ? '1' : '0.5';

                    const uniqueAuds = [...new Set((t.events || []).map(e => e.aud).filter(Boolean))].join(', ');
                    const uniqueLinks = [...new Set((t.events || []).map(e => e.link).filter(Boolean))];

                    contentHtml += `
                                <div class="cons-teacher-card" data-name="${escapeHTML((t.name || '').toLowerCase())}" style="background: var(--color-card); border: 1px solid var(--color-table-border); padding: 1.6rem; border-radius: var(--radius-large); opacity: ${cardOpacity}; transition: opacity 0.2s; position: relative;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 1.55rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.3;">${escapeHTML(t.name)}</div>
                                            ${t.degree ? `<div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-top: 4px; margin-bottom: 10px;">${escapeHTML(t.degree)}</div>` : '<div style="margin-bottom: 8px;"></div>'}
                                        </div>
                                        
                                        <!-- Панель действий карточки: редактировать, удалить, тумблер -->
                                        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                                            <button type="button" class="edit-teacher-btn" data-file-id="${activeFile.id}" data-teacher-idx="${tIdx}" title="Редактировать" style="width: 32px !important; height: 32px !important; min-width: 32px !important; min-height: 32px !important; border-radius: 50% !important; background: transparent !important; background-color: transparent !important; border: none !important; box-shadow: none !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; margin: 0 !important; outline: none !important;">
                                                <span class="material-icons" style="font-size: 18px !important; color: var(--color-text-secondary) !important; line-height: 1 !important; margin: 0 !important;">edit</span>
                                            </button>
                                            <button type="button" class="delete-teacher-btn" data-file-id="${activeFile.id}" data-teacher-idx="${tIdx}" title="Удалить преподавателя" style="width: 32px !important; height: 32px !important; min-width: 32px !important; min-height: 32px !important; border-radius: 50% !important; background: transparent !important; background-color: transparent !important; border: none !important; box-shadow: none !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; margin: 0 !important; outline: none !important;">
                                                <span class="material-icons" style="font-size: 18px !important; color: var(--color-red) !important; line-height: 1 !important; margin: 0 !important;">delete_outline</span>
                                            </button>
                                            <label style="display: ${isFileActive ? 'inline-flex' : 'none'} !important; align-items:center; cursor:pointer; margin:0 0 0 4px; padding:0; border:none; background:transparent;">
                                                <input type="checkbox" class="tumbler-checkbox toggle-cons-teacher" data-file-id="${activeFile.id}" data-teacher-idx="${tIdx}" ${isTeacherActive ? 'checked' : ''}>
                                            </label>
                                        </div>
                                    </div>

                                    ${eventsHtml ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom: 8px;">${eventsHtml}</div>` : ''}

                                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 1.2rem; color: var(--color-text-secondary);">
                                        ${uniqueAuds ? `<div><span class="material-icons" style="font-size: 1.4rem; vertical-align: middle; margin-right: 4px;">place</span>${escapeHTML(uniqueAuds)}</div>` : ''}
                                        ${t.email ? `<div><span class="material-icons" style="font-size: 1.4rem; vertical-align: middle; margin-right: 4px;">email</span><span class="cons-email-copy" data-email="${escapeHTML(t.email)}">${escapeHTML(t.email)}</span></div>` : ''}
                                        ${uniqueLinks.length > 0 && sanitizeUrl(uniqueLinks[0]) !== '#' ? `<div><span class="material-icons" style="font-size: 1.4rem; vertical-align: middle; margin-right: 4px;">link</span><a href="${sanitizeUrl(uniqueLinks[0])}" target="_blank" rel="noopener noreferrer" style="color: var(--color-text-link);">Ссылка на онлайн-комнату</a></div>` : ''}
                                        ${t.notes ? `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--color-table-border);"><i>${escapeHTML(t.notes)}</i></div>` : ''}
                                    </div>
                                </div>
                            `;
                });
            }
            contentHtml += `</div>`;
        }

        modal.innerHTML = `
                    <div class="settings-layout">
                        <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                            ${sidebarHtml}
                        </div>
                        <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="settings-content-scroll">
                                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <span class="material-icons back-modal-btn settings-mobile-header" data-back="main_menu" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                        <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${headerTitle}</span>
                                    </div>
                                    <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                                </div>
                                <div style="padding: 0.8rem 0 4rem 0;">
                                    ${contentHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeAll);
        modal.querySelectorAll('.back-modal-btn').forEach(btn => btn.onclick = () => renderView('main_menu'));

        modal.querySelectorAll('.settings-sidebar-btn[data-file-id]').forEach(btn => {
            btn.onclick = () => renderView(btn.getAttribute('data-file-id'));
        });

        // 1. Создание нового пустого списка вручную
        const createManualBtn = modal.querySelector('#create-manual-cons-list-btn');
        if (createManualBtn) {
            createManualBtn.onclick = () => {
                const title = prompt('Введите название для новой вкладки консультаций (напр. Весна 2026 или Кафедра ИТ):');
                if (title && title.trim()) {
                    const newFile = {
                        id: 'cons_file_' + Date.now(),
                        title: title.trim(),
                        isActive: true,
                        sourceUrl: null,
                        teachers: []
                    };
                    consultationsFiles.push(newFile);
                    saveConsultationsState();
                    renderView(newFile.id);
                }
            };
        }

        // 2. Переименование текущей вкладки
        const renameBtn = modal.querySelector('.rename-cons-file-btn');
        if (renameBtn) {
            renameBtn.onclick = () => {
                const fileId = renameBtn.getAttribute('data-id');
                const f = consultationsFiles.find(x => x.id === fileId);
                if (f) {
                    const newTitle = prompt('Новое название вкладки:', f.title);
                    if (newTitle && newTitle.trim()) {
                        f.title = newTitle.trim();
                        saveConsultationsState();
                        renderView(fileId);
                    }
                }
            };
        }

        // 3. Добавление преподавателя в текущую вкладку
        const addTeacherBtn = modal.querySelector('.add-teacher-to-file-btn');
        if (addTeacherBtn) {
            addTeacherBtn.onclick = () => {
                const fileId = addTeacherBtn.getAttribute('data-id');
                openTeacherEditorModal(fileId, null, () => renderView(fileId));
            };
        }

        // 4. Редактирование преподавателя
        modal.querySelectorAll('.edit-teacher-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const fileId = btn.getAttribute('data-file-id');
                const idx = parseInt(btn.getAttribute('data-teacher-idx'), 10);
                openTeacherEditorModal(fileId, idx, () => renderView(fileId));
            };
        });

        // 5. Удаление преподавателя
        modal.querySelectorAll('.delete-teacher-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const fileId = btn.getAttribute('data-file-id');
                const idx = parseInt(btn.getAttribute('data-teacher-idx'), 10);
                const f = consultationsFiles.find(x => x.id === fileId);
                if (f && f.teachers[idx] && confirm(`Удалить преподавателя ${f.teachers[idx].name}?`)) {
                    f.teachers.splice(idx, 1);
                    saveConsultationsState();
                    renderView(fileId);
                    if (typeof window.injectConsultationPairs === 'function') {
                        document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                        window.injectConsultationPairs();
                        if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                    }
                }
            };
        });

        // Поиск по карточкам преподавателей
        const searchInput = modal.querySelector('#cons-search-input');
        if (searchInput) {
            // Если передан преподаватель из глобального поиска — вписываем и сразу фильтруем
            if (autoFilterQuery) {
                searchInput.value = autoFilterQuery;
                const q = autoFilterQuery.toLowerCase().trim();
                modal.querySelectorAll('.cons-teacher-card').forEach(card => {
                    const name = card.getAttribute('data-name') || '';
                    card.style.display = name.includes(q) ? 'block' : 'none';
                });
            }

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                modal.querySelectorAll('.cons-teacher-card').forEach(card => {
                    const name = card.getAttribute('data-name') || '';
                    card.style.display = name.includes(query) ? 'block' : 'none';
                });
            });
        }

        // Drag & Drop и файловый выбор DOCX
        const dropZone = modal.querySelector('#cons-drop-zone');
        const fileInput = modal.querySelector('#upload-cons-docx');
        if (dropZone && fileInput) {
            dropZone.onclick = () => fileInput.click();
            dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.background = 'var(--color-accent-active)'; };
            dropZone.ondragleave = (e) => { e.preventDefault(); dropZone.style.background = 'var(--color-card)'; };
            dropZone.ondrop = (e) => {
                e.preventDefault(); dropZone.style.background = 'var(--color-card)';
                if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            };
            fileInput.onchange = (e) => {
                if (e.target.files.length > 0) handleFile(e.target.files[0]);
            };

            function handleFile(file) {
                dropZone.innerHTML = '<span class="material-icons" style="font-size:4rem; color:var(--color-accent); animation:spin 1s linear infinite;">sync</span><div style="margin-top:1rem; font-size:1.4rem; font-weight:700;">Анализ файла...</div>';
                dropZone.style.pointerEvents = 'none';
                processDocxFile(file, (success, fileData) => {
                    if (success) {
                        renderView(fileData.id);
                        if (typeof window.injectConsultationPairs === 'function') {
                            document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                            window.injectConsultationPairs();
                            if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                            if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                        }
                    } else {
                        alert('Ошибка при чтении файла. Убедитесь, что это DOCX.');
                        renderView('upload_cons');
                    }
                });
            }
        }

        // Тумблеры системных консультаций
        const sysToggle = modal.querySelector('#system-cons-toggle');
        if (sysToggle) {
            sysToggle.onchange = (e) => {
                const isShow = e.target.checked;
                localStorage.setItem('etis_show_consultations', isShow);
                const span9 = document.querySelector('.span9');
                if (span9) {
                    span9.querySelectorAll('.consultation-row').forEach(row => {
                        row.style.display = isShow ? '' : 'none';
                        if (isShow) row.classList.remove('hidden-by-filter');
                        else row.classList.add('hidden-by-filter');
                    });
                    if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                    if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                }
            };
        }

        // Тумблер преподавателя
        modal.querySelectorAll('.toggle-cons-teacher').forEach(box => {
            box.onchange = (e) => {
                const fId = e.target.getAttribute('data-file-id');
                const tIdx = e.target.getAttribute('data-teacher-idx');
                const f = consultationsFiles.find(file => file.id === fId);
                if (f && f.teachers[tIdx]) {
                    f.teachers[tIdx].isActive = e.target.checked;
                    saveConsultationsState();
                    const card = e.target.closest('.cons-teacher-card');
                    if (card) card.style.opacity = e.target.checked ? '1' : '0.5';
                    if (typeof window.injectConsultationPairs === 'function') {
                        document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                        window.injectConsultationPairs();
                        if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                        if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                    }
                }
            };
        });

        // Тумблер всего файла
        modal.querySelectorAll('.toggle-cons-file').forEach(box => {
            box.onchange = (e) => {
                const fId = box.getAttribute('data-id');
                const f = consultationsFiles.find(file => file.id === fId);
                if (f) {
                    f.isActive = box.checked;
                    saveConsultationsState();
                    renderView(fId);
                    if (typeof window.injectConsultationPairs === 'function') {
                        document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                        window.injectConsultationPairs();
                        if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                        if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                    }
                }
            };
        });

        // Удаление файла
        const delBtn = modal.querySelector('.delete-cons-file');
        if (delBtn) {
            delBtn.onclick = () => {
                if (confirm('Удалить эту вкладку консультаций?')) {
                    const fileId = delBtn.getAttribute('data-id');
                    setConsultationsFiles(consultationsFiles.filter(f => f.id !== fileId));
                    saveConsultationsState();
                    if (typeof window.injectConsultationPairs === 'function') {
                        document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                        window.injectConsultationPairs();
                        if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                        if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                    }
                    renderView('main_menu');
                }
            };
        }
    };

    renderView(viewId, initialSearch);
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}

export function consultationsBoot() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cons-email-copy')) {
            const email = e.target.getAttribute('data-email');
            if (!email) return;
            navigator.clipboard.writeText(email);

            const origText = e.target.textContent;
            e.target.textContent = 'Скопировано!';
            e.target.style.color = 'var(--color-green)';

            setTimeout(() => {
                e.target.textContent = origText;
                e.target.style.color = 'var(--color-text-link)';
            }, 1000);
        }
    });
}
