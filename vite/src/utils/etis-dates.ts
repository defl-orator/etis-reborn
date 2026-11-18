const monthsGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const monthsShort = [
    'янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня',
    'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'
];

export function formatEtisDate(rawStr: string | null | undefined): string {
    if (!rawStr) return '';
    const match = rawStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/);
    if (!match) return rawStr;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = match[3];
    const time = match[4] ? match[4].slice(0, 5) : '';

    const monthStr = monthsGenitive[month] || '';
    const now = new Date();
    const isCurrentYear = String(now.getFullYear()) === (year.length === 2 ? '20' + year : year);

    if (isCurrentYear) {
        return time ? `${day} ${monthStr}, ${time}` : `${day} ${monthStr}`;
    }
    return time ? `${day} ${monthStr} ${year}, ${time}` : `${day} ${monthStr} ${year}`;
}

export function formatEtisDateShort(rawStr: string | null | undefined): string {
    if (!rawStr) return '';
    const match = rawStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/);
    if (!match) return rawStr;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const time = match[4] ? match[4].slice(0, 5) : '';
    const monthStr = monthsShort[month] || '';

    return time ? `${day} ${monthStr}, ${time}` : `${day} ${monthStr}`;
}