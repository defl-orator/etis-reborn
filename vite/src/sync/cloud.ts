import { EtisCrypto, FIREBASE_DB_URL, safeParseJSON } from './crypto';
import { isDemoUser } from '../core/demo-mode';
import { mergeSyncMeta, registerCurrentDevice, SyncMeta } from '../core/devices';
import { loadGeneralConfig } from '../core/config';
import { applyAccentColor } from '../core/accent';
import { applyCurrentTheme } from '../core/theme-engine';

// Ключ очереди локальных изменений и интервалы фонового heartbeat синхронизации
const DIRTY_KEYS_STORAGE = 'etis_sync_dirty_v1';
const HEARTBEAT_STALE_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 120_000;

// Возвращает имя ключа для хранения мастер-ключа синхронизации
export function mkName(): string {
    return 'etis_sync_master_key_v2';
}

// Читает мастер-ключ синхронизации из GM-хранилища или localStorage
export function getMasterKey(): string {
    if (typeof GM_getValue !== 'undefined') {
        const key = GM_getValue(mkName(), '');
        if (key) return key;
    }
    return localStorage.getItem(mkName()) || '';
}

// Сохраняет мастер-ключ синхронизации в GM-хранилище и localStorage
export function setMasterKey(key: string): void {
    if (typeof GM_setValue !== 'undefined') {
        GM_setValue(mkName(), key);
    }
    localStorage.setItem(mkName(), key);
}

// Удаляет мастер-ключ синхронизации из всех хранилищ
export function clearMasterKey(): void {
    if (typeof GM_setValue !== 'undefined') {
        GM_setValue(mkName(), '');
    }
    localStorage.removeItem(mkName());
}

// Возвращает существующий мастер-ключ или автоматически генерирует новый
export async function getAutomaticSyncCode(): Promise<string> {
    let key = getMasterKey();
    if (!key) {
        key = EtisCrypto.generateMasterKey();
        setMasterKey(key);
    }
    return key;
}

// Соответствие полей облачного хранилища ключам localStorage и список обязательных полей
const SYNC_KEYS_MAP: Record<string, string> = {
    sync_meta: 'etis_sync_meta',
    custom_pairs: 'etis_custom_pairs_v1',
    subject_notes: 'etis_subject_notes_v2',
    diary_tasks: 'etis_diary_tasks_v1',
    grades_snapshot: 'etis_reborn_grades_snapshot_v3',
    consultation_files: 'etis_consultation_files_v1',
    weekly_pairs_history: 'etis_weekly_pairs_history_v1',
    accent_config: 'etis_accent_config',
    theme: 'theme',
    theme_mode: 'etis_theme_mode',
    theme_dark_variant: 'etis_theme_dark_variant',
    theme_schedule_start: 'etis_theme_schedule_start',
    theme_schedule_end: 'etis_theme_schedule_end',
    general_config: 'etis_general_config',
    external_cals: 'etis_external_cals_v2',
    ext_overrides: 'etis_ext_overrides',
    important_pairs: 'etis_important_pairs_v1',
    diploma_gpa: 'etis_diploma_gpa',
    notifications_history: 'etis_notifications_history_v1',
    time_spent: 'etis_reborn_time_spent',
    custom_achievements_order: 'etis_custom_achievements_order_v1',
    recent_search_items: 'etis_recent_search_items_v1'
};

const LOCAL_TO_CLOUD_KEY: Record<string, string> = Object.fromEntries(
    Object.entries(SYNC_KEYS_MAP).map(([cloudField, localKey]) => [localKey, cloudField])
);

const ALWAYS_SYNCED_FIELDS = new Set([
    'sync_meta',
    'diploma_gpa',
    'notifications_history',
    'time_spent',
    'custom_achievements_order',
    'recent_search_items'
]);

// Возвращает карту несинхронизированных локальных ключей с временем изменения
function getDirtyMap(): Record<string, number> {
    return safeParseJSON<Record<string, number>>(localStorage.getItem(DIRTY_KEYS_STORAGE), {});
}

// Сохраняет или очищает карту несинхронизированных локальных ключей
function setDirtyMap(map: Record<string, number>): void {
    if (Object.keys(map).length === 0) {
        localStorage.removeItem(DIRTY_KEYS_STORAGE);
    } else {
        localStorage.setItem(DIRTY_KEYS_STORAGE, JSON.stringify(map));
    }
}

// Помечает локальный ключ как изменённый для приоритетной отправки в облако
export function markLocalKeyDirty(localKey: string): void {
    const cloudField = LOCAL_TO_CLOUD_KEY[localKey];
    if (!cloudField) return;
    const map = getDirtyMap();
    map[cloudField] = Date.now();
    setDirtyMap(map);
}

// Проверяет, включена ли синхронизация для указанного облачного поля
function isSyncFieldEnabled(cloudField: string): boolean {
    if (ALWAYS_SYNCED_FIELDS.has(cloudField)) return true;
    const toggles = safeParseJSON<Record<string, boolean>>(localStorage.getItem('etis_sync_toggles'), {});
    if (cloudField === 'important_pairs') {
        return toggles['subject_notes'] !== false;
    }
    if (cloudField === 'ext_overrides') {
        return toggles['external_cals'] !== false;
    }
    if (cloudField === 'theme' || cloudField === 'theme_mode' || cloudField === 'theme_dark_variant' || cloudField === 'theme_schedule_start' || cloudField === 'theme_schedule_end') {
        return toggles['accent_config'] !== false;
    }
    return toggles[cloudField] !== false;
}

// Последовательная очередь операций синхронизации для исключения гонок
let syncQueue: Promise<any> = Promise.resolve();

// Добавляет задачу синхронизации в последовательную очередь
function enqueueSync<T>(task: () => Promise<T>): Promise<T> {
    const next = syncQueue.then(task, task);
    syncQueue = next.catch(() => {});
    return next;
}

// Загружает зашифрованное хранилище пользователя из Firebase
function fetchCloudVault(vaultId: string): Promise<Record<string, any> | null> {
    return new Promise((resolve) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `${FIREBASE_DB_URL}sync/${vaultId}.json?t=${Date.now()}`,
            timeout: 15000,
            onload: (res: any) => {
                if (res.status === 200 && res.responseText) {
                    const parsed = safeParseJSON<Record<string, any> | null>(res.responseText, null);
                    resolve(parsed);
                } else {
                    resolve(null);
                }
            },
            onerror: () => resolve(null),
            ontimeout: () => resolve(null)
        });
    });
}

// Отправляет зашифрованный снимок данных в Firebase
function putCloudVault(vaultId: string, payload: Record<string, any>): Promise<boolean> {
    return new Promise((resolve) => {
        GM_xmlhttpRequest({
            method: 'PUT',
            url: `${FIREBASE_DB_URL}sync/${vaultId}.json`,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(payload),
            timeout: 15000,
            onload: (res: any) => {
                if (res.status !== 200) {
                    console.warn('[ETIS Sync] Cloud upload failed:', res.status, res.responseText);
                }
                resolve(res.status === 200);
            },
            onerror: () => resolve(false),
            ontimeout: () => resolve(false)
        });
    });
}

// Объединяет локальную и облачную историю уведомлений с сохранением статуса прочтения
function mergeNotificationsHistory(localJson: string | null, cloudJson: string): string {
    const localList = safeParseJSON<any[]>(localJson, []);
    const cloudList = safeParseJSON<any[]>(cloudJson, []);
    const localMap = new Map(localList.map(item => [item.id, item]));

    const merged: any[] = [];
    const seen = new Set<string>();

    for (const cItem of cloudList) {
        if (!cItem || !cItem.id) continue;
        const lItem = localMap.get(cItem.id);
        const isRead = Boolean(cItem.read || (lItem && lItem.read));
        merged.push({ ...cItem, read: isRead });
        seen.add(cItem.id);
    }

    for (const lItem of localList) {
        if (!lItem || !lItem.id || seen.has(lItem.id)) continue;
        merged.push(lItem);
        seen.add(lItem.id);
    }

    merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return JSON.stringify(merged.slice(0, 40));
}

// Обновляет счётчики непрочитанных уведомлений в интерфейсе
function updateNotificationBadges(mergedJson: string): void {
    const merged = safeParseJSON<any[]>(mergedJson, []);
    const badgeCount = merged.filter(n => !n.read).length;
    document.querySelectorAll('.bell-counter-badge').forEach((b: any) => {
        if (badgeCount > 0) {
            b.textContent = badgeCount > 99 ? '99+' : badgeCount.toString();
            b.classList.add('has-unread');
        } else {
            b.textContent = '';
            b.classList.remove('has-unread');
        }
    });
}

// Применяет загруженные из облака настройки и перерисовывает активное расписание
function applySyncedRuntimeUpdates(): void {
    try {
        loadGeneralConfig();
        applyCurrentTheme(true);
        applyAccentColor();
    } catch (e) {}

    try {
        const win = window as any;
        if ((window.location.href.includes('timetable') || document.querySelector('.timetable-grid')) && document.body) {
            document.querySelectorAll('.custom-pair-row').forEach(el => el.remove());
            if (typeof win.injectCustomPairs === 'function') win.injectCustomPairs();
            if (typeof win.injectConsultationPairs === 'function') win.injectConsultationPairs();
            if (typeof win.loadExternalCalendar === 'function') win.loadExternalCalendar();
            if (typeof win.renderNotes === 'function') win.renderNotes();
            if (typeof win.recalculateTimetable === 'function') win.recalculateTimetable();
        }
    } catch (e) {}

    try {
        window.dispatchEvent(new CustomEvent('etis:cloud-synced'));
    } catch (e) {}
}

// Шифрует и выгружает локальные данные в облачное хранилище
export function uploadDataToCloud(skipPreDownload = false): Promise<boolean> {
    const masterKey = getMasterKey();
    if (!masterKey || isDemoUser()) return Promise.resolve(false);

    return enqueueSync(async () => {
        try {
            const uploadStartTime = Date.now();
            const dirtyMap = getDirtyMap();
            const vaultId = await EtisCrypto.getCloudVaultId(masterKey);
            const writeToken = await EtisCrypto.getWriteToken(masterKey);

            const cloudPlainMap: Record<string, string> = {};
            if (!skipPreDownload) {
                const rawData = await fetchCloudVault(vaultId);
                if (rawData && rawData.vaultSalt) {
                    const oldSaltBytes = Uint8Array.from(atob(rawData.vaultSalt), c => c.charCodeAt(0));
                    const oldAesKey = await EtisCrypto.deriveAesKey(masterKey, oldSaltBytes);
                    for (const cloudField of Object.keys(SYNC_KEYS_MAP)) {
                        const encVal = rawData[cloudField];
                        if (encVal && typeof encVal === 'string') {
                            try {
                                cloudPlainMap[cloudField] = await EtisCrypto.decryptWithKey(encVal, oldAesKey);
                            } catch (err) {}
                        }
                    }
                }
            }

            const dynamicSaltBytes = crypto.getRandomValues(new Uint8Array(16));
            const vaultSaltBase64 = btoa(String.fromCharCode.apply(null, Array.from(dynamicSaltBytes)));
            const newAesKey = await EtisCrypto.deriveAesKey(masterKey, dynamicSaltBytes);

            const payload: Record<string, any> = {
                vaultSalt: vaultSaltBase64,
                writeToken: writeToken
            };

            for (const [cloudField, localKey] of Object.entries(SYNC_KEYS_MAP)) {
                if (!isSyncFieldEnabled(cloudField)) {
                    if (cloudPlainMap[cloudField] !== undefined) {
                        payload[cloudField] = await EtisCrypto.encryptWithKey(cloudPlainMap[cloudField], newAesKey);
                    }
                    continue;
                }

                let valToUpload = localStorage.getItem(localKey);
                const isFieldDirty = Boolean(dirtyMap[cloudField]);

                if (localKey === 'etis_sync_meta' && !skipPreDownload && cloudPlainMap[cloudField]) {
                    const localMeta = safeParseJSON<SyncMeta>(valToUpload, {});
                    const cloudMeta = safeParseJSON<SyncMeta>(cloudPlainMap[cloudField], {});
                    const merged = mergeSyncMeta(localMeta, cloudMeta);
                    valToUpload = JSON.stringify(merged);
                    localStorage.setItem(localKey, valToUpload);
                } else if (localKey === 'etis_notifications_history_v1' && !skipPreDownload && cloudPlainMap[cloudField]) {
                    valToUpload = mergeNotificationsHistory(valToUpload, cloudPlainMap[cloudField]);
                    localStorage.setItem(localKey, valToUpload);
                } else if (valToUpload === null && !isFieldDirty && !skipPreDownload && cloudPlainMap[cloudField] !== undefined) {
                    valToUpload = cloudPlainMap[cloudField];
                }

                if (valToUpload !== null) {
                    payload[cloudField] = await EtisCrypto.encryptWithKey(valToUpload, newAesKey);
                }
            }

            const ok = await putCloudVault(vaultId, payload);
            if (ok) {
                localStorage.setItem('etis_last_sync_time', Date.now().toString());
                const currentDirty = getDirtyMap();
                for (const [field, ts] of Object.entries(currentDirty)) {
                    if (ts <= uploadStartTime) {
                        delete currentDirty[field];
                    }
                }
                setDirtyMap(currentDirty);
            }
            return ok;
        } catch (e) {
            return false;
        }
    });
}

// Скачивает, расшифровывает и применяет данные из облачного хранилища
export function downloadDataFromCloud(customKey?: string): Promise<boolean> {
    const masterKey = customKey || getMasterKey();
    if (!masterKey || isDemoUser()) return Promise.resolve(false);

    return enqueueSync(async () => {
        try {
            const vaultId = await EtisCrypto.getCloudVaultId(masterKey);
            const rawData = await fetchCloudVault(vaultId);
            if (!rawData || !rawData.vaultSalt) return false;

            const saltBytes = Uint8Array.from(atob(rawData.vaultSalt), c => c.charCodeAt(0));
            const aesKey = await EtisCrypto.deriveAesKey(masterKey, saltBytes);
            const dirtyMap = getDirtyMap();

            let shouldPushHeartbeat = !rawData.sync_meta;
            let hasDirtyFields = Object.keys(dirtyMap).length > 0;

            for (const [cloudField, localKey] of Object.entries(SYNC_KEYS_MAP)) {
                if (!isSyncFieldEnabled(cloudField)) continue;

                const encVal = rawData[cloudField];
                if (encVal && typeof encVal === 'string') {
                    try {
                        const decrypted = await EtisCrypto.decryptWithKey(encVal, aesKey);

                        if (localKey === 'etis_sync_meta') {
                            const localMeta = safeParseJSON<SyncMeta>(localStorage.getItem(localKey), {});
                            const cloudMeta = safeParseJSON<SyncMeta>(decrypted, {});
                            const deviceId = localStorage.getItem('etis_device_id');
                            const cloudDev = deviceId ? cloudMeta.devices?.[deviceId] : undefined;
                            if (deviceId && (!cloudDev || Date.now() - (cloudDev.lastActive || 0) > HEARTBEAT_STALE_MS)) {
                                shouldPushHeartbeat = true;
                            }
                            const merged = mergeSyncMeta(localMeta, cloudMeta);
                            localStorage.setItem(localKey, JSON.stringify(merged));
                        } else if (dirtyMap[cloudField]) {
                            hasDirtyFields = true;
                        } else if (localKey === 'etis_notifications_history_v1') {
                            const mergedJson = mergeNotificationsHistory(localStorage.getItem(localKey), decrypted);
                            localStorage.setItem(localKey, mergedJson);
                            updateNotificationBadges(mergedJson);
                        } else {
                            localStorage.setItem(localKey, decrypted);
                        }
                    } catch (err) {}
                }
            }

            localStorage.setItem('etis_last_sync_time', Date.now().toString());
            applySyncedRuntimeUpdates();

            if ((shouldPushHeartbeat || hasDirtyFields) && !customKey) {
                registerCurrentDevice();
                triggerSilentCloudUpload();
            }

            return true;
        } catch (e) {
            return false;
        }
    });
}

// Таймер отложенной фоновой выгрузки в облако
let uploadTimer: any = null;

// Запускает отложенную тихую выгрузку изменений в облако (debounce 500 мс)
export function triggerSilentCloudUpload(): void {
    if (uploadTimer) clearTimeout(uploadTimer);
    uploadTimer = setTimeout(() => {
        uploadDataToCloud();
    }, 500);
}

// Флаг однократной инициализации фонового heartbeat синхронизации
let heartbeatInitialized = false;

// Инициализирует облачную синхронизацию и периодический heartbeat при старте
export function cloudBoot(): void {
    const key = getMasterKey();
    if (key && !isDemoUser()) {
        registerCurrentDevice();
        downloadDataFromCloud();
    }

    if (!heartbeatInitialized) {
        heartbeatInitialized = true;
        const runHeartbeat = () => {
            const activeKey = getMasterKey();
            if (!activeKey || isDemoUser()) return;
            if (document.visibilityState !== 'visible') return;
            const lastSync = parseInt(localStorage.getItem('etis_last_sync_time') || '0', 10);
            if (Date.now() - lastSync >= HEARTBEAT_STALE_MS) {
                registerCurrentDevice();
                downloadDataFromCloud();
            }
        };

        document.addEventListener('visibilitychange', runHeartbeat);
        window.setInterval(runHeartbeat, HEARTBEAT_INTERVAL_MS);
    }
}
