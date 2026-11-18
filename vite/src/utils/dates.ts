// Общая функция преобразования даты ЕТИС в формат YYYY-MM-DD
export function parseDayDateStrToISO(dayDateStr: string | null | undefined): string {
    const now = new Date();
    if (!dayDateStr || dayDateStr === 'UnknownDate') {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }
    const matchText = dayDateStr.match(/(\d{1,2})\s+([а-яА-ЯёЁ]+)(?:\s+(\d{4}))?/i);
    const matchNum = dayDateStr.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/);
    let d = now.getDate(), m = now.getMonth(), y = now.getFullYear();

    if (matchText) {
        d = parseInt(matchText[1], 10);
        const mMap: Record<string, number> = {
            'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
            'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };
        const monthKey = matchText[2].toLowerCase();
        if (mMap[monthKey] !== undefined) m = mMap[monthKey];
        if (matchText[3]) y = parseInt(matchText[3], 10);
    } else if (matchNum) {
        d = parseInt(matchNum[1], 10);
        m = parseInt(matchNum[2], 10) - 1;
        if (matchNum[3]) y = matchNum[3].length === 2 ? 2000 + parseInt(matchNum[3], 10) : parseInt(matchNum[3], 10);
    }

    const dateObj = new Date(y, m, d);
    if (dateObj < now && (now.getMonth() - m) > 6) dateObj.setFullYear(y + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
}