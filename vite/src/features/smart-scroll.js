// Горизонтальный скролл и автоцентрирование активной вкладки или недели
export function initSmartScroll() {
        const containers = document.querySelectorAll('.submenu, .weeks, .timetable-toolbar');

        containers.forEach(container => {
            const activeItem = container.querySelector('b, .current');

            const scrollToActive = (behavior = 'smooth') => {
                if (!activeItem) return;

                const containerRect = container.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();

                const containerCenter = containerRect.left + (containerRect.width / 2);
                const itemCenter = itemRect.left + (itemRect.width / 2);

                const offset = itemCenter - containerCenter;
                const scrollTarget = container.scrollLeft + offset;

                if (Math.abs(offset) < 2) return;

                container.scrollTo({
                    left: scrollTarget,
                    behavior: behavior
                });
            };

            let scrollTimeout;
            let wheelTimeout;
            let isInteracting = false;

            const startSnapbackTimer = (delay = 4000) => {
                clearTimeout(scrollTimeout);
                if (!isInteracting) {
                    scrollTimeout = setTimeout(() => scrollToActive('smooth'), delay);
                }
            };

            container.addEventListener('wheel', (e) => {
                isInteracting = true;
                clearTimeout(wheelTimeout);

                wheelTimeout = setTimeout(() => {
                    isInteracting = false;
                    startSnapbackTimer(3500);
                }, 500);

                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.preventDefault();
                    container.scrollLeft += e.deltaY > 0 ? 45 : -45;
                }
            }, { passive: false });

            if (activeItem) {
                container.addEventListener('mouseenter', () => { isInteracting = true; clearTimeout(scrollTimeout); });
                container.addEventListener('mouseleave', () => { isInteracting = false; startSnapbackTimer(3500); });

                container.addEventListener('touchstart', () => { isInteracting = true; clearTimeout(scrollTimeout); }, { passive: true });
                container.addEventListener('touchend', () => { isInteracting = false; startSnapbackTimer(4000); }, { passive: true });

                container.addEventListener('scroll', () => {
                    if (!isInteracting) startSnapbackTimer(4000);
                }, { passive: true });

                setTimeout(() => scrollToActive('auto'), 50);
                setTimeout(() => scrollToActive('smooth'), 400);
            }
        });
    }
