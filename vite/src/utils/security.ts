// Эталонные SRI-хэши внешних библиотек для защиты от подмены
const SRI_HASHES: Record<string, string> = {
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js': 
        'sha384-3zSEDfvllQohrq0PHL1fOXJuC/jSOO34H46t6UQfobFOmxE5BpjjaIJY5F2/bMnU',

    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js': 
        'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H',

    'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js': 
        'sha384-nFoSjZIoH3CCp8W639jJyQkuPHinJ2NHe7on1xvlUA7SuGfJAfvMldrsoAVm6ECz',

    'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js': 
        'sha384-dug+JxfBvklEQdJ4AYuBBAIScUz0bVN73xpy273gcAwHjb3qI0fXmuYNaNfdyYJG'
};

// Применяет SRI-хэш и CORS-атрибут к тегу <script> при наличии в белом списке
export function applySri(scriptEl: HTMLScriptElement): void {
    const h = SRI_HASHES[scriptEl.src];
    if (h) {
        scriptEl.integrity = h;
        scriptEl.crossOrigin = 'anonymous';
    }
}

// Экранирует HTML-спецсимволы для защиты от XSS
export function escapeHTML(str: string | number | null | undefined): string {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Безопасная очистка URL: блокирует javascript:, data: и экранирует кавычки
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return '';
    const clean = String(url).trim();
    if (/^https?:\/\//i.test(clean)) {
        return escapeHTML(clean);
    }
    return '#';
}