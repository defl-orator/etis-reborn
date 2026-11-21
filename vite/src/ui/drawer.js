// Закрывает текущую модалку и возвращает пользователя в мобильное боковое меню
export const returnToDrawer = (currentModal, currentOverlay) => {
    if (currentModal) currentModal.classList.remove('active');
    if (currentOverlay) currentOverlay.classList.remove('active');
    
    const sidebar = document.querySelector('.span3');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const dock = document.querySelector('.mobile-nav-dock');
    if (sidebar) {
        sidebar.classList.add('mobile-active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        if (dock) dock.classList.add('dock-hidden');
        document.body.classList.add('modal-open-body');
    }
};
