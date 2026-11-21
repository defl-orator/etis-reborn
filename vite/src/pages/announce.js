import { pageCtx } from '../app/context.js';
import { processDocxFile } from '../features/consultations/docx.js';
import { consultationsFiles } from '../features/consultations/state.js';
import { highlightDatesInHTML } from '../features/event-links.js';
import { initMessageSwipes, shareMessageCard, softShareSVG } from '../features/message-share.js';
import { adjustHeaderLayout, initAttachmentsScrollFade, updateAttachmentsScrollMask } from '../ui/attachments-header.js';
import { updateEmptyState } from '../ui/empty-state.js';
import { highlightSearchTerm } from '../ui/search-highlight.js';
import { formatEtisDate, formatEtisDateShort } from '../utils/etis-dates.js';

// Оформляет страницу объявлений с поиском, импортом консультаций и свайпами
export function renderAnnouncePage() {
    pageCtx.span9.querySelectorAll('br, h2, h3').forEach((el, i) => { if(i < 2) el.remove(); });
    const announceMessages = pageCtx.span9.querySelectorAll('ul.nav.msg, ul.nav.answ');
    if (!announceMessages.length) return;

    if (!announceMessages.length) {
        pageCtx.span9.innerHTML = '';
        updateEmptyState(pageCtx.span9, false, '', 'announces');
        return;
    }

    document.querySelectorAll('.span3 a[href*="stu_ann.announces"] .badge-point, .span3 li.active .badge-point').forEach(dot => dot.remove());
    if (window.updateFolderBadges) window.updateFolderBadges();
    if (!document.querySelector('.span3 .badge-point')) {
        document.querySelector('.mobile-dock-drawer-btn, .mobile-menu-btn')?.classList.remove('has-updates');
    }

    const container = document.createElement('div');
    container.className = 'msg-container';

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'teacher-search-wrapper';
    searchWrapper.style.marginTop = '0';
    searchWrapper.innerHTML = `
                            <div class="search-capsule" style="max-width: 100%;">
                                <span class="material-icons search-icon">search</span>
                                <input type="text" class="search-input" id="ann-search" placeholder="Поиск" style="padding-left: 44px !important; padding-right: 70px !important;">
                                <span id="ann-search-counter" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 1.15rem; font-weight: 700; color: var(--color-text-secondary); display: none; background: var(--color-highlight); padding: 2px 8px; border-radius: 12px; pointer-events: none;"></span>
                            </div>
                        `;

    announceMessages.forEach(msg => {
        const isUnread = msg.classList.contains('answ');
        const allLis = Array.from(msg.querySelectorAll(':scope > li'));
        if (!allLis.length) return;

        const firstLi = allLis[0];

        let dateStr = '';
        let titleStr = '';
        let rawDateStr = '';
        const bodyParts = [];

        allLis.forEach((li, idx) => {
            const textLower = li.textContent.trim().toLowerCase();
            if (textLower.startsWith('прикрепл') && textLower.includes('файл')) return;
            if (li.querySelector('a[href*="file_download"]') && !li.textContent.replace(/прикрепл[её]нные файлы:?/i, '').replace(li.querySelector('a').textContent, '').trim()) return;

            const liClone = li.cloneNode(true);

            if (idx === 0) {
                const dateNode = liClone.querySelector('font[color="#808080"]');
                if (dateNode) {
                    rawDateStr = dateNode.textContent.trim();
                    dateNode.remove();
                }

                const titleNode = liClone.querySelector('font[style*="font-weight:bold"], b');
                if (titleNode) {
                    titleStr = titleNode.textContent.trim();
                    titleNode.remove();
                }
            }

            liClone.querySelectorAll('font').forEach(n => n.replaceWith(...n.childNodes));

            const html = liClone.innerHTML.replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
            if (html) bodyParts.push(html);
        });

        const attachments = [];
        msg.querySelectorAll('a[href*="file_download"]').forEach(link => {
            attachments.push({ name: link.textContent.trim(), href: link.href });
        });

        let rawHtml = bodyParts.join('<br><br>');
        let authorStr = 'Администрация / Деканат';

        const authorFioRegex = /(?:<br\s*\/?>|<\/p>|<\/div>|\n|\s|^)([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.\s*[А-ЯЁ]\.|\s+[А-ЯЁ]\.|\s+[А-ЯЁ][а-яё]+))\s*(?:<\/?(?:p|div|span|font|br)\s*\/?>|\s)*$/;
        const fioMatch = rawHtml.match(authorFioRegex);

        if (fioMatch) {
            authorStr = fioMatch[1].replace(/\s+/g, ' ').trim();
            rawHtml = rawHtml.substring(0, fioMatch.index).trim();
        } else {
            const parts = rawHtml.split(/<br\s*\/?>|<\/p>|<\/div>/i).map(p => p.trim()).filter(Boolean);
            if (parts.length > 1) {
                const lastPartClean = parts[parts.length - 1].replace(/<[^>]+>/g, '').trim();
                if (lastPartClean.length > 0 && lastPartClean.length < 50 && !/[!?]$/.test(lastPartClean) && !lastPartClean.toLowerCase().includes('http')) {
                    authorStr = lastPartClean;
                    const lastIdx = rawHtml.lastIndexOf(parts[parts.length - 1]);
                    if (lastIdx !== -1) {
                        rawHtml = rawHtml.substring(0, lastIdx).trim();
                    }
                }
            }
        }

        let bodyHtml = rawHtml.replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
        bodyHtml = highlightDatesInHTML(bodyHtml, titleStr || 'Объявление');
        const highlightedTitle = titleStr ? highlightDatesInHTML(titleStr, titleStr) : '';

        const textForLength = bodyParts.map(p => p.replace(/<[^>]+>/g, ' ')).join(' ');

        const fullDate = formatEtisDate(rawDateStr);
        const shortDate = formatEtisDateShort(rawDateStr);

        const card = document.createElement('div');
        card.className = 'msg-card';
        card.innerHTML = `
                                <div class="msg-header">
                                    <div class="msg-sender" title="${authorStr}">
                                        <span class="material-icons">campaign</span>
                                        <span class="msg-sender-name" data-full-sender="${authorStr}">${authorStr}</span>
                                    </div>
                                    <div class="msg-date msg-date-wrapper">
                                        <span class="msg-date-text" data-full-date="${fullDate}" data-short-date="${shortDate}">${fullDate}</span>
                                        ${isUnread ? '<span class="msg-unread-dot"></span>' : ''}
                                        <div class="share-msg-wrap" style="display:inline-flex;">${softShareSVG}</div>
                                    </div>
                                </div>
                                ${highlightedTitle ? `<div class="msg-subject">${highlightedTitle}</div>` : ''}
                                <div class="msg-body">${bodyHtml}</div>
                                ${attachments.length > 0 ? `
                                    <div class="msg-footer">
                                        <div class="msg-attachments">
                                            ${attachments.map(a => {
                            const isDocx = a.name.toLowerCase().includes('.docx');
                            const isCons = a.name.toLowerCase().includes('консультац');
                            const isAlreadyAdded = consultationsFiles.some(f => f.sourceUrl === a.href);

                            if (isDocx && isCons) {
                                return `
                                                        <div class="file-attachment-link cons-integrated-file">
                                                            <a href="${a.href}" target="_blank" style="display: inline-flex !important; align-items: center !important; gap: 6px !important; text-decoration: none !important; color: var(--color-text-primary) !important; min-width: 0 !important; flex: 1 1 auto !important; overflow: hidden !important;">
                                                                <span class="material-icons" style="font-size: 1.8rem !important; flex-shrink: 0 !important;">attach_file</span>
                                                                <span class="file-name" style="white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;">${a.name}</span>
                                                            </a>
                                                            <button type="button" class="import-cons-icon-btn ${isAlreadyAdded ? 'added' : ''}" data-href="${a.href}" title="${isAlreadyAdded ? 'Консультации уже в расписании' : 'Добавить консультации в расписание'}">
                                                                <span class="material-icons">${isAlreadyAdded ? 'check' : 'add_to_photos'}</span>
                                                            </button>
                                                        </div>
                                                    `;
                            }

                            return `
                                                    <a href="${a.href}" class="file-attachment-link" target="_blank">
                                                        <span class="material-icons">attach_file</span>
                                                        <span class="file-name">${a.name}</span>
                                                    </a>
                                                `;
                        }).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            `;

        container.appendChild(card);

        const shareBtn = card.querySelector('.share-msg-btn');
        if (shareBtn) {
            shareBtn.onclick = (e) => {
                e.stopPropagation();
                shareMessageCard(card, 'Объявление.png');
            };
        }
    });

    container.querySelectorAll('.import-cons-icon-btn').forEach(btn => {
        if (btn.classList.contains('added')) return;

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const href = btn.getAttribute('data-href');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="material-icons" style="font-size: 15px !important; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; animation: spin 1s linear infinite;">sync</span>';
            btn.style.pointerEvents = 'none';

            GM_xmlhttpRequest({
                method: 'GET',
                url: href,
                responseType: 'arraybuffer',
                onload: function(res) {
                    if (res.status === 200) {
                        const blob = new Blob([res.response], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                        const file = new File([blob], "consultations.docx");

                        processDocxFile(file, (success, data) => {
                            if (success) {
                                btn.innerHTML = '<span class="material-icons" style="font-size: 16px !important;">check</span>';
                                btn.classList.add('added');
                                btn.title = 'Консультации уже в расписании';
                                btn.style.setProperty('box-shadow', 'none', 'important');
                                btn.style.pointerEvents = 'none';

                                if (window.showEtisPush) window.showEtisPush('Консультации загружены', data.title, 'Добавлено в расписание', 'success', 'event_available');

                                if (typeof window.injectConsultationPairs === 'function') {
                                    document.querySelectorAll('.docx-consultation-row').forEach(el => el.remove());
                                    window.injectConsultationPairs();
                                    if (typeof window.recalculateTimetable === 'function') window.recalculateTimetable();
                                }
                            } else {
                                btn.innerHTML = '<span class="material-icons" style="font-size: 16px !important; color: #ffffff !important;">error</span>';
                                btn.style.setProperty('background', 'var(--color-red)', 'important');
                                btn.style.setProperty('box-shadow', 'none', 'important');
                                setTimeout(() => {
                                    btn.innerHTML = originalHTML;
                                    btn.style.setProperty('background', 'var(--color-green)', 'important');
                                    btn.style.pointerEvents = 'auto';
                                }, 3000);
                            }
                        }, href);
                    }
                },
                onerror: function() {
                    btn.innerHTML = '<span class="material-icons" style="font-size: 16px !important; color: #ffffff !important;">error</span>';
                    btn.style.setProperty('background', 'var(--color-red)', 'important');
                    btn.style.setProperty('box-shadow', 'none', 'important');
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.setProperty('background', 'var(--color-green)', 'important');
                        btn.style.pointerEvents = 'auto';
                    }, 3000);
                }
            });
        };
    });

    container.querySelectorAll('.msg-card').forEach(card => {
        const shareBtn = card.querySelector('.share-msg-btn');
        if (shareBtn) {
            shareBtn.style.cursor = 'pointer';
            shareBtn.onclick = (e) => {
                e.stopPropagation();
                shareMessageCard(card, 'Объявление.png');
            };
        }
    });

    const urlParamsSearch = new URLSearchParams(window.location.search);
    if (urlParamsSearch.has('search')) {
        const input = searchWrapper.querySelector('#ann-search');
        if (input) {
            input.value = urlParamsSearch.get('search');
            setTimeout(() => input.dispatchEvent(new Event('input')), 50);
        }
    }

    const annCounter = searchWrapper.querySelector('#ann-search-counter');
    searchWrapper.querySelector('#ann-search').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        let visibleCount = 0;
        container.querySelectorAll('.msg-card').forEach(card => {
            const isMatch = (val === '' || card.textContent.toLowerCase().includes(val));
            card.style.display = isMatch ? '' : 'none';
            if (isMatch) {
                highlightSearchTerm(card, val);
                visibleCount++;
            }
        });

        if (annCounter) {
            if (val) {
                annCounter.textContent = `${visibleCount}`;
                annCounter.style.display = 'block';
            } else {
                annCounter.style.display = 'none';
            }
        }

        updateEmptyState(pageCtx.span9, visibleCount > 0, val, 'announces');
    });

    pageCtx.span9.innerHTML = '';
    pageCtx.span9.appendChild(searchWrapper);
    pageCtx.span9.appendChild(container);
    initMessageSwipes(container, 'Объявление.png');

    if (container.querySelector('.msg-unread-dot')) {
        setTimeout(() => {
            container.querySelectorAll('.msg-unread-dot').forEach(dot => {
                dot.style.opacity = '0';
                dot.style.transform = 'scale(0)';
                setTimeout(() => dot.remove(), 800);
            });
        }, 5000);
    }

    container.querySelectorAll('.msg-attachments').forEach(initAttachmentsScrollFade);
    container.querySelectorAll('.msg-header').forEach(adjustHeaderLayout);

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            container.querySelectorAll('.msg-header').forEach(adjustHeaderLayout);
            container.querySelectorAll('.msg-attachments').forEach(updateAttachmentsScrollMask);
        });
        ro.observe(container);
    }

    return;
}
