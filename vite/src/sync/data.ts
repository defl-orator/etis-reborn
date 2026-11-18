import { markLocalKeyDirty, triggerSilentCloudUpload } from './cloud';
import { ConsultationFile } from '../types';

export function saveSyncData(key: string, value: string): void {
    localStorage.setItem(key, value);
    markLocalKeyDirty(key);
    if (typeof triggerSilentCloudUpload === 'function') {
        triggerSilentCloudUpload();
    }
}

export function getSyncToggles(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem('etis_sync_toggles');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

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