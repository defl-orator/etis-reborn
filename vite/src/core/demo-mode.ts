// ==========================================
// ПРОВЕРКА ОФФЛАЙН-РЕЖИМА И ФИКТИВНОГО СТУДЕНТА
// ==========================================
export const isDemoUser = (): boolean => {
    if (sessionStorage.getItem('etis_demo_mode') === 'true') return true;
    const infoText = (document.querySelector('.navbar-static-top .span12 > span')?.textContent ||
                    document.querySelector('.sidebar-user-info')?.textContent || '').toLowerCase();
    return infoText.includes('иванов иван иванович') && infoText.includes('01.01.2000');
};