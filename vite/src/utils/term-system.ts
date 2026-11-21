import { isDemoUser } from '../core/demo-mode.js';

// Типы падежных форм и системы учебных периодов (семестр/триместр)
export type TermDeclensionForm =
    | 'nom_sg'
    | 'gen_sg'
    | 'dat_sg'
    | 'acc_sg'
    | 'ins_sg'
    | 'prep_sg'
    | 'nom_pl'
    | 'gen_pl'
    | 'prep_pl';

export type TermSystemType = 'semester' | 'trimester';

// Определяет текущую систему обучения (семестр или триместр) по тексту страницы
function getTermSystem(): TermSystemType {
    if (isDemoUser()) return 'semester';
    
    const saved = localStorage.getItem('etis_term_system') as TermSystemType | null;
    const pageText = (document.body ? document.body.innerText || document.body.textContent : '').toLowerCase();
    
    if (pageText.includes('семестр')) {
        if (saved !== 'semester') localStorage.setItem('etis_term_system', 'semester');
        return 'semester';
    }
    if (pageText.includes('триместр')) {
        if (saved !== 'trimester') localStorage.setItem('etis_term_system', 'trimester');
        return 'trimester';
    }
    
    return saved || 'semester';
}

// Возвращает слово «семестр» или «триместр» в нужном падеже
export function getTermWord(form: TermDeclensionForm = 'nom_sg', isCapital = false): string {
    const isSem = getTermSystem() === 'semester';
    const forms: Record<TermDeclensionForm, string> = {
        nom_sg:  isSem ? 'семестр'    : 'триместр',
        gen_sg:  isSem ? 'семестра'   : 'триместра',
        dat_sg:  isSem ? 'семестру'   : 'триместру',
        acc_sg:  isSem ? 'семестр'    : 'триместр',
        ins_sg:  isSem ? 'семестром'  : 'триместром',
        prep_sg: isSem ? 'семестре'   : 'триместре',
        nom_pl:  isSem ? 'семестры'   : 'триместры',
        gen_pl:  isSem ? 'семестров'  : 'триместров',
        prep_pl: isSem ? 'семестрах'  : 'триместрах',
    };
    
    const res = forms[form] || forms.nom_sg;
    return isCapital ? (res.charAt(0).toUpperCase() + res.slice(1)) : res;
}