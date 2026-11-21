import { openDiaryModal } from '../modals/diary.js';
import { openSettingsModal } from '../modals/settings.js';
import { saveSyncData } from '../sync/data.js';
import { returnToDrawer } from '../ui/drawer.js';
import { uploadDataToCloud } from '../sync/cloud.ts';

// Белый список разрешённых типов уведомлений для колокольчика
const isAllowedNotification = (n) => {
    if (!n) return false;
    const title = n.title || '';
    const icon = n.icon || '';
    const targetUrl = n.targetUrl || '';

    // Оценки разрешены, но будут помечаться прочитанными
    if (title.includes('баллы') || title.includes('оценка') || title.includes('Сессия:') || title.includes('Обновление успеваемости') || (targetUrl && targetUrl.includes('stu.signs'))) {
        return true;
    }

    // 1. Обучение
    if (title.includes('Новый раздел') || n.id === 'notif_guide_onboarding' || targetUrl === '#guide') return true;

    // 2. Обновления версии скрипта
    if (title.includes('обновление') || title.includes('Обновление') || title.includes('Доступна бета-версия') || title.includes('Доступно обновление') || icon === 'system_update' || n.id?.startsWith('notif_update_') || targetUrl === '#settings') return true;

    // 3. Отключение синхронизации
    if (title.includes('Синхронизация отключена') || icon === 'cloud_off' || icon === 'lock_reset') return true;

    // 4. Напоминания о дедлайнах из дневника
    if (title.includes('Напоминание') || icon === 'alarm' || n.id?.startsWith('notif_diary_') || targetUrl === '#diary') return true;

    return false;
};

// Добавление уведомления в историю с дедупликацией и синхронизацией
export function addNotificationToHistory({ title, subject, body, type = 'info', icon = 'notifications', targetUrl = null, id = null }) {
    const isGrade = title.includes('баллы') || title.includes('оценка') || title.includes('Сессия:') || title.includes('Обновление успеваемости') || (targetUrl && targetUrl.includes('stu.signs'));

    // Генерируем фиксированный ID по содержимому
    const cleanContent = `${title}_${subject || ''}_${body || ''}`.replace(/[^a-zA-Z0-9а-яА-ЯёЁ_]/g, '_').substring(0, 45);
    const notifId = id || ('notif_' + cleanContent);

    let history = JSON.parse(localStorage.getItem('etis_notifications_history_v1') || '[]');
    history = history.filter(isAllowedNotification);

    // Если такое уведомление уже существует в истории:
    const existingIndex = history.findIndex(n => n.id === notifId);
    if (existingIndex !== -1) {
        // Если уже было прочитано — сохраняем прочитанным!
        history[existingIndex].timestamp = Date.now();
        history[existingIndex].body = body;
        saveSyncData('etis_notifications_history_v1', JSON.stringify(history));
        updateBellCounter();
        return history[existingIndex];
    }

    const newNotif = {
        id: notifId,
        title,
        subject,
        body,
        type,
        icon,
        timestamp: Date.now(),
        read: isGrade,
        targetUrl
    };

    if (!isAllowedNotification(newNotif)) return null;

    history.unshift(newNotif);
    if (history.length > 40) history = history.slice(0, 40);
    
    saveSyncData('etis_notifications_history_v1', JSON.stringify(history));
    updateBellCounter();
    return newNotif;
}

// Обновление счётчика непрочитанных уведомлений на иконке колокольчика
export function updateBellCounter() {
    let history = JSON.parse(localStorage.getItem('etis_notifications_history_v1') || '[]');
    history = history.filter(isAllowedNotification);
    localStorage.setItem('etis_notifications_history_v1', JSON.stringify(history));

    const unreadCount = history.filter(n => !n.read).length;
    document.querySelectorAll('.bell-counter-badge').forEach(badge => {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
            badge.classList.add('has-unread');
        } else {
            badge.textContent = '';
            badge.classList.remove('has-unread');
        }
    });
}

// Открытие модального окна центра уведомлений
export function openNotificationsModal() {
    let overlay = document.getElementById('etis-notifs-overlay');
    let modal = document.getElementById('etis-notifs-modal');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-notifs-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-notifs-modal';
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

    const renderList = () => {
        let history = JSON.parse(localStorage.getItem('etis_notifications_history_v1') || '[]');
        history = history.filter(isAllowedNotification);
        const unreadCount = history.filter(n => !n.read).length;

        modal.innerHTML = `
                    <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2.4rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span class="material-icons back-to-drawer-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">arrow_back</span>
                            <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">Уведомления</span>
                            ${unreadCount > 0 ? `<span style="background:var(--color-accent); color:#fff; font-size:1.1rem; font-weight:800; padding:2px 8px; border-radius:12px;">${unreadCount}</span>` : ''}
                        </div>
                        <span class="material-icons close-notifs-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                    </div>
                    <div class="ui-dialog-content" style="padding: 1.6rem 2.4rem 3rem 2.4rem; max-height: 70vh; overflow-y: auto;">
                        ${history.length === 0 ? `
                            <div style="text-align:center; padding: 4rem 1rem; color:var(--color-text-secondary); display:flex; flex-direction:column; align-items:center; gap:12px;">
                                <span class="material-icons" style="font-size: 48px; opacity: 0.35;">notifications_paused</span>
                                <div style="font-size: 1.6rem; font-weight: 700; color: var(--color-text-primary);">Уведомлений пока нет</div>
                                <div style="font-size: 1.3rem; max-width: 320px; line-height: 1.5;">Здесь будут сохраняться изменения ваших оценок, напоминания и оповещения.</div>
                            </div>
                        ` : `
                            <div style="display:flex; flex-direction:column; gap:1rem;">
                                ${history.map((n, idx) => {
                            const timeStr = new Date(n.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                            const isUnread = !n.read;
                            let iconColor = 'var(--color-accent)';
                            let iconBg = 'var(--color-accent-active)';
                            if (n.type === 'success') { iconColor = 'var(--color-green)'; iconBg = 'rgba(52, 199, 89, 0.15)'; }
                            else if (n.type === 'warning') { iconColor = 'var(--color-warning)'; iconBg = 'rgba(255, 149, 0, 0.15)'; }

                            const cardBorder = isUnread ? '1.5px solid var(--color-accent)' : '1px solid var(--color-table-border)';
                            const cardOpacity = isUnread ? '1' : '0.55';

                            return `
                                        <div class="notif-history-item" data-idx="${idx}" style="background:var(--color-card); border:${cardBorder}; border-radius:var(--radius-large); padding:1.4rem 1.6rem; display:flex; gap:1.4rem; align-items:flex-start; cursor:${n.targetUrl ? 'pointer' : 'default'}; transition:all 0.2s; position:relative; box-shadow:var(--shadow-main); opacity:${cardOpacity};">
                                            <div style="width:40px; height:40px; border-radius:12px; background:${iconBg}; color:${iconColor}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                                <span class="material-icons" style="font-size:22px;">${n.icon || 'notifications'}</span>
                                            </div>
                                            <div style="flex:1; min-width:0; text-align:left;">
                                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
                                                    <span style="font-size:1.15rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:${iconColor};">${n.title}</span>
                                                    <span style="font-size:1.1rem; color:var(--color-text-secondary); white-space:nowrap;">${timeStr}</span>
                                                </div>
                                                ${n.subject ? `<div style="font-size:1.4rem; font-weight:700; color:var(--color-text-primary); margin-bottom:2px; line-height:1.3;">${n.subject}</div>` : ''}
                                                <div style="font-size:1.25rem; color:var(--color-text-secondary); line-height:1.4;">${n.body}</div>
                                            </div>
                                        </div>
                                    `;
                        }).join('')}
                            </div>
                        `}
                    </div>
                `;

        modal.querySelector('.close-notifs-btn').onclick = closeAll;

        modal.querySelectorAll('.notif-history-item').forEach(item => {
            item.onclick = () => {
                const idx = parseInt(item.getAttribute('data-idx'), 10);
                let hist = JSON.parse(localStorage.getItem('etis_notifications_history_v1') || '[]');
                if (hist[idx]) {
                    const targetUrl = hist[idx].targetUrl;
                    closeAll();
                    if (targetUrl === '#guide') {
                        localStorage.setItem('etis_guide_viewed_v1', 'true');
                        closeAll();
                        if (typeof openSettingsModal === 'function') openSettingsModal('guide');
                    } else if (targetUrl === '#settings') {
                        if (typeof openSettingsModal === 'function') openSettingsModal('version');
                    } else if (targetUrl === '#diary') {
                        closeAll();
                        if (typeof openDiaryModal === 'function') openDiaryModal('deadlines');
                    } else if (targetUrl) {
                        if (window.location.href.includes(targetUrl)) {
                            window.location.reload();
                        } else {
                            window.location.href = targetUrl;
                        }
                    }
                }
            };
        });

        const backToDrawerBtn = modal.querySelector('.back-to-drawer-btn');
        if (backToDrawerBtn) {
            backToDrawerBtn.onclick = () => returnToDrawer(modal, overlay);
        }

        // Все уведомления помечаются прочитанными сразу при открытии окна
        if (unreadCount > 0) {
            history.forEach(n => n.read = true);
            saveSyncData('etis_notifications_history_v1', JSON.stringify(history));
            updateBellCounter();
        }
    };

    renderList();
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.classList.add('modal-open-body');
    document.querySelector('.mobile-nav-dock')?.classList.add('dock-hidden');
}
