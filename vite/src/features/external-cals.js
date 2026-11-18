// Цвета для внешних календарей
export const EXT_CAL_COLORS =[
    { hex: '#FF2D55', bg: 'rgba(255, 45, 85, 0.15)' },   // Розовый
    { hex: '#00BCD4', bg: 'rgba(0, 188, 212, 0.15)' },   // Голубой
    { hex: '#A2845E', bg: 'rgba(162, 132, 94, 0.15)' },  // Коричневый
    { hex: '#5856D6', bg: 'rgba(88, 86, 214, 0.15)' },   // Индиго
    { hex: '#009688', bg: 'rgba(0, 150, 136, 0.15)' },   // Бирюзовый
    { hex: '#FF5722', bg: 'rgba(255, 87, 34, 0.15)' }    // Оранжевый
];

export function getRandomExtColor() {
    return EXT_CAL_COLORS[Math.floor(Math.random() * EXT_CAL_COLORS.length)].hex;
}

function getExtColorBg(hex) {
    const colorObj = EXT_CAL_COLORS.find(c => c.hex === hex);
    return colorObj ? colorObj.bg : 'rgba(175, 82, 222, 0.15)';
}

export function migrateExternalCals() {
    let cals = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
    if (cals.length > 0 && typeof cals[0] === 'string') {
        // Мигрируем старые календари-строки в объекты с цветом
        cals = cals.map(url => ({ url: url, color: getRandomExtColor() }));
        localStorage.setItem('etis_external_cals_v2', JSON.stringify(cals));
    }
    return cals;
}
