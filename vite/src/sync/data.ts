import { markLocalKeyDirty, triggerSilentCloudUpload } from './cloud';
import { ConsultationFile } from '../types';

// Сохраняет значение в localStorage, помечает ключ изменённым и запускает облачную выгрузку
export function saveSyncData(key: string, value: string): void {
    localStorage.setItem(key, value);
    markLocalKeyDirty(key);
    if (typeof triggerSilentCloudUpload === 'function') {
        triggerSilentCloudUpload();
    }
}

// Возвращает карту пользовательских переключателей синхронизации по категориям
export function getSyncToggles(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem('etis_sync_toggles');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

// Удаляет дубликаты файлов консультаций по идентификатору
export function deduplicateConsultations(files: ConsultationFile[]): ConsultationFile[] {
    if (!Array.isArray(files)) return [];
    const seen = new Set<string>();
    return files.filter(f => {
        if (!f || !f.id) return false;
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
    });
}