import { targetWindow } from './console-api';
import { ActiveTheme } from '../types/index.js';

export interface DeviceMeta {
    name: string;
    os: string;
    added: number;
    lastActive: number;
}

export interface SyncMeta {
    devices?: Record<string, DeviceMeta>;
    removed?: Record<string, number>;
    [key: string]: any;
}

export const mergeSyncMeta = (localMeta: SyncMeta, cloudMeta: SyncMeta): SyncMeta => {
    const localDevices = localMeta?.devices || {};
    const cloudDevices = cloudMeta?.devices || {};
    const localRemoved = localMeta?.removed || {};
    const cloudRemoved = cloudMeta?.removed || {};

    const mergedRemoved: Record<string, number> = { ...cloudRemoved };
    for (const [id, ts] of Object.entries(localRemoved)) {
        mergedRemoved[id] = Math.max(mergedRemoved[id] || 0, Number(ts) || 0);
    }

    const mergedDevices: Record<string, DeviceMeta> = {};
    const allIds = new Set([...Object.keys(cloudDevices), ...Object.keys(localDevices)]);

    for (const id of allIds) {
        const cDev = cloudDevices[id];
        const lDev = localDevices[id];
        let chosen: DeviceMeta;

        if (cDev && lDev) {
            const cTime = cDev.lastActive || cDev.added || 0;
            const lTime = lDev.lastActive || lDev.added || 0;
            const newer = lTime >= cTime ? lDev : cDev;
            chosen = {
                ...newer,
                added: Math.min(cDev.added || newer.added || Date.now(), lDev.added || newer.added || Date.now())
            };
        } else {
            chosen = (lDev || cDev)!;
        }

        const removedAt = mergedRemoved[id] || 0;
        const activeAt = chosen.lastActive || chosen.added || 0;
        if (removedAt > 0 && removedAt >= activeAt) {
            continue;
        }

        mergedDevices[id] = chosen;
    }

    return {
        ...cloudMeta,
        ...localMeta,
        devices: mergedDevices,
        removed: mergedRemoved
    };
};

export const registerCurrentDevice = (): SyncMeta => {
    let deviceId = localStorage.getItem('etis_device_id');
    if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('etis_device_id', deviceId);
    }

    let deviceName = localStorage.getItem('etis_device_name');
    if (!deviceName) {
        let os = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Смартфон' : 'ПК';
        let browser = navigator.userAgent.includes('Firefox') ? 'Firefox' : (navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari');
        deviceName = `${os} (${browser})`;
        localStorage.setItem('etis_device_name', deviceName);
    }

    let meta: SyncMeta = {};
    try {
        meta = JSON.parse(localStorage.getItem('etis_sync_meta') || '{}') || {};
    } catch (e) {
        meta = {};
    }
    if (!meta.devices) meta.devices = {};

    meta.devices[deviceId] = {
        name: deviceName,
        os: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' : (/Android/i.test(navigator.userAgent) ? 'Android' : (navigator.platform.includes('Mac') ? 'macOS' : 'Windows')),
        added: meta.devices[deviceId]?.added || Date.now(),
        lastActive: Date.now()
    };

    localStorage.setItem('etis_sync_meta', JSON.stringify(meta));
    return meta;
};

export function devicesBoot(): void {
    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('ЕТИС Reborn: демо-режим (вкл)', () => (targetWindow as any).etisDemo(true));
        GM_registerMenuCommand('ЕТИС Reborn: демо-режим (выкл)', () => (targetWindow as any).etisExitDemo());
        GM_registerMenuCommand('ЕТИС Reborn: тестовая ветка (вкл)', () => (targetWindow as any).devBeta(true));
        GM_registerMenuCommand('ЕТИС Reborn: тестовая ветка (выкл)', () => (targetWindow as any).devBeta(false));
    }
}