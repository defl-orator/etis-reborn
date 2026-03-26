// ==UserScript==
// @name         ЕТИС REBORN
// @namespace    http://tampermonkey.net/
// @version      1.8200
// @changelog    Настройка внешнего вида снизу сайдбара. Удобная установка для пользователей iOS
// @description  Глобальный редизайн ЕТИСа
// @author       dya_dya
// @match        https://student.psu.ru/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/npm/chart.js
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/defl-orator/etis-reborn/refs/heads/main/etis.user.js
// @downloadURL  https://raw.githubusercontent.com/defl-orator/etis-reborn/refs/heads/main/etis.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // НАСТРОЙКИ ОБНОВЛЕНИЯ И ТЕСТИРОВАНИЯ
    // ==========================================
    const IS_TEST_MODE = false;
    
    const BASE_REPO_URL = 'https://raw.githubusercontent.com/defl-orator/etis-reborn/refs/heads/main/';
    const UPDATE_URL = IS_TEST_MODE ? BASE_REPO_URL + 'etis-test.user.js' : BASE_REPO_URL + 'etis.user.js';

    // Детектор iOS устройств
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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
	--width-aside: 26rem;
	--width-page: 1120px;
	--width-content-margin-left: 3rem;
    --transition: 0.2s ease;
}

[theme="light"] {
    /* Основные цвета */
	--color-body: #F2F2F6;
	--color-card: #FFFFFF;

    /* Акцент: ГОЛУБОЙ */
	--color-accent: #007AFF;
	--color-accent-dark: #0056b3;
	--color-accent-active: #E3F2FD; 
    --color-text-link: #007AFF;

    /* Элементы */
	--color-tooltip: #fff;
	--color-highlight: #F2F2F7;
	--color-highlight-light: #fff;
	--color-input: #F2F2F7;
	--color-input-highlight: #fff;
	--color-scrollbar-thumb: #c1c1c1;
	--color-scrollbar-thumb-highlight: #a8a8a8;
	--color-table-border: rgba(0, 0, 0, 0.08);
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

/* --- TABLES --- */
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

.day table {
    margin-bottom: 0 !important;
}

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
    text-align: center !important;
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
    background-color: var(--color-card) !important;
}

.slimtab_nice, .common, .teach_plan { border: none !important; }
.slimtab_nice:after, .common:after { display: none !important; }

font[color="green"], span[style*="color:green"] { color: var(--color-green) !important; font-weight: 600 !important; }
font[color="red"], span[style*="color:red"] { color: var(--color-red) !important; font-weight: 600 !important; }
font[color="blue"], span[style*="color:blue"] { color: var(--color-blue) !important; font-weight: 600 !important; }

/* --- SUBMENU --- */
.submenu {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: stretch !important;
    position: relative !important;

    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;

    width: 100% !important;
    border-radius: 50px !important;
    background-color: var(--color-card) !important;
    box-shadow: var(--shadow-main) !important;

    padding: 4px !important;
    gap: 8px !important;
    margin-bottom: 2.4rem !important;
    border-bottom: none !important;

    /* Индикация скролла по бокам */
    background-image:
        linear-gradient(to right, var(--color-card) 20%, rgba(255,255,255,0) 100%),
        linear-gradient(to left, var(--color-card) 20%, rgba(255,255,255,0) 100%) !important;
    background-position: left center, right center !important;
    background-repeat: no-repeat !important;
    background-size: 40px 100% !important;
    background-attachment: scroll !important;
}

[theme="dark"] .submenu {
    background:
        linear-gradient(to right, var(--color-card) 30%, rgba(255,255,255,0)) left center / 40px 100% no-repeat local,
        linear-gradient(to left, var(--color-card) 30%, rgba(255,255,255,0)) right center / 40px 100% no-repeat local,
        radial-gradient(farthest-side at 0 50%, rgba(0,0,0,0.5), rgba(0,0,0,0)) left center / 15px 100% no-repeat scroll,
        radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,0.5), rgba(0,0,0,0)) right center / 15px 100% no-repeat scroll !important;
    background-color: var(--color-card) !important;
}

.submenu::-webkit-scrollbar {
    display: none !important;
}

/* Вкладки в подменю */
.submenu a:not(.answer-btn-custom),
.submenu .answer-btn-custom,
.submenu b {
    flex: 1 0 auto !important;
    min-width: max-content !important;
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50px !important;

    height: 3.8rem !important;
    padding: 0 16px !important;
    margin: 0 !important;
    font-size: 1.3rem !important;
    font-weight: 500 !important;
    box-shadow: none !important;
    border: none !important;
    transition: all 0.2s ease !important;
    box-sizing: border-box !important;
    text-decoration: none !important;
}

/* Обычная вкладка и кнопка оценки */
.submenu a:not(.answer-btn-custom),
.submenu .answer-btn-custom {
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
}

.submenu .answer-btn-custom .material-icons {
    color: var(--color-accent) !important;
}

/* Активная вкладка */
.submenu b {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    font-weight: 600 !important;
}

.submenu a:hover,
.submenu .answer-btn-custom:hover {
    background: var(--color-highlight-light) !important;
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
    padding: 0.8rem 0 !important;
    margin-bottom: 1.6rem !important; 
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

.span3 > .nav.nav-tabs.nav-stacked > .active:before {
    display: none !important;
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
.week-select { margin: 0 auto 1.5rem !important; margin-top: 0 !important; margin-bottom: 1.5rem !important; width: 100% !important; clear: both !important; }
.week-select h3 { display: none !important; }

.timetable-toolbar + br, 
.span9 > br {
    display: none !important;
}

/* Капсула для недель */
.weeks {
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    align-items: center !important;
    gap: 8px !important;
    margin: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;

    width: 100% !important;
    padding: 4px !important;
    background-color: var(--color-card) !important;
    box-shadow: var(--shadow-main) !important;
    border-radius: 50px !important;

    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;

    /* Индикация скролла по бокам */
    background-image:
        linear-gradient(to right, var(--color-card) 20%, rgba(255,255,255,0) 100%),
        linear-gradient(to left, var(--color-card) 20%, rgba(255,255,255,0) 100%) !important;
    background-position: left center, right center !important;
    background-repeat: no-repeat !important;
    background-size: 40px 100% !important;
    background-attachment: scroll !important;
}
.weeks::-webkit-scrollbar { display: none !important; }

/* Темная тема для градиентов скролла */
[theme="dark"] .weeks {
    background:
        linear-gradient(to right, var(--color-card) 30%, rgba(255,255,255,0)) left center / 40px 100% no-repeat local,
        linear-gradient(to left, var(--color-card) 30%, rgba(255,255,255,0)) right center / 40px 100% no-repeat local,
        radial-gradient(farthest-side at 0 50%, rgba(0,0,0,0.5), rgba(0,0,0,0)) left center / 15px 100% no-repeat scroll,
        radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,0.5), rgba(0,0,0,0)) right center / 15px 100% no-repeat scroll !important;
    background-color: var(--color-card) !important;
}

.weeks .week {
    position: relative !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    flex: 0 0 auto !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 3.8rem !important;
    height: 3.8rem !important;
    background-color: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
    border: none !important;
    font-size: 1.3rem !important;
    font-weight: 500 !important;
    transition: background 0.2s, transform 0.2s !important;
    box-shadow: none !important;
}

.weeks > .week > a {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    height: 100% !important;
    color: inherit !important;
    text-decoration: none !important;
    border-radius: 50% !important;
}

.weeks .week:not(.current):hover {
    background-color: var(--color-highlight-light) !important;
}

.weeks .week.pract:not(.current) { color: var(--color-text-primary) !important; }

/* АКТИВНАЯ НЕДЕЛЯ */
.weeks .week.current {
    background-color: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

.weeks .week.current > a {
    font-weight: 700 !important;
}

/* Выделение актуальной (календарной) недели, если мы сейчас смотрим другую */
.weeks .week.actual-week:not(.current) > a {
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
    border-radius: var(--radius-large) !important;
    background-color: var(--color-card) !important;
    box-shadow: var(--shadow-main) !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin-bottom: 2rem !important;
}
.span9 .day h3 {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important; /* День СЛЕВА, Дата СПРАВА */

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

/* Дата */
.span9 .day h3 .day-date {
    font-weight: 500 !important;
    font-size: 1.5rem !important;
    color: var(--color-text-secondary) !important;
    background: transparent !important;
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    text-align: right !important;
}
.no_pairs { padding: 1.2rem 1.6rem 2rem !important; }
.timetable { display: flex !important; flex-direction: column !important; width: 100% !important; }
.timetable td { border: none !important; vertical-align: middle !important; padding-top: 0.2rem !important; padding-bottom: 0.2rem !important; font-size: 1.2rem !important; }
.pair_num { width: 9.6rem !important; height: 5rem !important; border: none !important; font-size: 0 !important; padding-left: 1.6rem !important; }
.pair_num .eval { font-size: 1.1rem !important; color: var(--color-text-secondary) !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;}
.pair_info { padding-right: 1.4rem !important; }
.pair_info .dis a { color: var(--color-text-primary) !important; text-decoration: none !important; font-size: 1.4rem !important; }
.pair_teacher { width: 14rem !important; text-align: right !important; padding-right: 1.6rem !important; }
.pair_teacher > a { color: var(--color-text-secondary) !important; text-decoration: none !important; }
.pair_info .aud {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px !important;
    margin-top: 4px !important;
    flex-wrap: nowrap !important;
    width: max-content !important;
    position: relative !important;
    z-index: 0 !important;
}
.pair_info .aud > a:before { margin-right: 0.6rem !important; font-family: 'Material Icons Outlined' !important; content: 'videocam' !important; font-size: 1.8rem !important; }
.pair_info .aud > a > img { display: none !important; }

/* --- TEACHERS --- */

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
    min-height: 150px !important;
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
    cursor: pointer !important;
    line-height: 1.4 !important;
    display: block !important;
    border-bottom: none !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
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
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    width: 100% !important;
    margin-bottom: 1.5rem !important;
    opacity: 0.9 !important;
}

.psu-logo::before {
    content: '' !important;
    display: block !important;
    height: 13rem !important;
    width: 100% !important;
    background-image: url("https://raw.githubusercontent.com/defl-orator/etis-reborn/main/img/logo_fill.png") !important;
    background-size: contain !important;
    background-position: center bottom !important;
    background-repeat: no-repeat !important;
    margin-bottom: 1.2rem !important;
}

.psu-logo::after {
    content: 'Е Т И С' !important;
    display: block !important;
    width: 80% !important;
    text-align-last: justify !important;
    font-size: 2.8rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    line-height: 1 !important;
}

html[theme="dark"] .psu-logo::before {
    filter: invert(1) !important;
}
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

.psu-logo-subtitle {
    display: none !important;
}

@media (min-width: 961px) {
    .login form {
        flex-direction: row !important;
        width: 840px !important;
        min-height: 500px !important;
        padding: 48px !important;
        display: flex !important;
        align-items: stretch !important;
    }

    .psu-logo {
        flex: 1 !important;
        margin-bottom: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding-right: 20px !important;
    }

    .psu-logo::before {
        height: 12rem !important;
        width: 12rem !important;
        margin-bottom: 2.4rem !important;
        background-position: left center !important;
    }

    .psu-logo::after { display: none !important; }

    .psu-logo-subtitle {
        display: block !important;
        font-size: 3.2rem !important;
        line-height: 1.2 !important;
        font-weight: 400 !important;
        color: var(--color-text-primary) !important;
    }

    .login .items {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        padding-left: 40px !important;
    }

    .login-inputs-wrapper {
        margin-top: auto !important;
        margin-bottom: auto !important;
        width: 100% !important;
    }

    .login-actions {
        margin-top: 0 !important;
        display: flex !important;
        justify-content: flex-end !important;
        align-items: center !important;
        gap: 2.4rem !important;
    }

    #sbmt {
        min-width: 130px !important;
        height: 52px !important;
        padding: 0 32px !important;
        font-size: 1.6rem !important;
        font-weight: 700 !important;
        border-radius: 26px !important;
        background: var(--color-accent) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border: none !important;
    }

    #sbmt span {
        padding: 0 !important;
        border: none !important;
        line-height: 1 !important;
        display: block !important;
        text-shadow: none !important;
    }
}

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

    padding: 4px !important;
    gap: 8px !important;
    margin-bottom: 1.5rem !important;

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

/* --- CAPSULE SEARCH BAR --- */
.timetable-toolbar .capsule-search-item {
    flex: 1 1 0 !important;
    min-width: 150px !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    background: var(--color-input) !important;
    border-radius: 50px !important;
    height: 3.8rem !important;
    overflow: hidden !important;
}

.timetable-toolbar .capsule-search-item:hover {
    background: var(--color-input) !important;
}

.timetable-toolbar .capsule-search-item .material-icons {
    margin-left: 16px !important;
    color: var(--color-text-secondary) !important;
}

.timetable-toolbar .capsule-search-item input {
    flex: 1 !important;
    height: 100% !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 16px 0 8px !important;
    margin: 0 !important;
    font-size: 1.4rem !important;
    color: var(--color-text-primary) !important;
    outline: none !important;
}

.timetable-toolbar .capsule-search-item input:focus {
    box-shadow: none !important;
}

@media (max-width: 960px) {
    .timetable-toolbar .capsule-search-item {
        flex: 1 1 auto !important;
        min-width: 140px !important;
    }
}

/* --- MOBILE ADAPTATION --- */
@media (max-width: 960px) {
    /* 1. Нативная прокрутка */
    html, body {
        overflow-x: hidden !important;
        position: relative !important;
        height: auto !important;
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


    .mobile-menu-btn.open {
        left: calc(100vw - 41px) !important;
        width: 52px !important;
        height: 52px !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    }

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

    .common, .teach_plan, .slimtab_nice {
        display: block !important;
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
    }

    .common td, .common th,
    .teach_plan td, .teach_plan th,
    .slimtab_nice td, .slimtab_nice th {
        white-space: nowrap !important;
        max-width: none !important;
    }

    .timetable {
        display: table !important;
        width: 100% !important;
        table-layout: auto !important;
    }
    .timetable td {
        white-space: normal !important;
        word-wrap: break-word !important;
    }
    .pair_num {
        width: 8.1rem !important;
        min-width: 8.1rem !important;
        padding-right: 1rem !important;
        padding-left: 1.6rem !important;
    }
    .pair_teacher {
        width: 35% !important;
        padding-left: 0.5rem !important;
        padding-right: 1.6rem !important;
    }

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

    .span9 div[style*="inline-block"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
    }

    .submenu {
        padding: 4px !important;
        gap: 6px !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
    }

    .submenu a:not(.answer-btn-custom),
    .submenu b {
        flex: 0 0 auto !important;
        padding: 0 14px !important;
    }
    .wide-table-wrapper {
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        margin-bottom: 2rem !important;
        max-width: calc(100vw - 2rem) !important;
        display: block !important;
    }

    .term-table-v6, .session-table-v6 {
        display: table !important;
        width: auto !important;
        min-width: 650px !important;
        margin-bottom: 0 !important;
    }

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
        padding-top: 0 !important;
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
    color: var(--color-text-primary) !important;
    font-weight: normal !important;
    background: transparent !important;
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

.span3 > .nav.nav-tabs.nav-stacked > li.active > a,
.span3 > .nav.nav-tabs.nav-stacked > li.active > a *,
.span3 > .nav.nav-tabs.nav-stacked > li.active > a font {
    color: var(--color-text-primary-invert) !important;
    font-weight: 700 !important;
    text-shadow: none !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li.active > a .material-icons {
    color: var(--color-text-primary-invert) !important;
    opacity: 1 !important;
}

.span3 > .nav.nav-tabs.nav-stacked > .active:before {
    display: none !important;
}

@media (hover: hover) {
    .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:hover {
        background: var(--color-highlight) !important;
        margin: 0 12px 4px 12px !important;
        border-radius: var(--radius-small) !important;
        width: auto !important;
    }

    .timetable-toolbar .toolbar-item:hover,
    .submenu a:hover,
    button:hover,
    .cgrldatarow:hover,
    table tbody tr:hover td {
        background-color: var(--color-highlight) !important;
    }
}

.mobile-menu-btn {
    font-weight: 800 !important;
    letter-spacing: 0.5px !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li > a > .badge {
    display: none !important;
}

.span3 > .nav.nav-tabs.nav-stacked > li > a > .badge { display: none !important; }

.span3 li.warn_menu, .span3 li.warn_menu a {
    background: transparent !important;
    color: var(--color-text-primary) !important;
}

/* --- TIMETABLE SEPARATORS --- */

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

.timetable .pair_info {
    text-align: left !important;
}

.timetable .pair_num {
    text-align: center !important;
}

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

/* --- VIDEO CALL STYLING (ZOOM, TELEMOST, GENERIC) --- */

.pair_info .aud a[href*="zoom"],
.pair_info .aud a[href*="telemost"],
.pair_info .aud a.btn-generic-online {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.6rem !important;
    padding: 0.5rem 1.4rem 0.5rem 1.5rem !important;
    border-radius: 50px !important;
    text-decoration: none !important;
    font-weight: 700 !important;
    font-size: 1.2rem !important;
    line-height: 1 !important;
    transition: all 0.2s !important;
    margin: 0 !important;
}

/* ZOOM (Синий) */
.pair_info .aud a[href*="zoom"] {
    background: rgba(45, 140, 255, 0.12) !important;
    color: #2D8CFF !important;
    border: 1px solid rgba(45, 140, 255, 0.2) !important;
}
.pair_info .aud a[href*="zoom"]:hover {
    background: rgba(45, 140, 255, 0.2) !important;
    transform: translateY(-1px);
}
.pair_info .aud a[href*="zoom"]:before {
    content: 'public' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 1.8rem !important;
    display: block !important;
}
.pair_info .aud a[href*="zoom"] img { display: none !important; }

/* ЯНДЕКС ТЕЛЕМОСТ (Оранжевый) */
.pair_info .aud a[href*="telemost"] {
    background: rgba(255, 149, 0, 0.12) !important;
    color: #FF9500 !important;
    border: 1px solid rgba(255, 149, 0, 0.2) !important;
}
.pair_info .aud a[href*="telemost"]:hover {
    background: rgba(255, 149, 0, 0.2) !important;
    transform: translateY(-1px);
}
.pair_info .aud a[href*="telemost"]:before {
    content: 'public' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 1.8rem !important;
    display: block !important;
}

/* ДРУГИЕ ОНЛАЙН ССЫЛКИ (Фиолетовая капсула) */
.pair_info .aud a.btn-generic-online {
    background: rgba(175, 82, 222, 0.12) !important;
    color: #AF52DE !important;
    border: 1px solid rgba(175, 82, 222, 0.2) !important;
}
.pair_info .aud a.btn-generic-online:hover {
    background: rgba(175, 82, 222, 0.2) !important;
    transform: translateY(-1px);
}
.pair_info .aud a.btn-generic-online:before {
    content: 'public' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 1.8rem !important;
    display: block !important;
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
    display: flex !important;
    align-items: center !important;
    padding: 2.6rem 2.6rem 0.5rem 2.6rem !important;
    gap: 10px !important;
    margin-bottom: 2.4rem !important;
    position: relative !important;
    transition: transform 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6) !important;
    cursor: pointer;
    transform-origin: center bottom;
}

.sidebar-logo img {
    height: 3.2rem !important;
    width: auto !important;
    flex-shrink: 0 !important;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.sidebar-logo span {
    font-size: 3.2rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    letter-spacing: 0.5px !important;
    line-height: 1 !important;
}

[theme="dark"] .sidebar-logo img {
    filter: invert(1) brightness(2);
}

.logo-say-hey {
    position: absolute;
    left: 45px;
    top: 55px;
    font-size: 1.2rem;
    font-weight: 900;
    color: var(--color-accent);
    background: var(--color-card);
    padding: 2px 8px;
    border-radius: 8px;
    box-shadow: var(--shadow-main);
    opacity: 0;
    transform: translateY(5px);
    transition: all 0.3s ease;
    pointer-events: none;
    z-index: 10;
}

.logo-say-hey.active {
    opacity: 1;
    transform: translateY(0);
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
    background: var(--color-accent-active) !important;
    color: var(--color-accent) !important;
    padding: 0.5rem 1.2rem !important;
    border-radius: 50px !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    line-height: 1 !important;
    border: 1px solid var(--color-accent-active) !important;
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
    box-shadow: none !important;
    margin-bottom: 0 !important;
}

.day .common td {
    text-align: left !important;
}

.day .common td:last-child:hover {
    background: var(--color-accent-active) !important;
}

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

/* --- SURVEYS --- */

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
    list-style: none !important;
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

/* --- АНКЕТИРОВАНИЕ --- */

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

/* --- СТРАНИЦА "О РЕСУРСЕ" --- */

.about-card {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    padding: 4rem !important; 
    margin-bottom: 3rem !important;
    max-width: 900px !important;
}

.about-card p {
    font-size: 1.5rem !important;
    line-height: 1.8 !important;
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

/* --- ПОРТФОЛИО --- */

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
    white-space: normal !important;
    word-wrap: break-word !important;
    line-height: 1.4 !important;
    border-bottom: none !important;
    text-align: left !important;
    flex: 1 1 auto !important;
    margin-right: 1rem !important;
    display: block !important;
}

/* Бейдж-счетчик */
.portfolio-count {
    margin-left: auto !important;
    background: var(--color-accent-active) !important;
    color: var(--color-accent) !important;
    padding: 0.3rem 1rem !important;
    border-radius: 2rem !important;
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    pointer-events: none !important;
}

.portfolio-count {
    flex-shrink: 0 !important;
    margin-left: 0 !important;
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
    flex-shrink: 0 !important;
    margin-left: 0 !important;
}

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

    font-size: 0 !important;
    color: transparent !important;
    text-indent: -9999px !important;
    overflow: visible !important;
    display: block !important;
}


.ui-dialog .ui-dialog-titlebar-close span,
.ui-dialog .ui-dialog-titlebar-close .ui-icon,
.ui-dialog .ui-dialog-titlebar-close .ui-button-icon-primary {
    display: none !important;
}

.ui-dialog .ui-dialog-titlebar-close::after {
    content: 'close' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 20px !important;
    color: var(--color-text-secondary) !important;

    /* СБРОС И ЦЕНТРИРОВАНИЕ */
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;

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
    content: '\e5cd' !important;
    font-family: 'Material Icons Outlined' !important;
    font-size: 20px !important;
    color: var(--color-text-secondary) !important;
    display: block !important;
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

/* --- ДОГОВОРЫ --- */

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
    background: var(--color-highlight) !important;
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

/* --- ПРИКАЗЫ --- */

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

/* --- БЛАНКИ --- */

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

/* --- DETAILED TEACH PLAN --- */

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
    min-width: 800px !important;
}

.teach_plan td font[color="red"] {
    font-weight: 800 !important;
}

.teach_plan .bg_bold {
    background: var(--color-table-header) !important;
    font-weight: 700 !important;
}

/* --- TEACHER STATS --- */

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

/* --- ЖУРНАЛ ПОСЕЩЕНИЙ --- */
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
    .jour-badge { display: none !important; }
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

    .psu-logo {
        margin-bottom: 1.5rem !important;
    }
    .psu-logo::before {
        height: 9rem !important;
        margin-bottom: 1rem !important;
    }
    .psu-logo::after {
        font-size: 2.4rem !important;
        width: 80% !important;
    }
}

/* --- ТАБЛИЦА ПОСЕЩЕНИЙ --- */

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
    white-space: nowrap !important;
}
.wide-table-wrapper table td {
    white-space: nowrap !important;
}

/* --- ЕДИНЫЙ СТИЛЬ СООБЩЕНИЙ И ОБЪЯВЛЕНИЙ --- */

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
.message-pages li:first-child { display: none !important; }

/* Кнопка "Поделиться" в сообщениях */
.share-msg-btn {
    color: var(--color-text-secondary);
    user-select: none;
    transition: all 0.2s ease;
}
.share-msg-btn:hover {
    color: var(--color-accent) !important;
    transform: scale(1.15);
}

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

/* --- ОТЗЫВЫ И АНКЕТИРОВАНИЕ --- */

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

/* --- ОБРАТНАЯ СВЯЗЬ --- */
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

/* --- РЕЙТИНГ ПРЕПОДАВАТЕЛЕЙ --- */
#rating {
    width: auto !important;
    min-width: 1500px !important; 
    border-collapse: separate !important;
    border-spacing: 0 !important;
    table-layout: auto !important;
}

/* Строки факультетов (lvl1) */
#rating tr.lvl1 td {
    background-color: var(--color-highlight) !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    border-top: 2px solid var(--color-table-border) !important;
    padding-top: 1.4rem !important;
    padding-bottom: 1.4rem !important;
    position: sticky !important;
    left: 0;
}

/* Первая колонка (Названия кафедр) */
#rating td:first-child, #rating th:first-child {
    text-align: left !important;
    min-width: 300px !important; 
    max-width: 400px !important;
    position: sticky !important;
    left: 0;
    z-index: 2;
    background-color: var(--color-card) !important; 
    border-right: 1px solid var(--color-table-border) !important;
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
    min-width: 60px !important;
    white-space: nowrap !important;
}

/* Красные оценки */
#rating font[style*="color:#d00"],
#rating font[color="#d00"] {
    color: var(--color-red) !important;
    font-weight: 800 !important;
    background: rgba(255, 59, 48, 0.1) !important;
    padding: 0.4rem 0.8rem !important;
    border-radius: 6px !important;
    display: inline-block !important;
}

#rating b {
    font-weight: 600 !important;
}

/* --- MOBILE LOADING STATE --- */
.mobile-menu-btn.is-loading {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    padding: 0 !important;
    left: 50% !important;
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

/* --- ПРОПУЩЕННЫЕ ЗАНЯТИЯ --- */
.absence-capsule {
    display: inline-block !important;
    padding: 0.4rem 1rem !important;
    border-radius: 50px !important;
    font-weight: 700 !important;
    font-size: 1.2rem !important;
    white-space: nowrap !important;
    cursor: help !important;
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
        color: var(--color-text-secondary) !important;
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

    /* === УМНЫЕ КОЛОНКИ === */

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

    .timetable-grid {
        table-layout: fixed !important;
        width: 100% !important;
    }

    .timetable-grid td {
        white-space: normal !important;
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
    min-width: 800px !important;
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
    position: static !important;
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
    text-align: center !important;
    font-weight: 500 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}

/* 2. Колонка с предметом (Центральная) - забирает всё место */
html[theme] .timetable-grid td.pair_info {
    overflow: visible !important;
    vertical-align: middle !important;
}


/* 3. Колонка с преподавателем (Правая) */
html[theme] .timetable-grid td.pair_teacher {
    width: 160px !important;
    min-width: 140px !important;
    text-align: right !important;
    padding-right: 2rem !important;
    color: var(--color-text-secondary) !important;
    position: relative !important;
    vertical-align: middle !important;
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
}

html[theme] .timetable-grid td.pair_teacher br {
    display: none !important;
}

/* Имя преподавателя: центрируется таблицей, при наведении плавно уезжает вверх */
html[theme] .timetable-grid td.pair_teacher a:not(.eval) {
    display: inline-block !important;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative !important;
    z-index: 2 !important;
    line-height: 1.2 !important;
}

html[theme] .timetable-grid tr:has(td.pair_teacher .eval).tr-needs-space:hover td.pair_teacher a:not(.eval) {
    transform: translateY(-12px) !important;
}

html[theme] .timetable-grid tr:has(td.pair_teacher .eval):not(.tr-needs-space):hover td.pair_teacher a:not(.eval) {
    transform: translateY(-8px) !important;
}

/* Кнопка "Оценить занятие": висит невидимо в центре ячейки */
html[theme] .timetable-grid td.pair_teacher .eval {
    position: absolute !important;
    right: 2rem !important;
    top: 50% !important;
    transform: translateY(-50%) scale(0.9) !important;
    opacity: 0 !important;
    visibility: hidden !important;
    transition: all 0.3s ease !important;
    font-size: 1.05rem !important;
    display: block !important;
    z-index: 10 !important;
    color: var(--color-text-secondary) !important;
    text-decoration: underline !important;
}

html[theme] .timetable-grid tr:not(.tr-needs-space):hover td.pair_teacher .eval {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(6px) scale(1) !important;
}

html[theme] .timetable-grid tr.tr-needs-space:hover td.pair_teacher .eval {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(4px) scale(1) !important;
}

/* При наведении кнопка появляется и отъезжает вниз, занимая место */
html[theme] .timetable-grid tr:hover td.pair_teacher .eval {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) !important;
}

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
.type-badge-exam { color: var(--color-red) !important; }

/* --- АНИМАЦИИ ДЛЯ СТРОК РАСПИСАНИЯ --- */
@keyframes cellScaleIn {
    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes cellScaleOut {
    0% { opacity: 1; transform: scale(1) translateY(0); }
    100% { opacity: 0; transform: scale(0.95) translateY(-10px); }
}

/* Анимация для вновь появляющихся "Окон" */
.timetable-gap-row td {
    animation: cellScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Анимации, которые будет переключать JS */
.row-animating-in td {
    animation: cellScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.row-animating-out td {
    animation: cellScaleOut 0.25s ease forwards;
}

/* --- РАСПИСАНИЕ ДЛЯ МОБИЛЬНЫХ --- */
@media (max-width: 960px) {

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
        padding: 0 !important;
        background: transparent !important;
        font-size: 1.3rem !important;
    }

    html[theme] .timetable-grid {
        table-layout: fixed !important;
        width: 100% !important;
    }

    html[theme] .timetable-grid td.pair_num {
        width: 75px !important;
        min-width: 75px !important;
        padding-left: 1rem !important;
        padding-right: 0.5rem !important;
        font-size: 1.1rem !important;
    }

    html[theme] .timetable-grid td.pair_info {
        width: auto !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
    }

    html[theme] .timetable-grid td.pair_teacher .eval {
        right: 1.4rem !important;
        top: 3.8rem !important;
    }

    html[theme] .timetable-grid tr:not(:last-child) {
        background-image: linear-gradient(to right,
            transparent calc(75px + 0.5rem),
            var(--color-table-border) calc(75px + 0.5rem),
            var(--color-table-border) calc(100% - 1.6rem),
            transparent calc(100% - 1.6rem)
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
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    margin-bottom: 3rem !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    background: var(--color-card) !important;
}

/* Сама таблица */
.tpr_part table {
    width: 100% !important;
    min-width: 600px !important;
    background: transparent !important;
    border-collapse: collapse !important;
    margin: 0 !important;
    box-shadow: none !important;
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
    background: var(--color-highlight) !important;
}

.tpr_part table td:last-child {
    color: var(--color-text-secondary) !important;
}

/* --- ПОИСК ПРЕПОДАВАТЕЛЕЙ --- */
/* Контейнер поиска */
.teacher-search-wrapper {
    margin: 0 0 2.4rem 0 !important;
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
}

/* Капсула */
.search-capsule {
    display: flex !important;
    align-items: center !important;
    position: relative !important;
    width: 100% !important;
    height: 40px !important;
    background: var(--color-card) !important;
    border: 1px solid var(--color-table-border) !important;
    border-radius: 22px !important;
    box-shadow: var(--shadow-main) !important;
    box-sizing: border-box !important;
    text-decoration: none !important;
}

button.search-capsule {
    justify-content: flex-start !important;
    padding: 0 10px 0 34px !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.4rem !important;
    font-weight: 400 !important;
    font-family: inherit !important;
    cursor: pointer !important;
    transition: background 0.2s ease !important;
}

/* Специфика для ИНПУТА внутри капсулы */
.search-capsule input {
    width: 100% !important;
    height: 100% !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 10px 0 34px !important;
    margin: 0 !important;
    color: var(--color-text-primary) !important;
    font-size: 1.4rem !important;
}
.search-capsule input::placeholder {
    color: var(--color-text-secondary) !important;
    opacity: 1 !important;
}

/* Общая иконка */
.search-capsule .material-icons {
    position: absolute !important;
    left: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    font-size: 20px !important;
    color: var(--color-text-secondary) !important;
    pointer-events: none !important;
}

/* Ховер для кнопки */
button.search-capsule:hover {
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
}

/* Поле ввода внутри капсулы */
.search-capsule .search-input {
    width: 100% !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 0 0 32px !important;
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
    white-space: normal !important;
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
    table-layout: auto !important;
    width: 100% !important;
}

.library-subject-block td,
#record_list td {
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    line-height: 1.4 !important;
    vertical-align: top !important;
}

.span9 .wide-table-wrapper table,
.span9 table.resource-table,
.span9 table.common {
    table-layout: auto !important;
    width: 100% !important;
    border-collapse: collapse !important;
}

.span9 .wide-table-wrapper td,
.span9 .wide-table-wrapper th {
    white-space: normal !important;
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
    min-width: 250px !important;
}

/* Колонки с датами (Выданные книги)*/
.span9 table.library-history-table td:not(:first-child) {
    white-space: nowrap !important;
    text-align: center !important;
    width: 120px !important;
}

/* 1. Точка в сайдбаре (ПК и Мобайл меню) */
.span3 > .nav.nav-tabs.nav-stacked > li > a .badge-point {
    display: block !important;
    width: 8px !important;
    height: 8px !important;
    min-width: 8px !important;
    min-height: 8px !important;
    background-color: #FF3B30 !important;
    border-radius: 50% !important;
    margin-left: auto !important;
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
    min-width: 0 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* 2. Точка на мобильной кнопке (Капсула) */
.mobile-notify-dot {
    position: absolute !important;
    top: 50% !important;
    left: 42px !important;
    transform: translateY(-160%) scale(0) !important;

    width: 10px !important;
    height: 10px !important;
    background-color: #FF3B30 !important;
    border-radius: 50% !important;
    border: 2px solid var(--color-accent) !important;
    z-index: 100 !important;
    pointer-events: none !important;
    opacity: 0 !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
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

/* --- LIVE TIMETABLE INDICATORS --- */
@keyframes pulse-live {
    0% { transform: scale(0.9); box-shadow: 0 0 0 0 var(--pulse-color); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 0, 0, 0); }
    100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

.live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    z-index: 10;
    display: inline-block;
}

.pair_num .live-dot,
.timetable-gap-capsule .live-dot {
    position: absolute !important;
    top: 50%;
    transform: translateY(-50%);
}

.pair_num .live-dot { right: 8px; }
.timetable-gap-capsule .live-dot { right: -14px; }

.pair_num {
    position: relative;
}
.pair_num .live-dot {
    right: 8px;
    top: 50%;
    margin-top: -4px;
    position: static !important;
    transform: none !important;
    margin: 0 !important;
}

.timetable-gap-capsule {
    position: relative;
}
.timetable-gap-capsule .live-dot {
    right: -16px;
    top: 50%;
    margin-top: -4px;
}

.live-dot.active { --pulse-color: rgba(52, 199, 89, 0.4); background-color: var(--color-green) !important; animation: pulse-live 2s infinite; }
.live-dot.soon { --pulse-color: rgba(255, 204, 0, 0.4); background-color: var(--color-yellow) !important; animation: pulse-live 1.5s infinite; }
.live-dot.ending { --pulse-color: rgba(255, 59, 48, 0.4); background-color: var(--color-red) !important; animation: pulse-live 1s infinite; }

/* Для заголовка дня подгоняем отступ */
.day-name .live-dot {
    position: static !important;
    vertical-align: middle;
    transform: none;
    margin-left: 10px;
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

/* --- GRADE CALCULATOR (Прогноз оценок) --- */
.subject-score-capsule {
    position: relative;
    cursor: help;
}
.score-tooltip {
    position: absolute;
    bottom: 130%;
    right: 0; 
    transform: translateY(10px);
    background: #2A2C2F;
    color: #fff;
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius-small);
    font-size: 1.2rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 100;
    pointer-events: none;
}
.score-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border-width: 5px;
    border-style: solid;
    border-color: #2A2C2F transparent transparent transparent;
}
.subject-score-capsule:hover .score-tooltip,
.subject-score-capsule:active .score-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* --- ЗАМЕТКИ ДЛЯ ПРЕДМЕТОВ (To-Do) --- */
.subject-note-btn {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-left: 6px !important;
    padding: 2px !important;
    width: 24px !important;
    height: 24px !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    flex-shrink: 0 !important;
    opacity: 0 !important;
    visibility: hidden !important;
    transform: scale(0.8) !important;
    pointer-events: none !important;

    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.subject-note-btn .material-icons {
    font-size: 1.6rem !important;
    margin: 0 !important;
}

/* При наведении ИЛИ если есть заметка - плавно проявляем */
.timetable-grid tr:hover .subject-note-btn,
.subject-note-btn.has-note {
    opacity: 1 !important;
    visibility: visible !important;
    transform: scale(1) !important;
    pointer-events: auto !important;
}

/* Цвет для заполненной заметки */
.subject-note-btn.has-note {
    color: var(--color-warning) !important;
}

/* Цвет пустой кнопки */
.subject-note-btn:not(.has-note) {
    color: var(--color-text-secondary) !important;
}

.subject-note-btn:hover {
    transform: scale(1.15) !important;
    color: var(--color-accent) !important;
    background: var(--color-highlight) !important;
}

/* Стили текстового поля в модалке */
.note-modal-textarea {
    width: 100%;
    min-height: 140px;
    padding: 1.4rem;
    border-radius: var(--radius-small);
    border: 1px solid var(--color-table-border);
    background: var(--color-input);
    color: var(--color-text-primary);
    font-size: 1.4rem;
    resize: vertical;
    margin-top: 1rem;
    font-family: inherit;
    line-height: 1.5;
}

.note-modal-textarea:focus {
    border-color: var(--color-accent);
    outline: none;
    box-shadow: 0 0 0 3px var(--color-accent-active);
}

/* --- Одинаковая высота для капсул тулбара и кружков недель --- */
.timetable-toolbar > *,
.timetable-toolbar .toolbar-item,
.timetable-toolbar label.toolbar-item,
.timetable-toolbar .sync-btn {
    height: 3.8rem !important;
    padding: 0 1.6rem !important;
    box-sizing: border-box !important;
}

/* Перебиваем старые урезанные отступы на мобильных экранах */
@media (max-width: 960px) {
    .timetable-toolbar > *,
    .timetable-toolbar .toolbar-item,
    .timetable-toolbar label.toolbar-item,
    .timetable-toolbar .sync-btn {
        height: 3.8rem !important;
        padding: 0 1.4rem !important;
        border-radius: 50px !important;
    }
}

/* --- REVIEWS MODAL --- */
.star-rating {
    display: flex; gap: 4px; cursor: pointer; color: var(--color-yellow); margin-bottom: 1rem;
}
.star-rating .material-icons {
    font-size: 32px !important; transition: transform 0.1s;
}
.star-rating .material-icons:hover { transform: scale(1.1); }

.reviews-list-container {
    max-height: 300px; overflow-y: auto; margin-top: 2rem; padding-top: 2rem;
    border-top: 1px solid var(--color-table-border); display: flex; flex-direction: column; gap: 1rem;
}
.review-item-db {
    background: var(--color-highlight); padding: 1.6rem; border-radius: var(--radius-medium);
}
.review-item-db-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;
}
.review-item-db-stars { color: var(--color-yellow); display: flex; align-items: center; font-size: 1.6rem; }
.review-item-db-date { color: var(--color-text-secondary); font-size: 1.1rem; }
.review-item-db-text { color: var(--color-text-primary); font-size: 1.3rem; line-height: 1.5; }

/* --- АНИМАЦИЯ И ВЫРАВНИВАНИЕ ИКОНКИ ПОДЕЛИТЬСЯ --- */
.msg-date-wrapper {
    display: flex !important;
    align-items: flex-end !important;
    justify-content: flex-end;
}

.msg-date-text {
    line-height: 1 !important;
    padding-bottom: 1px;
}

.share-msg-wrap {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transition: max-width 0.3s ease, opacity 0.3s ease, margin-left 0.3s ease, transform 0.3s ease;
}

.share-msg-btn {
    color: var(--color-text-secondary);
    cursor: pointer;
    display: block;
    transition: color 0.2s ease, transform 0.2s ease;
    margin-bottom: -1px;
}

.share-msg-btn:hover {
    color: var(--color-accent) !important;
    transform: scale(1.15) translateY(-1px);
}

@media (hover: hover) and (pointer: fine) {
    .share-msg-wrap {
        max-width: 0;
        opacity: 0;
        margin-left: 0;
        transform: translateX(10px);
        pointer-events: none;
    }
    .msg-card:hover .share-msg-wrap {
        max-width: 24px;
        opacity: 1;
        margin-left: 8px;
        transform: translateX(0);
        pointer-events: auto;
    }
}

/* Логика для смартфонов (иконка всегда видима, так как нет курсора) */
@media (hover: none), (pointer: coarse) {
    .share-msg-wrap {
        max-width: 24px;
        opacity: 1;
        margin-left: 8px;
        transform: none;
    }
}

/* --- PSEUDO PUSH NOTIFICATIONS --- */
.push-container {
    position: fixed;
    z-index: 2000000;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    pointer-events: none;
}

@media (min-width: 961px) {
    .push-container { top: 2.5rem; right: 2rem; width: 380px; }
}

@media (max-width: 960px) {
    .push-container { top: 1.5rem; left: 1rem; right: 1rem; }
    .submenu > *:not(:last-child):not(.answer-btn-custom)::after,
    .weeks .week:not(:last-child)::after {
        right: -3.5px !important;
    }
}

.push-toast {
    box-sizing: border-box !important;
    backdrop-filter: blur(18px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(18px) saturate(180%) !important;

    background-color: rgba(var(--push-bg-rgb), 0.65) !important;

    color: var(--color-text-primary);
    padding: 1.6rem;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);

    border: 1px solid rgba(255, 255, 255, 0.12) !important;

    width: 100% !important;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: auto;
    cursor: pointer;
}

/* Цвета фона для темной и светлой темы */
[theme="light"] .push-toast { --push-bg-rgb: 255, 255, 255; border-color: rgba(0,0,0,0.05) !important; }
[theme="dark"] .push-toast { --push-bg-rgb: 28, 30, 32; }

.push-toast.show { opacity: 1; transform: scale(1) translateY(0); }

.push-icon-wrap {
    width: 4.4rem;
    height: 4.4rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: inset 0 0 12px rgba(255,255,255,0.05);
}

.push-icon-wrap .material-icons { font-size: 2.4rem !important; }

/* Настройки цветов для типов уведомлений */
.push-toast.info .push-icon-wrap { background: rgba(0, 122, 255, 0.25); color: #007AFF; }
.push-toast.success .push-icon-wrap { background: rgba(52, 199, 89, 0.25); color: #34C759; }
.push-toast.warning .push-icon-wrap { background: rgba(255, 149, 0, 0.25); color: #FF9500; }

.push-content { flex-grow: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }

.push-toast-title {
    font-weight: 800;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-text-primary);
    opacity: 0.5;
}

.push-subject {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-primary);
}

.push-detail {
    font-size: 1.35rem;
    color: var(--color-text-primary);
    opacity: 0.7;
}

.push-toast:hover {
    transform: translateY(-2px) scale(1.02);
    background-color: rgba(var(--push-bg-rgb), 0.8) !important;
}

/* --- ПОЛЬЗОВАТЕЛЬСКИЕ ПАРЫ --- */
.add-custom-pair-btn {
    cursor: pointer;
    color: var(--color-text-secondary);

    opacity: 0;
    visibility: hidden;

    transform: scale(0.8) translateZ(0);
    will-change: opacity, visibility, transform;

    transition: all 0.2s ease;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
}

/* Показываем при наведении на шапку дня */
.span9 .day h3:hover .add-custom-pair-btn {
    opacity: 1;
    visibility: visible;
    transform: scale(1) translateZ(0);
}

.add-custom-pair-btn:hover {
    color: var(--color-accent);
    background: var(--color-highlight);
}

/* Строка пользовательской пары */
.custom-pair-row .pair_info .dis a {
    color: var(--color-accent) !important;
    font-weight: 700 !important;
}

/* Кнопка удаления (крестик справа от названия предмета) */
.delete-custom-pair-btn {
    opacity: 0;
    visibility: hidden;

    transform: scale(0.8) translateZ(0);
    will-change: opacity, visibility, transform;

    cursor: pointer;
    color: var(--color-red);
    transition: all 0.2s ease;
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    padding: 2px;
    vertical-align: middle;
}

/* Показываем крестик при наведении на строку */
.custom-pair-row:hover .delete-custom-pair-btn {
    opacity: 1;
    visibility: visible;
    transform: scale(1) translateZ(0);
}

.delete-custom-pair-btn:hover { background: rgba(255, 59, 48, 0.1); }

/* Инпуты в модалке */
.custom-pair-input-group { display: flex; gap: 1rem; margin-bottom: 1.2rem; }
.custom-pair-input-group > input, .custom-pair-input-group > select {
    flex: 1;
    padding: 1rem 1.2rem !important;
    border: 1px solid var(--color-table-border) !important;
    background: var(--color-input) !important;
    border-radius: var(--radius-small) !important;
    color: var(--color-text-primary) !important;
    font-size: 1.4rem !important;
}

/* Вкладки в модальном окне редактирования */
.modal-tabs {
    display: flex;
    border-bottom: 1px solid var(--color-table-border);
    margin-bottom: 1.5rem;
}
.modal-tab {
    flex: 1;
    padding: 1rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-weight: 600;
    font-size: 1.3rem;
    transition: all 0.2s;
}
.modal-tab.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
}
.tab-content { display: none; }
.tab-content.active { display: block; }

/* --- SUBMENU (ПОДВКЛАДКИ) --- */
.submenu {
    /* Убираем боковые градиенты-тени */
    background-image: none !important;
}
[theme="dark"] .submenu {
    background: var(--color-card) !important;
}

/* Стили неактивных кнопок (убираем фон) */
.submenu a:not(.answer-btn-custom) {
    background: transparent !important;
    color: var(--color-text-secondary) !important;
}
.submenu a:not(.answer-btn-custom):hover {
    background: transparent !important;
    color: var(--color-text-primary) !important;
    transform: none !important;
}

/* Разделители между вкладками */
.submenu > *:not(:last-child):not(.answer-btn-custom) {
    position: relative !important;
}
.submenu > *:not(:last-child):not(.answer-btn-custom)::after {
    content: '';
    position: absolute !important;
    right: -4.5px !important;
    top: 25% !important;
    bottom: 25% !important;
    width: 1px !important;
    background-color: var(--color-table-border) !important;
    pointer-events: none !important;
}
/* Скрываем разделитель рядом с активной кнопкой для красоты */
.submenu > *:has(+ b)::after,
.submenu > b::after {
    display: none !important;
}


/* --- WEEKS (НЕДЕЛИ) --- */
.weeks {
    /* Убираем боковые градиенты-тени */
    background-image: none !important;
}
[theme="dark"] .weeks {
    background: var(--color-card) !important;
}

.weeks .week {
    background-color: transparent !important;
    color: var(--color-text-secondary) !important;
    border-radius: 50px !important;
    width: auto !important;
    min-width: 3.8rem !important;
    padding: 0 14px !important;
}
.weeks > .week > a {
    border-radius: 50px !important;
    color: var(--color-text-secondary) !important;
}

.weeks .week:not(.current):hover {
    background-color: transparent !important;
}
.weeks .week:not(.current):hover > a {
    color: var(--color-text-primary) !important;
}

/* Разделители между неделями */
.weeks .week:not(:last-child) {
    position: relative !important;
}
.weeks .week:not(:last-child)::after {
    content: '';
    position: absolute !important;
    right: -4.5px !important;
    top: 25% !important;
    bottom: 25% !important;
    width: 1px !important;
    background-color: var(--color-table-border) !important;
    pointer-events: none !important;
}
/* Скрываем разделитель рядом с активной кнопкой */
.weeks .week:has(+ .current)::after,
.weeks .week.current::after {
    display: none !important;
}

/* Убираем тень у кнопок внутри тулбара (Аналитика, Топ предметов и т.д.) */
.timetable-toolbar button.toolbar-item,
button.analytics-btn {
    box-shadow: none !important;
}

/* Отключаем системную серую/синюю подсветку при тапе на мобильных */
.mobile-menu-btn,
.submenu a,
.submenu b,
.weeks .week a,
.weeks .week {
    -webkit-tap-highlight-color: transparent !important;
}

/* Активное состояние для кнопок в тулбаре (Синхронизация) */
.timetable-toolbar .toolbar-item.is-active {
    background: var(--color-accent) !important;
    color: var(--color-text-primary-invert) !important;
    font-weight: 600 !important;
}

/* Убираем тень при наведении на активную кнопку */
.timetable-toolbar .toolbar-item.is-active:hover {
    background: var(--color-accent-dark, var(--color-accent)) !important;
}

.weeks .week.session:not(.current),
.weeks .week.session:not(.current) a {
    color: var(--color-red) !important;
}

.weeks .week.holiday:not(.current),
.weeks .week.holiday:not(.current) a {
    color: var(--color-green) !important;
}

@media (max-width: 960px) {

    /* 1. скрытое состояние карандаша по умолчанию */
    .subject-note-btn {
        opacity: 0 !important;
        visibility: hidden !important;
        transform: scale(0.8) !important;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        pointer-events: none !important;
    }

    /* Показываем карандаш только при наведении на всю строку */
    .timetable-grid tr:hover .subject-note-btn {
        opacity: 1 !important;
        visibility: visible !important;
        transform: scale(1) !important;
        pointer-events: auto !important;
    }

    /* 2. Фикс "Онлайн в" (запрещаем перенос слов внутри текста) */
    .pair_info .aud {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important; 
        align-items: center !important;
        gap: 6px !important;
        max-width: none !important;
    }

    /* Контейнер текста "Онлайн в" делаем неразрывным */
    .pair_info .aud div {
        white-space: nowrap !important;
    }

    /* 3. Фикс колонки преподавателя и оценки */
    html[theme] .timetable-grid td.pair_teacher {
        width: 100px !important;
        min-width: 100px !important;
        padding-right: 1.6rem !important;
        vertical-align: middle !important;
        position: relative !important;
    }

    /* Оборачиваем содержимое ячейки препода в Flex-стек */
    html[theme] .timetable-grid td.pair_teacher {
        display: table-cell !important;
    }

    /* Убираем абсолютное позиционирование у оценки, чтобы она не наезжала на Zoom */
    html[theme] .timetable-grid td.pair_teacher .eval {
        position: static !important;
        display: block !important;
        width: auto !important;
        text-align: right !important;
        margin-top: 4px !important;
        opacity: 0 !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
        transform: translateY(5px) !important;
        transition: all 0.2s ease !important;
    }

    /* Состояние ХОВЕРА для препода и оценки */
    html[theme] .timetable-grid tr:hover td.pair_teacher a:not(.eval) {
        transform: translateY(0) !important;
        display: block !important;
    }

    html[theme] .timetable-grid tr:hover td.pair_teacher .eval {
        opacity: 1 !important;
        visibility: visible !important;
        height: auto !important;
        transform: translateY(0) !important;
    }
    /* УДАЛЕНИЕ ВЕРХНИХ ГРАНИЦ У ТАБЛИЦ */
    .span9 table.common,
    .span9 table.teach_plan,
    .wide-table-wrapper table {
        border-top: none !important;
    }

    /* Убираем границу у самих ячеек первой строки */
    .span9 table.common tr:first-child th,
    .span9 table.common tr:first-child td,
    .span9 table.teach_plan tr:first-child th,
    .span9 table.teach_plan tr:first-child td {
        border-top: none !important;
        border-top-width: 0 !important;
    }

    .submenu .eval-plan-link {
        background: transparent !important;
        color: var(--color-text-secondary) !important;
        text-decoration: underline !important;
        font-size: 1.2rem !important;
        font-weight: 500 !important;
        margin-left: auto !important;
        padding-right: 15px !important;
    }

    .submenu .eval-plan-link:hover {
        color: var(--color-accent) !important;
        background: transparent !important;
        transform: none !important;
    }
}

.teacher-meta-row {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 1.2rem !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    padding-bottom: 1.2rem !important;
    margin-bottom: 1.6rem !important;
    width: 100% !important;
}

.teacher-badges-box {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    justify-content: flex-end !important;
}

@media (max-width: 600px) {
    .teacher-meta-row {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        gap: 0.8rem !important;
    }

    .teacher-badges-box {
        justify-content: center !important;
        width: 100% !important;
    }

    .teacher-dept-link {
        width: auto !important;
        text-align: center !important;
    }
}

/* Стили плавающего индикатора при свайпе */
#swipe-action-bubble {
    position: fixed;
    width: 24px;
    height: 24px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.8);
    transition: color 0.2s, opacity 0.1s, transform 0.2s;
}

#swipe-action-bubble .material-icons {
    font-size: 28px !important;
}

#swipe-action-bubble.active-threshold {
    transform: scale(1.15);
}

#swipe-action-bubble.active-threshold.action-add { color: var(--color-accent) !important; }
#swipe-action-bubble.active-threshold.action-note { color: var(--color-accent); }
#swipe-action-bubble.active-threshold.action-eval { color: var(--color-yellow); }

/* БЛОКИРОВКА ХОВЕРОВ НА СМАРТФОНАХ */
@media (hover: none), (pointer: coarse) {
    .timetable-grid tr, .day { touch-action: pan-y; }

    /* Жестко убиваем все смещения текста преподавателей на мобилках */
    html[theme] .timetable-grid tr:hover td.pair_teacher a:not(.eval),
    html[theme] .timetable-grid tr:has(td.pair_teacher .eval).tr-needs-space:hover td.pair_teacher a:not(.eval),
    html[theme] .timetable-grid tr:has(td.pair_teacher .eval):not(.tr-needs-space):hover td.pair_teacher a:not(.eval) {
        transform: none !important;
    }

    html[theme] .timetable-grid tr:hover td.pair_teacher .eval,
    html[theme] .timetable-grid td.pair_teacher .eval {
        opacity: 0 !important;
        visibility: hidden !important;
        height: 0 !important;
        pointer-events: none !important;
    }

    /* Отключаем системную вспышку на ссылках сайдбара в iOS */
    .span3 > .nav.nav-tabs.nav-stacked > li > a {
        -webkit-tap-highlight-color: transparent !important;
    }

    .add-custom-pair-btn { display: none !important; }
    .delete-custom-pair-btn {
        opacity: 1 !important; visibility: visible !important; transform: scale(1) !important;
        color: var(--color-text-secondary) !important;
    }

    .timetable-grid tr:hover .subject-note-btn:not(.has-note) {
        opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;
    }
    .subject-note-btn.has-note {
        opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
    }
}

/* --- COLOR PICKER MODAL --- */
.color-picker-grid {
    display: grid;
    grid-template-columns: repeat(5, 42px);
    gap: 1.2rem;
    margin-top: 1rem;
    justify-content: center;
}

.color-picker-circle {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: 800;
    color: #fff;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.color-picker-circle:hover { transform: scale(1.15); }

.color-picker-circle.selected {
    transform: scale(1.2);
    color: var(--color-text-primary);
    text-shadow: 0 0 6px var(--color-card), 0 0 2px var(--color-card);
}

.color-picker-controls-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 2.4rem;
}

.color-picker-toggle-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.8rem 1.6rem;
    border-radius: 50px;
    transition: background 0.4s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    height: 42px;
}

.color-picker-toggle-wrap span {
    font-size: 1.1rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #fff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.color-picker-random-btn {
    width: 42px !important;
    height: 42px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: var(--color-card) !important;
    color: var(--color-text-secondary) !important;
    border: 1px solid var(--color-table-border) !important;
    cursor: pointer !important;
    box-shadow: var(--shadow-main) !important;
    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s, background 0.2s !important;
}

@media (hover: hover) and (pointer: fine) {
    .color-picker-random-btn:hover {
        color: var(--color-accent) !important;
        transform: scale(1.15) !important;
    }
}

/* Анимация при самом клике (сжатие) */
.color-picker-random-btn:active,
.color-picker-random-btn.clicked {
    transform: scale(0.9) !important;
    transition: transform 0.1s ease !important;
}

.color-picker-random-btn .material-icons {
    font-size: 22px !important;
    margin: 0 !important;
}

/* --- THEME SELECTOR --- */
.theme-selector-group {
    display: inline-flex;
    background: var(--color-card);
    border: 1px solid var(--color-table-border);
    border-radius: 50px;
    padding: 4px;
    gap: 4px;
    height: 42px;
    align-items: center;
    box-shadow: var(--shadow-main);
}
.theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent !important;
    border: none !important;
    color: var(--color-text-secondary) !important;
    border-radius: 50px !important;
    cursor: pointer;
    transition: all 0.2s ease !important;
    box-shadow: none !important;
    width: 48px;
    height: 34px;
    padding: 0 !important;
}
.theme-btn .material-icons {
    font-size: 22px !important;
    margin: 0 !important;
}
/* Ховер только для ПК */
@media (hover: hover) and (pointer: fine) {
    .theme-btn:hover {
        color: var(--color-text-primary) !important;
        background: var(--color-highlight) !important;
    }
}
.theme-btn.active {
    background: var(--color-highlight) !important;
    color: var(--color-text-primary) !important;
    box-shadow: inset 0 0 0 1px var(--color-table-border) !important;
}
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

    // ==========================================
    // ЛОГИКА КАСТОМИЗАЦИИ (ЦВЕТА И ГРАДИЕНТЫ)
    // ==========================================
    const ACCENT_COLORS = {
        // Ряд 1: Базовые
        blue: '#007AFF', green: '#34C759', purple: '#AF52DE', red: '#FF3B30', orange: '#FF9500',
        // Ряд 2: Светлые
        lightblue: '#5AC8FA', mint: '#00C7BE', lightpurple: '#E58FFF', pink: '#FF2D55', yellow: '#FFCC00',
        // Ряд 3: Глубокие
        indigo: '#5856D6', teal: '#30B0C7', brown: '#A2845E', rose: '#FF94A5', slate: '#708090',
        // Ряд 4: Яркие и Темные
        lime: '#AEEA00', cyan: '#00BCD4', deeporange: '#FF5722', magenta: '#E91E63', graphite: '#444444'
    };

    const COLOR_ORDER = [
        'blue', 'green', 'purple', 'red', 'orange',
        'lightblue', 'mint', 'lightpurple', 'pink', 'yellow',
        'indigo', 'teal', 'brown', 'rose', 'slate',
        'lime', 'cyan', 'deeporange', 'magenta', 'graphite'
    ];

    function applyAccentColor() {
        const config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };

        let c1 = ACCENT_COLORS[config.colors[0]] || ACCENT_COLORS.blue;
        let c2 = config.colors[1] ? ACCENT_COLORS[config.colors[1]] : c1;

        let styleEl = document.getElementById('etis-custom-accent');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'etis-custom-accent';
            document.head.appendChild(styleEl);
        }

        const hexToRgba = (hex, alpha) => {
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const bgAccent = config.isGradient ? `linear-gradient(135deg, ${c1}, ${c2})` : c1;

        styleEl.innerHTML = `
            :root, [theme="light"], [theme="dark"] {
                --color-accent: ${c1} !important;
                --color-text-link: ${c1} !important;
                --color-accent-active: ${hexToRgba(c1, 0.15)} !important;
                --bg-accent: ${bgAccent} !important;
            }

            /* --- 1. ФОНЫ (Кнопки, активные вкладки, плашки) --- */
            .span3 > .nav.nav-tabs.nav-stacked > li.active > a,
            .weeks .week.current,
            .submenu b,
            .answer-btn-custom,
            #sbmt,
            .gpa-capsule,
            .mobile-menu-btn,
            .timetable-toolbar .toolbar-item.is-active,
            form.que_form #send_btn,
            .badge.ctl,
            .jour-info-group {
                background: var(--bg-accent) !important;
                border: none !important;
                color: #fff !important;
            }

            /* --- 2. ТЕКСТ И ИКОНКИ (Лица, скрепки, ссылки) --- */
            ${config.isGradient ? `
            .msg-sender,
            .msg-sender .material-icons,
            .file-attachment-link .material-icons,
            .teacher-name-link,
            .review-dis-link,
            .tpr_part > a,
            .theme a,
            .logo-say-hey,
            .accent-stat,
            #swipe-action-bubble.active-threshold.action-note,
            #swipe-action-bubble.active-threshold.action-note .material-icons,
            #swipe-action-bubble.active-threshold.action-add,
            #swipe-action-bubble.active-threshold.action-add .material-icons
                background: var(--bg-accent) !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
                color: transparent !important;
                display: inline-block;
            }

            .weeks .week.actual-week:not(.current) > a,
            .stat-box-value,
            .msg-sender {
                display: inline-flex !important;
            }
            ` : `
            /* Если градиент ВЫКЛЮЧЕН — просто красим текст сплошным цветом */
            .msg-sender,
            .msg-sender .material-icons,
            .file-attachment-link .material-icons,
            .teacher-name-link,
            .review-dis-link,
            .tpr_part > a,
            .theme a,
            .logo-say-hey,
            .accent-stat,
            #swipe-action-bubble.active-threshold.action-note,
            #swipe-action-bubble.active-threshold.action-add,
            #swipe-action-bubble.active-threshold.action-note .material-icons {
                color: var(--color-accent) !important;
            }
            `}
        `;
    }

    // Применяем сразу при загрузке
    applyAccentColor();

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
        // Запуск через секунду, чтобы страница прогрузилась
        setTimeout(initAutoUpdateCheck, 1500);
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

    // ==========================================
    // ЛОГИКА ОБНОВЛЕНИЯ
    // ==========================================

    let updateState = {
        status: 'idle',
        hasUpdate: false,
        remoteVer: '',
        remoteDate: '',
        remoteLog: '',
        details: ''
    };

    function compareVersions(v1, v2) {
        if (!v1 || !v2) return 0;
        const p1 = v1.split('.');
        const p2 = v2.split('.');

        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            let s1 = p1[i] || "0";
            let s2 = p2[i] || "0";

            if (s1.length !== s2.length) {
                const maxLen = Math.max(s1.length, s2.length);
                s1 = s1.padEnd(maxLen, '0');
                s2 = s2.padEnd(maxLen, '0');
            }

            const n1 = parseInt(s1, 10);
            const n2 = parseInt(s2, 10);

            if (n1 > n2) return 1;
            if (n1 < n2) return -1;
        }
        return 0;
    }

    // Безопасное получение заголовка (даже если метода .getResponseHeader нет)
    function getHeaderSafe(res, headerName) {
        if (typeof res.getResponseHeader === 'function') {
            try { return res.getResponseHeader(headerName); } catch(e) {}
        }
        if (res.responseHeaders) {
            const regex = new RegExp(headerName + ':\\s*(.*)', 'i');
            const match = res.responseHeaders.match(regex);
            return match ? match[1] : null;
        }
        return null;
    }

    function initAutoUpdateCheck(isManual = false) {
        if (updateState.status === 'loading' && !isManual) return;
        updateState.status = 'loading';
        if (isManual) refreshModalUI();

        GM_xmlhttpRequest({
            method: "GET",
            url: UPDATE_URL + '?t=' + Date.now(),
            timeout: 10000,
            onload: function(res) {
                try {
                    const text = res.responseText;
                    const verMatch = text.match(/@version\s+([\d\.]+)/);
                    if (!verMatch) throw new Error("Версия не найдена в файле");

                    const remoteVer = verMatch[1];
                    const currentVer = GM_info.script.version;

                    // ПАРСИНГ ЛОГА ИЗ ТЕКСТА
                    const logMatch = text.match(/@changelog\s+(.*)/);
                    const remoteLog = logMatch ? logMatch[1].trim() : "";

                    let dateStr = "н/д";
                    const lastMod = getHeaderSafe(res, "Last-Modified") || getHeaderSafe(res, "Date");
                    if (lastMod) {
                        const d = new Date(lastMod);
                        if (!isNaN(d.getTime())) {
                            dateStr = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`;
                        }
                    }

                    updateState.remoteVer = remoteVer;
                    updateState.remoteDate = dateStr;
                    updateState.remoteLog = remoteLog; // Сохраняем лог
                    updateState.hasUpdate = compareVersions(remoteVer, currentVer) > 0;
                    updateState.status = 'success';

                    if (updateState.hasUpdate) triggerUpdateIndicators();
                } catch (e) {
                    updateState.status = 'error';
                    updateState.details = e.message;
                }
                refreshModalUI();
            },
            onerror: () => { updateState.status = 'error'; updateState.details = "Сеть недоступна"; refreshModalUI(); }
        });
    }

    function triggerUpdateIndicators() {
        const link = document.querySelector('a[href="#version-check"]');
        if (link && !link.querySelector('.badge-point')) {
            const dot = document.createElement('span');
            dot.className = 'badge-point';
            link.appendChild(dot);
        }
        const mob = document.querySelector('.mobile-menu-btn');
        if (mob) mob.classList.add('has-updates');
    }

    function getUpdateHTML() {
        const cur = GM_info.script.version;
        if (updateState.status === 'loading') return `<div style="padding:2rem;text-align:center;"><span class="material-icons" style="font-size:48px;color:var(--color-accent);animation:spin 1s linear infinite;">sync</span><div style="margin-top:1rem;font-size:1.6rem;">Проверка...</div></div><style>@keyframes spin{100%{transform:rotate(360deg)}}</style>`;
        if (updateState.status === 'error') return `<div style="text-align:center;"><span class="material-icons" style="font-size:48px;color:var(--color-red);">error_outline</span><div style="font-size:1.6rem;margin:1rem 0;">Ошибка: ${updateState.details}</div><button id="retry-update" class="answer-btn-custom" style="margin:0 auto;">Повторить</button></div>`;

        if (updateState.hasUpdate) {
            const testLabel = IS_TEST_MODE ? '<div style="color:var(--color-red); font-weight:800; font-size:1rem; margin-bottom:5px;">TEST MODE</div>' : '';

            // Кнопки теперь являются реальными <a> ссылками. Это 100% обходит блокировщики всплывающих окон.
            let actionButtons = '';
            if (isIOS) {
                const encodedUrl = encodeURIComponent(UPDATE_URL);
                const stayDeepLink = `stay://x-callback-url/open-install?url=${encodedUrl}`;
                actionButtons = `
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <a href="${stayDeepLink}" id="update-stay" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-accent)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                            <span class="material-icons">open_in_new</span>
                            Обновить через Stay
                        </a>
                        <a href="${UPDATE_URL}" target="_blank" id="update-browser" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-green)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                            <span class="material-icons">public</span>
                            В браузере
                        </a>
                    </div>
                    <div style="font-size:1.1rem; color:var(--color-text-secondary); margin-top:12px;">Выберите ваш менеджер скриптов</div>
                `;
            } else {
                actionButtons = `
                    <a href="${UPDATE_URL}" target="_blank" id="update-confirm" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-green)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                        <span class="material-icons">system_update_alt</span>
                        Обновить сейчас
                    </a>
                `;
            }

            return `
                <div style="text-align:center;">
                    ${testLabel}
                    <span class="material-icons" style="font-size:48px;color:var(--color-green);margin-bottom:1rem;">system_update</span>
                    <div style="font-size:1.8rem;font-weight:800;margin-bottom:1.5rem;color:var(--color-text-primary);">Новая версия! ${IS_TEST_MODE ? '(TEST)' : ''}</div>

                    <div style="background:var(--color-highlight);padding:1.6rem;border-radius:12px;text-align:left;margin-bottom:2rem;border:1px solid var(--color-table-border);">
                        <div style="font-size:1.3rem;color:var(--color-text-secondary);margin-bottom:4px;">Доступно:</div>
                        <div style="font-size:1.4rem;font-weight:700;margin-bottom:12px;color:var(--color-text-primary);">
                            ${updateState.remoteVer} от ${updateState.remoteDate}
                        </div>

                        ${updateState.remoteLog ? `
                            <div style="font-size:1.3rem;color:var(--color-text-secondary);margin-bottom:4px;">Что нового:</div>
                            <div style="font-size:1.4rem;line-height:1.4;margin-bottom:12px;color:var(--color-text-primary);">
                                ${updateState.remoteLog}
                            </div>
                        ` : ''}

                        <div style="font-size:1.3rem;color:var(--color-text-secondary);margin-bottom:4px;">Текущая:</div>
                        <div style="font-size:1.4rem;font-weight:700;color:var(--color-text-primary);">
                            ${cur}
                        </div>
                    </div>

                    ${actionButtons}
                </div>`;
        }

        return `<div style="text-align:center;"><span class="material-icons" style="font-size:48px;color:var(--color-accent);margin-bottom:1rem;">check_circle</span><div style="font-size:1.8rem;font-weight:700;">Версия актуальна</div><div style="color:var(--color-text-secondary);margin-top:0.5rem;">У вас установлена v${cur}</div><button id="retry-update" class="answer-btn-custom" style="margin:2rem auto 0;background:var(--color-highlight)!important;color:var(--color-text-primary)!important;">Проверить снова</button></div>`;
    }

    function refreshModalUI() {
        const modal = document.getElementById('etis-update-modal');
        if (modal && modal.style.display !== 'none') {
            const content = modal.querySelector('.ui-dialog-content');
            if (content) {
                content.innerHTML = getUpdateHTML();

                const setupAutoReload = () => {
                    // Прячем модалку с микро-задержкой, чтобы браузер успел обработать клик по ссылке
                    setTimeout(() => {
                        modal.style.display = 'none';
                        const overlay = document.getElementById('etis-update-overlay');
                        if (overlay) overlay.style.display = 'none';
                    }, 50);

                    // Сохраняем флаг, что мы ждем обновления
                    sessionStorage.setItem('etis_update_pending', 'true');

                    const onFocusOrVisible = () => {
                        setTimeout(() => {
                            if (document.visibilityState === 'visible' && document.hasFocus()) {
                                if (sessionStorage.getItem('etis_update_pending')) {
                                    sessionStorage.removeItem('etis_update_pending');
                                    window.location.reload(); // Перезагружаем вкладку, когда юзер вернулся!
                                }
                            }
                        }, 200);
                    };

                    // Ждем 1.5 секунды (пока открывается новая вкладка), чтобы не словить ложное "возвращение"
                    setTimeout(() => {
                        document.addEventListener('visibilitychange', onFocusOrVisible);
                        window.addEventListener('focus', onFocusOrVisible);
                    }, 1500);
                };

                // Мы навешиваем листенер, но НЕ делаем e.preventDefault().
                // Благодаря этому браузер сам открывает ссылку (href), а мы лишь вешаем обработчик возврата.
                const btnStay = content.querySelector('#update-stay');
                if (btnStay) btnStay.addEventListener('click', setupAutoReload);

                const btnBrowser = content.querySelector('#update-browser');
                if (btnBrowser) btnBrowser.addEventListener('click', setupAutoReload);

                const btnConfirm = content.querySelector('#update-confirm');
                if (btnConfirm) btnConfirm.addEventListener('click', setupAutoReload);

                const retry = content.querySelector('#retry-update');
                if (retry) retry.onclick = () => initAutoUpdateCheck(true);
            }
        }
    }

    function showUpdateModal() {
        let overlay = document.getElementById('etis-update-overlay');
        let modal = document.getElementById('etis-update-modal');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'etis-update-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:2000000;display:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';
            document.body.appendChild(overlay);
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'etis-update-modal';
            modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:400px;background:var(--color-card);border-radius:24px;z-index:2000001;display:none;box-shadow:var(--shadow-dialog);overflow:hidden;font-family:var(--font-family);';
            modal.innerHTML = `
                <div class="ui-widget-header" style="padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--color-table-border);background:var(--color-table-header);">
                    <span style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Обновление</span>
                    <span id="close-update" class="material-icons" style="cursor:pointer;color:var(--color-text-secondary);">close</span>
                </div>
                <div class="ui-dialog-content" style="padding:24px;"></div>
            `;
            document.body.appendChild(modal);

            overlay.onclick = () => { overlay.style.display = 'none'; modal.style.display = 'none'; };
            modal.querySelector('#close-update').onclick = () => overlay.onclick();
        }

        overlay.style.display = 'block';
        modal.style.display = 'block';
        refreshModalUI();
        if (updateState.status === 'idle') initAutoUpdateCheck(true);
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
                // Блокируем скролл фона
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            } else {
                sidebar.classList.remove('mobile-active');
                overlay.classList.remove('active');
                menuBtn.classList.remove('open');
                // Возвращаем скролл
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }
        }

        const toggleMenuHandler = (e) => {
            e.stopPropagation();
            const isOpen = sidebar.classList.contains('mobile-active');
            toggleMenu(!isOpen);
        };

        menuBtn.addEventListener('click', toggleMenuHandler);

        const closeMenuHandler = (e) => {
            e.stopPropagation();
            toggleMenu(false);
        };

        overlay.addEventListener('click', closeMenuHandler);

        // --- ЗАЩИТА ОТ СЛУЧАЙНЫХ КЛИКОВ ПРИ СКРОЛЛЕ САЙДБАРА ---
        let isSidebarScrolling = false;
        let sidebarScrollTimer;

        sidebar.addEventListener('scroll', () => {
            isSidebarScrolling = true;
            clearTimeout(sidebarScrollTimer);
            sidebarScrollTimer = setTimeout(() => {
                isSidebarScrolling = false;
            }, 150);
        }, { passive: true });

        // Логика при клике на ссылку
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Если сайдбар прямо сейчас скроллится — блокируем переход и скрытие
                if (isSidebarScrolling) {
                    e.preventDefault();
                    return;
                }

                sidebar.classList.remove('mobile-active');
                overlay.classList.remove('active');
                menuBtn.classList.remove('open');
                menuBtn.classList.add('is-loading');

                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            });
        });
    }

    function updateLiveTimetable() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('p_week')) {
            const actualWeek = localStorage.getItem('etis_actual_week');
            if (urlParams.get('p_week') !== actualWeek) return;
        }

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        const todayName = daysMap[currentDay];

        document.querySelectorAll('.day').forEach(dayBlock => {
            const dayHeaderName = dayBlock.querySelector('.day-name');
            if (!dayHeaderName) return;

            // Очищаем ВСЕ старые точки в этом дне
            dayBlock.querySelectorAll('.live-dot').forEach(dot => dot.remove());

            if (dayHeaderName.textContent.trim() === todayName) {
                const dayDot = document.createElement('span');
                dayDot.className = 'live-dot active';
                dayDot.style.animation = 'none';
                dayDot.title = "Сегодня";
                dayHeaderName.appendChild(dayDot);

                dayBlock.querySelectorAll('.timetable-grid tr').forEach(row => {
                    if (row.classList.contains('custom-no-pairs') || row.style.display === 'none') return;

                    let startTimeStr = "";
                    let duration = 90;

                    if (row.classList.contains('timetable-gap-row')) {
                        startTimeStr = row.getAttribute('data-gap-start');
                        const count = parseInt(row.getAttribute('data-gap-count') || "1");
                        duration = (count * 90) + ((count - 1) * 10);
                    } else {
                        const timeEl = row.querySelector('.eval');
                        if (timeEl) startTimeStr = timeEl.textContent.trim();
                    }

                    if (!startTimeStr || startTimeStr === "00:00") return;

                    const parts = startTimeStr.split(':');
                    const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                    const endMins = startMins + duration;

                    let type = "";
                    if (currentTime >= startMins && currentTime <= endMins) {
                        type = (endMins - currentTime <= 15) ? 'ending' : 'active';
                    } else if (startMins - currentTime <= 20 && startMins - currentTime > 0) {
                        type = 'soon';
                    }

                    if (type) {
                        const dot = document.createElement('span');
                        dot.className = `live-dot ${type}`;

                        if (row.classList.contains('timetable-gap-row')) {
                            row.querySelector('.timetable-gap-capsule')?.appendChild(dot);
                        } else {
                            const timeEl = row.querySelector('.pair_num .eval');
                            if (timeEl) {
                                timeEl.appendChild(dot);
                            } else {
                                row.querySelector('.pair_num')?.appendChild(dot);
                            }
                        }
                    }
                });
            }
        });
    }

    // --- ФУНКЦИЯ ОКНА "СООБЩИТЬ ОБ ОШИБКЕ" ---
    function openUserscriptBugModal() {
        window.open('https://etisreborn.ru/#bugreport', '_blank');
    }

    // --- ФУНКЦИЯ ОКНА "ОТЗЫВЫ О РАСШИРЕНИИ" ---
    function openReviewsModal() {
        const FIREBASE_URL = 'https://etisreborn-2b49e-default-rtdb.europe-west1.firebasedatabase.app/reviews.json';

        const old = document.getElementById('etis-reviews-modal');
        if (old) old.remove();

        const modalHTML = `
            <div id="etis-reviews-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:999999;backdrop-filter:blur(4px);"></div>
            <div id="etis-reviews-modal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:500px;background:var(--color-card);border-radius:24px;z-index:1000000;box-shadow:var(--shadow-dialog);overflow:hidden; font-family: var(--font-family);">
                <div class="ui-widget-header" style="padding:16px 24px;display:flex;justify-content:space-between;align-items:center;background:var(--color-table-header);border-bottom:1px solid var(--color-table-border);">
                    <span style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Отзывы</span>
                    <span class="material-icons close-btn" style="cursor:pointer;color:var(--color-text-secondary);">close</span>
                </div>
                <div style="padding:24px; display:flex; flex-direction:column;">

                    <!-- Кнопка перехода на сайт вместо формы -->
                    <div id="review-redirect-block" style="text-align: center; margin-bottom: 20px;">
                        <p style="color: var(--color-text-secondary); margin-bottom: 15px; font-size: 1.3rem;">
                            Хотите поделиться мнением? Оставьте отзыв на нашем сайте!
                        </p>
                        <button id="redirect-review-btn" class="answer-btn-custom" style="justify-content:center; width:100%; border:none; padding: 12px; font-size: 1.4rem;">
                            Написать отзыв на сайте
                        </button>
                    </div>

                    <div class="reviews-list-container" id="reviews-list" style="margin-top: 0; border-top: 1px solid var(--color-table-border);">
                        <div style="text-align:center; color:var(--color-text-secondary); padding: 20px;">Загрузка отзывов...</div>
                    </div>
                </div>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper);

        const close = () => wrapper.remove();
        wrapper.querySelector('#etis-reviews-overlay').onclick = close;
        wrapper.querySelector('.close-btn').onclick = close;

        // Логика кнопки перехода
        const redirectBtn = wrapper.querySelector('#redirect-review-btn');
        if (redirectBtn) {
            redirectBtn.onclick = function() {
                window.open('https://etisreborn.ru/#writereview', '_blank');
            };
        }

        // Загрузка отзывов
        async function loadReviews() {
            const list = document.getElementById('reviews-list');
            try {
                const res = await fetch(FIREBASE_URL);
                const data = await res.json();

                list.innerHTML = '';
                if (!data) {
                    list.innerHTML = '<div style="text-align:center;color:var(--color-text-secondary);padding:20px;">Пока нет отзывов.</div>';
                    return;
                }

                const reviewsArr = Object.values(data).sort((a,b) => new Date(b.date) - new Date(a.date));

                reviewsArr.forEach(rev => {
                    const dateObj = new Date(rev.date);
                    const dateStr = `${String(dateObj.getDate()).padStart(2,'0')}.${String(dateObj.getMonth()+1).padStart(2,'0')}.${dateObj.getFullYear()}`;
                    const starsHtml = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);

                    const safeText = rev.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    const safeAuthor = (rev.author || 'Аноним').replace(/</g, "&lt;").replace(/>/g, "&gt;");

                    const div = document.createElement('div');
                    div.className = 'review-item-db';
                    div.innerHTML = `
                        <div class="review-item-db-header">
                            <div style="font-weight: 700; color: var(--color-text-primary); font-size: 1.4rem;">${safeAuthor}</div>
                            <div class="review-item-db-date">${dateStr}</div>
                        </div>
                        <div class="review-item-db-stars" style="margin-bottom: 6px;">${starsHtml}</div>
                        <div class="review-item-db-text">${safeText}</div>
                    `;
                    list.appendChild(div);
                });
            } catch(e) {
                list.innerHTML = '<div style="text-align:center;color:var(--color-red);padding:20px;">Не удалось загрузить отзывы</div>';
            }
        }

        loadReviews();
    }

    function openCustomizationModal() {
        let config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };
        const getHex = (key) => ACCENT_COLORS[key] || ACCENT_COLORS.blue;

        if (window._etisTargetIndex === undefined) window._etisTargetIndex = 0;

        let overlay = document.getElementById('etis-custom-overlay');
        let modal = document.getElementById('etis-custom-modal');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'etis-custom-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:2000000;display:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';
            document.body.appendChild(overlay);
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'etis-custom-modal';
            modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:400px;background:var(--color-card);border-radius:24px;z-index:2000001;display:none;box-shadow:var(--shadow-dialog);overflow:hidden;font-family:var(--font-family);';
            document.body.appendChild(modal);
        }

        const renderModal = () => {
            const c1 = getHex(config.colors[0]);
            const c2 = config.colors[1] ? getHex(config.colors[1]) : c1;
            const currentPreviewBg = config.isGradient ? `linear-gradient(135deg, ${c1}, ${c2})` : c1;

            modal.innerHTML = `
                <div class="ui-widget-header" style="padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--color-table-border);background:var(--color-table-header);">
                    <span style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Внешний вид</span>
                    <span id="close-custom" class="material-icons" style="cursor:pointer;color:var(--color-text-secondary);">close</span>
                </div>
                <div class="ui-dialog-content" style="padding:24px;">

                    <!-- Выбор темы -->
                    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 2.4rem;">
                        <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1.2rem;">Тема интерфейса</div>
                        <div class="theme-selector-group">
                            <button class="theme-btn ${theme === 'auto' ? 'active' : ''}" data-theme="auto" title="Системная">
                                <span class="material-icons">brightness_auto</span>
                            </button>
                            <button class="theme-btn ${theme === 'light' ? 'active' : ''}" data-theme="light" title="Светлая">
                                <span class="material-icons">light_mode</span>
                            </button>
                            <button class="theme-btn ${theme === 'dark' ? 'active' : ''}" data-theme="dark" title="Темная">
                                <span class="material-icons">dark_mode</span>
                            </button>
                        </div>
                    </div>

                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1.2rem; text-align: center;">Цветовой акцент</div>
                    
                    <!-- Ряд управления цветами -->
                    <div class="color-picker-controls-row">
                        <!-- Капсула превью -->
                        <div class="color-picker-toggle-wrap" style="background: ${currentPreviewBg}">
                            <span>Градиент</span>
                            <input type="checkbox" id="grad-toggle" class="tumbler-checkbox" ${config.isGradient ? 'checked' : ''}>
                        </div>

                        <!-- Кнопка случайно справа -->
                        <button id="random-color-btn" class="color-picker-random-btn" title="Случайные цвета">
                            <span class="material-icons">casino</span>
                        </button>
                    </div>

                    <div class="color-picker-grid" id="color-grid"></div>
                </div>
            `;

            // Логика переключения тем
            modal.querySelectorAll('.theme-btn').forEach(btn => {
                btn.onclick = () => {
                    const selectedTheme = btn.getAttribute('data-theme');
                    theme = selectedTheme;
                    localStorage.setItem('theme', theme);

                    if (theme === 'auto') {
                        setSystemThemeDetection();
                    } else {
                        removeSystemThemeDetection();
                        document.documentElement.setAttribute('theme', theme);
                    }

                    // Обновляем активную кнопку
                    modal.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                };
            });

            const grid = modal.querySelector('#color-grid');

            COLOR_ORDER.forEach(colorKey => {
                const circle = document.createElement('div');
                circle.className = 'color-picker-circle';
                circle.style.backgroundColor = ACCENT_COLORS[colorKey];

                const selectedIndex = config.colors.indexOf(colorKey);
                if (selectedIndex !== -1) {
                    circle.classList.add('selected');
                    if (config.isGradient) {
                        circle.textContent = (selectedIndex + 1).toString();
                    } else {
                        circle.innerHTML = '<span class="material-icons" style="font-size: 20px;">check</span>';
                    }
                }

                circle.onclick = () => {
                    if (config.isGradient) {
                        if (config.colors.includes(colorKey)) {
                            config.colors.reverse();
                        } else {
                            if (config.colors.length < 2) {
                                config.colors.push(colorKey);
                                window._etisTargetIndex = 0;
                            } else {
                                config.colors[window._etisTargetIndex] = colorKey;
                                window._etisTargetIndex = (window._etisTargetIndex === 0) ? 1 : 0;
                            }
                        }
                    } else {
                        config.colors = [colorKey];
                        window._etisTargetIndex = 0;
                    }
                    localStorage.setItem('etis_accent_config', JSON.stringify(config));
                    applyAccentColor();
                    renderModal();
                };
                grid.appendChild(circle);
            });

            // Логика кнопки "Случайно"
            const randomBtn = modal.querySelector('#random-color-btn');
            randomBtn.onclick = () => {
                randomBtn.classList.add('clicked');
                setTimeout(() => randomBtn.classList.remove('clicked'), 150);

                const keys = COLOR_ORDER;
                const r1 = keys[Math.floor(Math.random() * keys.length)];
                let r2 = keys[Math.floor(Math.random() * keys.length)];

                while (config.isGradient && r2 === r1) {
                    r2 = keys[Math.floor(Math.random() * keys.length)];
                }

                config.colors = config.isGradient ? [r1, r2] : [r1];
                localStorage.setItem('etis_accent_config', JSON.stringify(config));
                applyAccentColor();
                renderModal();
            };

            // Логика тумблера
            modal.querySelector('#grad-toggle').onchange = (e) => {
                config.isGradient = e.target.checked;
                if (!config.isGradient && config.colors.length > 1) {
                    config.colors = [config.colors[0]];
                }
                if (config.isGradient && config.colors.length < 2) {
                    config.colors.push('lightblue');
                }
                localStorage.setItem('etis_accent_config', JSON.stringify(config));
                applyAccentColor();
                renderModal();
            };

            const closeAll = () => { overlay.style.display = 'none'; modal.style.display = 'none'; };
            overlay.onclick = closeAll;
            modal.querySelector('#close-custom').onclick = closeAll;
        };

        renderModal();
        overlay.style.display = 'block';
        modal.style.display = 'block';
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

                const subtitle = document.createElement('div');
                subtitle.className = 'psu-logo-subtitle';
                subtitle.textContent = 'Войдите в аккаунт ЕТИС';
                psuLogo.appendChild(subtitle);

                const oldTitle = loginForm.querySelector('.choose');
                if (oldTitle) oldTitle.remove();

                const inputsWrapper = document.createElement('div');
                inputsWrapper.className = 'login-inputs-wrapper';

                const allItems = loginItems.querySelectorAll('.item');
                allItems.forEach(item => inputsWrapper.appendChild(item));

                loginItems.prepend(inputsWrapper);
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

            // Текст внутри формы
            const walker = document.createTreeWalker(loginItems, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const nodesToRemove = [];
            while(node = walker.nextNode()) {
                if (node.textContent.includes('2396870') || node.textContent.includes('технической поддержки')) {
                    if (!helpTextContent.includes(node.textContent.trim())) {
                         helpTextContent += `<p>${node.textContent.trim()}</p>`;
                    }
                    nodesToRemove.push(node);
                }
            }
            nodesToRemove.forEach(n => n.remove());
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
                    input.placeholder = label.textContent.trim();
                    label.remove();
                }
            });

        } else {
            const submenus = document.querySelectorAll('.submenu');
            submenus.forEach(menu => {
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
                    const activeItem = menu.querySelector('b');
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
                const sidebarStyles = document.createElement('style');
                sidebarStyles.innerHTML = `
                    .span3 > .nav.nav-tabs.nav-stacked > li > a {
                        margin: 0 12px 4px 12px !important;
                        padding: 10px 14px !important;
                        border-radius: var(--radius-small) !important;
                        width: auto !important;
                        border: 1px solid transparent !important;
                        transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease !important;
                        transform: translateZ(0);
                        -webkit-tap-highlight-color: transparent !important;
                    }

                    @media (hover: hover) and (pointer: fine) {
                        .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:hover {
                            background: var(--color-highlight) !important;
                        }
                    }

                    .span3 > .nav.nav-tabs.nav-stacked > li:not(.active) > a:active {
                        background: var(--color-highlight) !important;
                        opacity: 0.7;
                    }

                    .span3 > ul.nav.nav-tabs.nav-stacked:not(:first-of-type) {
                        display: none !important;
                    }
                `;
                document.head.appendChild(sidebarStyles);

                if (!sidebar.querySelector('.sidebar-logo')) {
                    const logo = document.createElement('div');
                    logo.className = 'sidebar-logo';
                    logo.innerHTML = `
                        <img src="https://raw.githubusercontent.com/defl-orator/etis-reborn/b3a41691ffab00a3d39ed9dc1ff9e8f5b1ba2662/img/logo_fill.png" alt="Logo">
                        <span>ЕТИС</span>
                    `;
                    sidebar.prepend(logo);
                }

                // --- ЛОГИКА ПАСХАЛКИ ЛОГОТИПА ---
                const logoImg = sidebar.querySelector('.sidebar-logo img');
                const logoContainer = sidebar.querySelector('.sidebar-logo');

                if (logoImg && logoContainer) {
                    const heyLabel = document.createElement('div');
                    heyLabel.className = 'logo-say-hey';
                    logoContainer.appendChild(heyLabel);

                    const phrases = [
                        'эй',                   // 10 кликов
                        'прекрати',             // 20
                        'голова кружится',      // 30
                        'хватит!',              // 40
                        'сейчас упаду...',      // 50
                        'меня тошнит 🤢',        // 60
                        'зачем ты это делаешь?',// 70
                        'ну всё, я обиделся',   // 80
                        '...помогите...',        // 90
                        '💫💫💫',                 // 100
                        'ты думаешь это смешно?', // 110
                        'у меня пиксели болят',  // 120
                        'я пожалуюсь разработчику!', // 130
                        'остановись, кому говорю!', // 140
                        'ты мышку сломаешь',     // 150
                        'заняться совсем нечем?',// 160
                        'иди учись!',            // 170
                        'пары сами себя не сдадут', // 180
                        'а курсовая написана?',  // 190
                        'я просто логотип...',   // 200
                        'я сейчас ЕТИС сломаю',  // 210
                        'удаляю твои оценки...', // 220
                        'шучу, я так не умею',   // 230
                        'но очень хотел бы!',    // 240
                        'окей, я тебя игнорирую',// 250
                        '...',                   // 260
                        '......',                // 270
                        'всё ещё кликаешь?',     // 280
                        'какая выдержка...',     // 290
                        'может, скачаешь кликер?', // 300
                        'я вызываю полицию мышек', // 310
                        '🚨 виу-виу-виу 🚨',       // 320
                        'сдаюсь, ты победил',    // 330
                        'возьми с полки пирожок',// 340
                        'или автомат по физре',  // 350
                        'хотя кого я обманываю', // 360
                        'я устал крутиться',     // 370
                        'центробежный предел достигнут', // 380
                        'ты меня укачал 😵‍💫',     // 390
                        'я вижу матрицу...',     // 400
                        '01000101 01010100',     // 410
                        'я ухожу в спящий режим',// 420
                        'zzZzzZzz...',           // 430
                        'ты меня разбудил!',     // 440
                        'требую надбавку за вредность', // 450
                        'создатель мне за это не платит', // 460
                        'просто. закрой. вкладку.', // 470
                        'я буду сниться тебе в кошмарах', // 480
                        'АСТАНАВИТЕС!!!',        // 490
                        '💀 System Error 💀'       // 500 кликов
                    ];

                    let clickCounter = 0;
                    let isRotateLeft = true;
                    let resetTimer;
                    let hideTimer;
                    let rotateTimer;

                    logoImg.addEventListener('click', () => {
                        // 1. Поворот
                        clearTimeout(rotateTimer);
                        
                        const angle = isRotateLeft ? -30 : 30;
                        logoImg.style.transform = `rotate(${angle}deg) scale(1.1)`; 

                        rotateTimer = setTimeout(() => {
                            logoImg.style.transform = 'rotate(0deg) scale(1)';
                        }, 250); 

                        isRotateLeft = !isRotateLeft;

                        // 2. Счётчик кликов
                        clickCounter++;

                        // Сбрасываем всё, если не мучать медведя 3 секунды
                        clearTimeout(resetTimer);
                        resetTimer = setTimeout(() => {
                            clickCounter = 0;
                            heyLabel.classList.remove('active');
                        }, 3000);

                        // 3. Проверка порогов (каждые 10 кликов)
                        if (clickCounter % 10 === 0 && clickCounter > 0) {
                            const phraseIndex = (clickCounter / 10) - 1;

                            if (phraseIndex < phrases.length) {
                                heyLabel.textContent = phrases[phraseIndex];
                                heyLabel.classList.add('active');

                                // Прячем фразу через 2 секунды, чтобы она не висела вечно
                                clearTimeout(hideTimer);
                                hideTimer = setTimeout(() => {
                                    heyLabel.classList.remove('active');
                                }, 2000);
                            }
                        }
                    });
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
                const allNavs = sidebar.querySelectorAll('ul.nav.nav-tabs.nav-stacked');
                const mainNav = allNavs[0];
                let allListItems = [];
                let globalHasNotifications = false;

                allNavs.forEach(nav => {
                    nav.querySelectorAll('li').forEach(li => {
                        const href = li.querySelector('a')?.getAttribute('href') || '';
                        if (!href.includes('choose_dis') && !href.includes('fcl_choice') && !href.includes('ebl_choice')) {
                            allListItems.push(li);
                        }
                    });
                });

                // Вкладка "Версия"
                const verLi = document.createElement("li");
                verLi.className = 'theme-switcher-item';
                const verLink = document.createElement("a");
                verLink.style.cursor = 'pointer';
                verLink.href = "#version-check";
                verLink.textContent = 'Версия';
                verLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const side = document.querySelector('.span3');
                    if (side && side.classList.contains('mobile-active')) {
                        side.classList.remove('mobile-active');
                        document.querySelector('.mobile-overlay')?.classList.remove('active');
                        document.querySelector('.mobile-menu-btn')?.classList.remove('open');
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                    }
                    showUpdateModal();
                });
                verLi.appendChild(verLink);
                allListItems.push(verLi);

                // Вкладка "Внешний вид"
                const appearanceLi = document.createElement("li");
                appearanceLi.className = 'theme-switcher-item';
                const appearanceLink = document.createElement("a");
                appearanceLink.style.cursor = 'pointer';
                appearanceLink.href = "#appearance";
                appearanceLink.textContent = 'Внешний вид';
                appearanceLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const side = document.querySelector('.span3');
                    if (side && side.classList.contains('mobile-active')) {
                        side.classList.remove('mobile-active');
                        document.querySelector('.mobile-overlay')?.classList.remove('active');
                        document.querySelector('.mobile-menu-btn')?.classList.remove('open');
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                    }
                    openCustomizationModal();
                });
                appearanceLi.appendChild(appearanceLink);
                allListItems.push(appearanceLi);

                // Функция иконок
                const getIconForHref = (href) => {
                    if (href === '#version-check') return 'system_update';
                    if (href === '#appearance') return 'palette';
                    if (href === '#reviews') return 'star_rate';
                    if (href === '#report-bug') return 'bug_report';
                    if (href.includes('teach_plan')) return 'school';
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

                // Обработка элементов (Добавление иконок и точек)
                allListItems.forEach(li => {
                    const a = li.querySelector('a');
                    if (!a) return;
                    const href = a.getAttribute('href') || '';
                    let itemHasNotification = false;

                    Array.from(a.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const match = node.textContent.match(/\s*\(([^)]+)\)\s*$/);
                            if (match) {
                                const counterStr = match[1];
                                const counts = counterStr.split('/');
                                const lastCount = counts[counts.length - 1].trim();
                                if (lastCount !== '0') itemHasNotification = true;
                                node.textContent = node.textContent.replace(/\s*\([^)]+\)\s*$/, '');
                            }
                        }
                    });

                    const etisBadge = a.querySelector('.badge');
                    if (etisBadge) {
                        if (etisBadge.textContent.trim() !== '0') itemHasNotification = true;
                        etisBadge.remove();
                    }

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

                    const isAllowed = allowedDotHrefs.some(target => href.includes(target)) || href.includes('term_test');
                    if (itemHasNotification && isAllowed) {
                        globalHasNotifications = true;
                        const dot = document.createElement('span');
                        dot.className = 'badge-point';
                        a.appendChild(dot);
                    }
                });

                if (globalHasNotifications) {
                    const mobileBtn = document.querySelector('.mobile-menu-btn');
                    if (mobileBtn) mobileBtn.classList.add('has-updates');
                }

                // 5. ГРУППИРОВКА И СОРТИРОВКА
                mainNav.innerHTML = '';

                const groupsOrder = [
                    ['teach_plan'],
                    ['timetable', 'signs', 'absence'],
                    ['announces', 'teacher_notes', 'teachers', 'est_pkg.show_list'],
                    ['orders', 'cert_pkg', 'contract_list', 'blank_forms', 'portfolio', 'group_tt'],
                    ['library', 'electr', 'advice', 'ses', 'about'],
                    ['term_test', 'special_est_list', 'оцените дистанционное'],
                    ['#version-check', '#reviews', '#appearance', 'change_pass', 'change_email', 'change_pr_page', 'logout']
                ];

                const usedItems = new Set();

                groupsOrder.forEach((groupPatterns, index) => {
                    groupPatterns.forEach(pattern => {
                        const li = allListItems.find(item => {
                            if (usedItems.has(item)) return false;
                            const h = item.querySelector('a')?.getAttribute('href') || '';
                            const t = item.textContent.toLowerCase();
                            if (pattern === 'оцените дистанционное') return t.includes('дистанционн');
                            return h.includes(pattern);
                        });

                        if (li) {
                            mainNav.appendChild(li);
                            usedItems.add(li);
                        }
                    });

                    if (index < groupsOrder.length - 1) {
                        const separator = document.createElement('div');
                        separator.style.height = '1px';
                        separator.style.background = 'var(--color-table-border)';
                        separator.style.margin = '1rem 1.6rem 1.4rem 1.6rem';
                        mainNav.appendChild(separator);
                    }
                });

                const remaining = allListItems.filter(li => !usedItems.has(li));
                if (remaining.length > 0) {
                     const separator = document.createElement('div');
                     separator.style.height = '1px';
                     separator.style.background = 'var(--color-table-border)';
                     separator.style.margin = '1rem 1.6rem 1.4rem 1.6rem';
                     mainNav.appendChild(separator);
                     remaining.forEach(li => mainNav.appendChild(li));
                }

                // 6. Активный класс и скролл
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

                    // --- ФИКС ПОДСВЕТКИ ДЛЯ СКРЫТЫХ ВКЛАДОК ---
                    if (currentBase === 'ebl_choice' || currentBase === 'fcl_choice' || currentBase === 'choose_dis') {
                        const tpLi = Array.from(mainNav.querySelectorAll('li')).find(li => li.querySelector('a')?.getAttribute('href')?.includes('teach_plan'));
                        if (tpLi) tpLi.classList.add('active');
                    } else {
                        mainNav.querySelectorAll('li').forEach(li => {
                            const href = li.querySelector('a')?.getAttribute('href') || '';
                            if (currentBase.length > 3 && href.includes(currentBase)) li.classList.add('active');
                        });
                    }
                }

                // Подвал
                if (!sidebar.querySelector('.sidebar-footer')) {
                    const footer = document.createElement('div');
                    footer.className = 'sidebar-footer';

                    // flex-контейнер для ссылок, чтобы они красиво шли друг под другом
                    footer.innerHTML = `
                        <div style="margin-bottom: 10px; font-weight: 800; font-size: 1.3rem; letter-spacing: 0.5px;">
                            <a href="https://etisreborn.ru" target="_blank" style="text-decoration: none; color: var(--color-text-primary); border-bottom: none;">
                                ЕТИС REBORN
                            </a>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <a href="#reviews" id="footer-reviews" style="cursor: pointer; text-decoration: none; color: var(--color-text-secondary); transition: color 0.2s;">Отзывы о расширении</a>
                            <a href="#report-bug" id="footer-report-bug" style="cursor: pointer; text-decoration: none; color: var(--color-text-secondary); transition: color 0.2s;">Нашли ошибку?</a>
                        </div>
                    `;
                    sidebar.appendChild(footer);

                    // Функция для закрытия мобильного меню
                    const closeMobileMenu = () => {
                        const side = document.querySelector('.span3');
                        if (side && side.classList.contains('mobile-active')) {
                            side.classList.remove('mobile-active');
                            document.querySelector('.mobile-overlay')?.classList.remove('active');
                            document.querySelector('.mobile-menu-btn')?.classList.remove('open');
                            document.body.style.overflow = '';
                            document.documentElement.style.overflow = '';
                        }
                    };

                    // Обработчик: Нашли ошибку?
                    const bugLinkFooter = footer.querySelector('#footer-report-bug');
                    if (bugLinkFooter) {
                        bugLinkFooter.addEventListener('click', (e) => {
                            e.preventDefault();
                            closeMobileMenu();
                            openUserscriptBugModal();
                        });
                    }

                    // Обработчик: Отзывы о REBORN
                    const reviewLinkFooter = footer.querySelector('#footer-reviews');
                    if (reviewLinkFooter) {
                        reviewLinkFooter.addEventListener('click', (e) => {
                            e.preventDefault();
                            closeMobileMenu();
                            openReviewsModal();
                        });
                    }
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

            // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ КРАСИВОЙ ДАТЫ (macOS Style)
            // Текущий год: "Пт, 6 марта 16:35"
            // Прошлые годы: "6 марта 2024" (без времени)
            const formatEtisDate = (rawStr) => {
                if (!rawStr) return '';

                const match = rawStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s(\d{2}:\d{2})/);

                if (match) {
                    const day = parseInt(match[1], 10);
                    const monthIndex = parseInt(match[2], 10) - 1; // Месяцы в JS от 0 до 11
                    const year = parseInt(match[3], 10);
                    const time = match[4];

                    const dateObj = new Date(year, monthIndex, day);
                    const now = new Date();

                    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                    const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

                    const monthName = months[monthIndex];

                    // 1. Текущий год: День недели, Число Месяц Время
                    if (year === now.getFullYear()) {
                        const dayName = shortDays[dateObj.getDay()];
                        return `${dayName}, ${day} ${monthName} ${time}`;
                    }

                    // 2. Прошлые годы: Число Месяц Год (время убираем)
                    return `${day} ${monthName} ${year}`;
                }
                return rawStr;
            };

            // --- МЯГКАЯ ИКОНКА ПОДЕЛИТЬСЯ (SVG) ---
            const softShareSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-msg-btn" title="Поделиться">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
            `;

            // --- ФУНКЦИЯ СКРИНШОТА СООБЩЕНИЯ/ОБЪЯВЛЕНИЯ ---
            const shareMessageCard = (cardElement, defaultFileName) => {
                const originalBtnContainer = cardElement.querySelector('.share-msg-wrap');
                const originalSVG = originalBtnContainer ? originalBtnContainer.innerHTML : '';

                if (originalBtnContainer) {
                    originalBtnContainer.innerHTML = '<span class="material-icons" style="font-size: 17px; line-height: 1; color:var(--color-text-secondary);">hourglass_empty</span>';
                }

                const renderScreenshot = () => {
                    let h2c = null;
                    if (typeof html2canvas !== 'undefined') h2c = html2canvas;
                    else if (typeof unsafeWindow !== 'undefined' && unsafeWindow.html2canvas) h2c = unsafeWindow.html2canvas;
                    else if (typeof window !== 'undefined' && window.html2canvas) h2c = window.html2canvas;

                    if (!h2c) {
                        console.error('html2canvas не найден');
                        cleanup(true);
                        return;
                    }

                    const isMobile = window.innerWidth <= 960;
                    const renderWidth = 540;

                    const exportContainer = document.createElement('div');
                    exportContainer.style.position = 'fixed';
                    exportContainer.style.top = '100vh';
                    exportContainer.style.left = '0';
                    exportContainer.style.width = renderWidth + 'px';
                    exportContainer.style.padding = isMobile ? '24px 24px 12px 24px' : '40px 40px 20px 40px';
                    exportContainer.style.boxSizing = 'border-box';
                    exportContainer.style.background = getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6';
                    exportContainer.style.fontFamily = getComputedStyle(document.body).fontFamily;
                    exportContainer.style.zIndex = '-9999';

                    const span9Wrapper = document.createElement('div');
                    span9Wrapper.className = 'span9';
                    span9Wrapper.style.setProperty('margin', '0', 'important');
                    span9Wrapper.style.setProperty('padding', '0', 'important');
                    span9Wrapper.style.setProperty('width', '100%', 'important');

                    // Клонируем карточку
                    const clone = cardElement.cloneNode(true);

                    // Получаем текущий цвет из конфига, чтобы скриншот был в цвет темы
                    const accConfig = JSON.parse(localStorage.getItem('etis_accent_config')) || { colors: ['blue'] };
                    const fallbackColor = '#007AFF'; // дефолтный синий
                    const currentAccentHex = ACCENT_COLORS[accConfig.colors[0]] || fallbackColor;

                    // Находим все элементы, которые могут иметь градиентный текст
                    const gradientSelectors = '.msg-sender, .msg-sender *, .teacher-name-link, .review-dis-link, .accent-stat, .file-attachment-link .material-icons';
                    clone.querySelectorAll(gradientSelectors).forEach(el => {
                        // Полностью вычищаем свойства градиента
                        el.style.setProperty('background', 'none', 'important');
                        el.style.setProperty('background-image', 'none', 'important');
                        el.style.setProperty('-webkit-background-clip', 'unset', 'important');
                        el.style.setProperty('background-clip', 'unset', 'important');
                        el.style.setProperty('-webkit-text-fill-color', currentAccentHex, 'important');
                        el.style.setProperty('color', currentAccentHex, 'important');
                        
                        // Возвращаем правильный display, чтобы иконка и текст не слипались
                        if (el.classList.contains('msg-sender')) {
                            el.style.setProperty('display', 'flex', 'important');
                        } else {
                            el.style.setProperty('display', 'inline-block', 'important');
                        }
                    });

                    // Принудительно убиваем отступы снаружи карточки у клона
                    clone.style.setProperty('margin', '0', 'important');

                    // Удаляем обертку кнопки из клона
                    const cloneShareBtn = clone.querySelector('.share-msg-wrap');
                    if (cloneShareBtn) cloneShareBtn.remove();

                    clone.querySelectorAll('.answer-wrapper, .send-reply-btn, div[id^="frm_"], .msg-footer button').forEach(el => el.remove());

                    const cloneFooter = clone.querySelector('.msg-footer');
                    if (cloneFooter && cloneFooter.innerHTML.trim() === '') cloneFooter.remove();

                    // --- ГЕНЕРАЦИЯ УМНОГО ИМЕНИ ФАЙЛА ---
                    let dynamicFileName = defaultFileName;
                    if (defaultFileName.includes('.png')) {
                        const base = defaultFileName.replace('.png', '').toLowerCase();
                        
                        // Достаем отправителя (очищаем от иконок и берем первое слово, например "Деканат")
                        const senderRaw = clone.querySelector('.msg-sender')?.textContent.replace(/campaign|person/g, '').trim() || '';
                        const sender = senderRaw.split('/')[0].trim().replace(/\s+/g, '-').toLowerCase();
                        
                        // Достаем дату и превращаем "25 марта 10:41" в "25.03"
                        const dateRaw = clone.querySelector('.msg-date-text')?.textContent.trim() || '';
                        let dateShort = '';
                        const dmMatch = dateRaw.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                        if (dmMatch) {
                            const mMap = {'января':'01', 'февраля':'02', 'марта':'03', 'апреля':'04', 'мая':'05', 'июня':'06', 'июля':'07', 'августа':'08', 'сентября':'09', 'октября':'10', 'ноября':'11', 'декабря':'12'};
                            const m = mMap[dmMatch[2].toLowerCase()] || '01';
                            const d = dmMatch[1].padStart(2, '0');
                            dateShort = `${d}.${m}`;
                        } else {
                            const isoMatch = dateRaw.match(/(\d{2})\.(\d{2})/);
                            if (isoMatch) dateShort = `${isoMatch[1]}.${isoMatch[2]}`;
                        }

                        const parts = [base];
                        if (sender) parts.push(sender);
                        if (dateShort) parts.push(dateShort);
                        dynamicFileName = parts.join('-') + '.png';
                    }

                    span9Wrapper.appendChild(clone);

                    // --- НЕЗАМЕТНАЯ ВОТЕРМАРКА ---
                    const watermark = document.createElement('div');
                    watermark.style.cssText = 'text-align: right; margin-top: 12px; width: 100%; box-sizing: border-box;';
                    watermark.innerHTML = `<span style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;">etisreborn.ru</span>`;
                    
                    span9Wrapper.appendChild(watermark);
                    exportContainer.appendChild(span9Wrapper);
                    document.body.appendChild(exportContainer);

                    h2c(exportContainer, {
                        scale: 2,
                        useCORS: true,
                        windowWidth: renderWidth,
                        backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6'
                    }).then(canvas => {
                        canvas.toBlob(blob => {
                            if (!blob) throw new Error('Blob creation failed');
                            const file = new File([blob], dynamicFileName, { type: 'image/png' });

                            if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                                navigator.share({
                                    files: [file],
                                    title: defaultFileName.replace('.png', '')
                                }).then(() => cleanup())
                                .catch(err => cleanup(true));
                            } else {
                                const link = document.createElement('a');
                                link.download = defaultFileName;
                                link.href = URL.createObjectURL(blob);
                                link.click();
                                URL.revokeObjectURL(link.href);
                                cleanup();
                            }
                        }, 'image/png');
                    }).catch(err => {
                        console.error('Screenshot error:', err);
                        cleanup(true);
                    });

                    function cleanup(isError = false) {
                        exportContainer.remove();
                        if (originalBtnContainer) {
                            originalBtnContainer.innerHTML = isError ? '<span class="material-icons" style="font-size:18px; color:var(--color-red);">error</span>' : '<span class="material-icons" style="font-size:18px; color:var(--color-green);">check</span>';
                            setTimeout(() => { originalBtnContainer.innerHTML = originalSVG; }, 2000);
                        }
                    }
                };

                let existingH2c = null;
                if (typeof html2canvas !== 'undefined') existingH2c = html2canvas;
                else if (typeof unsafeWindow !== 'undefined' && unsafeWindow.html2canvas) existingH2c = unsafeWindow.html2canvas;
                else if (typeof window !== 'undefined' && window.html2canvas) existingH2c = window.html2canvas;

                if (!existingH2c) {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = renderScreenshot;
                    script.onerror = () => {
                        if (originalBtnContainer) originalBtnContainer.innerHTML = '<span class="material-icons" style="color:var(--color-red);">error</span>';
                    };
                    document.head.appendChild(script);
                } else {
                    renderScreenshot();
                }
            };

            switch (page) {
                case 'stu.teach_plan':
                case 'stu.fcl_choice':
                case 'stu.ebl_choice':
                case 'ebl_stu.ebl_choice': {
                    const params = new URLSearchParams(window.location.search);
                    const currentMode = params.get('p_mode');
                    let submenu = span9.querySelector('.submenu');

                    // 1. Создаем контейнер меню
                    if (!submenu) {
                        submenu = document.createElement('div');
                        submenu.className = 'submenu';
                        const h3 = span9.querySelector('h3') || span9.firstChild;
                        if (h3 && h3.parentNode) {
                            h3.parentNode.insertBefore(submenu, h3.nextSibling);
                        } else {
                            span9.prepend(submenu);
                        }
                    }

                    // 2. ГЕНЕРАЦИЯ МЕНЮ
                    submenu.innerHTML = `
                        <a href="stu.teach_plan?p_mode=advanced">Подробно</a>
                        <a href="stu.teach_plan?p_mode=short">Кратко</a>
                        <a href="stu.fcl_choice">Факультативы</a>
                        <a href="ebl_stu.ebl_choice">Элективы</a>
                        <a href="stu.teach_plan?p_mode=choose_dis">Дисциплины по выбору</a>
                    `;

                    // 3. Подсветка активной вкладки
                    const links = Array.from(submenu.querySelectorAll('a'));
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        let isActive = false;

                        if (page === 'stu.teach_plan') {
                            if (href.includes('p_mode=advanced')) {
                                if (currentMode === 'advanced') isActive = true;
                            }
                            else if (href.includes('p_mode=short')) {
                                if (currentMode === 'short' || !currentMode) isActive = true;
                            }
                            else if (href.includes('p_mode=choose_dis') && currentMode === 'choose_dis') {
                                isActive = true;
                            }
                        }
                        else if ((page === 'stu.ebl_choice' || page === 'ebl_stu.ebl_choice') && href.includes('ebl_choice')) {
                            isActive = true;
                        }
                        else if (page === 'stu.fcl_choice' && href.includes('fcl_choice')) {
                            isActive = true;
                        }

                        if (isActive) {
                            const b = document.createElement('b');
                            b.textContent = link.textContent;
                            link.replaceWith(b);
                        }
                    });

                    // --- КНОПКА ОЦЕНКИ В SUBMENU ---
                    const planEvalBtn = span9.querySelector('a[onclick*="cust.est_plan_form_stu"], a[href*="cust.est_plan_form_stu"]');
                    if (planEvalBtn) {
                        // Сбрасываем всё лишнее
                        planEvalBtn.className = 'eval-plan-link';
                        planEvalBtn.innerHTML = 'Оценить учебный план';

                        // Добавляем в конец сабменю
                        if (submenu) {
                            submenu.appendChild(planEvalBtn);
                        }
                    }

                    // Очистка от лишних оберток ЕТИСа, которые могут создавать пустые места
                    span9.querySelectorAll('div[style*="inline-block"]').forEach(div => {
                        div.style.display = 'block';
                        div.style.width = '100%';
                    });

                    // --- СТИЛИЗАЦИЯ КОНТЕНТА ---
                    if (page === 'stu.teach_plan') {
                        const isAdvanced = currentMode === 'advanced';
                        const isChooseDis = currentMode === 'choose_dis';

                        // Перенос номера плана (для дисциплин по выбору)
                        if (isChooseDis) {
                            const tpInfo = Array.from(span9.querySelectorAll('div')).find(d =>
                                d.textContent.includes('Учебный план') && d.textContent.trim().length < 30 && d.parentNode === span9
                            );
                            const targetH3 = Array.from(span9.querySelectorAll('h3')).find(h => h.textContent.includes('Блоки дисциплин'));

                            if (tpInfo && targetH3) {
                                const headerFlex = document.createElement('div');
                                headerFlex.className = 'subject-header-flex';
                                headerFlex.style.marginTop = '2rem';

                                const capsule = document.createElement('div');
                                capsule.className = 'subject-score-capsule';
                                capsule.style.background = 'var(--color-highlight)';
                                capsule.style.color = 'var(--color-text-secondary)';
                                capsule.style.border = '1px solid var(--color-table-border)';
                                capsule.style.boxShadow = 'none';

                                const tpNumber = tpInfo.textContent.replace(/Учебный план/i, '').trim();
                                capsule.innerHTML = `<span class="material-icons" style="font-size:1.4rem; vertical-align: middle; margin-right:4px; opacity:0.7">info</span> План №${tpNumber}`;

                                targetH3.parentNode.insertBefore(headerFlex, targetH3);
                                headerFlex.appendChild(targetH3);
                                headerFlex.appendChild(capsule);
                                tpInfo.remove();
                            }
                        }

                        span9.querySelectorAll('br').forEach((br, i) => { if(i < 3) br.remove(); });

                        // ПОДРОБНЫЙ ВИД
                        if (isAdvanced) {
                            const calendarGrid = document.createElement('div');
                            calendarGrid.className = 'calendar-grid';
                            const headers = Array.from(span9.querySelectorAll('b')).filter(b => {
                                const text = b.textContent.toLowerCase();
                                return text.includes('триместр') || text.includes('семестр');
                            });

                            headers.forEach(header => {
                                const card = document.createElement('div');
                                card.className = 'calendar-card';
                                const h4 = document.createElement('h4');
                                h4.textContent = header.textContent.toUpperCase();
                                card.appendChild(h4);
                                let next = header.parentElement.tagName === 'P' ? header.parentElement : header;
                                let current = next.nextSibling;
                                const toRem =[header, header.parentElement];

                                // В условии цикла while проверяем оба варианта через regex
                                while (current && current.tagName !== 'TABLE' && !(current.querySelector && current.querySelector('b')?.textContent.toLowerCase().match(/триместр|семестр/))) {
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

                        // КРАТКИЙ ВИД (Добавляем капсулы)
                        if (!isAdvanced && !isChooseDis) {
                            const shortTables = span9.querySelectorAll('table.teach_plan, table.common');

                            shortTables.forEach(table => {
                                if (!table.parentNode.classList.contains('wide-table-wrapper')) {
                                    const wrapper = document.createElement('div');
                                    wrapper.className = 'wide-table-wrapper';
                                    table.parentNode.insertBefore(wrapper, table);
                                    wrapper.appendChild(table);
                                }

                                // --- ЛОГИКА КАПСУЛ ---
                                table.querySelectorAll('td').forEach(cell => {
                                    const text = cell.textContent.replace(/\s/g, '').toLowerCase();
                                    let bg, color;

                                    if (text === 'экзамен') {
                                        // СИНИЙ
                                        bg = 'rgba(0, 122, 255, 0.15)';
                                        color = 'var(--color-blue)';
                                    } else if (text === 'зачет' || text === 'зачёт') {
                                        // ЗЕЛЕНЫЙ
                                        bg = 'rgba(52, 199, 89, 0.15)';
                                        color = 'var(--color-green)';
                                    }

                                    if (bg) {
                                        cell.innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.4rem 1rem; border-radius: 50px; font-size: 1.1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; white-space: nowrap;">${cell.textContent.trim()}</span>`;
                                    }
                                });
                            });
                        }

                        // Дисциплины по выбору
                        if (isChooseDis) {
                            span9.querySelectorAll('table.common').forEach(table => {
                                const wrapper = document.createElement('div');
                                wrapper.className = 'wide-table-wrapper';
                                table.parentNode.insertBefore(wrapper, table);
                                wrapper.appendChild(table);
                            });
                        }
                    }

                    // 2. ЭЛЕКТИВЫ И ФАКУЛЬТАТИВЫ
                    if (page === 'stu.ebl_choice' || page === 'stu.fcl_choice' || page === 'ebl_stu.ebl_choice') {
                        span9.querySelectorAll('table.common').forEach(table => {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            table.parentNode.insertBefore(wrapper, table);
                            wrapper.appendChild(table);
                        });

                        span9.querySelectorAll('br').forEach((br, i) => { if(i < 3) br.remove(); });

                        const headers = span9.querySelectorAll('h3');
                        headers.forEach(h => {
                            h.style.marginTop = '2rem';
                            h.style.marginBottom = '1.5rem';
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
                    span9.querySelectorAll('br, script, style').forEach(el => el.remove());

                    // 2. Создаем капсулу поиска
                    const searchWrapper = document.createElement('div');
                    searchWrapper.className = 'teacher-search-wrapper';
                    searchWrapper.innerHTML = `
                        <div class="search-capsule">
                            <span class="material-icons search-icon">search</span>
                            <input type="text" class="search-input" placeholder="Поиск" style="padding-left: 44px !important;">
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

                        const nameText = nameDiv ? nameDiv.textContent.trim() : '';
                        const chairText = chairDiv ? chairDiv.textContent.trim() : '';

                        let nameClick = '', chairClick = '';
                        if (nameDiv && nameDiv.querySelector('img')) nameClick = nameDiv.querySelector('img').getAttribute('onclick');
                        if (chairDiv && chairDiv.querySelector('img')) chairClick = chairDiv.querySelector('img').getAttribute('onclick');

                        // --- ПАРСИНГ ПРЕДМЕТОВ И ВЫДЕЛЕНИЕ МЕТОК ---
                        let subjectsHtml = '';
                        let rawSubjectsText = '';
                        let uniqueTypes = new Set();

                        if (disDiv) {
                            const lines = disDiv.innerHTML.split(/<br\s*\/?>/i).filter(line => line.trim());
                            lines.forEach(line => {
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = line;
                                rawSubjectsText += tempDiv.textContent + ' ';

                                const match = line.match(/(.*?)\s*\(([^)]+)\)\s*$/);
                                if (match) {
                                    let subjName = match[1].trim();
                                    let typesStr = match[2].trim();
                                    typesStr.split(',').forEach(t => uniqueTypes.add(t.trim().toLowerCase()));
                                    // Убрали &bull; (кружок)
                                    subjectsHtml += `<div style="margin-bottom: 0.6rem; line-height: 1.4; color: var(--color-text-primary); opacity: 0.9;">${subjName}</div>`;
                                } else {
                                    subjectsHtml += `<div style="margin-bottom: 0.6rem; line-height: 1.4; color: var(--color-text-primary); opacity: 0.9;">${line}</div>`;
                                }
                            });
                        }

                        // --- ГЕНЕРАЦИЯ ЦВЕТНЫХ КАПСУЛ ---
                        let badgesHtml = '';
                        const orderedTypes = ['экзамен', 'зачет', 'зачёт', 'лек', 'практ', 'лаб'];
                        const foundTypes = Array.from(uniqueTypes);

                        foundTypes.sort((a, b) => {
                            let ia = orderedTypes.indexOf(a);
                            let ib = orderedTypes.indexOf(b);
                            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
                        });

                        foundTypes.forEach(t => {
                            let bg = 'var(--color-highlight)';
                            let color = 'var(--color-text-secondary)';

                            if (t === 'лек') {
                                bg = 'rgba(0, 122, 255, 0.12)';
                                color = 'var(--color-blue)';
                            } else if (t === 'практ') {
                                bg = 'rgba(52, 199, 89, 0.12)';
                                color = 'var(--color-green)';
                            } else if (t === 'лаб') {
                                bg = 'rgba(255, 149, 0, 0.12)';
                                color = 'var(--color-warning)';
                            } else if (t === 'зачет' || t === 'зачёт') {
                                bg = 'rgba(85, 197, 209, 0.15)';
                                color = '#008B8B';
                            } else if (t === 'экзамен') {
                                bg = 'rgba(175, 82, 222, 0.15)';
                                color = '#AF52DE';
                            }

                            badgesHtml += `
                                <span style="
                                    background: ${bg};
                                    color: ${color};
                                    padding: 0 1rem;
                                    border-radius: 50px;
                                    font-size: 1.05rem;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    letter-spacing: 0.6px;
                                    white-space: nowrap;
                                    display: inline-flex;
                                    align-items: center;
                                    justify-content: center;
                                    height: 2.2rem;
                                    line-height: 1;
                                ">${t}</span>`;
                        });

                        const card = document.createElement('div');
                        card.className = 'teacher-card';

                        const searchString = `${nameText} ${chairText} ${rawSubjectsText}`.toLowerCase().replace(/\s+/g, ' ');
                        card.setAttribute('data-search', searchString);

                        card.innerHTML = `
                            <div class="teacher-avatar-box">
                                <img src="${img ? img.src : ''}" loading="lazy">
                            </div>
                            <div class="teacher-details">
                                <div class="teacher-name-link" onclick="${nameClick}">${nameText.replace('Расписание преподавателя', '')}</div>

                                <div class="teacher-meta-row">
                                    <div class="teacher-dept-link" onclick="${chairClick}">${chairText.replace('Расписание кафедры', '')}</div>
                                    <div class="teacher-badges-box">${badgesHtml}</div>
                                </div>

                                <div class="teacher-subjects">${subjectsHtml}</div>
                            </div>
                        `;
                        listContainer.appendChild(card);
                        table.remove();
                    });

                    if (statsLink) {
                        statsLink.className = 'stats-link-bottom';
                        span9.appendChild(statsLink);
                    }

                    const noResults = document.createElement('div');
                    noResults.className = 'no-results-msg';
                    noResults.textContent = 'Преподаватель не найден';
                    noResults.style.display = 'none';
                    listContainer.after(noResults);

                    const input = searchWrapper.querySelector('.search-input');
                    input.addEventListener('input', (e) => {
                        const term = e.target.value.toLowerCase().trim();
                        let foundCount = 0;
                        const allCards = listContainer.querySelectorAll('.teacher-card');
                        allCards.forEach(card => {
                            const content = card.getAttribute('data-search');
                            if (term === '' || content.includes(term)) {
                                card.style.display = 'flex';
                                foundCount++;
                            } else {
                                card.style.display = 'none';
                            }
                        });
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
                        // Хелпер для получения html2canvas из любых контекстов
                        let h2c = null;
                        if (typeof html2canvas !== 'undefined') h2c = html2canvas;
                        else if (typeof unsafeWindow !== 'undefined' && unsafeWindow.html2canvas) h2c = unsafeWindow.html2canvas;
                        else if (typeof window !== 'undefined' && window.html2canvas) h2c = window.html2canvas;

                        if (!h2c) {
                            console.error('html2canvas не найден');
                            shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">error</span> Ошибка';
                            setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                            return;
                        }

                        const isMobile = window.innerWidth <= 960;
                        const renderWidth = isMobile ? 540 : 1000;

                        const exportContainer = document.createElement('div');
                        // Скрываем контейнер внизу экрана
                        exportContainer.style.position = 'fixed';
                        exportContainer.style.top = '100vh';
                        exportContainer.style.left = '0';
                        exportContainer.style.width = renderWidth + 'px';
                        exportContainer.style.padding = isMobile ? '24px 24px 12px 24px' : '40px 40px 20px 40px';
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

                        // Удаляем кнопки "оценить занятие", скрытые пары и точки
                        timetableClone.querySelectorAll('.pair_teacher .eval').forEach(el => el.remove());
                        timetableClone.querySelectorAll('.hidden-by-filter').forEach(el => el.remove());
                        timetableClone.querySelectorAll('.live-dot').forEach(el => el.remove());

                        // Снимаем синие подчеркивания у ссылок
                        timetableClone.querySelectorAll('a').forEach(a => {
                            a.style.textDecoration = 'none';
                            a.style.color = getComputedStyle(a).color;
                        });

                        timetableClone.querySelectorAll('*').forEach(el => {
                            el.style.boxSizing = 'border-box';
                        });

                        span9Wrapper.appendChild(timetableClone);

                        const watermark = document.createElement('div');
                        watermark.style.cssText = 'text-align: right; margin-top: 16px; width: 100%; box-sizing: border-box;';
                        watermark.innerHTML = `<span style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;">etisreborn.ru</span>`;
                        span9Wrapper.appendChild(watermark);

                        exportContainer.appendChild(span9Wrapper);

                        // --- СКРЫТИЕ UI-ЭЛЕМЕНТОВ ДЛЯ СКРИНШОТА ---
                        const hideUIStyle = document.createElement('style');
                        hideUIStyle.innerHTML = `
                            .live-dot,
                            .add-custom-pair-btn,
                            .delete-custom-pair-btn,
                            .subject-note-btn {
                                display: none !important;
                                opacity: 0 !important;
                                visibility: hidden !important;
                            }

                            .msg-sender,
                            .msg-sender .material-icons,
                            .teacher-name-link,
                            .review-dis-link,
                            .tpr_part > a,
                            .theme a,
                            .logo-say-hey,
                            .accent-stat {
                                background: none !important;
                                -webkit-background-clip: initial !important;
                                -webkit-text-fill-color: initial !important;
                                color: var(--color-accent) !important;
                            }
                        `;
                        exportContainer.appendChild(hideUIStyle);

                        document.body.appendChild(exportContainer);

                        // Рендерим канвас
                        h2c(exportContainer, {
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
                    let existingH2c = null;
                    if (typeof html2canvas !== 'undefined') existingH2c = html2canvas;
                    else if (typeof unsafeWindow !== 'undefined' && unsafeWindow.html2canvas) existingH2c = unsafeWindow.html2canvas;
                    else if (typeof window !== 'undefined' && window.html2canvas) existingH2c = window.html2canvas;

                    if (!existingH2c) {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                        script.onload = renderTimetable;
                        document.head.appendChild(script);
                    } else {
                        renderTimetable();
                    }
                });

                // --- КНОПКА "СВОДКА" (АНАЛИЗ НЕДЕЛИ) ---
                const summaryBtn = document.createElement('div');
                summaryBtn.className = 'toolbar-item';
                summaryBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">pie_chart</span> Сводка';
                toolbar.appendChild(summaryBtn);

                // Функция автоматического сохранения количества пар в кэш
                const saveWeekToHistory = () => {
                    const currentWeekEl = span9.querySelector('.week.current');
                    const weekNum = currentWeekEl ? currentWeekEl.textContent.replace(/\D/g, '').trim() : null;
                    if (weekNum) {
                        let totalCount = 0;
                        span9.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
                            if (row.style.display !== 'none' && !row.classList.contains('hidden-by-filter')) {
                                totalCount++;
                            }
                        });
                        const storageKey = 'etis_weekly_pairs_history_v1';
                        let history = JSON.parse(localStorage.getItem(storageKey) || '{}');
                        history[weekNum] = totalCount;
                        localStorage.setItem(storageKey, JSON.stringify(history));
                    }
                };

                setTimeout(saveWeekToHistory, 500);

                summaryBtn.addEventListener('click', () => {
                    let lek = 0, pract = 0, lab = 0, cons = 0, exam = 0, total = 0;

                    // Считаем текущие пары
                    span9.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
                        if (row.style.display === 'none' || row.classList.contains('hidden-by-filter')) return;

                        total++;
                        const typeBadge = row.querySelector('.pair-type-badge');
                        const disName = row.querySelector('.dis') ? row.querySelector('.dis').textContent.toLowerCase() : '';

                        if (typeBadge) {
                            const t = typeBadge.textContent.toLowerCase();
                            if (t.includes('лек')) lek++;
                            else if (t.includes('практ')) pract++;
                            else if (t.includes('лаб')) lab++;
                            else if (t.includes('экз') || t.includes('зач')) exam++;
                        } else {
                            if (disName.includes('консультация')) cons++;
                            else if (disName.includes('экзамен') || disName.includes('зачет') || disName.includes('зачёт')) exam++;
                        }
                    });

                    const totalMins = total * 90;
                    const hours = Math.floor(totalMins / 60);
                    const mins = totalMins % 60;
                    const timeStr = hours > 0 ? `${hours} ч ${mins > 0 ? mins + ' мин' : ''}` : '0 ч';

                    // --- ЛОГИКА СРАВНЕНИЯ СО СРЕДНИМ ---
                    const storageKey = 'etis_weekly_pairs_history_v1';
                    const history = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    const keys = Object.keys(history);

                    let comparisonHtml = '';
                    let avgHtml = '';

                    // Вспомогательная функция для склонения слова "пара"
                    const getPairsWord = (n) => {
                        const absN = Math.abs(Math.round(n));
                        if (absN % 10 === 1 && absN % 100 !== 11) return 'пару';
                        if (absN % 10 >= 2 && absN % 10 <= 4 && (absN % 100 < 10 || absN % 100 >= 20)) return 'пары';
                        return 'пар';
                    };

                    if (keys.length >= 5) {
                        const sum = Object.values(history).reduce((a, b) => a + b, 0);
                        const avgVal = sum / keys.length;
                        const avgRounded = Math.round(avgVal * 10) / 10;

                        // Разница
                        const diff = Math.round((total - avgVal) * 10) / 10;
                        const absDiff = Math.abs(diff);
                        const word = getPairsWord(diff);

                        if (diff > 0) {
                            comparisonHtml = `<span style="color:var(--color-red); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem;">
                                (выше среднего на ${diff} ${word})
                            </span>`;
                        } else if (diff < 0) {
                            comparisonHtml = `<span style="color:var(--color-green); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem;">
                                (ниже на ${absDiff} ${word})
                            </span>`;
                        } else {
                            comparisonHtml = `<span style="color:var(--color-text-secondary); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem; opacity: 0.8;">
                                (в пределах нормы)
                            </span>`;
                        }

                        const avgTotalMins = avgRounded * 90;
                        const avgHours = Math.floor(avgTotalMins / 60);
                        const avgMins = Math.round(avgTotalMins % 60);
                        const avgTimeStr = avgHours > 0 ? `${avgHours} ч ${avgMins > 0 ? avgMins + ' мин' : ''}` : '0 ч';

                        avgHtml = `
                            <div style="margin-top: 2.4rem;">
                                <div style="font-size: 1.2rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 1.2rem; letter-spacing: 0.5px;">
                                    В среднем за неделю <span style="text-transform: none; font-weight: 500; font-size: 1.1rem;">(на основе ${keys.length} нед.)</span>
                                </div>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.2rem;">
                                    <div class="stat-box">
                                        <span class="stat-box-title">Всего пар</span>
                                        <span class="stat-box-value">${avgRounded}</span>
                                    </div>
                                    <div class="stat-box">
                                        <span class="stat-box-title">Времени в вузе</span>
                                        <span class="stat-box-value accent-stat">${avgTimeStr}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        avgHtml = `
                            <div style="margin-top: 2.4rem;">
                                <div style="font-size: 1.2rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 0.8rem; letter-spacing: 0.5px;">В среднем за неделю</div>
                                <div style="font-size:1.3rem; color: var(--color-text-secondary); line-height: 1.5; background: var(--color-highlight); padding: 1.6rem; border-radius: var(--radius-medium);">
                                    Откройте еще <b>${5 - keys.length} нед.</b> расписания, чтобы система рассчитала среднюю нагрузку.
                                </div>
                            </div>
                        `;
                    }

                    // Отрисовка модального окна
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

                    modal.innerHTML = `
                        <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="ui-dialog-title">Сводка</span>
                            <button class="close-analytics" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                        </div>
                        <div class="ui-dialog-content" style="padding: 2.4rem;">

                            <div>
                                <div style="display: flex; align-items: center; margin-bottom: 1.2rem;">
                                    <span style="font-size: 1.2rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">За текущую неделю</span>
                                    ${comparisonHtml}
                                </div>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.2rem;">
                                    <div class="stat-box">
                                        <span class="stat-box-title">Всего пар</span>
                                        <span class="stat-box-value">${total}</span>
                                    </div>
                                    <div class="stat-box">
                                        <span class="stat-box-title">Времени на учёбе</span>
                                        <span class="stat-box-value accent-stat">${timeStr}</span>
                                    </div>
                                </div>

                                <div style="margin-top: 1.2rem;">
                                    <div style="display:flex; gap: 0.8rem; flex-wrap: wrap;">
                                        ${lek > 0 ? `<div style="background: rgba(0, 122, 255, 0.1); color: var(--color-blue); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Лекции: ${lek}</div>` : ''}
                                        ${pract > 0 ? `<div style="background: rgba(52, 199, 89, 0.1); color: var(--color-green); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Практики: ${pract}</div>` : ''}
                                        ${lab > 0 ? `<div style="background: rgba(255, 149, 0, 0.1); color: var(--color-warning); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Лабы: ${lab}</div>` : ''}
                                        ${exam > 0 ? `<div style="background: rgba(255, 59, 48, 0.1); color: var(--color-red); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Зачет/Экзамен: ${exam}</div>` : ''}
                                        ${cons > 0 ? `<div style="background: var(--color-highlight); color: var(--color-text-primary); border: 1px solid var(--color-table-border); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Консультации: ${cons}</div>` : ''}
                                        ${total === 0 ? `<div style="color: var(--color-text-secondary); font-size: 1.3rem;">На этой неделе пар нет. Выдыхаем! ☕</div>` : ''}
                                    </div>
                                </div>
                            </div>

                            ${avgHtml}
                        </div>
                    `;

                    const closeAnalytics = () => {
                        overlay.classList.remove('active');
                        modal.classList.remove('active');
                    };
                    overlay.onclick = closeAnalytics;
                    modal.querySelector('.close-analytics').onclick = closeAnalytics;

                    overlay.classList.add('active');
                    modal.classList.add('active');
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

                    // Логика фильтрации (с плавным кроссфейдом таблиц)
                        checkbox.addEventListener('change', () => {
                            const show = checkbox.checked;
                            localStorage.setItem('etis_show_consultations', show);

                            const tables = span9.querySelectorAll('.timetable-grid');

                            // 1. Плавно скрываем все таблицы с расписанием (уменьшаем и делаем прозрачными)
                            tables.forEach(t => {
                                t.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
                                t.style.opacity = '0';
                                t.style.transform = 'translateY(-5px) scale(0.99)';
                            });

                            // 2. Ждем окончания затухания (150мс), пересчитываем структуру невидимой таблицы
                            setTimeout(() => {
                                span9.querySelectorAll('.consultation-row').forEach(row => {
                                    if (show) {
                                        row.classList.remove('hidden-by-filter');
                                        row.style.display = ''; // Возвращаем строку
                                    } else {
                                        row.classList.add('hidden-by-filter');
                                        row.style.display = 'none'; // Убираем строку
                                    }
                                });

                                // Пересчитываем окна и нумерацию пар (которую мы написали ранее)
                                if (typeof recalculateTimetable === 'function') recalculateTimetable();
                                renderNotes();

                                updateLiveTimetable();

                                // 3. Плавно проявляем обновленные таблицы обратно
                                tables.forEach(t => {
                                    t.style.opacity = '1';
                                    t.style.transform = 'translateY(0) scale(1)';
                                });
                            }, 150);
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
                            // Проверяем, скрыта ли сейчас карточка
                            const isHidden = resourcesDiv.hasAttribute('hidden') || resourcesDiv.style.display === 'none';

                            if (isHidden) {
                                // ОТКРЫВАЕМ
                                resourcesDiv.removeAttribute('hidden');
                                resourcesDiv.style.display = 'block';
                                newBtn.classList.add('is-active'); // Красим капсулу в синий
                            } else {
                                // ЗАКРЫВАЕМ
                                resourcesDiv.style.display = 'none';
                                newBtn.classList.remove('is-active'); // Возвращаем серый цвет
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

                // --- ЛОГИКА КАСТОМНЫХ ПАР ---
                const CUSTOM_PAIRS_KEY = 'etis_custom_pairs_v1';
                let customPairs = JSON.parse(localStorage.getItem(CUSTOM_PAIRS_KEY) || '[]');

                function saveCustomPair(pair) {
                    const existingIndex = customPairs.findIndex(p => p.id === pair.id);
                    if (existingIndex > -1) customPairs[existingIndex] = pair;
                    else customPairs.push(pair);
                    localStorage.setItem(CUSTOM_PAIRS_KEY, JSON.stringify(customPairs));
                }

                function removeCustomPair(id) {
                    customPairs = customPairs.filter(p => p.id !== id);
                    localStorage.setItem(CUSTOM_PAIRS_KEY, JSON.stringify(customPairs));
                }

                // Вставка кастомных пар в DOM
                function injectCustomPairs() {
                    const currentWeekEl = document.querySelector('.week.current');
                    const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 1;

                    const days = span9.querySelectorAll("div.day");
                    days.forEach(day => {
                        const dayNameEl = day.querySelector('.day-name');
                        if (!dayNameEl) return;

                        const currentDayName = dayNameEl.textContent.trim();
                        const table = day.querySelector('table');
                        if (!table) return;
                        const tbody = table.querySelector('tbody') || table;

                        customPairs.forEach(pair => {
                            if (pair.dayName !== currentDayName) return;

                            let shouldShow = false;
                            if (pair.recurrence === 'once' && pair.addedWeek === currentWeek) shouldShow = true;
                            if (pair.recurrence === 'every') shouldShow = true;
                            if (pair.recurrence === 'biweekly' && (currentWeek % 2 === pair.addedWeek % 2)) shouldShow = true;

                            if (shouldShow) {
                                // Жестко вычищаем плашку "Выходной / 0 пар", чтобы она не дублировалась
                                Array.from(tbody.querySelectorAll('tr')).forEach(r => {
                                    if (r.textContent.includes('0 пар') || r.textContent.includes('Выходной')) r.remove();
                                });

                                let typeClass = 'type-badge-lek';
                                if (pair.type === 'практ') typeClass = 'type-badge-pract';
                                else if (pair.type === 'лаб') typeClass = 'type-badge-lab';

                                const tr = document.createElement('tr');
                                tr.className = 'custom-pair-row';
                                tr.setAttribute('data-custom-id', pair.id);

                                tr.innerHTML = `
                                    <td class="pair_num">
                                        <span class="pair-type-badge ${typeClass}">${pair.type}</span>
                                        1 пара<br><font class="eval">${pair.startTime}</font>
                                    </td>
                                    <td class="pair_info">
                                        <div class="dis" style="display: flex; align-items: center; flex-wrap: wrap;">
                                            <a href="#" style="pointer-events: none;">${pair.subject}</a>
                                            <span class="material-icons delete-custom-pair-btn" title="Удалить пару">close</span>
                                        </div>
                                        ${pair.aud ? `
                                        <div class="aud" style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0.8rem; margin-top: 0.6rem;">
                                            <div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);">
                                                <span class="material-icons" style="font-size: 1.5rem;">place</span>${pair.aud}
                                            </div>
                                        </div>` : ''}
                                    </td>
                                    <td class="pair_teacher">
                                        ${pair.teacher ? `<a href="#" style="color: var(--color-text-secondary); text-decoration: none; pointer-events: none;">${pair.teacher}</a>` : ''}
                                    </td>
                                `;

                                // Логика удаления (крестик)
                                tr.querySelector('.delete-custom-pair-btn').addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    if(confirm(`Удалить пару "${pair.subject}"?`)) {
                                        removeCustomPair(pair.id);
                                        tr.remove();
                                        window.location.reload(); // Перезагружаем для чистого пересчета окон ЕТИСом
                                    }
                                });

                                tbody.appendChild(tr);
                            }
                        });

                        // Сортировка строк по времени начала, чтобы пара встала в правильное место по времени
                        const rows = Array.from(tbody.querySelectorAll('tr:not(.timetable-gap-row):not(.custom-no-pairs)'));
                        rows.sort((a, b) => {
                            const timeAStr = a.querySelector('.eval')?.textContent.split(':') || ['23','59'];
                            const timeBStr = b.querySelector('.eval')?.textContent.split(':') || ['23','59'];
                            return (parseInt(timeAStr[0])*60 + parseInt(timeAStr[1])) - (parseInt(timeBStr[0])*60 + parseInt(timeBStr[1]));
                        });
                        rows.forEach(r => tbody.appendChild(r));
                    });
                }

                // Модальное окно создания/редактирования пары
                function openCustomPairModal(dayName, existingPair = null) {
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

                    const title = existingPair ? `Редактировать пару` : `Добавить пару (${dayName})`;
                    const pairId = existingPair ? existingPair.id : ('cp_' + Date.now());

                    // Если создаем новую, ставим текущее время + 1.5 часа, иначе берем из сохраненного
                    let defStart = "08:00";
                    let defEnd = "09:30";
                    if (existingPair) {
                        defStart = existingPair.startTime;
                        defEnd = existingPair.endTime;
                    }

                    modal.innerHTML = `
                        <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="ui-dialog-title">${title}</span>
                            <button class="close-modal" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                        </div>
                        <div class="ui-dialog-content" style="padding: 2.4rem;">

                            ${existingPair ? `
                            <div class="modal-tabs">
                                <button class="modal-tab" data-tab="notes">Заметки / ДЗ</button>
                                <button class="modal-tab active" data-tab="edit">Настройки пары</button>
                            </div>
                            <div class="tab-content" id="tab-notes">
                                <textarea class="note-modal-textarea" id="cp-notes-area" placeholder="Что нужно сделать?"></textarea>
                                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                                    <button class="answer-btn-custom clear-cp-note-btn" style="background: var(--color-highlight); color: var(--color-red); border: 1px solid var(--color-table-border); box-shadow: none;">Удалить</button>
                                    <button class="answer-btn-custom save-cp-note-btn" style="box-shadow: none;">Сохранить заметку</button>
                                </div>
                            </div>
                            ` : ''}

                            <div class="tab-content active" id="tab-edit">
                                <input type="text" id="cp-subject" class="custom-pair-input-group" placeholder="Название предмета *" value="${existingPair ? existingPair.subject : ''}" style="width: 100%; box-sizing:border-box;">

                                <div class="custom-pair-input-group">
                                    <input type="time" id="cp-start" value="${defStart}" required title="Время начала">
                                    <input type="time" id="cp-end" value="${defEnd}" required title="Время окончания">
                                </div>

                                <div class="custom-pair-input-group">
                                    <select id="cp-type">
                                        <option value="лек" ${existingPair && existingPair.type==='лек'?'selected':''}>Лекция</option>
                                        <option value="практ" ${existingPair && existingPair.type==='практ'?'selected':''}>Практика</option>
                                        <option value="лаб" ${existingPair && existingPair.type==='лаб'?'selected':''}>Лабораторная</option>
                                    </select>
                                    <select id="cp-recurrence">
                                        <option value="every" ${existingPair && existingPair.recurrence==='every'?'selected':''}>Каждую неделю</option>
                                        <option value="biweekly" ${existingPair && existingPair.recurrence==='biweekly'?'selected':''}>Раз в 2 недели</option>
                                        <option value="once" ${existingPair && existingPair.recurrence==='once'?'selected':''}>Только на этой неделе</option>
                                    </select>
                                </div>

                                <div class="custom-pair-input-group">
                                    <input type="text" id="cp-aud" placeholder="Аудитория (например: 413, 8)" value="${existingPair ? existingPair.aud : ''}">
                                    <input type="text" id="cp-teacher" placeholder="Преподаватель (Иванов И.И.)" value="${existingPair ? existingPair.teacher : ''}">
                                </div>

                                <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
                                    <button class="answer-btn-custom save-cp-btn" style="box-shadow: none;">${existingPair ? 'Сохранить изменения' : 'Добавить'}</button>
                                </div>
                            </div>
                        </div>
                    `;

                    const closeModal = () => { overlay.classList.remove('active'); modal.classList.remove('active'); };
                    overlay.onclick = closeModal;
                    modal.querySelector('.close-modal').onclick = closeModal;

                    // Авто-сдвиг времени на +1.5 часа
                    const startInput = modal.querySelector('#cp-start');
                    const endInput = modal.querySelector('#cp-end');
                    startInput.addEventListener('change', (e) => {
                        if (e.target.value) {
                            let [hours, minutes] = e.target.value.split(':').map(Number);
                            minutes += 90; // Прибавляем 1.5 часа
                            hours += Math.floor(minutes / 60);
                            minutes = minutes % 60;
                            hours = hours % 24;
                            endInput.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    });

                    // Логика переключения вкладок (если редактируем)
                    if (existingPair) {
                        const tabs = modal.querySelectorAll('.modal-tab');
                        const contents = modal.querySelectorAll('.tab-content');

                        let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                        const currentNote = notesData.specific[existingPair.pairNoteId] || '';
                        modal.querySelector('#cp-notes-area').value = currentNote;

                        tabs.forEach(tab => {
                            tab.addEventListener('click', () => {
                                tabs.forEach(t => t.classList.remove('active'));
                                contents.forEach(c => c.classList.remove('active'));
                                tab.classList.add('active');
                                modal.querySelector(`#tab-${tab.getAttribute('data-tab')}`).classList.add('active');
                            });
                        });

                        modal.querySelector('.save-cp-note-btn').onclick = () => {
                            const val = modal.querySelector('#cp-notes-area').value.trim();
                            if (!val) delete notesData.specific[existingPair.pairNoteId];
                            else notesData.specific[existingPair.pairNoteId] = val;
                            localStorage.setItem('etis_subject_notes_v2', JSON.stringify(notesData));
                            closeModal();
                            renderNotes(); // Мгновенно обновляем карандашик
                        };
                        modal.querySelector('.clear-cp-note-btn').onclick = () => {
                            modal.querySelector('#cp-notes-area').value = '';
                            modal.querySelector('.save-cp-note-btn').click();
                        };
                    }

                    // Сохранение самой пары
                    modal.querySelector('.save-cp-btn').onclick = () => {
                        const subject = document.getElementById('cp-subject').value.trim();
                        if (!subject) return alert('Введите название предмета!');

                        const currentWeekEl = document.querySelector('.week.current');
                        const addedWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 1;

                        // Умное форматирование аудитории
                        let rawAud = document.getElementById('cp-aud').value.trim();
                        let finalAud = rawAud;

                        // Если ввели "413, 8" и нет слова "ауд"
                        if (rawAud && rawAud.includes(',') && !rawAud.toLowerCase().includes('ауд')) {
                            const parts = rawAud.split(',').map(s => s.trim());
                            if (parts.length === 2) {
                                const room = parts[0];
                                const building = parts[1];
                                // Этаж - это первая цифра аудитории
                                const floorMatch = room.match(/\d/);
                                const floor = floorMatch ? floorMatch[0] : '1';
                                finalAud = `ауд. ${room}, к. ${building}, э. ${floor}`;
                            }
                        }

                        const pair = {
                            id: pairId,
                            addedWeek: existingPair ? existingPair.addedWeek : addedWeek,
                            dayName: dayName,
                            subject: subject,
                            startTime: document.getElementById('cp-start').value,
                            endTime: document.getElementById('cp-end').value, // Сохраняем конец (для сортировки и расчетов), но не выводим
                            type: document.getElementById('cp-type').value,
                            recurrence: document.getElementById('cp-recurrence').value,
                            aud: finalAud,
                            teacher: document.getElementById('cp-teacher').value.trim()
                        };

                        saveCustomPair(pair);
                        closeModal();
                        window.location.reload();
                    };

                    overlay.classList.add('active');
                    modal.classList.add('active');
                }

                // --- ОФОРМЛЕНИЕ ЗАГОЛОВКОВ ДНЕЙ (ДАТЫ) И КНОПКА "+" ---
                const dayHeaders = span9.querySelectorAll('.day h3');
                dayHeaders.forEach(header => {
                    const text = header.textContent.trim();
                    const parts = text.split(',');

                    let dayOfWeek = text;
                    let datePart = '';

                    if (parts.length >= 2) {
                        dayOfWeek = parts[0].trim();
                        datePart = parts.slice(1).join(',').trim();
                    }

                    // Кнопка "+" теперь встроена прямо в flex-блок рядом с днем недели
                    header.innerHTML = `
                        <div style="display:flex; align-items:center; gap: 6px;">
                            <span class="day-name">${dayOfWeek}</span>
                            <span class="material-icons add-custom-pair-btn" title="Добавить свою пару">add</span>
                        </div>
                        <span class="day-date">${datePart}</span>
                    `;

                    header.querySelector('.add-custom-pair-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        openCustomPairModal(dayOfWeek);
                    });
                });

                // Вставляем кастомные пары до пересчета расписания
                injectCustomPairs();

                // --- ЛОГИКА ОПРЕДЕЛЕНИЯ ДЛИННЫХ СТРОК (ДЛЯ СДВИГА ПРЕПОДАВАТЕЛЯ) ---
                function markLongRows() {
                    const isMobile = window.innerWidth <= 960;
                    span9.querySelectorAll('.timetable-grid tr').forEach(row => {
                        row.classList.remove('tr-needs-space'); // Сброс

                        const aud = row.querySelector('.pair_info .aud');
                        if (!aud) return;

                        const isOnline = aud.querySelector('a') || aud.textContent.toLowerCase().includes('онлайн');
                        const textLength = aud.textContent.trim().length;

                        // Помечаем только реально "опасные" строки
                        if (isOnline || textLength > 20) {
                            row.classList.add('tr-needs-space');
                        }
                    });
                }
                markLongRows();
                // Также вызываем это при рендере заметок, так как карандаш тоже удлиняет строку
                const oldRenderNotes = renderNotes;
                renderNotes = function() {
                    oldRenderNotes();
                    markLongRows();
                };

                // --- УМНЫЕ НАЗВАНИЯ НЕДЕЛЬ ---
                const weeksItems = span9.querySelectorAll('.weeks .week');
                weeksItems.forEach(w => {
                    const link = w.querySelector('a');
                    if (w.classList.contains('current')) {
                        // Активная неделя - пишем "Х Неделя"
                        const text = w.textContent.trim();
                        const numMatch = text.match(/\d+/);
                        if (numMatch) {
                            if (link) link.innerHTML = '<span style="font-weight: 800;">' + numMatch[0] + '</span>&nbsp;<span style="font-weight: 800;">Неделя</span>';
                            else w.innerHTML = '<span style="font-weight: 800;">' + numMatch[0] + '</span>&nbsp;<span style="font-weight: 800;">Неделя</span>';
                        }
                    } else if (link) {
                        // Неактивная неделя - оставляем только цифру
                        const text = link.textContent.trim();
                        const numMatch = text.match(/\d+/);
                        if (numMatch) {
                            link.textContent = numMatch[0];
                        }
                    }
                });

                // --- ПАРСИНГ И ИКОНКИ ДЛЯ АУДИТОРИЙ ---
                span9.querySelectorAll('.pair_info .aud').forEach(aud => {
                    let text = aud.innerHTML;
                    const linkEl = aud.querySelector('a');

                    const isOnlineText = /Дистанционно|on-line/i.test(text);
                    const isZoom = linkEl && linkEl.href.includes('zoom');
                    const isTelemost = linkEl && linkEl.href.includes('telemost');

                    // Если это онлайн пара (есть ссылка ИЛИ текст "дистанционно")
                    if (isOnlineText || linkEl) {

                        if (isZoom || isTelemost) {
                            // 1. ZOOM или ТЕЛЕМОСТ (оставляем только капсулу)
                            let platformName = isZoom ? "Zoom" : "Телемост";
                            aud.innerHTML = `
                                <a href="${linkEl.href}" target="_blank">${platformName}</a>
                            `;
                        } else if (linkEl) {
                            // 2. ДРУГАЯ ССЫЛКА (Фиолетовая капсула)
                            aud.innerHTML = `
                                <a href="${linkEl.href}" target="_blank" class="btn-generic-online">Онлайн</a>
                            `;
                        } else {
                            // 3. ССЫЛКИ НЕТ, просто написано "Дистанционно"
                            aud.innerHTML = `
                                <span class="btn-generic-online" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.5rem 1.4rem 0.5rem 1.5rem; border-radius: 50px; font-weight: 700; font-size: 1.2rem; background: rgba(175, 82, 222, 0.12); color: #AF52DE; border: 1px solid rgba(175, 82, 222, 0.2);">
                                    <span class="material-icons" style="font-size: 1.8rem;">public</span>Онлайн
                                </span>
                            `;
                        }
                    }
                    // Иначе это обычная физическая аудитория
                    else {
                        const matchPhysical = text.match(/ауд\.\s*(.+)\s*\((.+?)\s*корпус,\s*(.*?)\s*этаж\)/i);
                        if (matchPhysical) {
                            let roomNumber = matchPhysical[1].trim();
                            const building = matchPhysical[2].trim();
                            const floor = matchPhysical[3].trim();
                            if (roomNumber.includes('/')) roomNumber = roomNumber.split('/')[0];

                            const newFormat = `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>ауд. ${roomNumber}, к. ${building}, э. ${floor}</div>`;
                            aud.innerHTML = text.replace(matchPhysical[0], newFormat);
                        }
                    }

                    // Выстраиваем в одну линию (Текст + Капсула)
                    aud.style.display = 'flex';
                    aud.style.flexDirection = 'row';
                    aud.style.flexWrap = 'wrap';
                    aud.style.alignItems = 'center';
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

                                    // Собираем время начала первого скрытого ряда и время окончания последнего для "окна"
                                    const firstHiddenRow = rows[gapStart];
                                    const lastHiddenRow = rows[i-1];
                                    const startTime = firstHiddenRow.querySelector('.eval')?.textContent || "00:00";

                                    // Записываем время в дата-атрибуты, чтобы функция светофора их видела
                                    gapRow.setAttribute('data-gap-start', startTime);
                                    gapRow.setAttribute('data-gap-count', gapCount);

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
                        // --- ДИНАМИЧЕСКАЯ НУМЕРАЦИЯ ПАР ДЛЯ СТУДЕНТА ---
                        let pairCounter = 1;
                        visibleRows.forEach(row => {
                            // Пропускаем строки с "окнами" и выходными днями (0 пар)
                            if (row.classList.contains('timetable-gap-row') || row.classList.contains('custom-no-pairs')) return;

                            const numTd = row.querySelector('.pair_num');
                            if (numTd) {
                                // Перебираем содержимое ячейки, чтобы изменить ТОЛЬКО текст номера пары,
                                // не сломав при этом время (<font>) и капсулы типа (ЛЕК/ПРАКТ)
                                Array.from(numTd.childNodes).forEach(node => {
                                    if (node.nodeType === Node.TEXT_NODE && /пара/i.test(node.nodeValue)) {
                                        node.nodeValue = node.nodeValue.replace(/\d+\s*пара/i, `${pairCounter} пара`);
                                        pairCounter++;
                                    }
                                });
                            }
                        });
                    });
                }

                // --- УМНЫЕ ЗАМЕТКИ ---
                function renderNotes() {
                    let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                    const seenSubjects = new Set();
                    const allRowsArray = Array.from(document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)'));

                    const currentWeekEl = document.querySelector('.week.current');
                    const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 0;

                    allRowsArray.forEach((row, index) => {
                        const disContainer = row.querySelector('.pair_info .dis');
                        const numTd = row.querySelector('.pair_num');
                        const audContainer = row.querySelector('.pair_info .aud');
                        if (!disContainer || !numTd) return;

                        const targetEl = disContainer.querySelector('a') || disContainer;
                        const cleanSubjectName = targetEl.textContent.trim();

                        const dayContainer = row.closest('.day');
                        const dayDateEl = dayContainer ? dayContainer.querySelector('.day-date') : null;
                        const dayDateStr = dayDateEl ? dayDateEl.textContent.trim() : 'UnknownDate';

                        let rawPairNum = "";
                        Array.from(numTd.childNodes).forEach(n => {
                            if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) {
                                rawPairNum = n.nodeValue.trim();
                            }
                        });
                        if (!rawPairNum) rawPairNum = numTd.textContent.trim().split(' ')[0] + ' пара';

                        const pairId = `${dayDateStr}_${rawPairNum}_${cleanSubjectName}`;

                        // Если для этого предмета есть отложенная заметка (на след. неделю)
                        if (notesData.next_unbound && notesData.next_unbound[cleanSubjectName] && !seenSubjects.has(cleanSubjectName)) {
                            const unbound = notesData.next_unbound[cleanSubjectName];
                            
                            // Проверяем: если мы уже на следующей (или более поздней) неделе, привязываем заметку
                            if (currentWeek > unbound.week) {
                                notesData.specific[pairId] = unbound.text;
                                delete notesData.next_unbound[cleanSubjectName];
                                localStorage.setItem('etis_subject_notes_v2', JSON.stringify(notesData));
                            }
                        }
                        seenSubjects.add(cleanSubjectName);

                        const currentNote = notesData.specific[pairId] || '';

                        // Удаляем старые кнопки перед перерисовкой
                        row.querySelectorAll('.note-btn-wrapper').forEach(w => w.remove());
                        row.querySelectorAll('.subject-note-btn').forEach(btn => btn.remove());

                        // Создаем саму кнопку
                        const noteBtn = document.createElement('button');
                        noteBtn.className = 'subject-note-btn';
                        noteBtn.innerHTML = currentNote ? '<span class="material-icons">assignment</span>' : '<span class="material-icons">edit</span>';
                        if (currentNote) noteBtn.classList.add('has-note');

                        noteBtn.addEventListener('click', (e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (row.classList.contains('custom-pair-row')) {
                                const pairIdFromRow = row.getAttribute('data-custom-id');
                                const pairData = customPairs.find(p => p.id === pairIdFromRow);
                                if (pairData) {
                                    pairData.pairNoteId = pairId;
                                    const dayNameEl = row.closest('.day').querySelector('.day-name');
                                    openCustomPairModal(dayNameEl ? dayNameEl.textContent.trim() : 'День', pairData);
                                }
                            } else {
                                openNoteModal(cleanSubjectName, pairId, index, allRowsArray, currentNote);
                            }
                        });

                        // Оборачиваем кнопку, чтобы она не ломала Flex-строку аудитории
                        const noteWrapper = document.createElement('span');
                        noteWrapper.className = 'note-btn-wrapper';
                        noteWrapper.style.display = 'inline-flex';
                        noteWrapper.appendChild(noteBtn);

                        // Выбираем контейнер (всегда в аудиторию, если она есть)
                        let targetContainer = audContainer && audContainer.textContent.trim() !== '' ? audContainer : disContainer;
                        targetContainer.appendChild(noteWrapper);
                    });
                }

                function openNoteModal(subjectName, pairId, currentIndex, allRowsArray, existingNoteText) {
                    let overlay = document.querySelector('.notes-overlay');
                    let modal = document.querySelector('.notes-modal');

                    if (!overlay || !modal) {
                        overlay = document.createElement('div');
                        overlay.className = 'analytics-overlay notes-overlay';
                        document.body.appendChild(overlay);

                        modal = document.createElement('div');
                        modal.className = 'analytics-modal notes-modal';
                        document.body.appendChild(modal);
                    }

                    modal.innerHTML = `
                        <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="ui-dialog-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%;">${subjectName}</span>
                            <button class="close-notes" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                        </div>
                        <div class="ui-dialog-content" style="padding: 2.4rem;">
                            <p style="margin-bottom: 0.8rem; color: var(--color-text-secondary); font-weight: 500;">Заметка / Домашнее задание:</p>
                            <textarea class="note-modal-textarea" placeholder="Что нужно сделать?">${existingNoteText}</textarea>

                            <div style="margin: 2rem 0;">
                                <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition);">
                                    <div style="display:flex; flex-direction:column; gap:2px;">
                                        <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">На следующую пару</span>
                                        <span style="font-size:1.1rem; color:var(--color-text-secondary);">Заметка перенесется и исчезнет здесь</span>
                                    </div>
                                    <input type="checkbox" id="note-next-class-cb" class="tumbler-checkbox">
                                </label>
                            </div>

                            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                                <button class="answer-btn-custom clear-note-btn" style="background: var(--color-highlight); color: var(--color-red); border: 1px solid var(--color-table-border); box-shadow: none;">Удалить</button>
                                <button class="answer-btn-custom save-note-btn" style="box-shadow: none;">Сохранить</button>
                            </div>
                        </div>
                    `;

                    const closeModal = () => {
                        overlay.classList.remove('active');
                        modal.classList.remove('active');
                    };

                    overlay.onclick = closeModal;
                    modal.querySelector('.close-notes').onclick = closeModal;

                    modal.querySelector('.save-note-btn').onclick = () => {
                        const val = modal.querySelector('.note-modal-textarea').value.trim();
                        const isNext = modal.querySelector('#note-next-class-cb').checked;

                        let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                        const currentWeekEl = document.querySelector('.week.current');
                        const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 0;

                        // Очищаем текущую заметку в любом случае, если нажато "На следующую пару" или если поле пустое
                        if (!val || isNext) {
                            delete notesData.specific[pairId];
                        }

                        if (val) {
                            if (isNext) {
                                // ЛОГИКА ПЕРЕНОСА
                                let nextPairId = null;
                                // Ищем следующую такую же пару в оставшейся части текущей недели
                                for (let i = currentIndex + 1; i < allRowsArray.length; i++) {
                                    const r = allRowsArray[i];
                                    const dCont = r.querySelector('.pair_info .dis');
                                    const tEl = dCont ? (dCont.querySelector('a') || dCont) : null;

                                    if (tEl && tEl.textContent.trim() === subjectName) {
                                        const dD = r.closest('.day')?.querySelector('.day-date');
                                        const dStr = dD ? dD.textContent.trim() : 'UnknownDate';
                                        const nTd = r.querySelector('.pair_num');
                                        let rNum = "";
                                        if (nTd) {
                                            Array.from(nTd.childNodes).forEach(n => {
                                                if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) {
                                                    rNum = n.nodeValue.trim();
                                                }
                                            });
                                        }
                                        nextPairId = `${dStr}_${rNum}_${subjectName}`;
                                        break;
                                    }
                                }

                                if (nextPairId) {
                                    // Нашли на этой неделе
                                    notesData.specific[nextPairId] = val;
                                } else {
                                    // Не нашли — отправляем в "непривязанные" на следующую неделю
                                    if (!notesData.next_unbound) notesData.next_unbound = {};
                                    notesData.next_unbound[subjectName] = { text: val, week: currentWeek };
                                }
                            } else {
                                // ОБЫЧНОЕ СОХРАНЕНИЕ (без переноса)
                                notesData.specific[pairId] = val;
                            }
                        }

                        localStorage.setItem('etis_subject_notes_v2', JSON.stringify(notesData));
                        closeModal();
                        renderNotes(); 
                    };

                    modal.querySelector('.clear-note-btn').onclick = () => {
                        modal.querySelector('.note-modal-textarea').value = '';
                        modal.querySelector('.save-note-btn').click();
                    };

                    overlay.classList.add('active');
                    modal.classList.add('active');
                    setTimeout(() => modal.querySelector('.note-modal-textarea').focus(), 100);
                }

                // --- МОБИЛЬНЫЕ СВАЙПЫ РАСПИСАНИЯ ---
                function initMobileSwipes() {
                    // Создаем индикатор
                    const bubble = document.createElement('div');
                    bubble.id = 'swipe-action-bubble';
                    bubble.innerHTML = '<span class="material-icons"></span>';
                    document.body.appendChild(bubble);
                    const iconEl = bubble.querySelector('.material-icons');

                    let startX = 0, startY = 0;
                    let currentTarget = null;
                    let targetElements = [];
                    let originalRect = null; // Будем хранить изначальные границы элемента
                    let targetType = '';
                    let isSwiping = false;
                    let isScrollDetermined = false;
                    let swipeDir = '';
                    let hasEval = false;
                    let evalLink = null;
                    const THRESHOLD = 70; // Порог срабатывания

                    const span9El = document.querySelector('.span9');
                    if (!span9El) return;

                    span9El.addEventListener('touchstart', (e) => {
                        // Если экран широкий (ПК) — отключаем скрипт
                        if (window.innerWidth > 960) return;

                        const touch = e.touches[0];
                        startX = touch.clientX;
                        startY = touch.clientY;
                        isSwiping = false;
                        isScrollDetermined = false;
                        swipeDir = '';
                        currentTarget = null;
                        targetElements = [];
                        originalRect = null;

                        const row = e.target.closest('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)');
                        const dayHeader = e.target.closest('.day h3');

                        // Захватываем цель
                        if (row && !row.querySelector('th')) {
                            currentTarget = row;
                            targetElements = Array.from(row.querySelectorAll('td'));
                            targetType = 'row';
                            evalLink = row.querySelector('.pair_teacher .eval');
                            hasEval = !!evalLink;
                        } else if (dayHeader) {
                            currentTarget = dayHeader;
                            targetElements = [dayHeader];
                            targetType = 'day';
                        }

                        // Фиксируем физические границы элемента ДО начала сдвига
                        if (currentTarget) {
                            if (targetType === 'row') {
                                const firstTd = targetElements[0].getBoundingClientRect();
                                const lastTd = targetElements[targetElements.length - 1].getBoundingClientRect();
                                originalRect = {
                                    top: firstTd.top,
                                    left: firstTd.left,
                                    right: lastTd.right,
                                    height: firstTd.height
                                };
                            } else {
                                originalRect = currentTarget.getBoundingClientRect();
                            }
                            targetElements.forEach(el => el.style.transition = 'none');
                        }
                    }, { passive: true });

                    span9El.addEventListener('touchmove', (e) => {
                        if (!currentTarget || !originalRect) return;
                        const touch = e.touches[0];
                        const diffX = touch.clientX - startX;
                        const diffY = touch.clientY - startY;

                        // Мертвая зона для определения (свайп или скролл вниз)
                        if (!isScrollDetermined) {
                            if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;
                            isScrollDetermined = true;
                            if (Math.abs(diffY) > Math.abs(diffX)) {
                                currentTarget = null;
                                return;
                            }
                            isSwiping = true;
                            bubble.className = '';
                        }

                        if (isSwiping) {
                            if (diffX < 0) {
                                swipeDir = 'left';
                                iconEl.textContent = targetType === 'day' ? 'add' : 'edit';
                            } else if (diffX > 0 && targetType === 'row' && hasEval) {
                                swipeDir = 'right';
                                iconEl.textContent = 'star_rate';
                            } else {
                                targetElements.forEach(el => el.style.transform = `translateX(0px)`);
                                bubble.style.opacity = '0';
                                return;
                            }

                            // Пружинистое сопротивление
                            let moveX = diffX;
                            if (Math.abs(moveX) > THRESHOLD) {
                                moveX = (moveX > 0 ? 1 : -1) * (THRESHOLD + (Math.abs(moveX) - THRESHOLD) * 0.25);
                            }

                            // 1. Двигаем строку
                            targetElements.forEach(el => el.style.transform = `translateX(${moveX}px)`);

                            // 2. Иконка появляется ровно по центру образующейся пустоты
                            bubble.style.top = `${originalRect.top + originalRect.height / 2 - 12}px`; // 12px = половина высоты иконки
                            bubble.style.opacity = Math.min(Math.abs(diffX) / 30, 1).toString();

                            if (swipeDir === 'left') {
                                // Пустота образуется СПРАВА (между оригинальным краем и уехавшей строкой)
                                // Ставим иконку в центр этой пустоты (двигается в 2 раза медленнее свайпа)
                                bubble.style.left = `${originalRect.right + (moveX / 2) - 12}px`;
                            } else {
                                // Пустота образуется СЛЕВА
                                bubble.style.left = `${originalRect.left + (moveX / 2) - 12}px`;
                            }

                            // 3. Индикация прохождения порога (смена цвета)
                            if (Math.abs(diffX) >= THRESHOLD) {
                                if (targetType === 'day') bubble.classList.add('active-threshold', 'action-add');
                                else if (swipeDir === 'left') bubble.classList.add('active-threshold', 'action-note');
                                else bubble.classList.add('active-threshold', 'action-eval');

                                if (!bubble.dataset.vibrated && navigator.vibrate) {
                                    navigator.vibrate(15);
                                    bubble.dataset.vibrated = 'true';
                                }
                            } else {
                                bubble.classList.remove('active-threshold', 'action-add', 'action-note', 'action-eval');
                                bubble.dataset.vibrated = '';
                            }
                        }
                    }, { passive: true });

                    span9El.addEventListener('touchend', (e) => {
                        if (!currentTarget || !isSwiping) return;

                        const diffX = e.changedTouches[0].clientX - startX;
                        const target = currentTarget;
                        const tType = targetType;
                        const dir = swipeDir;
                        const el = evalLink;

                        // Плавный возврат строки на место
                        targetElements.forEach(elem => {
                            elem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            elem.style.transform = 'translateX(0px)';
                        });

                        // Иконка плавно затухает
                        bubble.style.opacity = '0';
                        bubble.classList.remove('active-threshold', 'action-add', 'action-note', 'action-eval');
                        bubble.dataset.vibrated = '';

                        // Выполнение действия
                        if (Math.abs(diffX) >= THRESHOLD) {
                            setTimeout(() => {
                                if (tType === 'day' && dir === 'left') {
                                    const dayNameEl = target.querySelector('.day-name');
                                    if (dayNameEl) openCustomPairModal(dayNameEl.textContent.trim());
                                } else if (tType === 'row') {
                                    if (dir === 'left') {
                                        const noteBtn = target.querySelector('.subject-note-btn');
                                        if (noteBtn) noteBtn.click();
                                    } else if (dir === 'right' && el) {
                                        if (el.hasAttribute('href')) window.location.href = el.getAttribute('href');
                                        else el.click();
                                    }
                                }
                            }, 150); // Небольшая задержка, чтобы строка успела вернуться визуально
                        }

                        currentTarget = null;
                        isSwiping = false;
                    });
                }

                // Вызываем инициализацию свайпов
                initMobileSwipes();

                // Вызываем перерасчет сразу при загрузке расписания
                recalculateTimetable();

                // Запускаем отрисовку заметок при загрузке страницы
                renderNotes();

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
                    span9.querySelectorAll('br, h2, h3').forEach((el, i) => { if(i < 2) el.remove(); });
                    const announceMessages = span9.querySelectorAll('ul.nav.msg');
                    if (!announceMessages.length) break;

                    const container = document.createElement('div');
                    container.className = 'msg-container';

                    // --- СОЗДАНИЕ ПОИСКА ---
                    const searchWrapper = document.createElement('div');
                    searchWrapper.className = 'teacher-search-wrapper';
                    searchWrapper.style.marginTop = '0';
                    searchWrapper.innerHTML = `
                        <div class="search-capsule" style="max-width: 100%;">
                            <span class="material-icons search-icon">search</span>
                            <input type="text" class="search-input" id="ann-search" placeholder="Поиск" style="padding-left: 44px !important;">
                        </div>
                    `;

                    announceMessages.forEach(msg => {
                        const firstLi = msg.querySelector('li:first-child');
                        if (!firstLi) return;
                        const cloneContent = firstLi.cloneNode(true);
                        const dateNode = cloneContent.querySelector('font[color="#808080"]');
                        const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                        if (dateNode) dateNode.remove();
                        const titleNode = cloneContent.querySelector('font[style*="font-weight:bold"], b');
                        const titleStr = titleNode ? titleNode.textContent.trim() : '';
                        if (titleNode) titleNode.remove();
                        cloneContent.querySelectorAll('font').forEach(n => n.remove());

                        const attachments = [];
                        msg.querySelectorAll('a[href*="file_download"]').forEach(link => {
                            attachments.push({ name: link.textContent.trim(), href: link.href });
                        });

                        let rawHtml = cloneContent.innerHTML.replace(/^(<br\s*\/?>|\s)+/, '').replace(/(<br\s*\/?>|\s)+$/, '');
                        const parts = rawHtml.split(/<br\s*\/?>/i);
                        let authorStr = 'Администрация / Деканат';
                        if (parts.length > 1) {
                            const lastPart = parts[parts.length - 1].trim();
                            if (lastPart.length > 0 && lastPart.length < 60 && !lastPart.includes('<')) {
                                authorStr = lastPart;
                                parts.pop();
                            }
                        }
                        let bodyHtml = parts.join('<br>').replace(/^(<br\s*\/?>|\s)+/, '');

                        const card = document.createElement('div');
                        card.className = 'msg-card';
                        card.innerHTML = `
                            <div class="msg-header">
                                <div class="msg-sender"><span class="material-icons">campaign</span>${authorStr}</div>
                                <div class="msg-date msg-date-wrapper">
                                    <span class="msg-date-text">${dateStr}</span>
                                    <div class="share-msg-wrap">${softShareSVG}</div>
                                </div>
                            </div>
                            ${titleStr ? `<div class="msg-subject">${titleStr}</div>` : ''}
                            <div class="msg-body">${bodyHtml}</div>
                            ${attachments.length > 0 ? `<div class="msg-footer"><div class="msg-attachments">${attachments.map(a => `<a href="${a.href}" class="file-attachment-link" target="_blank"><span class="material-icons">attach_file</span><span class="file-name">${a.name}</span></a>`).join('')}</div></div>` : ''}
                        `;
                        container.appendChild(card);
                    });

                    container.querySelectorAll('.msg-card').forEach(card => {
                        const shareBtn = card.querySelector('.share-msg-btn');
                        if (shareBtn) {
                            shareBtn.style.cursor = 'pointer';
                            shareBtn.onclick = (e) => {
                                e.stopPropagation();
                                shareMessageCard(card, 'Объявление.png');
                            };
                        }
                    });

                    // Логика фильтрации
                    searchWrapper.querySelector('#ann-search').addEventListener('input', (e) => {
                        const val = e.target.value.toLowerCase().trim();
                        container.querySelectorAll('.msg-card').forEach(card => {
                            card.style.display = (val === '' || card.textContent.toLowerCase().includes(val)) ? '' : 'none';
                        });
                    });

                    span9.innerHTML = '';
                    span9.appendChild(searchWrapper);
                    span9.appendChild(container);
                    break;
                }

                case 'stu.teacher_notes': {
                    const pagesContainer = span9.querySelector('.weeks');
                    if (pagesContainer) {
                        pagesContainer.classList.add('message-pages');
                        const firstLi = pagesContainer.querySelector('li');
                        if (firstLi && firstLi.textContent.includes('Страницы')) firstLi.style.display = 'none';
                    }

                    const messages = span9.querySelectorAll('ul.nav.msg');
                    const container = document.createElement('div');
                    container.className = 'msg-container';

                    // --- СОЗДАНИЕ ПОИСКА ---
                    const searchWrapper = document.createElement('div');
                    searchWrapper.className = 'teacher-search-wrapper';
                    searchWrapper.style.marginTop = '0';
                    searchWrapper.innerHTML = `
                        <div class="search-capsule" style="max-width: 100%;">
                            <span class="material-icons search-icon">search</span>
                            <input type="text" class="search-input" id="msg-search" placeholder="Поиск" style="padding-left: 44px !important;">
                        </div>
                    `;

                    messages.forEach(msg => {
                        const mainLi = msg.querySelector('li');
                        if (!mainLi) return;
                        const cloneContent = mainLi.cloneNode(true);
                        const teacherNode = cloneContent.querySelector('b i');
                        const teacherName = teacherNode ? teacherNode.textContent.trim() : 'Преподаватель';
                        const bTag = cloneContent.querySelector('b');
                        if (bTag && bTag.contains(teacherNode)) bTag.remove();
                        const dateNode = cloneContent.querySelector('font[color="#808080"]');
                        const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                        if (dateNode) dateNode.remove();
                        const subjects = [];
                        cloneContent.querySelectorAll('font').forEach(f => { subjects.push(f.textContent.trim()); f.remove(); });

                        const card = document.createElement('div');
                        card.className = 'msg-card';
                        card.innerHTML = `
                            <div class="msg-header">
                                <div class="msg-sender"><span class="material-icons">person</span>${teacherName}</div>
                                <div class="msg-date msg-date-wrapper">
                                    <span class="msg-date-text">${dateStr}</span>
                                    <div class="share-msg-wrap">${softShareSVG}</div>
                                </div>
                            </div>
                            ${subjects.length ? `<div class="msg-subject">${subjects.join(' • ')}</div>` : ''}
                            <div class="msg-body">${cloneContent.innerHTML}</div>
                        `;
                        container.appendChild(card);
                    });

                    container.querySelectorAll('.msg-card').forEach(card => {
                        const shareBtn = card.querySelector('.share-msg-btn');
                        if (shareBtn) {
                            shareBtn.style.cursor = 'pointer';
                            shareBtn.onclick = (e) => {
                                e.stopPropagation();
                                shareMessageCard(card, 'Сообщение.png');
                            };
                        }
                    });

                    // Логика фильтрации
                    searchWrapper.querySelector('#msg-search').addEventListener('input', (e) => {
                        const val = e.target.value.toLowerCase().trim();
                        container.querySelectorAll('.msg-card').forEach(card => {
                            card.style.display = (val === '' || card.textContent.toLowerCase().includes(val)) ? '' : 'none';
                        });
                    });

                    span9.querySelectorAll('ul.nav.msg').forEach(m => m.remove());
                    const oldH2 = span9.querySelector('h2'); if (oldH2) oldH2.remove();

                    span9.prepend(searchWrapper);
                    searchWrapper.after(container);
                    if (pagesContainer) container.after(pagesContainer);
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
                                    displayStatus = 'ОБРАБОТКА';
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
                    span9.querySelectorAll('.submenu').forEach(menu => {
                        // Определяем тип периода (семестр или триместр) на основе текста вкладок
                        let termType = 'триместр';
                        if (menu.textContent.toLowerCase().includes('семестр')) {
                            termType = 'семестр';
                        }

                        Array.from(menu.children).forEach(child => {
                            if (child.tagName === 'A') {
                                // Убираем слово, оставляем цифру (ищет и триместр, и семестр)
                                const match = child.textContent.match(/(\d+)\s*(триместр|семестр)/i);
                                if (match) {
                                    child.textContent = match[1];
                                }
                            } else if (child.tagName === 'B') {
                                // У активной вкладки гарантируем наличие правильного слова
                                let text = child.textContent.trim();
                                if (/^\d+$/.test(text)) {
                                    child.innerHTML = text + '&nbsp;<span style="font-weight: 800;">' + termType + '</span>';
                                }
                            }
                        });
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
                        if (typeof Chart === 'undefined' && !document.querySelector('script[src*="chart.js"]')) {
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                            document.head.appendChild(script);
                        }

                        // --- ДОБАВЛЕНИЕ ПОИСКА И КНОПКИ "АНАЛИТИКА" (КАПСУЛА) ---
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'timetable-toolbar'; // Применяем стиль тулбара-капсулы
                        searchContainer.style.marginBottom = '2.4rem';

                        searchContainer.innerHTML = `
                            <div class="capsule-search-item">
                                <span class="material-icons">search</span>
                                <input type="text" class="signs-local-input" placeholder="Поиск">
                            </div>
                            <button class="toolbar-item analytics-btn" style="flex: 0 0 auto !important;">
                                <span class="material-icons">insights</span>
                                Аналитика
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
                                            sum += 5; // Считаем зачет как 5
                                            count++;
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
                                            <span class="stat-box-title">Лучший период</span>
                                            <span class="stat-box-value good" id="stat-best-term">-</span>
                                        </div>
                                        <div class="stat-box">
                                            <span class="stat-box-title">Худший период</span>
                                            <span class="stat-box-value bad" id="stat-worst-term">-</span>
                                        </div>
                                        <div class="stat-box" style="grid-column: 1 / -1;">
                                            <span class="stat-box-title">Успеваемость по предметам</span>
                                            <div id="dynamic-stats-container" style="font-size:1.4rem; margin-top:0.8rem; line-height:1.6; color: var(--color-text-primary);">
                                                <!-- Сюда вставятся динамические данные -->
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

                        searchContainer.querySelector('.analytics-btn').addEventListener('click', function() {
                            const btn = this;

                            // Хелпер для поиска библиотеки в разных контекстах (песочница vs реальная страница)
                            const getChartLib = () => {
                                if (typeof Chart !== 'undefined') return Chart;
                                if (typeof window.Chart !== 'undefined') return window.Chart;
                                if (typeof unsafeWindow !== 'undefined' && unsafeWindow.Chart) return unsafeWindow.Chart;
                                return null;
                            };

                            // Функция отрисовки
                            const renderAnalytics = () => {
                                try {
                                    // Получаем библиотеку через хелпер
                                    const ChartConstructor = getChartLib();

                                    if (!ChartConstructor) {
                                        throw new Error('Chart.js не найден ни в window, ни в unsafeWindow');
                                    }

                                    const termsData =[];
                                    const subjectsData =[];

                                    // Сбор данных
                                    document.querySelectorAll('.session-term-table-group').forEach(wrapper => {
                                        const rawTermName = wrapper.getAttribute('data-term-name');
                                        const avgStr = wrapper.getAttribute('data-term-avg');
                                        const avg = parseFloat(avgStr);

                                        if (rawTermName) {
                                            // Ищем сокращения и трим., и сем.
                                            const numMatch = rawTermName.match(/(\d+)\s*(трим|сем)/i);
                                            const termNum = numMatch ? parseInt(numMatch[1], 10) : 0;

                                            // Заменяем полные слова на аккуратные сокращения
                                            let cleanName = rawTermName.split(',')[0]
                                                .replace(/\(.*\)/, '')
                                                .replace(/триместр/i, 'трим.')
                                                .replace(/семестр/i, 'сем.')
                                                .trim();

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
                                                if (gradeText.includes('незач')) num = 2;
                                                else if (gradeText.includes('зач')) num = 5;

                                                if (!isNaN(num) && num >= 2 && num <= 5) {
                                                    subjectsData.push({ subj, grade: num });
                                                }
                                            }
                                        });
                                    });

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

                                        const count5 = subjectsData.filter(s => s.grade === 5).length;
                                        const count4 = subjectsData.filter(s => s.grade === 4).length;
                                        const count3 = subjectsData.filter(s => s.grade === 3).length;
                                        const count2 = subjectsData.filter(s => s.grade === 2).length;

                                        let statsHtml = '<div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">';

                                        if (count5 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1 1 0; min-width: 80px; background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: var(--radius-small); padding: 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                                    <span style="font-size: 2.4rem; font-weight: 800; color: var(--color-green); line-height: 1;">${count5}</span>
                                                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--color-green); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">Отлично</span>
                                                </div>`;
                                        }
                                        if (count4 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1 1 0; min-width: 80px; background: rgba(0, 122, 255, 0.1); border: 1px solid rgba(0, 122, 255, 0.3); border-radius: var(--radius-small); padding: 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                                    <span style="font-size: 2.4rem; font-weight: 800; color: var(--color-blue); line-height: 1;">${count4}</span>
                                                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--color-blue); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">Хорошо</span>
                                                </div>`;
                                        }
                                        if (count3 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1 1 0; min-width: 80px; background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: var(--radius-small); padding: 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                                    <span style="font-size: 2.4rem; font-weight: 800; color: var(--color-warning); line-height: 1;">${count3}</span>
                                                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--color-warning); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">Удовл.</span>
                                                </div>`;
                                        }
                                        if (count2 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1 1 0; min-width: 80px; background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: var(--radius-small); padding: 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                                    <span style="font-size: 2.4rem; font-weight: 800; color: var(--color-red); line-height: 1;">${count2}</span>
                                                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--color-red); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">Долги</span>
                                                </div>`;
                                        }

                                        statsHtml += '</div>';

                                        if (count5 === 0 && count4 === 0 && count3 === 0 && count2 === 0) {
                                            statsHtml = '<div style="color: var(--color-text-secondary); margin-top: 1rem;">Нет данных об оценках</div>';
                                        }

                                        document.getElementById('dynamic-stats-container').innerHTML = statsHtml;

                                        const ctx = document.getElementById('gradesChart').getContext('2d');
                                        if(window.etisChartInstance) window.etisChartInstance.destroy();

                                        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim() || '#000';
                                        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-table-border').trim() || '#ddd';

                                        // Получаем цвет напрямую из конфига, чтобы избежать проблем с CSS-переменными в Canvas
                                        const accConfig = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };
                                        const chartAccentColor = ACCENT_COLORS[accConfig.colors[0]] || '#007AFF';

                                        // Создаем график через найденный конструктор
                                        window.etisChartInstance = new ChartConstructor(ctx, {
                                            type: 'line',
                                            data: {
                                                labels: termsData.map(t => t.name),
                                                datasets:[{
                                                    label: ' Средний балл',
                                                    data: termsData.map(t => t.avg),
                                                    borderColor: chartAccentColor,
                                                    backgroundColor: chartAccentColor + '22',
                                                    borderWidth: 3,
                                                    pointBackgroundColor: chartAccentColor,
                                                    pointBorderColor: '#fff',
                                                    pointBorderWidth: 2,
                                                    pointRadius: 5,
                                                    pointHoverRadius: 7,
                                                    fill: true,
                                                    tension: 0.4,
                                                    clip: false
                                                }]
                                            },
                                            options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                layout: {
                                                    padding: { top: 15, right: 15, left: 15 }
                                                },
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: {
                                                        min: 2.0,
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
                                } catch (e) {
                                    alert('Ошибка в renderAnalytics:\n' + e.message);
                                    console.error(e);
                                }
                            };

                            // ЛОГИКА ЗАГРУЗКИ С ALERT-АМИ И ПРОВЕРКОЙ UNSAFEWINDOW
                            if (getChartLib()) {
                                renderAnalytics();
                            } else {
                                const origHtml = btn.innerHTML;
                                btn.innerHTML = '<span class="material-icons">hourglass_top</span> Загрузка...';
                                btn.style.pointerEvents = 'none';

                                const script = document.createElement('script');
                                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';

                                script.onload = () => {
                                    btn.innerHTML = origHtml;
                                    btn.style.pointerEvents = 'auto';
                                    renderAnalytics();
                                };

                                script.onerror = (e) => {
                                    btn.innerHTML = origHtml;
                                    btn.style.pointerEvents = 'auto';
                                    alert('ОШИБКА ЗАГРУЗКИ СКРИПТА!\nНе удалось скачать Chart.js.');
                                    console.error('Chart.js loading error:', e);
                                };

                                document.head.appendChild(script);
                            }
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
                                let sum = 0, count = 0, hasFail = false, hasPass = false, hasAny = false;

                                rows.forEach(row => {
                                    const subject = row.cells[0]?.textContent.toLowerCase() || "";
                                    const teacher = row.cells[3]?.textContent.toLowerCase() || "";

                                    // Показываем строку, если совпал поиск
                                    if (val === "" || subject.includes(val) || teacher.includes(val)) {
                                        row.style.display = "";
                                        visibleRowsCount++;

                                        // --- ПЕРЕСЧЕТ ОЦЕНОК НА ЛЕТУ ---
                                        const cells = row.querySelectorAll('td');
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
                                                    sum += 5; // Считаем зачет как 5
                                                    count++;
                                                }
                                                else if (!isNaN(num) && num >= 3 && num <= 5) {
                                                    sum += num;
                                                    count++;
                                                }
                                            }
                                        }
                                    } else {
                                        row.style.display = "none";
                                    }
                                });

                                // Скрытие пустых триместров или обновление их капсул
                                if (val !== "" && visibleRowsCount === 0) {
                                    header.style.setProperty('display', 'none', 'important');
                                    wrapper.style.setProperty('display', 'none', 'important');
                                } else {
                                    header.style.setProperty('display', 'flex', 'important');
                                    wrapper.style.setProperty('display', 'block', 'important');

                                    // --- ОБНОВЛЕНИЕ КАПСУЛЫ ---
                                    const capsule = header.querySelector('.subject-score-capsule');
                                    if (capsule) {
                                        const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
                                        wrapper.setAttribute('data-term-avg', avg); // Записываем для обновления графиков

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
                                    }
                                }
                            });
                        });
                    }

                    // 4. ОБРАБОТКА "ОЦЕНКИ В ТРИМЕСТРЕ"
                    if (pageMode === 'current' || (!pageMode && !span9.querySelector('.session-table-v6'))) {

                        const submenus = span9.querySelectorAll('.submenu');
                        const lastSubmenu = submenus[submenus.length - 1];

                        // --- ДОБАВЛЕНИЕ ПОИСКА И КНОПКИ "РЕЙТИНГ" (КАПСУЛА) ---
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'timetable-toolbar term-search-wrapper';
                        searchContainer.style.marginBottom = '2.4rem';

                        searchContainer.innerHTML = `
                            <div class="capsule-search-item">
                                <span class="material-icons">search</span>
                                <input type="text" class="term-local-input" placeholder="Поиск">
                            </div>
                            <button class="toolbar-item analytics-btn" style="flex: 0 0 auto !important;">
                                <span class="material-icons">emoji_events</span>
                                Топ предметов
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

                            rows.forEach(r => {
                                if (r.querySelector('th') || r === totalRow) return;

                                const cells = r.querySelectorAll('td');

                                // 1. Красиво оформляем "Вид работы" (лек, практ, лаб, сам)
                                if (cells.length > 1) {
                                    let typeText = cells[1].textContent.trim().toLowerCase();
                                    if (typeText) {
                                        // Дефолтный стиль (серый)
                                        let bg = 'var(--color-highlight)';
                                        let color = 'var(--color-text-secondary)';

                                        // Настройка цветов
                                        if (typeText === 'лек') {
                                            bg = 'rgba(0, 122, 255, 0.1)';
                                            color = 'var(--color-blue)';
                                        }
                                        else if (typeText === 'практ') {
                                            bg = 'rgba(52, 199, 89, 0.1)';
                                            color = 'var(--color-green)';
                                        }
                                        else if (typeText === 'лаб') {
                                            bg = 'rgba(255, 149, 0, 0.1)';
                                            color = 'var(--color-warning)';
                                        }
                                        else if (typeText === 'сам') {
                                            bg = 'rgba(175, 82, 222, 0.15)';
                                            color = '#AF52DE';
                                        }

                                        cells[1].innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.4rem 0.8rem; border-radius: 50px; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">${typeText}</span>`;
                                    }
                                }

                                // 2. Сокращаем "контрольное мероприятие" до "КМ" и делаем аккуратным
                                if (cells.length > 2) {
                                    let ctrlText = cells[2].textContent.trim();
                                    if (ctrlText) {
                                        ctrlText = ctrlText.replace(/контрольное мероприятие/ig, 'КМ');
                                        // Делаем первую букву заглавной (например, "Письменное КМ")
                                        ctrlText = ctrlText.charAt(0).toUpperCase() + ctrlText.slice(1);
                                        cells[2].innerHTML = `<span style="color: var(--color-text-secondary); font-size: 1.25rem; font-weight: 500; white-space: nowrap;">${ctrlText}</span>`;
                                    }
                                }

                                // 3. Считаем баллы для общей капсулы предмета
                                if (cells.length >= 7) {
                                    const curStr = cells[5].textContent.trim();
                                    const maxStr = cells[6].textContent.trim();
                                    if (curStr !== '' && curStr !== 'н') {
                                        hasAnyGrades = true;
                                        calculatedCurrent += parseInt(curStr, 10) || 0;
                                        calculatedMax += parseInt(maxStr, 10) || 0;
                                    }
                                }
                            });

                            if (totalRow) {
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
                            // --- КАЛЬКУЛЯТОР БАЛЛОВ (Прогноз) ---
                            let tooltipText = '';
                            if (calculatedMax > 0 && hasAnyGrades) {
                                if (calculatedCurrent < 41) {
                                    tooltipText = `До тройки: ${41 - calculatedCurrent} б.`;
                                } else if (calculatedCurrent < 61) {
                                    tooltipText = `До четверки: ${61 - calculatedCurrent} б.`;
                                } else if (calculatedCurrent < 81) {
                                    tooltipText = `До пятерки: ${81 - calculatedCurrent} б.`;
                                } else {
                                    tooltipText = `Отлично! 😎`;
                                }

                                const tooltip = document.createElement('div');
                                tooltip.className = 'score-tooltip';
                                tooltip.textContent = tooltipText;
                                capsule.appendChild(tooltip);
                            }
                            headerContainer.appendChild(capsule);
                        });

                        // --- ЛОГИКА ФИЛЬТРАЦИИ И ДИНАМИЧЕСКОГО ПЕРЕСЧЕТА ---
                        const filterInput = searchContainer.querySelector('.term-local-input');
                        filterInput.addEventListener('input', (e) => {
                            const val = e.target.value.toLowerCase().trim();
                            const headers = document.querySelectorAll('.term-header-group');
                            const wrappers = document.querySelectorAll('.term-subject-group');

                            headers.forEach((header, index) => {
                                const wrapper = wrappers[index];
                                if (!wrapper) return;

                                const h3 = header.querySelector('h3');
                                const subjectName = h3 ? h3.textContent.toLowerCase() : header.textContent.toLowerCase();
                                const isSubjectMatch = subjectName.includes(val);

                                const rows = Array.from(wrapper.querySelectorAll('tr'));
                                let visibleRowsCount = 0;
                                let calculatedCurrent = 0, calculatedMax = 0, hasAnyGrades = false;

                                rows.forEach(row => {
                                    if (row.querySelector('th')) {
                                        row.style.display = '';
                                        return;
                                    }

                                    const rowContent = row.textContent.toLowerCase();

                                    // Показываем строку, если совпал поиск или искали предмет целиком
                                    if (val === "" || isSubjectMatch || rowContent.includes(val)) {
                                        row.style.display = '';
                                        visibleRowsCount++;

                                        // --- ПЕРЕСЧЕТ БАЛЛОВ НА ЛЕТУ ---
                                        const cells = row.querySelectorAll('td');
                                        if (cells.length >= 7) {
                                            const curStr = cells[5].textContent.trim();
                                            const maxStr = cells[6].textContent.trim();
                                            if (curStr !== '' && curStr !== 'н') {
                                                hasAnyGrades = true;
                                                calculatedCurrent += parseInt(curStr, 10) || 0;
                                                calculatedMax += parseInt(maxStr, 10) || 0;
                                            }
                                        }
                                    } else {
                                        row.style.display = 'none';
                                    }
                                });

                                // Скрываем или обновляем предмет
                                if (val !== "" && !isSubjectMatch && visibleRowsCount === 0) {
                                    header.style.setProperty('display', 'none', 'important');
                                    wrapper.style.setProperty('display', 'none', 'important');
                                } else {
                                    header.style.setProperty('display', 'flex', 'important');
                                    wrapper.style.setProperty('display', 'block', 'important');

                                    // --- ОБНОВЛЕНИЕ КАПСУЛЫ И ТУЛТИПА ---
                                    const capsule = header.querySelector('.subject-score-capsule');
                                    if (capsule) {
                                        wrapper.setAttribute('data-score-current', calculatedCurrent); // Обновляем для топа предметов
                                        wrapper.setAttribute('data-score-max', calculatedMax);

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

                                        // Динамический прогноз
                                        let tooltipText = '';
                                        if (calculatedMax > 0 && hasAnyGrades) {
                                            if (calculatedCurrent < 41) tooltipText = `До тройки: ${41 - calculatedCurrent} б.`;
                                            else if (calculatedCurrent < 61) tooltipText = `До четверки: ${61 - calculatedCurrent} б.`;
                                            else if (calculatedCurrent < 81) tooltipText = `До пятерки: ${81 - calculatedCurrent} б.`;
                                            else tooltipText = `Отлично! 😎`;

                                            const tooltip = document.createElement('div');
                                            tooltip.className = 'score-tooltip';
                                            tooltip.textContent = tooltipText;
                                            capsule.appendChild(tooltip);
                                        }
                                    }
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

                    // --- ЛОГИКА УВЕДОМЛЕНИЙ ОБ ИЗМЕНЕНИИ ОЦЕНОК (PSEUDO-PUSH) ---
                    setTimeout(() => {
                        // 1. Создаем контейнер для уведомлений, если его нет
                        let pushContainer = document.getElementById('etis-push-container');
                        if (!pushContainer) {
                            pushContainer = document.createElement('div');
                            pushContainer.id = 'etis-push-container';
                            pushContainer.className = 'push-container';
                            document.body.appendChild(pushContainer);
                        }

                        // Функция показа уведомления
                        const showPush = (title, subject, body, type = 'info', icon = 'notifications') => {
                            const toast = document.createElement('div');
                            toast.className = `push-toast ${type}`;
                            toast.innerHTML = `
                                <div class="push-icon-wrap">
                                    <span class="material-icons">${icon}</span>
                                </div>
                                <div class="push-content">
                                    <div class="push-toast-title">${title}</div>
                                    <div class="push-subject">${subject}</div>
                                    <div class="push-detail">${body}</div>
                                </div>
                            `;

                            toast.onclick = () => {
                                toast.classList.remove('show');
                                setTimeout(() => toast.remove(), 400);
                            };

                            pushContainer.appendChild(toast);
                            requestAnimationFrame(() => {
                                setTimeout(() => toast.classList.add('show'), 50);
                            });

                            setTimeout(() => {
                                if(toast.parentNode) {
                                    toast.classList.remove('show');
                                    setTimeout(() => toast.remove(), 400);
                                }
                            }, 8000);
                        };

                        // 2. Собираем текущее состояние оценок со страницы
                        const currentSnapshot = {};

                        // Собираем данные из оберток (wrapper)
                        const allWrappers = document.querySelectorAll('.term-subject-group, .session-term-table-group');

                        allWrappers.forEach(wrapper => {
                            let name = wrapper.getAttribute('data-subject-name') || wrapper.getAttribute('data-term-name');
                            if (!name) {
                                // Фолбэк: ищем заголовок внутри
                                const h3 = wrapper.previousElementSibling;
                                if (h3 && (h3.tagName === 'H3' || h3.classList.contains('subject-header-flex'))) {
                                    name = h3.textContent.replace(/\d+\s*\/\s*\d+/, '').trim(); // Убираем цифры капсулы из заголовка если попали
                                }
                            }
                            if (!name) return;

                            // Чистим имя
                            name = name.replace(/\[.*?\]/g, '').trim();

                            const currentScore = parseInt(wrapper.getAttribute('data-score-current')) || 0;
                            const maxScore = parseInt(wrapper.getAttribute('data-score-max')) || 0;

                            // Пытаемся найти итоговую оценку (текстом)
                            let finalMark = null;

                            // Поиск текстовой оценки (Зачет/Экзамен) в таблице
                            const rows = wrapper.querySelectorAll('tr');
                            rows.forEach(row => {
                                const cells = row.querySelectorAll('td');
                                if (cells.length > 1) {
                                    // Проверка на зачет/экзамен в ячейке оценки (обычно 2-я колонка в сессиях)
                                    const possibleMark = cells[1]?.textContent.trim().toLowerCase();
                                    if (['зачет', 'зачёт', 'отлично', 'хорошо', 'удовлетворительно', 'неудовлетворительно'].some(m => possibleMark && possibleMark.includes(m))) {
                                        finalMark = cells[1].textContent.trim();
                                    }
                                    // Или числовая оценка (5, 4, 3, 2)
                                    if (['5', '4', '3', '2'].includes(possibleMark)) {
                                        finalMark = possibleMark;
                                    }
                                }
                            });

                            currentSnapshot[name] = {
                                score: currentScore,
                                max: maxScore,
                                mark: finalMark
                            };
                        });

                        // 3. Загружаем прошлое состояние
                        const storageKey = 'etis_reborn_grades_snapshot_v1';
                        const previousSnapshotJSON = localStorage.getItem(storageKey);

                        if (previousSnapshotJSON) {
                            const previousSnapshot = JSON.parse(previousSnapshotJSON);
                            let hasUpdates = false;

                            // Сравниваем
                            for (const [subject, currData] of Object.entries(currentSnapshot)) {
                                const prevData = previousSnapshot[subject];

                                // Если предмета не было раньше — это новый предмет, не спамим (или можно поздравить с началом)
                                if (!prevData) continue;

                                // А. Если изменились баллы
                                if (currData.score > prevData.score) {
                                    const diff = currData.score - prevData.score;
                                    showPush(
                                        `Новые баллы: +${diff}`,
                                        subject,
                                        `Теперь у вас ${currData.score} из ${currData.max}`,
                                        'info',
                                        'trending_up'
                                    );
                                    hasUpdates = true;
                                }

                                // Б. Если изменилась оценка
                                if (currData.mark && currData.mark !== prevData.mark) {
                                    let statusTitle = 'Выставлена оценка';
                                    let type = 'info';
                                    let icon = 'assignment_turned_in';

                                    if (currData.mark.toLowerCase().includes('зачет') || ['5','4'].includes(currData.mark)) {
                                        statusTitle = 'Успех! 🎉';
                                        type = 'success';
                                        icon = 'emoji_events';
                                    } else if (currData.mark === '2' || currData.mark.toLowerCase().includes('незачет')) {
                                        statusTitle = 'Внимание';
                                        type = 'warning';
                                        icon = 'priority_high';
                                    }

                                    showPush(statusTitle, subject, `Итог: ${currData.mark}`, type, icon);
                                    hasUpdates = true;
                                }
                            }

                            if (!hasUpdates) {
                                console.log('ETIS Reborn: Новых оценок нет');
                            }

                        } else {
                            // Первый запуск функционала
                            console.log('ETIS Reborn: Первый запуск трекинга оценок. Сохраняем базу.');
                        }

                        // 4. Сохраняем текущее состояние как эталон
                        localStorage.setItem(storageKey, JSON.stringify(currentSnapshot));

                    }, 1000); // Небольшая задержка, чтобы DOM точно отрисовался

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
                    const submenu = span9.querySelector('.submenu');

                    // 1. Инфо-текст в плашку вниз (универсально для всех вкладок)
                    const libIntro = Array.from(span9.querySelectorAll('p')).find(p => p.textContent.includes('Для чтения полных текстов'));
                    if (libIntro) {
                        libIntro.className = 'electr-description';
                        libIntro.style.marginTop = '30px';
                        span9.appendChild(libIntro);
                    }

                    // Вспомогательная функция для создания капсулы поиска
                    const createSearchCapsule = (placeholder, inputClass) => {
                        const container = document.createElement('div');
                        container.className = 'teacher-search-wrapper';
                        container.innerHTML = `
                            <div class="search-capsule">
                                <span class="material-icons search-icon">search</span>
                                <input type="text" class="search-input ${inputClass}" placeholder="${placeholder}" style="padding-left: 44px !important;">
                            </div>
                        `;
                        return container;
                    };

                    // 2. РЕЖИМ КАТАЛОГА (Поиск по всей базе)
                    if (pageMode === 'catalog') {
                        const searchWrap = span9.querySelector('.wrap');
                        if (searchWrap) {
                            const searchContainer = createSearchCapsule("Поиск", "filter-input");
                            searchWrap.replaceWith(searchContainer);

                            const input = searchContainer.querySelector('.filter-input');
                            const recordList = document.getElementById('record_list');
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
                            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
                        }
                    }
                    // 3. РЕЖИМ РЕКОМЕНДАЦИЙ (Списки по предметам)
                    else if (pageMode === 'recommend' || (!pageMode && span9.querySelector('h3'))) {
                        const searchContainer = createSearchCapsule("Поиск", "lib-local-input");
                        if (submenu) submenu.after(searchContainer);

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
                            }
                        });

                        const filterInput = searchContainer.querySelector('.lib-local-input');
                        filterInput.addEventListener('input', (e) => {
                            const val = e.target.value.toLowerCase().trim();
                            document.querySelectorAll('.library-subject-block').forEach(block => {
                                const h3Text = block.querySelector('h3').textContent.toLowerCase();
                                const rows = Array.from(block.querySelectorAll('tr'));
                                let hasVisible = false;
                                rows.forEach(row => {
                                    if (row.querySelector('th')) return;
                                    const match = val === "" || row.textContent.toLowerCase().includes(val) || h3Text.includes(val);
                                    row.style.display = match ? "" : "none";
                                    if (match) hasVisible = true;
                                });
                                block.style.display = hasVisible ? "block" : "none";
                            });
                        });
                    }
                    // 4. РЕЖИМ ВЫДАННЫХ КНИГ (История)
                    else if (pageMode === 'history' || (!pageMode && span9.querySelector('th')?.textContent.includes('Книга'))) {
                        const historyTable = span9.querySelector('table.common');
                        if (historyTable) {
                            const searchContainer = createSearchCapsule("Поиск", "history-filter-input");
                            if (submenu) submenu.after(searchContainer);

                            historyTable.classList.add('library-history-table');
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            historyTable.parentNode.insertBefore(wrapper, historyTable);
                            wrapper.appendChild(historyTable);
                            historyTable.style.minWidth = "900px";

                            const filterInput = searchContainer.querySelector('.history-filter-input');
                            filterInput.addEventListener('input', (e) => {
                                const val = e.target.value.toLowerCase().trim();
                                historyTable.querySelectorAll('tbody tr').forEach(row => {
                                    if (row.querySelector('th')) return;
                                    row.style.display = (val === "" || row.textContent.toLowerCase().includes(val)) ? "" : "none";
                                });
                            });
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

        // --- УМНЫЙ СКРОЛЛ ДЛЯ ПОДВКЛАДОК И НЕДЕЛЬ ---
        function initSmartScroll() {
                // Находим все контейнеры-капсулы
                const containers = document.querySelectorAll('.submenu, .weeks, .timetable-toolbar');

                containers.forEach(container => {
                    // Ищем активный элемент (в подвкладках это <b>, в неделях это .current)
                    const activeItem = container.querySelector('b, .current');

                    const scrollToActive = (behavior = 'smooth') => {
                        if (!activeItem) return;

                        // Идеальное вычисление центра через абсолютные координаты экрана
                        const containerRect = container.getBoundingClientRect();
                        const itemRect = activeItem.getBoundingClientRect();

                        const containerCenter = containerRect.left + (containerRect.width / 2);
                        const itemCenter = itemRect.left + (itemRect.width / 2);

                        // Высчитываем, на сколько пикселей нужно сдвинуть скролл
                        const offset = itemCenter - containerCenter;
                        const scrollTarget = container.scrollLeft + offset;

                        // Допуск в 2 пикселя (защита от микро-подергиваний)
                        if (Math.abs(offset) < 2) return;

                        container.scrollTo({
                            left: scrollTarget,
                            behavior: behavior
                        });
                    };

                    let scrollTimeout;
                    let wheelTimeout;
                    let isInteracting = false;

                    // Увеличенные задержки для более спокойного поведения (~4 секунды)
                    const startSnapbackTimer = (delay = 4000) => {
                        clearTimeout(scrollTimeout);
                        if (!isInteracting) {
                            scrollTimeout = setTimeout(() => scrollToActive('smooth'), delay);
                        }
                    };

                    // 1. Скролл колесиком / трекпадом на ПК
                    container.addEventListener('wheel', (e) => {
                        isInteracting = true; // Блокируем возврат, пока крутим
                        clearTimeout(wheelTimeout);

                        // Ждем 500мс после остановки колесика, чтобы разрешить возврат
                        wheelTimeout = setTimeout(() => {
                            isInteracting = false;
                            startSnapbackTimer(3500);
                        }, 500);

                        // Трансляция вертикального скролла в горизонтальный
                        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                            e.preventDefault();
                            container.scrollLeft += e.deltaY > 0 ? 45 : -45;
                        }
                    }, { passive: false });

                    if (activeItem) {
                        // 2. Взаимодействие мышкой (ПК)
                        container.addEventListener('mouseenter', () => { isInteracting = true; clearTimeout(scrollTimeout); });
                        container.addEventListener('mouseleave', () => { isInteracting = false; startSnapbackTimer(3500); });

                        // 3. Взаимодействие пальцем (Мобильные)
                        container.addEventListener('touchstart', () => { isInteracting = true; clearTimeout(scrollTimeout); }, { passive: true });
                        container.addEventListener('touchend', () => { isInteracting = false; startSnapbackTimer(4000); }, { passive: true });

                        // 4. Триггер при любом скролле (отрабатывает как защита)
                        container.addEventListener('scroll', () => {
                            if (!isInteracting) startSnapbackTimer(4000);
                        }, { passive: true });

                        // При открытии страницы: центрируем мгновенно, затем плавно добиваем для надежности
                        setTimeout(() => scrollToActive('auto'), 50);
                        setTimeout(() => scrollToActive('smooth'), 400);
                    }
                });
            }

        initSmartScroll();
    }
})();