import { ICON_MAP } from './icon-map.js';

const SEL = '.material-icons, .material-symbols-rounded';
const warned = new Set();

const toPh = (name) => {
    if (ICON_MAP[name]) return ICON_MAP[name];
    if (!warned.has(name)) {
        warned.add(name);
        console.warn('[icons] нет соответствия для:', name);
    }
    return name.replace(/_/g, '-');
};

function upgrade(el) {
    if (!el || el.nodeType !== 1) return;
    const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim());
    if (!textNode && !el.dataset.icon) return;
    const name = textNode ? textNode.nodeValue.trim() : el.dataset.icon;
    if (!name) return;

    el.dataset.icon = name;

    if (textNode) {
        textNode.nodeValue = '';
    }

    let i = el.querySelector(':scope > i.ph');
    if (!i) {
        i = document.createElement('i');
        el.appendChild(i);
    }
    const phClass = 'ph ph-' + toPh(name);
    if (i.className !== phClass) {
        i.className = phClass;
    }
    el.classList.add('ph-ready');
}

function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches(SEL)) upgrade(node);
    node.querySelectorAll(SEL).forEach(upgrade);
}

export function iconsBoot() {
    const mo = new MutationObserver(muts => {
        for (const m of muts) {
            if (m.type === 'characterData') {
                const el = m.target.parentElement?.closest(SEL);
                if (el) upgrade(el);
            } else if (m.type === 'childList') {
                const parentEl = m.target.nodeType === 1 ? m.target.closest(SEL) : m.target.parentElement?.closest(SEL);
                if (parentEl) upgrade(parentEl);
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) scan(node);
                    else if (node.nodeType === 3) {
                        const p = node.parentElement?.closest(SEL);
                        if (p) upgrade(p);
                    }
                });
            }
        }
    });

    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    scan(document.documentElement);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => scan(document.documentElement));
    }
}