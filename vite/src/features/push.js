import { addNotificationToHistory } from './notifications.js';

// Корневой контейнер для всплывающих push-уведомлений
let pushContainer = document.getElementById('etis-push-container');

// Инициализация контейнера для push-уведомлений в DOM
export function setupPushContainer() {
    if (!pushContainer) {
        pushContainer = document.createElement('div');
        pushContainer.id = 'etis-push-container';
        pushContainer.className = 'push-container';
        document.body.appendChild(pushContainer);
    }
}

// Отображение всплывающего push-уведомления с опциональным сохранением в историю
export const showPush = (title, subject, body, type = 'info', icon = 'notifications', onClick = null, targetUrl = null, saveToHistory = true) => {
    if (saveToHistory && title !== 'Напоминание создано' && icon !== 'alarm_on') {
        try {
            addNotificationToHistory({ title, subject, body, type, icon, targetUrl });
        } catch (e) {}
    }

    let container = document.getElementById('etis-push-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'etis-push-container';
        container.className = 'push-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `push-toast ${type}`;
    toast.innerHTML = `
                    <div class="push-icon-wrap">
                        <span class="material-icons">${icon}</span>
                    </div>
                    <div class="push-content">
                        <div class="push-toast-title">${title}</div>
                        <div class="push-subject">${subject}</div>
                        <div class="push-detail">${body}</div>
                    </div>
                `;

    toast.onclick = (e) => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
        if (typeof onClick === 'function') {
            onClick(e);
        } else if (targetUrl) {
            window.location.href = targetUrl;
        }
    };

    container.appendChild(toast);
    requestAnimationFrame(() => setTimeout(() => toast.classList.add('show'), 50));
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }
    }, 8000);
};

// Экспорт функции показа push-уведомлений в глобальную область
export function exposePush() {
    window.showEtisPush = showPush;
}
