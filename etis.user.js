// ==UserScript==
// @name         ЕТИС REBORN
// @namespace    http://tampermonkey.net/
// @version      1.41
// @description  Глобальный редизайн ЕТИСа
// @author       ENAleksey & Nikolai Masalkin
// @match        https://student.psu.ru/*   
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. ВНЕДРЕНИЕ CSS СТИЛЕЙ
    // ==========================================
    const styles = `
@font-face {
	font-family: 'Material Icons Outlined';
	font-style: normal;
	font-weight: 400;
	src: url(https://fonts.gstatic.com/s/materialiconsoutlined/v38/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUce.woff2) format('woff2');
}

:root {
	--font-family: 'PT Sans Caption', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	--radius-small: 12px;
	--radius-medium: 16px;
	--radius-large: 24px;
	--width-aside: 26rem; /* Чуть шире меню */
	--width-page: 1120px;
	--width-content-margin-left: 3rem;
    --transition: 0.2s ease;
}

[theme="light"] {
    /* Основные цвета */
	--color-body: #F2F2F6; /* Светло-серый фон как в iOS */
	--color-card: #FFFFFF;
    
    /* Акцент: ГОЛУБОЙ */
	--color-accent: #007AFF; 
	--color-accent-dark: #0056b3;
	--color-accent-active: #E3F2FD; /* Фон активного элемента */
    --color-text-link: #007AFF;
    
    /* Элементы */
	--color-tooltip: #fff;
	--color-highlight: #F2F2F7;
	--color-highlight-light: #fff;
	--color-input: #F2F2F7;
	--color-input-highlight: #fff;
	--color-scrollbar-thumb: #c1c1c1;
	--color-scrollbar-thumb-highlight: #a8a8a8;
	--color-table-border: rgba(0, 0, 0, 0.08); /* Очень легкая граница */
	--color-table-header: #F9F9F9;
	--color-table-highlight: #F5F5F5;
	
    /* Статусы */
	--color-red: #FF3B30;
	--color-green: #34C759;
	--color-blue: #007AFF;
	--color-yellow: #FFCC00;
	--color-warning: #FF9500;
	--color-white: #fff;
	--color-error: #FF3B30;
	
    /* Текст */
	--color-text-primary: #1C1C1E;
	--color-text-secondary: #8E8E93;
	--color-text-primary-invert: #fff;
    --color-text-accent: #007AFF;
	--shadow-main: 0 4px 12px rgba(0, 0, 0, 0.05);
	--shadow-dialog: 0 10px 30px rgba(0, 0, 0, 0.2);
    --border-input: 1px solid transparent;
    --color-table-highlight: rgba(0, 0, 0, 0.03);
    --color-table-border: rgba(0, 0, 0, 0.08);
}

[theme="dark"] {
    /* Основные цвета  */
	--color-body: #16181A; 
	--color-card: #212325; 
    
    /* Акцент */
	--color-accent: #4B89DC; 
	--color-accent-dark: #3565A8;
	--color-accent-active: rgba(75, 137, 220, 0.15);
    --color-text-link: #60A5FA; 
    
    /* Элементы интерфейса */
	--color-tooltip: #2A2C2F;
	--color-highlight: #2A2C2F;
	--color-highlight-light: #35383C;
	--color-input: #2A2C2F;
	--color-input-highlight: #16181A;
	--color-scrollbar-thumb: #4A4D51;
	--color-scrollbar-thumb-highlight: #606468;
	--color-table-border: rgba(255, 255, 255, 0.08);
    --color-table-header: #1A1C1E;
	--color-table-highlight: #2A2C2F;
	
    /* Статусы */
	--color-red: #E06C65;
	--color-green: #5BB974;
	--color-blue: #4B89DC;
	--color-yellow: #E2B953;
	--color-warning: #E29953;
	--color-white: #ffffff;
	--color-error: #E06C65;
	
    /* Текст */
	--color-text-primary: #EAECEE; 
	--color-text-secondary: #8E9499;
	--color-text-primary-invert: #ffffff; 
    --color-text-accent: #60A5FA;
	--shadow-main: 0 4px 12px rgba(0, 0, 0, 0.2);
	--shadow-dialog: 0 10px 30px rgba(0, 0, 0, 0.5);
    --border-input: 1px solid #3A3D40;
}

/* Page Base */
html {
	font-size: 10px !important;
}

body {
	background: var(--color-body) !important;
	color: var(--color-text-primary) !important;
	font-family: var(--font-family) !important;
    min-height: 100vh !important;
}

/* ПК версия скроллбара и layout */
@media (min-width: 961px) {
    html, body {
        height: 100% !important;
        overflow-y: overlay !important;
    }
}

.container {
	padding: 0 !important;
	max-width: var(--width-page) !important;
	width: 100% !important;
	margin: 0 auto !important;
}

.container .row {
	margin: 0 !important;
	padding: 2rem 2rem 10rem !important;
}

.span9 > br:first-child,
.span9 > script + br,
.span9 > style + br {
    display: none !important;
}

.span9 {
	width: auto !important;
	margin-left: calc(var(--width-aside) + var(--width-content-margin-left)) !important;
	float: none !important;
}

.span9 > h3 { margin-bottom: 1.4rem !important; }
.submenu { font-size: 1.2rem !important; margin-bottom: 2.4rem !important; }
.submenu + .submenu { margin-top: -0.8rem !important; }

.warning {
	margin: 0 !important;
	width: auto !important;
	margin-bottom: 2rem !important;
	background: none !important;
	color: var(--color-text-error) !important;
	font-size: 1.2rem !important;
}

#tooltip {
	background: var(--color-tooltip) !important;
	color: var(--color-text-primary) !important;
	border: 0.1rem solid var(--color-text-primary) !important;
	padding: 0.4rem 0.6rem !important;
}

.flex-row { display: flex !important; align-items: center !important; }
*, *:before, *:after { box-sizing: border-box !important; }

/* Scrollbar (Desktop) */
::-webkit-scrollbar { height: 1.4rem !important; width: 1.4rem !important; background: transparent !important; z-index: 12 !important; }
::-webkit-scrollbar-corner { background: transparent !important; }
::-webkit-scrollbar-thumb { width: 1rem !important; background-color: var(--color-scrollbar-thumb) !important; border-radius: var(--radius-large) !important; z-index: 12 !important; border: 0.4rem solid transparent !important; background-clip: padding-box !important; margin: 0.4rem !important; min-height: 3.2rem !important; min-width: 3.2rem !important; }
::-webkit-scrollbar-thumb:hover { background-color: var(--color-scrollbar-thumb-highlight) !important; border: 0.2rem solid transparent !important; }
* { scrollbar-width: thin; scrollbar-color: var(--color-scrollbar-thumb) #00000000; }

@supports (-moz-appearance:none) { .span3 { padding-right: 0.4rem !important; } }

/* Colors & Fonts */
font[color="red"], tr[style="color:red;"], span[style="color:red;"], div[style="font-size:0.8em;color:red;"], font[style="color:red;font-weight:bold"], font[style="color:#d00;"] { color: var(--color-red) !important; }
span[style="color:green;"], font[color="green"], div[style="font-size:0.8em;color:green;"] { color: var(--color-green) !important; }
font[color="blue"], font[style="font-weight:bold;color:blue;cursor:pointer"], div[style="color:blue;font-size: 0.8em;"], span[style="color:blue;"] { color: var(--color-blue) !important; }
font[color="gray"], font[color="#808080"], font[style="font-size:10px;color:#808080"], div[style="font-size:0.8em;color:gray;"], span[style="color:#808080"], font[style="font-weight:bold;color:#333333;"], span[style="color:#333333"] { color: var(--color-text-secondary) !important; }
font[color="#6A0035"] { color: var(--color-text-accent); }

a { color: var(--color-text-link) !important; }
a.dashed { color: var(--color-text-secondary) !important; }
a.dashed:hover { color: var(--color-text-highlight) !important; }
.navbar-static-top { display: none !important; }

/* --- TABLES (MODERN CLEAN) --- */
table {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
    border: none !important;
    border-radius: var(--radius-medium) !important;
    background: var(--color-card) !important;
    box-shadow: var(--shadow-main) !important;
    overflow: hidden !important;
    margin-bottom: 2.4rem !important;
    color: var(--color-text-primary) !important;
}

/* Фикс "подбородка" в расписании */
.day table {
    margin-bottom: 0 !important; 
}

/* Форсированно убираем инлайн-белые фоны от ЕТИСа на строках и ячейках */
table tr, table td, 
.common tr, .common td, 
.slimtab_nice tr, .slimtab_nice td {
    background: transparent !important;
    background-color: transparent !important;
}

/* Шапка таблицы */
table th, .common th, .slimtab_nice th {
    background: var(--color-table-header) !important;
    color: var(--color-text-secondary) !important;
    font-weight: 600 !important;
    font-size: 1.1rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    border: none !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    padding: 1.2rem 1.6rem !important;
    vertical-align: middle !important;
    text-align: center !important; /* Центрируем шапку */
}

/* Ячейки */
table td, .common td, .slimtab_nice td {
    border: none !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    padding: 1.4rem 1.6rem !important;
    vertical-align: middle !important;
    font-size: 1.3rem !important;
    color: var(--color-text-primary) !important;
    text-align: center !important; /* Центрируем контент */
}

table th:first-child, table td:first-child,
.common th:first-child, .common td:first-child {
    text-align: left !important;
}

table tr:last-child td {
    border-bottom: none !important;
}

table tbody tr:hover td {
    background-color: var(--color-table-highlight) !important;
}
table tbody tr:hover th {
    background-color: var(--color-table-header) !important; 
}
table tbody tr:hover td[rowspan] {
    background-color: var(--color-card) !important; /* Игнорируем ховер у объединенных ячеек (напр. "ТЕМА") */
}

.slimtab_nice, .common, .teach_plan { border: none !important; }
.slimtab_nice:after, .common:after { display: none !important; }

font[color="green"], span[style*="color:green"] { color: var(--color-green) !important; font-weight: 600 !important; }
font[color="red"], span[style*="color:red"] { color: var(--color-red) !important; font-weight: 600 !important; }
font[color="blue"], span[style*="color:blue"] { color: var(--color-blue) !important; font-weight: 600 !important; }

/* --- SUBMENU  --- */
.submenu {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 0.8rem !important;
    margin-bottom: 2.4rem !important;
    border-bottom: none !important;
    align-items: center !important;
    overflow-x: auto !important; 
    padding-bottom: 0.8rem !important; 
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
}
.submenu::-webkit-scrollbar { 
    display: none !important; /* Прячем скроллбар в Chrome/Safari */
}

.submenu a {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0.8rem 1.6rem !important;
    border-radius: 2rem !important;
    background: var(--color-card) !important;
    color: var(--color-text-secondary) !important;
    text-decoration: none !important;
    font-weight: 500 !important;
    box-shadow: var(--shadow-main) !important;
    transition: all 0.2s !important;
    border: 1px solid transparent !important;
    line-height: 1.2 !important;
}

.submenu b {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0.8rem 1.6rem !important;
    border-radius: 2rem !important;
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    font-weight: 600 !important;
    box-shadow: var(--shadow-main) !important;
    line-height: 1.2 !important;
}

.submenu a:hover {
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
    transform: translateY(-1px);
}

/* UI Dialog */
.ui-dialog { box-shadow: var(--shadow-dialog) !important; }
.ui-dialog .ui-dialog-content { width: initial !important; height: initial !important; }
.ui-dialog .ui-dialog-content > form { display: flex !important; flex-direction: column !important; }
.ui-dialog .ui-dialog-content > form > input { margin-top: 6px !important; }
.ui-dialog .ui-dialog-content > form > input.btn { align-self: flex-end !important; }
.ui-widget-content { border: none !important; background: var(--color-card) !important; color: var(--color-text-primary) !important; }
.ui-widget-header { border: none !important; background: var(--color-highlight) !important; color: var(--color-text-primary) !important; }
.ui-widget-overlay { background: var(--color-dialog-fade) !important; opacity: 1 !important; }
.ui-dialog .ui-dialog-titlebar-close { border: none !important; background: none !important; color: var(--color-text-secondary) !important; }
.ui-dialog .ui-dialog-titlebar-close > .ui-button-icon-primary { display: none !important; }
.ui-dialog .ui-dialog-titlebar-close:before { content: 'close' !important; font-family: 'Material Icons Outlined' !important; font-size: 18px !important; }

/* Inputs & Buttons */
input, select, textarea, button { font-family: inherit !important; }
textarea { width: 100% !important; }
select, textarea { background: var(--color-input) !important; color: var(--color-text-primary) !important; padding: 0.4rem 0.8rem !important; border-radius: var(--radius-small) !important; border: var(--border-input) !important; }
select:hover { background: var(--color-input-highlight) !important; }
input[type="text"], input[type="password"], input[type="email"] { 
    background: transparent !important; 
    color: var(--color-text-primary) !important; 
    border: none !important; 
    box-shadow: inset 0 -1px 0 0 var(--color-text-secondary) !important; 
    width: 100% !important; 
    padding: 0.8rem 0 !important; /* Внутренний отступ сверху и снизу */
    margin-bottom: 1.6rem !important; /* Раздвигаем поля друг от друга */
}
input[type="text"]:focus, input[type="password"]:focus, input[type="email"]:focus { 
    box-shadow: inset 0 -2px 0 0 var(--color-accent) !important; 
    outline: none !important; 
}
input[type="checkbox"], input[type="radio"] { position: relative !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; margin-right: 1rem !important; }
input[type="checkbox"]:before { width: 1.8rem !important; height: 1.8rem !important; background: var(--color-input) !important; content: '' !important; position: absolute !important; border-radius: 0.2rem !important; border: var(--border-input) !important; }
input[type="checkbox"]:checked:after { width: 0.8rem !important; height: 0.8rem !important; background: var(--color-accent) !important; content: '' !important; position: absolute !important; border-radius: 0.1rem !important; margin: 0.5rem !important; }
input[type="radio"]:before { width: 1.8rem !important; height: 1.8rem !important; background: var(--color-input) !important; content: '' !important; position: absolute !important; border-radius: 50% !important; border: var(--border-input) !important; }
input[type="radio"]:checked:after { width: 0.8rem !important; height: 0.8rem !important; background: var(--color-accent) !important; content: '' !important; position: absolute !important; border-radius: 50% !important; margin: 0.5rem !important; }
button { padding: 0.8rem 1.6rem !important; color: var(--color-text-primary) !important; background: var(--color-highlight) !important; font-size: 1.4rem !important; border: none !important; border-radius: var(--radius-small) !important; text-shadow: none !important; box-shadow: var(--shadow-main) !important; display: flex !important; align-items: center !important; line-height: 1 !important; }
button:hover { background: var(--color-highlight-light) !important; }
.button_gray { width: fit-content !important; align-self: flex-end !important; border: none !important; background: none !important; }
.button_gray button { color: var(--color-text-primary-invert) !important; background: var(--color-accent) !important; }
.button.blue { background: var(--color-accent) !important; }
.icon-button { display: flex !important; align-items: center !important; background: var(--color-card) !important; color: var(--color-text-primary) !important; font-size: 1.2rem !important; padding: 0.4rem 0.8rem !important; border-radius: var(--radius-small) !important; width: fit-content !important; box-shadow: var(--shadow-main) !important; text-decoration: none !important; }
.icon-button2 { margin-left: 0.4rem !important; font-family: 'Material Icons Outlined' !important; font-size: 2rem !important; cursor: pointer !important; text-decoration: none !important; color: var(--color-text-secondary) !important; }
.icon-button:before { margin-right: 0.6rem !important; font-family: 'Material Icons Outlined' !important; font-size: 1.8rem !important; }
.icon-button.icon-feedback:before { content: 'feedback' !important; }
.icon-button.icon-analytics:before { content: 'analytics' !important; }
.icon-button.icon-today:before { content: 'today' !important; }

/* Page Specifics */
.review { padding-bottom: 3rem !important; border-radius: var(--radius-medium) !important; width: 100% !important; }
.question { margin: 0 0 1.6rem 0 !important; }
.question li { margin-left: 0.8rem !important; margin-top: 0.4rem !important; }
.question > .text { color: var(--color-text-primary) !important; }
.question label { color: var(--color-text-secondary) !important; display: flex !important; align-items: center !important; }
.comment > label { color: var(--color-text-primary) !important; margin-bottom: 0.4rem !important; }
.comment > textarea { width: 100% !important; height: 20rem !important; padding: 0.8rem 1.2rem !important; resize: none !important; }
form.que_form { margin-top: 1rem !important; }
.question_table { margin: 1.4rem 0 3rem !important; }
.question_table .text, .question_table tr:first-child { background: var(--color-table-header) !important; }
.cgrldatarow:hover { background: var(--color-table-highlight) !important; }

.span3 > .nav.nav-tabs.nav-stacked { 
    border-radius: var(--radius-medium) !important; 
    background: transparent !important;
    box-shadow: none !important; 
    overflow: hidden !important; 
}
.span3 > .nav.nav-tabs.nav-stacked:last-child { margin-bottom: 4rem !important; }
.span3 > .nav.nav-tabs.nav-stacked:last-child > li > a {
    justify-content: flex-start !important;
}
.span3 > .nav.nav-tabs.nav-stacked > li > a { 
    display: flex !important; 
    align-items: center !important; 
    justify-content: flex-start !important; 
    padding: 1.1rem 1.4rem !important; 
    background: var(--color-card) !important; 
    color: var(--color-text-primary) !important; 
    border: none !important; 
    gap: 12px !important; 
    text-align: left !important;
}
.span3 > .nav.nav-tabs.nav-stacked > li > a:hover { background: var(--color-highlight) !important; }

.span3 > .nav.nav-tabs.nav-stacked > .active:before {
    display: none !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li > a:hover {
    background: var(--color-highlight) !important;
    margin: 0 12px 4px 12px !important;
    border-radius: var(--radius-small) !important;
    width: auto !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li > a > .badge { background-color: var(--color-accent) !important; padding: 0.2rem 0 !important; color: var(--color-text-primary-invert) !important; border-radius: var(--radius-small) !important; margin: -1.2rem 0 !important; width: 2.4rem !important; font-weight: normal !important; }
.material-icons { font-family: 'Material Icons Outlined' !important; font-size: 20px !important; font-weight: normal !important; }
.span3 > .nav.nav-tabs.nav-stacked > li > a > .material-icons { margin-right: 10px !important; }

.material-icons.icon-load-doc-new {
    pointer-events: auto !important;
}

.themes .hour, .ctl_hours, .book_list .pages, .link_list .descr { color: var(--color-text-secondary) !important; }
.badge.ctl { padding: 0.2rem 0.4rem !important; background: var(--color-error) !important; border-radius: 0.4rem !important; display: inline !important; }
.tpr_part { line-height: 1.5 !important; }
.ses_part { line-height: 1.5 !important; }

/* Week Select */
.week-select { margin: 3rem auto 3.2rem !important; width: 100% !important; margin-top: 0 !important; margin-bottom: 1.5rem !important; }
.week-select h3 { display: none !important; }
.weeks { display: flex !important; justify-content: center !important; flex-wrap: wrap !important; gap: 0.6rem !important; }
.week { position: relative !important; display: flex !important; justify-content: center !important; align-items: center !important; margin: 0 !important; padding: 0 !important; width: 3.8rem !important; height: 3.8rem !important; background-color: var(--color-card) !important; box-shadow: var(--shadow-main) !important; border-radius: var(--radius-medium) !important; border: none !important; font-size: 1.2rem !important; overflow: hidden !important; transition: background 0.2s !important; }
.week:hover { background: var(--color-highlight) !important; }
.weeks > .week > a { display: flex !important; justify-content: center !important; align-items: center !important; width: 100% !important; height: 100% !important; color: var(--color-text-primary) !important; text-decoration: none !important; }

/* Базовый цвет для активной недели */
.weeks .week.current { 
    font-weight: bold !important; 
    background-color: var(--color-accent) !important; /* Берет синий или желтый из темы */
    color: var(--color-text-primary-invert) !important; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

/* Ховер на обычные недели */
.weeks .week:not(.current):hover {
    background: var(--color-highlight) !important;
    border: 1px solid var(--color-accent) !important;
}
/* Дефолтные цвета для сессии, каникул и практики */
.weeks .week.session, .weeks .week.session > a { color: var(--color-red) !important; }
.weeks .week.holiday, .weeks .week.holiday > a { color: var(--color-green) !important; }
/* Цвета фона и текста для активных сессий/каникул/практики */
.weeks .week.session.current { background: var(--color-red) !important; color: var(--color-text-primary-invert) !important; }
.weeks .week.session.current > a { color: var(--color-text-primary-invert) !important; }
.weeks .week.holiday.current { background: var(--color-green) !important; color: var(--color-text-primary-invert) !important; }
.weeks .week.holiday.current > a { color: var(--color-text-primary-invert) !important; }
.weeks .week.pract.current { background: var(--color-yellow) !important; color: var(--color-text-primary-invert) !important; }
.weeks .week.pract.current > a { color: var(--color-text-primary-invert) !important; }

.weeks .week.current, 
.weeks .week.current > a,
.weeks .week.pract.current,
.weeks .week.pract.current > a,
.weeks .week.session.current,
.weeks .week.session.current > a,
.weeks .week.holiday.current,
.weeks .week.holiday.current > a { 
    background-color: var(--color-accent) !important; 
    color: var(--color-text-primary-invert) !important; 
    font-weight: bold !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

.weeks .week.holiday > a { color: var(--color-green) !important; }
.weeks .week.session > a { color: var(--color-red) !important; }

.weeks .week.current { 
    background-color: var(--color-accent) !important; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

.weeks .week.current > a { 
    color: var(--color-text-primary-invert) !important; 
    font-weight: bold !important;
}

/* Выделение актуальной недели */
.weeks .week.actual-week a {
    color: var(--color-accent) !important;
    font-weight: 800 !important;
}

@media (min-width: 961px) {
    .mobile-menu-btn, .mobile-overlay { display: none !important; }
}

/* Timetable */
div.timetable-buttonbar { display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: wrap !important; white-space: nowrap !important; }
.timetable-btn { margin: 0 0 1.4rem 1.4rem !important; }
div.consultations { display: flex !important; align-items: center !important; float: none !important; color: var(--color-text-primary) !important; }
span.holiday { background-color: var(--color-green) !important; color: var(--color-text-primary-invert) !important; padding: 0.4rem 0.8rem !important; border-radius: 50rem !important; margin-top: 0.6rem !important; display: inline-block !important; }
.day { 
    border-radius: var(--radius-medium) !important; 
    background-color: var(--color-card) !important; 
    box-shadow: var(--shadow-main) !important; 
    overflow: hidden !important; 
    padding: 0 !important; 
    margin-bottom: 2rem !important; 
}
.span9 .day h3 { 
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    
    padding: 1.6rem 2rem !important; 
    background: var(--color-table-header) !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    
    margin: 0 !important; 
    font-size: 1.6rem !important; 
}

.span9 .day h3 .day-name {
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    text-transform: capitalize !important;
    letter-spacing: 0.3px !important;
}

.span9 .day h3 .day-date {
    font-weight: 700 !important;
    font-size: 1.25rem !important;
    color: var(--color-accent) !important;
    background: var(--color-accent-active) !important;
    padding: 0.5rem 1.4rem !important;
    border-radius: 50px !important;
}
.no_pairs { padding: 1.2rem 1.6rem 2rem !important; }
.timetable { display: flex !important; flex-direction: column !important; width: 100% !important; }
.timetable td { border: none !important; vertical-align: middle !important; padding-top: 0.2rem !important; padding-bottom: 0.2rem !important; font-size: 1.2rem !important; }
.pair_num { width: 9.6rem !important; height: 5rem !important; border: none !important; font-size: 0 !important; padding-left: 1.6rem !important; }
.pair_num .eval { font-size: 1.1rem !important; color: var(--color-text-secondary) !important; }
.pair_info { padding-right: 1.4rem !important; }
.pair_info .dis a { color: var(--color-text-primary) !important; text-decoration: none !important; font-size: 1.4rem !important; }
.pair_teacher { width: 14rem !important; text-align: right !important; padding-right: 1.6rem !important; }
.pair_teacher > a { color: var(--color-text-secondary) !important; text-decoration: none !important; }
.pair_info .aud { color: var(--color-text-secondary) !important; font-size: 1.1rem !important; }
.pair_info .aud > a:before { margin-right: 0.6rem !important; font-family: 'Material Icons Outlined' !important; content: 'videocam' !important; font-size: 1.8rem !important; }
.pair_info .aud > a > img { display: none !important; }

/* --- TEACHERS REBORN (ПРЕПОДАВАТЕЛИ) --- */

/* карточка преподавателя */
.teacher-card {
    display: flex;
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    margin-bottom: 2.4rem !important;
    padding: 2.4rem !important;
    gap: 2.4rem !important;
    align-items: flex-start !important;
    border: 1px solid transparent !important;
    transition: transform 0.2s ease !important;
}

.teacher-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-accent-active) !important;
}

/* Блок фото */
.teacher-avatar-box {
    flex-shrink: 0 !important;
    width: 110px !important;
}

.teacher-avatar-box img {
    display: block !important;
    width: 110px !important;
    height: 150px !important;
    object-fit: cover !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

/* Блок информации */
.teacher-details {
    display: flex !important;
    flex-direction: column !important;
    flex-grow: 1 !important;
    justify-content: center !important;
    min-height: 150px !important; /* Центрируем текст относительно высоты фото */
}

/* Имя */
.teacher-name-link {
    font-size: 1.8rem !important;
    font-weight: 800 !important;
    color: var(--color-accent) !important;
    margin-bottom: 0.8rem !important;
    cursor: pointer !important;
    line-height: 1.3 !important;
    text-decoration: none !important;
    width: fit-content !important;
}
.teacher-name-link:hover {
    text-decoration: underline !important;
    opacity: 0.8 !important;
}

/* Кафедра */
.teacher-dept-link {
    font-size: 1.3rem !important;
    color: var(--color-text-secondary) !important;
    margin-bottom: 1.6rem !important;
    padding-bottom: 1.6rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    cursor: pointer !important;
    width: 100% !important;
    line-height: 1.4 !important;
    display: block !important;
}
.teacher-dept-link:hover {
    color: var(--color-text-primary) !important;
}

/* Список предметов */
.teacher-subjects {
    font-size: 1.5rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
}

/* Кнопка статистики вверху */
a[href="stu.dis_stat"] {
    display: inline-flex !important;
    align-items: center !important;
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
    padding: 1.2rem 2rem !important;
    border-radius: var(--radius-medium) !important;
    text-decoration: none !important;
    font-weight: 600 !important;
    font-size: 1.3rem !important;
    margin-bottom: 2.4rem !important;
}
a[href="stu.dis_stat"]:before {
    content: 'insights';
    font-family: 'Material Icons Outlined';
    font-size: 2rem;
    margin-right: 1rem;
    color: var(--color-accent);
}

/* Мобильная адаптация */
@media (max-width: 600px) {
    .teacher-card {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
    }
    .teacher-details {
        width: 100% !important;
        min-height: auto !important;
    }
    .teacher-name-link, .teacher-dept-link {
        width: auto !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }
}

/* Адаптация под мобильные */
@media (max-width: 600px) {
    table.teacher_info tr {
        flex-direction: column !important;
        align-items: center !important;
    }
    .teacher_photo {
        padding: 2rem !important;
    }
    .teacher_desc {
        padding: 0 2rem 2rem !important;
        text-align: center !important;
    }
    .teacher_desc .chair {
        width: auto !important;
        margin: 0 auto 1.6rem !important;
    }
    .teacher_desc .dis {
        text-align: center !important;
    }
}

/* Messages */
.nav.answ, .nav.msg { padding: 1.2rem !important; border: none !important; border-radius: var(--radius-medium) !important; background: var(--color-card) !important; box-shadow: var(--shadow-main) !important; text-decoration: none !important; margin-bottom: 2rem !important; }
.nav.msg.message > .message-header { display: flex !important; justify-content: space-between !important; background-color: var(--color-highlight) !important; border-radius: var(--radius-medium) var(--radius-medium) 0 0 !important; padding: 1.8rem 2.4rem 1.8rem 2.4rem !important; }
.ord-inactive { color: var(--color-text-secondary) !important; }
.certificates-info { color: var(--color-green) !important; font-size: 1.2rem !important; display: block !important; margin-bottom: 2rem !important; }

/* Login */
.login-container { 
    display: flex !important; 
    flex-direction: column !important; 
    min-height: 100vh !important; 
    width: 100% !important;
}

.login { 
    margin: 0 !important; 
    display: flex !important; 
    align-items: center !important; 
    justify-content: center !important; 
    flex: 1 1 auto !important; 
    background: var(--color-body) !important;
    width: 100% !important;
}
.login:before, .login:after { display: none !important; }
.psu-logo {
    position: relative !important;
    content: '' !important;
    height: 20rem !important;
    width: 100% !important;
    background-image: url("https://raw.githubusercontent.com/ENAleksey/etis-extension/8bc57f7b991ba8b6a07dec05809ac8c218082db4/psu_logo.svg") !important;
    opacity: .6 !important;
    background-size: contain !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    margin-bottom: 4.8rem !important;
}
html[theme="light"] .psu-logo { filter: invert(1) !important; }
.login > form > .choose { display: block !important; padding: 0 !important; border-bottom: none !important; background: none !important; margin-bottom: 2.4rem !important; font-size: 0 !important; }
.login-actions { 
    display: flex !important; 
    align-items: center !important; 
    justify-content: space-between !important; 
    font-size: 1.4rem !important; 
    margin-top: 1.6rem !important; 
}
.login form, .form { display: flex !important; flex-direction: column !important; padding: 3.2rem !important; box-shadow: var(--shadow-main) !important; background: var(--color-card) !important; border-radius: var(--radius-large) !important; width: 36rem !important; margin: 0 auto !important; }
.footer { margin: 0 auto !important; max-width: var(--width-content) !important; padding: 2rem !important; color: var(--color-text-secondary) !important; font-size: 1.2rem !important; text-align: center !important; }

/* Tooltip */
.sign-tooltip-wrapper { position: fixed; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(var(--shadow-tooltip)); }
.sign-tooltip { padding: 0.8rem 1.6rem; max-width: 26rem; border-radius: var(--radius-large); font-size: 1.2rem; line-height: 1.8rem; text-align: center; color: var(--color-text-primary); background: var(--color-highlight); z-index: 12; }

/* --- TIMETABLE TOOLBAR --- */
.timetable-toolbar {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: stretch !important; 
    position: relative !important;
    
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;

    width: 100% !important;
    border-radius: 50px !important; 
    background-color: var(--color-card) !important;
    box-shadow: var(--shadow-main) !important;
    
    padding: 6px !important; 
    gap: 8px !important;
    margin-bottom: 2rem !important;

    /* Индикация скролла */
    background-image: 
        linear-gradient(to right, var(--color-card) 20%, rgba(255,255,255,0) 100%),
        linear-gradient(to left, var(--color-card) 20%, rgba(255,255,255,0) 100%) !important;
    background-position: left center, right center !important;
    background-repeat: no-repeat !important;
    background-size: 40px 100% !important;
    background-attachment: scroll !important;
}
.timetable-toolbar::-webkit-scrollbar { display: none; }
.timetable-toolbar > * { 
    flex: 1 0 auto !important; 
    min-width: max-content !important; 
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50px !important; 
    
    padding: 8px 16px !important; 
    margin: 0 !important;
    font-size: 1.3rem !important;
    font-weight: 500 !important;
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
    border: none !important;
    transition: all 0.2s ease !important;
    gap: 8px !important;
    cursor: pointer !important;
}
@media (max-width: 600px) {
    .timetable-toolbar > * {
        flex: 0 0 auto !important;
    }
}

.timetable-toolbar > *:hover {
    background: var(--color-highlight-light) !important;
}
.timetable-toolbar .toolbar-item {
    display: flex !important;
    align-items: center !important;
    color: var(--color-text-primary) !important;
    cursor: pointer !important;
    text-decoration: none !important;
    font-size: 1.3rem !important;
    white-space: nowrap !important;
    background: var(--color-highlight) !important;
    padding: 0.8rem 1.4rem !important;
    border-radius: var(--radius-small) !important;
    border: none !important;
    gap: 0.6rem !important;
    font-weight: 500 !important;
    transition: background 0.2s !important;
}
.timetable-toolbar .toolbar-item:hover { background: var(--color-highlight-light) !important; }

/* Кнопки-капсулы внутри тулбара */
.timetable-toolbar .toolbar-item,
.timetable-toolbar .sync-btn,
.timetable-toolbar label.toolbar-item { 
    flex: 1 1 0 !important; 
    min-width: max-content !important; 
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important; 
    border-radius: 50px !important; 
    
    padding: 8px 16px !important; 
    margin: 0 !important;
    font-size: 1.3rem !important;
    font-weight: 500 !important;
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
    border: none !important;
    transition: all 0.2s ease !important;
    gap: 8px !important;
}

.timetable-toolbar .toolbar-item:hover {
    background: var(--color-highlight-light) !important;
}

/* Тумблер для консультаций */
input[type="checkbox"].tumbler-checkbox {
    position: relative !important;
    width: 3.4rem !important;
    height: 1.8rem !important;
    margin: 0 !important;
    appearance: none !important;
    background: var(--color-input) !important;
    border-radius: 2rem !important;
    border: 1px solid var(--color-scrollbar-thumb) !important;
    cursor: pointer !important;
    transition: background 0.3s, border-color 0.3s !important;
    display: inline-flex !important;
    box-shadow: none !important;
}
input[type="checkbox"].tumbler-checkbox:before { display: none !important; }
input[type="checkbox"].tumbler-checkbox:after {
    content: '' !important;
    position: absolute !important;
    top: 0.2rem !important;
    left: 0.2rem !important;
    width: 1.2rem !important;
    height: 1.2rem !important;
    background: var(--color-text-secondary) !important;
    border-radius: 50% !important;
    transition: transform 0.3s, background 0.3s !important;
    margin: 0 !important;
}
input[type="checkbox"].tumbler-checkbox:checked {
    background: var(--color-accent) !important;
    border-color: var(--color-accent) !important;
}
input[type="checkbox"].tumbler-checkbox:checked:after {
    transform: translateX(1.6rem) !important;
    background: var(--color-white) !important;
}

/* --- MOBILE ADAPTATION --- */
@media (max-width: 960px) {
    /* 1. Нативная прокрутка */
    html, body {
        overflow-x: hidden !important;
        position: relative !important;
        height: auto !important; /* Убираем 100%, чтобы контент растягивался */
    }

    .container { max-width: 100% !important; padding: 0 !important; }

    .span9 {
        margin-left: 0 !important;
        margin-top: 2rem !important; 
        padding: 0 1rem 15rem !important;
        width: 100% !important;
        max-width: 100vw !important;
        overflow-x: hidden !important; 
        float: none !important;
        box-sizing: border-box !important;
    }

    .span9 > div[style*="float: right"] {
        float: none !important;
        width: 100% !important;
        text-align: left !important;
        margin-bottom: 1rem !important;
    }

    /* Сайдбар */
    .span3 {
        display: block !important;
        position: fixed !important;
        top: 0 !important; 
        left: 0 !important; 
        bottom: 0 !important;
        width: 280px !important; 
        max-width: 85% !important;
        height: 100vh !important; 
        margin: 0 !important;
        padding-top: 60px !important; 
        padding-bottom: calc(env(safe-area-inset-bottom, 40px) + 100px) !important;
        background: var(--color-card) !important;
        z-index: 1000000 !important; 
        transform: translateX(-105%) !important;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        overflow-y: auto !important;
        border-radius: 0 24px 24px 0 !important;
        visibility: visible !important;
    }
    .span3.mobile-active { transform: translateX(0) !important; box-shadow: 100px 0 100px rgba(0,0,0,0.5) !important; }

    /* Кнопка меню */
    .mobile-menu-btn {
        display: block !important;
        position: fixed !important;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 20px) !important; 
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 1000001 !important;
        width: 120px !important;
        height: 48px !important;
        background: var(--color-accent) !important; 
        color: var(--color-text-primary-invert) !important;
        border-radius: 24px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }


    /* Состояние: меню открыто (сжалась в кружок и уехала вправо) */
    .mobile-menu-btn.open {
        left: calc(100vw - 41px) !important; /* 15px отступ + 26px половина кружка */
        width: 52px !important;
        height: 52px !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    }

    /* Контейнеры для иконок внутри кнопки */
    .menu-btn-content {
        position: absolute !important;
        top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        display: flex !important;
        justify-content: center !important; 
        align-items: center !important; 
        gap: 8px !important;
        transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .menu-closed { opacity: 1 !important; transform: scale(1) !important; }
    .menu-open { opacity: 0 !important; transform: scale(0.5) rotate(-90deg) !important; }
    
    .mobile-menu-btn.open .menu-closed { opacity: 0 !important; transform: scale(0.5) !important; }
    .mobile-menu-btn.open .menu-open { opacity: 1 !important; transform: scale(1) rotate(0) !important; }

    .mobile-menu-btn .material-icons { font-size: 20px !important; }
    .mobile-menu-btn.open .material-icons { font-size: 24px !important; }

    .mobile-overlay {
        position: fixed !important; 
        top: 0 !important; 
        left: 0 !important; 
        right: 0 !important; 
        bottom: 0 !important;
        background: rgba(0,0,0,0.6) !important;
        z-index: 999999 !important;
        opacity: 0; 
        pointer-events: none;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(4px) !important;
        -webkit-backdrop-filter: blur(4px) !important;
    }
    .mobile-overlay.active { opacity: 1; pointer-events: auto; }

    /* 4. Горизонтальный скролл */
    .common, .teach_plan, .slimtab_nice {
        display: block !important;
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
    }

    /* Запрещаем перенос текста в ячейках, чтобы таблица стала широкой и появился скролл */
    .common td, .common th,
    .teach_plan td, .teach_plan th,
    .slimtab_nice td, .slimtab_nice th {
        white-space: nowrap !important;
        max-width: none !important;
    }

    /* 5. Улучшение расписания на мобильных (чтобы длинные названия переносились) */
    .timetable {
        display: table !important; /* Возвращаем нормальное поведение таблицы */
        width: 100% !important;
        table-layout: auto !important;
    }
    .timetable td {
        white-space: normal !important; /* Разрешаем тексту предмета переноситься на новые строки */
        word-wrap: break-word !important;
    }
    .pair_num {
        width: 8.1rem !important;
        min-width: 8.1rem !important;
        padding-right: 1rem !important;
        padding-left: 1.6rem !important; /* Ровняем по левому краю */
    }
    .pair_teacher {
        width: 35% !important;
        padding-left: 0.5rem !important;
        padding-right: 1.6rem !important; /* Ровняем по правому краю */
    }

    .week-select { 
        position: relative !important; 
        width: 100% !important; 
    }
    .week-select::before, .week-select::after {
        content: "" !important;
        position: absolute !important;
        top: 0 !important; bottom: 0 !important;
        width: 24px !important;
        z-index: 5 !important;
        pointer-events: none !important;
    }
    .week-select::before {
        left: 0 !important;
        background: linear-gradient(to right, var(--color-body) 10%, rgba(255,255,255,0)) !important;
    }
    .week-select::after {
        right: 0 !important;
        background: linear-gradient(to left, var(--color-body) 10%, rgba(255,255,255,0)) !important;
    }
    .weeks {
        display: flex !important;
        padding: 0 20px !important; /* Даем запас, чтобы можно было доскроллить крайние недели */
        margin: 0 !important;
        width: 100% !important;
        flex-wrap: nowrap !important;
        justify-content: flex-start !important;
        overflow-x: auto !important;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
    }
    .weeks::-webkit-scrollbar { display: none; }
    .week {
        flex: 0 0 auto !important;
    }

    /* Тулбар расписания на мобильном */
    .timetable-toolbar {
        display: flex !important;
        flex-direction: row !important;
        justify-content: flex-start !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;

        width: 100% !important;
        border-radius: 50px !important; 
        padding: 4px !important; 
        gap: 6px !important;
        margin-bottom: 1.5rem !important;
        background-color: var(--color-card) !important;
        
        background-image: 
            linear-gradient(to right, var(--color-card) 10%, rgba(255,255,255,0) 100%),
            linear-gradient(to left, var(--color-card) 10%, rgba(255,255,255,0) 100%) !important;
        background-position: left center, right center !important;
        background-repeat: no-repeat !important;
        background-size: 40px 100% !important;
        background-attachment: scroll !important;
    }
    [theme="dark"] .timetable-toolbar {
        background: 
            linear-gradient(to right, var(--color-card) 30%, rgba(255,255,255,0)) left center / 40px 100% no-repeat local,
            linear-gradient(to left, var(--color-card) 30%, rgba(255,255,255,0)) right center / 40px 100% no-repeat local,
            radial-gradient(farthest-side at 0 50%, rgba(0,0,0,0.5), rgba(0,0,0,0)) left center / 15px 100% no-repeat scroll,
            radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,0.5), rgba(0,0,0,0)) right center / 15px 100% no-repeat scroll !important;
        background-color: var(--color-card) !important;
    }
    .timetable-toolbar::-webkit-scrollbar { display: none; }
    .timetable-toolbar > * { 
        flex: 0 0 auto !important;
        min-width: max-content !important; 
        white-space: nowrap !important;
        display: inline-flex !important;
    }
    .timetable-toolbar .toolbar-item,
    .timetable-toolbar .sync-btn { 
        flex: 0 0 auto !important;
        min-width: max-content !important; 
        border-radius: 50px !important; 
        padding: 8px 12px !important; 
        font-size: 13px !important;
    }

    .sync-btn, .toolbar-item { padding: 0.8rem 1rem !important; background: var(--color-highlight) !important; border-radius: var(--radius-small) !important; }

    /* Убиваем встроенный inline-block оберток ЕТИСа, из-за которого ломается скролл таблиц */
    .span9 div[style*="inline-block"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
    }
    /* Горизонтальный скролл для подменю (вкладки триместров, сессий и т.д.) */
    .submenu {
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch !important;
        justify-content: flex-start !important;
        padding: 4px 0 8px 0 !important; /* Отступы для тени при клике */
        
        /* Вытягиваем за края экрана, чтобы скролл выглядел нативно */
        margin-left: -1rem !important; 
        margin-right: -1rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    .submenu::-webkit-scrollbar { 
        display: none !important; 
    }
    .submenu a, .submenu b {
        flex: 0 0 auto !important; /* Запрещаем сжиматься */
        white-space: nowrap !important; /* Запрещаем перенос текста внутри кнопок */
    }
    .wide-table-wrapper {
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important; /* Плавный скролл на iOS */
        margin-bottom: 2rem !important;
        /* Гарантируем, что обертка не шире экрана */
        max-width: calc(100vw - 2rem) !important; 
        display: block !important;
    }

    /* Особенности для таблиц в триместре (оценки) */
    .term-table-v6, .session-table-v6 {
        display: table !important; /* Оценки лучше оставить таблицей для скролла */
        width: auto !important;
        min-width: 650px !important; /* Минимальная ширина, при которой появится скролл */
        margin-bottom: 0 !important;
    }

    /* Убираем лишние отступы, которые могут "раздувать" ширину */
    .container, .container .row {
        overflow-x: hidden !important;
    }
}

@media (min-width: 961px) {
    .span3 {
        position: fixed !important;
        top: 2rem !important;      
        bottom: 2rem !important;  
        width: var(--width-aside) !important;
        margin: 0 !important;
        padding-top: 2rem !important;
        padding-bottom: 0.5rem !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        float: none !important;
        background: var(--color-card) !important;
        border-radius: var(--radius-large) !important; 
        z-index: 100 !important;
    }
}

.span3 > .nav.nav-tabs.nav-stacked > li > a,
.span3 > .nav.nav-tabs.nav-stacked > li > a * {
    color: var(--color-text-primary) !important; /* Весь текст нейтрального цвета */
    font-weight: normal !important; /* Убираем жирность (кроме активной) */
    background: transparent !important; /* Убираем красный фон у warn_menu */
    border: none !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li.active > a {
    background-color: var(--color-accent) !important; 
    color: var(--color-text-primary-invert) !important; 
    font-weight: 600 !important;
    margin: 0 12px 4px 12px !important;
    border-radius: var(--radius-small) !important;
    width: auto !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; 
}

.span3 > .nav.nav-tabs.nav-stacked > li.active > a,
.span3 > .nav.nav-tabs.nav-stacked > li.active > a:hover {
    background-color: var(--color-accent) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    margin: 0 12px 4px 12px !important;
    border-radius: var(--radius-small) !important;
    width: auto !important;
}

/* Принудительно красим текст и иконки внутри активной ссылки */
.span3 > .nav.nav-tabs.nav-stacked > li.active > a,
.span3 > .nav.nav-tabs.nav-stacked > li.active > a *,
.span3 > .nav.nav-tabs.nav-stacked > li.active > a font {
    color: var(--color-text-primary-invert) !important;
    font-weight: 700 !important; /* Делаем текст жирным */
    text-shadow: none !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li.active > a .material-icons {
    color: var(--color-text-primary-invert) !important;
    opacity: 1 !important;
}

.span3 > .nav.nav-tabs.nav-stacked > .active:before {
    display: none !important;
}

/* --- ФИКС ЗАЛИПАНИЯ: Ховер только для устройств с мышью --- */
@media (hover: hover) {
    .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:hover {
        background: var(--color-highlight) !important;
        margin: 0 12px 4px 12px !important;
        border-radius: var(--radius-small) !important;
        width: auto !important;
    }
    
    /* То же самое для обычных кнопок и контента, чтобы они не моргали под капсулой */
    .timetable-toolbar .toolbar-item:hover,
    .submenu a:hover,
    button:hover,
    .cgrldatarow:hover,
    table tbody tr:hover td {
        background-color: var(--color-highlight) !important; 
    }
}

/* Жирный текст в капсуле меню */
.mobile-menu-btn {
    font-weight: 800 !important;
    letter-spacing: 0.5px !important;
}

/* Скрываем старые овальные бейджи ЕТИСа */
.span3 > .nav.nav-tabs.nav-stacked > li > a > .badge {
    display: none !important;
}

/* Скрываем только родные бейджи ЕТИС, но оставляем кружки */
.span3 > .nav.nav-tabs.nav-stacked > li > a > .badge { display: none !important; }

.span3 li.warn_menu, .span3 li.warn_menu a {
    background: transparent !important;
    color: var(--color-text-primary) !important;
}

/* --- TIMETABLE SEPARATORS (APPLE STYLE) --- */

.timetable td {
    border: none !important;
    vertical-align: middle !important;
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    position: relative !important;
}

.timetable .pair_num {
    border-bottom: none !important;
}

/* Название предмета и аудитория — по левому краю */
.timetable .pair_info {
    text-align: left !important;
}

/* Время пары — по центру своей колонки */
.timetable .pair_num {
    text-align: center !important;
}

/* Имя преподавателя — по правому краю */
.timetable .pair_teacher {
    text-align: right !important;
}

.timetable td.pair_info {
    padding-left: 0 !important;
}

.timetable .pair_teacher .eval {
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--transition), visibility var(--transition);
    display: block;
    font-size: 1.1rem !important;
}

.timetable tr:hover .pair_teacher .eval {
    opacity: 1;
    visibility: visible;
}

.timetable .pair_num {
    width: 8.5rem !important; 
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* --- ZOOM STYLING --- */

.pair_info .aud a[href*="zoom"] {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.6rem !important; 
    
    background: rgba(45, 140, 255, 0.12) !important;
    color: #2D8CFF !important; 
    
    padding: 0.6rem 1.2rem !important;
    border-radius: 20px !important; 
    
    text-decoration: none !important;
    font-weight: 600 !important;
    font-size: 1.2rem !important;
    line-height: 1 !important;
    margin-top: 0.6rem !important;
    border: 1px solid rgba(45, 140, 255, 0.2) !important; 
    transition: all 0.2s !important;
}

.pair_info .aud a[href*="zoom"]:hover {
    background: rgba(45, 140, 255, 0.2) !important;
    transform: translateY(-1px);
}

.pair_info .aud a[href*="zoom"] img {
    display: block !important;
    width: 1.6rem !important;
    height: 1.6rem !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 4px !important; 
}

.pair_info .aud > a[href*="zoom"]:before {
    display: none !important;
}

/* --- DATE STYLING --- */
.week-date-styled {
    display: table !important;
    margin: 2.4rem auto 0 auto !important; 
    padding: 0.6rem 1.6rem !important;
    background: var(--color-card) !important;
    border-radius: 2rem !important;
    box-shadow: var(--shadow-main) !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.3rem !important;
    font-weight: 500 !important;
    text-align: center !important;
    margin-top: 1.5rem !important;
}

/* --- LOGIN HELP BUTTON --- */

.login-help-icon {
    width: 2.4rem !important;
    height: 2.4rem !important;
    border-radius: 50% !important;
    border: 1.5px solid var(--color-text-secondary) !important;
    color: var(--color-text-secondary) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    font-weight: bold !important;
    font-size: 1.4rem !important;
    transition: all 0.2s !important;
}

.login-help-icon:hover {
    color: var(--color-accent) !important;
    border-color: var(--color-accent) !important;
    background: var(--color-highlight) !important;
}

.login-help-dropdown {
    display: none !important;
    position: absolute !important;
    top: 3.5rem !important;
    right: 0 !important;
    width: 30rem !important;
    background: var(--color-card) !important;
    box-shadow: var(--shadow-dialog) !important;
    padding: 1.6rem !important;
    border-radius: var(--radius-medium) !important;
    font-size: 1.2rem !important;
    color: var(--color-text-primary) !important;
    line-height: 1.5 !important;
    z-index: 20 !important;
}
.login-help-dropdown.active { display: block !important; }
.login-help-dropdown p { margin-bottom: 1rem !important; }
.login-help-dropdown p:last-child { margin-bottom: 0 !important; }

.login-help-container {
    position: fixed !important;
    top: 2rem !important;
    right: 2rem !important;
    z-index: 1000 !important;
}

.button span {
    border: none !important;
    text-shadow: none !important;
    padding: 0 !important;
}

.login-actions button {
    border-radius: var(--radius-large) !important;
    font-weight: 600 !important;
}

input::placeholder {
    color: var(--color-text-secondary) !important;
    opacity: 1 !important;
}

/* Логотип ЕТИС в сайдбаре */
.sidebar-logo {
    font-size: 3.2rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    padding: 0 2.6rem !important; 
    margin-bottom: 2.4rem !important;
    letter-spacing: 0.5px !important;
    line-height: 1 !important;
}

/* Выпадающая карточка синхронизации в расписании */
.sync-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    padding: 2rem !important;
    margin-bottom: 2rem !important;
    box-shadow: var(--shadow-main) !important;
    font-size: 1.3rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
    animation: fadeIn 0.2s ease;
}

.sync-card h3 {
    margin-top: 0 !important;
    margin-bottom: 1.4rem !important;
    font-size: 1.4rem !important;
    font-weight: bold !important;
}

.sync-card p {
    margin-bottom: 1.6rem !important;
    color: var(--color-text-secondary) !important;
}

.sync-card #calendar {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 1rem !important;
    align-items: center !important;
}

.sync-card #calendar input[type="text"] {
    flex: 1 !important;
    min-width: 250px !important;
    margin: 0 !important;
}

.sync-card #calendar button {
    margin: 0 !important;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

/* --- MESSAGES REFINEMENT --- */

/* Пагинация (страницы) */
.message-pages {
    justify-content: center !important;
    gap: 1rem !important;
    margin: 2rem 0 !important;
}
/* Скрываем текст "Страницы" */
.message-pages li:first-child {
    display: none !important;
}

/* Оформление вложений (файлов) */
.file-attachment-link {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    background: var(--color-highlight) !important;
    padding: 8px 14px !important;
    border-radius: 20px !important;
    text-decoration: none !important;
    color: var(--color-text-primary) !important;
    font-size: 1.2rem !important;
    border: 1px solid var(--color-table-border) !important;
    transition: all 0.2s !important;
    max-width: 300px !important; 
    overflow: hidden !important;
}

.file-attachment-link .material-icons {
    color: var(--color-accent) !important;
}
.file-attachment-link span.file-name {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: block !important;
}

.file-attachment-link:hover {
    background: var(--color-highlight-light) !important;
}
.answer-btn-custom {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    border-radius: 20px !important;
    padding: 8px 18px !important;
    font-weight: 600 !important;
    font-size: 1.2rem !important;
    cursor: pointer !important;
    border: none !important;
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    flex-shrink: 0 !important; 
}
.answer-btn-custom:hover {
    background: var(--color-accent-dark, #0056b3) !important;
    color: var(--color-text-primary-invert) !important;
    opacity: 0.9;
}
.message-footer {
    display: flex !important;
    flex-wrap: nowrap !important; 
    align-items: center !important;
    gap: 10px !important;
    margin-top: 14px !important;
    padding-top: 0 !important; 
    border-top: none !important;
}

.file-attachment-link:hover {
    background: var(--color-highlight-light) !important;
    transform: translateY(-1px) !important;
}

/* Кнопка ответа */
.answer-wrapper {
    margin-top: 1.6rem !important;
    padding-top: 1.6rem !important;
    border-top: 1px solid var(--color-table-border) !important;
}
.answer-wrapper button {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    border-radius: 2rem !important;
    padding: 1rem 2rem !important;
    font-weight: 600 !important;
}

/* Текстовое поле ответа */
.nav.msg textarea {
    width: 100% !important;
    border-radius: var(--radius-medium) !important;
    padding: 1.2rem !important;
    margin-bottom: 1rem !important;
    border: 1px solid var(--color-table-border) !important;
    background: var(--color-input) !important;
}
/* --- REPLY FORM STYLING --- */

/* Контейнер формы */
div[id^="frm_"] {
    margin-top: 1.5rem !important;
    padding: 1.5rem !important;
    background: var(--color-highlight) !important;
    border-radius: var(--radius-medium) !important;
    animation: fadeInReply 0.3s ease-out !important;
}

@keyframes fadeInReply {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Текстовое поле */
div[id^="frm_"] textarea {
    width: 100% !important;
    min-height: 120px !important;
    padding: 12px !important;
    border-radius: var(--radius-small) !important;
    border: 1px solid var(--color-table-border) !important;
    background: var(--color-card) !important;
    color: var(--color-text-primary) !important;
    font-family: inherit !important;
    font-size: 1.3rem !important;
    resize: vertical !important;
    margin-bottom: 12px !important;
    transition: border-color 0.2s !important;
    box-shadow: none !important;
}

div[id^="frm_"] textarea:focus {
    border-color: var(--color-accent) !important;
    outline: none !important;
}

/* Вспомогательный текст про файлы */
.reply-helper-text {
    display: block !important;
    font-size: 1.1rem !important;
    color: var(--color-text-secondary) !important;
    margin-bottom: 15px !important;
    line-height: 1.4 !important;
}

/* Кнопка "Отправить ответ" */
.send-reply-btn {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    border-radius: 24px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    font-size: 1.3rem !important;
    border: none !important;
    cursor: pointer !important;
    transition: opacity 0.2s !important;
}

.send-reply-btn:hover {
    opacity: 0.9 !important;
}
/* --- SIDEBAR FOOTER --- */
.sidebar-footer {
    position: relative !important;
    padding: 1.6rem 2.6rem !important;
    font-size: 1.1rem !important;
    color: var(--color-text-secondary) !important;
    line-height: 1.5 !important;
    border-top: none !important;
    margin-top: 0 !important;
}

/* Рисуем новый аккуратный разделитель с отступами */
.sidebar-footer::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 1.6rem !important;
    right: 1.6rem !important;
    height: 1px !important;
    background: var(--color-table-border) !important;
}

.sidebar-footer a {
    color: var(--color-text-secondary) !important;
    text-decoration: underline !important;
    transition: color 0.2s !important;
}

.sidebar-footer a:hover {
    color: var(--color-accent) !important;
}
/* --- TIMETABLE WINDOWS --- */
.timetable-gap-row td {
    padding-top: 1rem !important; 
    padding-bottom: 1rem !important; 
    border: none !important;
    vertical-align: middle !important;
}

.timetable-gap-capsule {
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.6rem !important;
    background: rgba(45, 140, 255, 0.1) !important; 
    color: #2D8CFF !important; 
    padding: 0.5rem 1.2rem !important;
    border-radius: 50px !important; 
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    line-height: 1 !important;
    border: 1px solid rgba(45, 140, 255, 0.15) !important;
}

/* Блок с информацией о пользователе в сайдбаре */
.sidebar-user-info {
    position: relative !important;
    padding: 1.6rem 2.6rem !important;
    font-size: 1.1rem !important;
    color: var(--color-text-secondary) !important;
    line-height: 1.5 !important;
    border-top: none !important; 
    margin-top: auto !important;
}

/* Рисуем новый аккуратный разделитель с отступами */
.sidebar-user-info::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 1.6rem !important;
    right: 1.6rem !important;
    height: 1px !important;
    background: var(--color-table-border) !important;
}

.sidebar-user-info b {
    color: var(--color-text-primary) !important;
    display: block !important;
    margin-bottom: 4px !important;
    font-size: 1.2rem !important;
}

.sidebar-user-info span {
    display: block !important;
    margin-left: 0 !important;
}

/* --- ELECTRONIC RESOURCES --- */

.electr-access-info {
    width: 100% !important;
    max-width: 100% !important;
    background: rgba(0, 139, 210, 0.08) !important;
    border: 1px dashed var(--color-accent) !important;
    border-radius: var(--radius-medium) !important;
    padding: 1.6rem !important;
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 2rem !important;
    box-sizing: border-box !important;
}

/* Стили заголовков внутри таблицы ресурсов */
#resources th[colspan="3"] {
    background: var(--color-highlight) !important;
    color: var(--color-accent) !important;
    text-align: left !important;
    padding: 1.2rem 1.6rem !important;
    font-size: 1.2rem !important;
    letter-spacing: 0.5px !important;
    border-bottom: 1px solid var(--color-table-border) !important;
}

/* Стилизация логинов и паролей для удобства копирования */
#resources td:nth-child(2), 
#resources td:nth-child(3) {
    font-family: 'SF Mono', 'Cascadia Code', monospace !important;
    font-size: 1.2rem !important;
    color: var(--color-text-primary) !important;
}

#resources td:first-child a {
    font-weight: 600 !important;
}
.day .common {
    box-shadow: none !important; /* Убираем тень, так как она уже есть у .day */
    margin-bottom: 0 !important;
}

.day .common td {
    text-align: left !important; /* Названия ресурсов лучше читать по левому краю */
}

/* Сделаем колонку с паролем чуть заметнее при наведении */
.day .common td:last-child:hover {
    background: var(--color-accent-active) !important;
}
/* Отступ для первого блока ресурсов от заголовка страницы */
.resource-block:first-of-type { margin-top: 3.5rem !important; }


.resource-block {
    margin-bottom: 2.4rem !important;
}

.electr-description a {
    font-weight: bold !important;
}

/* Индикация копирования */
.copy-pass:hover {
    background-color: var(--color-accent-active) !important;
    transition: background 0.2s;
    border-radius: 4px;
}

.day.resource-block h3 {
    font-size: 1.6rem !important;        
    font-weight: 700 !important;          
    color: var(--color-text-primary) !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    padding: 1.8rem !important;
    margin: 0 !important;
}
.resource-table {
    table-layout: fixed !important;
    width: 100% !important;
}

/* Колонки: Ресурс (~60%), Логин (~20%), Пароль (~20%) */
.resource-table td:nth-child(1) { width: 60% !important; text-align: left !important; }
.resource-table td:nth-child(2) { width: 20% !important; text-align: center !important; }
.resource-table td:nth-child(3) { width: 20% !important; text-align: right !important; }

/* Особый случай для длинных строк (BOOK.RU) */
.resource-table td[colspan="2"] {
    text-align: right !important;
    width: 40% !important;
}

/* --- РЕКОМЕНДАЦИИ И СОВЕТЫ --- */
.advice-container {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    margin-top: 2.4rem !important;
}

.advice-card {
    display: flex !important;
    align-items: center !important;
    padding: 1.6rem 2rem !important;
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    gap: 16px !important;
    border: 1px solid transparent !important;
}

.advice-card:hover {
    transform: translateY(-2px);
    background: var(--color-highlight) !important;
    border-color: var(--color-accent-active) !important;
}

.advice-card .material-icons {
    font-size: 2.2rem !important;
    color: var(--color-accent) !important;
    flex-shrink: 0 !important;
}
.advice-card .material-icons::before {
    content: none !important; 
}

.cert-footer-block {
    background: var(--color-highlight) !important;
    border-radius: var(--radius-medium) !important;
    padding: 2rem !important;
    margin-top: 1.5rem !important;
    font-size: 1.3rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
}

.cert-footer-block b, .cert-footer-block strong {
    color: var(--color-red) !important;
}

.cert-footer-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
    gap: 2rem !important;
    margin-top: 4rem !important;
}

.cert-footer-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    padding: 2.4rem !important;
    box-shadow: var(--shadow-main) !important;
    display: flex !important;
    gap: 1.6rem !important;
    align-items: flex-start !important;
}

.cert-footer-card .material-icons {
    color: var(--color-accent) !important;
    font-size: 2.4rem !important;
    flex-shrink: 0 !important;
}

.cert-footer-card-content {
    font-size: 1.3rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
}

/* Убираем красный цвет, оставляем только жирность */
.cert-footer-card-content b, 
.cert-footer-card-content strong {
    color: var(--color-text-primary) !important;
    font-weight: 700 !important;
}

.cert-footer-card-content small {
    display: block !important;
    margin-top: 0.8rem !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.2rem !important;
}

.advice-card .advice-label {
    color: var(--color-text-primary) !important;
    font-size: 1.4rem !important;
    font-weight: 500 !important;
    line-height: 1.4 !important;
}

/* Иконка PDF и Видео */
.advice-card[href*=".pdf"] .material-icons::before { content: "picture_as_pdf"; }
.advice-card[href*=".mp4"] .material-icons::before { content: "play_circle_outline"; }
.advice-card:not([href*=".pdf"]):not([href*=".mp4"]) .material-icons::before { content: "article"; }

/* Специальный блок для правил выдачи справок */
.cert-alert-box {
    background: rgba(52, 199, 89, 0.1) !important;
    border: 1px solid var(--color-green) !important;
    color: var(--color-text-primary) !important;
    padding: 1.6rem 2rem !important;
    border-radius: var(--radius-medium) !important;
    font-size: 1.3rem !important;
    line-height: 1.5 !important;
    margin-bottom: 3rem !important;
}

/* Иконки для разных типов справок */
.advice-card .icon-new::before { content: "add_circle_outline"; }
.advice-card .icon-history::before { content: "assignment_turned_in"; }

/* --- SURVEYS (ОПРОСЫ) REFINEMENT --- */

.survey-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    margin-bottom: 2.5rem !important;
    padding: 0 !important;
    overflow: hidden !important;
    border: none !important;
    list-style: none !important;
}

/* Шапка карточки опроса */
.survey-card > li:first-child {
    background: var(--color-table-header) !important;
    padding: 1.8rem 5rem 1.8rem 2.4rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    cursor: pointer !important;
    position: relative !important;
    display: block !important;
}

.survey-card > li:first-child:hover {
    background: var(--color-highlight) !important;
}

/* Стрелочка только для опросов */
.survey-card > li:first-child::after {
    content: 'expand_more' !important;
    font-family: 'Material Icons Outlined' !important;
    position: absolute !important;
    right: 2rem !important;
    top: 50% !important;
    transform: translateY(-50%) rotate(0deg) !important;
    font-size: 2.2rem !important;
    color: var(--color-text-secondary) !important;
    transition: transform 0.3s ease !important;
}

.survey-card > li:first-child.is-open::after {
    transform: translateY(-50%) rotate(180deg) !important;
    color: var(--color-accent) !important;
}

/* Содержимое опроса */
.survey-card > li:nth-child(2) {
    padding: 2.4rem !important;
    background: var(--color-card) !important;
    display: block !important;
}

/* Скрываем содержимое, если есть класс hide_elem (родной для ETIS) */
.survey-card > li.hide_elem {
    display: none !important;
}

/* --- СТИЛИ ДЛЯ ОБЫЧНЫХ СООБЩЕНИЙ (чтобы они не ломались) --- */
.message-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    padding: 2rem !important;
    margin-bottom: 2rem !important;
    border: none !important;
}

/* Внутренняя структура истории (Вопрос - Ответ) */
.survey-result-item {
    margin-bottom: 2rem !important;
    padding-bottom: 1.5rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
}
.survey-result-item:last-child { border-bottom: none !important; margin-bottom: 0 !important; }

.survey-result-q {
    display: block !important;
    font-weight: 700 !important;
    font-size: 1.3rem !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 0.8rem !important;
}

.survey-result-a {
    color: var(--color-accent) !important;
    font-weight: 600 !important;
    font-size: 1.3rem !important;
    padding-left: 1.2rem !important;
    border-left: 3px solid var(--color-accent) !important;
}

/* Текст-заголовок секции */
.survey-intro-text {
    margin: 4.5rem 0 1.5rem !important;
    padding: 0 1rem !important;
    font-size: 1.3rem !important;
    line-height: 1.5 !important;
    color: var(--color-text-secondary) !important;
    font-weight: 600 !important;
    text-align: left !important;
}

/* Улучшение форм в карточках */
form.form {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    padding: 3.2rem !important;
    box-shadow: var(--shadow-main) !important;
}

/* Инпуты на этих страницах */
form.form input[type="text"], 
form.form input[type="password"] {
    display: block !important;
    width: 100% !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    padding: 1.2rem 0 !important;
    margin-bottom: 2.4rem !important;
    border-radius: 0 !important;
    font-size: 1.5rem !important;
    color: var(--color-text-primary) !important;
    transition: border-color 0.2s !important;
}

form.form input:focus {
    outline: none !important;
    border-bottom: 2px solid var(--color-accent) !important;
}

/* Оформление инфо-блока внизу (Email) */
.electr-description {
    display: block !important;
    background: var(--color-highlight) !important;
    color: var(--color-text-secondary) !important;
    border-radius: var(--radius-medium) !important;
    padding: 2.4rem !important;
    line-height: 1.6 !important;
    font-size: 1.3rem !important;
    margin-top: 4rem !important;
    margin-bottom: 2.4rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
    text-align: center !important;
}

.electr-description ul {
    list-style: none !important; /* Убираем точки */
    margin: 1rem 0 0 0 !important;
    padding: 0 !important;
}

.electr-description li {
    position: relative !important;
    padding-left: 2rem !important;
    margin-bottom: 0.8rem !important;
}

.electr-description div {
    margin-bottom: 1rem !important;
}

.electr-description li::before {
    content: "" !important;
    position: absolute !important;
    left: 0.4rem !important;
    top: 0.8rem !important;
    width: 6px !important;
    height: 6px !important;
    background-color: var(--color-accent) !important;
    border-radius: 50% !important;
}

/* Кнопка */
.button_gray {
    width: 100% !important;
    margin-top: 1rem !important;
}

.span9 ul, 
.span9 li, 
.electr-description ul, 
.electr-description li {
    list-style: none !important;
    list-style-type: none !important;
    text-indent: 0 !important;
}

.form input::placeholder {
    color: var(--color-text-secondary) !important;
    opacity: 0.7 !important;
}

/* --- АНКЕТИРОВАНИЕ (REVIEW LIST) --- */

.review-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    overflow: hidden !important;
    margin-bottom: 3rem !important;
    border: none !important;
}

.review-list {
    list-style: none !important;
    margin: 0 !important;
    padding: 0 !important;
}

.review-item {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 1.6rem 2.4rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    transition: background 0.2s ease !important;
    gap: 2rem !important;
}

.review-item:last-child {
    border-bottom: none !important;
}

.review-item:hover {
    background: var(--color-table-highlight) !important;
}

.review-dis-link {
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    line-height: 1.4 !important;
    text-decoration: none !important;
    color: var(--color-text-link) !important;
}

.review-teacher-info {
    display: flex !important;
    align-items: center !important;
    gap: 0.8rem !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.2rem !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
}

.review-teacher-info .material-icons {
    font-size: 1.8rem !important;
    opacity: 0.7 !important;
}

/* Адаптация под мобильные */
@media (max-width: 600px) {
    .review-item {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 0.8rem !important;
    }
}

/* --- СТРАНИЦА "О РЕСУРСЕ" (ARTICLE STYLE) --- */

.about-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    padding: 4rem !important; /* Больше пространства для чтения */
    margin-bottom: 3rem !important;
    max-width: 900px !important; /* Ограничиваем ширину для удобства глаз */
}

.about-card p {
    font-size: 1.5rem !important;
    line-height: 1.8 !important; /* Увеличенное межстрочное расстояние */
    color: var(--color-text-primary) !important;
    margin-bottom: 2.4rem !important;
    text-align: left !important;
}

.about-card h2 {
    margin: 4.5rem 0 2rem 0 !important;
    font-size: 2.2rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    line-height: 1.3 !important;
    letter-spacing: -0.5px !important;
}

.about-card h2:first-of-type {
    margin-top: 0 !important;
}

/* Красивый акцент для первого абзаца */
.about-card p:first-of-type {
    font-size: 1.6rem !important;
    color: var(--color-text-secondary) !important;
    font-style: italic !important;
    border-left: 4px solid var(--color-accent);
    padding-left: 2rem;
    margin-bottom: 4rem !important;
}

@media (max-width: 768px) {
    .about-card {
        padding: 2.4rem !important;
    }
}

/* --- ПОРТФОЛИО (SC_PORTFOLIO) --- */

/* Контейнер заголовка раздела */
.portfolio-header {
    display: flex !important;
    align-items: center !important;
    background-color: var(--color-card) !important;
    padding: 1.6rem !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    margin-bottom: 1rem !important;
    cursor: pointer !important;
    border: 1px solid var(--color-table-border) !important;
    height: auto !important;
    justify-content: space-between !important;

}
.portfolio-header a.dashed {
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    text-decoration: none !important;
    border: none !important;
}

.portfolio-header a.dashed {
    white-space: normal !important; /* Разрешаем перенос текста */
    word-wrap: break-word !important;
    line-height: 1.4 !important;
    border-bottom: none !important; /* Убираем пунктир для чистоты */
    text-align: left !important;
    flex: 1 1 auto !important; /* Занимает всё доступное место */
    margin-right: 1rem !important; /* Отступ до бейджа */
    display: block !important;
}

/* Бейдж-счетчик (теперь он не исчезнет) */
.portfolio-count {
    margin-left: auto !important; /* Прижимаем вправо */
    background: var(--color-accent-active) !important;
    color: var(--color-accent) !important;
    padding: 0.3rem 1rem !important;
    border-radius: 2rem !important;
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    pointer-events: none !important;
}

.portfolio-count {
    flex-shrink: 0 !important; /* Запрещаем сжимать кружок */
    margin-left: 0 !important; /* Убираем старый отступ */
    margin-right: 0.5rem !important;
}

/* Иконка стрелочки в конце */
.portfolio-header::after {
    content: 'expand_more' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 2.2rem !important;
    color: var(--color-text-secondary) !important;
    margin-left: 1.5rem !important;
}

.portfolio-header::after {
    flex-shrink: 0 !important; /* Запрещаем сжимать стрелку */
    margin-left: 0 !important;
}

/* УБИРАЕМ ПОДЛОЖКУ у раскрывающихся блоков */
div[id="pub"], div[id="pis"], div[id="agr"], 
div[id="ooo"], div[id="saw"], div[id="vkr"] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin-top: 10px !important;
    margin-bottom: 3rem !important;
}

/* Стилизация таблицы внутри раскрытого блока */
div[id] table.common {
    box-shadow: var(--shadow-main) !important;
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    overflow: hidden !important;
    margin-top: 1rem !important;
}

/* Иконка загрузки файла в таблице */
.icon-load-doc-new {
    font-family: 'Material Icons Outlined' !important;
    font-size: 2.2rem !important;
    color: var(--color-accent) !important;
    cursor: pointer !important;
    transition: transform 0.2s !important;
    display: inline-block !important;
    vertical-align: middle !important;
}
.icon-load-doc-new:hover {
    transform: scale(1.2);
}

span[id$="_cnt"] { 
    display: none !important; 
}

/* --- UI DIALOG REBORN (MODAL WINDOW) --- */

/* Контейнер самого окна */
.ui-dialog {
    background: var(--color-card) !important;
    border: none !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-dialog) !important;
    padding: 0 !important;
    overflow: hidden !important;
    z-index: 1000002 !important;
}

/* Шапка окна */
.ui-widget-header {
    background: var(--color-table-header) !important;
    border: none !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    padding: 1.6rem 2.4rem !important;
    border-radius: 0 !important;
}

.ui-dialog .ui-dialog-title {
    font-size: 1.6rem !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    margin: 0 !important;
}

/* Кнопка закрытия (крестик) */
.ui-dialog .ui-dialog-titlebar-close {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    
    width: 30px !important;
    height: 30px !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: var(--color-highlight) !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    
    /* Убиваем текст и любые потоки внутри */
    font-size: 0 !important;
    color: transparent !important;
    text-indent: -9999px !important;
    overflow: visible !important; /* Разрешаем выход за границы, чтобы не обрезалось */
    display: block !important;
}


.ui-dialog .ui-dialog-titlebar-close span,
.ui-dialog .ui-dialog-titlebar-close .ui-icon,
.ui-dialog .ui-dialog-titlebar-close .ui-button-icon-primary {
    display: none !important;
}

.ui-dialog .ui-dialog-titlebar-close::after {
    content: 'close' !important; /* Используем слово-лигатуру */
    font-family: 'Material Icons Outlined' !important;
    font-size: 20px !important;
    color: var(--color-text-secondary) !important;
    
    /* СБРОС И ЦЕНТРИРОВАНИЕ */
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important; /* Центрируем точно по осям */
    
    display: block !important;
    text-indent: 0 !important;
    visibility: visible !important;
    line-height: 1 !important;
    width: 20px !important;
    height: 20px !important;
    text-align: center !important;
    text-transform: none !important;
}

.ui-dialog .ui-dialog-titlebar-close:hover {
    background: var(--color-accent-active) !important;
}

.ui-dialog .ui-dialog-titlebar-close:hover::after {
    color: var(--color-accent) !important;
}

.ui-dialog .ui-dialog-titlebar-close * {
    display: none !important;
}

.ui-dialog .ui-dialog-titlebar-close::before {
    content: '\e5cd' !important; /* Юникод символа "close" */
    font-family: 'Material Icons Outlined' !important;
    font-size: 20px !important;
    color: var(--color-text-secondary) !important;
    display: block !important;
    /* Возвращаем видимость иконке */
    visibility: visible !important;
    line-height: 1 !important;
}

.ui-dialog .ui-dialog-titlebar-close:before {
    content: 'close' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 2.2rem !important;
    color: var(--color-text-secondary) !important;
}

.ui-dialog .ui-dialog-titlebar-close .ui-button-icon-primary,
.ui-dialog .ui-dialog-titlebar-close .ui-icon {
    display: none !important;
}

.ui-dialog .ui-dialog-titlebar-close:after {
    content: 'close' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 20px !important;
    color: var(--color-text-secondary) !important;
    display: block !important;
    text-indent: 0 !important;
}

.ui-dialog .ui-dialog-titlebar-close:hover::before {
    color: var(--color-accent) !important;
}

.ui-dialog .ui-dialog-titlebar-close:active {
    transform: translateY(-50%) scale(0.9) !important;
}

.ui-dialog .ui-dialog-titlebar-close:hover:after {
    color: var(--color-accent) !important;
}

/* Содержимое окна */
.ui-dialog .ui-dialog-content {
    padding: 2.4rem !important;
    background: var(--color-card) !important;
    color: var(--color-text-primary) !important;
    font-size: 1.3rem !important;
}

/* Стилизация формы внутри окна */
#dialog form {
    margin-top: 2rem !important;
    padding-top: 2rem !important;
    border-top: 1px solid var(--color-table-border) !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
}

#dialog p {
    margin-bottom: 1rem !important;
    color: var(--color-text-secondary) !important;
}

#dialog span {
    font-weight: 600 !important;
    color: var(--color-text-primary) !important;
}

/* Выбор файла (input type="file") */
.fileselect {
    background: var(--color-input) !important;
    padding: 1rem !important;
    border-radius: var(--radius-small) !important;
    border: 1px dashed var(--color-table-border) !important;
    width: 100% !important;
    font-size: 1.2rem !important;
    cursor: pointer !important;
}

/* Кнопка "Загрузить" */
#dialog .btn {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    border: none !important;
    border-radius: 50px !important;
    padding: 1rem 2rem !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    align-self: flex-end !important;
    transition: opacity 0.2s !important;
}

#dialog .btn:hover {
    opacity: 0.9 !important;
}

/* Затемнение фона (overlay) */
.ui-widget-overlay {
    background: rgba(0, 0, 0, 0.5) !important;
    opacity: 1 !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
}

/* Таблица файлов внутри модалки (если есть) */
#dialog table {
    width: 100% !important;
    box-shadow: none !important;
    border: 1px solid var(--color-table-border) !important;
}

/* --- CONTRACTS (ДОГОВОРЫ) --- */

.contracts-container {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
    margin-top: 2.5rem !important;
}

/* Карточка инструкции внизу */
.contract-card.instruction-footer {
    background: var(--color-card) !important;
    border: 1px solid var(--color-table-border) !important;
    box-shadow: none !important;
    opacity: 0.8;
}

.contract-card.instruction-footer:hover {
    opacity: 1;
    background: var(--color-highlight) !important;
}

.span9 > h2 {
    margin-bottom: 1rem !important;
}

/* Стиль для инструкции внизу страницы договоров */
.contracts-container + .advice-card {
    margin-top: 4rem !important;
    background: var(--color-highlight) !important; /* Делаем чуть серее, чем основные карточки */
    border: 1px dashed var(--color-table-border) !important;
    box-shadow: none !important;
}

.contract-card {
    display: flex !important;
    align-items: center !important;
    padding: 1.6rem 2rem !important;
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    gap: 1.6rem !important;
    border: 1px solid transparent !important;
    position: relative !important;
    overflow: hidden !important;
}

.contract-card:hover {
    transform: translateY(-2px) !important;
    background: var(--color-highlight) !important;
}

/* Иконка документа */
.contract-card .material-icons {
    font-size: 2.4rem !important;
    color: var(--color-accent) !important;
    flex-shrink: 0 !important;
}

.contract-content {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.4rem !important;
    flex-grow: 1 !important;
}

.contract-title {
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    line-height: 1.3 !important;
}

.contract-meta {
    font-size: 1.2rem !important;
    color: var(--color-text-secondary) !important;
}

/* Статусы */
.contract-status {
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    padding: 0.4rem 1rem !important;
    border-radius: 2rem !important;
    letter-spacing: 0.5px !important;
}

/* Действующий договор */
.contract-card.status-active {
    border-left: 4px solid var(--color-green) !important;
}
.contract-card.status-active .contract-status {
    background: rgba(52, 199, 89, 0.1) !important;
    color: var(--color-green) !important;
}

/* Расторгнутый договор */
.contract-card.status-terminated {
    opacity: 0.7 !important;
}
.contract-card.status-terminated .contract-status {
    background: var(--color-highlight) !important;
    color: var(--color-text-secondary) !important;
}

/* Инструкция (PDF) сверху */
.instruction-card-wrapper {
    margin-bottom: 3rem !important;
}

/* --- ORDERS (ПРИКАЗЫ) --- */

.orders-container {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.4rem !important;
    margin-top: 2rem !important;
}

.order-card {
    display: flex !important;
    align-items: center !important;
    padding: 1.6rem 2rem !important;
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    gap: 1.8rem !important;
    border: 1px solid transparent !important;
}

.order-card:hover {
    transform: translateX(5px) !important;
    background: var(--color-highlight) !important;
    border-color: var(--color-accent-active) !important;
}

.order-icon-box {
    width: 4.2rem !important;
    height: 4.2rem !important;
    background: var(--color-accent-active) !important;
    border-radius: 1.2rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
}

.order-icon-box .material-icons {
    color: var(--color-accent) !important;
    font-size: 2.2rem !important;
}

.order-info {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.4rem !important;
    flex-grow: 1 !important;
}

.order-meta {
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    color: var(--color-text-secondary) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

.order-title {
    font-size: 1.4rem !important;
    font-weight: 500 !important;
    color: var(--color-text-primary) !important;
    line-height: 1.4 !important;
}

/* Стили для разных типов */
.order-card[data-type="благодарность"] .order-icon-box { background: rgba(255, 204, 0, 0.15) !important; }
.order-card[data-type="благодарность"] .order-icon-box .material-icons { color: #FF9500 !important; }

/* --- BLANK FORMS (БЛАНКИ) --- */

.forms-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
    gap: 1.2rem !important;
    margin: 1.6rem 0 3rem 0 !important;
}

.form-card {
    background: var(--color-card) !important;
    padding: 1.4rem 1.6rem !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    display: flex !important;
    align-items: center !important;
    gap: 1.2rem !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    border: 1px solid transparent !important;
}

.form-card:hover {
    transform: translateY(-2px) !important;
    background: var(--color-highlight) !important;
    border-color: var(--color-accent-active) !important;
}

.form-icon-box {
    width: 4rem !important;
    height: 4rem !important;
    border-radius: 1rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
}

.form-name {
    font-size: 1.3rem !important;
    font-weight: 500 !important;
    color: var(--color-text-primary) !important;
    line-height: 1.4 !important;
    flex-grow: 1 !important;
}

.form-badges {
    display: flex !important;
    gap: 0.4rem !important;
    margin-left: auto !important;
}

/* Цвета по типам файлов */
.type-word { background: rgba(43, 87, 154, 0.1) !important; color: #2b579a !important; }
.type-excel { background: rgba(33, 115, 70, 0.1) !important; color: #217346 !important; }
.type-pdf { background: rgba(244, 15, 2, 0.1) !important; color: #f40f02 !important; }

.badge-ext {
    font-size: 0.9rem !important;
    font-weight: 800 !important;
    padding: 0.2rem 0.5rem !important;
    border-radius: 0.5rem !important;
    background: var(--color-body) !important;
    color: var(--color-text-secondary) !important;
    border: 1px solid var(--color-table-border) !important;
}

/* Стилизация заголовков секций (h3) */
.span9 > h3 {
    margin-top: 3rem !important;
    font-size: 1.6rem !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
}

/* --- DETAILED TEACH PLAN (ДЕТАЛЬНО) --- */

/* Контейнер для карточек триместров */
.calendar-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
    gap: 1.6rem !important;
    margin: 2rem 0 4rem !important;
}

.calendar-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    padding: 2rem !important;
    border: 1px solid var(--color-table-border) !important;
}

.calendar-event {
    display: flex !important;
    gap: 1.2rem !important;
    margin-bottom: 0.8rem !important;
    font-size: 1.25rem !important;
    line-height: 1.4 !important;
    align-items: flex-start !important;
}

.calendar-event .date-range {
    color: var(--color-accent) !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    width: 14.5rem !important;
}

.calendar-event .event-desc {
    color: var(--color-text-primary) !important;
}

.calendar-card h4 {
    color: var(--color-text-primary) !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    padding-bottom: 1rem !important;
    margin-bottom: 1.5rem !important;
    font-size: 1.3rem !important;
}

/* Обертка для очень широких таблиц */
.wide-table-wrapper {
    width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    margin-bottom: 3rem !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
}

.wide-table-wrapper table {
    margin-bottom: 0 !important;
    box-shadow: none !important;
    min-width: 800px !important; /* Чтобы таблица не сжималась в кашу */
}

.teach_plan td font[color="red"] {
    font-weight: 800 !important;
}

.teach_plan .bg_bold {
    background: var(--color-table-header) !important;
    font-weight: 700 !important;
}

/* --- TEACHER STATS --- */

/* Убиваем тег nobr, который мешает таблице сжиматься */
nobr {
    white-space: normal !important;
}

/* Настройка шапки для таблицы статистики */
.wide-table-wrapper table th[colspan], 
.wide-table-wrapper table th[rowspan] {
    font-size: 1rem !important;
    text-transform: uppercase !important;
    padding: 0.8rem !important;
    background: var(--color-table-header) !important;
    border: 1px solid var(--color-table-border) !important;
}

td.empty {
    background: var(--color-body) !important;
    opacity: 0.3;
}

/* Чтобы длинные названия дисциплин не растягивали ячейку бесконечно */
.wide-table-wrapper td {
    min-width: 150px;
    max-width: 300px;
    word-wrap: break-word !important;
    white-space: normal !important;
}

/* --- JOURNAL (ЖУРНАЛ ПОСЕЩЕНИЙ) --- */
.jour-container {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
}

.jour-card {
    display: flex !important;
    align-items: center !important;
    padding: 1.6rem 2rem !important;
    background: var(--color-card) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    border: 1px solid transparent !important;
    gap: 1.6rem !important;
}

.jour-card:hover {
    transform: translateX(5px) !important;
    background: var(--color-highlight) !important;
    border-color: var(--color-accent-active) !important;
}

.jour-icon-box {
    width: 4.2rem !important;
    height: 4.2rem !important;
    border-radius: 1.2rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
}

.jour-icon-box .material-icons {
    font-size: 2.2rem !important;
}

.jour-title {
    font-size: 1.4rem !important;
    font-weight: 500 !important;
    color: var(--color-text-primary) !important;
    line-height: 1.4 !important;
    flex-grow: 1 !important;
}

.jour-badge {
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    padding: 0.4rem 1rem !important;
    border-radius: 2rem !important;
    letter-spacing: 0.5px !important;
}

/* Цвета для разных типов занятий */
.jour-badge-lek { background: rgba(0, 122, 255, 0.1) !important; color: var(--color-blue) !important; }
.jour-badge-pract { background: rgba(52, 199, 89, 0.1) !important; color: var(--color-green) !important; }
.jour-badge-lab { background: rgba(255, 149, 0, 0.1) !important; color: var(--color-warning) !important; }
.jour-badge-default { background: var(--color-highlight) !important; color: var(--color-text-secondary) !important; }

/* Адаптация под темную тему */
[theme="dark"] .jour-badge-lek { background: rgba(96, 165, 250, 0.15) !important; color: #60a5fa !important; }
[theme="dark"] .jour-badge-pract { background: rgba(52, 211, 153, 0.15) !important; color: #34d399 !important; }
[theme="dark"] .jour-badge-lab { background: rgba(251, 191, 36, 0.15) !important; color: #fbbf24 !important; }

@media (max-width: 600px) {
    .jour-card {
        padding: 1.2rem 1.6rem !important;
        gap: 1.2rem !important;
    }
    .jour-badge { display: none !important; } /* Скрываем бейдж на мобилках, если не влазит */
}

/* --- LOGIN MOBILE --- */
@media (max-width: 600px) {
    .login {
        width: 100% !important;
        margin: 0 !important;
        display: flex !important;
        justify-content: center !important;
    }

    .login form, .form {
        width: 90% !important;
        max-width: 360px !important;
        margin: 0 auto !important; 
        padding: 3.2rem 2.4rem !important;
        box-sizing: border-box !important;
    }

    .login-container {
        width: 100% !important;
        display: flex !important;
        align-items: center !important; 
        justify-content: center !important; 
        min-height: 100vh !important;
    }

    /* Уточнение для логотипа на мобилке, чтобы не сплющивался */
    .psu-logo {
        height: 16rem !important; 
        margin-bottom: 2rem !important;
    }
}

/* --- JOURNAL DETAILS (ТАБЛИЦА ПОСЕЩЕНИЙ) --- */

/* Карточка информации о предмете */
.jour-info-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    padding: 2.4rem !important;
    margin-bottom: 2.4rem !important;
}

.jour-info-header {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    margin-bottom: 1.6rem !important;
    padding-bottom: 1.6rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
}

.jour-info-subject {
    font-size: 1.6rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    line-height: 1.4 !important;
}

.jour-info-group {
    font-size: 1.2rem !important;
    font-weight: 700 !important;
    color: var(--color-accent) !important;
    display: inline-block !important;
    background: var(--color-accent-active) !important;
    padding: 0.4rem 1.2rem !important;
    border-radius: 2rem !important;
    width: fit-content !important;
    letter-spacing: 0.5px !important;
}

.jour-info-teacher {
    display: flex !important;
    align-items: center !important;
    gap: 1.6rem !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.2rem !important;
    line-height: 1.4 !important;
}

.jour-info-teacher .material-icons {
    font-size: 2.4rem !important;
    color: var(--color-text-secondary) !important;
    background: var(--color-highlight) !important;
    padding: 1rem !important;
    border-radius: 50% !important;
}

.jour-info-teacher strong {
    display: block !important;
    font-size: 1.4rem !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 0.4rem !important;
}

/* Обертка для кнопки сохранения */
.jour-save-wrapper {
    margin-top: 2rem !important;
    display: flex !important;
    justify-content: flex-end !important;
}

/* Стилизация отключенной кнопки сохранения */
.answer-btn-custom:disabled,
.answer-btn-custom[disabled] {
    background: var(--color-highlight) !important;
    color: var(--color-text-secondary) !important;
    cursor: not-allowed !important;
    opacity: 0.7 !important;
    box-shadow: none !important;
}

/* Улучшения для самой таблицы посещений */
.wide-table-wrapper table th {
    white-space: nowrap !important; /* Даты не переносятся */
}
.wide-table-wrapper table td {
    white-space: nowrap !important; /* ФИО в одну строку */
}

/* --- UNIFIED MESSAGES & ANNOUNCEMENTS (ЕДИНЫЙ СТИЛЬ СООБЩЕНИЙ) --- */

.msg-container {
    display: flex !important;
    flex-direction: column !important;
    gap: 2rem !important;
    margin-top: 1rem !important;
}

.msg-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    padding: 2.4rem !important;
    border: none !important;
    margin-bottom: 2rem !important;
}

.msg-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    gap: 1.6rem !important;
    margin-bottom: 1.6rem !important;
}

.msg-sender {
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    color: var(--color-accent) !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.8rem !important;
    line-height: 1.3 !important;
}

.msg-sender .material-icons {
    font-size: 2rem !important;
    color: var(--color-accent) !important;
}

.msg-date {
    font-size: 1.2rem !important;
    color: var(--color-text-secondary) !important;
    white-space: nowrap !important;
    font-weight: 500 !important;
    padding-top: 0.2rem !important;
}

.msg-subject {
    font-size: 1.5rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 1.2rem !important;
    line-height: 1.4 !important;
}

.msg-body {
    font-size: 1.4rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
    word-wrap: break-word !important;
}

.msg-footer {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 1.2rem !important;
    margin-top: 2rem !important;
    padding-top: 1.6rem !important;
    border-top: 1px solid var(--color-table-border) !important;
}

.msg-attachments {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 1rem !important;
    flex-grow: 1 !important;
}

.nav.msg.message-card, .nav.msg.msg-card {
    margin-bottom: 2rem !important;
}

/* Пагинация сообщений */
.message-pages {
    display: flex !important;
    justify-content: center !important;
    gap: 1rem !important;
    margin: 2rem 0 !important;
    flex-wrap: wrap !important;
}
.message-pages li:first-child { display: none !important; } /* Скрываем слово "Страницы" */

/* --- АНТИ-МОРГАНИЕ --- */
.span9 > ul.nav.msg {
    display: none !important;
}

/* --- ПРИНУДИТЕЛЬНЫЙ РАЗМЕР ШРИФТА В СООБЩЕНИЯХ --- */
.msg-body {
    font-size: 1.4rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
    word-wrap: break-word !important;
}
.msg-body, .msg-body p, .msg-body span, .msg-body div, .msg-body font {
    font-size: 1.4rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
    font-family: inherit !important;
}
.msg-body a {
    font-size: 1.4rem !important;
    color: var(--color-text-link) !important;
}

/* --- ОТЗЫВЫ И АНКЕТИРОВАНИЕ (FEEDBACK FORMS) --- */

form.que_form {
    display: flex !important;
    flex-direction: column !important;
    gap: 2rem !important;
    max-width: 800px !important;
    margin-top: 0 !important;
}

/* Карточка каждого вопроса */
form.que_form .question {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    padding: 2.4rem !important;
    box-shadow: var(--shadow-main) !important;
    margin: 0 !important;
    border: none !important;
}

/* Текст вопроса */
form.que_form .question > .text {
    font-size: 1.6rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 1.6rem !important;
    line-height: 1.4 !important;
}

/* Список вариантов ответа */
form.que_form .question ul {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    margin: 0 !important;
    padding: 0 !important;
}

form.que_form .question li {
    margin: 0 !important;
}

/* Плашка варианта ответа */
form.que_form .question label {
    display: flex !important;
    align-items: center !important;
    padding: 1.2rem 1.6rem !important;
    background: var(--color-highlight) !important;
    border-radius: var(--radius-medium) !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    font-size: 1.4rem !important;
    font-weight: 500 !important;
    color: var(--color-text-primary) !important;
    border: 1px solid transparent !important;
}

form.que_form .question label:hover {
    background: var(--color-highlight-light) !important;
    border-color: var(--color-accent-active) !important;
    transform: translateX(4px) !important;
}

/* Чекбокс "Анонимно" (Одиночный вопрос) */
form.que_form .question > label[for="anonim"] {
    display: inline-flex !important;
    width: fit-content !important;
}

/* Блок текстового комментария */
form.que_form .comment {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    padding: 2.4rem !important;
    box-shadow: var(--shadow-main) !important;
    margin: 0 !important;
}

form.que_form .comment > label {
    display: block !important;
    font-size: 1.6rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 1.6rem !important;
}

form.que_form .comment > textarea {
    width: 100% !important;
    min-height: 140px !important;
    padding: 1.6rem !important;
    border-radius: var(--radius-medium) !important;
    border: 1px solid var(--color-table-border) !important;
    background: var(--color-input) !important;
    color: var(--color-text-primary) !important;
    font-size: 1.4rem !important;
    font-family: inherit !important;
    line-height: 1.5 !important;
    resize: vertical !important;
    transition: all 0.2s !important;
}

form.que_form .comment > textarea:focus {
    border-color: var(--color-accent) !important;
    outline: none !important;
    box-shadow: 0 0 0 3px var(--color-accent-active) !important;
}

/* Обертка и кнопка "Отправить" */
form.que_form .button_gray {
    margin-top: 1rem !important;
    width: 100% !important;
    text-align: left !important;
}

form.que_form #send_btn {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    border-radius: 50px !important;
    padding: 1.4rem 3.2rem !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    border: none !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: fit-content !important;
}

form.que_form #send_btn:hover:not(:disabled) {
    opacity: 0.9 !important;
    transform: translateY(-2px) !important;
}

form.que_form #send_btn:disabled {
    background: var(--color-highlight) !important;
    color: var(--color-text-secondary) !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
}

/* Красивый селект внутри вариантов ответа (например, "в понедельник") */
form.que_form select {
    margin-left: 1.2rem !important;
    padding: 0.6rem 3rem 0.6rem 1.2rem !important;
    font-size: 1.3rem !important;
    border-radius: var(--radius-small) !important;
    background-color: var(--color-card) !important;
    border: 1px solid var(--color-table-border) !important;
    color: var(--color-text-primary) !important;
    cursor: pointer !important;
    appearance: none !important;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
    background-repeat: no-repeat !important;
    background-position: right 1rem center !important;
    background-size: 1em !important;
}

/* --- FEEDBACK (ОБРАТНАЯ СВЯЗЬ) --- */
.feedback-table {
    width: 100% !important;
    margin-top: 1.6rem !important;
    border: 1px solid var(--color-table-border) !important;
    border-radius: var(--radius-small) !important;
    font-size: 1.3rem !important;
}
.feedback-table td {
    border-bottom: 1px solid var(--color-table-border) !important;
    padding: 0.8rem 1.2rem !important;
    vertical-align: middle !important;
}
.feedback-table tr:last-child td {
    border-bottom: none !important;
}
/* Первая колонка (вопрос) - посветлее */
.feedback-table td:first-child {
    color: var(--color-text-secondary) !important;
    font-weight: 500 !important;
}
/* Вторая колонка (ответ) - потемнее */
.feedback-table td:last-child {
    color: var(--color-text-primary) !important;
    font-weight: 600 !important;
    text-align: right !important;
}

/* --- RATING TABLE (РЕЙТИНГ ПРЕПОДАВАТЕЛЕЙ) --- */
#rating {
    width: auto !important; /* Убираем 100%, даем таблице занять столько, сколько нужно */
    min-width: 1500px !important; /* Гарантируем ширину, чтобы колонки не слипались */
    border-collapse: separate !important;
    border-spacing: 0 !important;
    table-layout: auto !important; /* Разрешаем браузеру самому считать ширину колонок */
}

/* Строки факультетов (lvl1) */
#rating tr.lvl1 td {
    background-color: var(--color-highlight) !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    border-top: 2px solid var(--color-table-border) !important;
    padding-top: 1.4rem !important;
    padding-bottom: 1.4rem !important;
    position: sticky !important; /* Заголовки факультетов будут прилипать (опционально) */
    left: 0;
}

/* Первая колонка (Названия кафедр) */
#rating td:first-child, #rating th:first-child {
    text-align: left !important;
    min-width: 300px !important; /* Даем достаточно места названиям */
    max-width: 400px !important;
    position: sticky !important; /* Закрепляем левую колонку при скролле */
    left: 0;
    z-index: 2;
    background-color: var(--color-card) !important; /* Чтобы текст не просвечивал */
    border-right: 1px solid var(--color-table-border) !important; /* Разделитель закрепленной области */
}

/* Отступ для кафедр */
#rating tr.lvl2 td:first-child {
    padding-left: 3rem !important;
    color: var(--color-text-secondary) !important;
    font-weight: 500 !important;
}

/* Ячейки с оценками */
#rating td:not(:first-child) {
    text-align: center !important;
    padding: 1rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    min-width: 60px !important; /* Минимальная ширина для колонок с оценками */
    white-space: nowrap !important; /* Запрещаем перенос цифр на новую строку */
}

/* Красные оценки */
#rating font[style*="color:#d00"], 
#rating font[color="#d00"] {
    color: var(--color-red) !important;
    font-weight: 800 !important;
    background: rgba(255, 59, 48, 0.1) !important;
    padding: 0.4rem 0.8rem !important;
    border-radius: 6px !important;
    display: inline-block !important; /* Чтобы фон был ровным квадратиком */
}

#rating b {
    font-weight: 600 !important;
}

/* --- MOBILE LOADING STATE --- */
.mobile-menu-btn.is-loading {
    width: 48px !important; /* Размер кружка */
    height: 48px !important;
    border-radius: 50% !important;
    padding: 0 !important;
    left: 50% !important; /* Возвращаем в центр */
    transform: translateX(-50%) !important;
}

/* Скрываем текст "Меню" в момент загрузки */
.mobile-menu-btn.is-loading .menu-btn-content span:last-child {
    display: none !important;
}

/* Гарантируем, что виден только гамбургер */
.mobile-menu-btn.is-loading .menu-closed {
    opacity: 1 !important;
    transform: scale(1) !important;
}
.mobile-menu-btn.is-loading .menu-open {
    opacity: 0 !important;
    transform: scale(0.5) !important;
}

/* --- ПРОПУЩЕННЫЕ ЗАНЯТИЯ (ABSENCE) --- */
.absence-capsule {
    display: inline-block !important;
    padding: 0.4rem 1rem !important;
    border-radius: 50px !important;
    font-weight: 700 !important;
    font-size: 1.2rem !important;
    white-space: nowrap !important;
    cursor: help !important; /* Указатель для тултипа "командировка" */
}
.absence-capsule.valid {
    background: rgba(52, 199, 89, 0.15) !important;
    color: var(--color-green) !important;
}
.absence-capsule.invalid {
    background: rgba(255, 59, 48, 0.15) !important;
    color: var(--color-red) !important;
}

.absence-summary {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
    gap: 1.6rem !important;
    margin-top: 3rem !important;
    margin-bottom: 2rem !important;
}
.absence-stat {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    padding: 2.4rem !important;
    box-shadow: var(--shadow-main) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    border: 1px solid var(--color-table-border) !important;
}
.absence-stat-val {
    font-size: 3.6rem !important;
    font-weight: 800 !important;
    line-height: 1 !important;
    margin-bottom: 0.8rem !important;
    color: var(--color-text-primary) !important;
}
.absence-stat-label {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
    color: var(--color-text-secondary) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}
.absence-stat.valid { border-color: rgba(52, 199, 89, 0.3) !important; }
.absence-stat.valid .absence-stat-val { color: var(--color-green) !important; }

.absence-stat.invalid { border-color: rgba(255, 59, 48, 0.3) !important; }
.absence-stat.invalid .absence-stat-val { color: var(--color-red) !important; }

/* --- STU.SIGNS (МОИ ОЦЕНКИ) --- */

.gpa-container {
    display: inline-flex !important;
    align-items: center !important;
    gap: 1.2rem !important;
    margin-bottom: 2.4rem !important;
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    color: var(--color-text-primary) !important;
    background: var(--color-card) !important;
    padding: 1.2rem 2rem !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-main) !important;
}

.gpa-capsule {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    padding: 0.4rem 1.6rem !important;
    border-radius: 50px !important;
    font-weight: 800 !important;
    font-size: 1.5rem !important;
}

.subject-header-flex {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-top: 3.2rem !important;
    margin-bottom: 1.2rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

.subject-header-flex h3 {
    margin: 0 !important;
    line-height: 1.4 !important;
    flex-grow: 1 !important;
}

.subject-score-capsule {
    padding: 0.6rem 1.4rem !important;
    border-radius: 50px !important;
    font-weight: 800 !important;
    font-size: 1.4rem !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    margin-left: 1.5rem !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

/* --- ОБЩИЕ СТИЛИ ТАБЛИЦ --- */
.wide-table-wrapper table td, 
.wide-table-wrapper table th,
.span9 table.common td,
.span9 table.common th {
    border-left: none !important;
    border-right: none !important;
    vertical-align: middle !important;
}

/* --- СТИЛИ ДЛЯ ПК --- */
@media (min-width: 961px) {
    /* Глобальный фикс древних оберток ЕТИСа */
    .span9 div[style*="inline-block"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
    }

    .wide-table-wrapper {
        overflow-x: auto !important; 
        border-radius: var(--radius-medium);
    }

    .wide-table-wrapper table,
    .span9 table.common {
        width: 100% !important;
        border-collapse: separate !important; 
        border-spacing: 0 !important;
        table-layout: auto !important; 
    }

    /* ШАПКА ТАБЛИЦЫ */
    .wide-table-wrapper table th,
    .span9 table.common th {
        white-space: normal !important; 
        vertical-align: bottom !important; 
        padding: 12px 16px !important; 
        font-size: 1.1rem !important; 
        font-weight: 700 !important;
        text-transform: uppercase !important;
        color: var(--color-text-secondary) !important; /* Цвет заголовков (серый) */
        border-bottom: 1px solid var(--color-table-border) !important;
        background: var(--color-card) !important;
        height: auto !important;
    }

    /* ЯЧЕЙКИ ТЕЛА */
    .wide-table-wrapper table td,
    .span9 table.common td {
        padding: 14px 16px !important; 
        font-size: 1.3rem !important; 
        line-height: 1.4 !important;
        height: auto !important;
        color: var(--color-text-primary) !important;
    }

    /* === УМНЫЕ КОЛОНКИ (V7 - ISOLATED) === */
    
    /* Общие отступы для всех таблиц .common */
    .span9 table.common td, 
    .span9 table.common th {
        padding: 1.2rem 1.6rem !important;
        line-height: 1.4 !important;
        vertical-align: middle !important;
    }

    /* ПРАВИЛА ТОЛЬКО ДЛЯ ТАБЛИЦ ОЦЕНОК (Session & Term) */
    .session-table-v6, .term-table-v6 {
        table-layout: auto !important;
    }

    /* Эти правила теперь НЕ трогают расписание */
    .session-table-v6 td:not(:first-child):not(:last-child),
    .term-table-v6 td:not(:first-child):not(:last-child) {
        width: 1% !important;
        white-space: nowrap !important;
        min-width: 90px !important;
        text-align: center !important;
    }

    /* Первая колонка в оценках (Предмет/Тема) */
    .session-table-v6 td:first-child, 
    .term-table-v6 td:first-child {
        width: auto !important;
        white-space: normal !important;
        font-weight: 600 !important;
    }

    /* СПЕЦИАЛЬНЫЙ ФИКС ДЛЯ РАСПИСАНИЯ (Timetable Grid) */
    .timetable-grid {
        table-layout: fixed !important; /* Жёсткая сетка для расписания */
        width: 100% !important;
    }

    .timetable-grid td {
        white-space: normal !important; /* ВСЕГДА разрешаем перенос текста */
        word-wrap: break-word !important;
    }

    /* Левая колонка (Время пары) */
    .timetable-grid td.pair_num {
        width: 95px !important;
        min-width: 95px !important;
        text-align: center !important;
    }

    /* Средняя колонка (Предмет) */
    .timetable-grid td.pair_info {
        width: auto !important;
        text-align: left !important;
        padding-left: 1rem !important;
    }

    /* Правая колонка (Преподаватель) */
    .timetable-grid td.pair_teacher {
        width: 160px !important;
        min-width: 140px !important;
        text-align: right !important;
        color: var(--color-text-secondary) !important;
    }
}

/* Специальные стили для таблицы пропусков */
.span9 table.common.absence-table {
    table-layout: fixed !important;
    width: 100% !important;
    min-width: 800px !important; /* Не даем слишком сильно сжаться на мобильных */
}

/* Перебиваем глобальные настройки умных колонок */
.span9 table.common.absence-table tr > th,
.span9 table.common.absence-table tr > td {
    white-space: normal !important; 
    word-wrap: break-word !important; 
    vertical-align: middle !important;
}

/* Развешиваем ширину колонок в процентах (в сумме 100%) */
.span9 table.common.absence-table tr > th:nth-child(1),
.span9 table.common.absence-table tr > td:nth-child(1) { 
    width: 5% !important; 
    text-align: center !important; 
}

.span9 table.common.absence-table tr > th:nth-child(2),
.span9 table.common.absence-table tr > td:nth-child(2) { 
    width: 15% !important; 
    text-align: center !important; 
}

.span9 table.common.absence-table tr > th:nth-child(3),
.span9 table.common.absence-table tr > td:nth-child(3) { 
    width: 35% !important; 
    text-align: left !important; 
}

.span9 table.common.absence-table tr > th:nth-child(4),
.span9 table.common.absence-table tr > td:nth-child(4) { 
    width: 25% !important; 
    text-align: left !important; 
}

.span9 table.common.absence-table tr > th:nth-child(5),
.span9 table.common.absence-table tr > td:nth-child(5) { 
    width: 20% !important; 
    text-align: left !important; 
}

/* Фикс для заголовков в Библиотеке */
.span9 h3 {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
}

/* Стилизация подзаголовков внутри таблицы (Обязательная / Дополнительная) */
.resource-table .subheader {
    background: var(--color-table-header) !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.1rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    font-weight: 700 !important;
    padding: 1rem !important;
}

/* --- LIBRARY CATALOG SEARCH --- */
.search-flex-container {
    display: flex !important;
    gap: 1.2rem !important;
    align-items: stretch !important;
    width: 100% !important;
}

/* Сброс кривых стилей ЕТИСа */
.width_setter { 
    position: static !important; 
    margin: 0 !important; 
    flex: 1 !important; 
}

.search-flex-container input[type="text"] {
    position: static !important; /* Убиваем absolute */
    width: 100% !important;
    margin: 0 !important;
    padding: 1.2rem 1.6rem !important;
    border-radius: var(--radius-small) !important;
    background: var(--color-input) !important;
    border: 1px solid var(--color-table-border) !important;
    box-shadow: none !important;
    font-size: 1.4rem !important;
}

.search-flex-container .answer-btn-custom {
    padding: 0 2.4rem !important;
    height: auto !important;
    flex-shrink: 0 !important;
}

/* Результаты поиска */
#record_list {
    margin-top: 2.4rem !important;
}

/* Фикс для индикатора загрузки */
#record_list img {
    vertical-align: middle !important;
    margin-right: 10px !important;
}

/* --- ТАБЛИЦА РАСПИСАНИЯ --- */

/* Усиливаем приоритет через html[theme], чтобы 100% перебить глобальные правила старой темы */
html[theme] table.timetable-grid,
html[theme] .span9 table.common.timetable-grid {
    table-layout: fixed !important;
    width: 100% !important;
    border-spacing: 0 !important;
    border-collapse: collapse !important;
}

/* Настройка колонок расписания */
html[theme] .timetable-grid td {
    padding: 1.2rem 0 !important; 
    white-space: normal !important;
    word-wrap: break-word !important;
}

/* 1. Колонка с временем (Левая) */
html[theme] .timetable-grid td.pair_num {
    width: 90px !important;
    min-width: 90px !important;
    text-align: center !important; /* Убиваем принудительное выравнивание по левому краю (которое создавало пустоту) */
    font-weight: 500 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}

/* 2. Колонка с предметом (Центральная) - забирает всё место */
html[theme] .timetable-grid td.pair_info {
    width: auto !important;
    padding-left: 0 !important; /* УБИРАЕМ ОТСТУП, прижимаем текст и капсулы к краю */
    padding-right: 1.6rem !important;
    text-align: left !important;
}

/* 3. Колонка с преподавателем (Правая) */
html[theme] .timetable-grid td.pair_teacher {
    width: 160px !important;
    min-width: 150px !important;
    text-align: right !important;
    padding-right: 2rem !important;
    color: var(--color-text-secondary) !important;
    position: relative !important;
    vertical-align: middle !important;
}

/* Убиваем скрытый перенос строки, который ломал центрирование */
html[theme] .timetable-grid td.pair_teacher br {
    display: none !important;
}

/* Имя преподавателя: центрируется таблицей, при наведении плавно уезжает вверх */
html[theme] .timetable-grid td.pair_teacher a:not(.eval) {
    display: inline-block !important;
    transition: transform 0.2s ease !important;
    position: relative !important;
    z-index: 2 !important;
}

html[theme] .timetable-grid tr:hover td.pair_teacher:has(.eval) a:not(.eval) {
    transform: translateY(-8px) !important;
}

/* Кнопка "Оценить занятие": висит невидимо в центре ячейки */
html[theme] .timetable-grid td.pair_teacher .eval {
    position: absolute !important;
    right: 2rem !important; /* Выравниваем по правому краю */
    top: 50% !important; /* Центрируем по вертикали */
    opacity: 0 !important;
    visibility: hidden !important;
    transform: translateY(0) !important; 
    transition: all 0.2s ease !important;
    font-size: 1.1rem !important;
    display: block !important;
    z-index: 1 !important;
}

/* При наведении кнопка появляется и отъезжает вниз, занимая место */
html[theme] .timetable-grid tr:hover td.pair_teacher .eval {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(6px) !important; 
}

/* Фикс разделительных линий (линия стартует ровно от текста предмета, без отступа) */
html[theme] .timetable-grid tr:not(:last-child) {
    background-image: linear-gradient(to right, 
        transparent 90px, 
        var(--color-table-border) 90px, 
        var(--color-table-border) calc(100% - 1.6rem), 
        transparent calc(100% - 1.6rem)
    ) !important;
    background-position: bottom !important;
    background-repeat: no-repeat !important;
    background-size: 100% 1px !important;
}

/* Убираем ховер-эффект, который мешает в расписании */
html[theme] .timetable-grid tr:hover td {
    background: transparent !important;
}

/* Фикс для строк с "Окнами" */
html[theme] .timetable-grid tr.timetable-gap-row td {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
}

/* Метки типа пары (ЛЕК, ПРАКТ, ЛАБ) */
.pair-type-badge {
    font-size: 1.05rem !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    margin-bottom: 0.6rem !important;
    line-height: 1 !important;
    display: block !important;
}

/* Цвета для разных типов занятий */
.type-badge-lek { color: var(--color-blue) !important; }
.type-badge-pract { color: var(--color-green) !important; }
.type-badge-lab { color: var(--color-warning) !important; }
.type-badge-exam { color: var(--color-red) !important; } /* На случай зачетов/экзаменов */

/* --- РАСПИСАНИЕ ДЛЯ МОБИЛЬНЫХ --- */
@media (max-width: 960px) {
    
    /* 1. Спасаем шапку с датой от обрезания */
    .span9 .day h3 {
        padding: 1.2rem 1.4rem !important;
        font-size: 1.4rem !important;
        flex-wrap: nowrap !important;
    }
    .span9 .day h3 .day-name {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
    }
    .span9 .day h3 .day-date {
        padding: 0.4rem 1rem !important;
        font-size: 1.15rem !important;
        flex-shrink: 0 !important; 
        margin-left: 0.8rem !important;
    }

    /* 2. Жёсткая сетка для таблицы */
    html[theme] .timetable-grid {
        table-layout: fixed !important; 
        width: 100% !important;
    }

    /* Левая колонка (Время) - делаем компактной */
    html[theme] .timetable-grid td.pair_num {
        width: 75px !important;
        min-width: 75px !important;
        padding-left: 1rem !important;
        padding-right: 0.5rem !important;
        font-size: 1.1rem !important;
    }

    /* Центральная колонка (Предмет) - сохраняем удачный мобильный вид */
    html[theme] .timetable-grid td.pair_info {
        width: auto !important; 
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
    }

    /* Правая колонка (Преподаватель) */
    html[theme] .timetable-grid td.pair_teacher {
        width: 95px !important;
        min-width: 95px !important;
        padding-right: 1.4rem !important;
        padding-left: 0.5rem !important;
        font-size: 1.1rem !important;
        text-align: right !important;
        word-wrap: break-word !important; 
    }

    /* Выравниваем выезжающую по тапу кнопку под мобильный отступ */
    html[theme] .timetable-grid td.pair_teacher .eval {
        right: 1.4rem !important;
    }

    /* Адаптируем разделительную линию под мобильную ширину 75px */
    html[theme] .timetable-grid tr:not(:last-child) {
        background-image: linear-gradient(to right, 
            transparent calc(75px + 0.5rem), 
            var(--color-table-border) calc(75px + 0.5rem), 
            var(--color-table-border) calc(100% - 1rem), 
            transparent calc(100% - 1rem)
        ) !important;
    }
}

/* ========================================================= */
/* --- УЧЕБНО-МЕТОДИЧЕСКИЙ КОМПЛЕКС (stu.tpr) --- */
/* ========================================================= */

/* Список тем */
.themes {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    margin-bottom: 3rem !important;
}

.theme {
    display: flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 0.8rem !important;
    line-height: 1.5 !important;
}

/* Заголовок семестра (верхний уровень) */
.theme[style*="padding-left: 0px"] {
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
}
.theme[style*="padding-left: 0px"] a {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
}

/* Обычные темы (с отступом) */
.theme[style*="padding-left: 25px"] {
    padding-left: 2rem !important;
}

.theme a {
    font-size: 1.4rem !important;
    color: var(--color-accent) !important;
    text-decoration: none !important;
    transition: opacity 0.2s !important;
}
.theme a:hover {
    opacity: 0.8 !important;
}

/* Часы */
.theme .hour {
    font-size: 1.2rem !important;
    color: var(--color-text-secondary) !important;
}

/* --- АКЦЕНТНЫЙ (СИНИЙ) БЕЙДЖ --- */
.badge.ctl {
    background: var(--color-accent-active) !important; 
    color: var(--color-accent) !important;            
    border: 1px solid var(--color-accent) !important; 
    padding: 0.2rem 0.8rem !important;
    border-radius: 50px !important;
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    display: inline-flex !important;
    align-items: center !important;
    opacity: 0.9 !important;
}

/* Ссылки на вопросы */
.tpr_part > a {
    display: inline-flex !important;
    font-size: 1.4rem !important;
    color: var(--color-accent) !important;
    margin-bottom: 2rem !important;
    text-decoration: none !important;
}
.tpr_part > a:hover { text-decoration: underline !important; }

/* Текстовые блоки показателей оценивания */
.tpr_part > div:not([style]) {
    font-size: 1.3rem !important;
    line-height: 1.6 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 0.6rem !important;
}

/* --- ОБЕРТКА ТАБЛИЦЫ (СКРОЛЛ И ОТСТУПЫ) --- */
.wide-table-wrapper {
    width: 100% !important;
    overflow-x: auto !important; /* Включаем горизонтальный скролл */
    -webkit-overflow-scrolling: touch !important;
    margin-bottom: 3rem !important; /* Отступ переносим сюда */
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    background: var(--color-card) !important;
}

/* Сама таблица */
.tpr_part table {
    width: 100% !important;
    min-width: 600px !important; /* МИНИМАЛЬНАЯ ШИРИНА: если экран меньше, появится скролл */
    background: transparent !important;
    border-collapse: collapse !important;
    margin: 0 !important; /* Убираем "подбородок" у самой таблицы */
    box-shadow: none !important; /* Тень теперь у wrapper'а */
}

.tpr_part table td {
    padding: 1.6rem 2rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    font-size: 1.3rem !important;
    line-height: 1.5 !important;
    vertical-align: middle !important;
    color: var(--color-text-primary) !important;
    
    white-space: normal !important; 
    word-wrap: break-word !important; 
}

/* Убираем линию у последней строки */
.tpr_part table tr:last-child td {
    border-bottom: none !important;
}

/* Первая колонка таблицы (Оценка) */
.tpr_part table td:first-child {
    width: 25% !important;
    min-width: 140px !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    border-right: 1px solid var(--color-table-border) !important;
    background: var(--color-highlight) !important; /* Чуть выделяем колонку заголовков */
}

.tpr_part table td:last-child {
    color: var(--color-text-secondary) !important;
}

/* --- ПОИСК ПРЕПОДАВАТЕЛЕЙ --- */
/* Контейнер поиска */
.teacher-search-wrapper {
    margin: 1rem 0 3rem 0 !important;
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
}

/* Капсула (теперь видимая всегда) */
.search-capsule {
    position: relative !important;
    width: 100% !important;
    max-width: 400px !important;
    display: flex !important;
    align-items: center !important;
    background: var(--color-card) !important; /* Белый фон */
    border: 1px solid var(--color-table-border) !important;
    border-radius: 22px !important;
    padding: 0 16px !important;
    height: 44px !important;
    box-shadow: var(--shadow-main) !important;
}

/* Поле ввода внутри капсулы */
.search-capsule .search-input {
    width: 100% !important;
    background: transparent !important; /* Убираем фон самого инпута */
    border: none !important;
    box-shadow: none !important; /* Убираем синюю тень из глобальных стилей */
    padding: 0 0 0 32px !important; /* Отступ только слева для лупы */
    margin: 0 !important;
    height: 100% !important;
    font-size: 1.6rem !important;
    color: var(--color-text-primary) !important;
}

/* Сдвигаем лупу чуть левее */
.search-capsule .search-icon {
    position: absolute !important;
    left: 12px !important;
    color: var(--color-text-secondary) !important;
    font-size: 20px !important;
}

/* Ссылка статистики внизу */
.stats-link-bottom {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    margin: 4rem auto 2rem !important;
    padding: 1.2rem 2rem !important;
    background: var(--color-highlight) !important;
    border-radius: 12px !important;
    color: var(--color-text-secondary) !important;
    text-decoration: none !important;
    font-size: 1.3rem !important;
    width: fit-content !important;
    transition: all 0.2s ease !important;
}

.stats-link-bottom:hover {
    color: var(--color-accent) !important;
    background: var(--color-accent-active) !important;
}

/* Список учителей */
.teachers-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.6rem !important;
}

.no-results-msg {
    text-align: center !important;
    padding: 3rem !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.5rem !important;
}

/* Фикс для таблиц библиотеки (чтобы текст не наезжал) */
.resource-table td, .common td {
    white-space: normal !important; /* Разрешаем перенос текста */
    word-wrap: break-word !important;
}

/* Поиск в библиотеке (фикс прозрачности и отступов) */
.library-search-wrap {
    background: var(--color-card) !important;
    border: 1px solid var(--color-table-border) !important;
    border-radius: 50px !important;
    padding: 6px 6px 6px 20px !important;
    display: flex !important;
    align-items: center !important;
    margin-bottom: 30px !important;
    box-shadow: var(--shadow-main) !important;
}

.library-search-wrap input {
    flex: 1 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 8px 0 !important;
    margin: 0 !important;
    font-size: 1.4rem !important;
    color: var(--color-text-primary) !important;
}

.library-search-wrap .search-icon {
    margin-right: 10px !important;
    color: var(--color-text-secondary) !important;
}

/* Фикс наслоения текста в библиотеке */
.library-subject-block table, 
#record_list table {
    table-layout: auto !important; /* Разрешаем колонкам адаптироваться */
    width: 100% !important;
}

.library-subject-block td, 
#record_list td {
    white-space: normal !important; /* Принудительный перенос строк */
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    line-height: 1.4 !important;
    vertical-align: top !important;
}

/* Принудительный сброс для всех таблиц в библиотеке */
.span9 .wide-table-wrapper table,
.span9 table.resource-table,
.span9 table.common {
    table-layout: auto !important; 
    width: 100% !important;
    border-collapse: collapse !important;
}

.span9 .wide-table-wrapper td,
.span9 .wide-table-wrapper th {
    white-space: normal !important; /* РАЗРЕШАЕМ ПЕРЕНОС */
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    line-height: 1.5 !important;
    vertical-align: top !important;
    padding: 12px 10px !important;
}

/* Колонки: РЕКОМЕНДУЕМАЯ ЛИТЕРАТУРА */
.library-subject-block table td:nth-child(1) { width: 70% !important; text-align: left !important; }
.library-subject-block table td:nth-child(2) { width: 10% !important; text-align: center !important; }
.library-subject-block table td:nth-child(3) { width: 20% !important; text-align: left !important; }

/* Колонки: КАТАЛОГ */
#record_list table td:nth-child(1) { width: 65% !important; text-align: left !important; }
#record_list table td:nth-child(2) { width: 10% !important; text-align: center !important; }
#record_list table td:nth-child(3) { width: 25% !important; text-align: left !important; }

/* Сбрасываем фиксированную сетку */
.span9 .wide-table-wrapper table.library-history-table,
.span9 .wide-table-wrapper table.resource-table {
    table-layout: auto !important;
    width: 100% !important;
}

/* Принудительный перенос текста для первой колонки (Название книги) */
.span9 .wide-table-wrapper table.library-history-table td:first-child,
.span9 .wide-table-wrapper table.resource-table td:first-child,
.span9 .wide-table-wrapper table.common td:first-child {
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    text-align: left !important;
    line-height: 1.5 !important;
    min-width: 250px !important; /* Чтобы колонка не схлопывалась */
}

/* Колонки с датами (Выданные книги)*/
.span9 table.library-history-table td:not(:first-child) {
    white-space: nowrap !important;
    text-align: center !important;
    width: 120px !important;
}

/* --- ТОТАЛЬНЫЙ ФИКС ТОЧЕК УВЕДОМЛЕНИЙ --- */

/* 1. Точка в сайдбаре (ПК и Мобайл меню) */
.span3 > .nav.nav-tabs.nav-stacked > li > a .badge-point {
    display: block !important;
    width: 8px !important;
    height: 8px !important;
    min-width: 8px !important;
    min-height: 8px !important;
    background-color: #FF3B30 !important; /* Насыщенный красный */
    border-radius: 50% !important;
    margin-left: auto !important; /* Прижимает к правому краю ссылки */
    margin-right: 4px !important;
    flex-shrink: 0 !important;
    align-self: center !important;
    border: none !important;
    box-shadow: 0 0 4px rgba(255, 59, 48, 0.4) !important;
}

/* Фикс: чтобы во флекс-контейнере текст не выталкивал точку */
.span3 > .nav.nav-tabs.nav-stacked > li > a {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    overflow: visible !important;
}

.sidebar-link-text {
    flex: 1 1 auto !important;
    min-width: 0 !important; /* Позволяет тексту сжиматься, не выдавливая точку */
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* 2. Точка на мобильной кнопке (Капсула) */
.mobile-notify-dot {
    position: absolute !important;
    /* Центрируем идеально */
    top: 50% !important;
    left: 42px !important; /* Чуть правее иконки бутерброда */
    transform: translateY(-160%) scale(0) !important; /* Смещаем чуть выше центра иконки */
    
    width: 10px !important;
    height: 10px !important;
    background-color: #FF3B30 !important;
    border-radius: 50% !important;
    border: 2px solid #007AFF !important; /* Цвет капсулы, чтобы точка выглядела "впаянной" */
    z-index: 100 !important;
    pointer-events: none !important;
    opacity: 0 !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

/* Цвет рамки точки в темной теме */
[theme="dark"] .mobile-notify-dot {
    border-color: #4B89DC !important;
}

/* Показ точки при наличии обновлений */
.mobile-menu-btn.has-updates .mobile-notify-dot {
    opacity: 1 !important;
    transform: translateY(-160%) scale(1) !important;
}

/* Скрываем точку, когда меню открыто */
.mobile-menu-btn.open .mobile-notify-dot {
    display: none !important;
}

/* Убираем подчеркивание в капсулах-кнопках */
.answer-btn-custom, .answer-btn-custom:hover {
    text-decoration: none !important;
}

/* --- LIVE TIMETABLE INDICATORS (TRAFFIC LIGHT) --- */
@keyframes pulse-live {
    0% { transform: scale(0.9); box-shadow: 0 0 0 0 var(--pulse-color); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 0, 0, 0); }
    100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

.live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 10px;
    vertical-align: middle;
    position: relative;
    z-index: 10;
}

/* ЗЕЛЕНАЯ - Пара идет (безопасное время) */
.live-dot.active {
    --pulse-color: rgba(52, 199, 89, 0.4);
    background-color: var(--color-green) !important;
    animation: pulse-live 2s infinite;
}

/* ЖЕЛТАЯ - Пара скоро начнется (приготовься) */
.live-dot.soon {
    --pulse-color: rgba(255, 204, 0, 0.4);
    background-color: var(--color-yellow) !important;
    animation: pulse-live 1.5s infinite;
}

/* КРАСНАЯ - Пара скоро закончится (завершение) */
.live-dot.ending {
    --pulse-color: rgba(255, 59, 48, 0.4);
    background-color: var(--color-red) !important;
    animation: pulse-live 1s infinite; /* Пульсирует быстрее */
}

/* Для заголовка дня подгоняем отступ */
.day-name .live-dot {
    margin-top: -3px;
}

/* --- ANALYTICS MODAL --- */
.analytics-modal {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.95);
    background: var(--color-card); border-radius: var(--radius-large);
    box-shadow: var(--shadow-dialog); z-index: 1000003;
    width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
    opacity: 0; visibility: hidden; transition: all 0.2s ease-out;
}
.analytics-modal.active { opacity: 1; visibility: visible; transform: translate(-50%, -50%) scale(1); }
.analytics-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    z-index: 1000002; opacity: 0; visibility: hidden; transition: all 0.2s ease-out;
}
.analytics-overlay.active { opacity: 1; visibility: visible; }
.stat-box {
    background: var(--color-highlight); padding: 1.6rem;
    border-radius: var(--radius-medium); display: flex; flex-direction: column; gap: 0.6rem;
}
.stat-box-title { font-size: 1.15rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
.stat-box-value { font-size: 1.6rem; color: var(--color-text-primary); font-weight: 800; line-height: 1.3;}
.stat-box-value.good { color: var(--color-green); }
.stat-box-value.bad { color: var(--color-red); }
.analytics-btn:hover { transform: scale(1.02); opacity: 0.9; }

/* --- ФИКС ПЕРЕНОСА ТРИМЕСТРОВ НА ПК И МОБАЙЛ --- */
.submenu a, .submenu b {
    flex: 0 0 auto !important; /* Запрещаем сжимать кнопки */
    white-space: nowrap !important; /* Запрещаем перенос текста на 2 строки */
}

/* --- LEADERBOARD (ТОП ПРЕДМЕТОВ) --- */
.leaderboard-list { display: flex; flex-direction: column; gap: 1rem; }
.leaderboard-item { 
    display: flex; align-items: center; gap: 1.4rem; 
    background: var(--color-highlight); padding: 1.2rem 1.6rem; 
    border-radius: var(--radius-medium); transition: transform 0.2s;
}
.leaderboard-item:hover { transform: translateX(4px); }
.leaderboard-rank { 
    font-size: 1.6rem; font-weight: 800; width: 3.6rem; height: 3.6rem; 
    display: flex; align-items: center; justify-content: center; 
    border-radius: 50%; background: var(--color-card); color: var(--color-text-primary); 
    flex-shrink: 0; box-shadow: var(--shadow-main); 
}
.rank-1 { background: linear-gradient(135deg, #FFD700, #FDB931) !important; color: #fff !important; }
.rank-2 { background: linear-gradient(135deg, #E0E0E0, #BDBDBD) !important; color: #fff !important; }
.rank-3 { background: linear-gradient(135deg, #FFB870, #CD7F32) !important; color: #fff !important; }

.leaderboard-info { flex-grow: 1; min-width: 0; }
.leaderboard-name { 
    font-size: 1.3rem; font-weight: 700; color: var(--color-text-primary); 
    white-space: normal; line-height: 1.3; margin-bottom: 0.4rem;
}
.leaderboard-meta { font-size: 1.2rem; color: var(--color-text-secondary); }
    `;

    // Внедряем стили
    const injectStyles = (css) => {
    const style = document.createElement('style');
    style.innerHTML = css;
    if (document.head) {
        document.head.appendChild(style);
    } else {
        // Если head еще не готов, ждем его появления
        const observer = new MutationObserver(() => {
            if (document.head) {
                document.head.appendChild(style);
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true });
    }
};
injectStyles(styles);


    // ==========================================
    // 2. ВНЕДРЕНИЕ JS ЛОГИКИ
    // ==========================================
    let theme = 'auto';
    let prefersColorSchemeMedia;

    if (window.matchMedia) {
        prefersColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    }

    function setDarkTheme(e) {
        document.documentElement.setAttribute('theme', e.matches ? 'dark' : 'light');
    }

    function setSystemThemeDetection() {
        if (window.matchMedia) {
            prefersColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
            document.documentElement.setAttribute('theme', prefersColorSchemeMedia.matches ? 'dark' : 'light');
            prefersColorSchemeMedia.addEventListener('change', setDarkTheme);
        }
    }

    function removeSystemThemeDetection() {
        if (window.matchMedia) {
            prefersColorSchemeMedia.removeEventListener('change', setDarkTheme);
        }
    }

    function detectTheme() {
        if (localStorage.getItem('theme')) {
            theme = localStorage.getItem('theme');
            if (theme == 'auto') {
                setSystemThemeDetection();
            } else {
                document.documentElement.setAttribute('theme', theme);
            }
        } else {
            theme = 'auto';
            setSystemThemeDetection();
        }
    }

    function switchTheme(e) {
        if (theme == 'auto') {
            theme = 'light';
            e.srcElement.innerHTML = e.srcElement.innerHTML.replace('Системная', 'Светлая');
            document.documentElement.setAttribute('theme', theme);
            removeSystemThemeDetection();
        } else if (theme == 'light') {
            theme = 'dark';
            e.srcElement.innerHTML = e.srcElement.innerHTML.replace('Светлая', 'Темная');
            document.documentElement.setAttribute('theme', theme);
        } else if (theme == 'dark') {
            theme = 'auto';
            e.srcElement.innerHTML = e.srcElement.innerHTML.replace('Темная', 'Системная');
            setSystemThemeDetection();
        }

        localStorage.setItem('theme', theme);
    }

    detectTheme();

    function createTooltipTriangle() {
        const xmlns = 'http://www.w3.org/2000/svg'

        const svg = document.createElementNS(xmlns, 'svg');
        svg.setAttributeNS(null, 'width', '15')
        svg.setAttributeNS(null, 'height', '9')
        svg.setAttributeNS(null, 'viewBox', '0 0 15 9')
        svg.setAttributeNS(null, 'fill', 'none')
        svg.classList.add('sign-tooltip-triangle')

        const path = document.createElementNS(xmlns, 'path')
        path.classList.add('tooltipTriangle')
        path.setAttributeNS(null, 'd', 'M6.79289 7.79289L0.707107 1.70711C0.0771419 1.07714 0.523308 0 1.41421 0H13.5858C14.4767 0 14.9229 1.07714 14.2929 1.70711L8.20711 7.79289C7.81658 8.18342 7.18342 8.18342 6.79289 7.79289Z')

        svg.appendChild(path)
        return svg
    }

    function addViewport() {
        // Проверяем, нет ли уже такого тега
        if (!document.querySelector('meta[name="viewport"]')) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1';
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
    }

    // Запускаем при загрузке документа
    function init() {
        addViewport();
        setIcon();
        stylePages();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Установка иконки
    function setIcon() {
        // Удаляем существующие иконки сайта, чтобы они не конфликтовали
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach(el => el.remove());

        const icon = document.createElement('link');
        icon.rel = 'icon';
        icon.type = 'image/png';
        icon.href = 'https://raw.githubusercontent.com/defl-orator/etis-reborn/cf8b9cf9ab49c0eb14de7d2fdf32e5697004a13a/img/logo.png';
        document.querySelector('head').appendChild(icon);
    }

    function initMobileMenu() {
        if (document.querySelector('.mobile-menu-btn') || document.querySelector('.login')) return;

        const sidebar = document.querySelector('.span3');
        if (!sidebar) return;

        const menuBtn = document.createElement('div');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = `
            <div class="menu-btn-content menu-closed">
                <span class="material-icons">menu</span>
                <span class="mobile-notify-dot"></span> 
                <span>Меню</span>
            </div>
            <div class="menu-btn-content menu-open">
                <span class="material-icons">arrow_forward</span>
            </div>
        `;
        document.body.appendChild(menuBtn);

        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        sidebar.parentNode.insertBefore(overlay, sidebar);

        function toggleMenu(show) {
            if (show) {
                sidebar.classList.add('mobile-active');
                overlay.classList.add('active');
                menuBtn.classList.add('open');
            } else {
                sidebar.classList.remove('mobile-active');
                overlay.classList.remove('active');
                menuBtn.classList.remove('open');
            }
        }

        // preventDefault() предотвращает "призрачные клики" и залипание ховера на элементах под кнопкой
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            const isOpen = sidebar.classList.contains('mobile-active');
            toggleMenu(!isOpen);
        });

        overlay.addEventListener('click', (e) => {
            e.preventDefault(); // Тоже блокируем проваливание клика сквозь затемнение
            toggleMenu(false);
        });

        // Логика при клике на ссылку
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('mobile-active'); 
                overlay.classList.remove('active');       
                menuBtn.classList.remove('open');         
                menuBtn.classList.add('is-loading');      
            });
        });
    }

    function updateLiveTimetable() {
        // Проверяем, на той ли мы неделе
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('p_week')) {
            const actualWeek = localStorage.getItem('etis_actual_week');
            if (urlParams.get('p_week') !== actualWeek) return;
        }

        const now = new Date();
        const currentDay = now.getDay(); // 0 - вс, 1 - пн...
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        const todayName = daysMap[currentDay];

        // Настройки времени (в минутах)
        const SOON_START_THRESHOLD = 20; // Желтый: за сколько минут до начала показывать
        const SOON_END_THRESHOLD = 15;   // Красный: за сколько минут до конца показывать

        // 1. Ищем сегодняшний день
        document.querySelectorAll('.day').forEach(dayBlock => {
            const dayHeader = dayBlock.querySelector('.day-name');
            if (!dayHeader) return;

            // Очищаем старые точки
            dayBlock.querySelectorAll('.live-dot').forEach(dot => dot.remove());

            if (dayHeader.textContent.trim() === todayName) {
                // Добавляем точку в заголовок дня (просто индикатор "сегодня")
                const dayDot = document.createElement('span');
                dayDot.className = 'live-dot active';
                // Убираем пульсацию у точки дня, чтобы не отвлекала
                dayDot.style.animation = 'none'; 
                dayHeader.appendChild(dayDot);

                // 2. Ищем текущую или ближайшую пару
                dayBlock.querySelectorAll('.timetable-grid tr').forEach(row => {
                    const timeEl = row.querySelector('.eval');
                    if (!timeEl) return;

                    const startTimeParts = timeEl.textContent.split(':');
                    const startMins = parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
                    const endMins = startMins + 90; // Стандартная пара 1.5 часа

                    const timeToStart = startMins - currentTime;
                    const timeToEnd = endMins - currentTime;

                    if (currentTime >= startMins && currentTime <= endMins) {
                        // Пара идет сейчас
                        if (timeToEnd <= SOON_END_THRESHOLD) {
                            // Осталось мало времени -> КРАСНЫЙ
                            addDot(row, 'ending');
                        } else {
                            // Времени еще много -> ЗЕЛЕНЫЙ
                            addDot(row, 'active');
                        }
                    } else if (timeToStart <= SOON_START_THRESHOLD && timeToStart > 0) {
                        // До пары осталось немного -> ЖЕЛТЫЙ
                        addDot(row, 'soon');
                    }
                });
            }
        });

        function addDot(row, type) {
            const target = row.querySelector('.pair_num');
            if (target && !target.querySelector('.live-dot')) {
                const dot = document.createElement('span');
                dot.className = `live-dot ${type}`;
                
                // Добавим подсказку при наведении
                let title = "";
                if (type === 'active') title = "Пара идет";
                if (type === 'soon') title = "Скоро начнется";
                if (type === 'ending') title = "Скоро закончится";
                dot.title = title;

                target.appendChild(dot);
            }
        }
    }

    // Модификация стилей страниц
    function stylePages() {
        initMobileMenu();
        const page = window.location.pathname.split('/').pop();

        // Style Login Page
        const login = document.querySelector('body > div.login');
        if (login) {
            document.body.innerHTML = '<div class ="login-container">' + document.body.innerHTML + '</div>';
            const loginContainer = document.querySelector('div.login-container');
            const loginForm = document.getElementById('form');
            const loginItems = document.querySelector('#form > div.items');

            // 1. Логотип и очистка заголовков
            if (page != 'stu_email_pkg.send_r_email') {
                const chooseDiv = document.querySelector('div.choose');
                if(chooseDiv) chooseDiv.remove();
                
                const psuLogo = document.createElement('div');
                psuLogo.className = 'psu-logo';
                loginForm.prepend(psuLogo);
            }

            // 2. Сбор и скрытие "лишнего" текста
            let helpTextContent = "";
            
            // Текст из футера (про студентов 1 курса и телефон)
            const oldFooter = document.querySelector('div.header_message');
            if (oldFooter) {
                // Сохраняем текст для тултипа
                helpTextContent += `<p>${oldFooter.innerHTML}</p>`;
                oldFooter.remove(); // Удаляем футер
            }

            // Текст внутри формы (обычно телефон техподдержки дублируется)
            // Ищем текстовые узлы внутри items
            const walker = document.createTreeWalker(loginItems, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const nodesToRemove = [];
            while(node = walker.nextNode()) {
                if (node.textContent.includes('2396870') || node.textContent.includes('технической поддержки')) {
                    // Добавляем уникальный текст, если его еще нет
                    if (!helpTextContent.includes(node.textContent.trim())) {
                         helpTextContent += `<p>${node.textContent.trim()}</p>`;
                    }
                    nodesToRemove.push(node);
                }
            }
            nodesToRemove.forEach(n => n.remove());
            // Также удаляем пустые br
            loginItems.querySelectorAll('br').forEach(br => br.remove());


            // 3. Создание кнопки "Вопрос"
            if (helpTextContent) {
                const helpContainer = document.createElement('div');
                helpContainer.className = 'login-help-container';
                
                const helpIcon = document.createElement('div');
                helpIcon.className = 'login-help-icon';
                helpIcon.textContent = '?';
                
                const helpDropdown = document.createElement('div');
                helpDropdown.className = 'login-help-dropdown';
                helpDropdown.innerHTML = helpTextContent;

                // Логика клика
                helpIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    helpDropdown.classList.toggle('active');
                });

                // Закрытие при клике снаружи
                document.addEventListener('click', () => {
                    helpDropdown.classList.remove('active');
                });
                helpDropdown.addEventListener('click', (e) => e.stopPropagation());

                helpContainer.appendChild(helpIcon);
                helpContainer.appendChild(helpDropdown);
                
                document.body.appendChild(helpContainer);
            }


            // 4. Стандартная стилизация полей и кнопок
            const loginActions = document.createElement('div');
            loginActions.className = 'login-actions';
            loginItems.appendChild(loginActions);

            if (page != 'stu_email_pkg.send_r_email') {
                let el = loginItems.querySelector('a');
                if (el) {
                    el.className = 'forgot-password';
                    loginActions.appendChild(el);
                }
            }

            let sbmt = document.getElementById('sbmt');
            if(sbmt) loginActions.appendChild(sbmt);

            const items = loginItems.querySelectorAll('div.item');
            items.forEach(item => {
                const errorMessage = item.querySelector('div.error_message');
                if (errorMessage) {
                    loginContainer.prepend(errorMessage);
                    item.remove();
                }

                let input = item.querySelector('input');
                let label = item.querySelector('label');
                if (input && label) {
                    // Переносим текст лейбла прямо в нативный плейсхолдер
                    input.placeholder = label.textContent.trim();
                    label.remove(); // Удаляем сам текстовый лейбл, чтобы не мешался
                }
            });

        } else {
            // Фикс для меню-вкладок (Submenu) - оборачиваем текст в <b> для применения стилей
            const submenus = document.querySelectorAll('.submenu');
            submenus.forEach(menu => {
                // Извлекаем элементы из span.submenu-item, которые мешают сетке
                menu.querySelectorAll('.submenu-item').forEach(span => {
                    const link = span.querySelector('a');
                    if (link) {
                        span.replaceWith(link);
                    } else {
                        const b = document.createElement('b');
                        b.textContent = span.textContent.trim();
                        span.replaceWith(b);
                    }
                });

                // Очистка текстовых узлов и мусора
                Array.from(menu.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        let text = node.textContent.replace(/&nbsp;|\u00A0/g, '').trim();
                        if (text) {
                            let b = document.createElement('b');
                            b.textContent = text;
                            menu.replaceChild(b, node);
                        } else {
                            node.remove();
                        }
                    } else if (node.tagName === 'BR') {
                        node.remove();
                    } else if (node.tagName !== 'A' && node.tagName !== 'B') {
                        if (!node.querySelector('a')) {
                            let b = document.createElement('b');
                            b.textContent = node.textContent.trim();
                            menu.replaceChild(b, node);
                        }
                    }
                });
            });
            // Центрирование активного элемента подменю (вкладки) на мобильных устройствах
            if (window.innerWidth <= 960) {
                submenus.forEach(menu => {
                    const activeItem = menu.querySelector('b'); // Активный триместр обернут в <b>
                    if (activeItem) {
                        setTimeout(() => {
                            const containerWidth = menu.offsetWidth;
                            const itemWidth = activeItem.offsetWidth;
                            const itemLeft = activeItem.offsetLeft;
                            
                            const scrollTarget = itemLeft - (containerWidth / 2) + (itemWidth / 2);
                            
                            menu.scrollTo({
                                left: scrollTarget,
                                behavior: 'smooth'
                            });
                        }, 300);
                    }
                });
            }
            // Style Sidebar
            const sidebar = document.querySelector("div.span3");
            if (sidebar) {
                // 1. ФИКС ХОВЕРА (ЖЕСТКАЯ ФИКСАЦИЯ)
                const sidebarStyles = document.createElement('style');
                sidebarStyles.innerHTML = `
                    /* Единый стиль для всех состояний */
                    .span3 > .nav.nav-tabs.nav-stacked > li > a {
                        margin: 0 12px 4px 12px !important;
                        padding: 10px 14px !important;
                        border-radius: var(--radius-small) !important;
                        width: auto !important;
                        border: 1px solid transparent !important;
                        transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease !important;
                        transform: translateZ(0); /* Аппаратное ускорение */
                    }
                    /* Ховер - меняем только фон */
                    .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:hover {
                        background: var(--color-highlight) !important;
                        margin: 0 12px 4px 12px !important; /* Удерживаем отступ */
                    }
                    /* Активный элемент */
                    .span3 > .nav.nav-tabs.nav-stacked > li.active > a {
                        margin: 0 12px 4px 12px !important;
                    }
                    /* Скрываем лишние списки, так как мы всё перенесем в первый */
                    .span3 > ul.nav.nav-tabs.nav-stacked:not(:first-of-type) {
                        display: none !important;
                    }
                `;
                document.head.appendChild(sidebarStyles);

                // 2. Логотип
                if (!sidebar.querySelector('.sidebar-logo')) {
                    const logo = document.createElement('div');
                    logo.className = 'sidebar-logo';
                    logo.textContent = 'ЕТИС';
                    sidebar.prepend(logo);
                }

                // 3. Инфо о студенте
                const originalInfo = document.querySelector('.navbar-static-top .span12 > span');
                if (originalInfo && !sidebar.querySelector('.sidebar-user-info')) {
                    const userInfoDiv = document.createElement('div');
                    userInfoDiv.className = 'sidebar-user-info';
                    const nameText = originalInfo.childNodes[0].textContent.trim();
                    const subInfo = Array.from(originalInfo.querySelectorAll('span')).map(s => s.textContent.trim());
                    userInfoDiv.innerHTML = `
                        <b>${nameText}</b>
                        ${subInfo.map(info => `<span>${info}</span>`).join('')}
                    `;
                    const sidebarFooter = sidebar.querySelector('.sidebar-footer');
                    if (sidebarFooter) sidebar.insertBefore(userInfoDiv, sidebarFooter);
                    else sidebar.appendChild(userInfoDiv);
                }

                // 4. ПОДГОТОВКА ВСЕХ ЭЛЕМЕНТОВ
                // Собираем ВСЕ li со всех списков в один массив
                const allNavs = sidebar.querySelectorAll('ul.nav.nav-tabs.nav-stacked');
                const mainNav = allNavs[0]; 
                let allListItems = [];
                
                // Флаг глобальных уведомлений для мобильной кнопки
                let globalHasNotifications = false;

                allNavs.forEach(nav => {
                    nav.querySelectorAll('li').forEach(li => {
                        const href = li.querySelector('a')?.getAttribute('href') || '';
                        if (!href.includes('choose_dis') && !href.includes('fcl_choice')) {
                            allListItems.push(li);
                        }
                    });
                });

                // Создаем пункт "Тема"
                const themeLi = document.createElement("li");
                themeLi.className = 'theme-switcher-item';
                const themeLink = document.createElement("a");
                themeLink.style.cursor = 'pointer';
                themeLink.href = "#theme-switch"; 
                themeLink.appendChild(document.createTextNode('Тема: ' + ((theme == 'auto') ? 'Системная' : ((theme == 'dark') ? 'Темная' : 'Светлая'))));
                themeLink.addEventListener('click', switchTheme, false);
                themeLi.appendChild(themeLink);
                allListItems.push(themeLi);

                // Функция иконок
                const getIconForHref = (href) => {
                    if (href === '#theme-switch') return 'brightness_6';
                    if (href.includes('teach_plan')) return 'school';
                    if (href.includes('ebl_choice')) return 'check_circle_outline';
                    if (href.includes('timetable')) return 'calendar_today'; 
                    if (href.includes('signs')) return 'assignment_turned_in';
                    if (href.includes('absence')) return 'event_busy';
                    if (href.includes('orders')) return 'assignment';
                    if (href.includes('library')) return 'local_library';
                    if (href.includes('teachers')) return 'people';
                    if (href.includes('est_pkg.show_list')) return 'forum';
                    if (href.includes('group_tt')) return 'playlist_add_check'; 
                    if (href.includes('announces')) return 'announcement';
                    if (href.includes('teacher_notes')) return 'mail';
                    if (href.includes('ses')) return 'account_balance';
                    if (href.includes('advice')) return 'lightbulb';
                    if (href.includes('electr')) return 'public';
                    if (href.includes('cert_pkg')) return 'description'; 
                    if (href.includes('contract_list')) return 'receipt';
                    if (href.includes('blank_forms')) return 'insert_drive_file';
                    if (href.includes('portfolio')) return 'folder_shared';
                    if (href.includes('about')) return 'info';
                    if (href.includes('term_test')) return 'rate_review';
                    if (href.includes('special_est_list')) return 'poll';
                    if (href.includes('change_pass')) return 'vpn_key';
                    if (href.includes('change_email')) return 'alternate_email';
                    if (href.includes('change_pr_page')) return 'account_box';
                    if (href.includes('logout')) return 'exit_to_app';
                    return 'chevron_right'; 
                };

                const allowedDotHrefs = ['stu_ann.announces', 'stu.teacher_notes', 'est_pkg.show_list'];

                // Обрабатываем каждый элемент
                allListItems.forEach(li => {
                    const a = li.querySelector('a');
                    if (!a) return;
                    const href = a.getAttribute('href') || '';
                    let itemHasNotification = false;

                    // 1. ПРОВЕРКА УВЕДОМЛЕНИЙ (Парсинг текста)
                    Array.from(a.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const match = node.textContent.match(/\s*\(([^)]+)\)\s*$/);
                            if (match) {
                                const counterStr = match[1];
                                const counts = counterStr.split('/');
                                const lastCount = counts[counts.length - 1].trim();

                                if (lastCount !== '0') {
                                    itemHasNotification = true;
                                }
                                node.textContent = node.textContent.replace(/\s*\([^)]+\)\s*$/, '');
                            }
                        }
                    });

                    // Проверка родного бейджа ЕТИСа
                    const etisBadge = a.querySelector('.badge');
                    if (etisBadge) {
                        if (etisBadge.textContent.trim() !== '0') {
                            itemHasNotification = true;
                        }
                        etisBadge.remove(); 
                    }

                    // 2. ПЕРЕСБОРКА СТРУКТУРЫ ССЫЛКИ
                    const iconName = getIconForHref(href);
                    const pureText = a.textContent.trim();
                    a.innerHTML = ''; 

                    const iconSpan = document.createElement('span');
                    iconSpan.className = 'material-icons';
                    iconSpan.textContent = iconName;
                    iconSpan.style.marginRight = '12px';
                    iconSpan.style.flexShrink = '0';
                    a.appendChild(iconSpan);

                    const textSpan = document.createElement('span');
                    textSpan.className = 'sidebar-link-text';
                    textSpan.textContent = pureText;
                    a.appendChild(textSpan);

                    // 3. ДОБАВЛЕНИЕ ТОЧКИ И ГЛОБАЛЬНОГО ФЛАГА
                    const isAllowed = allowedDotHrefs.some(target => href.includes(target)) || href.includes('term_test');

                    if (itemHasNotification && isAllowed) {
                        globalHasNotifications = true;
                        const dot = document.createElement('span');
                        dot.className = 'badge-point';
                        a.appendChild(dot);
                    }
                });
                // ВКЛЮЧАЕМ КРАСНУЮ ТОЧКУ НА МОБИЛЬНОЙ КНОПКЕ
                if (globalHasNotifications) {
                    console.log('Включаем точку на мобильной кнопке');
                    const mobileBtn = document.querySelector('.mobile-menu-btn');
                    if (mobileBtn) {
                        mobileBtn.classList.add('has-updates');
                    }
                }

                // 5. ГРУППИРОВКА И СОРТИРОВКА
                // Очищаем главный список
                mainNav.innerHTML = '';

                // Карта порядка групп (как вы просили)
                const groupsOrder = [
                    // 1. Учеба
                    ['teach_plan', 'ebl_choice'], 
                    // 2. Успеваемость (без журнала)
                    ['timetable', 'signs', 'absence'], 
                    // 3. Коммуникация
                    ['announces', 'teacher_notes', 'teachers', 'est_pkg.show_list'], 
                    // 4. Бюрократия + Журнал
                    ['orders', 'cert_pkg', 'contract_list', 'blank_forms', 'portfolio', 'group_tt'], 
                    // 5. Ресурсы
                    ['library', 'electr', 'advice', 'ses', 'about'],
                    // 6. Опросы
                    ['term_test', 'special_est_list', 'оцените дистанционное'], 
                    // 7. Настройки (Тема, Пароль, Email, Профиль, Выход)
                    ['#theme-switch', 'change_pass', 'change_email', 'change_pr_page', 'logout']
                ];

                const usedItems = new Set();

                groupsOrder.forEach((groupPatterns, index) => {
                    let itemsAddedInThisGroup = 0;

                    groupPatterns.forEach(pattern => {
                        // Ищем элемент, соответствующий паттерну
                        const li = allListItems.find(item => {
                            if (usedItems.has(item)) return false;
                            const h = item.querySelector('a')?.getAttribute('href') || '';
                            const t = item.textContent.toLowerCase();
                            
                            // Спец. проверка для опросов по тексту, т.к. ссылки могут быть одинаковыми
                            if (pattern === 'оцените дистанционное') return t.includes('дистанционн');
                            
                            return h.includes(pattern);
                        });

                        if (li) {
                            mainNav.appendChild(li);
                            usedItems.add(li);
                            itemsAddedInThisGroup++;
                        }
                    });

                    // Добавляем разделитель ПОСЛЕ группы, если это не последняя группа
                    if (index < groupsOrder.length - 1) {
                        const separator = document.createElement('div');
                        separator.style.height = '1px';
                        separator.style.background = 'var(--color-table-border)';
                        separator.style.margin = '1rem 1.6rem 1.4rem 1.6rem';
                        mainNav.appendChild(separator);
                    }
                });

                // Если остались какие-то пункты, которые не попали в группы (новые фичи ЕТИСа)
                const remaining = allListItems.filter(li => !usedItems.has(li));
                if (remaining.length > 0) {
                     const separator = document.createElement('div');
                     separator.style.height = '1px';
                     separator.style.background = 'var(--color-table-border)';
                     separator.style.margin = '1rem 1.6rem 1.4rem 1.6rem';
                     mainNav.appendChild(separator);
                     
                     remaining.forEach(li => mainNav.appendChild(li));
                }

                // 6. Восстановление скролла и активного класса
                requestAnimationFrame(() => {
                    const top = sessionStorage.getItem("sidebar-scroll");
                    if (top) sidebar.scrollTop = parseInt(top, 10);
                    window.addEventListener("beforeunload", () => {
                        sessionStorage.setItem("sidebar-scroll", Math.round(sidebar.scrollTop));
                    });
                });

                const currentFullUrl = window.location.pathname.split('/').pop() + window.location.search;
                let bestMatch = null;
                let maxMatchLength = -1;

                mainNav.querySelectorAll('li').forEach(li => {
                    li.classList.remove('active');
                    const href = li.querySelector('a')?.getAttribute('href');
                    if (!href || href.startsWith('#')) return;

                    if (currentFullUrl.startsWith(href)) {
                        if (href.length > maxMatchLength) {
                            maxMatchLength = href.length;
                            bestMatch = li;
                        }
                    }
                });

                if (bestMatch) bestMatch.classList.add('active');
                else {
                    const currentBase = currentFullUrl.split('?')[0].split('.').pop();
                    mainNav.querySelectorAll('li').forEach(li => {
                        const href = li.querySelector('a')?.getAttribute('href') || '';
                        if (currentBase.length > 3 && href.includes(currentBase)) li.classList.add('active');
                    });
                }

                // Подвал
                if (!sidebar.querySelector('.sidebar-footer')) {
                    const footer = document.createElement('div');
                    footer.className = 'sidebar-footer';
                    footer.innerHTML = 'Designed by <a href="https://vk.com/defl_orator1" target="_blank">Masalkin Nikolai</a> based on <a href="https://vk.com/etis20" target="_blank">ETIS 2.0</a>';
                    sidebar.appendChild(footer);
                }
            }

            // Main page content
            const span9 = document.querySelector('div.span9');
            const urlParams = new URLSearchParams(window.location.search);
            const pageMode = urlParams.get('p_mode');

            const warning = document.querySelector('div.warning');
            if (warning && span9) {
                span9.prepend(warning);
            }

            let el, btn, img;

            // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ КРАСИВОЙ ДАТЫ
            // Превращает "24.02.2026 08:32:33" в "24.02 в 08:32"
            const formatEtisDate = (rawStr) => {
                if (!rawStr) return '';
                const match = rawStr.match(/(\d{2}\.\d{2})\.\d{4}\s(\d{2}:\d{2})/);
                return match ? `${match[1]} в ${match[2]}` : rawStr;
            };

            switch (page) {
                case 'stu.teach_plan': {
                    const params = new URLSearchParams(window.location.search);
                    const isAdvanced = params.get('p_mode') === 'advanced' || !params.has('p_mode');
                    const isChooseDis = params.get('p_mode') === 'choose_dis';
                    const submenu = span9.querySelector('.submenu');
                    
                    // 1. Ищем кнопку оценки (для краткого/детального планов)
                    const planEvalBtn = span9.querySelector('a[onclick*="cust.est_plan_form_stu"], a[href*="cust.est_plan_form_stu"]');

                    // 2. Ищем номер учебного плана (для вкладки "дисциплины по выбору")
                    const tpInfo = Array.from(span9.querySelectorAll('div')).find(d => 
                        d.textContent.includes('Учебный план') && d.textContent.trim().length < 30 && d.parentNode === span9
                    );

                    // --- КНОПКА ОЦЕНКИ В SUBMENU (Оставляем там, она обычно короткая) ---
                    if (planEvalBtn && submenu) {
                        planEvalBtn.className = 'answer-btn-custom';
                        planEvalBtn.style.cssText = `margin-left: auto; text-decoration: none !important; padding: 0.6rem 1.4rem !important; font-size: 1.2rem !important; height: fit-content; white-space: nowrap; display: inline-flex; align-items: center;`;
                        planEvalBtn.innerHTML = '<span class="material-icons" style="font-size:1.6rem; margin-right:6px">auto_awesome</span> Оценить план';
                        submenu.appendChild(planEvalBtn);
                    }

                    // --- ПЕРЕНОС НОМЕРА ПЛАНА К ЗАГОЛОВКУ ТАБЛИЦЫ ---
                    if (tpInfo && isChooseDis) {
                        const targetH3 = Array.from(span9.querySelectorAll('h3')).find(h => h.textContent.includes('Блоки дисциплин'));
                        
                        if (targetH3) {
                            // Создаем контейнер как в "Оценках"
                            const headerFlex = document.createElement('div');
                            headerFlex.className = 'subject-header-flex';
                            headerFlex.style.marginTop = '2rem';
                            
                            // Создаем капсулу
                            const capsule = document.createElement('div');
                            capsule.className = 'subject-score-capsule';
                            capsule.style.background = 'var(--color-highlight)';
                            capsule.style.color = 'var(--color-text-secondary)';
                            capsule.style.border = '1px solid var(--color-table-border)';
                            capsule.style.boxShadow = 'none';
                            
                            const tpNumber = tpInfo.textContent.replace(/Учебный план/i, '').trim();
                            capsule.innerHTML = `<span class="material-icons" style="font-size:1.4rem; vertical-align: middle; margin-right:4px; opacity:0.7">info</span> План №${tpNumber}`;
                            
                            // Собираем конструкцию
                            targetH3.parentNode.insertBefore(headerFlex, targetH3);
                            headerFlex.appendChild(targetH3);
                            headerFlex.appendChild(capsule);
                            
                            tpInfo.remove(); // Удаляем старый текст
                        }
                    }

                    // Чистка мусора сверху
                    span9.querySelectorAll('br').forEach((br, i) => { if(i < 3) br.remove(); });

                    if (isAdvanced) {
                        // --- ЛОГИКА ДЕТАЛЬНОГО ПЛАНА (КАРТОЧКИ) ---
                        const calendarGrid = document.createElement('div');
                        calendarGrid.className = 'calendar-grid';
                        const headers = Array.from(span9.querySelectorAll('b')).filter(b => b.textContent.toLowerCase().includes('триместр'));

                        headers.forEach(header => {
                            const card = document.createElement('div');
                            card.className = 'calendar-card';
                            const h4 = document.createElement('h4');
                            h4.textContent = header.textContent.toUpperCase();
                            card.appendChild(h4);
                            let next = header.parentElement.tagName === 'P' ? header.parentElement : header;
                            let current = next.nextSibling;
                            const toRem = [header, header.parentElement];
                            while (current && current.tagName !== 'TABLE' && !(current.querySelector && current.querySelector('b')?.textContent.toLowerCase().includes('триместр'))) {
                                let nxt = current.nextSibling;
                                if (current.nodeType === 1 && (current.tagName === 'DIV' || current.tagName === 'P')) {
                                    const row = document.createElement('div');
                                    row.className = 'calendar-event';
                                    const txt = current.textContent.trim();
                                    const m = txt.match(/^(\d{2}\.\d{2}\.\d{4}\s-\s\d{2}\.\d{2}\.\d{4})(.*)/);
                                    if (m) row.innerHTML = `<span class="date-range">${m[1]}</span><span class="event-desc">${m[2].trim()}</span>`;
                                    else if (txt.length > 5) row.innerHTML = `<span class="event-desc">${txt}</span>`;
                                    card.appendChild(row);
                                    toRem.push(current);
                                }
                                current = nxt;
                            }
                            if (card.children.length > 1) calendarGrid.appendChild(card);
                            toRem.forEach(el => el?.remove?.());
                        });

                        const mainTitle = Array.from(span9.querySelectorAll('h3')).find(h => h.textContent.includes('Календарный учебный график'));
                        if (mainTitle) mainTitle.after(calendarGrid);

                        span9.querySelectorAll('table.teach_plan').forEach(table => {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            table.parentNode.insertBefore(wrapper, table);
                            wrapper.appendChild(table);
                        });
                    }

                    if (isChooseDis) {
                        span9.querySelectorAll('table.common').forEach(table => {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            table.parentNode.insertBefore(wrapper, table);
                            wrapper.appendChild(table);
                        });
                    }
                    break;
                }

                case 'stu.tpr': {
                    // 1. Очищаем мусорные теги <br>, чтобы не ломали отступы
                    span9.querySelectorAll('br').forEach(br => br.remove());

                    // 2. Красиво оформляем главный заголовок
                    const h2 = span9.querySelector('h2');
                    if (h2) {
                        // Разделяем техническую надпись и название предмета
                        const parts = h2.innerHTML.split(/<br\s*\/?>/i);
                        if (parts.length > 1) {
                            h2.innerHTML = `
                                <span style="font-size: 1.2rem; color: var(--color-text-secondary); display: block; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.8rem;">
                                    ${parts[0]}
                                </span>
                                <span style="font-size: 2.2rem; font-weight: 800; line-height: 1.3; color: var(--color-text-primary);">
                                    ${parts[1].replace(/«/g, '').replace(/»/g, '')}
                                </span>
                            `;
                        }
                        h2.style.marginBottom = '2.4rem';
                    }

                    // 3. Стилизуем кнопку "Оценить" (если она есть)
                    const estimateLink = span9.querySelector('a[href*="cust.estimate_tpr_form"]');
                    if (estimateLink) {
                        estimateLink.className = 'icon-button icon-feedback';
                        estimateLink.style.display = 'inline-flex';
                        estimateLink.style.marginBottom = '3rem';
                        estimateLink.innerHTML = 'Оставить отзыв'; 
                    }

                    // 4. Оборачиваем таблицы в контейнер для скролла на мобильных
                    const tables = span9.querySelectorAll('.tpr_part table');
                    tables.forEach(table => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        wrapper.style.boxShadow = 'none'; // Тень мы уже задали самой таблице в CSS
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                        
                        // Чистим старые инлайновые стили ячеек
                        table.querySelectorAll('td').forEach(td => td.removeAttribute('style'));
                    });

                    break;
                }

                case 'stu.teachers': {
                    // 1. Сохраняем ссылку на статистику и чистим span9
                    const statsLink = span9.querySelector('a[href="stu.dis_stat"]');
                    // Удаляем всё старое (br, скрипты, пустые тексты)
                    span9.querySelectorAll('br, script, style').forEach(el => el.remove());

                    // 2. Создаем капсулу поиска
                    const searchWrapper = document.createElement('div');
                    searchWrapper.className = 'teacher-search-wrapper';
                    searchWrapper.innerHTML = `
                        <div class="search-capsule">
                            <span class="material-icons search-icon">search</span>
                            <input type="text" class="search-input" placeholder="Поиск">
                        </div>
                    `;
                    span9.prepend(searchWrapper);

                    // 3. Создаем контейнер для списка
                    const listContainer = document.createElement('div');
                    listContainer.className = 'teachers-list';
                    span9.appendChild(listContainer);

                    // 4. Переносим таблицы в карточки внутри списка
                    const tables = span9.querySelectorAll('table.teacher_info');
                    tables.forEach(table => {
                        const img = table.querySelector('.teacher_photo img');
                        const nameDiv = table.querySelector('.teacher_name');
                        const chairDiv = table.querySelector('.chair');
                        const disDiv = table.querySelector('.dis');

                        // Извлекаем чистый текст для отображения
                        const nameText = nameDiv ? nameDiv.textContent.trim() : '';
                        const chairText = chairDiv ? chairDiv.textContent.trim() : '';
                        const subjectsText = disDiv ? disDiv.textContent.trim() : '';

                        // Сохраняем onClick события для картинок (расписания)
                        let nameClick = '', chairClick = '';
                        if (nameDiv && nameDiv.querySelector('img')) nameClick = nameDiv.querySelector('img').getAttribute('onclick');
                        if (chairDiv && chairDiv.querySelector('img')) chairClick = chairDiv.querySelector('img').getAttribute('onclick');

                        const card = document.createElement('div');
                        card.className = 'teacher-card';
                        
                        // Формируем строку поиска: все в нижний регистр, убираем лишние пробелы
                        const searchString = `${nameText} ${chairText} ${subjectsText}`.toLowerCase().replace(/\s+/g, ' ');
                        card.setAttribute('data-search', searchString);

                        card.innerHTML = `
                            <div class="teacher-avatar-box">
                                <img src="${img ? img.src : ''}" loading="lazy">
                            </div>
                            <div class="teacher-details">
                                <div class="teacher-name-link" onclick="${nameClick}">${nameText.replace('Расписание преподавателя', '')}</div>
                                <div class="teacher-dept-link" onclick="${chairClick}">${chairText.replace('Расписание кафедры', '')}</div>
                                <div class="teacher-subjects">${disDiv ? disDiv.innerHTML : ''}</div>
                            </div>
                        `;
                        listContainer.appendChild(card);
                        table.remove();
                    });

                    // 5. Перемещаем ссылку статистики ВНИЗ после списка
                    if (statsLink) {
                        statsLink.className = 'stats-link-bottom';
                        span9.appendChild(statsLink);
                    }

                    // 6. Сообщение "не найдено"
                    const noResults = document.createElement('div');
                    noResults.className = 'no-results-msg';
                    noResults.textContent = 'Преподаватель не найден';
                    noResults.style.display = 'none';
                    listContainer.after(noResults);

                    // 7. ЛОГИКА ФИЛЬТРАЦИИ
                    const input = searchWrapper.querySelector('.search-input');
                    input.addEventListener('input', (e) => {
                        const term = e.target.value.toLowerCase().trim();
                        let foundCount = 0;
                        
                        const allCards = listContainer.querySelectorAll('.teacher-card');
                        allCards.forEach(card => {
                            const content = card.getAttribute('data-search');
                            // Если строка поиска пустая или найдено совпадение
                            if (term === '' || content.includes(term)) {
                                card.style.display = 'flex'; // Показываем (flex, так как убрали !important в CSS)
                                foundCount++;
                            } else {
                                card.style.display = 'none'; // Скрываем
                            }
                        });

                        // Показываем сообщение "ничего не найдено", только если искали и ничего нет
                        noResults.style.display = (foundCount === 0 && term !== '') ? 'block' : 'none';
                    });

                    break;
                }

                case 'stu.sc_portfolio':
                    const portfolioLinks = span9.querySelectorAll('h3 > a.dashed');
                    
                    portfolioLinks.forEach(link => {
                        const h3 = link.parentElement;
                        const oldCounter = link.querySelector('span[id$="_cnt"]');
                        
                        const headerCard = document.createElement('div');
                        headerCard.className = 'portfolio-header';
                        
                        if (oldCounter) {
                            const countVal = oldCounter.textContent.replace(/[()]/g, '').trim();
                            if (countVal !== "") {
                                const newBadge = document.createElement('span');
                                newBadge.className = 'portfolio-count';
                                newBadge.textContent = countVal;
                                headerCard.appendChild(newBadge);
                            }
                        }

                        Array.from(link.childNodes).forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                node.textContent = node.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
                            }
                        });

                        h3.parentNode.insertBefore(headerCard, h3);
                        headerCard.prepend(link);

                        headerCard.onclick = (e) => {
                            if (e.target !== link) link.click();
                        };
                        link.onclick = (e) => e.stopPropagation();

                        h3.remove();
                    });

                    // --- СКРОЛЛ ТАБЛИЦ ---
                    // Находим все блоки контента (публикации, проекты и т.д.)
                    const contentDivs = span9.querySelectorAll('div[id="pub"], div[id="pis"], div[id="agr"], div[id="ooo"], div[id="saw"], div[id="vkr"]');
                    
                    contentDivs.forEach(div => {
                        const table = div.querySelector('table');
                        if (table) {
                            // Создаем обертку для скролла
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            
                            // Вставляем обертку перед таблицей
                            table.parentNode.insertBefore(wrapper, table);
                            
                            // Перемещаем таблицу внутрь
                            wrapper.appendChild(table);
                            
                            // Сбрасываем ширину, чтобы таблица растягивалась
                            table.style.width = '100%';
                        }
                    });

                    // Иконки загрузки файлов
                    const loadImgs = span9.querySelectorAll('img[name="load_doc"]');
                    loadImgs.forEach(img => {
                        const icon = document.createElement('span');
                        icon.className = 'material-icons icon-load-doc-new';
                        icon.textContent = 'upload_file';
                        icon.style.cursor = 'pointer';
                        
                        Array.from(img.attributes).forEach(attr => {
                            icon.setAttribute(attr.name, attr.value);
                        });

                        icon.onclick = function(e) {
                            if (typeof window.get_files === 'function') {
                                window.get_files.call(this);
                            } else if (typeof get_files === 'function') {
                                get_files.call(this);
                            }
                        };

                        img.parentNode.replaceChild(icon, img);
                    });

                    const dialogObserver = new MutationObserver(() => {
                        const dialog = document.querySelector('.ui-dialog');
                        if (dialog) {
                            dialog.style.width = 'min(90vw, 500px)';
                            dialog.style.position = 'fixed';
                            dialog.style.top = '50%';
                            dialog.style.left = '50%';
                            dialog.style.transform = 'translate(-50%, -50%)';
                        }
                    });

                    dialogObserver.observe(document.body, { childList: true });

                    break;

                case 'stu.timetable':
                // --- ОФОРМЛЕНИЕ ВЫХОДНЫХ ДНЕЙ (0 ПАР) ---
                span9.querySelectorAll('.no_pairs').forEach(el => {
                    const table = document.createElement('table');
                    table.className = 'timetable-grid'; // Применяем сетку расписания
                    
                    table.innerHTML = `
                        <tbody>
                            <tr>
                                <td class="pair_num" style="border-bottom: none !important; border-right: none !important;">0 пар<br><font class="eval">00:00</font></td>
                                <td class="pair_info" style="border-bottom: none !important; border-left: none !important;">
                                    <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(52, 199, 89, 0.12); color: var(--color-green); padding: 0.6rem 1.4rem; border-radius: 50px; font-weight: 700; font-size: 1.3rem;">
                                        <span class="material-icons" style="font-size: 1.8rem;">free_breakfast</span>
                                        Выходной
                                    </div>
                                </td>
                                <td class="pair_teacher" style="border-bottom: none !important;"></td>
                            </tr>
                        </tbody>
                    `;
                    
                    // Заменяем скучный текст на полноценную таблицу
                    el.parentNode.replaceChild(table, el);
                });
                span9.querySelectorAll('.day table').forEach(t => t.classList.add('timetable-grid'));
                // 1. Создаем контейнер для кнопок (Тулбар)
                const toolbar = document.createElement('div');
                toolbar.className = 'timetable-toolbar';
                span9.prepend(toolbar);

                // --- 1. КНОПКА "ПОДЕЛИТЬСЯ" ---
                const shareBtn = document.createElement('div');
                shareBtn.className = 'toolbar-item';
                shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">ios_share</span> Поделиться';
                toolbar.appendChild(shareBtn);

                shareBtn.addEventListener('click', () => {
                    const originalText = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">hourglass_empty</span> Загрузка...';

                    const renderTimetable = () => {
                        const isMobile = window.innerWidth <= 960;
                        const renderWidth = isMobile ? 540 : 1000;
                        
                        const exportContainer = document.createElement('div');
                        // Скрываем контейнер внизу экрана
                        exportContainer.style.position = 'fixed';
                        exportContainer.style.top = '100vh';
                        exportContainer.style.left = '0';
                        exportContainer.style.width = renderWidth + 'px'; 
                        exportContainer.style.padding = isMobile ? '24px' : '40px';
                        exportContainer.style.boxSizing = 'border-box';
                        exportContainer.style.background = getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6';
                        exportContainer.style.fontFamily = getComputedStyle(document.body).fontFamily;
                        exportContainer.style.zIndex = '-9999';
                        
                        // Если мобилка, форсируем минимальную высоту для соотношения 9:16 (как сторис)
                        if (isMobile) {
                            exportContainer.style.minHeight = (renderWidth * 16 / 9) + 'px';
                        }
                        
                        let fileName = 'Расписание.png';

                        // Формируем заголовок и название файла
                        const dateStyled = document.querySelector('.week-date-styled');
                        if (dateStyled) {
                            const dateText = dateStyled.textContent.trim();
                            const cleanDates = dateText.replace(/^С\s+/i, '').replace(/\s*по\s*/i, '-');
                            if (cleanDates) fileName = `Расписание ${cleanDates}.png`;

                            const title = document.createElement('h2');
                            title.textContent = 'Расписание: ' + dateText;
                            title.style.textAlign = 'center';
                            title.style.marginBottom = isMobile ? '20px' : '30px';
                            title.style.fontSize = isMobile ? '1.8rem' : '2.2rem';
                            title.style.fontWeight = '800';
                            title.style.color = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#000';
                            exportContainer.appendChild(title);
                        }

                        // Оборачиваем клон в .span9 для сохранения стилей
                        const span9Wrapper = document.createElement('div');
                        span9Wrapper.className = 'span9';
                        span9Wrapper.style.setProperty('margin', '0', 'important');
                        span9Wrapper.style.setProperty('padding', '0', 'important');
                        span9Wrapper.style.setProperty('width', '100%', 'important');

                        // Клонируем всю таблицу расписания
                        const timetableClone = document.querySelector('.timetable').cloneNode(true);
                        
                        // Удаляем кнопки "оценить занятие" и скрытые пары
                        timetableClone.querySelectorAll('.pair_teacher .eval').forEach(el => el.remove());
                        timetableClone.querySelectorAll('.hidden-by-filter').forEach(el => el.remove());
                        
                        // Снимаем синие подчеркивания у ссылок
                        timetableClone.querySelectorAll('a').forEach(a => {
                            a.style.textDecoration = 'none';
                            a.style.color = getComputedStyle(a).color;
                        });

                        timetableClone.querySelectorAll('*').forEach(el => {
                            el.style.boxSizing = 'border-box';
                        });

                        span9Wrapper.appendChild(timetableClone);
                        exportContainer.appendChild(span9Wrapper);
                        document.body.appendChild(exportContainer);

                        // Рендерим канвас
                        window.html2canvas(exportContainer, { 
                            scale: 2, 
                            useCORS: true,
                            windowWidth: isMobile ? renderWidth : 1200, // Включает мобильные стили CSS при рендере
                            backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6'
                        }).then(canvas => {
                            // Превращаем канвас в файл для нативного окна "Поделиться"
                            canvas.toBlob(blob => {
                                if (!blob) throw new Error('Blob creation failed');
                                
                                const file = new File([blob], fileName, { type: 'image/png' });

                                // Если мы с телефона и браузер поддерживает окно "Share"
                                if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                                    navigator.share({
                                        files: [file],
                                        title: 'Расписание',
                                    }).then(() => {
                                        exportContainer.remove();
                                        shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">check</span> Готово!';
                                        setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                                    }).catch(err => {
                                        console.log('Пользователь отменил шаринг', err);
                                        exportContainer.remove();
                                        shareBtn.innerHTML = originalText;
                                    });
                                } else {
                                    // Фолбэк для ПК (просто скачивание)
                                    const link = document.createElement('a');
                                    link.download = fileName;
                                    link.href = URL.createObjectURL(blob);
                                    link.click();
                                    URL.revokeObjectURL(link.href);

                                    exportContainer.remove();
                                    shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">check</span> Сохранено!';
                                    setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                                }
                            }, 'image/png');
                        }).catch(err => {
                            console.error('Ошибка при создании картинки:', err);
                            exportContainer.remove();
                            shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">error</span> Ошибка';
                            setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                        });
                    };

                    // Подгружаем библиотеку
                    if (typeof window.html2canvas === 'undefined') {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                        script.onload = renderTimetable;
                        document.head.appendChild(script);
                    } else {
                        renderTimetable();
                    }
                });

                // --- 2. ТУМБЛЕР "КОНСУЛЬТАЦИИ" (Локальная фильтрация с памятью) ---
                const consultDiv = Array.from(span9.querySelectorAll('div')).find(div =>
                    div.querySelector('input[type="checkbox"]') && div.textContent.includes('Консультации')
                );

                // Заранее помечаем строки с консультациями
                span9.querySelectorAll('.timetable-grid tr').forEach(row => {
                    const dis = row.querySelector('.dis');
                    if (dis && dis.textContent.toLowerCase().includes('консультация')) {
                        row.classList.add('consultation-row');
                    }
                });

                if (consultDiv) {
                    const wrapper = document.createElement('label');
                    wrapper.className = 'toolbar-item';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'tumbler-checkbox'; 
                    
                    // Читаем из памяти
                    const savedState = localStorage.getItem('etis_show_consultations');
                    checkbox.checked = savedState !== 'false';
                    
                    wrapper.appendChild(checkbox);
                    wrapper.appendChild(document.createTextNode('Консультации'));
                    toolbar.appendChild(wrapper);
                    consultDiv.remove();

                    // Логика фильтрации
                    checkbox.addEventListener('change', () => {
                        const show = checkbox.checked;
                        localStorage.setItem('etis_show_consultations', show);
                        span9.querySelectorAll('.consultation-row').forEach(row => {
                            if (show) row.classList.remove('hidden-by-filter');
                            else row.classList.add('hidden-by-filter');
                        });
                        if (typeof recalculateTimetable === 'function') recalculateTimetable();
                    });

                    // Применяем фильтр при загрузке
                    if (!checkbox.checked) {
                        span9.querySelectorAll('.consultation-row').forEach(row => row.classList.add('hidden-by-filter'));
                    }
                }

                // --- 3. КНОПКА "СИНХРОНИЗАЦИЯ" ---
                const syncHeader = Array.from(document.querySelectorAll('h2')).find(h2 => h2.querySelector('#tb_show') || h2.textContent.includes('Синхронизация'));
                if (syncHeader) {
                    const resourcesDiv = document.getElementById('resources');
                    if (resourcesDiv) {
                        resourcesDiv.className = 'sync-card'; 

                        // 1. Удаляем заголовок "С помощью стандарта iCalendar"
                        const h3 = resourcesDiv.querySelector('h3');
                        if (h3) h3.remove();

                        // 2. Очищаем текст "Ссылка на календарь:" и лишние <br>
                        const wrapper = resourcesDiv.querySelector('div');
                        if (wrapper) {
                            wrapper.removeAttribute('style'); // Убираем кривой отступ ЕТИСа
                            Array.from(wrapper.childNodes).forEach(node => {
                                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Ссылка на календарь')) node.remove();
                                if (node.tagName === 'BR') node.remove();
                            });
                        }

                        // 3. Пересобираем блок с кнопками
                        const calendarDiv = resourcesDiv.querySelector('#calendar');
                        if (calendarDiv) {
                            const textBox = calendarDiv.querySelector('#textbox');
                            const copyBtn = Array.from(calendarDiv.querySelectorAll('button')).find(b => b.textContent.includes('Скопировать'));
                            const delBtn = Array.from(calendarDiv.querySelectorAll('button')).find(b => b.textContent.includes('Отписаться'));

                            if (textBox && copyBtn && delBtn) {
                                // Сохраняем саму ссылку
                                const linkValue = textBox.value;

                                // Стилизуем кнопку "Скопировать"
                                copyBtn.className = 'answer-btn-custom';
                                copyBtn.innerHTML = '<span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">content_copy</span>Скопировать';
                                copyBtn.removeAttribute('onclick'); // Убиваем старый скрипт ЕТИСа
                                copyBtn.addEventListener('click', () => {
                                    navigator.clipboard.writeText(linkValue).then(() => {
                                        const origHtml = copyBtn.innerHTML;
                                        copyBtn.innerHTML = '<span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">check</span>Скопировано!';
                                        // Форсированно делаем зеленой через !important
                                        copyBtn.style.setProperty('background', 'var(--color-green)', 'important'); 
                                        setTimeout(() => {
                                            copyBtn.innerHTML = origHtml;
                                            copyBtn.style.removeProperty('background'); // Возвращаем родной синий
                                        }, 2000);
                                    });
                                });

                                // Стилизуем кнопку "Отписаться"
                                delBtn.className = 'answer-btn-custom';
                                // Форсированно делаем красной через !important
                                delBtn.style.setProperty('background', 'var(--color-red)', 'important');
                                delBtn.innerHTML = '<span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">delete_outline</span>Отписаться';

                                // Собираем блок заново (текстбокс исчезает, остаются только красивые кнопки)
                                calendarDiv.innerHTML = '';
                                calendarDiv.style.display = 'flex';
                                calendarDiv.style.gap = '1.2rem';
                                calendarDiv.style.marginTop = '2rem';
                                calendarDiv.appendChild(copyBtn);
                                calendarDiv.appendChild(delBtn);
                            }
                        }
                    }

                    // Кнопка в тулбаре для вызова карточки
                    const newBtn = document.createElement('div');
                    newBtn.className = 'toolbar-item';
                    newBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">sync</span> Синхронизация';
                    
                    newBtn.addEventListener('click', () => {
                        if (resourcesDiv) {
                            if (resourcesDiv.hasAttribute('hidden') || resourcesDiv.style.display === 'none') {
                                resourcesDiv.removeAttribute('hidden');
                                resourcesDiv.style.display = 'block';
                                newBtn.style.background = 'var(--color-accent)';
                                newBtn.style.color = 'var(--color-text-primary-invert)';
                            } else {
                                resourcesDiv.style.display = 'none';
                                newBtn.style.background = 'var(--color-highlight)';
                                newBtn.style.color = 'var(--color-text-primary)';
                            }
                        }
                    });

                    toolbar.appendChild(newBtn);
                    syncHeader.remove(); 
                }

                // --- 4. ПОДРОБНОЕ РАСПИСАНИЕ ---
                const detailLink = Array.from(span9.querySelectorAll('a')).find(a => a.textContent.includes('Подробное расписание'));
                if (detailLink) {
                    detailLink.className = 'toolbar-item';
                    detailLink.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">event_note</span> Подробное расписание';
                    toolbar.appendChild(detailLink);
                }

                // --- 5. КНОПКА ОТЗЫВА ---
                const feedbackLink = Array.from(span9.querySelectorAll('a')).find(a => a.textContent.includes('Напишите, что вы думаете о расписании'));
                if (feedbackLink) {
                    let oldParent = feedbackLink.parentElement;
                    feedbackLink.className = 'toolbar-item';
                    feedbackLink.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">feedback</span> Оставить отзыв';
                    toolbar.appendChild(feedbackLink);

                    if (oldParent && oldParent.textContent.trim() === '') {
                        oldParent.remove();
                    }
                }

                // 6. Очистка старых баров и стилей пар
                const oldBar = span9.querySelector('.timetable-buttonbar');
                if(oldBar) oldBar.remove();

                const pairs = span9.querySelectorAll("div.day > table > tbody > tr");
                pairs.forEach(pair => {
                    const teacher = pair.querySelector('span.teacher');
                    if (teacher) {
                        const pairTeacher = document.createElement('td');
                        pairTeacher.className = 'pair_teacher';
                        pairTeacher.innerHTML = teacher.innerHTML;
                        pair.appendChild(pairTeacher);
                        const pairJour = pair.querySelector('td.pair_jour');
                        if(pairJour) pairJour.remove();
                        teacher.remove();
                    }
                });

                // 7. КРАСИВАЯ ДАТА 
                // Ищем блок с текстом даты внутри week-select
                const weekSelect = span9.querySelector('.week-select');
                if (weekSelect) {
                    const dateDiv = weekSelect.querySelector('div[style*="text-align:center"]');
                    if (dateDiv) {
                        const dateSpan = dateDiv.querySelector('span');
                        if (dateSpan) {
                            // Заменяем текст
                            let text = dateSpan.textContent.trim();
                            // Удаляем "Неделя " в начале (регистронезависимо)
                            text = text.replace(/^Неделя\s+/i, '');
                            
                            // Вырезаем точку и 4 цифры года (например, .2026)
                            text = text.replace(/\.\d{4}/g, '');
                            
                            // Делаем первую букву заглавной ("с 23.02..." -> "С 23.02...")
                            text = text.charAt(0).toUpperCase() + text.slice(1);
                            
                            dateSpan.textContent = text;
                            
                            // Добавляем класс стиля
                            dateDiv.className = 'week-date-styled';
                            // Убираем старый inline стиль, чтобы он не мешал
                            dateDiv.removeAttribute('style');
                        }
                    }
                }
                // 8. Центрирование активной недели при загрузке (Мобильные)
                if (window.innerWidth <= 960) {
                    const weeksContainer = span9.querySelector('.weeks');
                    const activeWeek = span9.querySelector('.week.current');

                    if (activeWeek && weeksContainer) {
                        const performScroll = (behavior = 'smooth') => {
                            const containerWidth = weeksContainer.offsetWidth;
                            const weekWidth = activeWeek.offsetWidth;
                            const weekLeft = activeWeek.offsetLeft;

                            // Если ширина всё еще 0, значит DOM не готов, пропускаем
                            if (containerWidth === 0) return;

                            const scrollTarget = weekLeft - (containerWidth / 2) + (weekWidth / 2);
                            
                            weeksContainer.scrollTo({
                                left: scrollTarget,
                                behavior: behavior
                            });
                        };

                        // 1. Пытаемся проскроллить мгновенно, как только скрипт дошел до этой точки
                        requestAnimationFrame(() => performScroll('auto'));

                        // 2. Пытаемся еще раз через 100мс (когда применятся CSS-трансформации)
                        setTimeout(() => performScroll('smooth'), 100);

                        // 3. Финальная попытка через 500мс (на случай долгой подгрузки шрифтов)
                        setTimeout(() => performScroll('smooth'), 500);
                    }
                }

                // --- ПОДСВЕТКА АКТУАЛЬНОЙ НЕДЕЛИ ---
                const urlParamsTT = new URLSearchParams(window.location.search);
                const weeksList = span9.querySelectorAll('.weeks .week');

                // Если в ссылке нет параметра p_week, значит мы на настоящей (текущей) неделе
                if (!urlParamsTT.has('p_week')) {
                    const currentWeekEl = span9.querySelector('.week.current');
                    if (currentWeekEl) {
                        localStorage.setItem('etis_actual_week', currentWeekEl.textContent.trim());
                    }
                }

                const actualWeekNum = localStorage.getItem('etis_actual_week');
                if (actualWeekNum) {
                    weeksList.forEach(w => {
                        // Красим текст, если это актуальная неделя, но мы сейчас НЕ на ней (нет класса current)
                        if (w.textContent.trim() === actualWeekNum && !w.classList.contains('current')) {
                            w.classList.add('actual-week');
                        }
                    });
                }

                // --- ОФОРМЛЕНИЕ ЗАГОЛОВКОВ ДНЕЙ (ДАТЫ) ---
                const dayHeaders = span9.querySelectorAll('.day h3');
                dayHeaders.forEach(header => {
                    const text = header.textContent.trim();
                    const parts = text.split(',');
                    
                    if (parts.length >= 2) {
                        const dayOfWeek = parts[0].trim();
                        const datePart = parts.slice(1).join(',').trim();
                        
                        header.innerHTML = `
                            <span class="day-name">${dayOfWeek}</span>
                            <span class="day-date">${datePart}</span>
                        `;
                    } else {
                        // Резервный вариант, если запятой нет
                        header.innerHTML = `<span class="day-name">${text}</span>`;
                    }
                });

                // --- ПАРСИНГ И ИКОНКИ ДЛЯ АУДИТОРИЙ ---
                span9.querySelectorAll('.pair_info .aud').forEach(aud => {
                    let text = aud.innerHTML;
                    
                    // Ищем паттерн: ауд. 329/12 (12 корпус, 3 этаж)
                    // Иногда бывает без дроби, поэтому [^\s(<]+ берет все до пробела
                    const match = text.match(/ауд\.\s*([^\s(<]+)\s*\((.*?)\s*корпус,\s*(.*?)\s*этаж\)/i);
                    
                    if (match) {
                        let roomNumber = match[1];
                        // Отрезаем дублирующий номер корпуса после слэша, если он есть (329/12 -> 329)
                        if (roomNumber.includes('/')) {
                            roomNumber = roomNumber.split('/')[0]; 
                        }
                        const building = match[2];
                        const floor = match[3];
                        
                        // Собираем новую красивую строку с иконкой "place"
                        const newFormat = `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>ауд. ${roomNumber}, к. ${building}, э. ${floor}</div>`;
                        
                        // Заменяем оригинальный кусок текста на наш HTML, не трогая ссылки (на Zoom и тд)
                        aud.innerHTML = text.replace(match[0], newFormat);
                    }
                    
                    // Выстраиваем аудиторию и Zoom-кнопку (если она есть) аккуратно друг под другом
                    aud.style.display = 'flex';
                    aud.style.flexDirection = 'column';
                    aud.style.alignItems = 'flex-start';
                    aud.style.gap = '0.6rem';
                    aud.style.marginTop = '0.6rem';
                });

                // --- ПАРСИНГ ТИПА ПАРЫ (ЛЕК, ПРАКТ, ЛАБ) ---
                span9.querySelectorAll('.timetable-grid tr').forEach(row => {
                    const disContainer = row.querySelector('.pair_info .dis');
                    const numTd = row.querySelector('.pair_num');
                    
                    if (disContainer && numTd) {
                        // Тип пары обычно приписан в конце ссылки или прямо в span
                        const targetEl = disContainer.querySelector('a') || disContainer;
                        const text = targetEl.textContent;
                        
                        // Ищем (лек), (практ), (лаб), (зач), (экз) в самом конце строки
                        const match = text.match(/\s*\((лек|практ|лаб|зач|экз)\)\s*$/i);
                        
                        if (match) {
                            const type = match[1].toLowerCase();
                            
                            // Удаляем тип из оригинального названия предмета
                            targetEl.textContent = text.replace(match[0], '');
                            
                            // Выбираем цвет в зависимости от типа
                            let typeClass = 'type-badge-lek';
                            if (type === 'лек') typeClass = 'type-badge-lek';
                            else if (type === 'практ') typeClass = 'type-badge-pract';
                            else if (type === 'лаб') typeClass = 'type-badge-lab';
                            else if (type === 'зач' || type === 'экз') typeClass = 'type-badge-exam';
                            
                            // Создаем метку и вставляем её в колонку со временем (перед "1 пара")
                            const badge = document.createElement('span');
                            badge.className = `pair-type-badge ${typeClass}`;
                            badge.textContent = type;
                            
                            numTd.prepend(badge);
                        }
                    }
                });

                // --- ЛОГИКА СКРЫТИЯ ПУСТЫХ ПАР И ОБРАБОТКИ ОКОН (УМНАЯ) ---
                function recalculateTimetable() {
                    const days = span9.querySelectorAll("div.day");
                    days.forEach(day => {
                        const table = day.querySelector('table');
                        if (!table) return;

                        // Удаляем старые отрисованные окна и плашки "Выходной"
                        table.querySelectorAll('.timetable-gap-row, .custom-no-pairs').forEach(r => r.remove());

                        const rows = Array.from(table.querySelectorAll('tr')).filter(r => !r.classList.contains('timetable-gap-row') && !r.classList.contains('custom-no-pairs'));
                        
                        // Если это уже оригинальный пустой день - не трогаем
                        if (rows.length === 1 && rows[0].textContent.includes('0 пар')) return;

                        // Ищем реальные пары (есть текст И не скрыты тумблером консультаций)
                        const pairData = rows.map(row => {
                            const info = row.querySelector('.pair_info');
                            const isOccupied = info && 
                                               info.textContent.replace(/\u00a0/g, ' ').trim().length > 0 && 
                                               !row.classList.contains('hidden-by-filter');
                            return { row, isOccupied };
                        });

                        const firstRealIndex = pairData.findIndex(p => p.isOccupied);
                        const lastRealIndex = pairData.map(p => p.isOccupied).lastIndexOf(true);

                        // Если пар нет вообще (всё пусто или мы скрыли все консультации тумблером)
                        if (firstRealIndex === -1) {
                            rows.forEach(r => r.style.display = 'none'); 
                            
                            const tbody = table.querySelector('tbody') || table;
                            const tr = document.createElement('tr');
                            tr.className = 'custom-no-pairs';
                            tr.innerHTML = `
                                <td class="pair_num" style="border-bottom: none !important; border-right: none !important;">0 пар<br><font class="eval">00:00</font></td>
                                <td class="pair_info" style="border-bottom: none !important; border-left: none !important;">
                                    <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(52, 199, 89, 0.12); color: var(--color-green); padding: 0.6rem 1.4rem; border-radius: 50px; font-weight: 700; font-size: 1.3rem;">
                                        <span class="material-icons" style="font-size: 1.8rem;">free_breakfast</span>
                                        Выходной
                                    </div>
                                </td>
                                <td class="pair_teacher" style="border-bottom: none !important;"></td>
                            `;
                            tbody.appendChild(tr);
                            return;
                        }

                        // Обработка окон (перерывов)
                        let i = 0;
                        while (i < rows.length) {
                            if (i < firstRealIndex || i > lastRealIndex) {
                                rows[i].style.display = 'none';
                                i++;
                            } 
                            else if (!pairData[i].isOccupied) {
                                let gapCount = 0;
                                let gapStart = i;

                                while (i <= lastRealIndex && !pairData[i].isOccupied) {
                                    rows[i].style.display = 'none';
                                    gapCount++;
                                    i++;
                                }

                                if (gapCount > 0) {
                                    const gapRow = document.createElement('tr');
                                    gapRow.className = 'timetable-gap-row';
                                    
                                    let pairWord = 'пар';
                                    if (gapCount === 1) pairWord = 'пара';
                                    else if (gapCount >= 2 && gapCount <= 4) pairWord = 'пары';

                                    gapRow.innerHTML = `
                                        <td class="pair_num"></td>
                                        <td class="pair_info">
                                            <div class="timetable-gap-capsule">
                                                <span class="material-icons" style="font-size: 14px;">hourglass_empty</span>
                                                Окно: ${gapCount} ${pairWord}
                                            </div>
                                        </td>
                                        <td class="pair_teacher"></td>
                                    `;
                                    rows[gapStart].parentNode.insertBefore(gapRow, rows[gapStart]);
                                }
                            } else {
                                rows[i].style.display = '';
                                i++;
                            }
                        }

                        // --- ФИКС ЛИНИЙ (Скрываем линию у последней видимой строки) ---
                        // Сначала сбрасываем инлайновые стили у всех строк (если мы переключаем тумблер туда-сюда)
                        Array.from(table.querySelectorAll('tr')).forEach(r => r.style.removeProperty('background-image'));
                        
                        // Выбираем все фактически видимые строки (учитывая окна и консультации)
                        const visibleRows = Array.from(table.querySelectorAll('tr')).filter(r => 
                            r.style.display !== 'none' && !r.classList.contains('hidden-by-filter')
                        );

                        // У самой последней убираем разделительную линию через инлайновый стиль
                        if (visibleRows.length > 0) {
                            visibleRows[visibleRows.length - 1].style.setProperty('background-image', 'none', 'important');
                        }
                    });
                }

                // Вызываем перерасчет сразу при загрузке расписания
                recalculateTimetable();
                updateLiveTimetable();
                setInterval(updateLiveTimetable, 60000);
                break;

                case 'stu.change_pass_form':
                    case 'stu.change_pass':
                        const passSpan9 = document.querySelector('.span9');
                        const passForm = passSpan9.querySelector('form.form');
                        const passH3 = passSpan9.querySelector('h3');

                        if (passForm) {
                            // Чистим мусорные br
                            passForm.querySelectorAll('br').forEach(br => br.remove());
                            
                            // Заголовок внутрь формы
                            if (passH3) {
                                passH3.style.textAlign = 'center';
                                passH3.style.marginBottom = '3rem';
                                passForm.prepend(passH3);
                            }

                            // Плейсхолдеры
                            const labels = passForm.querySelectorAll('label');
                            labels.forEach(label => {
                                const input = document.getElementById(label.getAttribute('for'));
                                if (input) {
                                    input.placeholder = label.textContent.trim();
                                    // Очищаем значение, чтобы плейсхолдер был виден (если это не сохраненный email)
                                    if (input.type === 'password') input.value = ''; 
                                    label.remove();
                                }
                            });

                            const btn = passForm.querySelector('button');
                            if (btn) btn.style.width = '100%';
                            
                            passForm.style.maxWidth = '400px';
                            passForm.style.margin = '40px auto';
                        }
                        break;

                case 'stu_email_pkg.change_email':
                        const emailSpan9 = document.querySelector('.span9');
                        const emailForm = emailSpan9.querySelector('form.form');
                        const emailH3 = emailSpan9.querySelector('h3');

                        if (emailForm) {
                            // 1. Создаем чистый контейнер для инфо-текста
                            const footerBox = document.createElement('div');
                            footerBox.className = 'electr-description';

                            // 2. Собираем всё, что НЕ форма и НЕ заголовок
                            const allDivs = Array.from(emailSpan9.querySelectorAll('div:not(.span3):not(.span9)'));
                            const infoUl = emailSpan9.querySelector('ul');

                            allDivs.forEach(div => {
                                // Если это информационный текст, переносим его
                                if (div.textContent.includes('Адрес электронной почты') && !div.contains(emailForm)) {
                                    footerBox.appendChild(div);
                                }
                            });

                            if (infoUl) {
                                infoUl.removeAttribute('style'); // УДАЛЯЕМ инлайновые точки ЕТИСа
                                footerBox.appendChild(infoUl);
                            }

                            // 3. Стилизуем карточку
                            if (emailH3) {
                                emailH3.style.textAlign = 'center';
                                emailH3.style.marginBottom = '3rem';
                                emailForm.prepend(emailH3);
                            }

                            const label = emailForm.querySelector('label');
                            const input = emailForm.querySelector('input');
                            if (label && input) {
                                input.placeholder = label.textContent.trim();
                                label.remove();
                            }

                            const btn = emailForm.querySelector('button');
                            if (btn) btn.style.width = '100%';

                            emailForm.style.maxWidth = '400px';
                            emailForm.style.margin = '40px auto';

                            // 4. Добавляем футер в самый конец и удаляем мусор
                            emailSpan9.appendChild(footerBox);
                            emailForm.querySelectorAll('br').forEach(br => br.remove());
                        }
                        break;

                case 'stu_ann.announces':
                case 'stu.announce': {
                    const announceMessages = span9.querySelectorAll('ul.nav.msg');
                    if (!announceMessages.length) break;

                    const container = document.createElement('div');
                    container.className = 'msg-container';

                    announceMessages.forEach(msg => {
                        const firstLi = msg.querySelector('li:first-child');
                        if (!firstLi) return;

                        // Клонируем, чтобы безопасно вырезать лишнее
                        const cloneContent = firstLi.cloneNode(true);

                        const dateNode = cloneContent.querySelector('font[color="#808080"]');
                        const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                        if (dateNode) dateNode.remove();

                        const titleNode = cloneContent.querySelector('font[style*="font-weight:bold"], b');
                        const titleStr = titleNode ? titleNode.textContent.trim() : '';
                        if (titleNode) titleNode.remove();

                        // Удаляем оставшиеся теги font от ЕТИСа
                        cloneContent.querySelectorAll('font').forEach(n => n.remove());

                        // Собираем файлы
                        const attachments = [];
                        msg.querySelectorAll('a[href*="file_download"]').forEach(link => {
                            attachments.push({ name: link.textContent.trim(), href: link.href });
                        });

                        // Выделяем автора
                        let rawHtml = cloneContent.innerHTML.replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
                        const parts = rawHtml.split(/<br\s*\/?>/i);
                        let authorStr = 'Администрация / Деканат';

                        if (parts.length > 1) {
                            const lastPart = parts[parts.length - 1].trim();
                            if (lastPart.length > 0 && lastPart.length < 60 && !lastPart.includes('<')) {
                                authorStr = lastPart;
                                parts.pop();
                                while (parts.length > 0 && parts[parts.length - 1].trim() === '') parts.pop();
                            }
                        }

                        // Собираем чистый текст
                        let bodyHtml = parts.join('<br>').replace(/^(<br\s*\/?>|\s)+/, '');
                        while(bodyHtml.startsWith('<br>')) {
                            bodyHtml = bodyHtml.replace(/^<br\s*\/?>\s*/i, '');
                        }

                        const card = document.createElement('div');
                        card.className = 'msg-card';

                        let attachmentsHtml = attachments.length > 0 ? `
                            <div class="msg-attachments">
                                ${attachments.map(a => `
                                    <a href="${a.href}" class="file-attachment-link" target="_blank">
                                        <span class="material-icons">attach_file</span>
                                        <span class="file-name">${a.name}</span>
                                    </a>
                                `).join('')}
                            </div>
                        ` : '';

                        card.innerHTML = `
                            <div class="msg-header">
                                <div class="msg-sender"><span class="material-icons">campaign</span>${authorStr}</div>
                                <div class="msg-date">${dateStr}</div>
                            </div>
                            ${titleStr ? `<div class="msg-subject">${titleStr}</div>` : ''}
                            <div class="msg-body">${bodyHtml}</div>
                            ${attachmentsHtml ? `<div class="msg-footer">${attachmentsHtml}</div>` : ''}
                        `;

                        container.appendChild(card);
                    });

                    const h2 = span9.querySelector('h2') || document.createElement('h2');
                    if (!h2.parentNode) h2.textContent = 'Объявления';
                    h2.style.marginBottom = '2.4rem';
                    
                    // Очищаем DOM от старых элементов
                    span9.innerHTML = '';
                    span9.appendChild(h2);
                    span9.appendChild(container);
                    break;
                }

                case 'stu.teacher_notes': {
                    // Пагинация (находим блок со страницами)
                    const pagesContainer = span9.querySelector('.weeks');
                    if (pagesContainer) {
                        pagesContainer.classList.add('message-pages');
                        const firstLi = pagesContainer.querySelector('li');
                        if (firstLi && firstLi.textContent.includes('Страницы')) firstLi.style.display = 'none';
                    }

                    const messages = span9.querySelectorAll('ul.nav.msg');
                    const container = document.createElement('div');
                    container.className = 'msg-container';

                    messages.forEach(msg => {
                        const mainLi = msg.querySelector('li');
                        if (!mainLi) return;

                        // Клонируем для чистки
                        const cloneContent = mainLi.cloneNode(true);

                        // 1. Имя преподавателя
                        const teacherNode = cloneContent.querySelector('b i');
                        const teacherName = teacherNode ? teacherNode.textContent.trim() : 'Преподаватель';
                        const bTag = cloneContent.querySelector('b');
                        if (bTag && bTag.contains(teacherNode)) bTag.remove();

                        // 2. Дата
                        const dateNode = cloneContent.querySelector('font[color="#808080"]');
                        const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                        if (dateNode) dateNode.remove();

                        // 3. Темы (ЕТИС сует их в теги <font>)
                        const subjects = [];
                        cloneContent.querySelectorAll('font').forEach(fontNode => {
                            const text = fontNode.textContent.trim();
                            if (text) subjects.push(text);
                            fontNode.remove(); // ВЫРЕЗАЕМ ИЗ ТЕКСТА
                        });
                        const titleStr = subjects.join(' • '); // Если тем несколько (Дисциплина + Заголовок)

                        // 4. Собираем идеально чистый текст
                        let rawHtml = cloneContent.innerHTML.replace(/&nbsp;/g, ' ').replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
                        while(rawHtml.startsWith('<br>')) {
                            rawHtml = rawHtml.replace(/^<br\s*\/?>\s*/i, '');
                        }
                        const bodyHtml = rawHtml;

                        // 5. Кнопки и файлы
                        const files = [];
                        msg.querySelectorAll('a[href*="file_download"]').forEach(link => {
                            files.push({ name: link.textContent.trim(), node: link });
                        });
                        const oldReplyBtn = msg.querySelector('input[type="button"]');
                        const replyFormDiv = msg.querySelector('div[id^="frm_"]');

                        // 6. Строим карточку
                        const card = document.createElement('div');
                        card.className = 'msg-card';

                        card.innerHTML = `
                            <div class="msg-header">
                                <div class="msg-sender"><span class="material-icons">person</span>${teacherName}</div>
                                <div class="msg-date">${dateStr}</div>
                            </div>
                            ${titleStr ? `<div class="msg-subject">${titleStr}</div>` : ''}
                            <div class="msg-body">${bodyHtml}</div>
                        `;

                        // 7. Строим футер с файлами и кнопкой
                        if (files.length > 0 || oldReplyBtn) {
                            const footer = document.createElement('div');
                            footer.className = 'msg-footer';

                            if (files.length > 0) {
                                const attachDiv = document.createElement('div');
                                attachDiv.className = 'msg-attachments';
                                files.forEach(f => {
                                    f.node.className = 'file-attachment-link';
                                    f.node.innerHTML = `<span class="material-icons" style="font-size:16px; flex-shrink:0;">attach_file</span><span class="file-name">${f.name}</span>`;
                                    attachDiv.appendChild(f.node);
                                });
                                footer.appendChild(attachDiv);
                            }

                            if (oldReplyBtn) {
                                const newBtn = document.createElement('button');
                                newBtn.className = 'answer-btn-custom';
                                newBtn.innerHTML = `<span class="material-icons" style="font-size:16px; margin-right:6px">reply</span> Ответить`;
                                if (oldReplyBtn.getAttribute('onclick')) {
                                    newBtn.setAttribute('onclick', oldReplyBtn.getAttribute('onclick'));
                                } else {
                                    newBtn.onclick = oldReplyBtn.onclick;
                                }
                                footer.appendChild(newBtn);
                                oldReplyBtn.remove();
                            }
                            card.appendChild(footer);
                        }

                        // 8. Цепляем форму ответа
                        if (replyFormDiv) {
                            const txtArea = replyFormDiv.querySelector('textarea');
                            if (txtArea) txtArea.placeholder = "Напишите ваш ответ здесь...";
                            const submitBtn = replyFormDiv.querySelector('input[type="submit"]');
                            if (submitBtn) submitBtn.className = 'send-reply-btn';
                            card.appendChild(replyFormDiv);
                        }

                        container.appendChild(card);
                    });

                    // Очищаем старые таблицы ЕТИСа
                    span9.querySelectorAll('ul.nav.msg').forEach(m => m.remove());
                    
                    // ДОБАВЛЯЕМ ЗАГОЛОВОК СТРАНИЦЫ
                    const h2 = span9.querySelector('h2') || document.createElement('h2');
                    if (!h2.parentNode) {
                        h2.textContent = 'Сообщения от преподавателей';
                        span9.prepend(h2); // Вставляем в самый верх страницы
                    }
                    h2.style.marginBottom = '2.4rem';
                    
                    // Вставляем карточки сообщений сразу под заголовком
                    h2.after(container);
                    
                    // ПЕРЕНОСИМ ПАГИНАЦИЮ В САМЫЙ НИЗ (под карточки)
                    if (pagesContainer) {
                        container.after(pagesContainer);
                    }
                    
                    break;
                }

                case 'cert_pkg.stu_certif': {
                    const action = urlParams.get('p_action');

                    // --- Ищем зеленый текст с правилом (он есть на главной, но может не быть внутри) ---
                    let greenText = "Справки выдаются лично заявителю, либо доверенному лицу, если его ФИО будет написано в «Примечаниях» при заказе справки.";
                    const greenSpan = span9.querySelector('span[style*="00b050"]');
                    if (greenSpan && greenSpan.textContent.trim()) {
                        greenText = greenSpan.textContent.trim();
                    }

                    // --- Единая функция для генерации красивого подвала ---
                    const appendCertFooter = (container) => {
                        const footerContainer = document.createElement('div');
                        footerContainer.style.marginTop = '4rem';

                        // 1. Сетка с карточками
                        const footerGrid = document.createElement('div');
                        footerGrid.className = 'cert-footer-grid';
                        footerGrid.style.marginTop = '0'; 

                        const infoCard = document.createElement('div');
                        infoCard.className = 'cert-footer-card';
                        infoCard.innerHTML = `
                            <span class="material-icons">timer</span>
                            <div class="cert-footer-card-content">
                                Справки готовятся в течение <b>3 рабочих дней</b>.<br>
                                Готовые документы выдаются в отделе кадров обучающихся (ОКО).
                                <small>Важно: не путайте с отделом кадров сотрудников.</small>
                            </div>
                        `;
                        
                        const contactCard = document.createElement('div');
                        contactCard.className = 'cert-footer-card';
                        contactCard.innerHTML = `
                            <span class="material-icons">place</span>
                            <div class="cert-footer-card-content">
                                Корпус №8 ПГНИУ, <b>каб. 214</b><br>
                                Пн – Чт: 8:30 – 17:30 (Пт до 16:30)<br>
                                Тел: (342) 2-396-135
                                <small>Суббота и воскресенье — выходные дни.</small>
                            </div>
                        `;

                        footerGrid.appendChild(infoCard);
                        footerGrid.appendChild(contactCard);
                        footerContainer.appendChild(footerGrid);

                        // 2. Объединенный зеленый блок правил и отслеживания
                        const alert = document.createElement('div');
                        alert.className = 'cert-alert-box';
                        alert.style.margin = '2rem 0 0 0';
                        
                        const mainText = document.createElement('div');
                        mainText.style.display = 'flex';
                        mainText.style.alignItems = 'center';
                        mainText.style.gap = '1.2rem';
                        mainText.innerHTML = `<span class="material-icons" style="font-size: 2.6rem; color: var(--color-green);">info</span>` + 
                                             `<div>${greenText}</div>`;
                        alert.appendChild(mainText);

                        const finalNote = document.createElement('div');
                        finalNote.style.cssText = 'margin-top: 1.6rem; padding-top: 1.6rem; border-top: 1px solid rgba(52, 199, 89, 0.2); font-weight: 600; font-size: 1.3rem; display: flex; align-items: center; gap: 1.2rem; color: var(--color-green);';
                        finalNote.innerHTML = '<span class="material-icons" style="font-size: 2.6rem;">track_changes</span><div>Просим отслеживать статус заявки в личном кабинете</div>';
                        alert.appendChild(finalNote);

                        footerContainer.appendChild(alert);
                        container.appendChild(footerContainer);
                    };

                    if (action === 'NEW' || action === 'VIEW') {
                        // --- СТРАНИЦА ЗАКАЗА ИЛИ ПРОСМОТРА КОНКРЕТНОЙ СПРАВКИ ---
                        
                        // 1. Стилизация заголовка
                        const h3 = span9.querySelector('h3');
                        if (h3) {
                            h3.style.fontSize = '2.2rem';
                            h3.style.fontWeight = '800';
                            h3.style.marginBottom = '2.4rem';
                        }

                        // 2. Стилизация "листа бумаги" (превью справки)
                        const paper = span9.querySelector('.bgprj');
                        if (paper) {
                            paper.style.background = 'var(--color-card)';
                            paper.style.border = '1px solid var(--color-table-border)';
                            paper.style.borderRadius = 'var(--radius-medium)';
                            paper.style.boxShadow = 'var(--shadow-main)';
                            paper.style.color = 'var(--color-text-primary)';
                            paper.style.width = '100%';
                            paper.style.boxSizing = 'border-box';
                            paper.style.padding = '2.4rem';
                            paper.querySelectorAll('font').forEach(f => {
                                if (f.style.color === 'black' || !f.style.color) f.style.color = 'inherit';
                            });
                        }

                        // 3. Стилизация блока с формой
                        const questionBlock = span9.querySelector('.question');
                        if (questionBlock) {
                            questionBlock.style.background = 'var(--color-card)';
                            questionBlock.style.padding = '2.4rem';
                            questionBlock.style.borderRadius = 'var(--radius-medium)';
                            questionBlock.style.boxShadow = 'var(--shadow-main)';
                            questionBlock.style.marginTop = '2.4rem';
                            questionBlock.style.border = 'none'; 

                            questionBlock.querySelectorAll('textarea').forEach(ta => {
                                ta.style.width = '100%';
                                ta.style.boxSizing = 'border-box';
                                ta.style.padding = '1.2rem';
                                ta.style.borderRadius = 'var(--radius-small)';
                                ta.style.border = '1px solid var(--color-table-border)';
                                ta.style.background = 'var(--color-input)';
                                ta.style.color = 'var(--color-text-primary)';
                                ta.style.fontSize = '1.3rem';
                                ta.style.fontFamily = 'inherit';
                                ta.style.marginTop = '0.8rem';
                                ta.style.resize = 'vertical';
                            });
                        }

                        // 4. Стилизация таблицы статуса (при просмотре)
                        const tables = Array.from(span9.querySelectorAll('table')).filter(t => !paper?.contains(t) && !questionBlock?.contains(t));
                        tables.forEach(table => {
                            table.style.background = 'var(--color-card)';
                            table.style.padding = '2rem';
                            table.style.borderRadius = 'var(--radius-medium)';
                            table.style.boxShadow = 'var(--shadow-main)';
                            table.style.marginTop = '2.4rem';
                            table.style.width = '100%';
                            table.style.borderCollapse = 'collapse';
                            
                            table.querySelectorAll('td').forEach(td => {
                                td.style.padding = '1rem 1.6rem';
                                td.style.fontSize = '1.3rem';
                                td.style.borderBottom = '1px solid var(--color-table-border)';
                            });
                            
                            const lastRowTds = table.querySelectorAll('tr:last-child td');
                            lastRowTds.forEach(td => td.style.borderBottom = 'none');
                        });

                        // 5. Кнопка "Создать запрос"
                        const btnWrap = span9.querySelector('.button_gray');
                        if (btnWrap) {
                            btnWrap.style.marginTop = '2.4rem';
                            btnWrap.style.width = '100%';
                            btnWrap.style.textAlign = 'left';
                            const btn = btnWrap.querySelector('button');
                            if (btn) {
                                btn.className = 'answer-btn-custom';
                                btn.innerHTML = '<span class="material-icons" style="font-size:2rem; margin-right:8px">send</span>' + btn.innerHTML;
                                btn.style.padding = '1.2rem 2.4rem';
                                btn.style.fontSize = '1.4rem';
                            }
                        }

                        // 6. Чистка
                        const grayText = span9.querySelector('font[color="#808080"]');
                        if (grayText) grayText.remove();

                        span9.querySelectorAll('br').forEach(br => {
                            if (!paper?.contains(br) && !questionBlock?.contains(br)) br.remove();
                        });

                        // Вставляем красивый подвал
                        appendCertFooter(span9);

                    } else {
                        // --- ГЛАВНАЯ СТРАНИЦА "ЗАКАЗ СПРАВОК" ---
                        
                        const allHeaders = Array.from(span9.querySelectorAll('h3'));
                        const allLists = Array.from(span9.querySelectorAll('ul.orders'));
                        
                        // Чистим span9 перед перестройкой
                        span9.innerHTML = '';

                        // 1. Заголовок и Новые справки
                        const headNew = allHeaders.find(h => h.textContent.includes('Заказать'));
                        if (headNew && allLists[0]) {
                            const h = document.createElement('h2');
                            h.textContent = headNew.textContent;
                            span9.appendChild(h);

                            const container = document.createElement('div');
                            container.className = 'advice-container';
                            allLists[0].querySelectorAll('a').forEach(link => {
                                const card = document.createElement('a');
                                card.className = 'advice-card';
                                card.href = link.href;
                                card.innerHTML = `<span class="material-icons">add_circle_outline</span><span class="advice-label">${link.textContent.trim()}</span>`;
                                container.appendChild(card);
                            });
                            span9.appendChild(container);
                        }

                        // 2. Мои справки (УМНЫЕ КАРТОЧКИ)
                        const headHistory = allHeaders.find(h => h.textContent.includes('Мои справки'));
                        const historyList = allLists.length > 1 ? allLists[1] : (allLists[0] && !headNew ? allLists[0] : null);
                        
                        if (headHistory && historyList) {
                            const h = document.createElement('h2');
                            h.textContent = headHistory.textContent;
                            h.style.marginTop = '4rem';
                            span9.appendChild(h);

                            const container = document.createElement('div');
                            container.style.display = 'flex';
                            container.style.flexDirection = 'column';
                            container.style.gap = '1.4rem';
                            container.style.marginTop = '1.5rem';

                            historyList.querySelectorAll('a').forEach(link => {
                            const fullText = link.textContent.trim();
                            
                            const match = fullText.match(/^(\d{2}\.\d{2}\.\d{4})\s+(.*?)\s+\(код запроса:\s*(.*?),\s*статус:\s*(.*?)\)$/i);

                            const card = document.createElement('a');
                            card.href = link.href;
                            card.className = 'order-card';

                            if (match) {
                                const date = match[1];
                                const title = match[2];
                                const code = match[3];
                                const rawStatus = match[4].toLowerCase();

                                let statusBg = 'var(--color-highlight)';
                                let statusColor = 'var(--color-text-secondary)';
                                let displayStatus = rawStatus; 

                                // Логика замены текста и цветов
                                if (rawStatus.includes('готов')) {
                                    statusBg = 'rgba(52, 199, 89, 0.15)';
                                    statusColor = 'var(--color-green)';
                                    displayStatus = 'ГОТОВО'; 
                                } 
                                // Добавляем условие для "в обработке"
                                else if (rawStatus.includes('обработк') || rawStatus.includes('заявка')) {
                                    statusBg = 'rgba(255, 149, 0, 0.15)';
                                    statusColor = 'var(--color-warning)';
                                    displayStatus = 'ОБРАБОТКА'; // <--- ЗАМЕНЯЕМ ТЕКСТ ЗДЕСЬ
                                } 
                                else if (rawStatus.includes('отказ') || rawStatus.includes('отклон')) {
                                    statusBg = 'rgba(255, 59, 48, 0.15)';
                                    statusColor = 'var(--color-red)';
                                    displayStatus = 'ОТКАЗ';
                                }

                                card.innerHTML = `
                                    <div class="order-icon-box">
                                        <span class="material-icons">history_edu</span>
                                    </div>
                                    <div class="order-info" style="min-width: 0; flex: 1;"> 
                                        <div class="order-meta">${date} • Запрос ${code}</div>
                                        <div class="order-title" style="white-space: normal; overflow: hidden; text-overflow: ellipsis;">${title}</div>
                                    </div>
                                    <div style="font-size: 1.05rem; font-weight: 800; text-transform: uppercase; padding: 0.5rem 1rem; border-radius: 50px; letter-spacing: 0.5px; white-space: nowrap; background: ${statusBg}; color: ${statusColor}; margin-left: 10px; flex-shrink: 0; align-self: center;">
                                        ${displayStatus}
                                    </div>
                                `;
                            } else {
                                    card.innerHTML = `
                                        <div class="order-icon-box">
                                            <span class="material-icons">history_edu</span>
                                        </div>
                                        <div class="order-info">
                                            <div class="order-title">${fullText}</div>
                                        </div>
                                    `;
                                }
                                container.appendChild(card);
                            });
                            span9.appendChild(container);
                        }

                        // 3. Вставляем красивый подвал
                        appendCertFooter(span9);
                    }
                    break;
                }

                case 'stu.signs': {
                    // 1. УНИФИКАЦИЯ ПОДМЕНЮ
                    span9.querySelectorAll('.submenu .submenu-item').forEach(span => {
                        const link = span.querySelector('a');
                        if (link) span.replaceWith(link);
                        else {
                            const b = document.createElement('b');
                            b.textContent = span.textContent.trim();
                            span.replaceWith(b);
                        }
                    });

                    // 2. ГЛОБАЛЬНАЯ ОЧИСТКА ТАБЛИЦ
                    span9.querySelectorAll('table.common').forEach(table => {
                        table.removeAttribute('width');
                        table.style.width = "100%";
                        table.querySelectorAll('tr, td, th').forEach(el => {
                            el.removeAttribute('width');
                            el.removeAttribute('style');
                            el.removeAttribute('bgcolor');
                            el.removeAttribute('align');
                            el.removeAttribute('valign');
                        });
                    });

                    // 3. ОБРАБОТКА "ОЦЕНКИ ЗА СЕССИИ"
                    if (pageMode === 'session' || !pageMode) {
                        const submenu = span9.querySelector('.submenu');
                        
                        // Подгружаем библиотеку графиков Chart.js
                        if (!window.Chart) {
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                            document.head.appendChild(script);
                        }

                        // --- ДОБАВЛЕНИЕ ПОИСКА И КНОПКИ "АНАЛИТИКА" ---
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'teacher-search-wrapper';
                        searchContainer.style.display = 'flex';
                        searchContainer.style.gap = '1.2rem';
                        searchContainer.style.maxWidth = '650px';
                        searchContainer.style.margin = '0 auto 3rem auto';
                        
                        // Обе капсулы имеют класс search-capsule и flex: 1 для равного размера
                        searchContainer.innerHTML = `
                            <div class="search-capsule" style="flex: 1; min-width: 0;">
                                <span class="material-icons search-icon">filter_list</span>
                                <input type="text" class="search-input signs-local-input" placeholder="Поиск">
                            </div>
                            <button class="search-capsule analytics-btn" style="flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; background: var(--color-card); color: var(--color-text-primary); border: 1px solid var(--color-table-border); cursor: pointer; font-size: 1.4rem; font-weight: 600; padding: 0 1.6rem; transition: all 0.2s; text-decoration: none;">
                                <span class="material-icons" style="margin-right: 8px; color: var(--color-accent); font-size: 2.2rem; position: static;">insights</span> Аналитика
                            </button>
                        `;
                        if (submenu) submenu.after(searchContainer);

                        const signsTables = span9.querySelectorAll('table.common');
                        
                        // Шаг 1. Разделение таблиц по триместрам
                        signsTables.forEach(table => {
                            const rows = Array.from(table.querySelectorAll('tr'));
                            const isHeader = (r) => r.textContent.toLowerCase().includes('дисциплина') && r.textContent.toLowerCase().includes('оценка');
                            const headerRow = rows.find(isHeader);
                            
                            let currentTbody = null;
                            let validSplit = false;

                            rows.forEach(row => {
                                const cells = row.children;
                                if (cells.length === 1 && (cells[0].tagName === 'TH' || cells[0].classList.contains('subheader'))) {
                                    validSplit = true;
                                    
                                    const title = document.createElement('h3');
                                    title.className = 'term-title';
                                    title.style.marginTop = '2rem';
                                    title.textContent = cells[0].textContent.trim();
                                    table.parentNode.insertBefore(title, table);

                                    const wrapper = document.createElement('div');
                                    wrapper.className = 'wide-table-wrapper';
                                    
                                    const newTable = document.createElement('table');
                                    newTable.className = 'common session-table-v6';
                                    
                                    if (headerRow) {
                                        const thead = document.createElement('thead');
                                        thead.appendChild(headerRow.cloneNode(true));
                                        newTable.appendChild(thead);
                                    }
                                    
                                    currentTbody = document.createElement('tbody');
                                    newTable.appendChild(currentTbody);
                                    wrapper.appendChild(newTable); 
                                    table.parentNode.insertBefore(wrapper, table); 
                                } 
                                else if (currentTbody && !isHeader(row) && cells.length > 1) {
                                    currentTbody.appendChild(row);
                                }
                            });
                            if (validSplit) table.remove();
                        });

                        // Шаг 2. Расчет среднего балла и создание Flex-заголовков
                        const sessionTables = span9.querySelectorAll('.session-table-v6');
                        sessionTables.forEach(table => {
                            const wrapper = table.closest('.wide-table-wrapper');
                            const h3 = wrapper ? wrapper.previousElementSibling : null;
                            if (!h3 || !h3.classList.contains('term-title')) return;

                            let sum = 0, count = 0, hasFail = false, hasPass = false, hasAny = false;
                            const rows = table.querySelectorAll('tbody tr');
                            rows.forEach(r => {
                                const cells = r.querySelectorAll('td');
                                if (cells.length >= 2) {
                                    const gradeText = cells[1].textContent.trim().toLowerCase();
                                    if (gradeText && gradeText !== 'н') {
                                        hasAny = true;
                                        let num = parseInt(gradeText, 10);
                                        
                                        if (gradeText.includes('незач') || gradeText === '2') {
                                            hasFail = true;
                                            sum += 2; // Считаем незачет как 2 для аналитики
                                            count++;
                                        }
                                        else if (gradeText.includes('зач')) {
                                            hasPass = true;
                                        }
                                        else if (!isNaN(num) && num >= 3 && num <= 5) {
                                            sum += num;
                                            count++;
                                        }
                                    }
                                }
                            });

                            // Высчитываем средний балл даже для триместров с незачетом (для графика)
                            const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
                            wrapper.setAttribute('data-term-avg', avg);
                            wrapper.setAttribute('data-term-name', h3.textContent.trim());

                            const headerContainer = document.createElement('div');
                            headerContainer.className = 'subject-header-flex session-term-header-group'; 
                            h3.parentNode.insertBefore(headerContainer, h3);
                            headerContainer.appendChild(h3);

                            const capsule = document.createElement('div');
                            capsule.className = 'subject-score-capsule';
                            
                            // Отображение капсулы
                            if (!hasAny) { 
                                capsule.textContent = 'Нет оценок'; 
                                capsule.style.background = 'var(--color-highlight)'; 
                                capsule.style.color = 'var(--color-text-secondary)'; 
                            }
                            else if (hasFail) { 
                                capsule.textContent = 'НЕЗАЧЕТ'; 
                                capsule.style.background = 'var(--color-red)'; 
                                capsule.style.color = '#fff'; 
                            }
                            else if (count > 0) {
                                capsule.textContent = `${avg} / 5`;
                                const p = (avg / 5) * 100;
                                if (p < 41) capsule.style.background = 'var(--color-red)';
                                else if (p < 61) capsule.style.background = 'var(--color-yellow)';
                                else if (p < 81) capsule.style.background = '#8BC34A';
                                else capsule.style.background = 'var(--color-green)';
                                capsule.style.color = (p >= 41 && p < 61) ? '#000' : '#fff';
                            } 
                            else if (hasPass) { 
                                capsule.textContent = 'ЗАЧЕТ'; 
                                capsule.style.background = 'var(--color-green)'; 
                                capsule.style.color = '#fff'; 
                            }
                            headerContainer.appendChild(capsule);
                            
                            wrapper.classList.add('session-term-table-group');
                        });

                        // --- ШАГ 3. СОЗДАНИЕ И ЛОГИКА ОКНА АНАЛИТИКИ ---
                        
                        const overlay = document.createElement('div');
                        overlay.className = 'analytics-overlay';
                        document.body.appendChild(overlay);
                        
                        const modal = document.createElement('div');
                        modal.className = 'analytics-modal';
                        modal.innerHTML = `
                            <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="ui-dialog-title">Ваша успеваемость</span>
                                <button class="close-analytics" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                            </div>
                            <div class="ui-dialog-content" style="padding: 2.4rem;">
                                <div id="analytics-empty" style="display:none; text-align:center; padding: 3rem; color:var(--color-text-secondary); font-size:1.4rem;">
                                    Недостаточно данных с оценками (цифрами) для построения графиков.
                                </div>
                                <div id="analytics-content">
                                    <div style="height: 250px; width: 100%; margin-bottom: 2rem; position: relative;">
                                        <canvas id="gradesChart"></canvas>
                                    </div>
                                    <div class="analytics-stats" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.6rem;">
                                        <div class="stat-box">
                                            <span class="stat-box-title">Лучший триместр</span>
                                            <span class="stat-box-value good" id="stat-best-term">-</span>
                                        </div>
                                        <div class="stat-box">
                                            <span class="stat-box-title">Худший триместр</span>
                                            <span class="stat-box-value bad" id="stat-worst-term">-</span>
                                        </div>
                                        <div class="stat-box" style="grid-column: 1 / -1;">
                                            <span class="stat-box-title">Статистика по предметам</span>
                                            <div style="font-size:1.4rem; margin-top:0.8rem; line-height:1.6; color: var(--color-text-primary);">
                                                <div><strong style="color:var(--color-green);">Закрыто на «Отлично»:</strong> <span id="stat-5-count">0</span> предм.</div>
                                                <div style="margin-top:1.2rem;">
                                                    <strong style="color:var(--color-red);">Трудные предметы (оценка 3 и ниже):</strong>
                                                    <div id="stat-bad-subj" style="margin-top: 0.5rem; color: var(--color-text-secondary);">Нет</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        document.body.appendChild(modal);

                        const closeAnalytics = () => {
                            overlay.classList.remove('active');
                            modal.classList.remove('active');
                        };
                        overlay.addEventListener('click', closeAnalytics);
                        modal.querySelector('.close-analytics').addEventListener('click', closeAnalytics);

                        // Открытие и рендер графиков
                        searchContainer.querySelector('.analytics-btn').addEventListener('click', () => {
                            if (typeof Chart === 'undefined') {
                                alert('Графики еще подгружаются, подождите пару секунд...');
                                return;
                            }
                            
                            const termsData =[];
                            const subjectsData =[];
                            
                            document.querySelectorAll('.session-term-table-group').forEach(wrapper => {
                                const rawTermName = wrapper.getAttribute('data-term-name');
                                const avg = parseFloat(wrapper.getAttribute('data-term-avg'));
                                
                                if (rawTermName) {
                                    // Вытаскиваем номер триместра для правильной хронологической сортировки
                                    const numMatch = rawTermName.match(/(\d+)\s*трим/i);
                                    const termNum = numMatch ? parseInt(numMatch[1], 10) : 0;

                                    // Сокращаем "10 триместр (5 курс)..." до "10 трим."
                                    let cleanName = rawTermName.split(',')[0].replace(/\(.*\)/, '').replace(/триместр/i, 'трим.').trim();
                                    
                                    if (avg > 0) {
                                        termsData.push({ name: cleanName, avg: avg, num: termNum });
                                    }
                                }
                                
                                wrapper.querySelectorAll('tbody tr').forEach(row => {
                                    const cells = row.querySelectorAll('td');
                                    if (cells.length >= 2) {
                                        const subj = cells[0].textContent.trim();
                                        const gradeText = cells[1].textContent.trim().toLowerCase();
                                        
                                        let num = parseInt(gradeText, 10);
                                        if (gradeText.includes('незач')) num = 2; // Незачет идет как 2
                                        
                                        if (!isNaN(num) && num >= 2 && num <= 5) {
                                            subjectsData.push({ subj, grade: num });
                                        }
                                    }
                                });
                            });
                            
                            // Жесткая сортировка по возрастанию номера триместра (от 1 до 11)
                            termsData.sort((a, b) => a.num - b.num);
                            
                            if (termsData.length === 0) {
                                document.getElementById('analytics-content').style.display = 'none';
                                document.getElementById('analytics-empty').style.display = 'block';
                            } else {
                                document.getElementById('analytics-content').style.display = 'block';
                                document.getElementById('analytics-empty').style.display = 'none';
                                
                                const bestTerm = [...termsData].sort((a,b) => b.avg - a.avg)[0];
                                const worstTerm = [...termsData].sort((a,b) => a.avg - b.avg)[0];
                                
                                document.getElementById('stat-best-term').textContent = `${bestTerm.name} (${bestTerm.avg})`;
                                document.getElementById('stat-worst-term').textContent = `${worstTerm.name} (${worstTerm.avg})`;
                                
                                let count5 = subjectsData.filter(s => s.grade === 5).length;
                                let badSubj =[...new Set(subjectsData.filter(s => s.grade <= 3).map(s => s.subj))];
                                
                                document.getElementById('stat-5-count').textContent = count5;
                                document.getElementById('stat-bad-subj').innerHTML = badSubj.length > 0 
                                    ? `<ul style="margin: 0; padding-left: 1.8rem;">${badSubj.map(s => `<li style="margin-bottom:6px;">${s}</li>`).join('')}</ul>`
                                    : 'Нет таких, отличная работа! 🥳';
                                
                                const ctx = document.getElementById('gradesChart').getContext('2d');
                                if(window.etisChartInstance) window.etisChartInstance.destroy(); 
                                
                                const textColor = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#000';
                                const accentColor = getComputedStyle(document.body).getPropertyValue('--color-accent').trim() || '#007AFF';
                                const gridColor = getComputedStyle(document.body).getPropertyValue('--color-table-border').trim() || '#ddd';
                                
                                window.etisChartInstance = new Chart(ctx, {
                                    type: 'line',
                                    data: {
                                        labels: termsData.map(t => t.name), 
                                        datasets:[{
                                            label: ' Средний балл',
                                            data: termsData.map(t => t.avg),
                                            borderColor: accentColor,
                                            backgroundColor: accentColor + '22',
                                            borderWidth: 3,
                                            pointBackgroundColor: accentColor,
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2,
                                            pointRadius: 5,
                                            pointHoverRadius: 7,
                                            fill: true,
                                            tension: 0.4 
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { 
                                                min: 2.0, // Опустили минимум до 2.0 из-за незачетов
                                                max: 5.0, 
                                                ticks: { color: textColor, font: {size: 13} }, 
                                                grid: { color: gridColor } 
                                            },
                                            x: { 
                                                ticks: { color: textColor, font: {size: 13} }, 
                                                grid: { display: false } 
                                            }
                                        }
                                    }
                                });
                            }
                            
                            overlay.classList.add('active');
                            modal.classList.add('active');
                        });

                        // --- ШАГ 4. ЛОГИКА ФИЛЬТРАЦИИ ПОИСКА ПО ПРЕДМЕТАМ ---
                        const filterInput = searchContainer.querySelector('.signs-local-input');
                        filterInput.addEventListener('input', (e) => {
                            const val = e.target.value.toLowerCase().trim();
                            const headers = document.querySelectorAll('.session-term-header-group');
                            const wrappers = document.querySelectorAll('.session-term-table-group');

                            headers.forEach((header, index) => {
                                const wrapper = wrappers[index];
                                if (!wrapper) return;
                                
                                const rows = Array.from(wrapper.querySelectorAll('tbody tr'));
                                let visibleRowsCount = 0;

                                rows.forEach(row => {
                                    const subject = row.cells[0]?.textContent.toLowerCase() || "";
                                    const teacher = row.cells[3]?.textContent.toLowerCase() || "";

                                    if (val === "" || subject.includes(val) || teacher.includes(val)) {
                                        row.style.display = "";
                                        visibleRowsCount++;
                                    } else {
                                        row.style.display = "none";
                                    }
                                });

                                if (val !== "" && visibleRowsCount === 0) {
                                    header.style.setProperty('display', 'none', 'important');
                                    wrapper.style.setProperty('display', 'none', 'important');
                                } else {
                                    header.style.setProperty('display', 'flex', 'important');
                                    wrapper.style.setProperty('display', 'block', 'important');
                                }
                            });
                        });
                    }

                    // 4. ОБРАБОТКА "ОЦЕНКИ В ТРИМЕСТРЕ"
                    if (pageMode === 'current' || (!pageMode && !span9.querySelector('.session-table-v6'))) {
                        
                        const submenus = span9.querySelectorAll('.submenu');
                        const lastSubmenu = submenus[submenus.length - 1];

                        // --- ДОБАВЛЕНИЕ ПОИСКА И КНОПКИ "РЕЙТИНГ" ---
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'teacher-search-wrapper term-search-wrapper';
                        searchContainer.style.display = 'flex';
                        searchContainer.style.gap = '1.2rem';
                        searchContainer.style.maxWidth = '650px';
                        searchContainer.style.margin = '1rem auto 3rem auto';
                        
                        searchContainer.innerHTML = `
                            <div class="search-capsule" style="flex: 1; min-width: 0;">
                                <span class="material-icons search-icon">filter_list</span>
                                <input type="text" class="search-input term-local-input" placeholder="Поиск">
                            </div>
                            <button class="search-capsule analytics-btn" style="flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; background: var(--color-card); color: var(--color-text-primary); border: 1px solid var(--color-table-border); cursor: pointer; font-size: 1.4rem; font-weight: 600; padding: 0 1.6rem; transition: all 0.2s; text-decoration: none;">
                                <span class="material-icons" style="margin-right: 8px; color: var(--color-accent); font-size: 2.2rem; position: static;">emoji_events</span> Топ предметов
                            </button>
                        `;
                        if (lastSubmenu) lastSubmenu.after(searchContainer);

                        // --- ПАРСИНГ ТАБЛИЦ И ДОБАВЛЕНИЕ КАПСУЛ ---
                        span9.querySelectorAll('table.common').forEach(table => {
                            table.classList.add('term-table-v6');
                            if (!table.parentNode.classList.contains('wide-table-wrapper')) {
                                const wrapper = document.createElement('div');
                                wrapper.className = 'wide-table-wrapper term-subject-group';
                                table.parentNode.insertBefore(wrapper, table);
                                wrapper.appendChild(table);
                            }
                            
                            const wrapper = table.closest('.wide-table-wrapper');
                            const h3 = wrapper.previousElementSibling;
                            if (!h3 || h3.tagName !== 'H3') return;
                            
                            const rows = Array.from(table.querySelectorAll('tr'));
                            const totalRow = rows.find(r => r.textContent.toLowerCase().includes('всего:'));
                            
                            let calculatedCurrent = 0, calculatedMax = 0, hasAnyGrades = false;
                            
                            if (totalRow) {
                                rows.forEach(r => {
                                    if(r.querySelector('th') || r === totalRow) return;
                                    const cells = r.querySelectorAll('td');
                                    if(cells.length >= 7) {
                                        const curStr = cells[5].textContent.trim();
                                        const maxStr = cells[6].textContent.trim();
                                        if(curStr !== '' && curStr !== 'н') {
                                            hasAnyGrades = true;
                                            calculatedCurrent += parseInt(curStr, 10) || 0;
                                            calculatedMax += parseInt(maxStr, 10) || 0;
                                        }
                                    }
                                });
                                totalRow.remove();
                            }

                            wrapper.setAttribute('data-subject-name', h3.textContent.trim());
                            wrapper.setAttribute('data-score-current', calculatedCurrent);
                            wrapper.setAttribute('data-score-max', calculatedMax);

                            const headerContainer = document.createElement('div');
                            headerContainer.className = 'subject-header-flex term-header-group';
                            h3.parentNode.insertBefore(headerContainer, h3);
                            headerContainer.appendChild(h3);
                            
                            const capsule = document.createElement('div');
                            capsule.className = 'subject-score-capsule';
                            capsule.textContent = `${hasAnyGrades ? calculatedCurrent : 0} / ${hasAnyGrades ? calculatedMax : 0}`;
                            
                            if (!hasAnyGrades || calculatedMax === 0) {
                                capsule.style.background = 'var(--color-highlight)';
                                capsule.style.color = 'var(--color-text-secondary)';
                            } else {
                                const p = (calculatedCurrent / calculatedMax) * 100;
                                if (p < 41) capsule.style.background = 'var(--color-red)';
                                else if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                                else if (p < 81) capsule.style.background = '#8BC34A';
                                else capsule.style.background = 'var(--color-green)';
                                if (p < 41 || p >= 61) capsule.style.color = '#fff';
                            }
                            headerContainer.appendChild(capsule);
                        });

                        // --- ЛОГИКА ФИЛЬТРАЦИИ ---
                        const filterInput = searchContainer.querySelector('.term-local-input');
                        filterInput.addEventListener('input', (e) => {
                            const val = e.target.value.toLowerCase().trim();
                            const headers = document.querySelectorAll('.term-header-group');
                            const wrappers = document.querySelectorAll('.term-subject-group');

                            headers.forEach((header, index) => {
                                const wrapper = wrappers[index];
                                if (!wrapper) return;

                                // Достаем только название предмета (без баллов в капсуле)
                                const h3 = header.querySelector('h3');
                                const subjectName = h3 ? h3.textContent.toLowerCase() : header.textContent.toLowerCase();
                                
                                // Совпадает ли само название предмета с поиском?
                                const isSubjectMatch = subjectName.includes(val);
                                
                                const rows = Array.from(wrapper.querySelectorAll('tr'));
                                let visibleRowsCount = 0;

                                rows.forEach(row => {
                                    if (row.querySelector('th')) {
                                        row.style.display = '';
                                        return;
                                    }

                                    const rowContent = row.textContent.toLowerCase();

                                    // Показываем строку, если: 
                                    // 1. Поиск пуст 
                                    // 2. Искали название самого предмета (показываем все его темы) 
                                    // 3. Нашлась конкретная тема/преподаватель
                                    if (val === "" || isSubjectMatch || rowContent.includes(val)) {
                                        row.style.display = '';
                                        visibleRowsCount++;
                                    } else {
                                        row.style.display = 'none';
                                    }
                                });

                                // Если ни предмет не совпал, ни одна из его тем — скрываем всё
                                if (val !== "" && !isSubjectMatch && visibleRowsCount === 0) {
                                    header.style.setProperty('display', 'none', 'important');
                                    wrapper.style.setProperty('display', 'none', 'important');
                                } else {
                                    header.style.setProperty('display', 'flex', 'important');
                                    wrapper.style.setProperty('display', 'block', 'important');
                                }
                            });
                        });

                        // --- ОКНО РЕЙТИНГА ---
                        let overlay = document.querySelector('.analytics-overlay');
                        let modal = document.querySelector('.analytics-modal');

                        if (!overlay || !modal) {
                            overlay = document.createElement('div');
                            overlay.className = 'analytics-overlay';
                            document.body.appendChild(overlay);

                            modal = document.createElement('div');
                            modal.className = 'analytics-modal';
                            document.body.appendChild(modal);
                        }

                        searchContainer.querySelector('.analytics-btn').addEventListener('click', () => {
                            // Структура модального окна без графика
                            modal.innerHTML = `
                                <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                                    <span class="ui-dialog-title">Топ предметов триместра</span>
                                    <button class="close-analytics" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                                </div>
                                <div class="ui-dialog-content" style="padding: 2.4rem;">
                                    <div id="analytics-empty" style="display:none; text-align:center; padding: 3rem; color:var(--color-text-secondary); font-size:1.4rem;">
                                        Недостаточно данных (баллов) для построения рейтинга.
                                    </div>
                                    <div id="analytics-content">
                                        <!-- Здесь будет сгенерированный список -->
                                    </div>
                                </div>
                            `;

                            const closeAnalytics = () => {
                                overlay.classList.remove('active');
                                modal.classList.remove('active');
                            };
                            overlay.onclick = closeAnalytics;
                            modal.querySelector('.close-analytics').onclick = closeAnalytics;

                            // Сбор данных
                            const subjectsData =[];
                            document.querySelectorAll('.term-subject-group').forEach(wrapper => {
                                const name = wrapper.getAttribute('data-subject-name');
                                const current = parseInt(wrapper.getAttribute('data-score-current'), 10) || 0;
                                const max = parseInt(wrapper.getAttribute('data-score-max'), 10) || 0;

                                if (max > 0) {
                                    const percent = Math.round((current / max) * 100);
                                    // Чистим название от мусора ЕТИСа, если есть
                                    let cleanName = name.replace(/\[.*?\]/g, '').trim();
                                    subjectsData.push({ name: cleanName, current, max, percent });
                                }
                            });

                            // Сортировка по убыванию процентов
                            subjectsData.sort((a, b) => b.percent - a.percent);

                            if (subjectsData.length === 0) {
                                document.getElementById('analytics-content').style.display = 'none';
                                document.getElementById('analytics-empty').style.display = 'block';
                            } else {
                                document.getElementById('analytics-content').style.display = 'block';
                                document.getElementById('analytics-empty').style.display = 'none';

                                // Генерация HTML списка
                                let leaderboardHtml = '<div class="leaderboard-list">';
                                
                                subjectsData.forEach((subj, index) => {
                                    // Определяем стили для мест
                                    let rankClass = '';
                                    let rankContent = index + 1; 
                                    
                                    if (index === 0) { rankClass = 'rank-1'; }
                                    else if (index === 1) { rankClass = 'rank-2'; }
                                    else if (index === 2) { rankClass = 'rank-3'; }

                                    // Цвет капсулы с процентами
                                    let colorBg = 'var(--color-green)';
                                    if (subj.percent < 41) colorBg = 'var(--color-red)';
                                    else if (subj.percent < 61) colorBg = 'var(--color-yellow)';
                                    else if (subj.percent < 81) colorBg = '#8BC34A';

                                    let colorText = (subj.percent >= 41 && subj.percent < 61) ? '#000' : '#fff';

                                    leaderboardHtml += `
                                        <div class="leaderboard-item">
                                            <div class="leaderboard-rank ${rankClass}">${rankContent}</div>
                                            <div class="leaderboard-info">
                                                <div class="leaderboard-name">${subj.name}</div>
                                                <div class="leaderboard-meta">Набрано: ${subj.current} из ${subj.max}</div>
                                            </div>
                                            <div class="subject-score-capsule" style="background:${colorBg}; color:${colorText}; font-size:1.25rem; padding: 0.6rem 1.2rem; margin-left: 0;">
                                                ${subj.percent}%
                                            </div>
                                        </div>
                                    `;
                                });
                                leaderboardHtml += '</div>';

                                document.getElementById('analytics-content').innerHTML = leaderboardHtml;
                            }

                            overlay.classList.add('active');
                            modal.classList.add('active');
                        });
                    }

                    // 5. ОБРАБОТКА "ОЦЕНКИ В ДИПЛОМ"
                    if (pageMode === 'diplom') {
                        const table = span9.querySelector('table.common');
                        if (table) {
                            const oldAvg = Array.from(span9.querySelectorAll('div')).find(d => d.textContent.includes('Средний балл') && !d.classList.contains('subject-score-capsule'));
                            if (oldAvg) oldAvg.style.display = 'none';
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            table.parentNode.insertBefore(wrapper, table);
                            wrapper.appendChild(table);
                            let sum = 0, count = 0, hasFail = false;
                            const rows = table.querySelectorAll('tr');
                            rows.forEach(row => {
                                const cells = row.querySelectorAll('td');
                                if (cells.length >= 2) {
                                    const text = cells[1].textContent.toLowerCase().trim();
                                    if (text.includes('отлично')) { sum += 5; count++; }
                                    else if (text.includes('хорошо')) { sum += 4; count++; }
                                    else if (text.includes('удовлетворительно') || text.includes('удовл.')) { sum += 3; count++; }
                                    else if (text.includes('неудовлетворительно') || text.includes('незачет') || text.includes('незачёт')) { hasFail = true; }
                                }
                            });
                            const headerContainer = document.createElement('div');
                            headerContainer.className = 'subject-header-flex';
                            const title = document.createElement('h3');
                            title.textContent = 'Выписка оценок к диплому';
                            headerContainer.appendChild(title);
                            const capsule = document.createElement('div');
                            capsule.className = 'subject-score-capsule';
                            if (hasFail) { capsule.textContent = 'ЕСТЬ ДОЛГИ'; capsule.style.background = 'var(--color-red)'; capsule.style.color = '#fff'; }
                            else if (count > 0) {
                                const avg = Math.round((sum / count) * 100) / 100;
                                capsule.textContent = `${avg} / 5`;
                                const p = (avg / 5) * 100;
                                if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                                else if (p < 81) { capsule.style.background = '#8BC34A'; capsule.style.color = '#fff'; }
                                else { capsule.style.background = 'var(--color-green)'; capsule.style.color = '#fff'; }
                                if (avg >= 4.75) capsule.style.boxShadow = '0 0 0 2px #FFD700';
                            } else {
                                capsule.textContent = 'Нет оценок'; capsule.style.background = 'var(--color-highlight)'; capsule.style.color = 'var(--color-text-secondary)';
                            }
                            headerContainer.appendChild(capsule);
                            span9.insertBefore(headerContainer, wrapper);
                        }
                    }
                    break;
                }

                case 'stu.electr':
                const resTable = document.getElementById('resources');
                if (!resTable) break;

                // 1. Убираем описание в подвал
                const introText = span9.querySelector('p[style*="font-size:11pt"]');
                if (introText) {
                    introText.className = 'electr-description';
                    introText.removeAttribute('style');
                    introText.querySelectorAll('br').forEach(br => br.remove());
                    span9.appendChild(introText);
                }

                // 2. Очистка лишнего
                const accessHeader = Array.from(span9.querySelectorAll('h3')).find(h => h.textContent.includes('Ресурсы, доступ к которым'));
                if (accessHeader) accessHeader.remove();

                const rows = Array.from(resTable.querySelectorAll('tr'));
                let currentTable = null;

                // Функция для добавления эффекта копирования
                const addCopyLogic = (cell) => {
                    const text = cell.textContent.trim();
                    // Не вешаем копирование на пустые ячейки, пояснения и заголовки
                    if (!text || text.includes('от личного кабинета') || text.toLowerCase().includes('код доступа') || text.includes('Логин')) return;

                    cell.style.cursor = 'pointer';
                    cell.classList.add('copy-pass');
                    
                    cell.addEventListener('click', () => {
                        navigator.clipboard.writeText(text).then(() => {
                            const originalHTML = cell.innerHTML;
                            cell.textContent = 'Скопировано!';
                            cell.style.color = 'var(--color-green)';
                            setTimeout(() => {
                                cell.innerHTML = originalHTML;
                                cell.style.color = '';
                            }, 800);
                        });
                    });
                };

                rows.forEach((row) => {
                    const catHeader = row.querySelector('th[colspan="3"]');
                    const rowText = row.textContent.toLowerCase();

                    // Пропускаем оригинальный блок LDAP и его тех. строки
                    if (catHeader && rowText.includes('ldap/campus')) { row.remove(); return; }
                    if (rowText.includes('логин / пароль') && rowText.includes('личного кабинета') && !rowText.includes('bbb')) { row.remove(); return; }

                    if (catHeader) {
                        let titleText = catHeader.textContent.trim();
                        if (titleText.toLowerCase() === 'видеоресурс') {
                            titleText = 'ВИДЕОРЕСУРС и LDAP/CAMPUS';
                        }

                        const block = document.createElement('div');
                        block.className = 'day resource-block';
                        
                        const title = document.createElement('h3');
                        title.textContent = titleText;
                        block.appendChild(title);

                        currentTable = document.createElement('table');
                        currentTable.className = 'common resource-table';
                        block.appendChild(currentTable);
                        
                        span9.insertBefore(block, introText);
                        row.remove();
                    } else if (currentTable) {
                        // Удаляем "шапки" внутри категорий (Логин / Пароль)
                        if (row.querySelector('th') || (rowText.includes('логин') && rowText.includes('пароль'))) {
                            row.remove();
                            return;
                        }

                        const cells = row.querySelectorAll('td');
                        if (cells.length === 3) {
                            addCopyLogic(cells[1]); // Копирование Логина
                            addCopyLogic(cells[2]); // Копирование Пароля
                        } else if (cells.length === 2) {
                            addCopyLogic(cells[1]); // Копирование единственного поля (как в BOOK.RU)
                        }
                        
                        currentTable.appendChild(row);
                    }
                });

                resTable.remove();
                break;
            
                case 'stu_plus.advice':
                    const adviceList = span9.querySelector('ul');
                    if (!adviceList) break;

                    const container = document.createElement('div');
                    container.className = 'advice-container';

                    const links = adviceList.querySelectorAll('a');
                    links.forEach(link => {
                        const card = document.createElement('a');
                        card.className = 'advice-card';
                        card.href = link.href;
                        card.target = '_blank';

                        const icon = document.createElement('span');
                        icon.className = 'material-icons';
                        // Иконка выставится через CSS по атрибуту href

                        const text = document.createElement('span');
                        text.className = 'advice-label';
                        text.textContent = link.textContent.trim();

                        card.appendChild(icon);
                        card.appendChild(text);
                        container.appendChild(card);
                    });

                    // Заменяем старый список новым контейнером
                    adviceList.parentNode.replaceChild(container, adviceList);
                    
                    // Чистим заголовок h2
                    const h2 = span9.querySelector('h2');
                    if (h2) h2.style.marginBottom = '0';
                    
                    break;

                case 'stu.ses':
                    // 1. Ищем данные ПЕРЕД очисткой
                    const allElements = Array.from(span9.childNodes);
                    
                    // Ищем название направления (обычно это самый первый h2 или h3)
                    const majorHeader = span9.querySelector('h2') || span9.querySelector('h3');
                    const majorName = majorHeader ? majorHeader.textContent.trim() : "";

                    // Ищем ссылку на PDF (ищем элемент, где есть текст "Текст стандарта")
                    const pdfElement = Array.from(span9.querySelectorAll('p, div, font')).find(el => el.textContent.includes('Текст стандарта'));
                    const pdfHTML = pdfElement ? pdfElement.innerHTML : "";

                    // 2. Собираем карточки компетенций
                    const competencyBlocks = [];
                    const headers = Array.from(span9.querySelectorAll('h3'));

                    headers.forEach(h => {
                        const title = h.textContent.trim();
                        // Игнорируем общий заголовок, берем только подразделы
                        if (title.includes('компетенции') && title !== 'Компетенции выпускника') {
                            const card = document.createElement('div');
                            card.className = 'day resource-block';
                            
                            const cardTitle = document.createElement('h3');
                            cardTitle.textContent = title;
                            card.appendChild(cardTitle);

                            const content = document.createElement('div');
                            content.style.padding = '0 2rem 2rem 2rem';
                            content.style.fontSize = '1.3rem';
                            content.style.lineHeight = '1.6';

                            // Собираем всё, что идет после заголовка до следующего h3
                            let next = h.nextElementSibling;
                            while (next && next.tagName !== 'H3') {
                                const clone = next.cloneNode(true);
                                if (clone.style) clone.removeAttribute('style'); // Чистим старые шрифты
                                content.appendChild(clone);
                                next = next.nextElementSibling;
                            }
                            card.appendChild(content);
                            competencyBlocks.push(card);
                        }
                    });

                    // 3. Полностью перестраиваем страницу
                    span9.innerHTML = '';

                    // Заголовок страницы
                    const mainTitle = document.createElement('h2');
                    mainTitle.textContent = 'Компетенции выпускника';
                    mainTitle.style.marginBottom = '2.4rem';
                    span9.appendChild(mainTitle);

                    // Добавляем карточки
                    competencyBlocks.forEach(block => span9.appendChild(block));

                    // 4. Создаем футер (информация о стандарте и ссылка)
                    if (majorName || pdfHTML) {
                        const footer = document.createElement('div');
                        footer.className = 'electr-description'; // Используем стиль плашки
                        footer.style.marginTop = '4rem';
                        footer.style.textAlign = 'center';

                        // Добавляем название направления
                        if (majorName) {
                            const nameDiv = document.createElement('div');
                            nameDiv.style.fontWeight = 'bold';
                            nameDiv.style.marginBottom = '1rem';
                            nameDiv.style.color = 'var(--color-text-primary)';
                            nameDiv.textContent = majorName;
                            footer.appendChild(nameDiv);
                        }

                        // Добавляем ссылку на стандарт
                        if (pdfHTML) {
                            const linkDiv = document.createElement('div');
                            linkDiv.innerHTML = pdfHTML;
                            // Убираем возможные инлайновые стили у вложенных тегов
                            linkDiv.querySelectorAll('*').forEach(el => el.removeAttribute('style'));
                            footer.appendChild(linkDiv);
                        }

                        span9.appendChild(footer);
                    }
                    break;

                case 'stu.library': {
                    const pageMode = new URLSearchParams(window.location.search).get('p_mode');

                    // 1. Инфо-текст в плашку вниз (универсально для всех вкладок)
                    const libIntro = Array.from(span9.querySelectorAll('p')).find(p => p.textContent.includes('Для чтения полных текстов'));
                    if (libIntro) {
                        libIntro.className = 'electr-description';
                        libIntro.style.marginTop = '30px';
                        span9.appendChild(libIntro);
                    }

                    // 2. РЕЖИМ КАТАЛОГА (Поиск по всей базе)
                    if (pageMode === 'catalog') {
                        const searchWrap = span9.querySelector('.wrap');
                        if (searchWrap) {
                            const searchContainer = document.createElement('div');
                            searchContainer.className = 'teacher-search-wrapper';
                            searchContainer.innerHTML = `
                                <div class="search-capsule">
                                    <span class="material-icons search-icon">search</span>
                                    <input type="text" id="filter" class="search-input" placeholder="Введите название или автора...">
                                </div>
                            `;
                            searchWrap.replaceWith(searchContainer);

                            const input = document.getElementById('filter');
                            const recordList = document.getElementById('record_list');
                            // Ссылка на гифку загрузки из оригинального кода ЕТИСа
                            const loadGif = "/etis/dojo/dijit/themes/tundra/images/loading.gif";

                            const performSearch = () => {
                                const val = input.value.trim();
                                if (val.length < 2) return;
                                
                                const filter = encodeURIComponent(val);
                                $(recordList).html(`<div style="padding:20px; text-align:center;"><img src="${loadGif}"> Загрузка...</div>`);
                                
                                $(recordList).load("lib_search.get_books?p_filter=" + filter, function() {
                                    const table = recordList.querySelector('table');
                                    if (table) {
                                        const wrapper = document.createElement('div');
                                        wrapper.className = 'wide-table-wrapper';
                                        table.parentNode.insertBefore(wrapper, table);
                                        wrapper.appendChild(table);
                                        table.style.minWidth = "850px";
                                    }
                                });
                            };

                            // Поиск по нажатию Enter
                            input.addEventListener('keypress', (e) => {
                                if (e.key === 'Enter') performSearch();
                            });
                        }
                    } 
                    // 3. РЕЖИМ РЕКОМЕНДАЦИЙ (Списки по предметам)
                    else if (pageMode === 'recommend' || (!pageMode && span9.querySelector('h3'))) {
                        const submenu = span9.querySelector('.submenu');
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'teacher-search-wrapper';
                        searchContainer.innerHTML = `
                            <div class="search-capsule">
                                <span class="material-icons search-icon">filter_list</span>
                                <input type="text" class="search-input lib-local-input" placeholder="Поиск">
                            </div>
                        `;
                        if (submenu) submenu.after(searchContainer);

                        // Оформляем блоки литературы
                        const headers = Array.from(span9.querySelectorAll('h3'));
                        headers.forEach(h3 => {
                            const table = h3.nextElementSibling;
                            if (table && table.tagName === 'TABLE') {
                                const block = document.createElement('div');
                                block.className = 'library-subject-block';
                                h3.parentNode.insertBefore(block, h3);
                                
                                const wrapper = document.createElement('div');
                                wrapper.className = 'wide-table-wrapper';
                                block.appendChild(h3);
                                block.appendChild(wrapper);
                                wrapper.appendChild(table);
                                table.classList.add('resource-table'); 
                                table.style.minWidth = "800px";
                                h3.style.margin = "30px 0 15px 10px";
                                h3.style.fontSize = "1.5rem";
                            }
                        });

                        // Логика фильтрации (живой поиск)
                        const filterInput = searchContainer.querySelector('.lib-local-input');
                        filterInput.addEventListener('input', (e) => {
                            const val = e.target.value.toLowerCase().trim();
                            const blocks = document.querySelectorAll('.library-subject-block');

                            blocks.forEach(block => {
                                const h3Text = block.querySelector('h3').textContent.toLowerCase();
                                const rows = Array.from(block.querySelectorAll('tr'));
                                let blockHasVisibleRows = false;

                                rows.forEach(row => {
                                    if (row.querySelector('th')) return; 
                                    const rowText = row.textContent.toLowerCase();
                                    if (val === "" || rowText.includes(val) || h3Text.includes(val)) {
                                        row.style.display = "";
                                        blockHasVisibleRows = true;
                                    } else {
                                        row.style.display = "none";
                                    }
                                });

                                // Управление заголовками "Обязательная/Дополнительная"
                                let currentHeader = null;
                                let sectionVisible = false;
                                rows.forEach(row => {
                                    if (row.querySelector('th')) {
                                        if (currentHeader) currentHeader.style.display = sectionVisible ? "" : "none";
                                        currentHeader = row;
                                        sectionVisible = false;
                                    } else if (row.style.display !== "none") {
                                        sectionVisible = true;
                                    }
                                });
                                if (currentHeader) currentHeader.style.display = sectionVisible ? "" : "none";
                                block.style.display = (blockHasVisibleRows || val === "") ? "block" : "none";
                            });
                        });
                    }
                    
                    // 4. РЕЖИМ ВЫДАННЫХ КНИГ (HISTORY)
                    if (pageMode === 'history' || (!pageMode && span9.querySelector('th')?.textContent.includes('Книга'))) {
                        const historyTable = span9.querySelector('table.common');
                        if (historyTable) {
                            historyTable.classList.add('library-history-table');
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            historyTable.parentNode.insertBefore(wrapper, historyTable);
                            wrapper.appendChild(historyTable);
                            historyTable.style.minWidth = "900px";
                        }
                    }

                    span9.querySelectorAll('br, p:empty').forEach(el => el.remove());
                    break;
                }

                case 'stu.special_est_list': {
                    // 1. Очистка мусора
                    span9.querySelectorAll('script, style').forEach(el => el.remove());

                    // Добавляем заголовок страницы
                    if (!span9.querySelector('h2')) {
                        const pageTitle = document.createElement('h2');
                        pageTitle.textContent = 'Опросы и анкетирование';
                        pageTitle.style.marginBottom = '2.4rem';
                        span9.prepend(pageTitle);
                    }

                    // 2. Обработка всех "голых" текстовых узлов (типа текста про вакцинацию)
                    let currentNode = span9.firstChild;
                    while (currentNode) {
                        if (currentNode.nodeType === Node.TEXT_NODE) {
                            let text = currentNode.textContent.trim();
                            if (text.length > 25 && !text.includes('FUNCTION')) {
                                const title = document.createElement('div');
                                title.className = 'survey-intro-text';
                                title.innerHTML = text.replace(/\n/g, '<br>');
                                span9.insertBefore(title, currentNode);
                                currentNode.textContent = ''; // Очищаем оригинальный текст
                            }
                        }
                        currentNode = currentNode.nextSibling;
                    }

                    // 3. Обработка самих опросов
                    const surveyBlocks = span9.querySelectorAll('.nav.answ, .nav.msg');
                    
                    surveyBlocks.forEach(survey => {
                        // Убиваем старые классы ЕТИСа, из-за которых скрывались пройденные опросы
                        survey.className = 'survey-card'; 
                        
                        const headerLi = survey.querySelector('li:first-child');
                        const contentLi = survey.querySelector('li:nth-child(2)');

                        // Синхронизация стрелки и сворачивания
                        if (headerLi && contentLi) {
                            const updateArrow = () => {
                                headerLi.classList.toggle('is-open', !contentLi.classList.contains('hide_elem'));
                            };

                            updateArrow();
                            headerLi.addEventListener('click', () => {
                                setTimeout(updateArrow, 50);
                            });

                            // Очищаем шапку от ссылок и шрифтов ЕТИСа
                            const headerLink = headerLi.querySelector('a');
                            if (headerLink) headerLi.innerHTML = headerLink.innerHTML;
                            
                            const headerFont = headerLi.querySelector('font');
                            if (headerFont) headerLi.innerHTML = headerFont.innerHTML;
                            
                            headerLi.style.fontSize = '1.4rem';
                            headerLi.style.lineHeight = '1.5';
                            headerLi.style.fontWeight = '600';
                            headerLi.style.color = 'var(--color-text-primary)';
                        }

                        // Переверстка содержимого (результатов/форм)
                        if (contentLi) {
                            // Очищаем контент от тега <a>, которым ЕТИС зачем-то оборачивает всё
                            const contentLink = contentLi.querySelector('a');
                            if (contentLink) {
                                contentLi.innerHTML = contentLink.innerHTML;
                            }

                            const rawHTML = contentLi.innerHTML;
                            
                            // А) Если внутри есть форма (текст-бокс для ввода ответа)
                            if (rawHTML.includes('<form') || rawHTML.includes('<textarea')) {
                                const shortBtn = contentLi.querySelector('div[id$="_short"]');
                                if (shortBtn) {
                                    shortBtn.className = 'answer-btn-custom';
                                    shortBtn.style.width = 'fit-content';
                                    shortBtn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">edit</span>' + shortBtn.innerHTML;
                                }

                                const form = contentLi.querySelector('form');
                                if (form) {
                                    const formContainer = document.createElement('div');
                                    formContainer.className = 'form';
                                    formContainer.style.marginTop = '1.6rem';
                                    formContainer.style.padding = '2rem';
                                    formContainer.style.boxShadow = 'none';
                                    formContainer.style.border = '1px solid var(--color-table-border)';
                                    
                                    form.parentNode.insertBefore(formContainer, form);
                                    formContainer.appendChild(form);

                                    const textarea = form.querySelector('textarea');
                                    if (textarea) {
                                        textarea.style.width = '100%';
                                        textarea.style.minHeight = '150px';
                                        textarea.style.padding = '1.2rem';
                                        textarea.style.borderRadius = 'var(--radius-small)';
                                        textarea.style.border = '1px solid var(--color-table-border)';
                                        textarea.style.background = 'var(--color-input)';
                                        textarea.style.color = 'var(--color-text-primary)';
                                        textarea.style.fontSize = '1.4rem';
                                        textarea.style.resize = 'vertical';
                                    }

                                    const sendBtn = form.querySelector('button');
                                    if (sendBtn) {
                                        sendBtn.className = 'answer-btn-custom';
                                        sendBtn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">send</span>Отправить';
                                    }
                                }
                                return; // Выходим из цикла, так как это не результаты, а форма
                            }

                            // Б) Если это РЕЗУЛЬТАТЫ уже пройденного опроса
                            const cleanContent = document.createElement('div');
                            
                            // Ищем дату
                            const dateMatch = rawHTML.match(/\d{2}\.\d{2}\.\d{4}\s\d{2}:\d{2}:\d{2}/);
                            if (dateMatch) {
                                const d = document.createElement('div');
                                d.className = 'msg-date';
                                d.style.marginBottom = '2rem';
                                d.style.paddingBottom = '1rem';
                                d.style.borderBottom = '1px solid var(--color-table-border)';
                                d.textContent = 'Пройдено: ' + dateMatch[0];
                                cleanContent.appendChild(d);
                            }

                            // Разбираем вопросы и ответы
                            const temp = document.createElement('div');
                            temp.innerHTML = rawHTML;
                            
                            // Убираем спан с датой из парсинга
                            const dateSpan = temp.querySelector('span[style*="color:#808080"]');
                            if (dateSpan) dateSpan.remove();

                            const boldQuestions = temp.querySelectorAll('b');
                            let items = [];
                            
                            if (boldQuestions.length > 0) {
                                boldQuestions.forEach(b => {
                                    let q = b.textContent.replace(':', '').trim();
                                    let a = "";
                                    let next = b.nextSibling;
                                    
                                    // Идем по соседним узлам, пока не встретим следующий вопрос <b>
                                    while(next && next.nodeName !== 'B') {
                                        if (next.nodeName === 'SPAN' || next.nodeName === 'I' || (next.nodeType === Node.TEXT_NODE && next.textContent.trim().length > 2)) {
                                            a += next.textContent.trim() + " ";
                                        }
                                        next = next.nextSibling;
                                    }
                                    if (q) items.push({q, a: a.trim()});
                                });
                            }

                            // Отрисовываем вопросы и ответы
                            items.forEach(item => {
                                const div = document.createElement('div');
                                div.className = 'survey-result-item';
                                div.innerHTML = `
                                    <span class="survey-result-q">${item.q}</span>
                                    <div class="survey-result-a">${item.a}</div>
                                `;
                                cleanContent.appendChild(div);
                            });

                            if (items.length > 0) {
                                contentLi.innerHTML = '';
                                contentLi.appendChild(cleanContent);
                            }
                        }
                    });
                    
                    span9.querySelectorAll('br').forEach(br => br.remove());
                    break;
                }

                case 'stu.term_test':
                    const reviewContainer = span9.querySelector('.review');
                    if (!reviewContainer) break;

                    const listUl = reviewContainer.querySelector('ul.list');
                    if (listUl) {
                        // Создаем новую структуру карточки
                        const card = document.createElement('div');
                        card.className = 'review-card';
                        
                        const newList = document.createElement('div');
                        newList.className = 'review-list';

                        listUl.querySelectorAll('li').forEach(li => {
                            const link = li.querySelector('a');
                            if (!link) return;

                            // Извлекаем имя преподавателя из текста (удаляем скобки)
                            let teacherName = li.textContent.replace(link.textContent, '').trim();
                            teacherName = teacherName.replace(/[()]/g, '');

                            const item = document.createElement('div');
                            item.className = 'review-item';
                            item.innerHTML = `
                                <a href="${link.href}" class="review-dis-link">${link.textContent}</a>
                                <div class="review-teacher-info">
                                    <span class="material-icons">person</span>
                                    <span>${teacherName}</span>
                                </div>
                            `;
                            newList.appendChild(item);
                        });

                        card.appendChild(newList);
                        listUl.parentNode.replaceChild(card, listUl);
                    }

                    // Чистим пустой сабменю и лишние заголовки
                    const emptySubmenu = reviewContainer.querySelector('.submenu');
                    if (emptySubmenu && !emptySubmenu.textContent.trim()) {
                        emptySubmenu.remove();
                    }
                    
                    // Немного отступов для заголовков
                    const reviewH3 = reviewContainer.querySelector('h3');
                    if (reviewH3) {
                        reviewH3.style.margin = '2.4rem 0 1.2rem 0.5rem';
                        reviewH3.style.fontSize = '1.3rem';
                        reviewH3.style.color = 'var(--color-text-secondary)';
                        reviewH3.style.textTransform = 'uppercase';
                        reviewH3.style.letterSpacing = '1px';
                    }
                    break;

                case 'stu.about':
                    const aboutContainer = span9.querySelector('.text');
                    if (aboutContainer) {
                        // Превращаем стандартный блок в карточку-статью
                        aboutContainer.className = 'about-card';
                        
                        // Удаляем все инлайновые стили (font-size, margin и т.д.), которые мог вставить ЕТИС
                        aboutContainer.querySelectorAll('*').forEach(el => {
                            el.removeAttribute('style');
                        });

                        // Добавляем общий заголовок страницы, если его нет
                        if (!span9.querySelector('h2.page-title')) {
                            const mainTitle = document.createElement('h2');
                            mainTitle.textContent = 'О ресурсе';
                            mainTitle.className = 'page-title';
                            mainTitle.style.marginBottom = '2.4rem';
                            mainTitle.style.fontWeight = '800';
                            mainTitle.style.fontSize = '2.8rem';
                            span9.prepend(mainTitle);
                        }
                    }
                    break;

                case 'stu_pay.contract_list': {
                    const h2 = span9.querySelector('h2'); // Сохраняем заголовок
                    const contractLinks = Array.from(span9.querySelectorAll('a')); // Сохраняем ссылки

                    // 1. Полностью очищаем содержимое страницы, чтобы ничего не дублировалось сверху
                    span9.innerHTML = '';
                    if (h2) span9.appendChild(h2); // Возвращаем заголовок на место

                    const mainContainer = document.createElement('div');
                    mainContainer.className = 'contracts-container';

                    let instructionCard = null;

                    contractLinks.forEach(link => {
                        const text = link.textContent.trim();
                        const isInstruction = text.toLowerCase().includes('инструкция');
                        
                        // 2. Обработка инструкции
                        if (isInstruction) {
                            const card = document.createElement('a');
                            card.href = link.href;
                            card.className = 'contract-card instruction-footer'; // Используем тот же класс карточки
                            card.innerHTML = `
                                <span class="material-icons" style="color: var(--color-text-secondary)">info_outline</span>
                                <div class="contract-content">
                                    <div class="contract-title" style="color: var(--color-text-secondary)">${text}</div>
                                </div>
                                <span class="material-icons" style="color: var(--color-text-secondary); font-size: 1.8rem">open_in_new</span>
                            `;
                            instructionCard = card;
                            return;
                        }

                        // 3. Обработка договоров
                        const card = document.createElement('a');
                        card.href = link.href;
                        card.className = 'contract-card';
                        
                        const statusMatch = text.match(/\[(.*?)\]/);
                        const statusText = statusMatch ? statusMatch[1] : '';
                        let cleanText = text.replace(/\[.*?\]/, '').trim();
                        
                        const splitIndex = cleanText.indexOf('№');
                        let title = cleanText;
                        let meta = '';
                        
                        if (splitIndex !== -1) {
                            title = cleanText.substring(0, splitIndex).trim();
                            meta = cleanText.substring(splitIndex).trim();
                        }

                        if (statusText.toLowerCase().includes('действует')) {
                            card.classList.add('status-active');
                        } else if (statusText.toLowerCase().includes('расторгнут')) {
                            card.classList.add('status-terminated');
                        }

                        card.innerHTML = `
                            <span class="material-icons">description</span>
                            <div class="contract-content">
                                <div class="contract-title">${title}</div>
                                <div class="contract-meta">${meta}</div>
                            </div>
                            ${statusText ? `<div class="contract-status">${statusText}</div>` : ''}
                        `;

                        mainContainer.appendChild(card);
                    });

                    // 4. Добавляем элементы на страницу
                    span9.appendChild(mainContainer);
                    if (instructionCard) {
                        // Добавляем небольшой разделитель перед инструкцией
                        const hr = document.createElement('div');
                        hr.style.margin = '3rem 0 1.5rem';
                        hr.style.borderTop = '1px solid var(--color-table-border)';
                        span9.appendChild(hr);
                        span9.appendChild(instructionCard);
                    }
                    break;
                }

                case 'stu.orders': {
                    const ordersList = span9.querySelector('ul.orders');
                    if (!ordersList) break;

                    const orders = Array.from(ordersList.querySelectorAll('li.ord'));
                    
                    // Очищаем и ставим заголовок
                    const h2 = span9.querySelector('h2') || document.createElement('h2');
                    if (!h2.parentNode) h2.textContent = 'Приказы';
                    span9.innerHTML = '';
                    span9.appendChild(h2);

                    const container = document.createElement('div');
                    container.className = 'orders-container';

                    orders.forEach(ord => {
                        const link = ord.querySelector('a');
                        if (!link) return;

                        const fullText = link.textContent.trim();
                        
                        // Ищет: №... от ДД.ММ.ГГГГ
                        // (?:[\.\s]*) - игнорирует точку и пробелы после даты перед описанием
                        const match = fullText.match(/(№.*?от\s+\d{2}\.\d{2}\.\d{4})(?:[\.\s]*)(.*)/);
                        
                        // Если совпадение найдено, берем части, иначе выводим весь текст как заголовок
                        const meta = match ? match[1] : '';
                        const title = match ? match[2] : fullText;

                        // Логика выбора иконки
                        let icon = 'assignment';
                        let type = 'default';
                        const lowerTitle = fullText.toLowerCase(); // Проверяем по полному тексту для надежности

                        if (lowerTitle.includes('благодарность')) { icon = 'military_tech'; type = 'благодарность'; }
                        else if (lowerTitle.includes('зачислить')) { icon = 'school'; }
                        else if (lowerTitle.includes('перевести')) { icon = 'swap_horiz'; }
                        else if (lowerTitle.includes('академический отпуск')) { icon = 'pause_circle_filled'; }
                        else if (lowerTitle.includes('вышедшим из')) { icon = 'play_circle_filled'; }
                        else if (lowerTitle.includes('командиров')) { icon = 'flight_takeoff'; }
                        else if (lowerTitle.includes('руководителя')) { icon = 'history_edu'; }
                        else if (lowerTitle.includes('дубликат')) { icon = 'content_copy'; }

                        const card = document.createElement('a');
                        card.href = link.href;
                        card.target = '_blank';
                        card.className = 'order-card';
                        card.setAttribute('data-type', type);

                        card.innerHTML = `
                            <div class="order-icon-box">
                                <span class="material-icons">${icon}</span>
                            </div>
                            <div class="order-info">
                                <div class="order-meta">${meta}</div>
                                <div class="order-title">${title}</div>
                            </div>
                            <span class="material-icons" style="color:var(--color-text-secondary); font-size: 1.8rem;">open_in_new</span>
                        `;

                        container.appendChild(card);
                    });

                    span9.appendChild(container);
                    break;
                }

                case 'stu_plus.blank_forms': {
                    // 1. Сначала собираем все данные, пока структура страницы цела
                    const sections = Array.from(span9.querySelectorAll('h3'));
                    const pageTitle = span9.querySelector('h2');
                    const data = [];

                    sections.forEach(h3 => {
                        // Ищем UL, который идет после этого H3, пропуская <br> и пустые узлы
                        let next = h3.nextElementSibling;
                        while (next && next.tagName !== 'UL' && next.tagName !== 'H3') {
                            next = next.nextElementSibling;
                        }

                        if (next && next.tagName === 'UL') {
                            data.push({
                                header: h3.cloneNode(true),
                                list: next.cloneNode(true)
                            });
                        }
                    });

                    // 2. Теперь полностью очищаем страницу и строим заново
                    span9.innerHTML = '';
                    if (pageTitle) span9.appendChild(pageTitle);

                    data.forEach(item => {
                        // Добавляем заголовок категории
                        span9.appendChild(item.header);
                        
                        const grid = document.createElement('div');
                        grid.className = 'forms-grid';
                        
                        const items = item.list.querySelectorAll('li');
                        items.forEach(li => {
                            const links = Array.from(li.querySelectorAll('a'));
                            if (links.length === 0) return;

                            // Основная ссылка (обычно первая - Word или Excel)
                            const primaryLink = links[0];
                            const href = primaryLink.getAttribute('href').toLowerCase();
                            
                            const card = document.createElement('a');
                            card.className = 'form-card';
                            card.href = primaryLink.href;
                            card.target = '_blank';

                            // Определяем иконку и цвет по расширению файла
                            let icon = 'description';
                            let typeClass = 'type-word';
                            if (href.includes('.xls')) { icon = 'table_chart'; typeClass = 'type-excel'; }
                            else if (href.includes('.pdf')) { icon = 'picture_as_pdf'; typeClass = 'type-pdf'; }

                            // Генерируем бейджи форматов (DOC, PDF, XLS)
                            let badgesHtml = '';
                            links.forEach(l => {
                                const lHref = l.getAttribute('href').toLowerCase();
                                let ext = 'DOC';
                                if (lHref.includes('.pdf')) ext = 'PDF';
                                else if (lHref.includes('.xls')) ext = 'XLS';
                                badgesHtml += `<span class="badge-ext">${ext}</span>`;
                            });

                            card.innerHTML = `
                                <div class="form-icon-box ${typeClass}">
                                    <span class="material-icons">${icon}</span>
                                </div>
                                <div class="form-name">${primaryLink.textContent.trim()}</div>
                                <div class="form-badges">${badgesHtml}</div>
                            `;
                            
                            grid.appendChild(card);
                        });
                        
                        span9.appendChild(grid);
                    });

                    // Финальная чистка
                    span9.querySelectorAll('br').forEach(br => br.remove());
                    break;
                }

                case 'stu.teacher_stats': {
                    const table = span9.querySelector('table.common');
                    if (table) {
                        // Оборачиваем в универсальный контейнер со скроллом
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);

                        // Чистим старые атрибуты верстки
                        table.removeAttribute('border');
                        table.querySelectorAll('td, th').forEach(el => {
                            el.removeAttribute('align');
                            el.removeAttribute('valign');
                            // Если в ячейке только пробел &nbsp;, помечаем её пустой
                            if (el.textContent.trim() === '') el.classList.add('empty');
                        });
                    }

                    // Оформляем пояснительный текст под таблицей (звездочки)
                    const span9Content = span9.innerHTML;
                    const footerText = span9.innerHTML.split('</table>')[1];
                    if (footerText) {
                        const footerDiv = document.createElement('div');
                        footerDiv.className = 'electr-description';
                        footerDiv.style.textAlign = 'left';
                        footerDiv.style.marginTop = '2rem';
                        footerDiv.innerHTML = footerText.replace(/<br>/g, '');
                        
                        // Очищаем низ страницы и добавляем оформленный текст
                        const currentContent = span9.innerHTML.split('</table>')[0] + '</table>';
                        span9.innerHTML = currentContent;
                        span9.appendChild(footerDiv);
                    }
                    break;
                }

                case 'stu_jour.group_tt': {
                    const groupH3 = span9.querySelector('h3');
                    const listItems = span9.querySelectorAll('li > a[href*="stu_jour.tt_pair"]');

                    if (!listItems.length) break;

                    // Очищаем страницу
                    span9.innerHTML = '';

                    // Восстанавливаем заголовок
                    if (groupH3) {
                        const pageTitle = document.createElement('h2');
                        pageTitle.textContent = groupH3.textContent.trim();
                        pageTitle.style.marginBottom = '2.4rem';
                        span9.appendChild(pageTitle);
                    }

                    // Контейнер для карточек
                    const container = document.createElement('div');
                    container.className = 'jour-container';

                    listItems.forEach(link => {
                        const text = link.textContent.trim();
                        const href = link.href;

                        let title = text;
                        let badge = '';
                        let icon = 'fact_check';
                        let typeClass = 'jour-badge-default';

                        // Парсим тип занятия из конца строки (лек, практ, лаб)
                        const match = text.match(/(.*?)\s*\((лек|практ|лаб)\)$/i);
                        if (match) {
                            title = match[1];
                            badge = match[2].toLowerCase();

                            // Подбираем иконку и цвет
                            if (badge === 'лек') {
                                icon = 'menu_book';
                                typeClass = 'jour-badge-lek';
                            } else if (badge === 'практ') {
                                icon = 'engineering';
                                typeClass = 'jour-badge-pract';
                            } else if (badge === 'лаб') {
                                icon = 'science';
                                typeClass = 'jour-badge-lab';
                            }
                        }

                        const card = document.createElement('a');
                        card.href = href;
                        card.className = 'jour-card';

                        card.innerHTML = `
                            <div class="jour-icon-box ${typeClass}">
                                <span class="material-icons">${icon}</span>
                            </div>
                            <div class="jour-title">${title}</div>
                            ${badge ? `<div class="jour-badge ${typeClass}">${badge}</div>` : ''}
                            <span class="material-icons" style="color:var(--color-text-secondary); margin-left: 8px;">chevron_right</span>
                        `;

                        container.appendChild(card);
                    });

                    span9.appendChild(container);
                    break;
                }

                case 'stu_jour.tt_pair': {
                    const h4 = span9.querySelector('h4');
                    if (h4) {
                        // Разбираем страшный текст заголовка
                        const lines = h4.innerHTML.split('<br>').map(l => l.trim()).filter(l => l);
                        
                        const infoCard = document.createElement('div');
                        infoCard.className = 'jour-info-card';
                        
                        if (lines.length >= 2) {
                            const group = lines[0];
                            const subject = lines[1];
                            const teacher = lines.length > 2 ? lines[2] : '';
                            const department = lines.length > 3 ? lines[3] : '';
                            
                            infoCard.innerHTML = `
                                <div class="jour-info-header">
                                    <div class="jour-info-group">${group}</div>
                                    <div class="jour-info-subject">${subject}</div>
                                </div>
                                ${teacher ? `
                                <div class="jour-info-teacher">
                                    <span class="material-icons">person</span>
                                    <div>
                                        <strong>${teacher}</strong>
                                        ${department ? `<span>${department}</span>` : ''}
                                    </div>
                                </div>` : ''}
                            `;
                        } else {
                            // Резервный вариант, если структура текста иная
                            infoCard.innerHTML = `<h3 style="margin:0">${h4.textContent}</h3>`;
                        }
                        
                        h4.parentNode.replaceChild(infoCard, h4);
                    }

                    // Оборачиваем таблицу, чтобы она скроллилась горизонтально
                    const table = span9.querySelector('table.common');
                    if (table) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                        
                        // Удаляем старые инлайновые стили дат и ширин, чтобы работал CSS
                        table.removeAttribute('style');
                        table.querySelectorAll('th, td').forEach(cell => {
                            cell.removeAttribute('style');
                        });
                    }

                    // Стилизуем кнопку "Сохранить"
                    const btnWrapper = span9.querySelector('.button_gray');
                    if (btnWrapper) {
                        btnWrapper.className = 'jour-save-wrapper';
                        const btn = btnWrapper.querySelector('button');
                        if (btn) {
                            btn.className = 'answer-btn-custom'; // Даем ей красивый синий стиль
                            btn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">save</span>' + btn.innerHTML;
                        }
                    }
                    break;
                }

                case 'est_pkg.show_list': {
                    // 1. ОБРАБОТКА "МОИ КОММЕНТАРИИ"
                    const feedbackMsgs = span9.querySelectorAll('ul.nav.msg');
                    
                    if (feedbackMsgs.length > 0) {
                        const container = document.createElement('div');
                        container.className = 'msg-container';

                        feedbackMsgs.forEach(msg => {
                            const li = msg.querySelector('li');
                            if (!li) return;

                            const clone = li.cloneNode(true);

                            const dateNode = clone.querySelector('font[color="#808080"]');
                            const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                            if (dateNode) dateNode.remove();

                            const headerNode = clone.querySelector('font[style*="font-weight:bold"]');
                            let headerHTML = '';
                            if (headerNode) {
                                headerHTML = headerNode.innerHTML.replace(/<br>/g, ' ').replace(/\s+/g, ' ').trim();
                                headerNode.remove();
                            }

                            const tableNode = clone.querySelector('table');
                            let tableHTML = '';
                            if (tableNode) {
                                tableNode.removeAttribute('width');
                                tableNode.className = 'feedback-table';
                                tableNode.querySelectorAll('td').forEach(td => {
                                    td.removeAttribute('width');
                                    td.removeAttribute('style');
                                });
                                tableHTML = tableNode.outerHTML;
                                tableNode.remove();
                            }

                            let bodyText = clone.innerHTML.replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
                            if (!bodyText.replace(/<br>/g, '').trim()) bodyText = ''; 

                            const card = document.createElement('div');
                            card.className = 'msg-card';

                            card.innerHTML = `
                                <div class="msg-header">
                                    <div class="msg-sender"><span class="material-icons">rate_review</span>Отзыв</div>
                                    <div class="msg-date">${dateStr}</div>
                                </div>
                                ${headerHTML ? `<div class="msg-subject" style="font-weight:500; opacity:0.9; font-size:1.3rem;">${headerHTML}</div>` : ''}
                                ${bodyText ? `<div class="msg-body" style="margin-bottom:1rem;">${bodyText}</div>` : ''}
                                ${tableHTML}
                            `;
                            container.appendChild(card);
                        });

                        feedbackMsgs.forEach(m => m.remove());
                        
                        const submenu = span9.querySelector('.submenu');
                        if (submenu) submenu.after(container);
                        else span9.appendChild(container);
                    }

                    // 2. ОБРАБОТКА ТАБЛИЦЫ РЕЙТИНГА
                    // Ищем именно таблицу с ID rating, так как в HTML она именно такая
                    const ratingTable = document.getElementById('rating');
                    
                    if (ratingTable) {
                        // Создаем обертку
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        
                        // Вставляем обертку перед таблицей
                        ratingTable.parentNode.insertBefore(wrapper, ratingTable);
                        
                        // Перемещаем таблицу внутрь
                        wrapper.appendChild(ratingTable);
                        
                        // Чистим таблицу от мусора
                        ratingTable.removeAttribute('width');
                        
                        // Добавляем классы для красоты
                        ratingTable.classList.add('common'); // Чтобы подхватились общие стили
                        
                        // Убираем инлайновые цвета фона строк, чтобы работал CSS
                        ratingTable.querySelectorAll('tr').forEach(tr => {
                            tr.style.backgroundColor = '';
                        });
                    }

                    break;
                }

                case 'stu.absence': {
                    const table = span9.querySelector('table.slimtab_nice');
                    if (table) {
                        // 1. красивый дизайн (common) и добавляем класс-исключение (absence-table)
                        table.className = 'common absence-table'; 
                        
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);

                        // 2. Фиксим пустой заголовок первой колонки (номер по порядку)
                        const firstTh = table.querySelector('th');
                        if (firstTh && firstTh.textContent.trim() === '') {
                            firstTh.textContent = '№';
                        }

                        // 3. Оформляем ячейки с датами (вторая колонка)
                        table.querySelectorAll('tr').forEach(tr => {
                            const td = tr.querySelectorAll('td')[1]; // Вторая колонка
                            if (td) {
                                const fonts = td.querySelectorAll('font');
                                if (fonts.length > 0) {
                                    // Создаем внутренний div-контейнер для капсул
                                    const dateContainer = document.createElement('div');
                                    dateContainer.style.display = 'flex';
                                    dateContainer.style.flexWrap = 'wrap';
                                    dateContainer.style.gap = '6px';
                                    dateContainer.style.justifyContent = 'center';

                                    fonts.forEach(font => {
                                        const color = font.getAttribute('color');
                                        const title = font.getAttribute('title');
                                        const text = font.textContent.trim();

                                        const capsule = document.createElement('span');
                                        capsule.className = 'absence-capsule ' + (color === 'green' ? 'valid' : 'invalid');
                                        capsule.textContent = text;
                                        if (title) capsule.title = title; 

                                        dateContainer.appendChild(capsule);
                                    });
                                    
                                    // Очищаем ячейку от старого мусора (<br>, шрифты) и вставляем контейнер
                                    td.innerHTML = '';
                                    td.appendChild(dateContainer);
                                }
                            }
                        });
                    }

                    // 4. Парсим текстовую статистику внизу и превращаем в карточки
                    let total = '0', valid = '0', invalid = '0';
                    let foundStats = false;

                    // Перебираем ноды, ищем нужный текст
                    Array.from(span9.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const text = node.textContent;
                            if (text.includes('Всего пропущено занятий:')) { 
                                total = text.replace(/\D/g, ''); 
                                foundStats = true; 
                                node.textContent = ''; // Скрываем оригинальный текст
                            }
                            if (text.includes('Из них по уважительной причине:')) { 
                                valid = text.replace(/\D/g, ''); 
                                node.textContent = ''; 
                            }
                        } else if (node.tagName === 'B' && node.textContent.includes('По неуважительной причине:')) {
                            invalid = node.textContent.replace(/\D/g, '');
                            node.remove(); // Удаляем тег <b>
                        }
                    });

                    // 5. Отрисовываем сетку статистики
                    if (foundStats) {
                        const summaryDiv = document.createElement('div');
                        summaryDiv.className = 'absence-summary';
                        summaryDiv.innerHTML = `
                            <div class="absence-stat">
                                <span class="absence-stat-val">${total}</span>
                                <span class="absence-stat-label">Всего пропущено</span>
                            </div>
                            <div class="absence-stat valid">
                                <span class="absence-stat-val">${valid}</span>
                                <span class="absence-stat-label">Уважительные</span>
                            </div>
                            <div class="absence-stat invalid">
                                <span class="absence-stat-val">${invalid}</span>
                                <span class="absence-stat-label">Неуважительные</span>
                            </div>
                        `;
                        span9.appendChild(summaryDiv);
                    }

                    // Убираем лишние <br> в конце страницы
                    span9.querySelectorAll('br').forEach(br => br.remove());
                    break;
                }


                }
            // --- ГЛОБАЛЬНЫЕ УЛУЧШЕНИЯ ДЛЯ ЛЮБЫХ СТРАНИЦ ---
            
            // Формы отзывов и анкетирования (que_form)
            const queForm = document.querySelector('form.que_form');
            if (queForm) {
                // Добавляем красивый заголовок страницы, если его нет
                if (!span9.querySelector('h2')) {
                    const pageTitle = document.createElement('h2');
                    pageTitle.textContent = 'Оставить отзыв';
                    pageTitle.style.marginBottom = '2.4rem';
                    span9.insertBefore(pageTitle, queForm.closest('.review') || queForm);
                }
                
                // Улучшаем кнопку отправки (добавляем иконку бумажного самолетика)
                const sendBtn = document.getElementById('send_btn');
                if (sendBtn && !sendBtn.querySelector('.material-icons')) {
                    sendBtn.innerHTML = '<span class="material-icons" style="font-size: 2rem; margin-right: 0.8rem;">send</span>' + sendBtn.textContent;
                }
            }
        }
    }

})();