export function parseICS(icsString) {
    const unfolded = icsString.replace(/\r?\n[ \t]/g, '');
    const lines = unfolded.split(/\r?\n/);

    const events = [];
    let currentEvent = null;

    for (let line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = { exdates: [] };
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent && currentEvent.start && !currentEvent.cancelled) {
                events.push(currentEvent);
            }
            currentEvent = null;
        } else if (currentEvent) {
            const colonIdx = line.indexOf(':');
            if (colonIdx > -1) {
                let key = line.substring(0, colonIdx);
                const value = line.substring(colonIdx + 1);

                if (key.includes(';')) key = key.split(';')[0];

                if (key === 'SUMMARY') currentEvent.summary = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');
                else if (key === 'LOCATION') currentEvent.location = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');
                else if (key === 'DESCRIPTION') currentEvent.description = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');
                else if (key === 'URL') currentEvent.url = value;
                else if (key === 'DTSTART') currentEvent.start = parseICalDate(value);
                else if (key === 'DTEND') currentEvent.end = parseICalDate(value);
                else if (key === 'RRULE') currentEvent.rrule = value.toUpperCase();
                else if (key === 'EXDATE') currentEvent.exdates.push(value);
                else if (key === 'STATUS' && value.toUpperCase() === 'CANCELLED') currentEvent.cancelled = true;
            }
        }
    }
    return events;
}

function parseICalDate(str) {
    if (!str) return null;
    if (str.includes(':')) str = str.split(':')[1];
    str = str.replace(/[^0-9TZ]/g, ''); // Удаляем любые скрытые символы

    if (str.length === 8) {
        const y = parseInt(str.substring(0, 4), 10);
        const m = parseInt(str.substring(4, 6), 10) - 1;
        const d = parseInt(str.substring(6, 8), 10);
        return new Date(y, m, d);
    }

    if (str.length >= 15) {
        const y = parseInt(str.substring(0, 4), 10);
        const m = parseInt(str.substring(4, 6), 10) - 1;
        const d = parseInt(str.substring(6, 8), 10);
        const tIdx = str.indexOf('T');

        if (tIdx > -1) {
            const h = parseInt(str.substring(tIdx + 1, tIdx + 3), 10);
            const min = parseInt(str.substring(tIdx + 3, tIdx + 5), 10);
            const s = parseInt(str.substring(tIdx + 5, tIdx + 7), 10);

            if (str.endsWith('Z')) return new Date(Date.UTC(y, m, d, h, min, s));
            return new Date(y, m, d, h, min, s);
        }
    }
    return null;
}

export function eventOccursOnDate(ev, targetDateObj) {
    if (!ev.start) return false;
    const evStartZero = new Date(ev.start.getFullYear(), ev.start.getMonth(), ev.start.getDate());

    if (ev.exdates && ev.exdates.length > 0) {
        const yyyy = targetDateObj.getFullYear();
        const mm = String(targetDateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(targetDateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mm}${dd}`;
        if (ev.exdates.some(ex => ex.includes(dateStr))) return false;
    }

    if (!ev.rrule) {
        if (evStartZero.getTime() === targetDateObj.getTime()) return true;
        if (ev.end) {
            const evEndZero = new Date(ev.end.getFullYear(), ev.end.getMonth(), ev.end.getDate());
            if (targetDateObj >= evStartZero && targetDateObj < evEndZero) return true;
        }
        return false;
    }

    if (targetDateObj.getTime() < evStartZero.getTime()) return false;

    const untilMatch = ev.rrule.match(/UNTIL=([0-9A-Z]+)/);
    if (untilMatch) {
        const untilDate = parseICalDate(untilMatch[1]);
        if (untilDate) {
            untilDate.setHours(23, 59, 59, 999);
            if (targetDateObj.getTime() > untilDate.getTime()) return false;
        }
    }

    const intervalMatch = ev.rrule.match(/INTERVAL=(\d+)/);
    const interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;

    if (ev.rrule.includes('FREQ=DAILY')) {
        const diffTime = Math.abs(targetDateObj - evStartZero);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays % interval === 0;
    }

    if (ev.rrule.includes('FREQ=WEEKLY')) {
        const getMon = (d) => { const nd = new Date(d); nd.setDate(nd.getDate() - (nd.getDay() || 7) + 1); return nd.setHours(0,0,0,0); };
        const diffWeeks = Math.round((getMon(targetDateObj) - getMon(evStartZero)) / (7 * 24 * 3600 * 1000));

        if (diffWeeks % interval !== 0) return false;

        const byDayMatch = ev.rrule.match(/BYDAY=([^;]+)/);
        if (byDayMatch) {
            const daysMap = { 'SU':0, 'MO':1, 'TU':2, 'WE':3, 'TH':4, 'FR':5, 'SA':6 };
            const targetDay = targetDateObj.getDay();
            const validDays = byDayMatch[1].split(',').map(d => daysMap[d.trim().slice(-2)]);
            return validDays.includes(targetDay);
        } else {
            return ev.start.getDay() === targetDateObj.getDay();
        }
    }
    return false;
}
