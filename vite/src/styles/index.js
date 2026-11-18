import { LOGO_DATA_URI } from '../assets/logo.js';

import css1 from './css/01-base.css?tpl';
import css2 from './css/02-submenu.css?tpl';
import css3 from './css/03-edinaya-kapsula-nedeli-data.css?tpl';
import css4 from './css/04-timetable-toolbar.css?tpl';
import css5 from './css/05-timetable-separators.css?tpl';
import css6 from './css/06-reply-form-styling.css?tpl';
import css7 from './css/07-surveys.css?tpl';
import css8 from './css/08-ui-dialog-reborn.css?tpl';
import css9 from './css/09-detailed-teach-plan.css?tpl';
import css10 from './css/10-prinuditelnyy-razmer-shrifta-v-soobschen.css?tpl';
import css11 from './css/11-propuschennye-zanyatiya.css?tpl';
import css12 from './css/12-library-catalog-search.css?tpl';
import css13 from './css/13-obertka-tablicy.css?tpl';
import css14 from './css/14-analytics-modal.css?tpl';
import css15 from './css/15-pseudo-push-notifications.css?tpl';
import css16 from './css/16-color-picker-modal.css?tpl';
import css17 from './css/17-shering-dnya-i-zatemnenie-proshedshih-pa.css?tpl';
import css18 from './css/18-edinyy-saydbar-vo-vseh-modalnyh-oknah-na.css?tpl';
import css19 from './css/19-stranica-podrobnoe-raspisanie.css?tpl';
import css20 from './css/20-mobilnaya-shtorka-i-dok.css?tpl';
import css21 from './css/21-krasnaya-knopka-vyhoda-iz-offlayn-rezhim.css?tpl';
import css22 from './css/22-stilizaciya-aktivnogo-oprosa-golosovaniy.css?tpl';
import css23 from './css/23-stili-dlya-raskryvayuschihsya-papok-sayd.css?tpl';
import css24 from './css/24-info-o-studente-i-papka-akkaunta-na-pk.css?tpl';
import css25 from './css/25-edinaya-kapsula-uchebnogo-plana-podvklad.css?tpl';
import css26 from './css/26-phosphor.css?tpl';

export const styles = [css1, css2, css3, css4, css5, css6, css7, css8, css9, css10, css11, css12, css13, css14, css15, css16, css17, css18, css19, css20, css21, css22, css23, css24, css25, css26]
    .join('')
    .replaceAll('__LOGO_DATA_URI__', LOGO_DATA_URI);
