import { getTermWord } from '../utils/term-system.ts';

export function updateEmptyState(container, hasResults, query = '', type = 'default') {
    let emptyEl = container.querySelector('.etis-empty-state');

    if (hasResults) {
        if (emptyEl) emptyEl.remove();
        return;
    }

    const termWord = getTermWord('prep_sg');

    let title = 'Ничего не нашлось';
    let subtitle = 'Попробуйте изменить запрос или сбросить фильтры.';
    let icon = 'search_off';

    if (!query) {
        icon = 'folder_open';
        if (type === 'teachers') {
            title = 'Список преподавателей пуст';
            subtitle = `Похоже, в текущем ${termWord} у вас нет назначенных занятий или информация еще не обновилась.`;
        } else if (type === 'grades') {
            title = 'Оценок пока нет';
            subtitle = `В выбранном ${termWord} еще не выставлено ни одного контрольного мероприятия.`;
        } else if (type === 'library') {
            title = 'Литература не найдена';
            subtitle = 'В этом разделе библиотеки сейчас нет доступных книг или рекомендуемых изданий.';
        } else if (type === 'announces') {
            title = 'Объявлений пока нет';
            subtitle = 'В этом разделе еще не опубликовано ни одного официального объявления.';
            icon = 'campaign';
        } else if (type === 'messages') {
            title = 'Сообщений пока нет';
            subtitle = 'У вас нет входящих сообщений от преподавателей.';
            icon = 'mail';
        } else if (type === 'journal') {
            title = 'Журнал пуст';
            subtitle = 'У вас нет доступных записей в журнале посещений.';
            icon = 'fact_check';
        } else if (type === 'comments') {
            title = 'Комментариев пока нет';
            subtitle = 'Вы еще не оставили ни одного комментария по оценке качества занятий.';
            icon = 'forum';
        } else if (type === 'rating') {
            title = 'Рейтинг пуст';
            subtitle = 'На данный момент статистика оценок факультетов и кафедр недоступна.';
            icon = 'emoji_events';
        } else if (type === 'teacher_stats') {
            title = 'Статистика пуста';
            subtitle = 'Похоже, за последние 2 сессии по вашим дисциплинам еще нет накопленных данных.';
            icon = 'insights';
        } else if (type === 'absence') {
            title = 'Пропусков нет';
            subtitle = 'За выбранный учебный период у вас нет зафиксированных пропусков занятий. Так держать!';
            icon = 'verified';
        } else if (type === 'term_test') {
            title = 'Оценки не требуются';
            subtitle = 'На данный момент у вас нет дистанционных занятий, требующих оценки.';
            icon = 'fact_check';
        }
        else if (type === 'timetable') {
            title = 'Свободная неделя';
            subtitle = 'На этой неделе у вас нет запланированных занятий. Отличный повод немного отдохнуть!';
            icon = 'free_breakfast';
        }
    } else {
        subtitle = `По запросу <b>«${query}»</b> ничего не найдено. Проверьте раскладку клавиатуры или попробуйте изменить поисковый запрос.`;
    }

    if (emptyEl) {
        emptyEl.querySelector('.etis-empty-title').textContent = title;
        emptyEl.querySelector('.etis-empty-subtitle').innerHTML = subtitle;
        emptyEl.querySelector('.material-icons').textContent = icon;
        return;
    }

    emptyEl = document.createElement('div');
    emptyEl.className = 'etis-empty-state';

    emptyEl.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                text-align: left;
                padding: 2.4rem !important;
                background: var(--color-card);
                border-radius: var(--radius-large);
                border: 1px solid var(--color-table-border);
                box-shadow: var(--shadow-main);
                margin: 0 0 1.6rem 0 !important;
                animation: fadeIn 0.25s ease-out;
                width: 100%;
                box-sizing: border-box;
            `;
    emptyEl.innerHTML = `
                <span class="material-icons" style="font-size: 4.8rem; color: var(--color-text-secondary); opacity: 0.6; margin-bottom: 1.6rem;">${icon}</span>
                <div class="etis-empty-title" style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.8rem;">${title}</div>
                <div class="etis-empty-subtitle" style="font-size: 1.3rem; color: var(--color-text-secondary); max-width: 420px; line-height: 1.5;">${subtitle}</div>
            `;

    // Позиционирование выше официальных уведомлений и ссылок статистики
    const refChild = Array.from(container.children).find(el =>
        el.classList.contains('etis-official-notice') ||
        el.classList.contains('electr-description') ||
        el.classList.contains('google-chart-wrapper') ||
        el.classList.contains('stats-link-bottom') ||
        el.tagName === 'P'
    );

    if (refChild) {
        container.insertBefore(emptyEl, refChild);
    } else {
        container.appendChild(emptyEl);
    }
}
