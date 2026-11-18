import { pageCtx } from '../app/context.js';

export function renderAboutPage() {
    pageCtx.span9.querySelectorAll('h3').forEach(h => h.remove());
    const aboutContainer = pageCtx.span9.querySelector('.text');
    if (aboutContainer) {
        aboutContainer.className = 'about-card';

        aboutContainer.querySelectorAll('*').forEach(el => {
            el.removeAttribute('style');
        });

        pageCtx.span9.querySelectorAll('h2, h3').forEach(h => h.remove());
    }
    return;
}
