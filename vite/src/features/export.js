import { getEffectiveAccent } from '../core/accent.js';
import { ACCENT_COLORS } from '../core/accent-colors.ts';
import { generalConfig } from '../core/config.js';
import { safeAppend } from '../styles/inject.js';
import { isMacSafari } from '../utils/platform.ts';
import { getLocalQRCodeDataURL } from '../utils/qr.js';
import { applySri } from '../utils/security.ts';

// ==========================================
// УНИВЕРСАЛЬНАЯ ОЧИСТКА ЭЛЕМЕНТОВ ПЕРЕД ЭКСПОРТОМ
// ==========================================
async function cleanElementForExport(clone, isMsg = false) {
    // 1. Удаление интерактивных элементов, кнопок, скриптов и индикаторов статуса
    clone.querySelectorAll(`
                .share-day-btn, .share-all-btn, .share-week-btn, .share-msg-wrap, .actions-msg-wrap,
                .add-custom-pair-btn, .delete-custom-pair-btn, .subject-note-btn, .pair-important-btn,
                .pair-eval-btn, .pair_teacher .eval, .hidden-by-filter, script, iframe,
                .live-dot, .day-status-icon, .msg-unread-dot, .answer-wrapper, .send-reply-btn, div[id^="frm_"]
            `).forEach(el => el.remove());

    clone.querySelectorAll('[loading="lazy"]').forEach(el => el.removeAttribute('loading'));

    // 2. Сброс затемнения прошедших пар
    clone.querySelectorAll('.pair-passed, tr, td').forEach(el => {
        el.classList.remove('pair-passed');
        el.style.setProperty('opacity', '1', 'important');
    });

    // 3. Выравнивание названий предметов по левому краю
    clone.querySelectorAll('.pair_info, .pair_info div, .pair_info span, .pair_info a, .pair_info .dis, .pair_info .dis a, .pair_info .dis span, .pair_info .aud, .pair_info .aud *').forEach(el => {
        el.style.setProperty('text-align', 'left', 'important');
        el.style.setProperty('-webkit-text-align', 'left', 'important');
        el.style.setProperty('justify-content', 'flex-start', 'important');
        el.style.setProperty('-webkit-justify-content', 'flex-start', 'important');
    });

    // 4. Локальная генерация QR-кодов для онлайн-пар
    if (!isMsg && generalConfig.generateQR) {
        const qrPromises = [];
        clone.querySelectorAll('.timetable-grid tr').forEach(tr => {
            const link = tr.querySelector('.aud a.pair-online-link, .aud a.btn-generic-online, .aud a[href*="zoom"], .aud a[href*="telemost"]');
            const teacherCell = tr.querySelector('.pair_teacher');
            
            if (link && teacherCell && link.href && !link.closest('.pair-teacher-wrap')) {
                qrPromises.push(getLocalQRCodeDataURL(link.href, 128).then(qrDataUrl => {
                    if (!qrDataUrl) return;
                    const img = document.createElement('img');
                    img.src = qrDataUrl;
                    img.style.cssText = 'width: 64px; height: 64px; flex-shrink: 0; margin-right: 14px; display: block; border-radius: 8px; background: #fff;';

                    const teacherText = teacherCell.innerHTML;
                    teacherCell.innerHTML = '';
                    const wrapper = document.createElement('div');
                    wrapper.style.cssText = 'display: flex; align-items: center; justify-content: flex-end; width: 100%;';
                    const textWrapper = document.createElement('div');
                    textWrapper.innerHTML = teacherText;
                    textWrapper.style.cssText = 'text-align: right; display: flex; flex-direction: column; justify-content: center;';
                    textWrapper.querySelectorAll('a').forEach(a => {
                        a.style.setProperty('color', 'var(--color-text-secondary)', 'important');
                        a.style.setProperty('text-decoration', 'none', 'important');
                    });
                    wrapper.appendChild(img);
                    wrapper.appendChild(textWrapper);
                    teacherCell.appendChild(wrapper);
                }));
            }
        });
        await Promise.all(qrPromises);
    }

    // 5. Очистка карточки объявления / сообщения
    if (isMsg) {
        const accConfig = JSON.parse(localStorage.getItem('etis_accent_config')) || { colors: ['blue'] };
        const currentAccentHex = ACCENT_COLORS[getEffectiveAccent(accConfig).colors[0]] || '#007AFF';
        clone.querySelectorAll('.msg-sender, .msg-sender *, .teacher-name-link, .review-dis-link, .accent-stat, .file-attachment-link .material-icons').forEach(el => {
            el.style.setProperty('background', 'none', 'important');
            el.style.setProperty('-webkit-background-clip', 'unset', 'important');
            el.style.setProperty('-webkit-text-fill-color', currentAccentHex, 'important');
            el.style.setProperty('color', currentAccentHex, 'important');
        });
        const footer = clone.querySelector('.msg-footer');
        if (footer && !footer.querySelector('.file-attachment-link')) footer.remove();
    }

    // 6. Стили для холста
    const exportStyles = document.createElement('style');
    exportStyles.innerHTML = `
                * { transition: none !important; animation: none !important; }
                .live-dot, .day-status-icon { display: none !important; }
                .day { box-shadow: none !important; border: 1px solid var(--color-table-border) !important; border-radius: 24px !important; overflow: hidden !important; }
                .day h3 { border-top-left-radius: 23px !important; border-top-right-radius: 23px !important; }
                .timetable-grid { table-layout: fixed !important; width: 100% !important; border-spacing: 0 !important; border-collapse: collapse !important; }
                .timetable-grid td { white-space: normal !important; word-wrap: break-word !important; border-bottom: none !important; padding: 12px 0 !important; opacity: 1 !important; }
                .timetable-grid tr:last-child td { padding-bottom: 20px !important; }
                .timetable-grid td.pair_num { width: 90px !important; min-width: 90px !important; text-align: center !important; }
                .timetable-grid td.pair_info, .timetable-grid td.pair_info *, .timetable-grid .dis, .timetable-grid .dis *, .timetable-grid .aud, .timetable-grid .aud * {
                    text-align: left !important;
                    text-align: -webkit-left !important;
                    justify-content: flex-start !important;
                    -webkit-justify-content: flex-start !important;
                }
                .timetable-grid td.pair_teacher { width: 200px !important; min-width: 200px !important; text-align: right !important; padding-right: 16px !important; display: table-cell !important; }
                .msg-card { box-shadow: none !important; border: 1px solid var(--color-table-border) !important; border-radius: 24px !important; background: var(--color-card) !important; margin: 0 !important; width: 100% !important; }
                .msg-header { border-top-left-radius: 23px !important; border-top-right-radius: 23px !important; }
            `;
    clone.appendChild(exportStyles);
}

export function openExportPreviewModal(targetElement, defaultFileName, isWholeWeek = false) {
    let overlay = document.getElementById('etis-export-overlay');
    let modal = document.getElementById('etis-export-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'etis-export-overlay';
        overlay.className = 'analytics-overlay';
        document.body.appendChild(overlay);
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'etis-export-modal';
        modal.className = 'analytics-modal';
        document.body.appendChild(modal);
    }

    const closeModal = () => {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open-body');
    };
    overlay.onclick = closeModal;

    modal.innerHTML = `
                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center; padding: 1.6rem 2.4rem !important; border-bottom: 1px solid var(--color-table-border) !important;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-icons" style="color:var(--color-accent); font-size:24px;">image</span>
                        <span style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary);">Предпросмотр</span>
                    </div>
                    <span class="material-icons close-preview-modal-btn" style="cursor:pointer; color:var(--color-text-secondary); font-size:24px;">close</span>
                </div>
                <div class="ui-dialog-content" style="padding: 2rem 2.4rem; max-height: 80vh; overflow-y: auto; text-align: center;">
                    <div id="export-loading-state" style="padding: 4rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 14px;">
                        <span class="material-icons" style="font-size: 38px; color: var(--color-accent); animation: spin 1s linear infinite;">sync</span>
                        <div style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-primary);">Генерация скриншота...</div>
                    </div>
                    <div id="export-result-state" style="display: none; flex-direction: column; align-items: center; gap: 1.6rem;">
                        <div style="max-height: 52vh; overflow-y: auto; border-radius: var(--radius-medium); border: 1px solid var(--color-table-border); box-shadow: var(--shadow-main); width: 100%; background: var(--color-body); padding: 8px; box-sizing: border-box;">
                            <img id="export-preview-img" style="max-width: 100%; height: auto; border-radius: var(--radius-small); display: block; margin: 0 auto;">
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%; flex-wrap: wrap;">
                            <button type="button" id="export-download-btn" class="answer-btn-custom" style="gap: 8px; background: var(--color-accent) !important; color: #fff !important;">
                                <span class="material-icons" style="font-size: 18px;">download</span>Скачать
                            </button>
                            <button type="button" id="export-share-btn" class="answer-btn-custom" style="gap: 8px; background: var(--color-card) !important; color: var(--color-text-primary) !important; -webkit-text-fill-color: var(--color-text-primary) !important; border: 1px solid var(--color-table-border) !important; box-shadow: var(--shadow-main) !important; display: none; font-weight: 700;">
                                <span class="material-icons" style="font-size: 18px; color: var(--color-accent) !important; -webkit-text-fill-color: var(--color-accent) !important;">ios_share</span>Поделиться
                            </button>
                        </div>
                    </div>
                </div>
            `;

    modal.querySelector('.close-preview-modal-btn').onclick = closeModal;
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.classList.add('modal-open-body');

    const renderImage = async () => {
        let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
        if (!h2c) return;

        const isMobile = window.innerWidth <= 960;
        const isMsg = targetElement && (targetElement.classList?.contains('msg-card') || targetElement.classList?.contains('message-card'));

        // На ПК объявления генерируются в полноценном десктопном формате (780px), на мобильных — 540px
        const renderWidth = isMobile ? 540 : (isMsg ? 780 : 1000);

        const exportContainer = document.createElement('div');
        exportContainer.style.cssText = `position: absolute; top: 0px; left: 0px; pointer-events: none; width: ${renderWidth}px; padding: ${isMobile ? '24px 24px 12px 24px' : '40px 40px 20px 40px'}; box-sizing: border-box; background: ${getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6'}; font-family: ${getComputedStyle(document.body).fontFamily}; z-index: -9999;`;

        let finalFileName = defaultFileName;
        if (isWholeWeek) {
            const dateStyled = document.querySelector('.week-date-styled');
            if (dateStyled) {
                const cleanDates = dateStyled.textContent.trim().replace(/^С\s+/i, '').replace(/\s*по\s*/i, '-');
                if (cleanDates) finalFileName = `Расписание ${cleanDates}.png`;

                const title = document.createElement('h2');
                title.textContent = 'Расписание: ' + dateStyled.textContent.trim();
                title.style.cssText = `text-align: center; margin-bottom: ${isMobile ? '20px' : '30px'}; font-size: ${isMobile ? '1.8rem' : '2.2rem'}; font-weight: 800; color: var(--color-text-primary);`;
                exportContainer.appendChild(title);
            }
        }

        const span9Wrapper = document.createElement('div');
        span9Wrapper.className = 'span9';
        span9Wrapper.style.cssText = 'margin:0 !important; padding:0 !important; width:100% !important; display:block;';

        let clone;
        if (isWholeWeek) {
            clone = document.createElement('div');
            document.querySelectorAll('.span9 .day').forEach(dayEl => {
                if (dayEl.style.display !== 'none') clone.appendChild(dayEl.cloneNode(true));
            });
        } else {
            clone = targetElement.cloneNode(true);
        }

        // Вызываем универсальную очистку перед созданием скриншота
        await cleanElementForExport(clone, isMsg);

        span9Wrapper.appendChild(clone);

        if (generalConfig.watermark) {
            const watermark = document.createElement('div');
            watermark.style.cssText = 'text-align: right; margin-top: 16px; width: 100%; box-sizing: border-box; font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3;';
            watermark.textContent = 'etisreborn.ru';
            span9Wrapper.appendChild(watermark);
        }

        exportContainer.appendChild(span9Wrapper);
        document.body.appendChild(exportContainer);

        try {
            const canvas = await h2c(exportContainer, {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                windowWidth: renderWidth,
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim()
            });

            canvas.toBlob(blob => {
                exportContainer.remove();
                if (!blob) return;

                const imgUrl = URL.createObjectURL(blob);
                const loading = modal.querySelector('#export-loading-state');
                const result = modal.querySelector('#export-result-state');
                const img = modal.querySelector('#export-preview-img');
                const downloadBtn = modal.querySelector('#export-download-btn');
                const shareBtn = modal.querySelector('#export-share-btn');

                img.src = imgUrl;
                if (loading) loading.style.display = 'none';
                if (result) result.style.display = 'flex';

                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.download = finalFileName;
                    link.href = imgUrl;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                };

                const file = new File([blob], finalFileName, { type: 'image/png' });
                if (!isMacSafari && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareBtn.style.display = 'inline-flex';
                    shareBtn.onclick = () => {
                        navigator.share({ files: [file], title: finalFileName.replace('.png', '') }).catch(() => {});
                    };
                }
            }, 'image/png');
        } catch(err) {
            exportContainer.remove();
        }
    };

    let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
    if (!h2cObj) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; applySri(script);
        script.onload = renderImage;
        safeAppend(script);
    } else {
        renderImage();
    }
}
