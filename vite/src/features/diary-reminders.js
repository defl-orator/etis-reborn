import { addNotificationToHistory } from './notifications.js';
import { openDiaryModal } from '../modals/diary.js';
import { saveSyncData } from '../sync/data.js';

// Проверка наступления напоминаний по активным дедлайнам дневника
export function checkDiaryReminders() {
    const tasks = JSON.parse(localStorage.getItem('etis_diary_tasks_v1') || '[]');
    if (tasks.length === 0) return;

    const now = Date.now();
    let changed = false;

    tasks.forEach(t => {
        if (t.completed || !t.reminderMinutes || t.reminderTriggered || !t.deadlineDate) return;

        const target = new Date(`${t.deadlineDate}T${t.deadlineTime || '23:59'}:00`).getTime();
        const remindAt = target - (t.reminderMinutes * 60 * 1000);

        // Срабатывает, когда наступило время напоминания, но дедлайн еще не прошел более чем на час
        if (now >= remindAt && now < target + 3600000) {
            t.reminderTriggered = true;
            changed = true;

            const notifId = 'notif_diary_' + t.id + '_' + t.reminderMinutes;

            addNotificationToHistory({
                id: notifId,
                title: 'Напоминание о дедлайне',
                subject: t.title,
                body: `${t.subject} • Срок: ${t.deadlineDate} в ${t.deadlineTime || '23:59'}`,
                type: 'warning',
                icon: 'alarm',
                targetUrl: '#diary'
            });

            if (window.showEtisPush) {
                window.showEtisPush(
                    'Напоминание о дедлайне',
                    t.title,
                    `${t.subject} • Срок: ${t.deadlineDate} в ${t.deadlineTime || '23:59'}`,
                    'warning',
                    'alarm',
                    () => { if (typeof openDiaryModal === 'function') openDiaryModal('deadlines'); },
                    '#diary',
                    false
                );
            }
        }
    });

    if (changed) {
        saveSyncData('etis_diary_tasks_v1', JSON.stringify(tasks));
    }
}
