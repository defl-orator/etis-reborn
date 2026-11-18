import { triggerUpdateIndicators } from '../features/update-ui';
import { refreshModalUI } from '../modals/bug-report';
import { generalConfig } from './config';

export const RELEASE_URL = 'https://raw.githubusercontent.com/defl-orator/etis-reborn/main/etis.user.js';
export const BETA_URL = 'https://raw.githubusercontent.com/defl-orator/etis-reborn/beta/etis.user.js';

export interface UpdateState {
    status: 'idle' | 'loading' | 'error' | 'done';
    hasUpdate: boolean;
    remoteVer: string;
    remoteLog: string;
    isBeta: boolean;
    updateUrl: string;
    details: string;
}

export const updateState: UpdateState = {
    status: 'idle',
    hasUpdate: false,
    remoteVer: '',
    remoteLog: '',
    isBeta: false,
    updateUrl: RELEASE_URL,
    details: ''
};

export function initAutoUpdateCheck(forceRelease = false): void {
    if (typeof GM_xmlhttpRequest === 'undefined') return;

    const isBeta = !forceRelease && generalConfig.betaUpdates === true;
    const url = isBeta ? BETA_URL : RELEASE_URL;
    updateState.status = 'loading';
    updateState.isBeta = isBeta;
    updateState.updateUrl = url;

    if (typeof refreshModalUI === 'function') refreshModalUI();

    GM_xmlhttpRequest({
        method: 'GET',
        url: `${url}?t=${Date.now()}`,
        timeout: 10000,
        onload: function(res: any) {
            if (res.status === 404 && isBeta) {
                updateState.isBeta = false;
                updateState.updateUrl = RELEASE_URL;
                initAutoUpdateCheck(true);
                return;
            }

            if (res.status === 200) {
                const text = res.responseText;
                const verMatch = text.match(/@version\s+([\d\.]+)/);
                const logMatch = text.match(/@changelog\s+(.*)/);

                if (verMatch) {
                    const remoteVer = verMatch[1].trim();
                    const currentVer = typeof GM_info !== 'undefined' ? GM_info.script.version : '3.02';

                    updateState.remoteVer = remoteVer;
                    updateState.remoteLog = logMatch ? logMatch[1].trim() : '';
                    updateState.status = 'done';

                    if (isNewerVersion(remoteVer, currentVer)) {
                        updateState.hasUpdate = true;
                        triggerUpdateIndicators();
                    } else {
                        updateState.hasUpdate = false;
                    }
                } else {
                    updateState.status = 'error';
                    updateState.details = 'Не удалось прочитать версию';
                }
            } else {
                updateState.status = 'error';
                updateState.details = `Статус ${res.status}`;
            }
            if (typeof refreshModalUI === 'function') refreshModalUI();
        },
        onerror: function() {
            updateState.status = 'error';
            updateState.details = 'Ошибка сети';
            if (typeof refreshModalUI === 'function') refreshModalUI();
        },
        ontimeout: function() {
            updateState.status = 'error';
            updateState.details = 'Превышено время ожидания';
            if (typeof refreshModalUI === 'function') refreshModalUI();
        }
    });
}

function isNewerVersion(remote: string, current: string): boolean {
    const rParts = remote.split('.').map(Number);
    const cParts = current.split('.').map(Number);
    for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
        const r = rParts[i] || 0;
        const c = cParts[i] || 0;
        if (r > c) return true;
        if (r < c) return false;
    }
    return false;
}