import { generalConfig } from '../../core/config.js';
import { getLocalQRCodeDataURL } from '../../utils/qr.js';

// --- УНИВЕРСАЛЬНАЯ ОЧИСТКА РАСПИСАНИЯ ДЛЯ html2canvas ---
export const cleanTimetableForExport = async (clone) => {
    // 1. Удаляем UI-мусор, скрипты и ленивую загрузку
    clone.querySelectorAll('.share-day-btn, .add-custom-pair-btn, .live-dot, .day-status-icon, .pair_teacher .eval, .pair-important-btn, .subject-note-btn, .delete-custom-pair-btn, .hidden-by-filter, script').forEach(el => el.remove());
    clone.querySelectorAll('[loading="lazy"]').forEach(el => el.removeAttribute('loading'));

    // 2. Убираем эффект "прошедших пар"
    clone.querySelectorAll('.pair-passed, td').forEach(el => {
        el.classList.remove('pair-passed');
        el.style.setProperty('opacity', '1', 'important');
    });

    // 3. ДОБАВЛЯЕМ QR-КОДЫ ДЛЯ ОНЛАЙН ПАР
    const qrPromises = [];

    if (generalConfig.generateQR) {
        clone.querySelectorAll('.timetable-grid tr').forEach(tr => {
            const link = tr.querySelector('.aud a[href]');
            const teacherCell = tr.querySelector('.pair_teacher');

            if (link && teacherCell && link.href) {
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

    // 4. Вшиваем стили рендера
    const isDark = document.documentElement.getAttribute('theme') === 'dark';
    const shadowCSS = isDark ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.05)';
    const borderColorCSS = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

    const exportStyles = document.createElement('style');
    exportStyles.innerHTML = `
                            * { transition: none !important; animation: none !important; opacity: 1 !important; }
                            .day {
                                box-shadow: ${shadowCSS} !important;
                                border: 1px solid transparent !important;
                                border-radius: 24px !important;
                                overflow: hidden !important;
                            }
                            .day h3 {
                                border-top-left-radius: 23px !important;
                                border-top-right-radius: 23px !important;
                            }

                            .timetable-grid { table-layout: fixed !important; width: 100% !important; border-spacing: 0 !important; border-collapse: collapse !important; }
                            .timetable-grid td { white-space: normal !important; word-wrap: break-word !important; border-bottom: none !important; padding: 12px 0 !important; }

                            /* Даем воздух снизу, чтобы html2canvas не срезал закругления */
                            .timetable-grid tr:last-child td { padding-bottom: 20px !important; }

                            .timetable-grid td.pair_num {
                                width: 90px !important; min-width: 90px !important;
                                font-size: 1.1rem !important;
                                text-align: center !important; padding: 12px 5px !important;
                            }

                            .timetable-grid td.pair_info {
                                width: auto !important; padding-left: 5px !important; padding-right: 5px !important; text-align: left !important;
                            }

                            .timetable-grid td.pair_teacher {
                                width: 200px !important; min-width: 200px !important;
                                text-align: right !important; padding-right: 16px !important;
                                display: table-cell !important;
                            }

                            .timetable-grid tr:not(:last-child) {
                                background-image: linear-gradient(to right, transparent 90px, ${borderColorCSS} 90px, ${borderColorCSS} calc(100% - 16px), transparent calc(100% - 16px)) !important;
                                background-position: bottom !important;
                                background-size: 100% 1px !important;
                                background-repeat: no-repeat !important;
                                background-color: transparent !important;
                            }

                            .day-status-icon { display: none !important; }

                            .timetable-gap-capsule {
                                background: var(--color-highlight) !important;
                                color: var(--color-text-secondary) !important;
                                border: 1px solid var(--color-table-border) !important;
                                display: inline-flex !important; align-items: center !important;
                                width: auto !important;
                                flex: 0 0 auto !important;
                            }
                            .aud a, .btn-generic-online {
                                display: inline-flex !important; align-items: center !important;
                                width: auto !important;
                                flex: 0 0 auto !important;
                                text-decoration: none !important;
                            }
                            .type-badge-holiday { color: #00BFA5 !important; }
                        `;
    clone.appendChild(exportStyles);

    clone.querySelectorAll('.timetable-grid tr').forEach(tr => {
        tr.style.removeProperty('background');
        tr.style.setProperty('background-color', 'transparent', 'important');
    });

    clone.querySelectorAll('*').forEach(el => el.style.boxSizing = 'border-box');
};
