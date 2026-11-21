import { pageCtx } from '../app/context.js';
import { highlightDatesInHTML } from '../features/event-links.js';
import { initMessageSwipes, shareMessageCard, softShareSVG } from '../features/message-share.js';
import { adjustHeaderLayout, initAttachmentsScrollFade, updateAttachmentsScrollMask } from '../ui/attachments-header.js';
import { updateEmptyState } from '../ui/empty-state.js';
import { formatEtisDate, formatEtisDateShort } from '../utils/etis-dates.js';

// Оформляет страницу сообщений от преподавателей с поиском, вложениями и свайпами
export function renderTeacherNotesPage() {
    const pagesContainer = pageCtx.span9.querySelector('.weeks');
    if (pagesContainer) {
        pagesContainer.classList.add('message-pages');
        const firstLi = pagesContainer.querySelector('li');
        if (firstLi && firstLi.textContent.includes('Страницы')) firstLi.style.display = 'none';
    }

    const messages = pageCtx.span9.querySelectorAll('ul.nav.msg, ul.nav.answ');

    if (!messages.length) {
        pageCtx.span9.querySelectorAll('ul.nav.msg, ul.nav.answ').forEach(m => m.remove());
        const oldH2 = pageCtx.span9.querySelector('h2'); if (oldH2) oldH2.remove();
        updateEmptyState(pageCtx.span9, false, '', 'messages');
        return;
    }

    document.querySelectorAll('.span3 a[href*="stu.teacher_notes"] .badge-point, .span3 li.active .badge-point').forEach(dot => dot.remove());
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
                                <input type="text" class="search-input" id="msg-search" placeholder="Поиск" style="padding-left: 44px !important;">
                            </div>
                        `;

    messages.forEach(msg => {
        const isUnread = msg.classList.contains('answ');
        const allLis = Array.from(msg.querySelectorAll(':scope > li'));
        if (!allLis.length) return;

        const mainLi = allLis[0];

        let teacherName = 'Преподаватель';
        let rawDateStr = '';
        const subjects = [];
        const bodyParts = [];

        allLis.forEach((li, idx) => {
            const textLower = li.textContent.trim().toLowerCase();
            if (textLower.startsWith('прикрепл') && textLower.includes('файл')) return;
            if (li.querySelector('a[href*="file_download"]') && !li.textContent.replace(/прикрепл[её]нные файлы:?/i, '').replace(li.querySelector('a').textContent, '').trim()) return;

            const liClone = li.cloneNode(true);

            if (idx === 0) {
                const teacherNode = liClone.querySelector('b i') || liClone.querySelector('i b');
                if (teacherNode) {
                    teacherName = teacherNode.textContent.trim();
                    const bTag = teacherNode.closest('b');
                    if (bTag) bTag.remove();
                    else teacherNode.remove();
                }

                const dateNode = liClone.querySelector('font[color="#808080"]');
                if (dateNode) {
                    rawDateStr = dateNode.textContent.trim();
                    dateNode.remove();
                }

                liClone.querySelectorAll('font[color="#6A0035"]').forEach(f => {
                    const txt = f.textContent.trim();
                    if (txt) subjects.push(txt);
                    f.remove();
                });

                const boldSubject = liClone.querySelector('font[style*="font-weight:bold"], b');
                if (boldSubject) {
                    const txt = boldSubject.textContent.trim();
                    if (txt) subjects.push(txt);
                    boldSubject.remove();
                }
            }

            liClone.querySelectorAll('font').forEach(n => n.replaceWith(...n.childNodes));

            const html = liClone.innerHTML
                .replace(/^(\s|&nbsp;|<br\s*\/?>)+/gi, '')
                .replace(/(\s|&nbsp;|<br\s*\/?>)+$/gi, '');

            if (html) bodyParts.push(html);
        });

        let bodyHtml = bodyParts.join('<br><br>');
        const highlightedBody = highlightDatesInHTML(bodyHtml, subjects[0] || teacherName || 'Сообщение');
        const highlightedSubjects = subjects.map(s => highlightDatesInHTML(s, s));

        const fullDate = formatEtisDate(rawDateStr);
        const shortDate = formatEtisDateShort(rawDateStr);

        const attachments = [];
        msg.querySelectorAll('a[href*="file_download"]').forEach(link => {
            attachments.push({ name: link.textContent.trim(), href: link.href });
        });

        const textForLength = bodyParts.map(p => p.replace(/<[^>]+>/g, ' ')).join(' ');

        const replyBtn = msg.querySelector('input[type="button"][id^="btn_"], button[id^="btn_"]');
        const replyFrm = msg.querySelector('div[id^="frm_"]');

        let replyBtnHtml = '';
        if (replyBtn) {
            const btnId = replyBtn.id || ('btn_' + Math.random().toString(36).substr(2, 6));
            const btnOnclick = replyBtn.getAttribute('onclick') || '';
            replyBtnHtml = `
                                    <button type="button" class="answer-btn-custom" id="${btnId}" onclick="${btnOnclick.replace(/"/g, '&quot;')}" style="flex-shrink: 0 !important; margin: 0 !important; white-space: nowrap !important; display: inline-flex !important; align-items: center !important; gap: 6px !important;">
                                        <span class="material-icons" style="font-size: 1.8rem; margin: 0 !important;">reply</span>
                                        <span>Ответить</span>
                                    </button>
                                `;
        }

        let attachmentsHtml = '';
        if (attachments.length > 0) {
            attachmentsHtml = `
                                    <div class="msg-attachments">
                                        ${attachments.map(a => `
                                            <a href="${a.href}" class="file-attachment-link" target="_blank">
                                                <span class="material-icons">attach_file</span>
                                                <span class="file-name">${a.name}</span>
                                            </a>
                                        `).join('')}
                                    </div>
                                `;
        }

        let footerHtml = '';
        if (replyBtnHtml || attachmentsHtml) {
            footerHtml = `
                                    <div class="msg-footer">
                                        ${replyBtnHtml}
                                        ${attachmentsHtml}
                                    </div>
                                `;
        }

        let replyFrmHtml = '';
        if (replyFrm) {
            const sendBtn = replyFrm.querySelector('input[type="submit"]');
            if (sendBtn) sendBtn.className = 'send-reply-btn';
            replyFrmHtml = replyFrm.outerHTML;
        }

        const card = document.createElement('div');
        card.className = 'msg-card';
        card.innerHTML = `
                                <div class="msg-header">
                                    <div class="msg-sender" title="${teacherName}">
                                        <span class="material-icons">person</span>
                                        <span class="msg-sender-name" data-full-sender="${teacherName}">${teacherName}</span>
                                    </div>
                                    <div class="msg-date msg-date-wrapper">
                                        <span class="msg-date-text" data-full-date="${fullDate}" data-short-date="${shortDate}">${fullDate}</span>
                                        ${isUnread ? '<span class="msg-unread-dot"></span>' : ''}
                                        <div class="share-msg-wrap" style="display:inline-flex;">${softShareSVG}</div>
                                    </div>
                                </div>
                                ${highlightedSubjects.length ? `<div class="msg-subject">${highlightedSubjects.join('<br>')}</div>` : ''}
                                <div class="msg-body">${highlightedBody}</div>
                                ${footerHtml}
                                ${replyFrmHtml}
                            `;

        container.appendChild(card);
    });

    container.querySelectorAll('.msg-attachments').forEach(initAttachmentsScrollFade);
    container.querySelectorAll('.msg-header').forEach(adjustHeaderLayout);

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            container.querySelectorAll('.msg-header').forEach(adjustHeaderLayout);
            container.querySelectorAll('.msg-attachments').forEach(updateAttachmentsScrollMask);
        });
        ro.observe(container);
    }

    container.querySelectorAll('.msg-card').forEach(card => {
        const shareBtn = card.querySelector('.share-msg-btn');
        if (shareBtn) {
            shareBtn.style.cursor = 'pointer';
            shareBtn.onclick = (e) => {
                e.stopPropagation();
                shareMessageCard(card, 'Сообщение.png');
            };
        }
    });

    initMessageSwipes(container, 'Сообщение.png');

    searchWrapper.querySelector('#msg-search').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        let visibleCount = 0;
        container.querySelectorAll('.msg-card').forEach(card => {
            const isMatch = (val === '' || card.textContent.toLowerCase().includes(val));
            card.style.display = isMatch ? '' : 'none';
            if (isMatch) visibleCount++;
        });
        updateEmptyState(container, visibleCount > 0, val, 'messages');
    });

    pageCtx.span9.querySelectorAll('ul.nav.msg, ul.nav.answ').forEach(m => m.remove());
    const oldH2 = pageCtx.span9.querySelector('h2'); if (oldH2) oldH2.remove();

    pageCtx.span9.prepend(searchWrapper);
    searchWrapper.after(container);
    if (pagesContainer) container.after(pagesContainer);

    if (container.querySelector('.msg-unread-dot')) {
        setTimeout(() => {
            container.querySelectorAll('.msg-unread-dot').forEach(dot => {
                dot.style.opacity = '0';
                dot.style.transform = 'scale(0)';
                setTimeout(() => dot.remove(), 800);
            });
        }, 5000);
    }

    return;
}
