import { returnToDrawer } from '../ui/drawer.js';

// Открывает модальное окно обучения с подсказками по функциям
function openGuideModal(view = window.innerWidth <= 960 ? 'menu' : 'timetable_guide') {
    let overlay = document.getElementById('etis-guide-overlay');
    let modal = document.getElementById('etis-guide-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-guide-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-guide-modal';
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

    const renderView = (currentView) => {
        if (currentView === 'menu' && window.innerWidth > 960) currentView = 'timetable_guide';

        let title = 'Обучение';
        let contentHTML = '';
        let backTarget = 'menu';

        const guideCard = (icon, itemTitle, pcDesc, mobDesc = null, singleDesc = null) => `
                    <div class="ios-settings-group" style="margin-bottom: 1.6rem;">
                        <div style="padding: 1.8rem 2rem; text-align: left;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1.2rem;">
                                <span class="material-icons" style="color: var(--color-accent); font-size: 2.2rem;">${icon}</span>
                                <span style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.3;">${itemTitle}</span>
                            </div>
                            <div style="font-size: 1.35rem; line-height: 1.6; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 1rem;">
                                ${singleDesc ? `<div>${singleDesc}</div>` : `
                                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                                        <span style="font-size: 1.5rem; line-height: 1.4;">🖥️</span>
                                        <div><b style="color: var(--color-text-primary);">На ПК:</b> ${pcDesc}</div>
                                    </div>
                                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                                        <span style="font-size: 1.5rem; line-height: 1.4;">📱</span>
                                        <div><b style="color: var(--color-text-primary);">На телефоне:</b> ${mobDesc}</div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;

        if (currentView === 'timetable_guide') {
            title = 'Расписание';
            contentHTML = `
                        ${guideCard(
                    'edit_note',
                    'Как добавить заметку',
                    'Наведите курсор на строку пары — рядом с аудиторией появится значок карандаша ✎. Нажмите на него, введите задание во вкладке «Заметка» и сохраните. Тумблер «На следующую пару» автоматически перенесет заметку на следующее такое же занятие.',
                    'Смахните (сделайте свайп) строку пары <b>влево</b> — откроется окно ввода заметки. Также можно нажать на карандаш внутри карточки пары.'
                )}
                        ${guideCard(
                    'notification_important',
                    'Как пометить пару важной',
                    'Наведите курсор на ячейку с номером пары слева — на бейдже типа занятия (ЛЕК / ПРАКТ) появится колокольчик. Нажмите на него: он загорится красным, а пара выделится как важная.',
                    'Смахните строку пары <b>вправо</b> до появления колокольчика с вибрацией. Пара выделится красным цветом.'
                )}
                        ${guideCard(
                    'star_rate',
                    'Как оценить пару',
                    'Наведите курсор на имя преподавателя справа — появится кнопка «Оценить занятие» со ссылкой на официальную форму оценивания.',
                    'Смахните уже прошедшую пару <b>вправо</b> — появится значок звезды для быстрого перехода к отзыву.'
                )}
                        ${guideCard(
                    'ios_share',
                    'Как поделиться расписанием за день',
                    'Наведите курсор на заголовок дня (например, «Понедельник») — в правом углу появится иконка экспорта ⎘ для скачивания аккуратной картинки расписания.',
                    'Смахните заголовок дня <b>влево</b> (или нажмите иконку «Поделиться» в шапке дня) — откроется системное меню отправки картинки в Telegram, ВК или галерею.'
                )}
                    `;
        } else if (currentView === 'features_guide') {
            title = 'Удобные функции';
            contentHTML = `
                        ${guideCard(
                    'alarm_on',
                    'Как создать напоминание о паре',
                    null, null,
                    'Нажмите на значок карандаша ✎ рядом с нужной парой (или смахните строку пары <b>влево</b> на смартфоне) → перейдите во вкладку <b>«Напоминание»</b> → выберите платформу и время напоминания (например, за 1 час) → нажмите <b>«Добавить»</b>. Пара временем, аудиторией и преподавателем сразу появится в вашем календаре.'
                )}
                        ${guideCard(
                    'cloud_sync',
                    'Как включить синхронизацию',
                    null, null,
                    'Откройте раздел <b>«Профиль»</b> в меню → перейдите во вкладку <b>«Мои данные»</b> → нажмите <b>«Включить авто-синхронизацию»</b>. Ваши кастомные пары, заметки, файлы консультаций и цветовые темы будут автоматически синхронизироваться между всеми устройствами.'
                )}
                        ${guideCard(
                    'flash_on',
                    'Как войти в ЕТИС без пароля',
                    null, null,
                    'Откройте <b>«Настройки»</b> → вкладка <b>«Общие»</b> → включите тумблер <b>«Быстрый вход»</b> → нажмите <b>«Настроить аккаунты»</b> и сохраните данные. При следующем входе появится кнопка быстрого входа в один клик.'
                )}
                        ${guideCard(
                    'science',
                    'Как открыть бета функции',
                    null, null,
                    'Откройте <b>«Настройки»</b> → перейдите во вкладку <b>«Бета функции»</b> и включите тумблер <b>«Экспериментальные функции»</b>. На данный момент доступно тестирование ИИ-сводки в объявлениях, но в будущем появятся больше функций'
                )}
                    `;
        } else if (currentView === 'feedback_guide') {
            title = 'Обратная связь';
            contentHTML = `
                        ${guideCard(
                    'bug_report',
                    'Как сообщить об ошибке',
                    null, null,
                    'В самом низу бокового меню (или шторки на телефонах) нажмите на кнопку <b>«Нашли ошибку?»</b> (или перейдите по ссылке <a href="https://etisreborn.ru/#bugreport" target="_blank" style="color:var(--color-accent); font-weight:700;">etisreborn.ru/#bugreport</a>). Опишите проблему и приложите скриншот, чтобы автор мог оперативно выпустить исправление.'
                )}
                        ${guideCard(
                    'campaign',
                    'Как предложить новые функции',
                    null, null,
                    'Напишите мне в <b><a href="https://t.me/perdyash" target="_blank" style="color:var(--color-accent); font-weight:700;">Telegram</a></b> (ссылка также есть внизу сайдбара).'
                )}
                    `;
        }

        const isMainMobile = currentView === 'menu';

        modal.innerHTML = `
                    <div class="settings-layout">
                        <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Обучение</div>
                            <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons back-to-drawer-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                    <span>Обучение</span>
                                </div>
                                <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                            </div>

                            <div class="sidebar-tabs-container">
                                <div class="settings-sidebar-btn ${currentView === 'timetable_guide' ? 'active' : ''}" data-target="timetable_guide">
                                    <span class="material-icons">calendar_today</span><span class="sidebar-btn-text">Расписание</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'features_guide' ? 'active' : ''}" data-target="features_guide">
                                    <span class="material-icons">auto_awesome</span><span class="sidebar-btn-text">Удобные функции</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                                <div class="settings-sidebar-btn ${currentView === 'feedback_guide' ? 'active' : ''}" data-target="feedback_guide">
                                    <span class="material-icons">support_agent</span><span class="sidebar-btn-text">Обратная связь</span><span class="material-icons chevron">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                            <div class="settings-content-scroll">
                                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <span class="material-icons back-modal-btn settings-mobile-header" data-back="${backTarget}" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                        <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${title}</span>
                                    </div>
                                    <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                                </div>
                                <div style="padding: 0.8rem 0 4rem 0;">
                                    ${contentHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeAll);
        modal.querySelectorAll('.back-modal-btn').forEach(btn => btn.onclick = () => renderView(btn.getAttribute('data-back')));
        modal.querySelectorAll('.settings-sidebar-btn').forEach(btn => {
            btn.onclick = () => renderView(btn.getAttribute('data-target'));
        });
        modal.querySelectorAll('.back-to-drawer-btn').forEach(btn => {
            btn.onclick = () => returnToDrawer(modal, overlay);
        });
    };

    renderView(view);
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open-body');
    });
}
