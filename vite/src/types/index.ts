export type ThemeMode = 'system' | 'schedule' | 'none';
export type DarkVariant = 'dark' | 'night';
export type ActiveTheme = 'light' | 'dark' | 'night';

export interface AccentConfig {
    isGradient?: boolean;
    isThreeColors?: boolean;
    colors: string[];
    isGlass?: boolean;
    isColoredGlass?: boolean;
    separateThemes?: boolean;
    light?: {
        isGradient: boolean;
        isThreeColors: boolean;
        colors: string[];
    };
    dark?: {
        isGradient: boolean;
        isThreeColors: boolean;
        colors: string[];
    };
}

export interface CompactGradesConfig {
    showWorkType: boolean;
    showControlType: boolean;
    showPassScore: boolean;
    showRating: boolean;
    showDate: boolean;
    showTeacher: boolean;
}

export interface GeneralConfig {
    dimPastPairs: boolean;
    shortAudFormat: boolean;
    hideDaysOff: boolean;
    mergeDaysOff: boolean;
    showSunday: boolean;
    absoluteScores: boolean;
    compactGrades: boolean;
    gradeNotifications: boolean;
    timetableNotifications: boolean;
    watermark: boolean;
    datesLeft: boolean;
    generateQR: boolean;
    showGaps: boolean;
    showGapsCustom: boolean;
    showBigBreak: boolean;
    liveTimer: boolean;
    smartSidebar: boolean;
    quickLoginEnabled: boolean;
    betaFeaturesEnabled: boolean;
    betaFeatures: {
        aiSummary?: boolean;
        [key: string]: boolean | undefined;
    };
    compactGradesConfig?: CompactGradesConfig;
    betaUpdates?: boolean;
}

export interface CustomPair {
    id: string;
    addedWeek: number;
    dayName: string;
    subject: string;
    startTime: string;
    endTime: string;
    type: string;
    recurrence: 'once' | 'every' | 'biweekly';
    aud?: string;
    teacher?: string;
    msgHash?: string;
    notes?: string;
}

export interface DiaryTask {
    id: string;
    pairId: string | null;
    subject: string;
    title: string;
    details?: string;
    deadlineDate: string | null;
    deadlineTime: string | null;
    week: number | null;
    dayName: string | null;
    completed: boolean;
    completedAt: number | null;
    reminderMinutes?: number | null;
    reminderTriggered?: boolean;
    isFloatingNext?: boolean;
}

export interface ExternalCalendar {
    url: string;
    color: string;
}

export interface ConsultationEvent {
    dayName: string;
    startTime: string;
    endTime: string;
    weekType: 'all' | 'even' | 'odd';
    aud: string;
    link: string;
}

export interface ConsultationTeacher {
    name: string;
    degree?: string;
    email?: string;
    notes?: string;
    isActive: boolean;
    events: ConsultationEvent[];
}

export interface ConsultationFile {
    id: string;
    title: string;
    isActive: boolean;
    sourceUrl: string | null;
    teachers: ConsultationTeacher[];
}