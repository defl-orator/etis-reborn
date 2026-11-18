// ==========================================
// МАППИНГ ИКОНОК НАПРАВЛЕНИЙ ПОДГОТОВКИ
// ==========================================
export function getDirectionIcon(directionName: string | null | undefined): string {
    if (!directionName) return 'school';
    const t = directionName.toLowerCase();

    // 1. Компьютерные науки, IT и безопасность
    if (t.includes('компьютерн') || t.includes('программн') || t.includes('информатик') || 
        t.includes('информационн') || t.includes('кибер') || t.includes('искусственн') || 
        t.includes('большие данные') || t.includes('связи') || t.includes('инфокоммуникац')) {
        return 'terminal';
    }

    // 2. Физика, астрономия, механика, радиофизика, нанотехнологии
    if (t.includes('физик') || t.includes('радиофизик') || t.includes('механик') || 
        t.includes('фотоник') || t.includes('приборостроен') || t.includes('нанотехнолог') || 
        t.includes('микросистем')) {
        return 'blur_on';
    }

    // 3. Математика и статистика
    if (t.includes('математик') || t.includes('статистик')) {
        return 'functions';
    }

    // 4. Химия, фармация и материаловедение
    if (t.includes('хим') || t.includes('фармац') || t.includes('полимер') || t.includes('материал')) {
        return 'science';
    }

    // 5. Биология, экология, биотехнологии
    if (t.includes('биолог') || t.includes('эколог') || t.includes('биоразнообраз') || 
        t.includes('живые системы') || t.includes('генетик') || t.includes('зоолог') || 
        t.includes('микробиолог') || t.includes('природопользован')) {
        return 'eco';
    }

    // 6. Геология, геофизика, разведка и недра
    if (t.includes('геолог') || t.includes('геофизик') || t.includes('ископаем') || 
        t.includes('разведк') || t.includes('нефт') || t.includes('газ') || t.includes('гидрогеолог')) {
        return 'landscape';
    }

    // 7. География, картография, метеорология, гидрология, туризм, сервис
    if (t.includes('географ') || t.includes('картограф') || t.includes('геоинформатик') || 
        t.includes('гидрометеоролог') || t.includes('гидролог') || t.includes('геодези') || 
        t.includes('туризм') || t.includes('гостиничн') || t.includes('сервис') || t.includes('зондирован')) {
        return 'explore';
    }

    // 8. Международные отношения и регионоведение
    if (t.includes('международные отношения') || t.includes('регионоведен') || t.includes('мировой')) {
        return 'public';
    }

    // 9. Политология и государственное управление
    if (t.includes('политолог') || t.includes('государственное') || t.includes('муниципальное')) {
        return 'account_balance';
    }

    // 10. История и археология
    if (t.includes('истори') || t.includes('археолог') || t.includes('антрополог')) {
        return 'museum';
    }

    // 11. Юриспруденция, право, судебная деятельность, конфликтология
    if (t.includes('юриспруденц') || t.includes('прав') || t.includes('судебн') || 
        t.includes('прокурорск') || t.includes('криминалистич') || t.includes('конфликтолог') || 
        t.includes('социальная работа')) {
        return 'gavel';
    }

    // 12. Филология, лингвистика, языки и перевод
    if (t.includes('филолог') || t.includes('лингвистик') || t.includes('перевод') || 
        t.includes('русский язык') || t.includes('иностранн') || t.includes('китайск') || 
        t.includes('литератур') || t.includes('язык')) {
        return 'translate';
    }

    // 13. Журналистика, медиа, реклама и PR
    if (t.includes('журналистик') || t.includes('медиакоммуникац') || t.includes('реклам') || 
        t.includes('связи с общественностью') || t.includes('контент')) {
        return 'campaign';
    }

    // 14. Экономика, менеджмент, финансы, бизнес, таможня
    if (t.includes('эконом') || t.includes('менеджмент') || t.includes('маркетинг') || 
        t.includes('бизнес') || t.includes('финанс') || t.includes('таможенн') || t.includes('торгов')) {
        return 'trending_up';
    }

    // 15. Психология
    if (t.includes('психолог') || t.includes('психотерап')) {
        return 'psychology';
    }

    // 16. Социология и работа с молодежью
    if (t.includes('социолог') || t.includes('молодеж')) {
        return 'groups';
    }

    // 17. Философия и культурология
    if (t.includes('философ') || t.includes('культур') || t.includes('искусств')) {
        return 'lightbulb';
    }

    // 18. Дизайн
    if (t.includes('дизайн')) {
        return 'palette';
    }

    // 19. Педагогическое образование и логопедия
    if (t.includes('педагогическ') || t.includes('образование') || t.includes('логопед') || 
        t.includes('дефектолог')) {
        return 'cast_for_education';
    }

    return 'school';
}