import { GeneralConfig } from '../types';
import { saveSyncData } from '../sync/data';

const DEFAULT_CONFIG: GeneralConfig = {
    dimPastPairs: true,
    shortAudFormat: true,
    hideDaysOff: false,
    mergeDaysOff: true,
    showSunday: false,
    absoluteScores: false,
    compactGrades: false,
    gradeNotifications: true,
    watermark: true,
    datesLeft: false,
    generateQR: true,
    showGaps: true,
    showGapsCustom: true,
    showBigBreak: true,
    smartSidebar: true,
    quickLoginEnabled: false,
    betaFeaturesEnabled: false,
    betaFeatures: {
        aiSummary: false
    },
    compactGradesConfig: {
        showWorkType: true,
        showControlType: true,
        showPassScore: true,
        showRating: true,
        showDate: true,
        showTeacher: true
    },
    betaUpdates: false
};

export let generalConfig: GeneralConfig = { ...DEFAULT_CONFIG };

export function loadGeneralConfig(): void {
    try {
        const saved = localStorage.getItem('etis_general_config');
        if (saved) {
            const parsed = JSON.parse(saved);
            generalConfig = {
                ...DEFAULT_CONFIG,
                ...parsed,
                betaFeatures: { ...DEFAULT_CONFIG.betaFeatures, ...(parsed.betaFeatures || {}) },
                compactGradesConfig: { ...DEFAULT_CONFIG.compactGradesConfig, ...(parsed.compactGradesConfig || {}) }
            };
        }
    } catch (e) {
        generalConfig = { ...DEFAULT_CONFIG };
    }
}

export function saveGeneralConfig(): void {
    saveSyncData('etis_general_config', JSON.stringify(generalConfig));
}

export function configBoot(): void {
    loadGeneralConfig();
    if (generalConfig.smartSidebar) {
        document.documentElement.classList.add('smart-sidebar-enabled');
    }
}