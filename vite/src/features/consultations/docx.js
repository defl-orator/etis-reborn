import { consultationsFiles, parseConsultationInfo, saveConsultationsState } from './state.js';
import { applySri } from '../../utils/security.ts';

// Вспомогательный хелпер поиска экземпляра библиотеки Mammoth в любых контекстах
const getMammothInstance = () => {
    if (typeof mammoth !== 'undefined') return mammoth;
    if (typeof window !== 'undefined' && window.mammoth) return window.mammoth;
    if (typeof unsafeWindow !== 'undefined' && unsafeWindow.mammoth) return unsafeWindow.mammoth;
    if (typeof globalThis !== 'undefined' && globalThis.mammoth) return globalThis.mammoth;
    return null;
};

// Загрузка библиотеки Mammoth через GM_xmlhttpRequest
const loadMammothLib = () => {
    return new Promise((resolve, reject) => {
        const existing = getMammothInstance();
        if (existing) return resolve(existing);

        const cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

        GM_xmlhttpRequest({
            method: 'GET',
            url: cdnUrl,
            onload: (res) => {
                // Фоллбек через тег <script>
                const script = document.createElement('script');
                script.src = cdnUrl; applySri(script);
                script.onload = () => {
                    const inst = getMammothInstance();
                    if (inst) resolve(inst);
                    else reject(new Error('Не удалось инициализировать Mammoth'));
                };
                script.onerror = () => reject(new Error('Ошибка загрузки Mammoth.js'));
                (document.head || document.documentElement).appendChild(script);
            },
            onerror: () => {
                // Фоллбек при сбое прямого запроса
                const script = document.createElement('script');
                script.src = cdnUrl; applySri(script);
                script.onload = () => {
                    const inst = getMammothInstance();
                    if (inst) resolve(inst);
                    else reject(new Error('Не удалось инициализировать Mammoth'));
                };
                script.onerror = () => reject(new Error('Ошибка загрузки Mammoth.js'));
                (document.head || document.documentElement).appendChild(script);
            }
        });
    });
};

// Парсинг DOCX-файла с графиком консультаций и сохранение в состояние
export function processDocxFile(file, callback, sourceUrl = null) {
    loadMammothLib().then((mammothInstance) => {
        if (!mammothInstance || typeof mammothInstance.convertToHtml !== 'function') {
            throw new Error('Экземпляр Mammoth не найден или повреждён');
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            mammothInstance.convertToHtml({ arrayBuffer: event.target.result }).then(function(result) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result.value;

                let title = "Консультации";
                const fullText = tempDiv.textContent.toLowerCase().replace(/\s+/g, ' ');
                const seasonMatch = fullText.match(/(осенн[а-я]+|весенн[а-я]+|летн[а-я]+|зимн[а-я]+)\s*(триместр[а-я]*|семестр[а-я]*)/i);
                const yearMatch = fullText.match(/(\d{4}\s*\/\s*\d{4}|\d{4}-\d{4})/);
                let yearText = '';
                if (yearMatch) yearText = ' ' + yearMatch[1].replace(/\s/g, '');

                if (seasonMatch) {
                    let season = 'Осенний';
                    if (seasonMatch[1].includes('весен')) season = 'Весенний';
                    if (seasonMatch[1].includes('летн')) season = 'Летний';
                    if (seasonMatch[1].includes('зимн')) season = 'Зимний';
                    let term = seasonMatch[2].includes('трим') ? 'триместр' : 'семестр';
                    title = `${season} ${term}${yearText}`;
                } else if (yearText) {
                    title = `Консультации${yearText}`;
                }

                const fileData = {
                    id: 'cons_file_' + Date.now(),
                    title,
                    isActive: false,
                    sourceUrl: sourceUrl,
                    teachers: []
                };

                tempDiv.querySelectorAll('tr').forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 2) return;
                    const pTags = cells[0].querySelectorAll('p');
                    let nameLines = pTags.length > 0 ? Array.from(pTags).map(p => p.textContent.trim()).filter(Boolean) : cells[0].innerHTML.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').split('\n').map(s => s.trim()).filter(Boolean);
                    if (nameLines.length < 1) return;
                    const name = nameLines[0];
                    const degree = nameLines.slice(1).join(', ');
                    const rawDetailsText = cells[1].innerHTML.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
                    const parsedInfo = parseConsultationInfo(rawDetailsText, cells[1].innerHTML);
                    if (name && (parsedInfo.events.length > 0 || parsedInfo.notes || parsedInfo.email)) {
                        fileData.teachers.push({ name, degree, isActive: false, ...parsedInfo });
                    }
                });

                consultationsFiles.push(fileData);
                saveConsultationsState();
                callback(true, fileData);
            }).catch((err) => {
                console.error('[DOCX Convert Error]', err);
                callback(false);
            });
        };
        reader.onerror = () => callback(false);
        reader.readAsArrayBuffer(file);
    }).catch((err) => {
        console.error('[Mammoth Load Error]', err);
        callback(false);
    });
}
