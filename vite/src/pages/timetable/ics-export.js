// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ICS И НАПОМИНАНИЙ ---

// 1. Определение точной даты и времени пары
export function getPairDateTime(dayDateStr, timeStr) {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    if (dayDateStr && dayDateStr !== 'UnknownDate') {
        const monthsMap = {
            'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
            'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
            'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };
        const textMatch = dayDateStr.match(/(\d{1,2})\s+([а-яА-Я]+)(?:\s+(\d{4}))?/i);
        const numMatch = dayDateStr.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/);

        if (textMatch) {
            day = parseInt(textMatch[1], 10);
            if (monthsMap[textMatch[2].toLowerCase()] !== undefined) {
                month = monthsMap[textMatch[2].toLowerCase()];
            }
            if (textMatch[3]) year = parseInt(textMatch[3], 10);
        } else if (numMatch) {
            day = parseInt(numMatch[1], 10);
            month = parseInt(numMatch[2], 10) - 1;
            if (numMatch[3]) {
                year = numMatch[3].length === 2 ? 2000 + parseInt(numMatch[3], 10) : parseInt(numMatch[3], 10);
            }
        }
    }

    let startH = 8, startM = 0;
    if (timeStr) {
        const tMatch = timeStr.match(/(\d{1,2})[:.](\d{2})/);
        if (tMatch) {
            startH = parseInt(tMatch[1], 10);
            startM = parseInt(tMatch[2], 10);
        }
    }

    const startDate = new Date(year, month, day, startH, startM, 0);
    const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // Стандартная пара 1.5 часа

    return { startDate, endDate };
}

// 2. Форматирование даты в стандарт iCalendar
function formatDateToICS(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// Функция правильного экранирования текста для iCalendar (RFC 5545)
function escapeICalText(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

// 3. Сборка тела ICS-файла
export function generatePairICS({ title, location, teacher, description, startDate, endDate, alarmMinutes }) {
    const dtStamp = formatDateToICS(new Date()) + 'Z';
    const dtStart = formatDateToICS(startDate);
    const dtEnd = formatDateToICS(endDate);
    const uid = `etis_pair_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@student.psu.ru`;

    let alarmBlock = '';
    if (alarmMinutes !== null && alarmMinutes !== undefined) {
        const trigger = alarmMinutes === 0 ? 'PT0M' : `-PT${alarmMinutes}M`;
        alarmBlock = [
            'BEGIN:VALARM',
            `TRIGGER:${trigger}`,
            'ACTION:DISPLAY',
            `DESCRIPTION:Напоминание: ${escapeICalText(title)}`,
            'END:VALARM'
        ].join('\r\n') + '\r\n';
    }

    const cleanTitle = escapeICalText(title || 'Пара');
    const cleanLoc = escapeICalText(location || '');
    const cleanDesc = escapeICalText(description || '');
    const cleanTeacher = escapeICalText(teacher || '');

    // Отдельная строка контакта/преподавателя для Apple и других календарей
    let organizerLine = '';
    if (cleanTeacher) {
        organizerLine = `ORGANIZER;CN=${cleanTeacher}:mailto:noreply@psu.ru`;
    }

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ETIS REBORN//Pair Reminder//RU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${cleanTitle}`,
        cleanLoc ? `LOCATION:${cleanLoc}` : '',
        organizerLine,
        cleanDesc ? `DESCRIPTION:${cleanDesc}` : '',
        alarmBlock ? alarmBlock.trim() : '',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
}

// 4. Скачивание / открытие файла пользователем
export function downloadICSFile(filename, content) {
    const safeFilename = (filename || 'Пара.ics').replace(/[\\/:*?"<>|]/g, '_');
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // На iOS сразу откроется шторка «Добавить событие»
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// 5. Прямое открытие в приложении «Календарь» (Apple / macOS / iOS) БЕЗ сохранения файла на диск
export function openDirectAppleCalendar(icsContent) {
    const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
    const link = document.createElement('a');
    link.href = dataUri;
    // Убираем download, чтобы браузер сразу передал событие в Calendar.app
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 6. Открытие события в Google Календаре в 1 клик (без файлов)
export function openGoogleCalendarWeb({ title, location, description, startDate, endDate }) {
    const pad = (n) => String(n).padStart(2, '0');
    const formatGDate = (d) => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', title);
    url.searchParams.set('dates', `${formatGDate(startDate)}/${formatGDate(endDate)}`);
    if (location) url.searchParams.set('location', location);
    if (description) url.searchParams.set('details', description);
    
    window.open(url.toString(), '_blank');
}

// 7. Открытие события в Яндекс Календаре (без файлов)
export function openYandexCalendarWeb({ title, location, description, startDate, endDate }) {
    const pad = (n) => String(n).padStart(2, '0');
    const formatYDate = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    
    const url = new URL('https://calendar.yandex.ru/event');
    url.searchParams.set('name', title);
    url.searchParams.set('start_ts', formatYDate(startDate));
    url.searchParams.set('end_ts', formatYDate(endDate));
    if (location) url.searchParams.set('location', location);
    if (description) url.searchParams.set('description', description);
    
    window.open(url.toString(), '_blank');
}
