import { generalConfig } from '../../core/config.js';
import { cleanTimetableForExport } from './export-clean.js';
import { safeAppend } from '../../styles/inject.js';
import { applySri } from '../../utils/security.ts';

// Функция создания скриншота недели (Поделиться)
const triggerShareWeek = () => {
    const renderTimetable = async () => {
        let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
        if (!h2c) return;

        const isMobile = window.innerWidth <= 960;
        const renderWidth = isMobile ? 540 : 1000;

        const exportContainer = document.createElement('div');
        exportContainer.style.cssText = `position: absolute; top: 0px; left: 0px; pointer-events: none; width: ${renderWidth}px; padding: ${isMobile ? '24px 24px 12px 24px' : '40px 40px 20px 40px'}; box-sizing: border-box; background: ${getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6'}; font-family: ${getComputedStyle(document.body).fontFamily}; z-index: -9999;`;

        if (isMobile) exportContainer.style.minHeight = (renderWidth * 16 / 9) + 'px';

        let fileName = 'Расписание.png';
        const dateStyled = document.querySelector('.week-date-styled');
        if (dateStyled) {
            const dateText = dateStyled.textContent.trim();
            const cleanDates = dateText.replace(/^С\s+/i, '').replace(/\s*по\s*/i, '-');
            if (cleanDates) fileName = `Расписание ${cleanDates}.png`;

            const title = document.createElement('h2');
            title.textContent = 'Расписание: ' + dateText;
            title.style.textAlign = 'center';
            title.style.marginBottom = isMobile ? '20px' : '30px';
            title.style.fontSize = isMobile ? '1.8rem' : '2.2rem';
            title.style.fontWeight = '800';
            title.style.color = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#000';
            exportContainer.appendChild(title);
        }

        const span9Wrapper = document.createElement('div');
        span9Wrapper.className = 'span9';
        span9Wrapper.style.setProperty('margin', '0', 'important');
        span9Wrapper.style.setProperty('padding', '0', 'important');
        span9Wrapper.style.setProperty('width', '100%', 'important');

        const timetableClone = document.createElement('div');
        document.querySelectorAll('.span9 .day').forEach(dayEl => {
            if (dayEl.style.display !== 'none') {
                timetableClone.appendChild(dayEl.cloneNode(true));
            }
        });

        await cleanTimetableForExport(timetableClone);
        span9Wrapper.appendChild(timetableClone);

        if (generalConfig.watermark) {
            const watermark = document.createElement('div');
            watermark.style.cssText = 'text-align: right; margin-top: 16px; width: 100%; box-sizing: border-box; font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;';
            watermark.textContent = 'etisreborn.ru';
            span9Wrapper.appendChild(watermark);
        }

        exportContainer.appendChild(span9Wrapper);

        const hideUIStyle = document.createElement('style');
        hideUIStyle.innerHTML = `
                                .live-dot, .add-custom-pair-btn, .delete-custom-pair-btn, .subject-note-btn { display: none !important; opacity: 0 !important; visibility: hidden !important; }
                                .msg-sender, .msg-sender .material-icons, .teacher-name-link, .review-dis-link, .tpr_part > a, .theme a, .logo-say-hey, .accent-stat { background: none !important; -webkit-background-clip: initial !important; -webkit-text-fill-color: initial !important; color: var(--color-accent) !important; }
                            `;
        exportContainer.appendChild(hideUIStyle);
        document.body.appendChild(exportContainer);

        h2c(exportContainer, {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            windowWidth: renderWidth,
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim(),
            ignoreElements: (node) => node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME'
        }).then(canvas => {
            canvas.toBlob(blob => {
                if (!blob) return;
                const file = new File([blob], fileName, { type: 'image/png' });

                if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({ files: [file], title: 'Расписание' }).finally(() => exportContainer.remove());
                } else {
                    const link = document.createElement('a');
                    link.download = fileName; link.href = URL.createObjectURL(blob); link.click();
                    URL.revokeObjectURL(link.href);
                    exportContainer.remove();
                }
            }, 'image/png');
        }).catch(() => exportContainer.remove());
    };

    let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
    if (!h2cObj) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; applySri(script);
        script.onload = renderTimetable;
        safeAppend(script);
    } else {
        renderTimetable();
    }
};
