// Умное склонение направления обучения (в винительный падеж)
export function declineDirection(direction: string | null | undefined): string {
    if (!direction) return '';
    let clean = direction.trim().replace(/\s+/g, ' ');
    if (clean.length > 40 || clean.split(' ').length > 4) {
        return clean;
    }

    const adjectives = /([ая]я|[ыио]й|[ое]е|[ыи]е)$/i;
    const connectors = /^(и|в|на|с|о|об|по|для|при)$/i;
    const skipWords = /^(отношения|технологии|системы|ресурсы|процессы|исследования|мероприятия)$/i;

    let words = clean.split(' ');
    let hasSeenNoun = false;
    let allowDecline = true;

    return words.map(word => {
        if (!allowDecline) return word;

        let isUpper = word[0] === word[0].toUpperCase();
        let lower = word.toLowerCase();

        if (connectors.test(lower)) {
            hasSeenNoun = false;
            return word;
        }

        if (skipWords.test(lower)) {
            hasSeenNoun = true;
            return word;
        }

        if (adjectives.test(lower)) {
            if (lower.endsWith('ая')) lower = lower.slice(0, -2) + 'ую';
            else if (lower.endsWith('яя')) lower = lower.slice(0, -2) + 'юю';
        } else {
            if (hasSeenNoun) {
                allowDecline = false;
                return word;
            }
            if (lower.endsWith('а')) lower = lower.slice(0, -1) + 'у';
            else if (lower.endsWith('я')) lower = lower.slice(0, -1) + 'ю';
            hasSeenNoun = true;
        }

        if (isUpper && lower.length > 0) {
            return lower[0].toUpperCase() + lower.slice(1);
        }
        return lower;
    }).join(' ');
}

// Умное склонение названия предмета в дательный падеж (после «по»)
export function declineSubjectDative(subject: string | null | undefined): string {
    if (!subject) return '';
    let clean = subject
        .replace(/\(.*?\)/g, '')
        .replace(/[«»"']/g, '')
        .replace(/[\s\xa0\u200B-\u200D\uFEFF]+/g, ' ')
        .trim();
    if (!clean) return '';

    const stopPrepositions = /^(в|на|с|со|о|об|по|для|при|из|от|к|до)$/i;
    const connectors = /^(и|или)$/i;
    const isAbbrOrNum = /^[А-ЯЁA-Z0-9\/\-_]+$/;

    const words = clean.split(' ');
    let hasSeenNoun = false;
    let allowDecline = true;

    const declinedWords = words.map((w, idx) => {
        if (!allowDecline) return w;

        let lower = w.toLowerCase();
        let isCapital = w.length > 0 && w[0] === w[0].toUpperCase();

        if (stopPrepositions.test(lower)) {
            allowDecline = false;
            return w;
        }

        if (connectors.test(lower)) {
            hasSeenNoun = false;
            return w;
        }

        if (isAbbrOrNum.test(w) || /^(it|ai|ml|python|ios|android|devops|ci\/cd|sql|grpc|kafka|api|c\+\+|c\#)$/i.test(lower)) {
            return w;
        }

        if (lower === 'физ-ра' || lower === 'физра') {
            hasSeenNoun = true;
            return isCapital ? 'Физ-ре' : 'физ-ре';
        }

        let declined = lower;

        if (lower.endsWith('ский') || lower.endsWith('ный') || lower.endsWith('тый') || lower.endsWith('вый') || lower.endsWith('мый') || lower.endsWith('дый') || lower.endsWith('рый')) {
            declined = lower.slice(0, -2) + 'ому';
        } else if (lower.endsWith('ий') || lower.endsWith('ый') || lower.endsWith('ой')) {
            declined = lower.slice(0, -2) + 'ому';
        } else if (lower.endsWith('ая')) {
            declined = lower.slice(0, -2) + 'ой';
        } else if (lower.endsWith('яя')) {
            declined = lower.slice(0, -2) + 'ей';
        } else if (lower.endsWith('ое')) {
            declined = lower.slice(0, -2) + 'ому';
        } else if (lower.endsWith('ее')) {
            declined = lower.slice(0, -2) + 'ему';
        } else if (lower.endsWith('ые')) {
            declined = lower.slice(0, -2) + 'ым';
        } else if (lower.endsWith('ие') && (idx === 0 || !hasSeenNoun)) {
            if (lower.endsWith('ские') || lower.endsWith('ные') || lower.endsWith('тые') || lower.endsWith('вые')) {
                declined = lower.slice(0, -2) + 'им';
            } else if (lower.endsWith('ение') || lower.endsWith('ание') || lower.endsWith('ование') || lower.endsWith('яние') || lower.endsWith('тие')) {
                declined = lower.slice(0, -1) + 'ю';
                hasSeenNoun = true;
            } else {
                declined = lower.slice(0, -2) + 'им';
            }
        } else if (lower.endsWith('ия')) {
            declined = lower.slice(0, -1) + 'и';
            hasSeenNoun = true;
        } else if (lower.endsWith('а')) {
            declined = lower.slice(0, -1) + 'е';
            hasSeenNoun = true;
        } else if (lower.endsWith('я')) {
            declined = lower.slice(0, -1) + 'е';
            hasSeenNoun = true;
        } else if (lower.endsWith('ие')) {
            declined = lower.slice(0, -1) + 'ю';
            hasSeenNoun = true;
        } else if (lower.endsWith('о')) {
            declined = lower.slice(0, -1) + 'у';
            hasSeenNoun = true;
        } else if (lower.endsWith('ь')) {
            declined = lower.slice(0, -1) + 'и';
            hasSeenNoun = true;
        } else if (lower.endsWith('ы')) {
            declined = lower.slice(0, -1) + 'ам';
            hasSeenNoun = true;
        } else if (lower.endsWith('ии') || lower.endsWith('тии')) {
            declined = lower.slice(0, -2) + 'иям';
            hasSeenNoun = true;
        } else if (lower.endsWith('и') && !lower.endsWith('ки')) {
            declined = lower.slice(0, -1) + 'ям';
            hasSeenNoun = true;
        } else if (lower.endsWith('ки') || lower.endsWith('ги') || lower.endsWith('хи')) {
            declined = lower.slice(0, -1) + 'ам';
            hasSeenNoun = true;
        } else if (/[бвгджзклмнпрстфхцчшщ]$/.test(lower)) {
            declined = lower + 'у';
            hasSeenNoun = true;
        } else if (lower.endsWith('й')) {
            declined = lower.slice(0, -1) + 'ю';
            hasSeenNoun = true;
        }

        if (hasSeenNoun) {
            if (idx + 1 < words.length && !connectors.test(words[idx + 1].toLowerCase())) {
                allowDecline = false;
            }
        }

        return isCapital ? (declined.charAt(0).toUpperCase() + declined.slice(1)) : declined;
    });

    return declinedWords.join(' ');
}