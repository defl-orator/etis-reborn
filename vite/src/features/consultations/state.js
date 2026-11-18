import { triggerSilentCloudUpload } from '../../sync/cloud.js';
import { deduplicateConsultations, saveSyncData } from '../../sync/data.js';

// --- ЛОГИКА ФАЙЛОВ КОНСУЛЬТАЦИЙ ---
const CONSULTATIONS_KEY = 'etis_consultation_files_v1';

let consultationsFilesRaw = JSON.parse(localStorage.getItem(CONSULTATIONS_KEY) || '[]');

export let consultationsFiles = deduplicateConsultations(consultationsFilesRaw);

export function setConsultationsFiles(value) {
    consultationsFiles = value;
}

export function saveConsultationsState() {
    if (typeof saveSyncData === 'function') {
        saveSyncData(CONSULTATIONS_KEY, JSON.stringify(consultationsFiles));
    } else {
        localStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(consultationsFiles));
        if (typeof triggerSilentCloudUpload === 'function') triggerSilentCloudUpload();
    }
}

export function parseConsultationInfo(rawText, rawHtml) {
    const info = { email: '', events:[], notes: '' };

    // 1. Почта
    const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) info.email = emailMatch[0];

    // 2. Строковые исходники для регулярных выражений (защита от багов Safari и lastIndex)
    const audRegexStr = 'кабинет\\s+декана\\s*№?\\s*\\d+\\s*корп\\.?\\s*\\d+|ауд\\.?\\s*\\d+[а-яa-z]*\\s*[\\/\\\\]\\s*\\d+[а-яa-z]*|ауд\\.?\\s*\\d+[а-яa-z]*';
    const daysRegexStr = 'понедельник|вторник|среда|четверг|пятница|суббота|воскресенье';
    const timeRegexStr = '(?:с\\s+)?(\\d{1,2}[:.]\\d{2})(?:\\s*(?:[-–]|до)\\s*(\\d{1,2}[:.]\\d{2}))?';

    const DAYS =['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];

    const blockIsStrictAgreement = rawText.toLowerCase().includes('по договоренности') || rawText.toLowerCase().includes('договоренност');
    const blockIsRecording = rawText.toLowerCase().includes('по предварительной записи') || rawText.toLowerCase().includes('запис');

    // Превращаем HTML в текст, заменяя переносы на спецсимвол "|", чтобы не терять контекст
    const safeHtml = rawHtml.replace(/<br\s*\/?>|<\/p>/gi, ' | ');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = safeHtml;
    const cleanText = tempDiv.textContent.replace(/\s+/g, ' ').trim();

    // Разбиваем на независимые смысловые блоки
    const chunks = cleanText.split(/(?:[,;]|\bили\b|\|)/i);

    chunks.forEach(chunk => {
        let chunkText = chunk.trim();
        if (!chunkText) return;

        // Локальные регулярки (создаются заново для каждого куска, чтобы lastIndex был равен 0)
        const localAudRegex = new RegExp(audRegexStr, 'i');
        const localDaysRegex = new RegExp(daysRegexStr, 'ig');
        const localTimeRegex = new RegExp(timeRegexStr, 'ig');
        const localLinkRegex = /(https?:\/\/\S+)/i;

        const chunkAudMatch = chunkText.match(localAudRegex);
        const chunkAud = chunkAudMatch ? chunkAudMatch[0].replace(/\s+/g, ' ').trim() : '';

        const chunkLinkMatch = chunkText.match(localLinkRegex);
        const chunkLink = chunkLinkMatch ? chunkLinkMatch[1] : '';

        let chunkDays =[];

        // Ищем диапазоны дней
        const rangeMatch = chunkText.match(/(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)\s*(?:-|–|по)\s*(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)/i);
        if (rangeMatch) {
            const startIdx = DAYS.indexOf(rangeMatch[1].toLowerCase());
            const endIdx = DAYS.indexOf(rangeMatch[2].toLowerCase());
            if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
                for (let i = startIdx; i <= endIdx; i++) chunkDays.push(DAYS[i]);
            }
            chunkText = chunkText.replace(rangeMatch[0], '');
        }

        // Ищем одиночные дни
        const individualDays = [...chunkText.matchAll(localDaysRegex)];
        individualDays.forEach(d => chunkDays.push(d[0].toLowerCase()));
        chunkDays = [...new Set(chunkDays)];

        const times =[...chunkText.matchAll(localTimeRegex)];

        let weekType = 'all';
        if (chunkText.toLowerCase().includes('по нечетным') || chunkText.toLowerCase().includes('по нечётным')) weekType = 'odd';
        else if (chunkText.toLowerCase().includes('по четным') || chunkText.toLowerCase().includes('по чётным')) weekType = 'even';

        // Создание событий
        if (chunkDays.length > 0 && times.length > 0) {
            const t = times[0];
            chunkDays.forEach(day => {
                info.events.push({
                    dayName: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
                    startTime: t[1].replace('.', ':'),
                    endTime: t[2] ? t[2].replace('.', ':') : '',
                    weekType: weekType,
                    aud: chunkAud,
                    link: chunkLink
                });
            });
        } else if (chunkDays.length > 0) {
            chunkDays.forEach(day => {
                info.events.push({
                    dayName: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
                    startTime: 'По дог.',
                    endTime: '',
                    weekType: weekType,
                    aud: chunkAud,
                    link: chunkLink
                });
            });
        } else if (times.length > 0) {
            const t = times[0];
            info.events.push({
                dayName: 'По договоренности',
                startTime: t[1].replace('.', ':'),
                endTime: t[2] ? t[2].replace('.', ':') : '',
                weekType: weekType,
                aud: chunkAud,
                link: chunkLink
            });
        }
    });

    // Если не найдено конкретных событий, но есть договоренность/запись/аудитория/ссылка
    if (info.events.length === 0) {
        if (blockIsStrictAgreement || blockIsRecording || rawText.match(new RegExp(audRegexStr, 'i')) || rawText.match(/(https?:\/\/\S+)/i)) {

            const allAuds =[...rawText.matchAll(new RegExp(audRegexStr, 'ig'))].map(m => m[0].replace(/\s+/g, ' ').trim());
            const allLinks =[...rawText.matchAll(/(https?:\/\/\S+)/ig)].map(m => m[1]);

            info.events.push({
                dayName: 'По договоренности',
                startTime: '',
                endTime: '',
                weekType: 'all',
                aud: allAuds.length > 0 ? allAuds[0] : '',
                link: allLinks.length > 0 ? allLinks[0] : ''
            });
        }
    } else {
        // Фоллбек ссылок/аудиторий (только если ни в одном дне они не были найдены локально)
        const globalAudMatch = rawText.match(new RegExp(audRegexStr, 'i'));
        const globalAud = globalAudMatch ? globalAudMatch[0].replace(/\s+/g, ' ').trim() : '';

        const globalLinkMatch = rawHtml.match(/href=["'](https?:\/\/[^"']+)["']/i) || rawText.match(/(https?:\/\/\S+)/i);
        const globalLink = globalLinkMatch ? globalLinkMatch[1] : '';

        const hasAnyLink = info.events.some(e => e.link);
        const hasAnyAud = info.events.some(e => e.aud);

        info.events.forEach(ev => {
            if (!hasAnyLink && !ev.link) ev.link = globalLink;
            if (!hasAnyAud && !ev.aud) ev.aud = globalAud;
        });
    }

    // Очистка примечаний (заметок)
    let notesText = rawText;
    notesText = notesText.replace(new RegExp(daysRegexStr, 'ig'), '').replace(new RegExp(timeRegexStr, 'ig'), '');
    if (info.email) notesText = notesText.replace(new RegExp(info.email, 'gi'), '');
    notesText = notesText.replace(/https?:\/\/[^\s]+/ig, '');
    notesText = notesText.replace(new RegExp(audRegexStr, 'ig'), '');

    notesText = notesText.replace(/электронная почта(?: преподавателя)?\s*:?/ig, '');
    notesText = notesText.replace(/e-?mail\s*:?/ig, '');
    notesText = notesText.replace(/ссылка для подключения\s*:?/ig, '');
    notesText = notesText.replace(/онлайн\s*ссылка\s*/ig, '');
    notesText = notesText.replace(/онлайн/ig, '');
    notesText = notesText.replace(/Идентификатор конференции[:\s]*\d+([\s-]*\d+)*\s*Код доступа[:\s]*\S+/ig, '');
    notesText = notesText.replace(/консультаци[яи]\s*строго\s*по\s+предварительной\s+записи\s*по\s+эл\.почте:?/ig, 'По предварительной записи');
    notesText = notesText.replace(/консультаци[яи]\s+по\s+[а-я]+/ig, '');
    notesText = notesText.replace(/в\s+университете\s+по\s+договоренности\s+в/ig, 'По договоренности');
    notesText = notesText.replace(/или\s+по\s+[а-я]+/ig, '');
    notesText = notesText.replace(/по\s+договоренности/ig, '');
    notesText = notesText.replace(/тел\.?\s*[\d-]{7,}/ig, '');
    notesText = notesText.replace(/\s*[-–]\s*(?=\s|$)/g, ' ');

    notesText = notesText.replace(/\(\s*\)/g, '').trim();
    notesText = notesText.replace(/^[.,:;–-]\s*/g, '').trim();
    notesText = notesText.replace(/\s*[.,:;–-]$/g, '').trim();

    if (notesText.length > 2 && !/^\W+$/.test(notesText)) {
        info.notes = notesText.replace(/\s+/g, ' ').trim();
    }

    // Дедупликация
    const uniqueEvents =[];
    const seen = new Set();
    info.events.forEach(ev => {
        const str = `${ev.dayName}_${ev.startTime}_${ev.aud}_${ev.link}_${ev.weekType}`;
        if (!seen.has(str)) {
            seen.add(str);
            uniqueEvents.push(ev);
        }
    });
    info.events = uniqueEvents;

    return info;
}

export function stateBoot() {
    // Если локально были обнаружены и убраны дубликаты, сразу перезаписываем и синхронизируем чистую версию
    if (consultationsFiles.length !== consultationsFilesRaw.length) {
        saveConsultationsState();
    }
}
