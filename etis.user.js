// ==UserScript==
// @name         ЕТИС REBORN
// @namespace    http://tampermonkey.net/
// @version      2.11
// @changelog    1) Гибкая настройка компактности оценок и шеринга. 2) Фикс окон и текстовых полей на мобильных. 3) Анимация переключения вкладок и фикс отображения оригинального ЕТИСа при загрузке (Beta). 4) Оформление для расписания преподавателей (Alpha).
// @description  Глобальный редизайн ЕТИСа
// @author       dya_dya
// @icon         https://raw.githubusercontent.com/defl-orator/etis-reborn/main/img/logo.png
// @icon64       https://raw.githubusercontent.com/defl-orator/etis-reborn/main/img/logo.png
// @match        https://student.psu.ru/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @connect      *
// @updateURL    https://raw.githubusercontent.com/defl-orator/etis-reborn/refs/heads/main/etis.user.js
// @downloadURL  https://raw.githubusercontent.com/defl-orator/etis-reborn/refs/heads/main/etis.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // АНТИ-МОРГАНИЕ
    // ==========================================
    let initialTheme = localStorage.getItem('theme') || 'auto';
    if (initialTheme === 'auto') {
        initialTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('theme', initialTheme);
    const bgColor = initialTheme === 'dark' ? '#16181A' : '#F2F2F6';

    // 1. Мгновенно красим html инлайново
    document.documentElement.style.setProperty('background-color', bgColor, 'important');

    // 2. Жестко скрываем всё через стили максимально быстро
    const foucStyle = document.createElement('style');
    foucStyle.textContent = `
        html { background-color: ${bgColor} !important; }
        body { opacity: 0 !important; visibility: hidden !important; }
        body.etis-reborn-loaded { opacity: 1 !important; visibility: visible !important; transition: opacity 0.3s ease-out !important; }
    `;
    if (document.head) {
        document.head.appendChild(foucStyle);
    } else {
        document.documentElement.appendChild(foucStyle);
    }

    // 3. Перехватываем появление body и прячем инлайново
    const hideBody = () => {
        if (document.body) {
            document.body.style.setProperty('opacity', '0', 'important');
            document.body.style.setProperty('visibility', 'hidden', 'important');
            document.body.style.setProperty('background-color', bgColor, 'important');
        }
    };
    hideBody(); // На случай, если body уже есть
    const foucObserver = new MutationObserver(() => {
        if (document.body) {
            hideBody();
            foucObserver.disconnect();
        }
    });
    foucObserver.observe(document.documentElement, { childList: true });

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
	background-color: var(--color-body) !important;
}

body {
	background: var(--color-body) !important;
	color: var(--color-text-primary) !important;
	font-family: var(--font-family) !important;
    min-height: 100vh !important;
    min-height: 100dvh !important;
}

/* ПК версия скроллбара и layout */
@media (min-width: 961px) {
    html, body {
        height: 100% !important;
        overflow-y: auto !important;
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

/* Scrollbar */
::-webkit-scrollbar { 
    display: none !important; 
    width: 0 !important; 
    height: 0 !important; 
}
* { 
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}

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
.login .items {
    padding: 0 !important;
}

.login-actions {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    margin-top: 3.2rem !important;
}

#sbmt {
    margin: 0 !important;
}

.forgot-password {
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    color: var(--color-accent) !important;
    text-decoration: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    line-height: 1 !important;
}
.forgot-password:hover {
    text-decoration: underline !important;
}

.forgot-password {
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    color: var(--color-accent) !important;
    text-decoration: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    line-height: 1 !important;
}
.forgot-password:hover {
    text-decoration: underline !important;
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
        min-height: 400px !important; 
        padding: 48px 48px 40px 48px !important;
        display: flex !important;
        align-items: stretch !important;
    }

    .psu-logo {
        flex: 1 !important;
        margin-bottom: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important; 
        justify-content: flex-start !important;
        padding-right: 40px !important;
    }

    .psu-logo::before {
        height: 4.8rem !important;
        width: 4.8rem !important;
        margin-bottom: 1.6rem !important;
        background-position: left center !important;
    }

    .psu-logo::after { display: none !important; }

    .psu-logo-subtitle {
        display: block !important;
        font-size: 3.6rem !important;
        line-height: 1.2 !important;
        font-weight: 400 !important;
        color: var(--color-text-primary) !important;
    }

    .login .items {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        padding-left: 40px !important;
    }

    .login-inputs-wrapper {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        width: 100% !important;
    }

    .login-actions {
        margin-top: 4rem !important;
        margin-bottom: 0 !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 2.4rem !important;
    }

    #sbmt {
        min-width: 130px !important;
        height: 48px !important;
        padding: 0 32px !important;
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        border-radius: 24px !important;
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

/* Универсальный тумблер */
html body input[type="checkbox"].tumbler-checkbox {
    position: relative !important;
    width: 5rem !important;
    min-width: 5rem !important;
    height: 2.5rem !important;
    appearance: none !important;
    background: rgba(142, 142, 147, 0.2) !important;
    border-radius: 1.25rem !important;
    border: none !important;
    cursor: pointer !important;
    transition: background 0.3s ease !important;
    display: inline-flex !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
    box-shadow: none !important;
    margin: 0 !important;
}

html body input[type="checkbox"].tumbler-checkbox:before { display: none !important; }

html body input[type="checkbox"].tumbler-checkbox:after {
    content: '' !important;
    position: absolute !important;
    top: 0.2rem !important;
    left: 0.2rem !important;
    width: 3rem !important;
    height: 2.1rem !important;
    background: #fff !important;
    border-radius: 1.05rem !important;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), width 0.2s ease !important;
    margin: 0 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1) !important;
}

html body input[type="checkbox"].tumbler-checkbox:active:after {
    width: 3.6rem !important;
}

html body input[type="checkbox"].tumbler-checkbox:checked {
    background: var(--color-accent) !important;
}

html body input[type="checkbox"].tumbler-checkbox:checked:after {
    transform: translateX(1.6rem) !important;
}

html body input[type="checkbox"].tumbler-checkbox:checked:active:after {
    width: 3.6rem !important;
    transform: translateX(1rem) !important;
}

.timetable-toolbar label.toolbar-item {
    padding-left: 0.65rem !important;
    padding-right: 1.5rem !important;
    gap: 0.8rem !important;
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
        height: 100dvh !important;
        margin: 0 !important;
        padding-top: 60px !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 40px) + 100px) !important;
        background: var(--color-card) !important;
        z-index: 1000000 !important;
        transform: translateX(-105%) !important;
        
        transition: none !important; 
        
        overflow-y: auto !important;
        border-radius: 0 24px 24px 0 !important;
        visibility: visible !important;
        overscroll-behavior: contain !important;
    }
    
    .span3.ready-to-animate { 
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; 
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
        visibility: hidden;
        
        transition: none !important;
        
        backdrop-filter: blur(4px) !important;
        -webkit-backdrop-filter: blur(4px) !important;
    }
    
    .mobile-overlay.ready-to-animate {
        transition: opacity 0.3s ease, visibility 0.3s ease !important;
    }
    
    .mobile-overlay.active { 
        opacity: 1; 
        visibility: visible; 
    }

    .teach_plan, .slimtab_nice {
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
    padding: 2.2rem 2.2rem 0.5rem 2.2rem !important;
    gap: 10px !important;
    margin-bottom: 2.4rem !important;
    position: relative !important;
    transition: transform 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6) !important;
    cursor: pointer;
    transform-origin: center bottom;
}

.sidebar-logo img {
    height: 3.5rem !important;
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
        padding: 3.2rem 2.4rem 2.4rem 2.4rem !important;
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

form.que_form, form[name="estimate"] {
    display: flex !important;
    flex-direction: column !important;
    gap: 2rem !important;
    max-width: 800px !important;
    margin-top: 0 !important;
}

/* Карточка каждого вопроса */
form.que_form .question, form[name="estimate"] .question {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    padding: 2.4rem !important;
    box-shadow: var(--shadow-main) !important;
    margin: 0 !important;
    border: none !important;
}

/* Текст вопроса */
form.que_form .question > .text, form[name="estimate"] .question > .text {
    font-size: 1.6rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 1.6rem !important;
    line-height: 1.4 !important;
}

/* Список вариантов ответа */
form.que_form .question ul, form[name="estimate"] .question ul {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    margin: 0 !important;
    padding: 0 !important;
}

form.que_form .question li, form[name="estimate"] .question li {
    margin: 0 !important;
}

/* Плашка варианта ответа */
form.que_form .question label, form[name="estimate"] .question label {
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

form.que_form .question label:hover, form[name="estimate"] .question label:hover {
    background: var(--color-highlight-light) !important;
    border-color: var(--color-accent-active) !important;
    transform: translateX(4px) !important;
}

/* Чекбокс "Анонимно" (Одиночный вопрос) */
form.que_form .question > label[for="anonim"], form[name="estimate"] .question > label[for="anonim"] {
    display: inline-flex !important;
    width: fit-content !important;
}

/* Блок текстового комментария */
form.que_form .comment, form[name="estimate"] .comment {
    background: var(--color-card) !important;
    border-radius: var(--radius-large) !important;
    padding: 2.4rem !important;
    box-shadow: var(--shadow-main) !important;
    margin: 0 !important;
}

form.que_form .comment > label, form[name="estimate"] .comment > label {
    display: block !important;
    font-size: 1.6rem !important;
    font-weight: 800 !important;
    color: var(--color-text-primary) !important;
    margin-bottom: 1.6rem !important;
}

form.que_form .comment > textarea, form[name="estimate"] .comment > textarea {
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

form.que_form .comment > textarea:focus, form[name="estimate"] .comment > textarea:focus {
    border-color: var(--color-accent) !important;
    outline: none !important;
    box-shadow: 0 0 0 3px var(--color-accent-active) !important;
}

/* Обертка и кнопка "Отправить" */
form.que_form .button_gray, form[name="estimate"] .button_gray {
    margin-top: 1rem !important;
    width: 100% !important;
    text-align: left !important;
}

form.que_form #send_btn, form[name="estimate"] #send_btn {
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

form.que_form #send_btn:hover:not(:disabled), form[name="estimate"] #send_btn:hover:not(:disabled) {
    opacity: 0.9 !important;
    transform: translateY(-2px) !important;
}

form.que_form #send_btn:disabled, form[name="estimate"] #send_btn:disabled {
    background: var(--color-highlight) !important;
    color: var(--color-text-secondary) !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
}

form.que_form select, form[name="estimate"] select {
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

/* --- ТАБЛИЦА ОЦЕНКИ ЗАНЯТИЯ (ДЛЯ МОБИЛЬНЫХ) --- */
.question-table-wrapper {
    width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: var(--radius-large) !important;
    box-shadow: var(--shadow-main) !important;
    background: var(--color-card) !important;
    margin-bottom: 0 !important;
}
table.question_table {
    width: 100% !important;
    min-width: 850px !important; /* Форсируем ширину для свайпа */
    margin: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
}
table.question_table td.answer_text {
    font-weight: 600 !important;
    color: var(--color-text-secondary) !important;
    font-size: 1.1rem !important;
    text-transform: uppercase !important;
    line-height: 1.3 !important;
    padding: 1.2rem 1rem !important;
    text-align: center !important;
    vertical-align: middle !important;
}
table.question_table td.text {
    font-weight: 600 !important;
    color: var(--color-text-primary) !important;
    font-size: 1.3rem !important;
    padding: 1.6rem !important;
}
table.question_table td.answer_cell {
    text-align: center !important;
    vertical-align: middle !important;
    padding: 1rem !important;
}
table.question_table td.answer_cell label {
    display: inline-flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 1rem !important;
    cursor: pointer !important;
    border-radius: 50% !important;
}
table.question_table td.answer_cell input[type="radio"] {
    margin: 0 !important;
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
    border-radius: var(--radius-medium) !important;
    padding: 1.6rem 2rem !important;
    box-shadow: var(--shadow-main) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: center !important;
    text-align: left !important;
    border: 1px solid var(--color-table-border) !important;
}
.absence-stat-val {
    font-size: 2.6rem !important;
    font-weight: 800 !important;
    line-height: 1 !important;
    margin-bottom: 0.6rem !important;
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
        background: var(--color-table-header) !important;
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
    table-layout: auto !important;
    width: 100% !important;
    min-width: 700px !important; 
    border-collapse: separate !important;
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
.type-badge-holiday { color: #00BFA5 !important; }

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
    background: var(--color-highlight); padding: 1.4rem 1.6rem;
    border-radius: var(--radius-medium); display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 0.4rem;
    width: 100%; box-sizing: border-box;
}
.stat-box-title { font-size: 1.1rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; line-height: 1.2; width: 100%; }
.stat-box-value { font-size: 1.5rem; color: var(--color-text-primary); font-weight: 800; line-height: 1.2; width: 100%; }
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

/* Затемнение активной кнопки при наведении */
.timetable-toolbar .toolbar-item.is-active:hover {
    filter: brightness(0.85) !important;
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
    grid-template-columns: repeat(10, 42px);
    gap: 1.2rem;
    margin-top: 1rem;
    justify-content: flex-start;
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

/* --- СТИЛИ ДЛЯ УМНЫХ ДАТ --- */
.msg-event-link {
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dashed;
    text-decoration-color: var(--color-text-secondary);
    color: var(--color-text-primary);
    font-weight: 700;
    transition: color 0.2s ease, text-decoration-color 0.2s ease, background 0.2s ease;
    padding: 2px 4px;
    border-radius: 6px;
    margin: 0 2px;
}

.msg-event-link:hover {
    color: var(--color-accent) !important;
    text-decoration-color: var(--color-accent) !important;
    background: var(--color-accent-active);
}

/* Состояние "Уже добавлено" */
.msg-event-link.added {
    color: var(--color-accent) !important;
    text-decoration: none !important;
    background: var(--color-accent-active);
    pointer-events: auto; /* Разрешаем повторный клик */
}

/* Ховер для добавленного события (Удаление) */
.msg-event-link.added:hover {
    color: var(--color-red) !important;
    background: rgba(255, 59, 48, 0.15) !important;
    text-decoration: line-through !important;
}

/* --- ВКЛАДКИ СИНХРОНИЗАЦИИ --- */
.sync-tabs {
    display: flex;
    background: var(--color-input) !important;
    border-radius: 50px !important;
    padding: 4px !important;
    margin-bottom: 2rem !important;
    gap: 4px !important;
    border: none !important;
}
button.sync-tab {
    flex: 1;
    padding: 1rem 1.6rem !important;
    background: transparent !important;
    border: none !important;
    border-radius: 50px !important;
    box-shadow: none !important;
    color: var(--color-text-secondary) !important;
    cursor: pointer;
    font-weight: 600 !important;
    font-size: 1.3rem !important;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center !important;
}
button.sync-tab.active {
    background: var(--color-card) !important;
    color: var(--color-text-primary) !important;
    box-shadow: var(--shadow-main) !important;
}
[theme="dark"] button.sync-tab.active {
    background: var(--color-highlight-light) !important;
}
.sync-tab-content { display: none; }
.sync-tab-content.active { 
    display: block; 
    animation: fadeIn 0.2s ease; 
}

/* Цвет бейджа для консультаций */
.type-badge-cons { color: var(--color-text-secondary) !important; }

/* Затемнение активной кнопки Синхронизации при наведении */
.timetable-toolbar .toolbar-item.is-active:hover {
    filter: brightness(0.85) !important;
}

/* Кнопка удаления внешнего календаря */
.delete-cal-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.2s ease;
}
.delete-cal-btn:hover {
    background: rgba(255, 59, 48, 0.12) !important;
    color: var(--color-red) !important;
}

/* Фикс всплывающего окна в рейтинге */
#tooltip {
    max-width: 500px !important;
    width: auto !important;
    background: var(--color-card) !important;
    border: 1px solid var(--color-table-border) !important;
    border-radius: var(--radius-medium) !important;
    box-shadow: var(--shadow-dialog) !important;
    padding: 12px !important;
    z-index: 1000000 !important;
    pointer-events: none !important;
}

#tooltip table.common {
    margin: 0 !important;
    box-shadow: none !important;
    width: 100% !important;
    background: transparent !important;
}

#tooltip table.common th {
    font-size: 1rem !important;
    padding: 6px !important;
    background: var(--color-table-header) !important;
    color: var(--color-text-secondary) !important;
}

#tooltip table.common td {
    font-size: 1.1rem !important;
    padding: 6px !important;
    border-bottom: 1px solid var(--color-table-border) !important;
    background: transparent !important;
}

/* --- ВАЖНЫЕ ПАРЫ --- */
.timetable-grid tr.is-important .pair-type-badge {
    background: transparent !important;
    color: var(--color-red) !important;
}

/* Контейнер, который держит элементы по центру */
.pair-badge-wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-bottom: 2px !important;
}

.pair-type-badge {
    display: inline-block !important;
    margin-bottom: 0 !important;
    white-space: nowrap !important;
}

.pair-important-btn {
    position: relative !important; /* Возвращаем в общий поток */
    width: 0 !important; /* Скрыто по умолчанию */
    margin-right: 0 !important;
    
    cursor: pointer !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: var(--color-text-secondary) !important;
    padding: 0 !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    
    opacity: 0 !important;
    visibility: hidden !important;
    overflow: hidden !important; /* Чтобы иконка не торчала при сужении */
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

/* Уменьшаем саму иконку, чтобы она была вровень с текстом */
.pair-important-btn .material-icons {
    font-size: 1.4rem !important;
}

/* При наведении ширина увеличивается, плавно сдвигая текст вправо */
.timetable-grid tr:hover .pair-important-btn,
.pair-important-btn.is-active {
    opacity: 1 !important;
    visibility: visible !important;
    width: 16px !important;
    margin-right: 4px !important;
    pointer-events: auto !important;
}

.pair-important-btn.is-active {
    color: var(--color-red) !important;
    animation: pulse-important-bell 2s infinite;
}

.pair-important-btn:hover {
    color: var(--color-red) !important;
    transform: scale(1.15) !important;
}

@keyframes pulse-important-bell {
    0% { transform: scale(1); }
    50% { transform: scale(0.85); }
    100% { transform: scale(1); }
}

#swipe-action-bubble.active-threshold.action-important { color: var(--color-red) !important; }

/* Фикс для смартфонов */
@media (hover: none), (pointer: coarse) {
    .timetable-grid tr:hover .pair-important-btn:not(.is-active) {
        opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; width: 0 !important; margin-right: 0 !important;
    }
    .pair-important-btn.is-active {
        opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; width: 16px !important; margin-right: 4px !important;
    }
}

/* --- ШЕРИНГ ДНЯ И ЗАТЕМНЕНИЕ ПРОШЕДШИХ ПАР --- */
.day-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.share-day-btn {
    font-size: 1.8rem !important;
    color: var(--color-text-secondary);
    cursor: pointer;
    
    opacity: 0;
    visibility: hidden;
    width: 0;
    margin-left: 0;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
/* Прошедшие пары */
.timetable-grid tr.pair-passed td {
    opacity: 0.45;
    transition: opacity 0.3s ease;
}

.timetable-grid tr.pair-passed .timetable-gap-capsule {
    background: var(--color-highlight) !important;
    color: var(--color-text-secondary) !important;
    border-color: var(--color-highlight) !important;
}

/* Ховеры только для ПК (мышь) */
@media (hover: hover) and (pointer: fine) {
    .timetable-grid tr.pair-passed:hover td { 
        opacity: 0.9; 
    }
    .span9 .day h3:hover .share-day-btn {
        opacity: 1;
        visibility: visible;
        width: 18px;
        margin-left: 8px;
    }
}

#swipe-action-bubble.active-threshold.action-share { color: var(--color-blue) !important; }

/* --- SETTINGS MODAL --- */
.settings-menu-list { display: flex; flex-direction: column; gap: 8px; }
.settings-menu-btn {
    display: flex; align-items: center; width: 100%; padding: 16px; 
    background: var(--color-highlight); border: none; border-radius: var(--radius-medium); 
    color: var(--color-text-primary); font-size: 1.4rem; font-weight: 600; 
    cursor: pointer; transition: all 0.2s ease; font-family: inherit;
}
.settings-menu-btn:hover { background: var(--color-highlight-light); transform: translateY(-2px); }
.settings-menu-btn .material-icons { color: var(--color-accent); margin-right: 12px; font-size: 2.2rem; }
.settings-menu-btn .material-icons.chevron { margin-right: 0; color: var(--color-text-secondary); margin-left: auto; font-size: 2.4rem; }
.back-modal-btn:hover { color: var(--color-accent) !important; }

/* ==========================================
   УНИВЕРСАЛЬНЫЕ МОДАЛЬНЫЕ ОКНА (ШТОРКИ НА МОБИЛЬНЫХ)
   ========================================== */
#etis-settings-modal, .analytics-modal, #etis-reviews-modal {
    position: fixed !important;
    background: var(--color-card) !important;
    box-shadow: var(--shadow-dialog) !important;
    z-index: 2000001 !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    opacity: 0;
    visibility: hidden;
    border: none !important;
    font-family: var(--font-family) !important;
}

#etis-settings-overlay, .analytics-overlay, #etis-reviews-overlay {
    position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(4px) !important; -webkit-backdrop-filter: blur(4px) !important;
    z-index: 2000000 !important; opacity: 0; visibility: hidden; transition: all 0.3s ease-out !important;
}

#etis-settings-overlay.active, .analytics-overlay.active, #etis-reviews-overlay.active {
    opacity: 1 !important; visibility: visible !important;
}

/* Десктоп (По центру, широкие) */
@media (min-width: 961px) {
    #etis-settings-modal, .analytics-modal, #etis-reviews-modal {
        top: 50% !important; left: 50% !important;
        transform: translate(-50%, -50%) scale(0.95) !important;
        width: 90% !important;
        max-width: 600px !important; /* Увеличили ширину настроек */
        max-height: 85vh !important;
        border-radius: 24px !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
    #etis-settings-modal.active, .analytics-modal.active, #etis-reviews-modal.active {
        opacity: 1 !important; visibility: visible !important;
        transform: translate(-50%, -50%) scale(1) !important;
    }
    /* Для аналитики и расписания делаем окно еще шире */
    .analytics-modal { max-width: 750px !important; }
}

/* Мобильные (Шторка снизу) */
@media (max-width: 960px) {
    #etis-settings-modal, .analytics-modal, #etis-reviews-modal {
        top: auto !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        max-height: 90vh !important;
        border-radius: 24px 24px 0 0 !important;
        transform: translateY(100%) !important;
        transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease !important;
        padding-bottom: env(safe-area-inset-bottom, 20px) !important;
        margin: 0 !important;
    }
    #etis-settings-modal.active, .analytics-modal.active, #etis-reviews-modal.active {
        opacity: 1 !important; visibility: visible !important;
        transform: translateY(0) !important;
    }
    
    /* Индикатор свайпа (полоска сверху) */
    #etis-settings-modal::before, .analytics-modal::before, #etis-reviews-modal::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 4px;
        background: var(--color-scrollbar-thumb);
        border-radius: 4px;
        z-index: 10;
    }
    
    #etis-settings-modal .ui-widget-header, 
    .analytics-modal .ui-widget-header, 
    #etis-reviews-modal .ui-widget-header {
        padding-top: 24px !important; /* Отступ под полоску */
        border-radius: 24px 24px 0 0 !important;
    }
}

/* Скролл внутри контента модалки */
#etis-settings-modal .ui-dialog-content,
.analytics-modal .ui-dialog-content,
#etis-reviews-modal .ui-dialog-content {
    overflow-y: auto !important;
    flex: 1 1 auto !important;
}

@media (max-width: 960px) {
    #etis-settings-modal .ui-dialog-content,
    .analytics-modal .ui-dialog-content,
    #etis-reviews-modal .ui-dialog-content {
        scrollbar-width: none !important;
    }
    #etis-settings-modal .ui-dialog-content::-webkit-scrollbar,
    .analytics-modal .ui-dialog-content::-webkit-scrollbar,
    #etis-reviews-modal .ui-dialog-content::-webkit-scrollbar {
        display: none !important; 
    }
}

/* Макет окна настроек для ПК (Сайдбар + Контент) */
@media (min-width: 961px) {
    #etis-settings-modal {
        max-width: 850px !important;
        height: 60vh !important;
        min-height: 500px !important;
    }
    .settings-layout {
        display: flex;
        height: 100%;
        width: 100%;
    }
    .settings-sidebar {
        width: 250px;
        min-width: 250px;
        border-right: 1px solid var(--color-table-border);
        padding: 2.4rem 1.6rem;
        background: var(--color-highlight);
        display: flex !important;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
    }
    .settings-content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .settings-content-scroll {
        flex: 1;
        padding: 2.4rem;
        overflow-y: auto;
    }
    /* Скрываем мобильную шапку и кнопку "Назад" на ПК */
    .settings-mobile-header, .mobile-main-title { display: none !important; }
}

/* Макет окна настроек для мобильных */
@media (max-width: 960px) {
    .settings-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .settings-sidebar {
        padding: 2.4rem;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .settings-content-area {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .settings-content-scroll {
        padding: 2.4rem;
        overflow-y: auto;
    }
    .hidden-on-mobile { display: none !important; }
    .desktop-main-title { display: none !important; }
}

/* Кнопки сайдбара настроек */
#etis-settings-modal .settings-sidebar-btn {
    display: flex !important; 
    flex-direction: row !important;
    align-items: center !important; 
    justify-content: flex-start !important;
    width: 100% !important; 
    max-width: 100% !important;
    padding: 12px 16px !important;
    margin: 0 0 8px 0 !important;
    background: transparent !important; 
    border: none !important; 
    border-radius: var(--radius-medium) !important;
    color: var(--color-text-primary) !important; 
    font-size: 1.4rem !important; 
    font-weight: 600 !important;
    cursor: pointer !important; 
    transition: all 0.2s ease !important; 
    font-family: inherit !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    height: 48px !important;
}

#etis-settings-modal .settings-sidebar-btn:hover { 
    background: var(--color-table-highlight) !important; 
}

/* Защита внутренних спанов от глобальных стилей */
#etis-settings-modal .settings-sidebar-btn span {
    display: block !important;
    border: none !important;
    padding: 0 !important;
}

#etis-settings-modal .settings-sidebar-btn .sidebar-btn-text { 
    flex-grow: 1 !important; 
    text-align: left !important; 
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    color: inherit !important;
}

#etis-settings-modal .settings-sidebar-btn .material-icons { 
    flex-shrink: 0 !important;
    margin-right: 12px !important; 
    font-size: 2.2rem !important; 
    color: var(--color-text-secondary) !important; 
}

#etis-settings-modal .settings-sidebar-btn .chevron { 
    flex-shrink: 0 !important;
    margin-right: 0 !important; 
    margin-left: auto !important; 
}

#etis-settings-modal .settings-sidebar-btn.active { 
    background: var(--color-accent) !important; 
    color: var(--color-text-primary-invert) !important; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; 
}

#etis-settings-modal .settings-sidebar-btn.active .material-icons {
    color: var(--color-text-primary-invert) !important;
}

#etis-settings-modal .settings-sidebar-btn.active .chevron {
    display: none !important; 
}

.appearance-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 3.2rem;
}
.appearance-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1.2rem;
    text-align: left;
    width: 100%;
}
.color-picker-controls-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    margin-bottom: 1.6rem;
    width: 100%;
}

@media (max-width: 600px) {
    .color-picker-grid {
        grid-template-columns: repeat(6, 42px);
        gap: 0.8rem;
        justify-content: flex-start;
    }
    .appearance-section { align-items: flex-start !important; }
    .appearance-title { text-align: left !important; }
    .color-picker-controls-row { justify-content: flex-start !important; }
}

/* 1. Блокировка фона на уровне HTML и BODY */
html:has(body.modal-open-body),
body.modal-open-body {
    overflow: hidden !important;
    overscroll-behavior: none !important;
}

/* 2. Оверлеям (темному фону) полностью запрещаем свайпы, чтобы они не тянули страницу */
#etis-settings-overlay, .analytics-overlay, #etis-reviews-overlay {
    touch-action: none !important;
    overscroll-behavior: none !important;
}

/* 3. Модальным окнам жестко запрещаем передавать скролл фону */
#etis-settings-modal, .analytics-modal, #etis-reviews-modal {
    overscroll-behavior: contain !important;
}

/* 4. Шапкам окон тоже запрещаем скроллить фон при смахивании */
#etis-settings-modal .ui-widget-header, 
.analytics-modal .ui-widget-header, 
#etis-reviews-modal .ui-widget-header {
    touch-action: none !important;
}

/* 5. Разрешаем нормальный скролл ТОЛЬКО внутри контента модалок */
#etis-settings-modal .ui-dialog-content,
.analytics-modal .ui-dialog-content,
#etis-reviews-modal .ui-dialog-content,
.settings-content-scroll {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important; 
    flex: 1 1 auto !important;
    min-height: 0 !important; 
    overscroll-behavior: contain !important;
}

/* ==========================================
    ФИКС АВТОМАТИЧЕСКОГО ЗУМА НА МОБИЛЬНЫХ
    ========================================== */
@media (max-width: 960px) {
    input[type="text"],
    input[type="password"],
    input[type="email"],
    input[type="number"],
    input[type="time"],
    input[type="date"],
    textarea,
    select,
    .search-input,
    .signs-local-input,
    .term-local-input,
    .lib-local-input,
    .history-filter-input,
    .custom-pair-input-group > input,
    .custom-pair-input-group > select,
    .note-modal-textarea {
        font-size: 16px !important;
    }
}
    `;

    // Безопасное внедрение элементов
    const safeAppend = (element) => {
        if (document.head) {
            document.head.appendChild(element);
        } else {
            document.documentElement.appendChild(element);
        }
    };

    // Внедряем стили
    const injectStyles = (css) => {
        const style = document.createElement('style');
        style.innerHTML = css;
        safeAppend(style);
    };
    injectStyles(styles);

    // ==========================================
    // 2. ВНЕДРЕНИЕ JS ЛОГИКИ
    // ==========================================

    const ACCENT_COLORS = {
        // Базовые 25 цветов
        blue: '#007AFF', green: '#34C759', orange: '#FF9500', red: '#FF3B30', pink: '#FF2D55',
        lightblue: '#5AC8FA', mint: '#00C7BE', yellow: '#FFCC00', lightpurple: '#E58FFF', rose: '#FF94A5',
        indigo: '#5856D6', teal: '#30B0C7', lime: '#AEEA00', cyan: '#00BCD4', magenta: '#E91E63',
        deeporange: '#FF5722', brown: '#A2845E', slate: '#708090', cobalt: '#3F51B5', crimson: '#DC143C',
        darkblue: '#1A237E', darkgreen: '#1B5E20', chocolate: '#5D4037', darkred: '#800000', graphite: '#333333',
        purple: '#9C27B0', deepviolet: '#673AB7', bluegrey: '#607D8B', black: '#212121', coral: '#FF6E40'
    };

    const COLOR_ORDER =[
        'red', 'crimson', 'darkred', 'pink', 'rose', 'magenta', 'purple', 'deepviolet', 'indigo', 'lightpurple',
        'darkblue', 'cobalt', 'blue', 'lightblue', 'cyan', 'teal', 'mint', 'darkgreen', 'green', 'lime',
        'yellow', 'orange', 'deeporange', 'coral', 'brown', 'chocolate', 'bluegrey', 'slate', 'graphite', 'black'
    ];

    const GENERAL_CONFIG_KEY = 'etis_general_config';
    let savedConfig = JSON.parse(localStorage.getItem(GENERAL_CONFIG_KEY)) || {};
    const defaultCompactConfig = { showWorkType: true, showControlType: false, showPassScore: true, showRating: false, showDate: true, showTeacher: false };
    let generalConfig = { dimPastPairs: true, shortAudFormat: false, hideDaysOff: false, showSunday: false, absoluteScores: false, compactGrades: false, watermark: true, datesLeft: false, generateQR: true, ...savedConfig };
    generalConfig.compactGradesConfig = { ...defaultCompactConfig, ...(generalConfig.compactGradesConfig || {}) };

    function applyAccentColor() {
        const config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };

        let c1 = ACCENT_COLORS[config.colors[0]] || ACCENT_COLORS.blue;
        let c2 = config.colors[1] ? ACCENT_COLORS[config.colors[1]] : c1;

        let styleEl = document.getElementById('etis-custom-accent');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'etis-custom-accent';
            safeAppend(styleEl);
        }

        const hexToRgba = (hex, alpha) => {
            let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
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
            .span3 > .nav.nav-tabs.nav-stacked > li.active > a, .weeks .week.current, .submenu b,
            .answer-btn-custom, #sbmt, .gpa-capsule, .mobile-menu-btn, .timetable-toolbar .toolbar-item.is-active,
            form.que_form #send_btn, .badge.ctl, .jour-info-group {
                background: var(--bg-accent) !important; border: none !important; color: #fff !important;
            }
            ${config.isGradient ? `
            .msg-sender, .msg-sender .material-icons, .file-attachment-link .material-icons, .teacher-name-link,
            .review-dis-link, .tpr_part > a, .theme a, .logo-say-hey, .accent-stat,
            #swipe-action-bubble.active-threshold.action-note, #swipe-action-bubble.active-threshold.action-note .material-icons,
            #swipe-action-bubble.active-threshold.action-add, #swipe-action-bubble.active-threshold.action-add .material-icons {
                background: var(--bg-accent) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; color: transparent !important; display: inline-block;
            }
            .weeks .week.actual-week:not(.current) > a, .stat-box-value, .msg-sender { display: inline-flex !important; }
            ` : `
            .msg-sender, .msg-sender .material-icons, .file-attachment-link .material-icons, .teacher-name-link,
            .review-dis-link, .tpr_part > a, .theme a, .logo-say-hey, .accent-stat,
            #swipe-action-bubble.active-threshold.action-note, #swipe-action-bubble.active-threshold.action-add,
            #swipe-action-bubble.active-threshold.action-note .material-icons { color: var(--color-accent) !important; }
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

    // --- ФИКС ЦВЕТА БРАУЗЕРНОЙ ПАНЕЛИ НАВИГАЦИИ И СТАТУС-БАРА ---
    function updateBrowserNavColor() {
        const isDark = document.documentElement.getAttribute('theme') === 'dark';
        const color = isDark ? '#16181A' : '#F2F2F6'; // Цвета нашего var(--color-body)
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            safeAppend(metaTheme);
        }
        metaTheme.content = color;
    }
    // Следим за сменой темы и мгновенно обновляем цвет браузера
    new MutationObserver(updateBrowserNavColor).observe(document.documentElement, { attributes: true, attributeFilter: ['theme'] });
    updateBrowserNavColor();

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
        let meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'viewport';
            safeAppend(meta);
        }
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // Запускаем при загрузке документа
    function init() {
        addViewport();
        setIcon();
        stylePages();
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (document.body) {
                    // Убираем жесткие инлайновые стили
                    document.body.style.removeProperty('opacity');
                    document.body.style.removeProperty('visibility');
                    document.body.style.removeProperty('background-color');
                    
                    // Запускаем плавную CSS-анимацию проявления
                    document.body.classList.add('etis-reborn-loaded');
                }
            });
        });
        
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
        safeAppend(icon);
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

    function loadVersionHistory() {
        const container = document.getElementById('version-history-list');
        if (!container) return;

        const apiUrl = 'https://api.github.com/repos/defl-orator/etis-reborn/commits?path=etis.user.js&per_page=10';

        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            onload: async function(res) {
                if (res.status !== 200) {
                    container.innerHTML = '<div style="color:var(--color-red); text-align:center;">Не удалось загрузить историю.</div>';
                    return;
                }
                
                const commits = JSON.parse(res.responseText);
                const history = [];
                const seenVersions = new Set();

                const fetchPromises = commits.map(commit => {
                    return new Promise((resolve) => {
                        const rawUrl = `https://raw.githubusercontent.com/defl-orator/etis-reborn/${commit.sha}/etis.user.js`;
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: rawUrl,
                            onload: (rawRes) => {
                                const text = rawRes.responseText;
                                const vMatch = text.match(/@version\s+([\d\.]+)/);
                                const clMatch = text.match(/@changelog\s+(.*)/);
                                if (vMatch) {
                                    resolve({
                                        version: vMatch[1],
                                        changelog: clMatch ? clMatch[1].trim() : 'Без описания',
                                        date: new Date(commit.commit.author.date).toLocaleDateString('ru-RU'),
                                        url: rawUrl
                                    });
                                } else {
                                    resolve(null);
                                }
                            },
                            onerror: () => resolve(null)
                        });
                    });
                });

                const results = await Promise.all(fetchPromises);

                results.forEach(item => {
                    if (item && !seenVersions.has(item.version)) {
                        seenVersions.add(item.version);
                        history.push(item);
                    }
                });

                if (history.length === 0) {
                    container.innerHTML = '<div style="color:var(--color-text-secondary); text-align:center;">История пуста</div>';
                    return;
                }

                let html = '';
                history.forEach(item => {
                    const isCurrent = item.version === GM_info.script.version;
                    
                    html += `
                        <div style="background: var(--color-highlight); padding: 1.6rem; border-radius: var(--radius-medium); display: flex; flex-direction: column; gap: 1rem; border: 1px solid ${isCurrent ? 'var(--color-accent)' : 'transparent'}; position: relative;">
                            ${isCurrent ? '<div style="position:absolute; top:-10px; right:16px; background:var(--color-accent); color:#fff; font-size:1rem; font-weight:800; padding:2px 8px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2);">УСТАНОВЛЕНА</div>' : ''}
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 800; font-size: 1.6rem; color: var(--color-text-primary); line-height: 1;">v${item.version}</div>
                                    <div style="color: var(--color-text-secondary); font-size: 1.2rem; font-weight: 500; margin-top: 4px;">${item.date}</div>
                                </div>
                                <a href="${item.url}" target="_blank" class="answer-btn-custom" style="padding: 6px 12px; font-size: 1.2rem; text-decoration: none; border-radius: 50px; background: var(--color-card) !important; color: var(--color-text-primary) !important; border: 1px solid var(--color-table-border) !important; box-shadow: var(--shadow-main) !important; transition: transform 0.2s;">
                                    <span class="material-icons" style="font-size: 18px; color: var(--color-text-secondary); margin-right: 4px;">history</span>Откат
                                </a>
                            </div>
                            <div style="font-size: 1.3rem; color: var(--color-text-primary); line-height: 1.5;">
                                ${item.changelog}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
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

    function loadVersionHistory() {
        const container = document.getElementById('version-history-list');
        if (!container) return;
        container.innerHTML = '<div style="display:flex; align-items:center; gap:12px; padding: 1rem 0; color:var(--color-text-secondary); font-size:1.5rem; font-weight:600;"><span class="material-icons" style="animation:spin 1s linear infinite;">sync</span>Загрузка истории...</div>';

        // Запрашиваем последние 10 коммитов для нашего файла
        const apiUrl = 'https://api.github.com/repos/defl-orator/etis-reborn/commits?path=etis.user.js&per_page=10';

        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            onload: async function(res) {
                if (res.status !== 200) {
                    container.innerHTML = '<div style="color:var(--color-red); text-align:left; padding: 1rem 0; font-size: 1.4rem;">Не удалось загрузить историю версий. Попробуйте позже.</div>';
                    return;
                }
                
                const commits = JSON.parse(res.responseText);
                const history = [];
                const seenVersions = new Set();

                // Параллельно загружаем сырые файлы по SHA коммита, чтобы прочитать заголовки
                const fetchPromises = commits.map(commit => {
                    return new Promise((resolve) => {
                        const rawUrl = `https://raw.githubusercontent.com/defl-orator/etis-reborn/${commit.sha}/etis.user.js`;
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: rawUrl,
                            onload: (rawRes) => {
                                const text = rawRes.responseText;
                                const vMatch = text.match(/@version\s+([\d\.]+)/);
                                const clMatch = text.match(/@changelog\s+(.*)/);
                                if (vMatch) {
                                    resolve({
                                        version: vMatch[1],
                                        changelog: clMatch ? clMatch[1].trim() : 'Без описания',
                                        date: new Date(commit.commit.author.date).toLocaleDateString('ru-RU'),
                                        url: rawUrl // Прямая ссылка на скачивание/установку конкретной версии
                                    });
                                } else {
                                    resolve(null);
                                }
                            },
                            onerror: () => resolve(null)
                        });
                    });
                });

                const results = await Promise.all(fetchPromises);

                results.forEach(item => {
                    if (item && !seenVersions.has(item.version)) {
                        seenVersions.add(item.version);
                        history.push(item);
                    }
                });

                if (history.length === 0) {
                    container.innerHTML = '<div style="color:var(--color-text-secondary); text-align:left; font-size: 1.4rem; padding: 1rem 0;">История версий пуста</div>';
                    return;
                }

                let html = '';
                history.forEach(item => {
                    // Выделяем текущую версию, если она совпадает
                    const isCurrent = item.version === GM_info.script.version;
                    const borderStyle = isCurrent ? 'border: 2px solid var(--color-accent);' : 'border: 1px solid var(--color-table-border);';
                    
                    html += `
                        <div style="background:var(--color-card); padding:1.6rem; border-radius:12px; margin-bottom:1.2rem; text-align:left; ${borderStyle}">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
                                <div style="display:flex; align-items:baseline; gap:8px;">
                                    <span style="font-weight:800; font-size:1.5rem; color:var(--color-text-primary);">v${item.version}</span>
                                    <span style="color:var(--color-text-secondary); font-size:1.2rem; font-weight:600;">от ${item.date}</span>
                                    ${isCurrent ? '<span style="background:var(--color-accent-active); color:var(--color-accent); padding:2px 6px; border-radius:4px; font-size:1rem; font-weight:800; margin-left:4px;">ТЕКУЩАЯ</span>' : ''}
                                </div>
                                <a href="${item.url}" target="_blank" class="answer-btn-custom" style="padding: 6px 14px; font-size: 1.2rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; border-radius: 50px;">
                                    <span class="material-icons" style="font-size: 16px;">file_download</span> Установить
                                </a>
                            </div>
                            <div style="font-size:1.3rem; color:var(--color-text-primary); line-height:1.5; opacity: 0.9;">
                                ${item.changelog}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        });
    }

    function getUpdateHTML() {
        const cur = GM_info.script.version;
        
        if (updateState.status === 'loading') return `<div style="padding:2rem 0;text-align:left;display:flex;align-items:center;gap:12px;"><span class="material-icons" style="font-size:32px;color:var(--color-accent);animation:spin 1s linear infinite;">sync</span><div style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Проверка обновлений...</div></div><style>@keyframes spin{100%{transform:rotate(360deg)}}</style>`;
        
        if (updateState.status === 'error') return `<div style="text-align:left;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;"><span class="material-icons" style="font-size:36px;color:var(--color-red);">error_outline</span><div style="font-size:1.6rem;font-weight:700;color:var(--color-text-primary);">Ошибка: ${updateState.details}</div></div><button id="retry-update" class="answer-btn-custom" style="width:100%;justify-content:center;">Повторить</button></div>`;

        let mainHtml = '';

        if (updateState.hasUpdate) {
            const testLabel = IS_TEST_MODE ? '<div style="color:var(--color-red); font-weight:800; font-size:1.1rem; margin-bottom:8px; text-transform:uppercase;">Test Mode</div>' : '';

            let actionButtons = '';
            if (isIOS) {
                const encodedUrl = encodeURIComponent(UPDATE_URL);
                const stayDeepLink = `stay://x-callback-url/open-install?url=${encodedUrl}`;
                actionButtons = `
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <a href="${stayDeepLink}" id="update-stay" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-accent)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                            <span class="material-icons">open_in_new</span> Обновить через Stay
                        </a>
                        <a href="${UPDATE_URL}" target="_blank" id="update-browser" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-green)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                            <span class="material-icons">public</span> В браузере
                        </a>
                    </div>
                `;
            } else {
                actionButtons = `
                    <a href="${UPDATE_URL}" target="_blank" id="update-confirm" class="answer-btn-custom" style="width:100%;justify-content:center;background:var(--color-green)!important;color:#fff!important;font-weight:700; gap:8px; text-decoration:none; display:inline-flex; box-sizing:border-box;">
                        <span class="material-icons">system_update_alt</span> Обновить сейчас
                    </a>
                `;
            }

            mainHtml = `
                <div style="text-align:left;">
                    ${testLabel}
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:2rem;">
                        <div style="background:rgba(52, 199, 89, 0.15); padding:12px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons" style="font-size:36px;color:var(--color-green);">system_update</span>
                        </div>
                        <div>
                            <div style="font-size:2rem;font-weight:800;color:var(--color-text-primary);line-height:1.2;">Обновление!</div>
                            <div style="font-size:1.3rem;color:var(--color-text-secondary);font-weight:600;margin-top:4px;">Доступна новая версия</div>
                        </div>
                    </div>

                    <div style="background:var(--color-highlight);padding:1.6rem;border-radius:12px;margin-bottom:2rem;border:1px solid var(--color-table-border);">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--color-table-border);">
                            <div>
                                <div style="font-size:1.2rem;color:var(--color-text-secondary);margin-bottom:2px;">Новая версия</div>
                                <div style="font-size:1.5rem;font-weight:800;color:var(--color-text-primary);">${updateState.remoteVer}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:1.2rem;color:var(--color-text-secondary);margin-bottom:2px;">У вас</div>
                                <div style="font-size:1.5rem;font-weight:800;color:var(--color-text-secondary);">${cur}</div>
                            </div>
                        </div>

                        ${updateState.remoteLog ? `
                            <div style="font-size:1.2rem;color:var(--color-text-secondary);margin-bottom:6px;font-weight:600;text-transform:uppercase;">Что нового:</div>
                            <div style="font-size:1.35rem;line-height:1.5;color:var(--color-text-primary);">
                                ${updateState.remoteLog}
                            </div>
                        ` : ''}
                    </div>

                    ${actionButtons}
                </div>`;
        } else {
            mainHtml = `
                <div style="text-align:left;">
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:2rem;">
                        <div style="background:var(--color-accent-active); padding:12px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons" style="font-size:36px;color:var(--color-accent);">check_circle</span>
                        </div>
                        <div>
                            <div style="font-size:2rem;font-weight:800;color:var(--color-text-primary);line-height:1.2;">Всё актуально</div>
                            <div style="color:var(--color-text-secondary);margin-top:4px;font-size:1.3rem;font-weight:500;">У вас установлена v${cur}</div>
                        </div>
                    </div>
                </div>`;
        }

        return mainHtml + `
            <div style="margin-top: 2.4rem;">
                <button id="open-history-btn" class="settings-menu-btn" style="background: transparent; border: 1px solid var(--color-table-border); padding: 12px 16px;">
                    <span class="material-icons" style="color: var(--color-text-secondary);">history</span>
                    История версий
                    <span class="material-icons chevron">chevron_right</span>
                </button>
            </div>
        `;
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

        // Защита от "проезда" сайдбара при загрузке:
        requestAnimationFrame(() => {
            setTimeout(() => {
                sidebar.classList.add('ready-to-animate');
                overlay.classList.add('ready-to-animate');
            }, 50);
        });

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
                if (isSidebarScrolling) {
                    e.preventDefault();
                    return;
                }

                sidebar.classList.remove('mobile-active');
                overlay.classList.remove('active');
                menuBtn.classList.remove('open');
                menuBtn.classList.add('is-loading');
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

        const daysMap =["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        const todayName = daysMap[currentDay];

        document.querySelectorAll('.day').forEach(dayBlock => {
            const dayHeaderName = dayBlock.querySelector('.day-name');
            if (!dayHeaderName) return;

            // Очищаем ВСЕ старые точки и иконки статуса в этом дне
            dayBlock.querySelectorAll('.live-dot, .day-status-icon').forEach(dot => dot.remove());

            if (dayHeaderName.textContent.trim() === todayName) {
                let hasRealPairs = false;
                let lastPairEnd = 0;
                let firstPairStart = 24 * 60; // Для отслеживания начала первой пары

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

                    hasRealPairs = true;
                    const parts = startTimeStr.split(':');
                    const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                    const endMins = startMins + duration;

                    if (startMins < firstPairStart) firstPairStart = startMins;
                    if (endMins > lastPairEnd) lastPairEnd = endMins;

                    let type = "";
                    if (currentTime >= startMins && currentTime <= endMins) {
                        type = (endMins - currentTime <= 15) ? 'ending' : 'active';
                    } else if (startMins - currentTime <= 20 && startMins - currentTime > 0) {
                        type = 'soon';
                    }

                    // --- АВТО-СБРОС ВАЖНОЙ ПАРЫ ПРИ ЕЁ НАЧАЛЕ ---
                    if (currentTime >= startMins) {
                        const disContainer = row.querySelector('.pair_info .dis');
                        const numTd = row.querySelector('.pair_num');
                        if (disContainer && numTd) {
                            const targetEl = disContainer.querySelector('a') || disContainer;
                            const cleanSubjectName = targetEl.textContent.trim();
                            const dayDateStr = dayBlock.querySelector('.day-date')?.textContent.trim() || 'UnknownDate';
                            
                            let rawPairNum = "";
                            Array.from(numTd.childNodes).forEach(n => {
                                if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) {
                                    rawPairNum = n.nodeValue.trim();
                                }
                            });
                            if (!rawPairNum) rawPairNum = numTd.textContent.trim().split(' ')[0] + ' пара';
                            
                            const pairId = `${dayDateStr}_${rawPairNum}_${cleanSubjectName}`;
                            let imp = JSON.parse(localStorage.getItem('etis_important_pairs_v1') || '[]');
                            if (imp.includes(pairId)) {
                                imp = imp.filter(id => id !== pairId);
                                localStorage.setItem('etis_important_pairs_v1', JSON.stringify(imp));
                                
                                // Мгновенно убираем стили
                                row.classList.remove('is-important');
                                const impBtn = numTd.querySelector('.pair-important-btn');
                                if (impBtn) {
                                    impBtn.classList.remove('is-active');
                                    impBtn.innerHTML = '<span class="material-icons" style="font-size:1.6rem;">notifications_none</span>';
                                }
                            }
                        }
                    }

                    if (type) {
                        const dot = document.createElement('span');
                        dot.className = `live-dot ${type}`;

                        if (row.classList.contains('timetable-gap-row')) {
                            row.querySelector('.timetable-gap-capsule')?.appendChild(dot);
                        } else {
                            const timeElInner = row.querySelector('.pair_num .eval');
                            if (timeElInner) {
                                timeElInner.appendChild(dot);
                            } else {
                                row.querySelector('.pair_num')?.appendChild(dot);
                            }
                        }
                    }
                });

                // --- Умная индикация для заголовка текущего дня ---
                
                // 1. Всегда добавляем статичный зеленый кружок
                const dayDot = document.createElement('span');
                dayDot.className = 'day-status-icon';
                dayDot.style.cssText = 'display: inline-block; width: 8px; height: 8px; background-color: var(--color-green); border-radius: 50%; flex-shrink: 0;';

                // 2. Определяем пояснительную иконку
                let iconName = '';
                let iconTitle = '';
                let iconColor = 'var(--color-text-secondary)';

                if (!hasRealPairs) {
                    iconName = 'free_breakfast';
                    iconTitle = 'Выходной';
                    iconColor = 'var(--color-green)';
                } else if (currentTime > lastPairEnd) {
                    iconName = 'done_all';
                    iconTitle = 'Пары закончились';
                } else if (currentTime < firstPairStart) {
                    iconName = 'schedule';
                    iconTitle = 'Скоро пары';
                    iconColor = 'var(--color-yellow)';
                } else {
                    iconName = 'play_circle_outline';
                    iconTitle = 'Пары идут';
                    iconColor = 'var(--color-accent)';
                }

                const icon = document.createElement('span');
                icon.className = 'material-icons day-status-icon';
                icon.style.cssText = `font-size: 1.8rem; color: ${iconColor}; flex-shrink: 0;`;
                icon.textContent = iconName;
                icon.title = iconTitle;
                
                // Находим обертку текста, чтобы иконка статуса ставилась после всей фразы (с датой)
                let targetEl = dayHeaderName.closest('.day-title-text-wrap') || dayHeaderName;
                
                targetEl.after(icon);
                targetEl.after(dayDot);
            }
        });
    }

    // --- ФУНКЦИЯ ОКНА "СООБЩИТЬ ОБ ОШИБКЕ" ---
    function openUserscriptBugModal() {
        window.open('https://etisreborn.ru/#bugreport', '_blank');
    }

    function refreshModalUI() {
        const modal = document.getElementById('etis-settings-modal');
        if (modal && modal.classList.contains('active')) {
            const wrapper = modal.querySelector('#version-content-wrapper');
            if (wrapper) {
                wrapper.innerHTML = getUpdateHTML();

                const historyBtn = wrapper.querySelector('#open-history-btn');
                if (historyBtn) {
                    historyBtn.onclick = () => {
                        openSettingsModal('history'); 
                    };
                }

                const setupAutoReload = () => {
                    // Плавно закрываем окно перед перезагрузкой
                    modal.classList.remove('active');
                    const overlay = document.getElementById('etis-settings-overlay');
                    if (overlay) overlay.classList.remove('active');

                    sessionStorage.setItem('etis_update_pending', 'true');
                    const onFocusOrVisible = () => {
                        setTimeout(() => {
                            if (document.visibilityState === 'visible' && document.hasFocus()) {
                                if (sessionStorage.getItem('etis_update_pending')) {
                                    sessionStorage.removeItem('etis_update_pending');
                                    window.location.reload();
                                }
                            }
                        }, 200);
                    };
                    setTimeout(() => {
                        document.addEventListener('visibilitychange', onFocusOrVisible);
                        window.addEventListener('focus', onFocusOrVisible);
                    }, 1500);
                };

                const btnStay = wrapper.querySelector('#update-stay');
                if (btnStay) btnStay.addEventListener('click', setupAutoReload);

                const btnBrowser = wrapper.querySelector('#update-browser');
                if (btnBrowser) btnBrowser.addEventListener('click', setupAutoReload);

                const btnConfirm = wrapper.querySelector('#update-confirm');
                if (btnConfirm) btnConfirm.addEventListener('click', setupAutoReload);

                const retry = wrapper.querySelector('#retry-update');
                if (retry) retry.onclick = () => initAutoUpdateCheck(true);
            }
        }
    }

    function openSettingsModal(view = 'main') {
        let overlay = document.getElementById('etis-settings-overlay');
        let modal = document.getElementById('etis-settings-modal');
        let requiresReloadOnClose = false;

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'etis-settings-overlay';
            document.body.appendChild(overlay);
        }
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'etis-settings-modal';
            document.body.appendChild(modal);
        }

        const closeAll = () => { 
            overlay.classList.remove('active'); 
            modal.classList.remove('active'); 
            document.body.classList.remove('modal-open-body');
            
            if (requiresReloadOnClose) {
                setTimeout(() => window.location.reload(), 300);
            }
        };
        overlay.onclick = closeAll;

        const renderView = (currentView) => {
            // На ПК при открытии 'main' сразу показываем расписание
            if (currentView === 'main' && window.innerWidth > 960) currentView = 'timetable';

            let title = '';
            let contentHTML = '';
            let backTarget = 'main';

            // --- КОНТЕНТ ВКЛАДОК ---
            if (currentView === 'general') {
                title = 'Общие';
                contentHTML = `
                    <div style="margin: 0;">
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 12px;">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Генерация QR-кода</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Создавать QR-код при экспорте онлайн-занятия</span>
                            </div>
                            <input type="checkbox" id="setting-generate-qr" class="tumbler-checkbox" ${generalConfig.generateQR ? 'checked' : ''}>
                        </label>
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition);">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Вотермарка на скриншотах</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Даёт возможность поделиться сайтом с установкой расширения.</span>
                            </div>
                            <input type="checkbox" id="setting-watermark" class="tumbler-checkbox" ${generalConfig.watermark ? 'checked' : ''}>
                        </label>
                    </div>
                `;
            } else if (currentView === 'timetable') {
                title = 'Расписание';
                contentHTML = `
                    <div style="margin: 0;">
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 12px;">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Скрывать выходные дни</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Убирает из расписания пустые дни без пар</span>
                            </div>
                            <input type="checkbox" id="setting-hide-days" class="tumbler-checkbox" ${generalConfig.hideDaysOff ? 'checked' : ''}>
                        </label>
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 12px;">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Затемнение прошедших пар</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Делает прошедшие занятия тусклыми</span>
                            </div>
                            <input type="checkbox" id="setting-dim-pairs" class="tumbler-checkbox" ${generalConfig.dimPastPairs ? 'checked' : ''}>
                        </label>
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 12px;">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Компактные аудитории</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">«107/5» вместо «ауд. 107, к. 5, э. 1»</span>
                            </div>
                            <input type="checkbox" id="setting-short-aud" class="tumbler-checkbox" ${generalConfig.shortAudFormat ? 'checked' : ''}>
                        </label>
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 12px;">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Даты слева</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Писать дату рядом с днем недели, а не в правом углу</span>
                            </div>
                            <input type="checkbox" id="setting-dates-left" class="tumbler-checkbox" ${generalConfig.datesLeft ? 'checked' : ''}>
                        </label>
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition);">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Показывать Воскресенье</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Добавляет 7-й день недели в конец списка</span>
                            </div>
                            <input type="checkbox" id="setting-show-sunday" class="tumbler-checkbox" ${generalConfig.showSunday ? 'checked' : ''}>
                        </label>
                    </div>
                `;
            } else if (currentView === 'grades') {
                title = 'Оценки';
                contentHTML = `
                    <div style="margin: 0;">
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 12px;">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Абсолютные баллы</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Отображать "из 100" в капсуле над таблицей вместо суммы макс. баллов</span>
                            </div>
                            <input type="checkbox" id="setting-abs-scores" class="tumbler-checkbox" ${generalConfig.absoluteScores ? 'checked' : ''}>
                        </label>
                        <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: ${generalConfig.compactGrades ? '8px' : '0'};">
                            <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                                <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">Компактные оценки</span>
                                <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">Скрывает лишние столбцы в таблицах с оценками</span>
                            </div>
                            <input type="checkbox" id="setting-compact-grades" class="tumbler-checkbox" ${generalConfig.compactGrades ? 'checked' : ''}>
                        </label>
                        <div id="compact-settings-btn-wrapper" style="display:${generalConfig.compactGrades ? 'block' : 'none'};">
                            <button class="settings-menu-btn" data-target="compact_grades_settings" style="width: 100%; background: transparent; border: 1px solid var(--color-table-border);">
                                <span class="material-icons" style="color: var(--color-text-secondary);">view_column</span>
                                Настроить колонки
                                <span class="material-icons chevron">chevron_right</span>
                            </button>
                        </div>
                    </div>
                `;
            } else if (currentView === 'compact_grades_settings') {
                title = 'Настройка колонок';
                backTarget = 'grades';
                const cfg = generalConfig.compactGradesConfig;
                const makeToggle = (id, label, desc, checked) => `
                    <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition); margin-bottom: 8px;">
                        <div style="display:flex; flex-direction:column; gap:4px; padding-right: 15px;">
                            <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary); line-height: 1.3;">${label}</span>
                            <span style="font-size:1.1rem; color:var(--color-text-secondary); line-height: 1.3;">${desc}</span>
                        </div>
                        <input type="checkbox" id="${id}" class="tumbler-checkbox compact-col-toggle" ${checked ? 'checked' : ''}>
                    </label>
                `;
                contentHTML = `
                    <div style="margin: 0;">
                        <div style="font-size: 1.2rem; color: var(--color-text-secondary); margin-bottom: 1.6rem; padding: 0 4px; line-height: 1.4;">Выберите, какие столбцы оставить видимыми (<b>Тема</b> и <b>Оценка</b> отображаются всегда):</div>
                        ${makeToggle('cfg-workType', 'Вид работы', 'Лек, практ, лаб, сам', cfg.showWorkType)}
                        ${makeToggle('cfg-controlType', 'Вид контроля', 'Итоговое или текущее КМ', cfg.showControlType)}
                        ${makeToggle('cfg-passScore', 'Проходной балл', 'Минимум для зачета', cfg.showPassScore)}
                        ${makeToggle('cfg-rating', 'Балл в рейтинг', 'Текущий и максимальный баллы', cfg.showRating)}
                        ${makeToggle('cfg-date', 'Дата', 'Дата выставления оценки', cfg.showDate)}
                        ${makeToggle('cfg-teacher', 'Преподаватель', 'ФИО преподавателя', cfg.showTeacher)}
                    </div>
                `;
            } else if (currentView === 'appearance') {
                title = 'Внешний вид';
                let config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };
                const getHex = (key) => ACCENT_COLORS[key] || ACCENT_COLORS.blue;
                const c1 = getHex(config.colors[0]);
                const c2 = config.colors[1] ? getHex(config.colors[1]) : c1;
                const currentPreviewBg = config.isGradient ? `linear-gradient(135deg, ${c1}, ${c2})` : c1;

                contentHTML = `
                    <div class="appearance-section">
                        <div class="appearance-title">Тема интерфейса</div>
                        <div class="theme-selector-group">
                            <button class="theme-btn ${theme === 'auto' ? 'active' : ''}" data-theme="auto" title="Системная"><span class="material-icons">brightness_auto</span></button>
                            <button class="theme-btn ${theme === 'light' ? 'active' : ''}" data-theme="light" title="Светлая"><span class="material-icons">light_mode</span></button>
                            <button class="theme-btn ${theme === 'dark' ? 'active' : ''}" data-theme="dark" title="Темная"><span class="material-icons">dark_mode</span></button>
                        </div>
                    </div>
                    <div class="appearance-section" style="margin-bottom: 0;">
                        <div class="appearance-title">Цветовой акцент</div>
                        <div class="color-picker-controls-row">
                            <div class="color-picker-toggle-wrap" style="background: ${currentPreviewBg}">
                                <span>Градиент</span>
                                <input type="checkbox" id="grad-toggle" class="tumbler-checkbox" ${config.isGradient ? 'checked' : ''}>
                            </div>
                            <button id="random-color-btn" class="color-picker-random-btn" title="Случайные цвета"><span class="material-icons">casino</span></button>
                        </div>
                        <div class="color-picker-grid" id="color-grid"></div>
                    </div>
                `;
            } else if (currentView === 'version') {
                title = 'Обновление';
                contentHTML = `<div id="version-content-wrapper"></div>`;
            } else if (currentView === 'history') {
                title = 'История версий';
                backTarget = 'version';
                contentHTML = `<div id="version-history-list"><div style="text-align:center; padding: 3rem 0; color:var(--color-text-secondary);"><span class="material-icons" style="animation:spin 1s linear infinite; font-size: 32px;">sync</span></div></div>`;
            }

            // --- СБОРКА HTML МОДАЛКИ (Split-Layout) ---
            const isMainMobile = currentView === 'main';

            modal.innerHTML = `
                <div class="settings-layout">
                    <!-- САЙДБАР (На мобильных виден только если main) -->
                    <div class="settings-sidebar ${!isMainMobile ? 'hidden-on-mobile' : ''}">
                        <div class="desktop-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary);">Настройки</div>
                        <div class="mobile-main-title" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.6rem; padding: 0 8px; color: var(--color-text-primary); display:flex; justify-content:space-between; align-items:center;">
                            Настройки
                            <span class="material-icons close-modal-btn" style="color:var(--color-text-secondary); cursor:pointer;">close</span>
                        </div>

                        <div class="settings-sidebar-btn ${currentView === 'general' ? 'active' : ''}" data-target="general">
                            <span class="material-icons">settings</span><span class="sidebar-btn-text">Общие</span><span class="material-icons chevron hidden-on-mobile">chevron_right</span>
                        </div>
                        <div class="settings-sidebar-btn ${currentView === 'timetable' ? 'active' : ''}" data-target="timetable">
                            <span class="material-icons">calendar_today</span><span class="sidebar-btn-text">Расписание</span><span class="material-icons chevron hidden-on-mobile">chevron_right</span>
                        </div>
                        <div class="settings-sidebar-btn ${currentView === 'grades' ? 'active' : ''}" data-target="grades">
                            <span class="material-icons">analytics</span><span class="sidebar-btn-text">Оценки</span><span class="material-icons chevron hidden-on-mobile">chevron_right</span>
                        </div>
                        <div class="settings-sidebar-btn ${currentView === 'appearance' ? 'active' : ''}" data-target="appearance">
                            <span class="material-icons">palette</span><span class="sidebar-btn-text">Внешний вид</span><span class="material-icons chevron hidden-on-mobile">chevron_right</span>
                        </div>
                        <div class="settings-sidebar-btn ${currentView === 'version' || currentView === 'history' ? 'active' : ''}" data-target="version">
                            <span class="material-icons">system_update</span><span class="sidebar-btn-text">Обновление</span><span class="material-icons chevron hidden-on-mobile">chevron_right</span>
                        </div>
                    </div>

                    <!-- КОНТЕНТ (На мобильных скрыт если main) -->
                    <div class="settings-content-area ${isMainMobile ? 'hidden-on-mobile' : ''}">
                        <!-- Шапка контента -->
                        <div class="ui-widget-header" style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-table-border); background:var(--color-table-header);">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span class="material-icons back-modal-btn settings-mobile-header" data-back="${backTarget}" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">arrow_back</span>
                                <span style="font-size:1.8rem; font-weight:800; color:var(--color-text-primary);">${title}</span>
                            </div>
                            <span class="material-icons close-modal-btn" style="cursor:pointer;color:var(--color-text-secondary); font-size: 2.4rem;">close</span>
                        </div>
                        
                        <!-- Сам контент -->
                        <div class="settings-content-scroll">
                            ${contentHTML}
                        </div>
                    </div>
                </div>
            `;

            // --- СОБЫТИЯ И ЛОГИКА ---
            modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeAll);
            modal.querySelectorAll('.back-modal-btn').forEach(btn => {
                btn.onclick = function() { renderView(this.getAttribute('data-back')); };
            });
            modal.querySelectorAll('.settings-sidebar-btn').forEach(btn => {
                btn.onclick = () => renderView(btn.getAttribute('data-target'));
            });

            // Подключение кнопок внутренних страниц
            modal.querySelectorAll('.settings-menu-btn[data-target]').forEach(btn => {
                btn.onclick = () => renderView(btn.getAttribute('data-target'));
            });

            // Обработчики чекбоксов
            if (currentView === 'general') {
                modal.querySelector('#setting-watermark').onchange = (e) => {
                    generalConfig.watermark = e.target.checked;
                    localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig));
                };
                modal.querySelector('#setting-generate-qr').onchange = (e) => {
                    generalConfig.generateQR = e.target.checked;
                    localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig));
                };
            } else if (currentView === 'timetable') {
                modal.querySelector('#setting-hide-days').onchange = (e) => { generalConfig.hideDaysOff = e.target.checked; localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); if (window.applyHideDaysOff) window.applyHideDaysOff(); };
                modal.querySelector('#setting-dim-pairs').onchange = (e) => { generalConfig.dimPastPairs = e.target.checked; localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); if (window.applyDimming) window.applyDimming(); };
                modal.querySelector('#setting-short-aud').onchange = (e) => { generalConfig.shortAudFormat = e.target.checked; localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); requiresReloadOnClose = true; };
                modal.querySelector('#setting-dates-left').onchange = (e) => { generalConfig.datesLeft = e.target.checked; localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); requiresReloadOnClose = true; };
                modal.querySelector('#setting-show-sunday').onchange = (e) => { generalConfig.showSunday = e.target.checked; localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); requiresReloadOnClose = true; };
            } else if (currentView === 'grades') {
                modal.querySelector('#setting-abs-scores').onchange = (e) => { 
                    generalConfig.absoluteScores = e.target.checked; 
                    localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); 
                    requiresReloadOnClose = true; 
                };
                modal.querySelector('#setting-compact-grades').onchange = (e) => { 
                    generalConfig.compactGrades = e.target.checked; 
                    const wrapper = modal.querySelector('#compact-settings-btn-wrapper');
                    if (e.target.checked) {
                        wrapper.style.display = 'block';
                        wrapper.previousElementSibling.style.marginBottom = '8px';
                    } else {
                        wrapper.style.display = 'none';
                        wrapper.previousElementSibling.style.marginBottom = '0';
                    }
                    localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig)); 
                    requiresReloadOnClose = true; 
                };
            } else if (currentView === 'compact_grades_settings') {
                modal.querySelectorAll('.compact-col-toggle').forEach(checkbox => {
                    checkbox.onchange = (e) => {
                        const id = e.target.id;
                        if (id === 'cfg-workType') generalConfig.compactGradesConfig.showWorkType = e.target.checked;
                        if (id === 'cfg-controlType') generalConfig.compactGradesConfig.showControlType = e.target.checked;
                        if (id === 'cfg-passScore') generalConfig.compactGradesConfig.showPassScore = e.target.checked;
                        if (id === 'cfg-rating') generalConfig.compactGradesConfig.showRating = e.target.checked;
                        if (id === 'cfg-date') generalConfig.compactGradesConfig.showDate = e.target.checked;
                        if (id === 'cfg-teacher') generalConfig.compactGradesConfig.showTeacher = e.target.checked;
                        localStorage.setItem(GENERAL_CONFIG_KEY, JSON.stringify(generalConfig));
                        requiresReloadOnClose = true;
                    }
                });
            } else if (currentView === 'appearance') {
                let config = JSON.parse(localStorage.getItem('etis_accent_config')) || { isGradient: true, colors: ['blue', 'lightblue'] };
                if (window._etisTargetIndex === undefined) window._etisTargetIndex = 0;

                modal.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.onclick = () => {
                        theme = btn.getAttribute('data-theme'); localStorage.setItem('theme', theme);
                        if (theme === 'auto') setSystemThemeDetection();
                        else { removeSystemThemeDetection(); document.documentElement.setAttribute('theme', theme); }
                        modal.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
                    };
                });

                const grid = modal.querySelector('#color-grid');
                COLOR_ORDER.forEach(colorKey => {
                    const circle = document.createElement('div'); circle.className = 'color-picker-circle'; circle.style.backgroundColor = ACCENT_COLORS[colorKey];
                    const selectedIndex = config.colors.indexOf(colorKey);
                    if (selectedIndex !== -1) { circle.classList.add('selected'); circle.innerHTML = config.isGradient ? (selectedIndex + 1).toString() : '<span class="material-icons" style="font-size: 20px;">check</span>'; }
                    circle.onclick = () => {
                        if (config.isGradient) {
                            if (config.colors.includes(colorKey)) config.colors.reverse();
                            else { if (config.colors.length < 2) { config.colors.push(colorKey); window._etisTargetIndex = 0; } else { config.colors[window._etisTargetIndex] = colorKey; window._etisTargetIndex = (window._etisTargetIndex === 0) ? 1 : 0; } }
                        } else { config.colors = [colorKey]; window._etisTargetIndex = 0; }
                        localStorage.setItem('etis_accent_config', JSON.stringify(config)); applyAccentColor(); renderView('appearance');
                    };
                    grid.appendChild(circle);
                });

                const randomBtn = modal.querySelector('#random-color-btn');
                randomBtn.onclick = () => {
                    const r1 = COLOR_ORDER[Math.floor(Math.random() * COLOR_ORDER.length)]; let r2 = COLOR_ORDER[Math.floor(Math.random() * COLOR_ORDER.length)];
                    while (config.isGradient && r2 === r1) r2 = COLOR_ORDER[Math.floor(Math.random() * COLOR_ORDER.length)];
                    config.colors = config.isGradient ? [r1, r2] : [r1]; localStorage.setItem('etis_accent_config', JSON.stringify(config)); applyAccentColor(); renderView('appearance');
                };

                modal.querySelector('#grad-toggle').onchange = (e) => {
                    config.isGradient = e.target.checked;
                    if (!config.isGradient && config.colors.length > 1) config.colors = [config.colors[0]];
                    if (config.isGradient && config.colors.length < 2) config.colors.push('lightblue');
                    localStorage.setItem('etis_accent_config', JSON.stringify(config)); applyAccentColor(); renderView('appearance');
                };
            } else if (currentView === 'version') {
                refreshModalUI();
                if (updateState.status === 'idle') initAutoUpdateCheck(true);
            } else if (currentView === 'history') {
                loadVersionHistory();
            }
        };

        renderView(view);
        requestAnimationFrame(() => { 
            overlay.classList.add('active'); 
            modal.classList.add('active'); 
            document.body.classList.add('modal-open-body');
        });
    }

    // Модификация стилей страниц
    function stylePages() {
        initMobileMenu();

        // --- ГЛОБАЛЬНАЯ СИСТЕМА УВЕДОМЛЕНИЙ ---
        let pushContainer = document.getElementById('etis-push-container');
        if (!pushContainer) {
            pushContainer = document.createElement('div');
            pushContainer.id = 'etis-push-container';
            pushContainer.className = 'push-container';
            document.body.appendChild(pushContainer);
        }

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
            requestAnimationFrame(() => setTimeout(() => toast.classList.add('show'), 50));
            setTimeout(() => {
                if(toast.parentNode) {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 400);
                }
            }, 8000);
        };
        window.showEtisPush = showPush; // Делаем доступной отовсюду

        // --- ПАРСЕР ДАТ И УМНОЕ ДОБАВЛЕНИЕ В РАСПИСАНИЕ ---
        const monthsDict = { 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 };
        
        function highlightDatesInHTML(html, msgTitle) {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Регулярки для поиска времени
            const regex1 = /(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:[\s,]*?(?:в|с|на)?\s*(\d{1,2})[:.](\d{2}))/ig;
            const regex2 = /(\d{2})\.(\d{2})(?:\.\d{2,4})?(?:[\s,]*?(?:в|с|на)?\s*(\d{1,2})[:.](\d{2}))/ig;

            // УМНЫЙ ПОИСК АУДИТОРИИ (с корпусом и этажом)
            let aud = '';
            // Ищем формат с корпусом: "ауд.413/8", "ауд 413 / 8", "ауд. 413\8"
            let audMatch = html.match(/(?:в\s+)?ауд(?:итории|\.)?\s*(\d+[а-яa-z]*)\s*[\/\\]\s*(\d+[а-яa-z]*)/i);
            if (audMatch) {
                let room = audMatch[1];
                let building = audMatch[2];
                let floor = room.charAt(0); // Этаж по первой цифре аудитории
                aud = `ауд. ${room}, к. ${building}, э. ${floor}`;
            } else {
                // Если корпуса нет, ищем просто аудиторию
                let audMatchSingle = html.match(/(?:в\s+)?ауд(?:итории|\.)?\s*(\d+[а-яa-z]*)/i);
                if (audMatchSingle) {
                    let room = audMatchSingle[1];
                    let floor = room.charAt(0);
                    aud = `ауд. ${room}, э. ${floor}`;
                }
            }

            // Если аудитории нет физически, но есть ссылка онлайн
            if (!aud) {
                let linkMatch = html.match(/href="(https?:\/\/[^"]+)"/i);
                if (linkMatch && (linkMatch[1].includes('zoom') || linkMatch[1].includes('telemost'))) {
                    aud = linkMatch[1];
                }
            }

            const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace =[];
            let node;
            
            while (node = walker.nextNode()) {
                // Пропускаем уже обработанные ссылки
                if (node.parentNode && (node.parentNode.tagName === 'A' || node.parentNode.classList.contains('msg-event-link'))) continue;
                nodesToReplace.push(node);
            }

            nodesToReplace.forEach(txtNode => {
                let text = txtNode.nodeValue;
                let replaced = false;

                text = text.replace(regex1, (match, d, m, hr, min) => {
                    replaced = true;
                    return createEventTag(match, d, monthsDict[m.toLowerCase()], hr, min, msgTitle, aud);
                });

                text = text.replace(regex2, (match, d, m, hr, min) => {
                    replaced = true;
                    return createEventTag(match, d, parseInt(m, 10) - 1, hr, min, msgTitle, aud);
                });

                if (replaced) {
                    const span = document.createElement('span');
                    span.innerHTML = text;
                    txtNode.parentNode.replaceChild(span, txtNode);
                }
            });

            return temp.innerHTML;
        }

        function createEventTag(match, d, m, hr, min, title, aud) {
            // ОЧИСТКА НАЗВАНИЯ от даты, времени и номера аудитории
            let cleanTitle = (title || 'Объявление');
            
            // 1. Убираем время (в 11:00, 11.00, с 10:00, до 12.00)
            cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:в\s+|с\s+|до\s+|по\s+)?\d{1,2}[:.]\d{2}(?=\s|$|[.,])/ig, ' ');

            // 2. Убираем даты с месяцами прописью (без \b, так как кириллица в JS с ним не работает)
            cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:с\s+|до\s+|по\s+)?\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/ig, ' ');

            // 3. Убираем числовые даты (12.05.2024)
            cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:с\s+|до\s+|по\s+)?\d{2}\.\d{2}(?:\.\d{2,4})?/ig, ' ');

            // 4. Убираем аудиторию (в ауд. 311/2)
            cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:в\s+)?ауд(?:итории|\.)?\s*\d+[/а-яa-z0-9\\]*/ig, ' ');

            // 5. Убираем популярные слова-паразиты, которые могли остаться от предложений
            cleanTitle = cleanTitle.replace(/(?:^|\s+)(?:состоится|пройдет|пройдёт)(?=\s|$)/ig, ' ');

            // 6. Чистим двойные пробелы, висячие предлоги на конце и знаки препинания по краям
            cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
            cleanTitle = cleanTitle.replace(/\s+(в|с|на|до|по|к|от)$/ig, '').trim();
            cleanTitle = cleanTitle.replace(/^[.,\s\-:]+|[.,\s\-:]+$/g, '').trim();

            if (!cleanTitle) cleanTitle = 'Мероприятие'; // Если название стерлось полностью

            // Защита от HTML-инъекций в атрибутах
            cleanTitle = cleanTitle.replace(/"/g, '&quot;');
            const cleanAud = (aud || '').replace(/"/g, '&quot;');
            
            const hash = `evt_${d}_${m}_${hr}_${min}_${cleanTitle.substring(0,8)}`.replace(/\s+/g, '');
            return `<span class="msg-event-link" data-hash="${hash}" data-d="${d}" data-m="${m}" data-hr="${hr}" data-min="${min}" data-title="${cleanTitle}" data-aud="${cleanAud}">${match}</span>`;
        }

        function initEventLinks() {
            document.querySelectorAll('.msg-event-link').forEach(el => {
                const hash = el.getAttribute('data-hash');
                
                // Функция проверки, добавлено ли событие
                const checkAdded = () => {
                    const added = JSON.parse(localStorage.getItem('etis_added_msg_events') || '[]');
                    return added.includes(hash);
                };
                
                // Проверяем статус при загрузке страницы
                if (checkAdded()) el.classList.add('added');

                el.onclick = (e) => {
                    e.stopPropagation();
                    const isAdded = checkAdded();
                    let addedMsgs = JSON.parse(localStorage.getItem('etis_added_msg_events') || '[]');
                    let cp = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                    const title = el.dataset.title;

                    if (isAdded) {
                        // --- ЛОГИКА УДАЛЕНИЯ ---
                        
                        // Удаляем саму пару из расписания
                        cp = cp.filter(p => p.msgHash !== hash);
                        localStorage.setItem('etis_custom_pairs_v1', JSON.stringify(cp));
                        
                        // Удаляем хэш из списка добавленных
                        addedMsgs = addedMsgs.filter(h => h !== hash);
                        localStorage.setItem('etis_added_msg_events', JSON.stringify(addedMsgs));
                        
                        // Меняем визуал
                        el.classList.remove('added');
                        
                        // Показываем уведомление
                        if (window.showEtisPush) window.showEtisPush('Удалено', title, `Событие убрано из расписания`, 'info', 'event_busy');
                        
                    } else {
                        // --- ЛОГИКА ДОБАВЛЕНИЯ ---
                        
                        const d = parseInt(el.dataset.d), m = parseInt(el.dataset.m), hr = el.dataset.hr.padStart(2,'0'), min = el.dataset.min.padStart(2,'0');
                        const aud = el.dataset.aud;

                        const now = new Date(); let targetDate = new Date(now.getFullYear(), m, d);
                        if (targetDate < now && (now.getMonth() - m) > 6) targetDate.setFullYear(now.getFullYear() + 1);

                        const getMon = (date) => { const d = new Date(date); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); return d.setHours(0,0,0,0); };
                        const weekDiff = Math.round((getMon(targetDate) - getMon(now)) / (7 * 24 * 3600 * 1000));
                        const targetWeek = parseInt(localStorage.getItem('etis_actual_week') || '1') + weekDiff;

                        let eM = parseInt(min) + 90, eH = parseInt(hr) + Math.floor(eM/60);
                        const pair = { 
                            id: 'cp_' + Date.now(), 
                            addedWeek: targetWeek, 
                            dayName:["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"][targetDate.getDay()],
                            subject: title, 
                            startTime: `${hr}:${min}`, 
                            endTime: `${(eH%24).toString().padStart(2,'0')}:${(eM%60).toString().padStart(2,'0')}`,
                            type: 'лаб',
                            recurrence: 'once', 
                            aud: aud, 
                            teacher: '',
                            msgHash: hash
                        };

                        // Сохраняем в память
                        cp.push(pair); 
                        localStorage.setItem('etis_custom_pairs_v1', JSON.stringify(cp));
                        
                        addedMsgs.push(hash); 
                        localStorage.setItem('etis_added_msg_events', JSON.stringify(addedMsgs));

                        // Меняем визуал
                        el.classList.add('added');
                        
                        // Показываем уведомление
                        if (window.showEtisPush) window.showEtisPush('Добавлено в расписание', title, `${targetWeek} неделя, ${pair.dayName}`, 'success', 'event_available');
                    }
                };
            });
        }

        const page = window.location.pathname.split('/').pop();

        // --- ПЕРЕХВАТ СТРАНИЦЫ РАСПИСАНИЯ ПРЕПОДАВАТЕЛЯ ---
        const isPeoTT = document.querySelector('form#form1 input[name="P_PEO_ID"]') !== null;
        let span9 = document.querySelector('div.span9');

        if (isPeoTT && !span9) {
            const container = document.createElement('div');
            // Используем flexbox для надежного центрирования на любых экранах
            container.style.cssText = 'display: flex; justify-content: center; width: 100%; box-sizing: border-box; padding: 2rem;';
            
            span9 = document.createElement('div');
            span9.className = 'span9';
            span9.style.cssText = 'margin: 0 !important; float: none !important; width: 100% !important; max-width: 1120px !important; padding-top: 1rem !important;';
            
            // Перемещаем всё содержимое body внутрь нашего нового контейнера
            Array.from(document.body.childNodes).forEach(node => {
                if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.id !== 'swipe-action-bubble' && node.id !== 'etis-push-container' && node !== container) {
                    span9.appendChild(node);
                }
            });
            
            container.appendChild(span9);
            document.body.appendChild(container);
            document.body.style.backgroundColor = ''; // Сброс возможных инлайновых фонов
        }

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
                    let labelText = label.textContent.trim();
                    // Меняем текст плейсхолдера
                    if (labelText === 'Фамилия / email') labelText = 'Email';
                    
                    input.placeholder = labelText;
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
                safeAppend(sidebarStyles);

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

                // Вкладка "Настройки"
                const settingsLi = document.createElement("li");
                settingsLi.className = 'theme-switcher-item';
                const settingsLink = document.createElement("a");
                settingsLink.style.cursor = 'pointer';
                settingsLink.href = "#settings";
                settingsLink.textContent = 'Настройки';
                settingsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const side = document.querySelector('.span3');
                    if (side && side.classList.contains('mobile-active')) {
                        side.classList.remove('mobile-active');
                        document.querySelector('.mobile-overlay')?.classList.remove('active');
                        document.querySelector('.mobile-menu-btn')?.classList.remove('open');
                    }
                    openSettingsModal('main');
                });
                settingsLi.appendChild(settingsLink);
                allListItems.push(settingsLi);

                // Функция иконок
                const getIconForHref = (href) => {
                    if (href === '#version-check') return 'system_update';
                    if (href === '#appearance') return 'palette';
                    if (href === '#report-bug') return 'bug_report';
                    if (href === '#settings') return 'settings';
                    if (href.includes('teach_plan')) return 'school';
                    if (href.includes('timetable')) return 'calendar_today';
                    if (href.includes('signs')) return 'assignment_turned_in';
                    if (href.includes('absence')) return 'event_busy';
                    if (href.includes('stu_phs.show_slots')) return 'directions_run';
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

                    // --- БЕЗОПАСНОЕ ОБНОВЛЕНИЕ БЕЗ ПАРАМЕТРОВ ---
                    if (allowedDotHrefs.some(target => href.includes(target))) {
                        a.onclick = function(e) {
                            if (window.location.href.includes(href)) {
                                e.preventDefault();
                                window.location.reload();
                            }
                        };
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
                    ['timetable', 'signs', 'absence', 'stu_phs.show_slots'],
                    ['announces', 'teacher_notes', 'teachers', 'est_pkg.show_list'],
                    ['orders', 'cert_pkg', 'contract_list', 'blank_forms', 'portfolio', 'group_tt'],
                    ['library', 'electr', 'advice', 'ses', 'about'],
                    ['term_test', 'special_est_list', 'оцените дистанционное'],
                    ['#settings', 'change_pass', 'change_email', 'change_pr_page', 'logout']
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
                    sidebar.appendChild(footer);
                }
            }

            // Main page content
            const span9 = document.querySelector('div.span9');
            if (!span9 && !document.querySelector('.login')) return;
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

            // --- ОФОРМЛЕНИЕ РАСПИСАНИЯ ПРЕПОДАВАТЕЛЯ ---
            if (isPeoTT) {
                // 1. Очистка заголовка
                const h4 = span9.querySelector('h4');
                if (h4) {
                    const h2 = document.createElement('h2');
                    h2.textContent = h4.textContent;
                    h2.style.marginBottom = '2.4rem';
                    h4.replaceWith(h2);
                }

                // 2. Парсинг семестров и недель
                const spans = Array.from(span9.querySelectorAll('span.fl, span.active'));
                const terms =[];
                const weeks =[];
                
                spans.forEach(span => {
                    const text = span.textContent.trim();
                    const onclick = span.getAttribute('onclick');
                    
                    if (/^\d+$/.test(text) || (onclick && onclick.includes("'',"))) {
                        weeks.push(span);
                    } else {
                        terms.push(span);
                    }
                });
                
                // Удаляем висячие <br> и &nbsp;
                Array.from(span9.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') node.remove();
                    if (node.tagName === 'BR') node.remove();
                });

                // 3. Создание Submenu (Семестры)
                if (terms.length > 0) {
                    const submenu = document.createElement('div');
                    submenu.className = 'submenu';
                    submenu.style.setProperty('margin-bottom', '2.4rem', 'important');
                    
                    terms.forEach(span => {
                        const a = document.createElement(span.classList.contains('active') ? 'b' : 'a');
                        a.textContent = span.textContent;
                        if (span.hasAttribute('onclick')) {
                            a.href = '#';
                            a.setAttribute('onclick', span.getAttribute('onclick'));
                        }
                        // Заставляем вкладки равномерно растягиваться на всю ширину
                        a.style.setProperty('flex', '1 1 0', 'important');
                        a.style.setProperty('justify-content', 'center', 'important');
                        submenu.appendChild(a);
                        span.remove();
                    });
                    span9.insertBefore(submenu, span9.querySelector('table.slimtab_nice') || span9.firstChild);
                }
                
                // 4. Создание Weeks (Недели)
                if (weeks.length > 0) {
                    const weeksContainer = document.createElement('div');
                    weeksContainer.className = 'weeks';
                    weeksContainer.style.setProperty('margin-bottom', '2.4rem', 'important');
                    
                    const actualWeekNum = localStorage.getItem('etis_actual_week');
                    
                    weeks.forEach(span => {
                        const isActive = span.classList.contains('active');
                        const weekDiv = document.createElement('div');
                        weekDiv.className = 'week ' + (isActive ? 'current' : '');
                        
                        const text = span.textContent.trim();
                        
                        // Подсветка актуальной недели (если сейчас не она)
                        if (text === actualWeekNum && !isActive) {
                            weekDiv.classList.add('actual-week');
                        }

                        const a = document.createElement('a');
                        a.textContent = text;
                        if (span.hasAttribute('onclick')) {
                            a.href = '#';
                            a.setAttribute('onclick', span.getAttribute('onclick'));
                        }
                        
                        // ФИКС ЦВЕТА АКТИВНОЙ НЕДЕЛИ
                        if (isActive) {
                            a.style.setProperty('color', '#fff', 'important');
                            a.style.setProperty('font-weight', '700', 'important');
                        }
                        
                        weekDiv.appendChild(a);
                        weeksContainer.appendChild(weekDiv);
                        span.remove();
                    });
                    span9.insertBefore(weeksContainer, span9.querySelector('table.slimtab_nice') || span9.firstChild);

                    // Автоскролл к текущей неделе
                    setTimeout(() => {
                        const activeW = weeksContainer.querySelector('.current');
                        if (activeW) {
                            const scrollTarget = activeW.offsetLeft - (weeksContainer.offsetWidth / 2) + (activeW.offsetWidth / 2);
                            weeksContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' });
                        }
                    }, 200);
                }
                
                // 5. Оформление таблицы (Парсинг сетки в карточки дней)
                const table = span9.querySelector('table.slimtab_nice');
                if (table) {
                    if (!document.getElementById('peo-tt-hover-styles')) {
                        const style = document.createElement('style');
                        style.id = 'peo-tt-hover-styles';
                        style.innerHTML = `
                            .aud-hidden {
                                max-height: 0;
                                overflow: hidden;
                                opacity: 0;
                                transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
                                margin-top: 0;
                                display: flex;
                                flex-direction: column;
                                gap: 6px;
                            }
                            .aud-hover-container:hover .aud-hidden {
                                max-height: 800px;
                                opacity: 1;
                                margin-top: 8px;
                            }
                            .pair_teacher { overflow: visible !important; }
                            .groups-more-btn {
                                background: var(--color-highlight);
                                color: var(--color-text-primary);
                                padding: 4px 10px;
                                border-radius: 12px;
                                font-size: 1.1rem;
                                margin-left: 6px;
                                font-weight: 800;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                display: inline-block;
                                vertical-align: middle;
                                border: 1px solid transparent;
                                line-height: 1.2;
                            }
                            .groups-more-btn:hover {
                                background: var(--color-accent-active);
                                color: var(--color-accent);
                                border-color: var(--color-accent);
                                transform: translateY(-1px);
                            }
                            /* Фикс ширины правой колонки для преподавателя */
                            html[theme] .teacher-days-container .timetable-grid td.pair_teacher {
                                width: 250px !important;
                                min-width: 200px !important;
                                padding-right: 1.6rem !important;
                            }
                            html[theme] .teacher-days-container .timetable-grid tr:not(:last-child) {
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
                            @media (max-width: 960px) {
                                html[theme] .teacher-days-container .timetable-grid td.pair_teacher {
                                    width: 110px !important;
                                    min-width: 110px !important;
                                    padding-right: 1.6rem !important;
                                }
                                html[theme] .teacher-days-container .timetable-grid tr:not(:last-child) {
                                    background-image: linear-gradient(to right,
                                        transparent calc(75px + 0.5rem),
                                        var(--color-table-border) calc(75px + 0.5rem),
                                        var(--color-table-border) calc(100% - 1.6rem),
                                        transparent calc(100% - 1.6rem)
                                    ) !important;
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    const daysArr =["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
                    const daysData = daysArr.map(name => ({ name, pairs:[] }));
                    let teacherInfoHtml = "";

                    // Попытка вытащить дату начала недели (понедельника) из заголовка
                    const h2Title = span9.querySelector('h2');
                    let startWeekDate = null;
                    if (h2Title) {
                        const dateMatch = h2Title.textContent.match(/с\s+(\d{2})\.(\d{2})\.(\d{4})/i);
                        if (dateMatch) {
                            startWeekDate = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
                        }
                    }
                    const monthsArrCase =['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

                    const rows = table.querySelectorAll('tr');
                    rows.forEach((tr, rowIndex) => {
                        if (rowIndex === 0 || tr.children.length === 0) return;

                        let time = "";
                        let dayCellOffset = 0;
                        const firstCell = tr.cells[0];

                        if (firstCell && firstCell.rowSpan > 2 && firstCell.querySelector('b')) {
                            teacherInfoHtml = firstCell.innerHTML;
                            time = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
                            dayCellOffset = 2;
                        } else {
                            time = firstCell ? firstCell.textContent.trim() : "";
                            dayCellOffset = 1;
                        }

                        if (!time.includes(':')) return;

                        for (let i = 0; i < 6; i++) {
                            const cell = tr.cells[i + dayCellOffset];
                            if (!cell || cell.textContent.trim() === '') continue;

                            const pairBlocks = cell.innerHTML.split(/<hr[^>]*>/i);

                            pairBlocks.forEach(blockHtml => {
                                if (blockHtml.trim() === '') return;
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = blockHtml;

                                let subject = "Пара";
                                let type = "";
                                
                                const allDivs = tempDiv.querySelectorAll(':scope > div');
                                if (allDivs.length === 0) return;

                                const cleanDivs = Array.from(allDivs).filter(d => !d.classList.contains('param'));

                                if (cleanDivs.length === 0) return;

                                const subjFont = cleanDivs[0].querySelector('font[color="#6A0035"] b') || cleanDivs[0];
                                const titleText = subjFont.textContent.trim();
                                const typeMatch = titleText.match(/\((лек|практ|лаб)\)$/i);
                                if (typeMatch) {
                                    type = typeMatch[1].toLowerCase();
                                    subject = titleText.replace(typeMatch[0], '').trim();
                                } else if (titleText.toLowerCase().includes('консультация')) {
                                    type = 'конс';
                                    subject = titleText;
                                } else { subject = titleText; }

                                let infoDiv = cleanDivs.length >= 2 ? cleanDivs[1] : null;
                                let groupsDiv = cleanDivs.length >= 3 ? cleanDivs[2] : null;

                                if (cleanDivs.length === 2) {
                                    const c1Html = cleanDivs[1].innerHTML;
                                    if (cleanDivs[1].querySelector('a') || (c1Html.includes('<br>') && !c1Html.match(/\d{2}\.\d{2}/) && !cleanDivs[1].classList.contains('fp'))) {
                                        groupsDiv = cleanDivs[1];
                                        infoDiv = null;
                                    }
                                }

                                let infoHtml = "";
                                if (infoDiv) {
                                    let visibleEntries =[];
                                    let hiddenEntries =[];
                                    const tooltipEl = infoDiv.querySelector('.tooltip');
                                    
                                    let rawText = infoDiv.innerHTML.replace(/\.\d{4}/g, '')
                                        .replace(/<font[^>]*>/g, '').replace(/<\/font>/g, '')
                                        .replace(/<img[^>]*>/ig, '')
                                        .replace(/&nbsp;/g, ' ')
                                        .replace(/<span[^>]*>.*?online.*?<\/span>/ig, 'online'); 

                                    let parts = rawText.split(/<br\s*\/?>/i).map(s => s.trim().replace(/<[^>]+>/g, '')).filter(s => s);
                                    
                                    for (let j = 0; j < parts.length; j++) {
                                        let text = parts[j];
                                        if (text.toLowerCase() === titleText.toLowerCase() || text.toLowerCase() === subject.toLowerCase()) continue;

                                        text = text.replace(/^[\d,\s]+-\s*/, '');

                                        if (text.startsWith('с ') || text.match(/^\d{2}\.\d{2}/)) {
                                            let nxt = parts[j+1] && !parts[j+1].startsWith('с ') && !parts[j+1].match(/^\d{2}\.\d{2}/) ? parts[j+1] : '';
                                            if (nxt) {
                                                nxt = nxt.replace(/^[\d,\s]+-\s*/, '');
                                                j++;
                                            }
                                            visibleEntries.push({ date: text, text: nxt, type: 'loc' });
                                        } else {
                                            visibleEntries.push({ date: '', text: text, type: 'loc' });
                                        }
                                    }

                                    if (tooltipEl && tooltipEl.hasAttribute('title')) {
                                        const titleStr = tooltipEl.getAttribute('title');
                                        const tParts = titleStr.split(/<br\s*\/?>/i).filter(s => s.trim());
                                        tParts.forEach(p => {
                                            const m = p.match(/^([\d\.]+)\s*-\s*(.*)/);
                                            if (m) {
                                                hiddenEntries.push({ date: m[1].trim().replace(/\.\d{4}/g, ''), text: m[2].trim(), type: 'loc' });
                                            } else {
                                                if (/(?:ауд\.|к\.|[0-9]+\/[0-9]+)/i.test(p)) {
                                                    hiddenEntries.push({ date: '', text: p.trim(), type: 'loc' });
                                                } else {
                                                    hiddenEntries.push({ date: '', text: p.trim(), type: 'info' });
                                                }
                                            }
                                        });
                                    } else {
                                        hiddenEntries = visibleEntries.slice(1);
                                    }

                                    const formatAud = (audStr, strType) => {
                                        if (!audStr) return '';
                                        if (audStr.toLowerCase() === 'online') {
                                            return `<span style="display:inline-flex; align-items:center; gap:4px; color:var(--color-text-secondary); font-weight:500; font-size:1.3rem;"><span class="material-icons" style="font-size:1.5rem;">public</span>Онлайн</span>`;
                                        }
                                        
                                        if (strType === 'info') {
                                            return `<div style="display:flex; align-items:flex-start; gap:8px; color:var(--color-text-secondary); font-weight:400; font-size:1.2rem; line-height:1.4; text-align:left; width:100%;"><span class="material-icons" style="font-size:1.5rem; opacity:0.7; flex-shrink:0; transform: translateY(-1px);">info_outline</span><span>${audStr}</span></div>`;
                                        }

                                        let displayAud = audStr;
                                        if (generalConfig.shortAudFormat) {
                                            const m = audStr.match(/(\d+)\s*к\.\s*(?:ауд\.)?\s*(\d+[а-яa-z]?)(?:\/\d+)?/i);
                                            if (m) {
                                                displayAud = `${m[2]}/${m[1]}`;
                                            }
                                        }
                                        return `<span style="display:inline-flex; align-items:center; gap:4px; color:var(--color-text-secondary); font-weight:500; font-size:1.3rem;"><span class="material-icons" style="font-size:1.5rem;">place</span>${displayAud}</span>`;
                                    };

                                    if (visibleEntries.length > 0) {
                                        let first = visibleEntries[0];
                                        let visibleHtml = `<div class="aud-visible" style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; text-align: left;">
                                            ${formatAud(first.text, first.type)}
                                            ${first.date ? `<span style="font-size:1.15rem; color:var(--color-accent); opacity:0.8; font-weight:600;">${first.date}</span>` : ''}
                                        </div>`;
                                        
                                        let hiddenHtml = '';
                                        const listToHide = hiddenEntries.length > 0 ? hiddenEntries : visibleEntries.slice(1);

                                        if (listToHide.length > 0) {
                                            hiddenHtml = `<div class="aud-hidden">`;
                                            listToHide.forEach(e => {
                                                hiddenHtml += `<div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; text-align:left; width:100%;">
                                                    ${formatAud(e.text, e.type)}
                                                    ${e.date ? `<span style="font-size:1.15rem; color:var(--color-text-secondary); opacity:0.8; font-weight:500;">${e.date}</span>` : ''}
                                                </div>`;
                                            });
                                            hiddenHtml += `</div>`;
                                        }

                                        infoHtml = `<div class="aud-hover-container" style="cursor:default; padding: 4px 0; text-align: left;">
                                            ${visibleHtml}
                                            ${hiddenHtml}
                                        </div>`;
                                    }
                                }

                                let groupsHtml = "";
                                if (groupsDiv) {
                                    let groupsArr =[];
                                    const aTags = groupsDiv.querySelectorAll('a');
                                    
                                    if (aTags.length > 0) {
                                        groupsArr = Array.from(aTags).map(a => a.textContent.trim()).filter(Boolean);
                                    } else {
                                        groupsArr = groupsDiv.innerHTML.split(/<br\s*\/?>/i)
                                            .map(g => g.replace(/<[^>]*>/g, '').trim())
                                            .filter(g => g.length > 1);
                                    }
                                    
                                    if (groupsArr.length > 0) {
                                        const visibleCount = 2;
                                        const visibleGroups = groupsArr.slice(0, visibleCount).join(', ');
                                        
                                        if (groupsArr.length > visibleCount) {
                                            const extraCount = groupsArr.length - visibleCount;
                                            const safeGroups = encodeURIComponent(JSON.stringify(groupsArr));
                                            
                                            groupsHtml = `
                                                <div style="color:var(--color-text-secondary); font-weight:500; font-size:1.2rem; text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                                                    <span>${visibleGroups}</span> 
                                                    <span class="groups-more-btn modal-groups-trigger" data-groups="${safeGroups}">+${extraCount} групп</span>
                                                </div>`;
                                        } else {
                                            groupsHtml = `<div style="color:var(--color-text-secondary); font-weight:500; font-size:1.2rem; text-align:right;">${visibleGroups}</div>`;
                                        }
                                    }
                                }

                                daysData[i].pairs.push({ time, subject, type, infoHtml, groupsHtml });
                            });
                        }
                    });

                    // --- СКРИНШОТ ГЕНЕРАТОР ---
                    const handleScreenshot = async (targetEl, fileName, btnEl) => {
                        let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                        if (!h2c) {
                            btnEl.textContent = 'error';
                            setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                            return;
                        }

                        const isMobile = window.innerWidth <= 960;
                        const renderWidth = isMobile ? 540 : 1000;

                        const exportContainer = document.createElement('div');
                        exportContainer.style.cssText = `position:absolute; top:0; left:-9999px; width:${renderWidth}px; padding:${isMobile ? '24px 24px 12px' : '40px 40px 20px'}; background:var(--color-body); z-index:-9999; box-sizing:border-box;`;

                        if (targetEl.classList.contains('teacher-days-container')) {
                            const title = document.createElement('h2');
                            title.textContent = h2Title ? h2Title.textContent.trim() : 'Расписание преподавателя';
                            title.style.textAlign = 'center';
                            title.style.marginBottom = isMobile ? '20px' : '30px';
                            title.style.fontSize = isMobile ? '1.8rem' : '2.2rem';
                            title.style.fontWeight = '800';
                            title.style.color = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#000';
                            exportContainer.appendChild(title);
                        }

                        const span9Wrapper = document.createElement('div');
                        span9Wrapper.className = 'span9';
                        span9Wrapper.style.cssText = 'margin:0 !important; padding:0 !important; width:100% !important; display:block;';

                        const clone = targetEl.cloneNode(true);
                        clone.style.margin = '0';

                        clone.querySelectorAll('.share-day-btn, .share-all-btn, .live-dot, .day-status-icon').forEach(el => el.remove());
                        clone.querySelectorAll('.pair-passed, td').forEach(el => {
                            el.classList.remove('pair-passed');
                            el.style.setProperty('opacity', '1', 'important');
                        });

                        const exportStyles = document.createElement('style');
                        exportStyles.innerHTML = `
                            .timetable-grid { table-layout: fixed !important; width: 100% !important; border-spacing: 0 !important; border-collapse: collapse !important; }
                            .timetable-grid td { white-space: normal !important; word-wrap: break-word !important; border-bottom: none !important; padding: 12px 0 !important; }
                            .timetable-grid td.pair_num { width: 90px !important; min-width: 90px !important; font-size: 1.1rem !important; text-align: center !important; padding: 12px 5px !important; }
                            .timetable-grid td.pair_info { width: auto !important; padding-left: 5px !important; padding-right: 5px !important; text-align: left !important; }
                            .timetable-grid td.pair_teacher { width: 250px !important; min-width: 200px !important; text-align: right !important; padding-right: 16px !important; display: table-cell !important; }
                            .timetable-grid tr:not(:last-child) {
                                background-image: linear-gradient(to right, transparent 90px, var(--color-table-border) 90px, var(--color-table-border) calc(100% - 16px), transparent calc(100% - 16px)) !important;
                                background-position: bottom !important; background-size: 100% 1px !important; background-repeat: no-repeat !important; background-color: transparent !important;
                            }
                        `;
                        clone.appendChild(exportStyles);
                        span9Wrapper.appendChild(clone);
                        
                        if (generalConfig.watermark) {
                            const watermark = document.createElement('div');
                            watermark.style.cssText = 'text-align: right; margin-top: 16px; font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;';
                            watermark.textContent = 'etisreborn.ru';
                            span9Wrapper.appendChild(watermark);
                        }

                        exportContainer.appendChild(span9Wrapper);
                        document.body.appendChild(exportContainer);

                        try {
                            const canvas = await h2c(exportContainer, {
                                scale: 2, 
                                useCORS: true, 
                                windowWidth: renderWidth, 
                                scrollY: 0,
                                backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim()
                            });
                            canvas.toBlob(blob => {
                                const file = new File([blob], fileName, { type: 'image/png' });
                                if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                                    navigator.share({ files: [file], title: fileName });
                                } else {
                                    const link = document.createElement('a');
                                    link.download = fileName; link.href = URL.createObjectURL(blob); link.click();
                                    URL.revokeObjectURL(link.href);
                                }
                                exportContainer.remove();
                                btnEl.textContent = 'check';
                                setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                            }, 'image/png');
                        } catch(err) {
                            exportContainer.remove();
                            btnEl.textContent = 'error';
                            setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                        }
                    };

                    const loadH2cAndShoot = (targetEl, fileName, btnEl) => {
                        let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                        if (!h2cObj) {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                            script.onload = () => handleScreenshot(targetEl, fileName, btnEl);
                            script.onerror = () => {
                                btnEl.textContent = 'error';
                                setTimeout(() => btnEl.textContent = 'ios_share', 2000);
                            };
                            document.head.appendChild(script);
                        } else {
                            handleScreenshot(targetEl, fileName, btnEl);
                        }
                    };

                    const daysContainer = document.createElement('div');
                    daysContainer.className = 'teacher-days-container';

                    if (teacherInfoHtml) {
                        const tCard = document.createElement('div');
                        tCard.style.cssText = 'background: var(--color-card); padding: 1.8rem 2.4rem; border-radius: var(--radius-large); margin-bottom: 2.4rem; font-size: 1.4rem; color: var(--color-text-primary); border: 1px solid var(--color-table-border); box-shadow: var(--shadow-main); display: flex; justify-content: space-between; align-items: center;';
                        tCard.innerHTML = `
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span class="material-icons" style="color:var(--color-accent);">person</span>
                                <div style="line-height:1.4;">${teacherInfoHtml.replace(/<br\s*\/?>/gi, ' <span style="color:var(--color-text-secondary); margin: 0 4px;">•</span> ')}</div>
                            </div>
                            <span class="material-icons share-all-btn" title="Поделиться расписанием" style="color:var(--color-text-secondary); cursor:pointer; font-size:2.4rem; padding: 4px; transition: color 0.2s;">ios_share</span>
                        `;
                        daysContainer.appendChild(tCard);

                        const shareAllBtn = tCard.querySelector('.share-all-btn');
                        shareAllBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            shareAllBtn.textContent = 'hourglass_empty';
                            const fileName = `Расписание (${h2Title ? h2Title.textContent.replace('Расписание преподавателей. ', '').trim() : 'Преподавателя'}).png`;
                            loadH2cAndShoot(daysContainer, fileName, shareAllBtn);
                        });
                    }

                    daysData.forEach(day => {
                        if (day.pairs.length === 0) return;

                        let datePart = '';
                        if (startWeekDate) {
                            const dayIndex = daysArr.indexOf(day.name);
                            if (dayIndex !== -1) {
                                const currentDayDate = new Date(startWeekDate);
                                currentDayDate.setDate(currentDayDate.getDate() + dayIndex);
                                datePart = `${currentDayDate.getDate()} ${monthsArrCase[currentDayDate.getMonth()]}`;
                            }
                        }

                        let leftDateHTML = '';
                        let rightDateHTML = '';
                        
                        if (datePart) {
                            if (generalConfig.datesLeft) {
                                leftDateHTML = `<span>,</span>&nbsp;<span class="day-date" style="font-size: 1.4rem; color: var(--color-text-secondary); font-weight: 500;">${datePart}</span>`;
                            } else {
                                rightDateHTML = `<span class="day-date">${datePart}</span>`;
                            }
                        }

                        const dayDiv = document.createElement('div');
                        dayDiv.className = 'day';

                        const h3 = document.createElement('h3');
                        h3.innerHTML = `
                            <div style="display:flex; align-items:center; gap: 6px;">
                                <div class="day-title-text-wrap" style="display:flex; align-items:center;">
                                    <span class="day-name">${day.name}</span>${leftDateHTML}
                                </div>
                            </div>
                            <div class="day-header-right">
                                ${rightDateHTML}
                                <span class="material-icons share-day-btn" title="Поделиться днем">ios_share</span>
                            </div>
                        `;
                        dayDiv.appendChild(h3);

                        h3.querySelector('.share-day-btn').addEventListener('click', (e) => {
                            e.stopPropagation();
                            const btn = e.currentTarget;
                            btn.textContent = 'hourglass_empty';
                            const fileName = `Расписание (${datePart || day.name}).png`;
                            loadH2cAndShoot(dayDiv, fileName, btn);
                        });

                        const gridTable = document.createElement('table');
                        gridTable.className = 'timetable timetable-grid'; 
                        const tbody = document.createElement('tbody');

                        day.pairs.forEach((pair, idx) => {
                            const tr = document.createElement('tr');
                            
                            let typeClass = 'type-badge-lek';
                            if (pair.type === 'практ') typeClass = 'type-badge-pract';
                            else if (pair.type === 'лаб') typeClass = 'type-badge-lab';
                            else if (pair.type === 'конс') typeClass = 'type-badge-cons';

                            tr.innerHTML = `
                                <td class="pair_num">
                                    <div class="pair-badge-wrapper">
                                        ${pair.type ? `<span class="pair-type-badge ${typeClass}">${pair.type}</span>` : ''}
                                    </div>
                                    ${idx + 1} пара<br><font class="eval">${pair.time}</font>
                                </td>
                                <td class="pair_info" style="text-align: left !important;">
                                    <div class="dis" style="text-align: left !important;"><span style="font-weight:700; color:var(--color-text-primary); font-size:1.45rem;">${pair.subject}</span></div>
                                    <div class="aud-list" style="margin-top:4px; text-align: left !important;">${pair.infoHtml}</div>
                                </td>
                                <td class="pair_teacher">
                                    <div style="text-align:right; line-height:1.5; margin-left:auto;">
                                        ${pair.groupsHtml}
                                    </div>
                                </td>
                            `;
                            tbody.appendChild(tr);
                        });

                        gridTable.appendChild(tbody);
                        dayDiv.appendChild(gridTable);
                        daysContainer.appendChild(dayDiv);
                    });

                    table.replaceWith(daysContainer);

                    // Обработчик для модальных окон со списком групп
                    daysContainer.querySelectorAll('.modal-groups-trigger').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const groups = JSON.parse(decodeURIComponent(btn.getAttribute('data-groups')));
                            
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
                                    <span class="ui-dialog-title">Учебные группы (${groups.length})</span>
                                    <button class="close-analytics" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                                </div>
                                <div class="ui-dialog-content" style="padding: 2.4rem;">
                                    <div style="display:flex; flex-direction:column; gap:8px;">
                                        ${groups.map(g => `<div style="background:var(--color-highlight); padding:1.2rem 1.6rem; border-radius:var(--radius-small); font-size:1.3rem; color:var(--color-text-primary); font-weight:600;">${g}</div>`).join('')}
                                    </div>
                                </div>
                            `;

                            const closeAnalytics = () => { 
                                overlay.classList.remove('active'); 
                                modal.classList.remove('active'); 
                                document.body.classList.remove('modal-open-body');
                            };
                            overlay.onclick = closeAnalytics;
                            modal.querySelector('.close-analytics').onclick = closeAnalytics;

                            overlay.classList.add('active');
                            modal.classList.add('active');
                            document.body.classList.add('modal-open-body');
                        });
                    });

                    // Инициализация свайпов для преподавателя (Мобильные)
                    function initTeacherMobileSwipes() {
                        if (window.innerWidth > 960) return;
                        let bubble = document.getElementById('swipe-action-bubble');
                        if (!bubble) {
                            bubble = document.createElement('div');
                            bubble.id = 'swipe-action-bubble';
                            bubble.innerHTML = '<span class="material-icons"></span>';
                            document.body.appendChild(bubble);
                        }
                        const iconEl = bubble.querySelector('.material-icons');
                        let startX = 0, startY = 0;
                        let currentTarget = null, targetType = '', isSwiping = false, swipeDir = '', originalRect = null, isScrollDetermined = false;
                        const THRESHOLD = 70;

                        daysContainer.addEventListener('touchstart', (e) => {
                            const touch = e.touches[0];
                            startX = touch.clientX; startY = touch.clientY;
                            isSwiping = false; isScrollDetermined = false; swipeDir = '';
                            currentTarget = null; originalRect = null;

                            const dayHeader = e.target.closest('.day h3');
                            if (dayHeader) {
                                currentTarget = dayHeader.closest('.day');
                                targetType = 'day';
                                originalRect = currentTarget.getBoundingClientRect();
                                currentTarget.style.transition = 'none';
                            }
                        }, { passive: true });

                        daysContainer.addEventListener('touchmove', (e) => {
                            if (!currentTarget || !originalRect) return;
                            const touch = e.touches[0];
                            const diffX = touch.clientX - startX;
                            const diffY = touch.clientY - startY;

                            if (!isScrollDetermined) {
                                if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;
                                isScrollDetermined = true;
                                if (Math.abs(diffY) > Math.abs(diffX) || diffX > 0) { // Разрешаем свайп только ВЛЕВО (поделиться)
                                    currentTarget = null; return;
                                }
                                isSwiping = true;
                                bubble.className = '';
                                iconEl.textContent = 'ios_share';
                            }

                            if (isSwiping) {
                                swipeDir = 'left';
                                let moveX = diffX;
                                if (Math.abs(moveX) > THRESHOLD) moveX = -THRESHOLD - (Math.abs(moveX) - THRESHOLD) * 0.25;
                                
                                currentTarget.style.transform = `translateX(${moveX}px)`;
                                
                                bubble.style.top = `${originalRect.top + originalRect.height / 2 - 12}px`;
                                bubble.style.left = `${originalRect.right + (moveX / 2) - 12}px`;
                                bubble.style.opacity = Math.min(Math.abs(diffX) / 30, 1).toString();

                                if (Math.abs(diffX) >= THRESHOLD) {
                                    bubble.classList.add('active-threshold', 'action-share');
                                    if (!bubble.dataset.vibrated && navigator.vibrate) {
                                        navigator.vibrate(15); bubble.dataset.vibrated = 'true';
                                    }
                                } else {
                                    bubble.classList.remove('active-threshold', 'action-share');
                                    bubble.dataset.vibrated = '';
                                }
                            }
                        }, { passive: true });

                        daysContainer.addEventListener('touchend', (e) => {
                            if (!currentTarget || !isSwiping) return;
                            const diffX = e.changedTouches[0].clientX - startX;
                            const target = currentTarget;
                            
                            currentTarget.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            currentTarget.style.transform = 'translateX(0px)';
                            
                            bubble.style.opacity = '0';
                            bubble.classList.remove('active-threshold', 'action-share');
                            bubble.dataset.vibrated = '';

                            if (diffX <= -THRESHOLD) {
                                setTimeout(() => {
                                    const shareBtn = target.querySelector('.share-day-btn');
                                    if (shareBtn) shareBtn.click();
                                }, 150);
                            }
                            currentTarget = null; isSwiping = false;
                        });
                    }
                    initTeacherMobileSwipes();

                    // Затемнение прошедших пар
                    function dimTeacherPastPairs() {
                        if (!generalConfig.dimPastPairs) return;
                        const days = daysContainer.querySelectorAll('.day');
                        const now = new Date();
                        const todayMins = now.getHours() * 60 + now.getMinutes();
                        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                        days.forEach(day => {
                            const dateEl = day.querySelector('.day-date');
                            if (!dateEl) return;
                            
                            let classDateObj = new Date();
                            const dateStr = dateEl.textContent.trim();
                            const match = dateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                            
                            if (match) {
                                const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                                classDateObj.setMonth(m);
                                classDateObj.setDate(parseInt(match[1]));
                            }
                            classDateObj.setHours(0,0,0,0);
                            const classTime = classDateObj.getTime();

                            const isPastDay = classTime < todayZero;
                            const isToday = classTime === todayZero;

                            day.querySelectorAll('.timetable-grid tr').forEach(row => {
                                let isPassed = false;
                                
                                if (isPastDay) {
                                    isPassed = true;
                                } else if (isToday) {
                                    let startMins = -1;
                                    const timeEl = row.querySelector('.eval');
                                    if (timeEl) {
                                        const timeMatch = timeEl.textContent.match(/(\d{1,2}):(\d{2})/);
                                        if (timeMatch) {
                                            startMins = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
                                        }
                                    }

                                    if (startMins !== -1) {
                                        if (todayMins >= (startMins + 90)) isPassed = true;
                                    }
                                }

                                if (isPassed) {
                                    row.classList.add('pair-passed');
                                } else {
                                    row.classList.remove('pair-passed');
                                }
                            });
                        });
                    }
                    dimTeacherPastPairs();
                    setInterval(dimTeacherPastPairs, 60000);

                    // Лайв-индикаторы
                    if (typeof updateLiveTimetable === 'function') {
                        updateLiveTimetable();
                    }
                }
            }

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
                    if (generalConfig.watermark) {
                        const watermark = document.createElement('div');
                        watermark.style.cssText = 'text-align: right; margin-top: 12px; width: 100%; box-sizing: border-box;';
                        watermark.innerHTML = `<span style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;">etisreborn.ru</span>`;
                        span9Wrapper.appendChild(watermark);
                    }
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

                let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));

                if (!h2cObj) {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    
                    script.onload = () => {
                        renderScreenshot();
                    };
                    
                    script.onerror = () => {
                        if (originalBtnContainer) {
                            originalBtnContainer.innerHTML = '<span class="material-icons" style="font-size:18px; color:var(--color-red);">error</span>';
                            setTimeout(() => { originalBtnContainer.innerHTML = originalSVG; }, 2000);
                        }
                    };
                    safeAppend(script);
                } else {
                    renderScreenshot();
                }
            };

            // --- ФУНКЦИЯ СВАЙПОВ ДЛЯ СООБЩЕНИЙ/ОБЪЯВЛЕНИЙ (МОБИЛЬНЫЕ) ---
            const initMessageSwipes = (container, defaultFileName) => {
                if (window.innerWidth > 960) return; // Только для мобилок

                let bubble = document.getElementById('swipe-action-bubble');
                if (!bubble) {
                    bubble = document.createElement('div');
                    bubble.id = 'swipe-action-bubble';
                    bubble.innerHTML = '<span class="material-icons"></span>';
                    document.body.appendChild(bubble);
                }
                const iconEl = bubble.querySelector('.material-icons');

                let startX = 0, startY = 0, currentCard = null, originalRect = null;
                let isSwiping = false, isScrollDetermined = false;
                const THRESHOLD = 80;

                container.addEventListener('touchstart', (e) => {
                    const touch = e.touches[0];
                    startX = touch.clientX; startY = touch.clientY;
                    isSwiping = false; isScrollDetermined = false;
                    currentCard = e.target.closest('.msg-card');
                    
                    if (currentCard) {
                        originalRect = currentCard.getBoundingClientRect();
                        currentCard.style.transition = 'none';
                    }
                }, { passive: true });

                container.addEventListener('touchmove', (e) => {
                    if (!currentCard || !originalRect) return;
                    const touch = e.touches[0];
                    const diffX = touch.clientX - startX;
                    const diffY = touch.clientY - startY;

                    if (!isScrollDetermined) {
                        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;
                        isScrollDetermined = true;
                        // Разрешаем только свайп ВЛЕВО (diffX < 0). Скролл вниз игнорируем
                        if (Math.abs(diffY) > Math.abs(diffX) || diffX > 0) { 
                            currentCard = null; return; 
                        }
                        isSwiping = true;
                        bubble.className = '';
                        iconEl.textContent = 'ios_share';
                    }

                    if (isSwiping && diffX < 0) {
                        let moveX = diffX;
                        // Пружинистое сопротивление
                        if (Math.abs(moveX) > THRESHOLD) moveX = -THRESHOLD - (Math.abs(moveX) - THRESHOLD) * 0.25;

                        currentCard.style.transform = `translateX(${moveX}px)`;
                        
                        bubble.style.top = `${originalRect.top + originalRect.height / 2 - 12}px`;
                        bubble.style.left = `${originalRect.right + (moveX / 2) - 12}px`;
                        bubble.style.opacity = Math.min(Math.abs(diffX) / 30, 1).toString();

                        if (Math.abs(diffX) >= THRESHOLD) {
                            bubble.classList.add('active-threshold', 'action-share');
                            if (!bubble.dataset.vibrated && navigator.vibrate) {
                                navigator.vibrate(15); bubble.dataset.vibrated = 'true';
                            }
                        } else {
                            bubble.classList.remove('active-threshold', 'action-share');
                            bubble.dataset.vibrated = '';
                        }
                    }
                }, { passive: true });

                container.addEventListener('touchend', (e) => {
                    if (!currentCard || !isSwiping) return;
                    const diffX = e.changedTouches[0].clientX - startX;
                    const cardToShare = currentCard;
                    
                    currentCard.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    currentCard.style.transform = 'translateX(0px)';
                    
                    bubble.style.opacity = '0';
                    bubble.classList.remove('active-threshold', 'action-share');
                    bubble.dataset.vibrated = '';

                    if (diffX <= -THRESHOLD) {
                        setTimeout(() => shareMessageCard(cardToShare, defaultFileName), 150);
                    }
                    currentCard = null; isSwiping = false;
                });
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

                case 'stu_phs.show_slots': {
                    // 1. Меняем главный заголовок 
                    const h2 = span9.querySelector('h2');
                    if (h2 && h2.textContent.includes('Прикладная')) {
                        h2.textContent = 'Учебный период и количество занятий';
                        h2.style.marginBottom = '2.4rem';
                    }

                    // 2. Ремонтируем и стилизуем таблицу
                    const table = span9.querySelector('table.common');
                    if (table) {
                        // Удаляем первый <th> и <td> в каждой строке
                        table.querySelectorAll('tr').forEach(row => {
                            if (row.children.length > 0) {
                                row.children[0].remove();
                            }
                        });

                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        
                        wrapper.style.marginBottom = '3rem';

                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);

                        // Убираем дефолтные рамки
                        table.style.boxShadow = 'none';
                        table.style.border = 'none';
                        table.style.minWidth = '600px'; 

                        // Перебиваем глобальные стили ширины и выравнивания первой колонки
                        table.querySelectorAll('th, td').forEach(cell => {
                            cell.style.setProperty('text-align', 'center', 'important');
                            cell.style.setProperty('min-width', 'auto', 'important');
                            cell.style.verticalAlign = 'middle';
                            cell.style.padding = '2rem 1rem';
                            cell.style.fontSize = '1.3rem';
                            cell.style.borderBottom = 'none'; 
                            
                            // Заменяем <br> в шапке (например 1<br>трим) на пробел (1 ТРИМ)
                            if (cell.tagName === 'TH') {
                                cell.innerHTML = cell.innerHTML.replace(/<br\s*\/?>/gi, ' ').toUpperCase();
                                cell.style.color = 'var(--color-text-secondary)';
                                cell.style.letterSpacing = '1px';
                            }
                        });

                        // Умная раскраска капсул по прогрессу посещений
                        table.querySelectorAll('td[onclick]').forEach(td => {
                            const text = td.textContent.trim();
                            if (text && text !== '-') {
                                let bg = 'var(--color-highlight)';
                                let color = 'var(--color-text-primary)';
                                
                                const match = text.match(/(\d+)\/(\d+)/);
                                if (match) {
                                    const current = parseInt(match[1], 10);
                                    const total = parseInt(match[2], 10);
                                    
                                    if (current === 0) {
                                        bg = 'var(--color-highlight)';
                                        color = 'var(--color-text-primary)';
                                    } else if (current >= total) {
                                        bg = 'rgba(52, 199, 89, 0.15)'; // Зеленый - выполнено
                                        color = 'var(--color-green)';
                                    } else {
                                        bg = 'rgba(0, 122, 255, 0.15)'; // Синий - в процессе
                                        color = 'var(--color-blue)';
                                    }
                                }
                                
                                td.innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.8rem 1.6rem; border-radius: 50px; font-weight: 800; display: inline-block; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none;">${text}</span>`;
                                
                                td.addEventListener('mouseenter', () => {
                                    const span = td.querySelector('span');
                                    if(span) span.style.transform = 'scale(1.1)';
                                });
                                td.addEventListener('mouseleave', () => {
                                    const span = td.querySelector('span');
                                    if(span) span.style.transform = 'scale(1)';
                                });
                            }
                        });
                    }

                    // 3. Стилизуем подзаголовок перед правилами
                    const h4 = span9.querySelector('h4');
                    if (h4) {
                        const newH3 = document.createElement('h3');
                        newH3.textContent = h4.textContent;
                        newH3.style.fontSize = '1.8rem';
                        newH3.style.fontWeight = '800';
                        newH3.style.marginBottom = '1.6rem';
                        newH3.style.marginTop = '1rem';
                        h4.replaceWith(newH3);
                    }

                    // Ищем блоки текста
                    const textDivs = Array.from(span9.querySelectorAll('div[style*="padding:10px 20px"]'));

                    // 4. Оформляем блок инструкций
                    if (textDivs.length > 0) {
                        const rulesDiv = textDivs[0];
                        rulesDiv.removeAttribute('style');
                        rulesDiv.style.cssText = `
                            background: var(--color-card);
                            border: 1px solid var(--color-table-border);
                            border-radius: var(--radius-large);
                            box-shadow: var(--shadow-main);
                            padding: 2.4rem;
                            margin-bottom: 2.4rem;
                        `;
                        
                        const ul = rulesDiv.querySelector('ul');
                        if (ul) {
                            ul.style.listStyle = 'none';
                            ul.style.padding = '0';
                            ul.style.margin = '0';
                            
                            ul.querySelectorAll('li').forEach((li, index, array) => {
                                li.style.position = 'relative';
                                li.style.paddingLeft = '3.6rem';
                                li.style.marginBottom = (index === array.length - 1) ? '0' : '1.6rem';
                                li.style.lineHeight = '1.6';
                                li.style.fontSize = '1.35rem';
                                li.style.color = 'var(--color-text-primary)';
                                
                                const icon = document.createElement('span');
                                icon.className = 'material-icons';
                                icon.textContent = 'info_outline';
                                icon.style.cssText = `
                                    position: absolute;
                                    left: 0;
                                    top: 0px;
                                    font-size: 2.2rem;
                                    color: var(--color-green);
                                `;
                                li.insertBefore(icon, li.firstChild);
                            });
                        }
                    }

                    // 5. Оформляем форму (нижняя карточка)
                    const formDiv = textDivs[1] || span9.querySelector('form')?.parentElement;
                    if (formDiv && formDiv.querySelector('form')) {
                        formDiv.removeAttribute('style');
                        const form = formDiv.querySelector('form');
                        
                        form.style.cssText = `
                            background: var(--color-card);
                            border: 1px solid var(--color-table-border);
                            border-radius: var(--radius-large);
                            box-shadow: var(--shadow-main);
                            padding: 2.4rem;
                            display: flex;
                            flex-direction: column;
                            gap: 1.6rem;
                        `;

                        form.querySelectorAll('div[style*="margin-bottom:5px"]').forEach(div => {
                            div.removeAttribute('style');
                            div.style.display = 'flex';
                            div.style.alignItems = 'center';
                            div.style.gap = '1.2rem';
                            div.style.fontSize = '1.4rem';
                            div.style.color = 'var(--color-text-primary)';
                            div.style.flexWrap = 'wrap';

                            const label = div.querySelector('label');
                            if (label) {
                                label.style.margin = '0';
                                label.style.cursor = 'pointer';
                                label.style.fontWeight = '500';
                            }
                            
                            const select = div.querySelector('select');
                            if (select) {
                                select.style.padding = '0.8rem 3.5rem 0.8rem 1.6rem';
                                select.style.fontSize = '1.3rem';
                                select.style.borderRadius = 'var(--radius-small)';
                                select.style.border = '1px solid var(--color-table-border)';
                                select.style.background = 'var(--color-input)';
                                select.style.color = 'var(--color-text-primary)';
                                select.style.fontWeight = '600';
                            }
                        });

                        const btnWrap = form.querySelector('.button_gray');
                        if (btnWrap) {
                            btnWrap.className = '';
                            btnWrap.style.marginTop = '1.6rem';
                            
                            const btn = btnWrap.querySelector('button');
                            if (btn) {
                                btn.className = 'answer-btn-custom';
                                btn.innerHTML = '<span class="material-icons" style="font-size:2rem; margin-right:8px">save</span>Сохранить';
                                btn.style.cssText = `
                                    background: var(--color-green) !important;
                                    color: #fff !important;
                                    border: none !important;
                                    padding: 1.4rem 2.4rem !important;
                                    font-size: 1.4rem !important;
                                    cursor: pointer;
                                    border-radius: 50px !important;
                                    font-weight: 700 !important;
                                    display: inline-flex !important;
                                    align-items: center !important;
                                    box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2) !important;
                                `;
                            }
                        }
                    }

                    // Чистим мусорные <br>, чтобы не было лишних пустых пространств
                    Array.from(span9.childNodes).forEach(node => {
                        if (node.tagName === 'BR') node.remove();
                    });

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

                        // Функция вытаскивает адрес ссылки из текста "window.open('ссылка', ...)"
                        const extractUrl = (el) => {
                            if (!el || !el.querySelector('img')) return '#';
                            const onclick = el.querySelector('img').getAttribute('onclick');
                            if (!onclick) return '#';
                            const match = onclick.match(/window\.open\(\s*['"]([^'"]+)['"]/);
                            return match ? match[1] : '#';
                        };

                        const nameUrl = extractUrl(nameDiv);
                        const chairUrl = extractUrl(chairDiv);

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
                                <a class="teacher-name-link" href="${nameUrl}" target="_blank">${nameText.replace('Расписание преподавателя', '')}</a>

                                <div class="teacher-meta-row">
                                    <a class="teacher-dept-link" href="${chairUrl}" target="_blank">${chairText.replace('Расписание кафедры', '')}</a>
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
                // --- ГЕНЕРАЦИЯ ВОСКРЕСЕНЬЯ ---
                if (generalConfig.showSunday) {
                    const days = Array.from(span9.querySelectorAll('div.day'));
                    if (days.length > 0) {
                        const lastDay = days[days.length - 1];
                        const lastH3 = lastDay.querySelector('h3');
                        
                        // Проверяем, нет ли уже Воскресенья (на всякий случай)
                        if (lastH3 && !lastH3.textContent.includes('Воскресенье')) {
                            const text = lastH3.textContent.trim();
                            let nextDateStr = "";
                            
                            // Ищем дату в формате "Суббота, 18 мая 2024" или "Суббота, 18.05.2024"
                            const matchText = text.match(/,\s*(\d{1,2})\s+([а-яА-Я]+)(?:\s+(\d{4}))?/i);
                            const matchNum = text.match(/,\s*(\d{2})\.(\d{2})(?:\.(\d{4}))?/);

                            if (matchText) {
                                const d = parseInt(matchText[1], 10);
                                const mStr = matchText[2].toLowerCase();
                                const monthsMap = { 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 };
                                const monthsArr = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                                const m = monthsMap[mStr];
                                let y = matchText[3] ? parseInt(matchText[3], 10) : new Date().getFullYear();
                                
                                if (m !== undefined) {
                                    let dateObj = new Date(y, m, d);
                                    dateObj.setDate(dateObj.getDate() + 1); // Прибавляем 1 день
                                    nextDateStr = `${dateObj.getDate()} ${monthsArr[dateObj.getMonth()]}${matchText[3] ? ' ' + dateObj.getFullYear() : ''}`;
                                }
                            } else if (matchNum) {
                                const d = parseInt(matchNum[1], 10);
                                const m = parseInt(matchNum[2], 10) - 1;
                                let y = matchNum[3] ? parseInt(matchNum[3], 10) : new Date().getFullYear();
                                
                                let dateObj = new Date(y, m, d);
                                dateObj.setDate(dateObj.getDate() + 1);
                                nextDateStr = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth()+1).padStart(2, '0')}${matchNum[3] ? '.' + dateObj.getFullYear() : ''}`;
                            }

                            // Создаем структуру как у оригинального ЕТИСа
                            const sundayDiv = document.createElement('div');
                            sundayDiv.className = 'day';
                            sundayDiv.innerHTML = `<h3>Воскресенье${nextDateStr ? ', ' + nextDateStr : ''}</h3><div class="no_pairs">Занятий нет</div>`;
                            lastDay.parentNode.insertBefore(sundayDiv, lastDay.nextSibling);
                        }
                    }
                }

                // --- ОФОРМЛЕНИЕ ВЫХОДНЫХ ДНЕЙ (0 ПАР) ---
                span9.querySelectorAll('.no_pairs').forEach(el => {
                    const table = document.createElement('table');
                    table.className = 'timetable-grid'; 

                    table.innerHTML = `
                        <tbody>
                            <tr class="custom-no-pairs">
                                <td class="pair_num" style="border-bottom: none !important; border-right: none !important;">
                                    <div class="pair-badge-wrapper">
                                        <span class="pair-type-badge type-badge-holiday">ВЫХ</span>
                                    </div>
                                    0 пар<br><font class="eval">00:00</font>
                                </td>
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

                    const renderTimetable = async () => {
                        let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                        if (!h2c) {
                            console.error('html2canvas не найден');
                            shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">error</span> Ошибка';
                            setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                            return;
                        }

                        const isMobile = window.innerWidth <= 960;
                        const renderWidth = isMobile ? 540 : 1000;

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

                        if (isMobile) exportContainer.style.minHeight = (renderWidth * 16 / 9) + 'px';

                        let fileName = 'Расписание.png';

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

                        const span9Wrapper = document.createElement('div');
                        span9Wrapper.className = 'span9';
                        span9Wrapper.style.setProperty('margin', '0', 'important');
                        span9Wrapper.style.setProperty('padding', '0', 'important');
                        span9Wrapper.style.setProperty('width', '100%', 'important');

                        const timetableClone = document.querySelector('.timetable').cloneNode(true);

                        // ДОЖИДАЕМСЯ ПОДГОТОВКИ (В ТОМ ЧИСЛЕ ЗАГРУЗКИ QR-КОДОВ ИЗ API)
                        await cleanTimetableForExport(timetableClone);

                        span9Wrapper.appendChild(timetableClone);

                        if (generalConfig.watermark) {
                            const watermark = document.createElement('div');
                            watermark.style.cssText = 'text-align: right; margin-top: 16px; width: 100%; box-sizing: border-box;';
                            watermark.innerHTML = `<span style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.3; letter-spacing: 0.5px;">etisreborn.ru</span>`;
                            span9Wrapper.appendChild(watermark);
                        }

                        exportContainer.appendChild(span9Wrapper);

                        const hideUIStyle = document.createElement('style');
                        hideUIStyle.innerHTML = `
                            .live-dot, .add-custom-pair-btn, .delete-custom-pair-btn, .subject-note-btn { display: none !important; opacity: 0 !important; visibility: hidden !important; }
                            .msg-sender, .msg-sender .material-icons, .teacher-name-link, .review-dis-link, .tpr_part > a, .theme a, .logo-say-hey, .accent-stat { background: none !important; -webkit-background-clip: initial !important; -webkit-text-fill-color: initial !important; color: var(--color-accent) !important; }
                        `;
                        exportContainer.appendChild(hideUIStyle);
                        document.body.appendChild(exportContainer);

                        h2c(exportContainer, {
                            scale: 2,
                            useCORS: true,
                            windowWidth: isMobile ? renderWidth : 1200,
                            backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim() || '#F2F2F6'
                        }).then(canvas => {
                            canvas.toBlob(blob => {
                                if (!blob) throw new Error('Blob creation failed');
                                const file = new File([blob], fileName, { type: 'image/png' });

                                if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                                    navigator.share({ files: [file], title: 'Расписание' }).then(() => {
                                        exportContainer.remove();
                                        shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">check</span> Готово!';
                                        setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                                    }).catch(err => {
                                        exportContainer.remove();
                                        shareBtn.innerHTML = originalText;
                                    });
                                } else {
                                    const link = document.createElement('a');
                                    link.download = fileName; link.href = URL.createObjectURL(blob); link.click();
                                    URL.revokeObjectURL(link.href);
                                    exportContainer.remove();
                                    shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">check</span> Сохранено!';
                                    setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                                }
                            }, 'image/png');
                        }).catch(err => {
                            exportContainer.remove();
                            shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">error</span> Ошибка';
                            setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                        });
                    };

                    // Загрузчик ТОЛЬКО для html2canvas
                    let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                    if (!h2cObj) {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                        script.onload = renderTimetable;
                        script.onerror = () => {
                            shareBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">error</span> Ошибка';
                            setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                        };
                        safeAppend(script);
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
                                const typeBadge = row.querySelector('.pair-type-badge');
                                const disName = row.querySelector('.dis') ? row.querySelector('.dis').textContent.toLowerCase() : '';
                                
                                let isCountable = false;
                                if (typeBadge) {
                                    const t = typeBadge.textContent.toLowerCase();
                                    // Считаем только учебные типы (личное игнорируем)
                                    if (t.includes('лек') || t.includes('практ') || t.includes('лаб') || t.includes('экз') || t.includes('зач')) {
                                        isCountable = true;
                                    }
                                } else if (disName.includes('консультация') || disName.includes('экзамен') || disName.includes('зачет') || disName.includes('зачёт')) {
                                    isCountable = true;
                                }
                                
                                if (isCountable) totalCount++;
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
                    let lek = 0, pract = 0, lab = 0, cons = 0, exam = 0;

                    // Считаем текущие пары
                    span9.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
                        if (row.style.display === 'none' || row.classList.contains('hidden-by-filter')) return;
                        if (!row.querySelector('.pair_info')) return;

                        const typeBadge = row.querySelector('.pair-type-badge');
                        const disName = row.querySelector('.dis') ? row.querySelector('.dis').textContent.toLowerCase() : '';

                        let counted = false;

                        if (typeBadge) {
                            const t = typeBadge.textContent.toLowerCase();
                            if (t.includes('лек')) { lek++; counted = true; }
                            else if (t.includes('практ')) { pract++; counted = true; }
                            else if (t.includes('лаб')) { lab++; counted = true; }
                            else if (t.includes('экз') || t.includes('зач')) { exam++; counted = true; }
                        } 
                        
                        if (!counted) {
                            if (disName.includes('консультация')) { cons++; counted = true; }
                            else if (disName.includes('экзамен') || disName.includes('зачет') || disName.includes('зачёт')) { exam++; counted = true; }
                        }
                        // Строки без этих тегов (например, физра) вообще не считаются!
                    });

                    // ИТОГО (Только строго учтенные лекции, практики, лабы, консультации и экзамены)
                    const total = lek + pract + lab + cons + exam;

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

                        const diff = Math.round((total - avgVal) * 10) / 10;
                        const absDiff = Math.abs(diff);
                        const word = getPairsWord(diff);

                        if (diff > 0) {
                            comparisonHtml = `<span style="color:var(--color-red); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem;">(выше среднего на ${diff} ${word})</span>`;
                        } else if (diff < 0) {
                            comparisonHtml = `<span style="color:var(--color-green); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem;">(ниже на ${absDiff} ${word})</span>`;
                        } else {
                            comparisonHtml = `<span style="color:var(--color-text-secondary); font-weight:600; margin-left:8px; text-transform: none; font-size: 1.1rem; opacity: 0.8;">(в пределах нормы)</span>`;
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
                                        <span class="stat-box-title">Учебных пар</span>
                                        <span class="stat-box-value">${avgRounded}</span>
                                    </div>
                                    <div class="stat-box">
                                        <span class="stat-box-title">Времени на учебе</span>
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

                    // Генерация капсул категорий (Без личных и другого)
                    let badgesHtml = '';
                    if (lek > 0) badgesHtml += `<div style="background: rgba(0, 122, 255, 0.1); color: var(--color-blue); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Лекции: ${lek}</div>`;
                    if (pract > 0) badgesHtml += `<div style="background: rgba(52, 199, 89, 0.1); color: var(--color-green); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Практики: ${pract}</div>`;
                    if (lab > 0) badgesHtml += `<div style="background: rgba(255, 149, 0, 0.1); color: var(--color-warning); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Лабы: ${lab}</div>`;
                    if (exam > 0) badgesHtml += `<div style="background: rgba(255, 59, 48, 0.1); color: var(--color-red); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Зачет/Экзамен: ${exam}</div>`;
                    if (cons > 0) badgesHtml += `<div style="background: var(--color-highlight); color: var(--color-text-primary); border: 1px solid var(--color-table-border); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 1.2rem; font-weight: 700;">Консультации: ${cons}</div>`;
                    if (total === 0) badgesHtml += `<div style="color: var(--color-text-secondary); font-size: 1.3rem;">На этой неделе учебных пар нет! ☕</div>`;

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
                                        <span class="stat-box-title">Учебных пар</span>
                                        <span class="stat-box-value">${total}</span>
                                    </div>
                                    <div class="stat-box">
                                        <span class="stat-box-title">Времени на учебе</span>
                                        <span class="stat-box-value accent-stat">${timeStr}</span>
                                    </div>
                                </div>
                                <div style="margin-top: 1.2rem;">
                                    <div style="display:flex; gap: 0.8rem; flex-wrap: wrap;">
                                        ${badgesHtml}
                                    </div>
                                </div>
                            </div>
                            ${avgHtml}
                        </div>
                    `;

                    const closeAnalytics = () => { 
                        overlay.classList.remove('active'); 
                        modal.classList.remove('active'); 
                        document.body.classList.remove('modal-open-body');
                    };
                    overlay.onclick = closeAnalytics;
                    modal.querySelector('.close-analytics').onclick = closeAnalytics;

                    overlay.classList.add('active');
                    modal.classList.add('active');
                    document.body.classList.add('modal-open-body');
                });

                // --- КНОПКА "ДОБАВИТЬ ПАРУ" В ТУЛБАРЕ ---
                const addPairBtn = document.createElement('div');
                addPairBtn.className = 'toolbar-item';
                addPairBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">add_circle_outline</span> Добавить';
                toolbar.appendChild(addPairBtn);

                addPairBtn.addEventListener('click', () => {
                    openCustomPairModal(null, true);
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

                                // Пересчитываем окна и нумерацию пар
                                if (typeof recalculateTimetable === 'function') recalculateTimetable();
                                renderNotes();

                                updateLiveTimetable();
                                
                                // Принудительно заново рассчитываем затемнение прошедших пар
                                dimPastPairs();

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

                // --- 3. КНОПКА "СИНХРОНИЗАЦИЯ" (С ИМПОРТОМ) ---
                const syncHeader = Array.from(document.querySelectorAll('h2')).find(h2 => h2.querySelector('#tb_show') || h2.textContent.includes('Синхронизация'));
                if (syncHeader) {
                    const resourcesDiv = document.getElementById('resources');
                    if (resourcesDiv) {
                        resourcesDiv.className = 'sync-card';

                        // 1. Скрываем всё оригинальное содержимое ЕТИСа
                        Array.from(resourcesDiv.children).forEach(child => {
                            child.style.display = 'none';
                        });

                        let etisLink = '';
                        const textBox = resourcesDiv.querySelector('#textbox');
                        if (textBox) etisLink = textBox.value;

                        // 2. Создаем новый интерфейс (с инструкциями)
                        const newUI = document.createElement('div');
                        newUI.innerHTML = `
                            <div class="sync-tabs">
                                <button class="sync-tab active" data-tab="export">Экспорт в календарь</button>
                                <button class="sync-tab" data-tab="import">Импорт из календаря</button>
                            </div>
                            
                            <div class="sync-tab-content active" id="sync-tab-export">
                                <div style="background: var(--color-highlight); padding: 1.6rem; border-radius: var(--radius-medium); font-size: 1.3rem; line-height: 1.5; color: var(--color-text-primary); margin-bottom: 1.6rem;">
                                    <b>Чтобы подключить своё расписание к различным сервисам календарей, Вам необходимо (на примере Google Calendar):</b><br><br>
                                    1. Нажать кнопку "Скопировать" и скопировать ссылку на свой календарь.<br>
                                    2. Перейти в настройки Google Calendar в правом верхнем углу (изображение зубчатого колеса).<br>
                                    3. В меню с левой стороны нажать "Добавить календарь" и далее нажать "Добавить по URL".<br>
                                    4. В поле URL календаря вставить ссылку на Ваш календарь из личного кабинета (пункт 1).<br>
                                    5. Нажать кнопку "Добавить календарь". Синхронизация может занимать некоторое время.
                                </div>
                                <div style="display: flex; justify-content: flex-start; gap: 1.2rem; flex-wrap: wrap;">
                                    <button class="answer-btn-custom copy-etis-link-btn" style="background: var(--color-accent) !important; color: #fff !important;">
                                        <span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">content_copy</span>Скопировать
                                    </button>
                                    <button class="answer-btn-custom unsub-etis-btn" style="background: var(--color-highlight) !important; color: var(--color-red) !important; border: 1px solid rgba(255,59,48,0.3) !important; box-shadow: none !important;">
                                        <span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">delete_outline</span>Отписаться
                                    </button>
                                </div>
                            </div>

                            <div class="sync-tab-content" id="sync-tab-import">
                                <p style="color: var(--color-text-secondary); margin-bottom: 1.2rem; font-size: 1.3rem; line-height: 1.5;">Вставьте ссылку на ваш публичный календарь в формате <b>.ics</b> (iCloud, Google), чтобы видеть личные события прямо в расписании ЕТИС. Можно добавить несколько!</p>
                                
                                <div id="ext-cals-list" style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.2rem;"></div>

                                <div style="display: flex; gap: 1rem; margin-bottom: 1.6rem; flex-wrap: wrap; align-items: stretch;">
                                    <input type="text" id="ext-cal-input" placeholder="webcal://... или https://..." style="flex: 1; min-width: 250px; padding: 1.2rem 1.6rem !important; border-radius: var(--radius-small) !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; color: var(--color-text-primary) !important; font-size: 1.3rem !important; box-shadow: none !important; margin: 0 !important;">
                                    
                                    <button class="answer-btn-custom" id="ext-cal-add" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important; height: auto !important; margin: 0 !important;">
                                        <span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">add</span>Добавить
                                    </button>
                                </div>
                                
                                <div style="background: var(--color-highlight); padding: 1.6rem; border-radius: var(--radius-medium); font-size: 1.3rem; color: var(--color-text-primary); line-height: 1.5;">
                                    <b style="display:block; margin-bottom: 8px;">Как получить ссылку на примере iPhone:</b>
                                    1. Откройте приложение «Календарь».<br>
                                    2. Нажмите «Календари» внизу экрана.<br>
                                    3. Нажмите иконку «i» справа от нужного календаря.<br>
                                    4. Включите тумблер «Публичный календарь».<br>
                                    5. Нажмите «Поделиться ссылкой» и скопируйте её сюда.
                                </div>
                            </div>
                        `;
                        resourcesDiv.appendChild(newUI);

                        // --- Логика вкладок ---
                        const tabs = newUI.querySelectorAll('.sync-tab');
                        const contents = newUI.querySelectorAll('.sync-tab-content');
                        tabs.forEach(t => t.addEventListener('click', () => {
                            tabs.forEach(tab => tab.classList.remove('active'));
                            contents.forEach(c => c.classList.remove('active'));
                            t.classList.add('active');
                            newUI.querySelector('#sync-tab-' + t.getAttribute('data-tab')).classList.add('active');
                        }));

                        // --- Логика Экспорта ---
                        const copyBtn = newUI.querySelector('.copy-etis-link-btn');
                        copyBtn.addEventListener('click', () => {
                            navigator.clipboard.writeText(etisLink).then(() => {
                                const origHtml = copyBtn.innerHTML;
                                copyBtn.innerHTML = '<span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">check</span>Скопировано!';
                                copyBtn.style.setProperty('background', 'var(--color-green)', 'important');
                                setTimeout(() => {
                                    copyBtn.innerHTML = origHtml;
                                    copyBtn.style.setProperty('background', 'var(--color-accent)', 'important');
                                }, 2000);
                            });
                        });

                        const unsubBtn = newUI.querySelector('.unsub-etis-btn');
                        unsubBtn.addEventListener('click', () => {
                            const origDelBtn = Array.from(resourcesDiv.querySelectorAll('button')).find(b => b.textContent.includes('Отписаться'));
                            if (origDelBtn) origDelBtn.click();
                        });

                        // --- Логика Импорта (Множественные календари) ---
                        const calsListContainer = newUI.querySelector('#ext-cals-list');
                        const extInput = newUI.querySelector('#ext-cal-input');
                        const addExtBtn = newUI.querySelector('#ext-cal-add');

                        // Миграция старой одиночной ссылки в новый список
                        let oldLink = localStorage.getItem('etis_external_cal_link');
                        if (oldLink) {
                            let arr = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
                            if (!arr.includes(oldLink)) arr.push(oldLink);
                            localStorage.setItem('etis_external_cals_v2', JSON.stringify(arr));
                            localStorage.removeItem('etis_external_cal_link');
                        }

                        const renderCalsList = () => {
                            let cals = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
                            calsListContainer.innerHTML = '';
                            
                            if (cals.length === 0) {
                                calsListContainer.style.display = 'none';
                                return;
                            }
                            calsListContainer.style.display = 'flex';
                            
                            cals.forEach((calUrl, idx) => {
                                const item = document.createElement('div');
                                item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.4rem; background: var(--color-card); border: 1px solid var(--color-table-border); border-radius: var(--radius-small); gap: 1rem; box-shadow: var(--shadow-main);';
                                
                                const shortUrl = calUrl.length > 40 ? calUrl.substring(0, 25) + '...' + calUrl.substring(calUrl.length - 10) : calUrl;
                                
                                item.innerHTML = `
                                    <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1;">
                                        <span class="material-icons" style="color: var(--color-text-secondary); font-size: 2rem; flex-shrink: 0;">event</span>
                                        <span style="font-size: 1.3rem; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${calUrl}">${shortUrl}</span>
                                    </div>
                                    <button class="delete-cal-btn" data-idx="${idx}">
                                        <span class="material-icons" style="font-size: 2rem;">delete_outline</span>
                                    </button>
                                `;
                                calsListContainer.appendChild(item);
                            });

                            // Навешиваем события на кнопки удаления
                            calsListContainer.querySelectorAll('.delete-cal-btn').forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                                    let currentCals = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
                                    
                                    if (confirm('Удалить этот календарь из расписания?')) {
                                        currentCals.splice(idx, 1);
                                        localStorage.setItem('etis_external_cals_v2', JSON.stringify(currentCals));
                                        window.location.reload(); 
                                    }
                                });
                            });
                        };

                        renderCalsList();

                        addExtBtn.addEventListener('click', () => {
                            const val = extInput.value.trim();
                            if (!val) return;
                            
                            let cals = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
                            if (!cals.includes(val)) {
                                cals.push(val);
                                localStorage.setItem('etis_external_cals_v2', JSON.stringify(cals));
                            }
                            
                            extInput.value = '';
                            addExtBtn.innerHTML = '<span class="material-icons" style="font-size: 1.6rem; margin-right: 6px;">check</span>Добавлено!';
                            setTimeout(() => { window.location.reload(); }, 600);
                        });
                    }

                    // Кнопка в тулбаре
                    const newBtn = document.createElement('div');
                    newBtn.className = 'toolbar-item';
                    newBtn.innerHTML = '<span class="material-icons" style="font-size: 1.4rem;">sync</span> Синхронизация';

                    newBtn.addEventListener('click', () => {
                        if (resourcesDiv) {
                            const isHidden = resourcesDiv.hasAttribute('hidden') || resourcesDiv.style.display === 'none';
                            if (isHidden) {
                                resourcesDiv.removeAttribute('hidden');
                                resourcesDiv.style.display = 'block';
                                newBtn.classList.add('is-active');
                            } else {
                                resourcesDiv.style.display = 'none';
                                newBtn.classList.remove('is-active');
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

                // 7. КРАСИВАЯ ДАТА И КАНИКУЛЫ
                const weekSelect = span9.querySelector('.week-select');
                if (weekSelect) {
                    const dateDiv = weekSelect.querySelector('div[style*="text-align:center"]');
                    if (dateDiv) {
                        const holidayEl = dateDiv.querySelector('.holiday');
                        let holidayText = '';
                        
                        if (holidayEl) {
                            holidayText = holidayEl.textContent.trim();
                            holidayEl.remove();
                        }

                        const dateSpan = dateDiv.querySelector('span');
                        if (dateSpan || dateDiv.textContent.trim()) {
                            let text = (dateSpan ? dateSpan.textContent : dateDiv.textContent).trim();
                            text = text.replace(/^Неделя\s+/i, '').replace(/\.\d{4}/g, '');
                            if (text) text = text.charAt(0).toUpperCase() + text.slice(1);

                            dateDiv.innerHTML = '';
                            dateDiv.className = '';
                            dateDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 1.5rem;';

                            if (text) {
                                const dateCapsule = document.createElement('div');
                                dateCapsule.className = 'week-date-styled';
                                dateCapsule.style.cssText = 'margin: 0 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; height: 3.4rem !important; padding: 0 1.6rem !important; box-sizing: border-box !important;';
                                dateCapsule.textContent = text;
                                dateDiv.appendChild(dateCapsule);
                            }

                            if (holidayText) {
                                holidayText = holidayText.replace(/\.\d{4}/g, '');
                                
                                const holidayCapsule = document.createElement('div');
                                holidayCapsule.className = 'week-date-styled';
                                holidayCapsule.style.cssText = 'margin: 0 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; height: 3.4rem !important; padding: 0 1.6rem !important; box-sizing: border-box !important; background: rgba(52, 199, 89, 0.15) !important; color: var(--color-green) !important; font-weight: 800 !important; border: 1px solid rgba(52, 199, 89, 0.3) !important;';
                                holidayCapsule.innerHTML = `<span class="material-icons" style="font-size: 1.6rem; margin-right: 6px; line-height: 1;">celebration</span>${holidayText}`;
                                
                                dateDiv.appendChild(holidayCapsule);
                            }
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

                                // Умное форматирование аудитории перед отрисовкой
                                let displayAud = pair.aud;
                                if (displayAud && displayAud.includes('/') && !generalConfig.shortAudFormat) {
                                    // Переводим "107/5" в длинный формат, если компактный выключен
                                    const parts = displayAud.split('/');
                                    if (parts.length === 2) {
                                        const room = parts[0].trim();
                                        const building = parts[1].trim();
                                        const floorMatch = room.match(/\d/);
                                        const floor = floorMatch ? floorMatch[0] : '1';
                                        displayAud = `ауд. ${room}, к. ${building}, э. ${floor}`;
                                    }
                                }

                                tr.innerHTML = `
                                    <td class="pair_num">
                                        <div class="pair-badge-wrapper">
                                            <span class="pair-type-badge ${typeClass}">${pair.type}</span>
                                        </div>
                                        1 пара<br><font class="eval">${pair.startTime}</font>
                                    </td>
                                    <td class="pair_info">
                                        <div class="dis" style="display: flex; align-items: center; flex-wrap: wrap;">
                                            <a href="#" style="pointer-events: none;">${pair.subject}</a>
                                            <span class="material-icons delete-custom-pair-btn" title="Удалить пару">close</span>
                                        </div>
                                        ${displayAud ? `
                                        <div class="aud" style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0.8rem; margin-top: 0.6rem;">
                                            <div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);">
                                                <span class="material-icons" style="font-size: 1.5rem;">place</span>${displayAud}
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
                                        
                                        if (pair.msgHash) {
                                            let addedMsgs = JSON.parse(localStorage.getItem('etis_added_msg_events') || '[]');
                                            addedMsgs = addedMsgs.filter(h => h !== pair.msgHash);
                                            localStorage.setItem('etis_added_msg_events', JSON.stringify(addedMsgs));
                                        }

                                        tr.remove();
                                        window.location.reload();
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

                // Модальное окно создания/редактирования пары (с Умным Добавлением)
                function openCustomPairModal(dayName, isFromToolbar = false, existingPair = null) {
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

                    const title = existingPair ? `Редактировать пару` : (isFromToolbar ? `Добавить пару` : `Добавить на ${dayName}`);
                    const pairId = existingPair ? existingPair.id : ('cp_' + Date.now());

                    let defStart = existingPair ? existingPair.startTime : "08:00";
                    let defEnd = existingPair ? existingPair.endTime : "09:30";

                    // --- 1. АКТУАЛЬНЫЙ ДЕНЬ НЕДЕЛИ ---
                    const daysArr = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
                    const todayNamePlaceholder = daysArr[new Date().getDay()];

                    // --- 2. СБОР РЕАЛЬНЫХ ДАННЫХ ДЛЯ ПЛЕЙСХОЛДЕРОВ ---
                    let teachersList = [];
                    let audsList = [];

                    document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)').forEach(row => {
                        const tLink = row.querySelector('.pair_teacher a:not(.eval)');
                        if (tLink && tLink.textContent.trim()) {
                            let name = tLink.textContent.trim();
                            if (!teachersList.includes(name)) teachersList.push(name);
                        }
                        const audEl = row.querySelector('.pair_info .aud');
                        if (audEl) {
                            const clone = audEl.cloneNode(true);
                            clone.querySelectorAll('.material-icons, .note-btn-wrapper').forEach(el => el.remove());
                            let aText = clone.textContent.trim();
                            
                            if (aText.includes('ауд.')) {
                                const m = aText.match(/ауд\.\s*([^,]+),\s*к\.\s*([^,]+)/i);
                                if (m) aText = `${m[1].trim()}/${m[2].trim()}`;
                                else {
                                    const m2 = aText.match(/ауд\.\s*([^,]+)/i);
                                    if (m2) aText = m2[1].trim();
                                }
                            }
                            if (aText && !/Онлайн|Zoom|Телемост/i.test(aText) && !audsList.includes(aText)) audsList.push(aText);
                        }
                    });

                    const randomTeacher = teachersList.length ? teachersList[Math.floor(Math.random() * teachersList.length)] : "Иванов И.И.";
                    const randomAud = audsList.length ? audsList[Math.floor(Math.random() * audsList.length)] : "123/1";

                    // Плейсхолдеры
                    const placeholdersToolbar = [
                        `Лекция по математике в 13:30 в ${todayNamePlaceholder.toLowerCase()}...`,
                        "Физ-ра в 9:45...",
                        "Собрание сегодня в 123 кабинете...",
                        "Праздник завтра после обеда...",
                        "Лекция по туризму в 333 кабинете во вторник..."
                    ];
                    const placeholdersDay = [
                        "Лекция по математике в 13:30...",
                        "Физ-ра в 9:45...",
                        "Собрание в 123 кабинете...",
                        "Спорт после обеда...",
                        "Лекция по туризму в 333 кабинете..."
                    ];
                    const placeholders = isFromToolbar ? placeholdersToolbar : placeholdersDay;

                    let placeholderTimer = null;

                    modal.innerHTML = `
                        <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="ui-dialog-title">${title}</span>
                            <button class="close-modal" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                        </div>
                        <div class="ui-dialog-content" style="padding: 2.4rem;">
                            ${existingPair ? `
                            <div class="sync-tabs">
                                <button class="sync-tab" data-tab="notes">Заметки / ДЗ</button>
                                <button class="sync-tab active" data-tab="edit">Настройки пары</button>
                            </div>
                            <div class="tab-content" id="tab-notes">
                                <textarea class="note-modal-textarea" id="cp-notes-area" placeholder="Что нужно сделать?"></textarea>
                                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                                    <button class="answer-btn-custom clear-cp-note-btn" style="background: var(--color-highlight) !important; color: var(--color-red) !important; border: 1px solid rgba(255,59,48,0.3) !important; box-shadow: none !important;">Удалить</button>
                                    <button class="answer-btn-custom save-cp-note-btn" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important;">Сохранить заметку</button>
                                </div>
                            </div>
                            ` : ''}

                            <div class="tab-content active" id="tab-edit">
                                ${!existingPair ? `
                                <div style="display: flex; align-items: center; position: relative; margin-bottom: 2rem;">
                                    <span class="material-icons" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-accent); font-size: 22px; pointer-events: none; z-index: 2;">auto_awesome</span>
                                    <input type="text" id="cp-smart-add" placeholder="${placeholders[0]}" style="width: 100%; padding: 1.2rem 1.6rem 1.2rem 44px !important; margin: 0 !important; box-sizing: border-box; background: var(--color-accent-active) !important; border: 1px solid transparent !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important; box-shadow: none !important;">
                                </div>
                                ` : ''}

                                <div class="custom-pair-input-group" style="margin-bottom: 1.2rem;">
                                    <input type="text" id="cp-subject" placeholder="Название предмета *" value="${existingPair ? existingPair.subject : ''}" style="box-shadow: none !important; width: 100%; box-sizing: border-box; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                </div>

                                <div class="custom-pair-input-group" style="margin-bottom: 1.2rem; display: flex; gap: 1rem;">
                                    ${isFromToolbar ? `
                                        <input type="text" id="cp-date-input" placeholder="${todayNamePlaceholder}" value="${existingPair ? existingPair.dayName : ''}" style="flex: 0.8; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                    ` : `
                                        <input type="hidden" id="cp-date-input" value="${dayName}">
                                    `}
                                    <input type="time" id="cp-start" value="${defStart}" required title="Время начала" style="flex: 1; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                    <input type="time" id="cp-end" value="${defEnd}" required title="Время окончания" style="flex: 1; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                </div>

                                <div class="custom-pair-input-group" style="margin-bottom: 1.2rem; display: flex; gap: 1rem;">
                                    <select id="cp-type" style="flex: 1; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                        <option value="лек" ${existingPair?.type === 'лек' ? 'selected' : ''}>Лекция</option>
                                        <option value="практ" ${existingPair?.type === 'практ' ? 'selected' : ''}>Практика</option>
                                        <option value="лаб" ${existingPair?.type === 'лаб' ? 'selected' : ''}>Лабораторная</option>
                                    </select>
                                    <select id="cp-recurrence" style="flex: 1; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                        <option value="once" ${existingPair?.recurrence === 'once' ? 'selected' : ''}>Только на этой неделе</option>
                                        <option value="every" ${existingPair?.recurrence === 'every' ? 'selected' : ''}>Каждую неделю</option>
                                        <option value="biweekly" ${existingPair?.recurrence === 'biweekly' ? 'selected' : ''}>Раз в 2 недели</option>
                                    </select>
                                </div>

                                <div class="custom-pair-input-group" style="margin-bottom: 1.2rem; display: flex; gap: 1rem;">
                                    <input type="text" id="cp-aud" placeholder="${randomAud}" value="${existingPair ? existingPair.aud : ''}" style="flex: 1; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                    <input type="text" id="cp-teacher" placeholder="${randomTeacher}" value="${existingPair ? existingPair.teacher : ''}" style="flex: 1; box-shadow: none !important; margin: 0 !important; padding: 1rem 1.2rem !important; border: 1px solid var(--color-table-border) !important; background: var(--color-input) !important; border-radius: var(--radius-small) !important; color: var(--color-text-primary) !important; font-size: 1.4rem !important;">
                                </div>
                                <div style="display: flex; justify-content: flex-end; margin-top: 2.4rem;">
                                    <button class="answer-btn-custom save-cp-btn">${existingPair ? 'Сохранить' : 'Добавить'}</button>
                                </div>
                            </div>
                        </div>
                    `;

                    // Закрытие модалки
                    const closeModal = () => { 
                        if (placeholderTimer) clearInterval(placeholderTimer);
                        overlay.classList.remove('active'); 
                        modal.classList.remove('active'); 
                        document.body.classList.remove('modal-open-body');
                    };
                    overlay.onclick = closeModal;
                    modal.querySelector('.close-modal').onclick = closeModal;

                    // Получаем ссылки на элементы ПОСЛЕ того как вставили HTML
                    const smartInput = modal.querySelector('#cp-smart-add');
                    const subjectInput = modal.querySelector('#cp-subject');
                    const dateInput = modal.querySelector('#cp-date-input');
                    const timeStartInput = modal.querySelector('#cp-start');
                    const timeEndInput = modal.querySelector('#cp-end');
                    const typeInput = modal.querySelector('#cp-type');
                    const audInput = modal.querySelector('#cp-aud');
                    const teacherInput = modal.querySelector('#cp-teacher');

                    // Таймер плейсхолдеров
                    if (smartInput) {
                        let pIdx = 0;
                        placeholderTimer = setInterval(() => {
                            pIdx = (pIdx + 1) % placeholders.length;
                            smartInput.placeholder = placeholders[pIdx];
                        }, 2000);

                        // Твоя логика умного парсера (без изменений)
                        smartInput.addEventListener('input', (e) => {
                            let text = " " + e.target.value + " ";
                            if (!text.trim()) return;
                            let extractedDate = "";
                            let m1 = text.match(/\s(\d{1,2}\.\d{1,2}(?:\.\d{2,4})?)\s/);
                            let m2 = text.match(/\s(\d{1,2}\s+(?:янв|фев|мар|апр|ма[яй]|июн|июл|авг|сен|окт|ноя|дек)[а-я]*)\s/i);
                            let m3 = text.match(/\s(?:в\s|во\s)?(понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье)\s/i);
                            let m4 = text.match(/\s(сегодня|завтра|послезавтра)\s/i);
                            if (m1) { extractedDate = m1[1]; text = text.replace(m1[0], ' '); }
                            else if (m2) { extractedDate = m2[1]; text = text.replace(m2[0], ' '); }
                            else if (m3) { extractedDate = m3[1]; text = text.replace(m3[0], ' '); }
                            else if (m4) { extractedDate = m4[1]; text = text.replace(m4[0], ' '); }
                            if (extractedDate && isFromToolbar) {
                                let cleanDate = extractedDate.charAt(0).toUpperCase() + extractedDate.slice(1);
                                cleanDate = cleanDate.replace(/среду/i, 'Среда').replace(/пятницу/i, 'Пятница').replace(/субботу/i, 'Суббота');
                                dateInput.value = cleanDate;
                            }
                            let timeParsed = false;
                            let naturalTimeMatch = text.match(/\s(?:в|на|к)?\s*(\d{1,2})\s+(утра|вечера|дня|ночи|часов|час|часа)\s/i);
                            if (naturalTimeMatch) {
                                let h = parseInt(naturalTimeMatch[1], 10);
                                const mod = naturalTimeMatch[2].toLowerCase();
                                if (mod.includes('вечер') && h < 12) h += 12;
                                else if (mod.includes('дня') && h < 12 && h >= 1) h += 12;
                                else if (mod.includes('ноч') && h === 12) h = 0;
                                timeStartInput.value = `${String(h).padStart(2, '0')}:00`;
                                let totalM = h * 60 + 90;
                                timeEndInput.value = `${String(Math.floor(totalM/60)%24).padStart(2,'0')}:${String(totalM%60).padStart(2,'0')}`;
                                text = text.replace(naturalTimeMatch[0], ' ');
                                timeParsed = true;
                            } 
                            if (!timeParsed) {
                                let strictTimeMatch = text.match(/\s(?:в|на|к)?\s*(\d{1,2})[:.-](\d{2})\s/i);
                                if (strictTimeMatch) {
                                    let h = strictTimeMatch[1].padStart(2, '0');
                                    let m = strictTimeMatch[2].padStart(2, '0');
                                    timeStartInput.value = `${h}:${m}`;
                                    let totalM = parseInt(h)*60 + parseInt(m) + 90;
                                    timeEndInput.value = `${String(Math.floor(totalM/60)%24).padStart(2,'0')}:${String(totalM%60).padStart(2,'0')}`;
                                    text = text.replace(strictTimeMatch[0], ' ');
                                } else if (text.match(/\sпосле обеда\s/i)) {
                                    timeStartInput.value = '13:30'; timeEndInput.value = '15:00';
                                    text = text.replace(/\sпосле обеда\s/i, ' ');
                                }
                            }
                            let typeMatch = text.match(/\s(лекци[яию]|лек\b|практик[ауи]|практ\b|лабораторн[аяую]|лаба\b|лаб\b)\s/i);
                            if (typeMatch) {
                                let t = typeMatch[1].toLowerCase();
                                if (t.startsWith('лек')) typeInput.value = 'лек';
                                if (t.startsWith('практ')) typeInput.value = 'практ';
                                if (t.startsWith('лаб')) typeInput.value = 'лаб';
                                text = text.replace(typeMatch[0], ' ');
                            }
                            let aud = '', bldg = '';
                            let matchLocA = text.match(/\s(?:в|на)?\s*(\d+)\s*корпус[еа]?\s*(?:в\s+)?(?:ауд\.?|каб\.?|кабинет[е]?|аудитори[ия])?\s*(\d+[a-zа-я]?)\s*(?:кабинет[е]?|аудитори[ия])?\s/i);
                            if (matchLocA) { bldg = matchLocA[1]; aud = matchLocA[2]; text = text.replace(matchLocA[0], ' '); }
                            else {
                                let matchLocB = text.match(/\s(?:(?:в\s+)?(?:ауд\.?|каб\.?|кабинет[е]?|аудитори[ия])?\s*)?(\d+[a-zа-я]?)\s*(?:кабинет[е]?|аудитори[ия])?\s*(?:в\s+)?(\d+)\s*корпус[еа]\s/i);
                                if (matchLocB) { aud = matchLocB[1]; bldg = matchLocB[2]; text = text.replace(matchLocB[0], ' '); }
                                else {
                                    let matchLocC = text.match(/\s(\d+[a-zа-я]?)\s*[\/\\]\s*(\d+)\s/i);
                                    if (matchLocC) { aud = matchLocC[1]; bldg = matchLocC[2]; text = text.replace(matchLocC[0], ' '); }
                                    else {
                                        let matchLocD = text.match(/\s(?:(?:в\s+)?(?:ауд\.?|каб\.?|кабинет[е]?|аудитори[ия])\s*(\d+[a-zа-я]?))|(?:(?:в\s+)?(\d+[a-zа-я]?)\s*(?:каб\.?|кабинет[е]?|ауд\.?|аудитори[ия]))\s/i);
                                        if (matchLocD) { aud = matchLocD[1] || matchLocD[2]; text = text.replace(matchLocD[0], ' '); }
                                    }
                                }
                            }
                            if (aud) audInput.value = bldg ? `${aud}/${bldg}` : aud;
                            let subject = text.replace(/\s+/g, ' ').trim();
                            let isDative = /^(по)\s+/i.test(subject);
                            subject = subject.replace(/^(по|в|на|с)\s+/i, '').replace(/\s+(по|в|на|с)$/i, '').trim();
                            if (isDative) {
                                subject = subject.split(' ').map((word, idx, arr) => {
                                    const lower = word.toLowerCase();
                                    if (lower === 'праву' || lower === 'делу') return word.replace(/у$/i, 'о');
                                    if (lower.endsWith('ому')) return word.slice(0, -3) + 'ый';
                                    if (lower.endsWith('ему')) return word.slice(0, -3) + 'ий';
                                    if (lower.endsWith('ой') || lower.endsWith('ей')) return word.slice(0, -2) + 'ая';
                                    if (lower.endsWith('ым') || lower.endsWith('им')) return word.slice(0, -2) + 'ые';
                                    if (lower.endsWith('ию')) return word.slice(0, -2) + 'ие';
                                    if (lower.endsWith('ии')) {
                                        if (idx > 0 && !arr[idx-1].toLowerCase().endsWith('ой') && !arr[idx-1].toLowerCase().endsWith('ей')) return word;
                                        return word.slice(0, -2) + 'ия';
                                    }
                                    if (lower.endsWith('ям')) return word.slice(0, -2) + 'и';
                                    if (lower.endsWith('ам')) return word.slice(0, -2) + 'ы';
                                    if (lower.endsWith('у')) return word.slice(0, -1);
                                    if (lower.endsWith('е')) return word.slice(0, -1) + 'а';
                                    return word;
                                }).join(' ');
                            }
                            if (subject.length > 0) subject = subject.charAt(0).toUpperCase() + subject.slice(1);
                            subjectInput.value = subject;
                        });
                    }

                    // Авто-сдвиг времени
                    timeStartInput.addEventListener('change', (e) => {
                        if (e.target.value) {
                            let [hours, minutes] = e.target.value.split(':').map(Number);
                            minutes += 90; hours += Math.floor(minutes / 60); minutes = minutes % 60; hours = hours % 24;
                            timeEndInput.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    });

                    // Функция парсинга даты (вспомогательная, должна быть доступна внутри)
                    const internalResolveDate = (inputStr) => {
                        inputStr = inputStr.trim().toLowerCase();
                        const now = new Date(); now.setHours(0,0,0,0);
                        let targetDate = null;
                        let m = inputStr.match(/^(\d{1,2})\.(\d{1,2})/);
                        if (m) targetDate = new Date(now.getFullYear(), parseInt(m[2], 10)-1, parseInt(m[1], 10));
                        else {
                            m = inputStr.match(/^(\d{1,2})\s+(янв|фев|мар|апр|ма|июн|июл|авг|сен|окт|ноя|дек)/);
                            if (m) {
                                const months = { 'янв':0, 'фев':1, 'мар':2, 'апр':3, 'ма':4, 'июн':5, 'июл':6, 'авг':7, 'сен':8, 'окт':9, 'ноя':10, 'дек':11 };
                                targetDate = new Date(now.getFullYear(), months[m[2]], parseInt(m[1], 10));
                            }
                        }
                        const actualWeek = parseInt(localStorage.getItem('etis_actual_week') || '1', 10);
                        if (targetDate) {
                            if (targetDate < now && (now.getMonth() - targetDate.getMonth()) > 6) targetDate.setFullYear(now.getFullYear() + 1);
                            const dArr = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
                            const getMon = (d) => { const nd = new Date(d); nd.setDate(nd.getDate() - (nd.getDay() || 7) + 1); return nd.setHours(0,0,0,0); };
                            const weekDiff = Math.round((getMon(targetDate) - getMon(now)) / (7 * 24 * 3600 * 1000));
                            return { dayName: dArr[targetDate.getDay()], addedWeek: actualWeek + weekDiff };
                        }
                        const dMap = { 'понедельник': 'Понедельник', 'вторник': 'Вторник', 'сред': 'Среда', 'четверг': 'Четверг', 'пятниц': 'Пятница', 'суббот': 'Суббота', 'воскресенье': 'Воскресенье' };
                        let foundDay = Object.keys(dMap).find(k => inputStr.startsWith(k));
                        if (foundDay) return { dayName: dMap[foundDay], addedWeek: actualWeek };
                        return { dayName: todayNamePlaceholder, addedWeek: actualWeek };
                    };

                    // Сохранение пары
                    modal.querySelector('.save-cp-btn').onclick = () => {
                        const subject = subjectInput.value.trim();
                        if (!subject) return alert('Введите название предмета!');

                        let finalDayName = dayName;
                        let finalAddedWeek = parseInt(document.querySelector('.week.current')?.textContent.trim() || '1', 10);

                        if (isFromToolbar) {
                            const dateInputVal = dateInput.value.trim() || todayNamePlaceholder;
                            const resolved = internalResolveDate(dateInputVal);
                            finalDayName = resolved.dayName;
                            finalAddedWeek = resolved.addedWeek;
                        }

                        const pair = {
                            id: pairId,
                            addedWeek: finalAddedWeek,
                            dayName: finalDayName,
                            subject: subject,
                            startTime: timeStartInput.value,
                            endTime: timeEndInput.value,
                            type: typeInput.value,
                            recurrence: modal.querySelector('#cp-recurrence').value,
                            aud: audInput.value.trim() || randomAud,
                            teacher: teacherInput.value.trim() || randomTeacher
                        };

                        let cp = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                        if (existingPair) cp = cp.filter(p => p.id !== pairId);
                        cp.push(pair);
                        localStorage.setItem('etis_custom_pairs_v1', JSON.stringify(cp));
                        closeModal(); window.location.reload();
                    };

                    overlay.classList.add('active');
                    modal.classList.add('active');
                    document.body.classList.add('modal-open-body');
                    if (!existingPair) setTimeout(() => smartInput.focus(), 100);
                }

                // --- ОФОРМЛЕНИЕ ЗАГОЛОВКОВ ДНЕЙ (ДАТЫ), КНОПКИ "+" И ШЕРИНГА ---
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

                    let leftDateHTML = '';
                    let rightDateHTML = '';
                    
                    if (datePart) {
                        if (generalConfig.datesLeft) {
                            leftDateHTML = `<span>,</span>&nbsp;<span class="day-date" style="font-size: 1.4rem; color: var(--color-text-secondary); font-weight: 500;">${datePart}</span>`;
                        } else {
                            rightDateHTML = `<span class="day-date">${datePart}</span>`;
                        }
                    }

                    header.innerHTML = `
                        <div style="display:flex; align-items:center; gap: 6px;">
                            <div class="day-title-text-wrap" style="display:flex; align-items:center;">
                                <span class="day-name">${dayOfWeek}</span>${leftDateHTML}
                            </div>
                            <span class="material-icons add-custom-pair-btn" title="Добавить свою пару">add</span>
                        </div>
                        <div class="day-header-right">
                            ${rightDateHTML}
                            <span class="material-icons share-day-btn" title="Поделиться днем">ios_share</span>
                        </div>
                    `;

                    header.querySelector('.add-custom-pair-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        openCustomPairModal(dayOfWeek, false); 
                    });

                    header.querySelector('.share-day-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        btn.textContent = 'hourglass_empty';
                        
                        const dayBlock = header.closest('.day');
                        const fileName = `Расписание (${datePart || dayOfWeek}).png`;

                        const renderScreenshot = async () => {
                            let h2c = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                            
                            if (!h2c) {
                                btn.textContent = 'error';
                                setTimeout(() => btn.textContent = 'ios_share', 2000);
                                return;
                            }

                            const isMobile = window.innerWidth <= 960;
                            const renderWidth = 540;

                            const exportContainer = document.createElement('div');
                            exportContainer.style.cssText = `position:fixed; top:100vh; left:0; width:${renderWidth}px; padding:24px; background:var(--color-body); z-index:-9999; box-sizing:border-box;`;
                            
                            const span9Wrapper = document.createElement('div');
                            span9Wrapper.className = 'span9';
                            span9Wrapper.style.cssText = 'margin:0 !important; padding:0 !important; width:100% !important; display:block;';

                            const clone = dayBlock.cloneNode(true);
                            clone.style.margin = '0';
                            
                            // ДОЖИДАЕМСЯ ПОДГОТОВКИ (В ТОМ ЧИСЛЕ ЗАГРУЗКИ QR-КОДОВ ИЗ API)
                            await cleanTimetableForExport(clone);

                            span9Wrapper.appendChild(clone);
                            
                            if (generalConfig.watermark) {
                                const watermark = document.createElement('div');
                                watermark.style.cssText = 'text-align: right; margin-top: 12px; font-size: 1.1rem; font-weight: 700; color: var(--color-text-secondary); opacity: 0.4;';
                                watermark.textContent = 'etisreborn.ru';
                                span9Wrapper.appendChild(watermark);
                            }

                            exportContainer.appendChild(span9Wrapper);
                            document.body.appendChild(exportContainer);

                            h2c(exportContainer, {
                                scale: 2, 
                                useCORS: true, 
                                windowWidth: renderWidth, 
                                backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-body').trim()
                            }).then(canvas => {
                                canvas.toBlob(blob => {
                                    const file = new File([blob], fileName, { type: 'image/png' });
                                    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                                        navigator.share({ files: [file], title: fileName });
                                    } else {
                                        const link = document.createElement('a');
                                        link.download = fileName; link.href = URL.createObjectURL(blob); link.click();
                                        URL.revokeObjectURL(link.href);
                                    }
                                    exportContainer.remove();
                                    btn.textContent = 'check';
                                    setTimeout(() => btn.textContent = 'ios_share', 2000);
                                }, 'image/png');
                            }).catch(err => {
                                console.error('Screenshot error:', err);
                                exportContainer.remove();
                                btn.textContent = 'error';
                                setTimeout(() => btn.textContent = 'ios_share', 2000);
                            });
                        };

                        // Загрузчик ТОЛЬКО для html2canvas
                        let h2cObj = typeof html2canvas !== 'undefined' ? html2canvas : (window.html2canvas || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.html2canvas : null));
                        if (!h2cObj) {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                            script.onload = renderScreenshot;
                            script.onerror = () => {
                                btn.textContent = 'error';
                                setTimeout(() => btn.textContent = 'ios_share', 2000);
                            }
                            document.head.appendChild(script);
                        } else {
                            renderScreenshot();
                        }
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

                            let newFormat;
                            if (generalConfig.shortAudFormat) {
                                newFormat = `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>${roomNumber}/${building}</div>`;
                            } else {
                                newFormat = `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>ауд. ${roomNumber}, к. ${building}, э. ${floor}</div>`;
                            }

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

                // --- ПАРСИНГ ТИПА ПАРЫ (ЛЕК, ПРАКТ, ЛАБ, КОНС) ---
                span9.querySelectorAll('.timetable-grid tr').forEach(row => {
                    const disContainer = row.querySelector('.pair_info .dis');
                    const numTd = row.querySelector('.pair_num');

                    if (disContainer && numTd) {
                        const targetEl = disContainer.querySelector('a') || disContainer;
                        const text = targetEl.textContent;

                        // Ищем (лек), (практ), (лаб), (зач), (экз) в самом конце строки
                        const match = text.match(/\s*\((лек|практ|лаб|зач|экз)\)\s*$/i);
                        let type = '';
                        let typeClass = 'type-badge-lek';

                        if (match) {
                            type = match[1].toLowerCase();
                            targetEl.textContent = text.replace(match[0], '');
                        } else if (text.toLowerCase().includes('консультация')) {
                            type = 'конс';
                        }

                        if (type) {
                            if (type === 'лек') typeClass = 'type-badge-lek';
                            else if (type === 'практ') typeClass = 'type-badge-pract';
                            else if (type === 'лаб') typeClass = 'type-badge-lab';
                            else if (type === 'зач' || type === 'экз') typeClass = 'type-badge-exam';
                            else if (type === 'конс') typeClass = 'type-badge-cons';

                            const badge = document.createElement('span');
                            badge.className = `pair-type-badge ${typeClass}`;
                            badge.textContent = type;

                            const badgeWrapper = document.createElement('div');
                            badgeWrapper.className = 'pair-badge-wrapper';
                            badgeWrapper.appendChild(badge);

                            numTd.prepend(badgeWrapper);
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
                                <td class="pair_num" style="border-bottom: none !important; border-right: none !important;">
                                    <div class="pair-badge-wrapper">
                                        <span class="pair-type-badge type-badge-holiday">ВЫХ</span>
                                    </div>
                                    0 пар<br><font class="eval">00:00</font>
                                </td>
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
                    if (typeof window.applyHideDaysOff === 'function') window.applyHideDaysOff();
                }

                // Экспортируем функцию скрытия дней наружу
                window.applyHideDaysOff = function() {
                    document.querySelectorAll('.span9 .day').forEach(day => {
                        // Находим все видимые строки в дне
                        const visibleRows = Array.from(day.querySelectorAll('.timetable-grid tr')).filter(r => r.style.display !== 'none' && !r.classList.contains('hidden-by-filter'));
                        
                        // Если единственная видимая строка — это "Выходной" (0 пар), значит день пустой
                        const isDayOff = visibleRows.length === 1 && visibleRows[0].classList.contains('custom-no-pairs');
                        
                        if (generalConfig.hideDaysOff && isDayOff) {
                            day.style.display = 'none'; // Прячем весь день
                        } else {
                            day.style.display = ''; // Возвращаем обратно
                        }
                    });
                };

                // --- УМНЫЕ ЗАМЕТКИ И РЕДАКТОР ПАР ---
                function renderNotes() {
                    let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                    const seenSubjects = new Set();
                    const allRowsArray = Array.from(document.querySelectorAll('.timetable-grid tr:not(.timetable-gap-row):not(.custom-no-pairs)'));

                    const currentWeekEl = document.querySelector('.week.current');
                    const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 0;

                    allRowsArray.forEach((row, index) => {
                        const disContainer = row.querySelector('.pair_info .dis');
                        const numTd = row.querySelector('.pair_num');
                        if (!disContainer || !numTd) return;

                        const targetEl = disContainer.querySelector('a') || disContainer;
                        
                        // 1. Запоминаем оригинальные данные (для отката и поиска)
                        let origSubject = row.getAttribute('data-orig-subject');
                        if (!origSubject) {
                            origSubject = targetEl.textContent.trim();
                            row.setAttribute('data-orig-subject', origSubject);
                        }

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

                        // 2. ПРИМЕНЕНИЕ ПЕРЕОПРЕДЕЛЕНИЙ (ДЛЯ ОБЫЧНЫХ ПАР ЕТИСА)
                        const isExternal = row.classList.contains('external-event-row');
                        const isPureCustom = row.classList.contains('custom-pair-row') && !isExternal;
                        let isSeriesOverride = false;

                        if (!isPureCustom && !isExternal) {
                            const overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                            const singleKey = `SINGLE_${dayDateStr}_${rawPairNum}_${origSubject}`;
                            const seriesKey = `SERIES_ALL_${origSubject}`; // Глобальное переопределение по имени
                            
                            let activeOverride = overrides[singleKey];
                            if (!activeOverride && overrides[seriesKey]) {
                                activeOverride = overrides[seriesKey];
                                isSeriesOverride = true;
                            }

                            if (activeOverride) {
                                if (activeOverride.title) targetEl.textContent = activeOverride.title;
                                if (activeOverride.loc !== undefined) {
                                    let audEl = row.querySelector('.pair_info .aud');
                                    if (!audEl) {
                                        audEl = document.createElement('div');
                                        audEl.className = 'aud';
                                        audEl.style.cssText = 'display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0.8rem; margin-top: 0.6rem;';
                                        disContainer.parentNode.appendChild(audEl);
                                    }
                                    audEl.innerHTML = `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>${activeOverride.loc}</div>`;
                                }
                                if (activeOverride.teacher !== undefined) {
                                    let teacherEl = row.querySelector('.pair_teacher a:not(.eval)');
                                    if (teacherEl) teacherEl.textContent = activeOverride.teacher;
                                    else {
                                        const tTd = row.querySelector('.pair_teacher');
                                        if (tTd) tTd.innerHTML = `<a href="#" style="color: var(--color-text-secondary); text-decoration: none; pointer-events: none;">${activeOverride.teacher}</a>` + tTd.innerHTML;
                                    }
                                }
                            }
                            row.setAttribute('data-ext-is-series', isSeriesOverride);
                        }

                        const cleanSubjectName = targetEl.textContent.trim();
                        const pairId = `${dayDateStr}_${rawPairNum}_${cleanSubjectName}`;

                        // Логика переноса непривязанных заметок
                        if (notesData.next_unbound && notesData.next_unbound[cleanSubjectName] && !seenSubjects.has(cleanSubjectName)) {
                            const unbound = notesData.next_unbound[cleanSubjectName];
                            if (currentWeek > unbound.week) {
                                notesData.specific[pairId] = unbound.text;
                                delete notesData.next_unbound[cleanSubjectName];
                                localStorage.setItem('etis_subject_notes_v2', JSON.stringify(notesData));
                            }
                        }
                        seenSubjects.add(cleanSubjectName);

                        const currentNote = notesData.specific[pairId] || '';

                        row.querySelectorAll('.note-btn-wrapper').forEach(w => w.remove());
                        row.querySelectorAll('.subject-note-btn').forEach(btn => btn.remove());
                        row.querySelectorAll('.pair-important-btn').forEach(btn => btn.remove());

                        // Проверка на то, прошла ли пара
                        let isPassed = false;
                        if (dayDateStr !== 'UnknownDate') {
                            const match = dayDateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                            let classDate = new Date();
                            if (match) {
                                const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                                if (m !== undefined) { classDate.setMonth(m); classDate.setDate(parseInt(match[1])); }
                            } else {
                                const isoMatch = dayDateStr.match(/(\d{2})\.(\d{2})/);
                                if (isoMatch) { classDate.setMonth(parseInt(isoMatch[2])-1); classDate.setDate(parseInt(isoMatch[1])); }
                            }
                            classDate.setHours(0,0,0,0);
                            const today = new Date(); today.setHours(0,0,0,0);
                            
                            if (classDate.getTime() < today.getTime()) isPassed = true;
                            else if (classDate.getTime() === today.getTime()) {
                                const timeEl = numTd.querySelector('.eval');
                                if (timeEl) {
                                    const parts = timeEl.textContent.trim().split(':');
                                    if (parts.length === 2) {
                                        const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                                        const currentMins = new Date().getHours() * 60 + new Date().getMinutes();
                                        if (currentMins >= startMins) isPassed = true;
                                    }
                                }
                            }
                        }

                        // Кнопка Важной пары (колокольчик)
                        const importantPairs = JSON.parse(localStorage.getItem('etis_important_pairs_v1') || '[]');
                        const isImportant = importantPairs.includes(pairId);

                        if (isImportant) row.classList.add('is-important');
                        else row.classList.remove('is-important');

                        if (!isPassed || isImportant) {
                            const impBtn = document.createElement('button');
                            impBtn.className = 'pair-important-btn';
                            impBtn.title = isImportant ? "Снять отметку" : "Пометить как важную";
                            impBtn.innerHTML = isImportant ? '<span class="material-icons" style="font-size:1.6rem;">notification_important</span>' : '<span class="material-icons" style="font-size:1.6rem;">notifications_none</span>';
                            if (isImportant) impBtn.classList.add('is-active');

                            impBtn.addEventListener('click', (e) => {
                                e.preventDefault(); e.stopPropagation();
                                let imp = JSON.parse(localStorage.getItem('etis_important_pairs_v1') || '[]');
                                if (imp.includes(pairId)) imp = imp.filter(id => id !== pairId);
                                else imp.push(pairId);
                                localStorage.setItem('etis_important_pairs_v1', JSON.stringify(imp));
                                renderNotes();
                            });

                            const typeBadge = numTd.querySelector('.pair-type-badge');
                            if (typeBadge) typeBadge.appendChild(impBtn);
                            else {
                                const fallbackWrapper = document.createElement('div');
                                fallbackWrapper.className = 'pair-badge-wrapper';
                                impBtn.style.position = 'static'; impBtn.style.transform = 'none';
                                fallbackWrapper.appendChild(impBtn);
                                numTd.prepend(fallbackWrapper);
                            }
                        }

                        // КНОПКА РЕДАКТИРОВАНИЯ И ЗАМЕТОК (Карандаш)
                        const noteBtn = document.createElement('button');
                        noteBtn.className = 'subject-note-btn';
                        if (currentNote) noteBtn.classList.add('has-note');
                        noteBtn.title = "Заметки и настройки";
                        noteBtn.innerHTML = '<span class="material-icons">edit</span>';

                        noteBtn.addEventListener('click', (e) => {
                            e.preventDefault(); e.stopPropagation();
                            openPairModal(row, cleanSubjectName, origSubject, pairId, dayDateStr, rawPairNum, index, allRowsArray, currentNote, isExternal, isPureCustom);
                        });

                        const noteWrapper = document.createElement('span');
                        noteWrapper.className = 'note-btn-wrapper';
                        noteWrapper.style.display = 'inline-flex';
                        noteWrapper.appendChild(noteBtn);

                        const audContainer = row.querySelector('.pair_info .aud');
                        let targetContainer = audContainer && audContainer.textContent.trim() !== '' ? audContainer : disContainer;
                        targetContainer.appendChild(noteWrapper);
                    });
                }

                // Единое модальное окно для всех типов пар
                function openPairModal(row, dispSubject, origSubject, pairId, dayDateStr, rawPairNum, currentIndex, allRowsArray, currentNote, isExternal, isPureCustom) {
                    let overlay = document.querySelector('.analytics-overlay.notes-overlay');
                    let modal = document.querySelector('.analytics-modal.notes-modal');

                    if (!overlay || !modal) {
                        overlay = document.createElement('div');
                        overlay.className = 'analytics-overlay notes-overlay';
                        document.body.appendChild(overlay);

                        modal = document.createElement('div');
                        modal.className = 'analytics-modal notes-modal';
                        document.body.appendChild(modal);
                    }

                    // Сбор текущих данных для вкладки Настроек
                    let currentLoc = "";
                    let currentTeacher = "";
                    let isSeries = false;

                    // Умная функция для чистого извлечения аудитории
                    const extractCleanLocation = (r) => {
                        const audEl = r.querySelector('.pair_info .aud');
                        if (!audEl) return '';
                        const clone = audEl.cloneNode(true);
                        clone.querySelectorAll('.material-icons, .note-btn-wrapper').forEach(el => el.remove());
                        return clone.textContent.trim();
                    };
                    
                    if (isExternal) {
                        origSubject = row.getAttribute('data-ext-orig-title') || origSubject;
                        currentLoc = row.getAttribute('data-ext-disp-loc') || '';
                        currentTeacher = row.getAttribute('data-ext-disp-teacher') || '';
                        isSeries = row.getAttribute('data-ext-is-series') === 'true';
                    } else if (isPureCustom) {
                        currentLoc = extractCleanLocation(row);
                        const tEl = row.querySelector('.pair_teacher a:not(.eval)');
                        currentTeacher = tEl ? tEl.textContent.trim() : '';
                    } else {
                        currentLoc = extractCleanLocation(row);
                        const tEl = row.querySelector('.pair_teacher a:not(.eval)');
                        currentTeacher = tEl ? tEl.textContent.trim() : '';
                        isSeries = row.getAttribute('data-ext-is-series') === 'true';
                    }

                    modal.innerHTML = `
                        <div class="ui-widget-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="ui-dialog-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%;">${dispSubject}</span>
                            <button class="close-notes" style="background:none; border:none; cursor:pointer; font-size:0;"><span class="material-icons" style="color:var(--color-text-secondary); font-size:24px;">close</span></button>
                        </div>
                        <div class="ui-dialog-content" style="padding: 2.4rem;">
                            <div class="sync-tabs">
                                <button class="sync-tab active" data-tab="notes">Заметка / ДЗ</button>
                                <button class="sync-tab" data-tab="edit">Настройки</button>
                            </div>

                            <div class="tab-content active" id="tab-notes">
                                <textarea class="note-modal-textarea" id="cp-notes-area" placeholder="Что нужно сделать?">${currentNote}</textarea>
                                <div style="margin: 2rem 0;">
                                    <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition);">
                                        <div style="display:flex; flex-direction:column; gap:2px;">
                                            <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">На следующую пару</span>
                                            <span style="font-size:1.1rem; color:var(--color-text-secondary);">Перенести заметку на следующую неделю</span>
                                        </div>
                                        <input type="checkbox" id="note-next-class-cb" class="tumbler-checkbox">
                                    </label>
                                </div>
                                <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                                    <button class="answer-btn-custom clear-note-btn" style="background: var(--color-highlight) !important; color: var(--color-red) !important; border: 1px solid rgba(255,59,48,0.3) !important; box-shadow: none !important;">Удалить</button>
                                    <button class="answer-btn-custom save-note-btn" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important;">Сохранить</button>
                                </div>
                            </div>

                            <div class="tab-content" id="tab-edit">
                                ${(!isPureCustom) ? `<div style="margin-bottom: 1.5rem; color: var(--color-text-secondary); font-size: 1.2rem;">Оригинальное название: <b>${origSubject}</b></div>` : ''}

                                <input type="text" id="cp-subject" class="custom-pair-input-group" placeholder="Название предмета *" value="${dispSubject}" style="width: 100%; box-sizing:border-box;">

                                <div class="custom-pair-input-group">
                                    <input type="text" id="cp-aud" placeholder="Аудитория / Ссылка" value="${currentLoc}">
                                    <input type="text" id="cp-teacher" placeholder="Преподаватель" value="${currentTeacher}">
                                </div>

                                ${!isPureCustom ? `
                                <div style="margin: 2rem 0;">
                                    <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding: 12px 16px; background: var(--color-highlight); border-radius: 16px; transition: var(--transition);">
                                        <div style="display:flex; flex-direction:column; gap:2px;">
                                            <span style="font-size:1.4rem; font-weight:600; color:var(--color-text-primary);">Применить ко всем</span>
                                            <span style="font-size:1.1rem; color:var(--color-text-secondary);">Ко всем парам с таким же оригинальным названием</span>
                                        </div>
                                        <input type="checkbox" id="ext-apply-all" class="tumbler-checkbox" ${isSeries ? 'checked' : ''}>
                                    </label>
                                </div>
                                ` : ''}

                                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
                                    ${!isPureCustom ? `<button class="answer-btn-custom reset-edit-btn" style="background: var(--color-highlight) !important; color: var(--color-red) !important; border: 1px solid rgba(255,59,48,0.3) !important; box-shadow: none !important;">Сбросить</button>` : ''}
                                    <button class="answer-btn-custom save-edit-btn" style="background: var(--color-accent) !important; color: #fff !important; box-shadow: none !important;">Сохранить настройки</button>
                                </div>
                            </div>
                        </div>
                    `;

                    const closeModal = () => { 
                        overlay.classList.remove('active'); 
                        modal.classList.remove('active'); 
                        document.body.classList.remove('modal-open-body');
                    };
                    overlay.onclick = closeModal;
                    modal.querySelector('.close-notes').onclick = closeModal;

                    // Логика вкладок
                    const tabs = modal.querySelectorAll('.sync-tab');
                    const contents = modal.querySelectorAll('.tab-content');
                    tabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            tabs.forEach(t => t.classList.remove('active'));
                            contents.forEach(c => c.classList.remove('active'));
                            tab.classList.add('active');
                            modal.querySelector(`#tab-${tab.getAttribute('data-tab')}`).classList.add('active');
                        });
                    });

                    // --- ЛОГИКА ЗАМЕТКИ ---
                    modal.querySelector('.save-note-btn').onclick = () => {
                        const val = modal.querySelector('#cp-notes-area').value.trim();
                        const isNext = modal.querySelector('#note-next-class-cb').checked;
                        let notesData = JSON.parse(localStorage.getItem('etis_subject_notes_v2') || '{"specific":{},"next_unbound":{}}');
                        const currentWeekEl = document.querySelector('.week.current');
                        const currentWeek = currentWeekEl ? parseInt(currentWeekEl.textContent.trim(), 10) : 0;

                        if (!val || isNext) delete notesData.specific[pairId];
                        
                        if (val) {
                            if (isNext) {
                                let nextPairId = null;
                                for (let i = currentIndex + 1; i < allRowsArray.length; i++) {
                                    const r = allRowsArray[i];
                                    const dCont = r.querySelector('.pair_info .dis');
                                    const tEl = dCont ? (dCont.querySelector('a') || dCont) : null;
                                    if (tEl && tEl.textContent.trim() === dispSubject) {
                                        const dD = r.closest('.day')?.querySelector('.day-date');
                                        const dStr = dD ? dD.textContent.trim() : 'UnknownDate';
                                        const nTd = r.querySelector('.pair_num');
                                        let rNum = "";
                                        if (nTd) {
                                            Array.from(nTd.childNodes).forEach(n => {
                                                if (n.nodeType === Node.TEXT_NODE && /пара/i.test(n.nodeValue)) rNum = n.nodeValue.trim();
                                            });
                                        }
                                        nextPairId = `${dStr}_${rNum}_${dispSubject}`;
                                        break;
                                    }
                                }
                                if (nextPairId) notesData.specific[nextPairId] = val;
                                else {
                                    if (!notesData.next_unbound) notesData.next_unbound = {};
                                    notesData.next_unbound[dispSubject] = { text: val, week: currentWeek };
                                }
                            } else {
                                notesData.specific[pairId] = val;
                            }
                        }
                        localStorage.setItem('etis_subject_notes_v2', JSON.stringify(notesData));
                        closeModal(); renderNotes();
                    };

                    modal.querySelector('.clear-note-btn').onclick = () => {
                        modal.querySelector('#cp-notes-area').value = '';
                        modal.querySelector('.save-note-btn').click();
                    };

                    // --- ЛОГИКА НАСТРОЕК (ПЕРЕОПРЕДЕЛЕНИЕ) ---
                    modal.querySelector('.save-edit-btn').onclick = () => {
                        const newTitle = document.getElementById('cp-subject').value.trim();
                        const newLoc = document.getElementById('cp-aud').value.trim();
                        const newTeacher = document.getElementById('cp-teacher').value.trim();
                        if (!newTitle) return alert('Введите название!');

                        if (isPureCustom) {
                            // Если это полностью кастомная пара (через +)
                            let customPairs = JSON.parse(localStorage.getItem('etis_custom_pairs_v1') || '[]');
                            const cpId = row.getAttribute('data-custom-id');
                            const cpIndex = customPairs.findIndex(p => p.id === cpId);
                            if (cpIndex > -1) {
                                customPairs[cpIndex].subject = newTitle;
                                customPairs[cpIndex].aud = newLoc;
                                customPairs[cpIndex].teacher = newTeacher;
                                localStorage.setItem('etis_custom_pairs_v1', JSON.stringify(customPairs));
                                window.location.reload();
                            }
                        } else {
                            // Если это ЕТИС пара или Импортированная пара
                            const applyAll = document.getElementById('ext-apply-all').checked;
                            let overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                            
                            let timeKey = rawPairNum;
                            let dateKey = dayDateStr;
                            if (isExternal) {
                                timeKey = row.getAttribute('data-ext-time');
                                dateKey = row.getAttribute('data-ext-date');
                            }

                            const singleKey = `SINGLE_${dateKey}_${timeKey}_${origSubject}`;
                            const seriesKey = `SERIES_ALL_${origSubject}`;

                            if (applyAll) {
                                overrides[seriesKey] = { title: newTitle, loc: newLoc, teacher: newTeacher };
                                delete overrides[singleKey];
                            } else {
                                overrides[singleKey] = { title: newTitle, loc: newLoc, teacher: newTeacher };
                            }
                            localStorage.setItem('etis_ext_overrides', JSON.stringify(overrides));
                            window.location.reload();
                        }
                    };

                    if (!isPureCustom) {
                        modal.querySelector('.reset-edit-btn').onclick = () => {
                            let overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                            let timeKey = isExternal ? row.getAttribute('data-ext-time') : rawPairNum;
                            let dateKey = isExternal ? row.getAttribute('data-ext-date') : dayDateStr;
                            const singleKey = `SINGLE_${dateKey}_${timeKey}_${origSubject}`;
                            const seriesKey = `SERIES_ALL_${origSubject}`;
                            
                            delete overrides[singleKey];
                            delete overrides[seriesKey];
                            localStorage.setItem('etis_ext_overrides', JSON.stringify(overrides));
                            window.location.reload();
                        };
                    }

                    overlay.classList.add('active');
                    modal.classList.add('active');
                    document.body.classList.add('modal-open-body');
                    setTimeout(() => modal.querySelector('#cp-notes-area').focus(), 100);
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
                            currentTarget = dayHeader.closest('.day'); 
                            targetElements = [currentTarget];
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
                                // Свайп влево
                                swipeDir = 'left';
                                if (targetType === 'day') {
                                    iconEl.textContent = 'ios_share';
                                } else {
                                    iconEl.textContent = 'edit';
                                }
                            } else if (diffX > 0) {
                                // Свайп вправо
                                swipeDir = 'right';
                                if (targetType === 'day') {
                                    iconEl.textContent = 'add';
                                } else if (targetType === 'row') {
                                    // ПРОВЕРКА НА ПРОШЕДШУЮ ПАРУ
                                    let isPassed = false;
                                    const dayDateEl = currentTarget.closest('.day')?.querySelector('.day-date');
                                    if (dayDateEl) {
                                        const dateStr = dayDateEl.textContent.trim();
                                        const match = dateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                                        let classDate = new Date();
                                        if (match) {
                                            const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                                            if (m !== undefined) {
                                                classDate.setMonth(m);
                                                classDate.setDate(parseInt(match[1]));
                                            }
                                        } else {
                                            const isoMatch = dateStr.match(/(\d{2})\.(\d{2})/);
                                            if (isoMatch) {
                                                classDate.setMonth(parseInt(isoMatch[2])-1);
                                                classDate.setDate(parseInt(isoMatch[1]));
                                            }
                                        }
                                        classDate.setHours(0,0,0,0);
                                        const today = new Date();
                                        today.setHours(0,0,0,0);
                                        
                                        if (classDate.getTime() < today.getTime()) {
                                            isPassed = true;
                                        } else if (classDate.getTime() === today.getTime()) {
                                            const timeEl = currentTarget.querySelector('.eval');
                                            if (timeEl) {
                                                const parts = timeEl.textContent.trim().split(':');
                                                if (parts.length === 2) {
                                                    const startMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                                                    const currentMins = new Date().getHours() * 60 + new Date().getMinutes();
                                                    if (currentMins >= startMins) isPassed = true;
                                                }
                                            }
                                        }
                                    }

                                    if (!isPassed) {
                                        iconEl.textContent = 'notification_important';
                                        bubble.className = 'active-threshold action-important';
                                    } else if (hasEval) {
                                        iconEl.textContent = 'star_rate';
                                        bubble.className = 'active-threshold action-eval';
                                    } else {
                                        // Если пара прошла и кнопки оценки тоже нет — сбрасываем свайп
                                        targetElements.forEach(el => el.style.transform = `translateX(0px)`);
                                        bubble.style.opacity = '0';
                                        return;
                                    }
                                }
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

                            // 1. Двигаем строку или день
                            targetElements.forEach(el => el.style.transform = `translateX(${moveX}px)`);

                            // 2. Иконка появляется ровно по центру образующейся пустоты
                            const currentRect = targetElements[0].getBoundingClientRect();
                            bubble.style.top = `${currentRect.top + currentRect.height / 2 - 12}px`;
                            bubble.style.opacity = Math.min(Math.abs(diffX) / 30, 1).toString();

                            if (swipeDir === 'left') {
                                // Пустота образуется СПРАВА
                                bubble.style.left = `${originalRect.right + (moveX / 2) - 12}px`;
                            } else {
                                // Пустота образуется СЛЕВА
                                bubble.style.left = `${originalRect.left + (moveX / 2) - 12}px`;
                            }

                            // 3. Индикация прохождения порога (смена цвета)
                            if (Math.abs(diffX) >= THRESHOLD) {
                                if (targetType === 'day') {
                                    if (swipeDir === 'left') {
                                        bubble.classList.add('active-threshold', 'action-share');
                                    } else {
                                        bubble.classList.add('active-threshold', 'action-add');
                                    }
                                } else if (swipeDir === 'left') {
                                    bubble.classList.add('active-threshold', 'action-note');
                                } else if (!bubble.classList.contains('action-important')) {
                                    bubble.classList.add('active-threshold', 'action-eval');
                                }

                                if (!bubble.dataset.vibrated && navigator.vibrate) {
                                    navigator.vibrate(15);
                                    bubble.dataset.vibrated = 'true';
                                }
                            } else {
                                bubble.classList.remove('active-threshold', 'action-add', 'action-note', 'action-eval', 'action-share', 'action-important');
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
                        const bubbleClass = bubble.className;

                        // Плавный возврат элемента на место
                        targetElements.forEach(elem => {
                            elem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            elem.style.transform = 'translateX(0px)';
                        });

                        // Иконка плавно затухает
                        bubble.style.opacity = '0';
                        bubble.classList.remove('active-threshold', 'action-add', 'action-note', 'action-eval', 'action-share', 'action-important');
                        bubble.dataset.vibrated = '';

                        // Выполнение действия
                        if (Math.abs(diffX) >= THRESHOLD) {
                            setTimeout(() => {
                                if (tType === 'day') {
                                    if (dir === 'left') {
                                        const shareBtn = target.querySelector('.share-day-btn');
                                        if (shareBtn) shareBtn.click();
                                    } else if (dir === 'right') {
                                        const dayNameEl = target.querySelector('.day-name');
                                        if (dayNameEl) openCustomPairModal(dayNameEl.textContent.trim());
                                    }
                                } else if (tType === 'row') {
                                    if (dir === 'left') {
                                        const noteBtn = target.querySelector('.subject-note-btn');
                                        if (noteBtn) noteBtn.click();
                                    } else if (dir === 'right') {
                                        if (bubbleClass.includes('action-important')) {
                                            const impBtn = target.querySelector('.pair-important-btn');
                                            if (impBtn) impBtn.click();
                                        } else if (bubbleClass.includes('action-eval')) {
                                            if (el) {
                                                if (el.hasAttribute('href')) window.location.href = el.getAttribute('href');
                                                else el.click();
                                            }
                                        }
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

                // --- 10. ИМПОРТ И ПАРСИНГ ВНЕШНЕГО КАЛЕНДАРЯ (iCloud / Google) ---
                function loadExternalCalendar() {
                    // Авто-миграция (на случай, если пользователь еще не заходил во вкладку Синхронизация)
                    let oldUrl = localStorage.getItem('etis_external_cal_link');
                    if (oldUrl) {
                        let arr = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
                        if (!arr.includes(oldUrl)) arr.push(oldUrl);
                        localStorage.setItem('etis_external_cals_v2', JSON.stringify(arr));
                        localStorage.removeItem('etis_external_cal_link');
                    }

                    let urls = JSON.parse(localStorage.getItem('etis_external_cals_v2') || '[]');
                    if (urls.length === 0) return;

                    urls.forEach(url => {
                        let fetchUrl = url.trim();
                        if (fetchUrl.startsWith('webcal://')) {
                            fetchUrl = fetchUrl.replace(/^webcal:\/\//i, 'https://');
                        } else if (!fetchUrl.startsWith('http')) {
                            fetchUrl = 'https://' + fetchUrl;
                        }

                        console.log("[ETIS Calendar] Отправляем запрос на:", fetchUrl);

                        GM_xmlhttpRequest({
                            method: "GET",
                            url: fetchUrl,
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                                "Accept": "text/calendar, text/plain, */*",
                                "Cache-Control": "no-cache"
                            },
                            timeout: 15000,
                            onload: function(res) {
                                if (res.status >= 200 && res.status < 400) {
                                    if (!res.responseText.includes('BEGIN:VCALENDAR')) {
                                        console.error("[ETIS Calendar] Файл не является iCal.");
                                        return;
                                    }
                                    try {
                                        const events = parseICS(res.responseText);
                                        console.log(`[ETIS Calendar] Успешно распарсено событий: ${events.length}`);
                                        injectExternalEvents(events);
                                    } catch (e) {
                                        console.error("[ETIS Calendar] Ошибка при парсинге календаря:", e);
                                    }
                                } else {
                                    console.error(`[ETIS Calendar] Ошибка сервера: ${res.status}`);
                                }
                            },
                            onerror: function(err) {
                                console.error("[ETIS Calendar] Ошибка сети (Network Error):", err);
                            }
                        });
                    });
                }

                function parseICS(icsString) {
                    const unfolded = icsString.replace(/\r?\n[ \t]/g, '');
                    const lines = unfolded.split(/\r?\n/);
                    
                    const events = [];
                    let currentEvent = null;

                    for (let line of lines) {
                        if (line.startsWith('BEGIN:VEVENT')) {
                            currentEvent = { exdates: [] };
                        } else if (line.startsWith('END:VEVENT')) {
                            if (currentEvent && currentEvent.start && !currentEvent.cancelled) {
                                events.push(currentEvent);
                            }
                            currentEvent = null;
                        } else if (currentEvent) {
                            const colonIdx = line.indexOf(':');
                            if (colonIdx > -1) {
                                let key = line.substring(0, colonIdx);
                                const value = line.substring(colonIdx + 1);
                                
                                if (key.includes(';')) key = key.split(';')[0];
                                
                                if (key === 'SUMMARY') currentEvent.summary = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');
                                else if (key === 'LOCATION') currentEvent.location = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');
                                else if (key === 'DESCRIPTION') currentEvent.description = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');
                                else if (key === 'URL') currentEvent.url = value;
                                else if (key === 'DTSTART') currentEvent.start = parseICalDate(value);
                                else if (key === 'DTEND') currentEvent.end = parseICalDate(value);
                                else if (key === 'RRULE') currentEvent.rrule = value.toUpperCase();
                                else if (key === 'EXDATE') currentEvent.exdates.push(value);
                                else if (key === 'STATUS' && value.toUpperCase() === 'CANCELLED') currentEvent.cancelled = true;
                            }
                        }
                    }
                    return events;
                }

                function parseICalDate(str) {
                    if (!str) return null;
                    if (str.includes(':')) str = str.split(':')[1];
                    str = str.replace(/[^0-9TZ]/g, ''); // Удаляем любые скрытые символы

                    if (str.length === 8) {
                        const y = parseInt(str.substring(0, 4), 10);
                        const m = parseInt(str.substring(4, 6), 10) - 1;
                        const d = parseInt(str.substring(6, 8), 10);
                        return new Date(y, m, d);
                    }

                    if (str.length >= 15) {
                        const y = parseInt(str.substring(0, 4), 10);
                        const m = parseInt(str.substring(4, 6), 10) - 1;
                        const d = parseInt(str.substring(6, 8), 10);
                        const tIdx = str.indexOf('T');
                        
                        if (tIdx > -1) {
                            const h = parseInt(str.substring(tIdx + 1, tIdx + 3), 10);
                            const min = parseInt(str.substring(tIdx + 3, tIdx + 5), 10);
                            const s = parseInt(str.substring(tIdx + 5, tIdx + 7), 10);
                            
                            if (str.endsWith('Z')) return new Date(Date.UTC(y, m, d, h, min, s));
                            return new Date(y, m, d, h, min, s);
                        }
                    }
                    return null;
                }

                function eventOccursOnDate(ev, targetDateObj) {
                    if (!ev.start) return false;
                    const evStartZero = new Date(ev.start.getFullYear(), ev.start.getMonth(), ev.start.getDate());

                    if (ev.exdates && ev.exdates.length > 0) {
                        const yyyy = targetDateObj.getFullYear();
                        const mm = String(targetDateObj.getMonth() + 1).padStart(2, '0');
                        const dd = String(targetDateObj.getDate()).padStart(2, '0');
                        const dateStr = `${yyyy}${mm}${dd}`;
                        if (ev.exdates.some(ex => ex.includes(dateStr))) return false;
                    }

                    if (!ev.rrule) {
                        if (evStartZero.getTime() === targetDateObj.getTime()) return true;
                        if (ev.end) {
                            const evEndZero = new Date(ev.end.getFullYear(), ev.end.getMonth(), ev.end.getDate());
                            if (targetDateObj >= evStartZero && targetDateObj < evEndZero) return true;
                        }
                        return false;
                    }

                    if (targetDateObj.getTime() < evStartZero.getTime()) return false;

                    const untilMatch = ev.rrule.match(/UNTIL=([0-9A-Z]+)/);
                    if (untilMatch) {
                        const untilDate = parseICalDate(untilMatch[1]);
                        if (untilDate) {
                            untilDate.setHours(23, 59, 59, 999);
                            if (targetDateObj.getTime() > untilDate.getTime()) return false;
                        }
                    }

                    const intervalMatch = ev.rrule.match(/INTERVAL=(\d+)/);
                    const interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;

                    if (ev.rrule.includes('FREQ=DAILY')) {
                        const diffTime = Math.abs(targetDateObj - evStartZero);
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays % interval === 0;
                    }

                    if (ev.rrule.includes('FREQ=WEEKLY')) {
                        const getMon = (d) => { const nd = new Date(d); nd.setDate(nd.getDate() - (nd.getDay() || 7) + 1); return nd.setHours(0,0,0,0); };
                        const diffWeeks = Math.round((getMon(targetDateObj) - getMon(evStartZero)) / (7 * 24 * 3600 * 1000));
                        
                        if (diffWeeks % interval !== 0) return false;

                        const byDayMatch = ev.rrule.match(/BYDAY=([^;]+)/);
                        if (byDayMatch) {
                            const daysMap = { 'SU':0, 'MO':1, 'TU':2, 'WE':3, 'TH':4, 'FR':5, 'SA':6 };
                            const targetDay = targetDateObj.getDay();
                            const validDays = byDayMatch[1].split(',').map(d => daysMap[d.trim().slice(-2)]);
                            return validDays.includes(targetDay);
                        } else {
                            return ev.start.getDay() === targetDateObj.getDay();
                        }
                    }
                    return false;
                }

                function injectExternalEvents(parsedEvents) {
                    let injectedAnything = false;
                    const days = span9.querySelectorAll("div.day");

                    console.log(`[ETIS Calendar] Поиск совпадений для ${days.length} дней на странице...`);

                    days.forEach(day => {
                        const dateSpan = day.querySelector('.day-date');
                        if (!dateSpan) return;
                        
                        const dateStr = dateSpan.textContent.trim();
                        let targetDate = null;
                        
                        const dateMatch = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                        if (dateMatch) {
                            targetDate = new Date(parseInt(dateMatch[3], 10), parseInt(dateMatch[2], 10)-1, parseInt(dateMatch[1], 10));
                        } else {
                            const monthsMap = { 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 };
                            const textMatch = dateStr.match(/(\d{1,2})\s+([а-я]+)(?:\s+(\d{4}))?/i);
                            
                            if (textMatch && monthsMap[textMatch[2].toLowerCase()] !== undefined) {
                                const d = parseInt(textMatch[1], 10);
                                const m = monthsMap[textMatch[2].toLowerCase()];
                                let y;
                                
                                if (textMatch[3]) {
                                    y = parseInt(textMatch[3], 10);
                                } else {
                                    const now = new Date();
                                    y = now.getFullYear();
                                    const curM = now.getMonth();
                                    
                                    if (curM >= 9 && m <= 5) y++;
                                    else if (curM <= 2 && m >= 7) y--;
                                }
                                targetDate = new Date(y, m, d);
                            }
                        }
                        
                        if (!targetDate) {
                            console.warn("[ETIS Calendar] Не удалось распознать дату из заголовка ЕТИС:", dateStr);
                            return;
                        }
                        targetDate.setHours(0, 0, 0, 0);

                        const dayEvents = parsedEvents.filter(ev => eventOccursOnDate(ev, targetDate));
                        if (dayEvents.length === 0) return;

                        const table = day.querySelector('table');
                        if (!table) return;
                        const tbody = table.querySelector('tbody') || table;

                        dayEvents.forEach(ev => {
                            injectedAnything = true;

                            Array.from(tbody.querySelectorAll('tr')).forEach(r => {
                                if (r.textContent.includes('0 пар') || r.textContent.includes('Выходной')) r.remove();
                            });

                            const isAllDay = ev.start.getHours() === 0 && ev.start.getMinutes() === 0 && (!ev.end || (ev.end.getHours() === 0 && ev.end.getMinutes() === 0));
                            
                            // Подготавливаем ключи для системы переопределений (Overrides)
                            const originalTitle = ev.summary || 'Личное событие';
                            const originalLoc = ev.location || '';
                            const timeKey = isAllDay ? "Весь день" : `${String(ev.start.getHours()).padStart(2, '0')}:${String(ev.start.getMinutes()).padStart(2, '0')}`;
                            const dateKey = `${targetDate.getFullYear()}${String(targetDate.getMonth()+1).padStart(2,'0')}${String(targetDate.getDate()).padStart(2,'0')}`;
                            
                            const overrides = JSON.parse(localStorage.getItem('etis_ext_overrides') || '{}');
                            const singleKey = `SINGLE_${dateKey}_${timeKey}_${originalTitle}`;
                            const seriesKey = `SERIES_${timeKey}_${originalTitle}`;
                            
                            let activeOverride = null;
                            let isSeries = false;
                            
                            if (overrides[singleKey]) {
                                activeOverride = overrides[singleKey];
                            } else if (overrides[seriesKey]) {
                                activeOverride = overrides[seriesKey];
                                isSeries = true;
                            }

                            // Применяем переопределения, если они есть
                            const displayTitle = activeOverride && activeOverride.title ? activeOverride.title : originalTitle;
                            const displayLoc = activeOverride && activeOverride.loc !== undefined ? activeOverride.loc : originalLoc;
                            const displayTeacher = activeOverride && activeOverride.teacher ? activeOverride.teacher : '';

                            // ИЗВЛЕЧЕНИЕ ССЫЛОК ИЗ КАЛЕНДАРЯ
                            let extractedUrl = ev.url || '';
                            if (!extractedUrl && ev.description) {
                                // Ищем любую ссылку в описании события
                                const urlMatch = ev.description.match(/(https?:\/\/[^\s<]+)/i);
                                if (urlMatch) extractedUrl = urlMatch[1];
                            }
                            if (!extractedUrl && originalLoc) {
                                // Или ищем ссылку в поле локации
                                const urlMatch = originalLoc.match(/(https?:\/\/[^\s<]+)/i);
                                if (urlMatch) extractedUrl = urlMatch[1];
                            }

                            // Генерируем контент для блока аудитории
                            let audContent = '';
                            if (displayLoc && !displayLoc.match(/^https?:\/\//i)) {
                                // Если локация это текст, а не ссылка, выводим с иконкой метки
                                audContent += `<div style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary);"><span class="material-icons" style="font-size: 1.5rem;">place</span>${displayLoc}</div>`;
                            }
                            if (extractedUrl) {
                                // Формируем красивую капсулу-кнопку для ссылки
                                let platformName = "Онлайн";
                                let linkClass = "btn-generic-online";
                                
                                if (extractedUrl.includes('zoom.us')) { platformName = "Zoom"; linkClass = ""; }
                                else if (extractedUrl.includes('telemost')) { platformName = "Телемост"; linkClass = ""; }
                                
                                audContent += `<a href="${extractedUrl}" target="_blank" class="${linkClass}">${platformName}</a>`;
                            }

                            // Форматируем время вывода
                            let timeHtml = '';
                            if (isAllDay) {
                                timeHtml = `<font class="eval" style="font-size: inherit !important; color: inherit !important;">Весь день</font>`;
                            } else {
                                const startStr = timeKey;
                                const endStr = ev.end ? `${String(ev.end.getHours()).padStart(2, '0')}:${String(ev.end.getMinutes()).padStart(2, '0')}` : '';
                                
                                timeHtml = `<font class="eval" style="font-size: inherit !important; color: inherit !important; display: inline-flex !important; align-items: center !important; gap: 4px !important; line-height: 1.2 !important;">${startStr}</font>`;
                                if (endStr) {
                                    timeHtml += `<br><span style="font-size: 1.1rem; color: var(--color-text-secondary); line-height: 1.4;">${endStr}</span>`;
                                }
                            }

                            // Создаем строку, зашивая в data-атрибуты оригинальные данные (для редактора)
                            const tr = document.createElement('tr');
                            tr.className = 'custom-pair-row external-event-row';
                            tr.setAttribute('data-ext-orig-title', originalTitle.replace(/"/g, '&quot;'));
                            tr.setAttribute('data-ext-orig-loc', originalLoc.replace(/"/g, '&quot;'));
                            tr.setAttribute('data-ext-time', timeKey);
                            tr.setAttribute('data-ext-date', dateKey);
                            tr.setAttribute('data-ext-disp-title', displayTitle.replace(/"/g, '&quot;'));
                            tr.setAttribute('data-ext-disp-loc', displayLoc.replace(/"/g, '&quot;'));
                            tr.setAttribute('data-ext-disp-teacher', displayTeacher.replace(/"/g, '&quot;'));
                            tr.setAttribute('data-ext-is-series', isSeries);

                            tr.innerHTML = `
                                <td class="pair_num">
                                    <div class="pair-badge-wrapper">
                                        <span class="pair-type-badge" style="color: #AF52DE;">ЛИЧ</span>
                                    </div>
                                    ${timeHtml}
                                </td>
                                <td class="pair_info">
                                    <div class="dis" style="display: flex; align-items: center; flex-wrap: wrap;">
                                        <span style="font-weight:700; color:var(--color-text-primary); pointer-events:none;">${displayTitle}</span>
                                    </div>
                                    ${audContent ? `
                                    <div class="aud" style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0.8rem; margin-top: 0.6rem;">
                                        ${audContent}
                                    </div>` : ''}
                                </td>
                                <td class="pair_teacher">
                                    ${displayTeacher ? `<a href="#" style="color: var(--color-text-secondary); text-decoration: none; pointer-events: none;">${displayTeacher}</a>` : ''}
                                </td>
                            `;
                            tbody.appendChild(tr);
                        });

                        const rows = Array.from(tbody.querySelectorAll('tr:not(.timetable-gap-row):not(.custom-no-pairs)'));
                        rows.sort((a, b) => {
                            const timeA = a.querySelector('.eval')?.textContent || '';
                            const timeB = b.querySelector('.eval')?.textContent || '';
                            
                            if (timeA === "Весь день") return -1;
                            if (timeB === "Весь день") return 1;

                            const timeAStr = timeA.split(':');
                            const timeBStr = timeB.split(':');
                            
                            const valA = (parseInt(timeAStr[0], 10) || 0) * 60 + (parseInt(timeAStr[1], 10) || 0);
                            const valB = (parseInt(timeBStr[0], 10) || 0) * 60 + (parseInt(timeBStr[1], 10) || 0);
                            
                            return valA - valB;
                        });
                        rows.forEach(r => tbody.appendChild(r));
                    });

                    if (injectedAnything) {
                        if (typeof recalculateTimetable === 'function') recalculateTimetable();
                        if (typeof renderNotes === 'function') renderNotes();
                        if (typeof updateLiveTimetable === 'function') updateLiveTimetable();
                        if (typeof dimPastPairs === 'function') dimPastPairs();
                    }
                }

                // Запуск логики
                loadExternalCalendar();

                updateLiveTimetable();

                // --- ФУНКЦИЯ ЗАТЕМНЕНИЯ ПРОШЕДШИХ ПАР ---
                function dimPastPairs() {
                    const days = document.querySelectorAll('.span9 .day');
                    const now = new Date();
                    const todayMins = now.getHours() * 60 + now.getMinutes();
                    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                    days.forEach(day => {
                        const dateEl = day.querySelector('.day-date');
                        if (!dateEl) return;
                        
                        let classDateObj = new Date();
                        const dateStr = dateEl.textContent.trim();
                        const match = dateStr.match(/(\d{1,2})\s+([а-яА-Я]+)/);
                        
                        if (match) {
                            const m = {'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11}[match[2].toLowerCase()];
                            classDateObj.setMonth(m);
                            classDateObj.setDate(parseInt(match[1]));
                        } else {
                            const isoMatch = dateStr.match(/(\d{2})\.(\d{2})/);
                            if (isoMatch) {
                                classDateObj.setMonth(parseInt(isoMatch[2])-1);
                                classDateObj.setDate(parseInt(isoMatch[1]));
                            }
                        }
                        classDateObj.setHours(0,0,0,0);
                        const classTime = classDateObj.getTime();

                        const isPastDay = classTime < todayZero;
                        const isToday = classTime === todayZero;

                        // захватываем и строки выходных
                        day.querySelectorAll('.timetable-grid tr').forEach(row => {
                            let isPassed = false;
                            
                            if (isPastDay) {
                                isPassed = true;
                            } else if (isToday) {
                                let startMins = -1;
                                let duration = 90;

                                if (row.classList.contains('timetable-gap-row')) {
                                    const startStr = row.getAttribute('data-gap-start');
                                    const count = parseInt(row.getAttribute('data-gap-count') || "1");
                                    duration = (count * 90) + ((count - 1) * 10);
                                    if (startStr && startStr !== "00:00") {
                                        const p = startStr.split(':');
                                        startMins = parseInt(p[0]) * 60 + parseInt(p[1]);
                                    }
                                } else if (row.classList.contains('custom-no-pairs')) {
                                    // Выходной день сегодня не закрашиваем тусклым, пока он не закончится совсем
                                    isPassed = false;
                                } else {
                                    const timeEl = row.querySelector('.eval');
                                    if (timeEl && !timeEl.textContent.includes("Весь день")) {
                                        const timeMatch = timeEl.textContent.match(/(\d{1,2}):(\d{2})/);
                                        if (timeMatch) {
                                            startMins = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
                                        }
                                    }
                                }

                                if (startMins !== -1) {
                                    if (todayMins >= (startMins + duration)) isPassed = true;
                                }
                            }

                            if (isPassed && generalConfig.dimPastPairs) {
                                row.classList.add('pair-passed');
                            } else {
                                row.classList.remove('pair-passed');
                            }
                        });
                    });
                }
                window.applyDimming = dimPastPairs;

                // --- УНИВЕРСАЛЬНАЯ ОЧИСТКА РАСПИСАНИЯ ДЛЯ HTML2CANVAS ---
                const cleanTimetableForExport = async (clone) => {
                    // 1. Удаляем UI-мусор
                    clone.querySelectorAll('.share-day-btn, .add-custom-pair-btn, .live-dot, .day-status-icon, .pair_teacher .eval, .pair-important-btn, .subject-note-btn, .delete-custom-pair-btn, .hidden-by-filter').forEach(el => el.remove());
                    
                    // 2. Убираем эффект "прошедших пар"
                    clone.querySelectorAll('.pair-passed, td').forEach(el => {
                        el.classList.remove('pair-passed');
                        el.style.setProperty('opacity', '1', 'important');
                    });

                    // 3. ДОБАВЛЯЕМ QR-КОДЫ ДЛЯ ОНЛАЙН ПАР
                    const qrPromises = [];
                    
                    if (generalConfig.generateQR) {
                        clone.querySelectorAll('.timetable-grid tr').forEach(tr => {
                            const link = tr.querySelector('.aud a[href]');
                            const teacherCell = tr.querySelector('.pair_teacher');
                            
                            if (link && teacherCell && link.href) {
                                const qrUrl = `https://quickchart.io/qr?size=150&margin=1&text=${encodeURIComponent(link.href)}`;
                                
                                const promise = new Promise((resolve) => {
                                    GM_xmlhttpRequest({
                                        method: 'GET',
                                        url: qrUrl,
                                        responseType: 'blob',
                                        onload: function(res) {
                                            if (res.status === 200) {
                                                const reader = new FileReader();
                                                reader.onloadend = function() {
                                                    const img = document.createElement('img');
                                                    img.src = reader.result;
                                                    img.style.cssText = 'width: 64px; height: 64px; flex-shrink: 0; margin-right: 14px; display: block; mix-blend-mode: multiply;';
                                                    
                                                    const teacherText = teacherCell.innerHTML;
                                                    teacherCell.innerHTML = '';
                                                    
                                                    const wrapper = document.createElement('div');
                                                    wrapper.style.cssText = 'display: flex; align-items: center; justify-content: flex-end; width: 100%;';
                                                    
                                                    const textWrapper = document.createElement('div');
                                                    textWrapper.innerHTML = teacherText;
                                                    textWrapper.style.cssText = 'text-align: right; display: flex; flex-direction: column; justify-content: center;';
                                                    
                                                    textWrapper.querySelectorAll('a').forEach(a => {
                                                        a.style.setProperty('color', 'var(--color-text-secondary)', 'important');
                                                        a.style.setProperty('text-decoration', 'none', 'important');
                                                    });
                                                    
                                                    wrapper.appendChild(img);
                                                    wrapper.appendChild(textWrapper);
                                                    teacherCell.appendChild(wrapper);
                                                    resolve();
                                                };
                                                reader.readAsDataURL(res.response);
                                            } else {
                                                resolve(); 
                                            }
                                        },
                                        onerror: () => resolve()
                                    });
                                });
                                qrPromises.push(promise);
                            }
                        });

                        // Ждем, пока все QR-коды загрузятся
                        await Promise.all(qrPromises);
                    }

                    // 4. Вшиваем стили рендера
                    const exportStyles = document.createElement('style');
                    exportStyles.innerHTML = `
                        .timetable-grid { table-layout: fixed !important; width: 100% !important; border-spacing: 0 !important; border-collapse: collapse !important; }
                        .timetable-grid td { white-space: normal !important; word-wrap: break-word !important; border-bottom: none !important; padding: 12px 0 !important; }
                        
                        .timetable-grid td.pair_num {
                            width: 90px !important; min-width: 90px !important;
                            font-size: 1.1rem !important; 
                            text-align: center !important; padding: 12px 5px !important;
                        }
                        
                        .timetable-grid td.pair_info {
                            width: auto !important; padding-left: 5px !important; padding-right: 5px !important; text-align: left !important;
                        }
                        
                        .timetable-grid td.pair_teacher {
                            width: 200px !important; min-width: 200px !important;
                            text-align: right !important; padding-right: 16px !important;
                            display: table-cell !important;
                        }

                        .timetable-grid tr:not(:last-child) {
                            background-image: linear-gradient(to right, transparent 90px, var(--color-table-border) 90px, var(--color-table-border) calc(100% - 16px), transparent calc(100% - 16px)) !important;
                            background-position: bottom !important;
                            background-size: 100% 1px !important;
                            background-repeat: no-repeat !important;
                            background-color: transparent !important;
                        }

                        .day-status-icon { display: none !important; }

                        .timetable-gap-capsule {
                            background: var(--color-accent-active) !important;
                            color: var(--color-accent) !important;
                            border: 1px solid var(--color-accent-active) !important;
                            display: inline-flex !important; align-items: center !important;
                            width: max-content !important; flex: 0 0 auto !important;
                        }
                        .aud a, .btn-generic-online {
                            display: inline-flex !important; align-items: center !important;
                            width: max-content !important; flex: 0 0 auto !important;
                            text-decoration: none !important;
                        }
                        .type-badge-holiday { color: #00BFA5 !important; }
                    `;
                    clone.appendChild(exportStyles);

                    clone.querySelectorAll('.timetable-grid tr').forEach(tr => {
                        tr.style.removeProperty('background');
                        tr.style.setProperty('background-color', 'transparent', 'important');
                    });
                    
                    clone.querySelectorAll('*').forEach(el => el.style.boxSizing = 'border-box');
                };

                dimPastPairs();
                setInterval(dimPastPairs, 60000);

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
                        // --- АВТО-ПРОЧТЕНИЕ ---
                        if (firstLi.hasAttribute('onclick')) {
                            const clickFunc = firstLi.getAttribute('onclick');
                            if (clickFunc.includes('ann_read') || clickFunc.includes('msg_read')) {
                                try { new Function(clickFunc)(); } catch(e) {}
                            }
                        }
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
                        
                        // ИЩЕМ ДАТЫ И В ТЕЛЕ, И В ЗАГОЛОВКЕ
                        bodyHtml = highlightDatesInHTML(bodyHtml, titleStr || 'Объявление');
                        const highlightedTitle = titleStr ? highlightDatesInHTML(titleStr, titleStr) : '';

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
                            ${highlightedTitle ? `<div class="msg-subject">${highlightedTitle}</div>` : ''}
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

                    // Инициализация свайпов для мобилок
                    initMessageSwipes(container, 'Объявление.png');

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
                        // --- АВТО-ПРОЧТЕНИЕ ---
                        if (mainLi.hasAttribute('onclick')) {
                            const clickFunc = mainLi.getAttribute('onclick');
                            if (clickFunc.includes('read')) {
                                try { new Function(clickFunc)(); } catch(e) {}
                            }
                        }
                        const teacherNode = cloneContent.querySelector('b i');
                        const teacherName = teacherNode ? teacherNode.textContent.trim() : 'Преподаватель';
                        
                        const bTag = cloneContent.querySelector('b');
                        if (bTag && bTag.contains(teacherNode)) bTag.remove();
                        const dateNode = cloneContent.querySelector('font[color="#808080"]');
                        const dateStr = dateNode ? formatEtisDate(dateNode.textContent.trim()) : '';
                        if (dateNode) dateNode.remove();
                        
                        const subjects = [];
                        cloneContent.querySelectorAll('font').forEach(f => { subjects.push(f.textContent.trim()); f.remove(); });

                        // ИЩЕМ ДАТЫ И В ТЕЛЕ, И В ТЕМАХ
                        const highlightedBody = highlightDatesInHTML(cloneContent.innerHTML, subjects[0] || teacherName || 'Сообщение');
                        const highlightedSubjects = subjects.map(s => highlightDatesInHTML(s, s));

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
                            ${highlightedSubjects.length ? `<div class="msg-subject">${highlightedSubjects.join('<br>')}</div>` : ''}
                            <div class="msg-body">${highlightedBody}</div> 
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

                    // Инициализация свайпов для мобилок
                    initMessageSwipes(container, 'Сообщение.png');

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
                                    <div style="font-size: 1.05rem; font-weight: 800; text-transform: uppercase; padding: 0 1.2rem; height: 2.4rem; border-radius: 50px; letter-spacing: 0.5px; white-space: nowrap; background: ${statusBg}; color: ${statusColor}; margin-left: 10px; flex-shrink: 0; align-self: center; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">
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
                    // СТИЛИ ДЛЯ ТУЛТИПОВ В ТАБЛИЦАХ ОЦЕНОК
                    if (!document.getElementById('etis-reborn-grades-tooltip-css')) {
                        const css = document.createElement('style');
                        css.id = 'etis-reborn-grades-tooltip-css';
                        css.innerHTML = `
                            .kt-score-capsule { position: relative; cursor: pointer; -webkit-tap-highlight-color: transparent; }
                            .grade-cell-tooltip { 
                                right: 0 !important; 
                                left: auto !important;
                                transform: translateY(10px) !important; 
                                bottom: 140% !important; 
                                pointer-events: none;
                                z-index: 1000 !important; 
                            }
                            .grade-cell-tooltip::after { 
                                right: 15px !important; 
                                left: auto !important;
                                transform: none !important; 
                            }
                            .kt-score-capsule:hover .grade-cell-tooltip, 
                            .kt-score-capsule:active .grade-cell-tooltip { 
                                transform: translateY(0) !important; 
                                opacity: 1; 
                                visibility: visible; 
                            }
                        `;
                        document.head.appendChild(css);
                    }

                    // УНИФИКАЦИЯ ПОДМЕНЮ
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

                    // ГЛОБАЛЬНАЯ ОЧИСТКА ТАБЛИЦ
                    span9.querySelectorAll('table.common').forEach(table => {
                        table.removeAttribute('width');
                        table.style.width = "100%";
                        table.querySelectorAll('tr, td, th').forEach(el => {
                            el.removeAttribute('width');
                            el.removeAttribute('style');
                            el.removeAttribute('bgcolor');
                            el.removeAttribute('align');
                            el.removeAttribute('valign');
                            el.removeAttribute('onmouseover');
                            el.removeAttribute('onmouseout');
                        });
                    });

                    // ОБРАБОТКА "ОЦЕНКИ ЗА СЕССИИ"
                    if (pageMode === 'session' || !pageMode) {
                        const submenu = span9.querySelector('.submenu');

                        // Тулбар поиска
                        let searchContainer = document.querySelector('.signs-local-input')?.closest('.timetable-toolbar');
                        if (!searchContainer) {
                            searchContainer = document.createElement('div');
                            searchContainer.className = 'timetable-toolbar';
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
                        }

                        const signsTables = span9.querySelectorAll('table.common');

                        signsTables.forEach(table => {
                            const rows = Array.from(table.querySelectorAll('tr'));
                            const headerRow = rows.find(r => r.textContent.toLowerCase().includes('дисциплина'));
                            let trimesterData = [];

                            let currentBlock = null;
                            rows.forEach(row => {
                                const cells = row.children;
                                if (cells.length === 1 && (cells[0].tagName === 'TH' || cells[0].classList.contains('subheader'))) {
                                    if (currentBlock) trimesterData.push(currentBlock);
                                    currentBlock = { headerRaw: cells[0].textContent.trim(), rows: [] };
                                } else if (currentBlock && cells.length > 1 && !row.textContent.includes('Дисциплина')) {
                                    currentBlock.rows.push(row);
                                }
                            });
                            if (currentBlock) trimesterData.push(currentBlock);

                            trimesterData.forEach(block => {
                                let sum = 0, count = 0, hasFail = false, hasPass = false, hasAny = false;
                                block.rows.forEach(r => {
                                    const gText = r.cells[1].textContent.trim().toLowerCase();
                                    if (gText && gText !== 'н') {
                                        hasAny = true;
                                        let num = parseFloat(gText.replace(',', '.'));
                                        if (gText.includes('незач') || gText === '2') { hasFail = true; sum += 2; count++; }
                                        else if (gText.includes('зач')) { hasPass = true; sum += 5; count++; }
                                        else if (!isNaN(num) && num >= 3 && num <= 5) { sum += num; count++; }
                                    }
                                    
                                    const gradeCell = r.cells[1];
                                    const dateCell = r.cells[2];
                                    if (gradeCell) {
                                        let bg = 'rgba(142, 142, 147, 0.15)', color = 'var(--color-text-secondary)';
                                        const gt = gradeCell.textContent.trim().toLowerCase();
                                        if (gt.includes('отлич') || gt === '5' || gt.includes('зач')) { bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)'; }
                                        else if (gt.includes('хор') || gt === '4') { bg = 'rgba(0, 122, 255, 0.15)'; color = 'var(--color-blue)'; }
                                        else if (gt.includes('удовл') || gt === '3') { bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)'; }
                                        else if (gt.includes('незач') || gt.includes('неуд') || gt === '2' || gt === 'н') { bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)'; }
                                        gradeCell.innerHTML = `<span class="kt-score-capsule" style="background:${bg}; color:${color}; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; display: inline-block; min-width: 24px; text-align: center;">${gradeCell.textContent.trim()}</span>`;
                                    }
                                    if (dateCell) {
                                        dateCell.textContent = dateCell.textContent.trim().replace(/\.20(\d{2})/, '.$1');
                                        dateCell.style.fontSize = '1.2rem'; dateCell.style.opacity = '0.7';
                                    }
                                });

                                const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;

                                // Парсинг (Только Номер, Тип периода и Курс)
                                const trimM = block.headerRaw.match(/(\d+)\s+(триместр|семестр)/i);
                                const courseM = block.headerRaw.match(/(\d+)\s+курс/i);
                                
                                const typePart = trimM ? trimM[2].toUpperCase() : "ТРИМЕСТР";
                                const numPart = trimM ? trimM[1] : "";
                                const coursePart = courseM ? `${courseM[1]} КУРС` : "";
                                const combinedInfo = [`${numPart} ${typePart}`, coursePart].filter(x => x.trim()).join(', ');

                                // Контейнер заголовков
                                const headerContainer = document.createElement('div');
                                headerContainer.className = 'subject-header-flex session-term-header-group';
                                headerContainer.style.cssText = 'display: flex !important; justify-content: space-between !important; align-items: center !important; margin-top: 4rem; margin-bottom: 1.5rem; padding: 0 !important; margin-left: 0 !important; width: 100%; box-sizing: border-box;';

                                // Левая капсула (Инфо)
                                const leftCapsule = document.createElement('div');
                                leftCapsule.className = 'subject-score-capsule';
                                leftCapsule.style.cssText = 'margin-left: 0 !important; margin-right: 0; background: var(--color-highlight); color: var(--color-text-primary); border: 1px solid var(--color-table-border); box-shadow: none; font-size: 1.15rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 16px;';
                                leftCapsule.textContent = combinedInfo;
                                headerContainer.appendChild(leftCapsule);

                                // Правая капсула (GPA)
                                if (hasAny) {
                                    const gpaCapsule = document.createElement('div');
                                    gpaCapsule.className = 'subject-score-capsule';
                                    gpaCapsule.style.cssText = 'margin: 0; display: inline-flex; align-items: center; justify-content: center; min-width: 80px; height: 32px; font-weight: 800; font-size: 1.4rem; color: #fff;';
                                    gpaCapsule.textContent = hasFail ? 'ДОЛГИ' : `${avg} / 5`;
                                    
                                    if (hasFail) { gpaCapsule.style.background = 'var(--color-red)'; }
                                    else {
                                        const p = (avg / 5) * 100;
                                        if (p < 61) { gpaCapsule.style.background = 'var(--color-yellow)'; gpaCapsule.style.color = '#000'; }
                                        else if (p < 81) { gpaCapsule.style.background = '#8BC34A'; }
                                        else { gpaCapsule.style.background = 'var(--color-green)'; }
                                    }
                                    headerContainer.appendChild(gpaCapsule);
                                }
                                
                                table.parentNode.insertBefore(headerContainer, table);

                                const wrapper = document.createElement('div');
                                wrapper.className = 'wide-table-wrapper session-term-table-group';
                                wrapper.setAttribute('data-term-avg', avg);
                                wrapper.setAttribute('data-term-name', block.headerRaw);

                                const newTable = document.createElement('table');
                                newTable.className = 'common session-table-v6';
                                if (headerRow) {
                                    const thead = document.createElement('thead');
                                    const clonedHeader = headerRow.cloneNode(true);
                                    if (generalConfig.compactGrades) {
                                        const cfg = generalConfig.compactGradesConfig;
                                        clonedHeader.querySelectorAll('th').forEach((th, idx) => {
                                            if (idx === 2 && !cfg.showDate) th.style.display = 'none';
                                            if (idx === 3 && !cfg.showTeacher) th.style.display = 'none';
                                            if (idx > 3) th.style.display = 'none';
                                        });
                                    }
                                    thead.appendChild(clonedHeader);
                                    newTable.appendChild(thead);
                                }
                                const tbody = document.createElement('tbody');
                                block.rows.forEach(r => {
                                    if (generalConfig.compactGrades) {
                                        const cfg = generalConfig.compactGradesConfig;
                                        r.querySelectorAll('td').forEach((td, idx) => {
                                            if (idx === 2 && !cfg.showDate) td.style.display = 'none';
                                            if (idx === 3 && !cfg.showTeacher) td.style.display = 'none';
                                            if (idx > 3) td.style.display = 'none';
                                            if (idx === 1) { td.style.width = '1%'; td.style.whiteSpace = 'nowrap'; td.style.textAlign = 'center'; }
                                        });
                                    }
                                    tbody.appendChild(r);
                                });
                                newTable.appendChild(tbody);
                                wrapper.appendChild(newTable);
                                table.parentNode.insertBefore(wrapper, table);
                            });
                            table.remove();
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
                            document.body.classList.remove('modal-open-body');
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
                                                <div style="flex: 1; min-width: 80px; background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: var(--radius-small); padding: 1.4rem 1.6rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; text-align: left; box-sizing: border-box;">
                                                    <span style="font-size: 2.2rem; font-weight: 800; color: var(--color-green); line-height: 1; width: 100%;">${count5}</span>
                                                    <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-green); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; width: 100%;">Отлично</span>
                                                </div>`;
                                        }
                                        if (count4 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1; min-width: 80px; background: rgba(0, 122, 255, 0.1); border: 1px solid rgba(0, 122, 255, 0.3); border-radius: var(--radius-small); padding: 1.4rem 1.6rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; text-align: left; box-sizing: border-box;">
                                                    <span style="font-size: 2.2rem; font-weight: 800; color: var(--color-blue); line-height: 1; width: 100%;">${count4}</span>
                                                    <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-blue); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; width: 100%;">Хорошо</span>
                                                </div>`;
                                        }
                                        if (count3 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1; min-width: 80px; background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: var(--radius-small); padding: 1.4rem 1.6rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; text-align: left; box-sizing: border-box;">
                                                    <span style="font-size: 2.2rem; font-weight: 800; color: var(--color-warning); line-height: 1; width: 100%;">${count3}</span>
                                                    <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-warning); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; width: 100%;">Удовл.</span>
                                                </div>`;
                                        }
                                        if (count2 > 0) {
                                            statsHtml += `
                                                <div style="flex: 1; min-width: 80px; background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: var(--radius-small); padding: 1.4rem 1.6rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; text-align: left; box-sizing: border-box;">
                                                    <span style="font-size: 2.2rem; font-weight: 800; color: var(--color-red); line-height: 1; width: 100%;">${count2}</span>
                                                    <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-red); margin-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; width: 100%;">Долги</span>
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
                                    document.body.classList.add('modal-open-body');
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
                                    const capsules = header.querySelectorAll('.subject-score-capsule');
                                    // Берем последнюю капсулу (чтобы не перезаписывать левую капсулу с курсом/триместром)
                                    const capsule = capsules[capsules.length - 1]; 

                                    if (capsule && capsules.length > 0) {
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

                        // --- ОФОРМЛЕНИЕ ПАМЯТКИ ТОЛЬКО ДЛЯ СЕССИЙ ---
                        const sessionFooterP = span9.querySelector('p');
                        if (sessionFooterP && sessionFooterP.textContent.includes('Показанные здесь оценки являются официальными')) {
                            const infoBox = document.createElement('div');
                            infoBox.style.cssText = 'background: var(--color-card); border-radius: var(--radius-large) !important; box-shadow: var(--shadow-main); padding: 2.6rem !important; margin-top: 4rem; text-align: left !important; color: var(--color-text-primary); border: 1px solid var(--color-table-border); line-height: 1.6;';

                            let rawHTML = sessionFooterP.innerHTML.replace(/&nbsp;/g, '').trim();
                            let lines = rawHTML.split(/<br\s*\/?>/i).map(l => l.trim()).filter(l => l.length > 0);
                            let processedContent = '';

                            lines.forEach(line => {
                                if (line.match(/^\d\./)) {
                                    processedContent += `<div style="margin-bottom: 12px; padding-left: 28px; position: relative; font-size: 1.35rem;"><span style="position: absolute; left: 0; font-weight: 800; color: var(--color-accent);">${line.charAt(0)}</span>${line.substring(2)}</div>`;
                                } else if (line.toLowerCase().includes('порядок уточнения')) {
                                    processedContent += `<div style="font-weight: 800; margin: 20px 0 15px; font-size: 1.4rem; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${line}</div>`;
                                } else {
                                    processedContent += `<p style="margin-bottom: 16px; opacity: 0.9; font-size: 1.35rem;">${line}</p>`;
                                }
                            });

                            infoBox.innerHTML = `<div style="display:flex; align-items:center; gap:12px; margin-bottom:22px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;"><span class="material-icons" style="color:var(--color-accent); font-size: 26px;">gavel</span>Официальное уведомление</div><div style="text-align: left !important;">${processedContent}</div>`;
                            sessionFooterP.replaceWith(infoBox);
                        }

                    }

                    // ОБРАБОТКА "ОЦЕНКИ В ТРИМЕСТРЕ"
                    if (pageMode === 'current' || (!pageMode && !span9.querySelector('.session-table-v6'))) {

                        const submenus = span9.querySelectorAll('.submenu');
                        const lastSubmenu = submenus[submenus.length - 1];

                        // --- ДОБАВЛЕНИЕ ПОИСКА И КНОПКИ "РЕЙТИНГ" (КАПСУЛА) ---
                        const searchContainer = document.createElement('div');
                        searchContainer.className = 'timetable-toolbar term-search-wrapper';

                        searchContainer.style.cssText = 'margin-top: -0.8rem !important; margin-bottom: 2.4rem !important;';

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
                                if (r === totalRow) return;

                                const cells = r.querySelectorAll('th, td');
                                
                                // === ЛОГИКА: КОМПАКТНЫЕ ОЦЕНКИ ===
                                if (generalConfig.compactGrades) {
                                    const cfg = generalConfig.compactGradesConfig;
                                    
                                    // 1. Вторая строка шапки ("текущий", "максимальный")
                                    if (cells.length === 2 && cells[0].textContent.toLowerCase().includes('текущий')) {
                                        if (!cfg.showRating) r.style.display = 'none'; 
                                    } 
                                    // 2. Главная строка шапки
                                    else if (r.querySelector('th') && cells.length >= 7) {
                                        cells.forEach((cell) => {
                                            const text = cell.textContent.toLowerCase();
                                            
                                            if (text.includes('вид работы') && !cfg.showWorkType) cell.style.display = 'none';
                                            if (text.includes('вид контроля') && !cfg.showControlType) cell.style.display = 'none';
                                            if (text.includes('проходной') && !cfg.showPassScore) cell.style.display = 'none';
                                            if (text.includes('в рейтинг') && !cfg.showRating) cell.style.display = 'none';
                                            if (text.includes('дата') && !cfg.showDate) cell.style.display = 'none';
                                            if (text.includes('преподаватель') && !cfg.showTeacher) cell.style.display = 'none';

                                            if (!cfg.showRating) {
                                                cell.removeAttribute('rowspan');
                                                cell.removeAttribute('colspan');
                                            }
                                        });
                                    } 
                                    // 3. Обычные строки с оценками
                                    else if (cells.length >= 7) {
                                        cells.forEach((cell, idx) => {
                                            // Индексы колонок ЕТИС: 
                                            // 0:Тема, 1:Работа, 2:Контроль, 3:Оценка, 4:Проходной, 5:БаллТек, 6:БаллМакс, 7:Дата, 8:Преподаватель
                                            if (idx === 1 && !cfg.showWorkType) cell.style.display = 'none';
                                            if (idx === 2 && !cfg.showControlType) cell.style.display = 'none';
                                            if (idx === 4 && !cfg.showPassScore) cell.style.display = 'none';
                                            if ((idx === 5 || idx === 6) && !cfg.showRating) cell.style.display = 'none';
                                            if (idx === 7 && !cfg.showDate) cell.style.display = 'none';
                                            if (idx === 8 && !cfg.showTeacher) cell.style.display = 'none';
                                            
                                            // Заужаем колонку оценки
                                            if (idx === 3) {
                                                cell.style.width = '1%';
                                                cell.style.whiteSpace = 'nowrap';
                                            }
                                        });
                                    }
                                }
                                // ========================================

                                if (r.querySelector('th')) return;

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

                                // 3. Расчет баллов (Оценка / Макс. рейтинг) и отрисовка капсул
                                if (cells.length >= 7) {
                                    const gradeStr = cells[3].textContent.trim(); // Колонка "Оценка"
                                    const maxStr = cells[6].textContent.trim();   // Колонка "Макс. балл в рейтинг"
                                    
                                    const maxVal = parseFloat(maxStr.replace(',', '.')) || 0;

                                    if (gradeStr !== '') {
                                        hasAnyGrades = true;
                                        
                                        if (maxVal > 0) {
                                            calculatedMax += maxVal;
                                            if (gradeStr !== 'н') {
                                                calculatedCurrent += parseFloat(gradeStr.replace(',', '.')) || 0;
                                            }
                                        }

                                        if (gradeStr !== 'н') {
                                            // Оформляем колонку "Оценка" в цветную капсулу
                                            if (!cells[3].querySelector('.kt-score-capsule')) {
                                                let bg, color, mark = '';
                                                const gradeVal = parseFloat(gradeStr.replace(',', '.')) || 0;
                                                
                                                if (maxVal > 0) {
                                                    const p = (gradeVal / maxVal) * 100;
                                                    if (p < 41) { bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)'; mark = '2'; }
                                                    else if (p < 61) { bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)'; mark = '3'; }
                                                    else if (p < 81) { bg = 'rgba(139, 195, 74, 0.15)'; color = '#8BC34A'; mark = '4'; }
                                                    else { bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)'; mark = '5'; }
                                                } else {
                                                    // Если макс. балл 0, делаем капсулу серой
                                                    bg = 'rgba(142, 142, 147, 0.15)'; color = 'var(--color-text-secondary)';
                                                }

                                                // Генерируем всплывающую подсказку (если есть макс. балл)
                                                let tooltipHtml = '';
                                                if (maxVal > 0) {
                                                    tooltipHtml = `<div class="score-tooltip grade-cell-tooltip"><span style="color: ${color}; font-size: 1.4rem;">${mark}</span><span style="color: var(--color-text-secondary); margin: 0 6px;">•</span>${gradeVal} из ${maxVal}</div>`;
                                                }

                                                // Оборачиваем содержимое в капсулу и добавляем тултип внутрь
                                                const originalContent = cells[3].innerHTML;
                                                cells[3].innerHTML = `<span class="kt-score-capsule" style="background: ${bg}; color: ${color}; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; display: inline-flex; align-items: center; justify-content: center; min-width: 24px;">${originalContent}${tooltipHtml}</span>`;
                                                
                                                // Убираем подчеркивание у внутреннего спана ЕТИСа, чтобы не двоилось
                                                const innerSpan = cells[3].querySelector('span span');
                                                if (innerSpan) innerSpan.style.borderBottom = 'none';
                                            }
                                        } else {
                                            // Красная капсула неявки
                                            if (!cells[3].querySelector('.kt-score-capsule')) {
                                                cells[3].innerHTML = `<span class="kt-score-capsule" style="background: rgba(255, 59, 48, 0.15); color: var(--color-red); padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; display: inline-block; text-align: center; min-width: 24px;">н</span>`;
                                            }
                                        }
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

                            // --- ПРИМЕНЕНИЕ ЛОГИКИ АБСОЛЮТНЫХ БАЛЛОВ ---
                            const finalMax = generalConfig.absoluteScores ? 100 : calculatedMax;

                            const capsule = document.createElement('div');
                            capsule.className = 'subject-score-capsule';
                            capsule.textContent = `${hasAnyGrades ? calculatedCurrent : 0} / ${hasAnyGrades ? finalMax : 0}`;

                            if (!hasAnyGrades || finalMax === 0) {
                                capsule.style.background = 'var(--color-highlight)';
                                capsule.style.color = 'var(--color-text-secondary)';
                            } else {
                                const p = (calculatedCurrent / finalMax) * 100;
                                if (p < 41) capsule.style.background = 'var(--color-red)';
                                else if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                                else if (p < 81) capsule.style.background = '#8BC34A';
                                else capsule.style.background = 'var(--color-green)';
                                if (p < 41 || p >= 61) capsule.style.color = '#fff';
                            }
                            
                            // --- КАЛЬКУЛЯТОР БАЛЛОВ (Прогноз) ---
                            let tooltipText = '';
                            if (finalMax > 0 && hasAnyGrades) {
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
                                            const gradeStr = cells[3].textContent.trim();
                                            const maxStr = cells[6].textContent.trim();
                                            
                                            if (gradeStr !== '') {
                                                hasAnyGrades = true;
                                                const maxVal = parseFloat(maxStr.replace(',', '.')) || 0;
                                                
                                                if (maxVal > 0) {
                                                    calculatedMax += maxVal;
                                                    
                                                    if (gradeStr !== 'н') {
                                                        calculatedCurrent += parseFloat(gradeStr.replace(',', '.')) || 0;
                                                    }
                                                }
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
                                        wrapper.setAttribute('data-score-current', calculatedCurrent); 
                                        wrapper.setAttribute('data-score-max', calculatedMax);
                                        
                                        // Применяем логику "Из 100"
                                        const finalMaxFiltered = generalConfig.absoluteScores ? 100 : calculatedMax;

                                        capsule.textContent = `${hasAnyGrades ? calculatedCurrent : 0} / ${hasAnyGrades ? finalMaxFiltered : 0}`;

                                        if (!hasAnyGrades || finalMaxFiltered === 0) {
                                            capsule.style.background = 'var(--color-highlight)';
                                            capsule.style.color = 'var(--color-text-secondary)';
                                        } else {
                                            const p = (calculatedCurrent / finalMaxFiltered) * 100;
                                            if (p < 41) capsule.style.background = 'var(--color-red)';
                                            else if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                                            else if (p < 81) capsule.style.background = '#8BC34A';
                                            else capsule.style.background = 'var(--color-green)';

                                            if (p < 41 || p >= 61) capsule.style.color = '#fff';
                                        }

                                        // Динамический прогноз
                                        let tooltipText = '';
                                        if (finalMaxFiltered > 0 && hasAnyGrades) {
                                            if (calculatedCurrent < 41) tooltipText = `До тройки: ${41 - calculatedCurrent} б.`;
                                            else if (calculatedCurrent < 61) tooltipText = `До четверки: ${61 - calculatedCurrent} б.`;
                                            else if (calculatedCurrent < 81) tooltipText = `До пятерки: ${81 - calculatedCurrent} б.`;
                                            else tooltipText = `Отлично! 😎`;

                                            const oldTooltip = capsule.querySelector('.score-tooltip');
                                            if (oldTooltip) oldTooltip.remove();

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
                                document.body.classList.remove('modal-open-body');
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
                            document.body.classList.add('modal-open-body');
                        });
                        
                        // --- ОФОРМЛЕНИЕ ПАМЯТКИ "ПОРЯДОК УТОЧНЕНИЯ ОЦЕНОК" ---
                        const currentFooterP = span9.querySelector('p');
                        if (currentFooterP && currentFooterP.textContent.includes('Показанные здесь оценки являются официальными')) {
                            const infoBox = document.createElement('div');
                            infoBox.style.cssText = `
                                background: var(--color-card);
                                border-radius: var(--radius-large) !important;
                                box-shadow: var(--shadow-main);
                                padding: 2.6rem !important;
                                margin-top: 4rem;
                                text-align: left !important;
                                color: var(--color-text-primary);
                                border: 1px solid var(--color-table-border);
                                line-height: 1.6;
                            `;

                            // Очищаем текст от мусора и разбиваем на строки
                            let rawHTML = currentFooterP.innerHTML.replace(/&nbsp;/g, '').trim();
                            let lines = rawHTML.split(/<br\s*\/?>/i).map(l => l.trim()).filter(l => l.length > 0);

                            let processedContent = '';
                            lines.forEach(line => {
                                // Если строка начинается с цифры (пункты порядка)
                                if (line.match(/^\d\./)) {
                                    processedContent += `
                                        <div style="margin-bottom: 12px; padding-left: 28px; position: relative; font-size: 1.35rem;">
                                            <span style="position: absolute; left: 0; font-weight: 800; color: var(--color-accent);">${line.charAt(0)}</span>
                                            ${line.substring(2)}
                                        </div>`;
                                } 
                                // Заголовок "Порядок уточнения:"
                                else if (line.toLowerCase().includes('порядок уточнения')) {
                                    processedContent += `<div style="font-weight: 800; margin: 20px 0 15px; font-size: 1.4rem; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${line}</div>`;
                                }
                                // Обычные абзацы
                                else {
                                    processedContent += `<p style="margin-bottom: 16px; opacity: 0.9; font-size: 1.35rem;">${line}</p>`;
                                }
                            });

                            infoBox.innerHTML = `
                                <div style="display:flex; align-items:center; gap:12px; margin-bottom:22px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                    <span class="material-icons" style="color:var(--color-accent); font-size: 26px;">gavel</span>
                                    Официальное уведомление
                                </div>
                                <div style="text-align: left !important;">
                                    ${processedContent}
                                </div>
                            `;

                            currentFooterP.replaceWith(infoBox);
                        }

                    }

                    // ОБРАБОТКА "ОЦЕНКИ В ДИПЛОМ"
                    const activeSubmenu = span9.querySelector('.submenu b');
                    const isDiplom = pageMode === 'diplom' || (activeSubmenu && activeSubmenu.textContent.toLowerCase().includes('диплом'));

                    if (isDiplom) {
                        const table = span9.querySelector('table.common');
                        if (table) {
                            // Скрываем старый текст среднего балла
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
                                    const gradeCell = cells[1];
                                    const text = gradeCell.textContent.toLowerCase().trim();

                                    // Парсим оценки для среднего балла
                                    if (text.includes('отлично')) { sum += 5; count++; }
                                    else if (text.includes('хорошо')) { sum += 4; count++; }
                                    else if (text.includes('удовлетворительно') || text.includes('удовл.')) { sum += 3; count++; }
                                    else if (text.includes('неудовлетворительно') || text.includes('незачет') || text.includes('незачёт')) { hasFail = true; }

                                    // Оформляем капсулу оценки
                                    if (text && !text.includes('нет итоговой оценки')) {
                                        let bg = 'rgba(142, 142, 147, 0.15)', color = 'var(--color-text-secondary)';
                                        if (text.includes('отлично') || (text.includes('зачет') && !text.includes('незачет'))) {
                                            bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)';
                                        } else if (text.includes('хорошо')) {
                                            bg = 'rgba(0, 122, 255, 0.15)'; color = 'var(--color-blue)';
                                        } else if (text.includes('удовлетворительно') || text.includes('удовл.')) {
                                            bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)';
                                        } else if (text.includes('неуд') || text.includes('незач') || text === '2') {
                                            bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)';
                                        }
                                        
                                        gradeCell.innerHTML = `<span class="kt-score-capsule" style="background:${bg}; color:${color}; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.2rem; display: inline-block; min-width: 24px; text-align: center; white-space: nowrap;">${gradeCell.textContent.trim()}</span>`;
                                    } else if (text.includes('нет итоговой оценки')) {
                                        gradeCell.innerHTML = `<span style="color: var(--color-text-secondary); font-size: 1.2rem;">Нет оценки</span>`;
                                    }
                                    
                                    // Убираем старый шрифт из первой колонки (элективы)
                                    const nameCell = cells[0];
                                    if (nameCell && nameCell.querySelector('i')) {
                                        nameCell.innerHTML = nameCell.innerHTML.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
                                        const notes = nameCell.querySelectorAll('i');
                                        notes.forEach(note => {
                                            note.style.color = 'var(--color-text-secondary)';
                                            note.style.fontSize = '1.1rem';
                                            note.style.fontStyle = 'normal';
                                            note.style.textTransform = 'uppercase';
                                            note.style.letterSpacing = '0.5px';
                                            note.style.display = 'block';
                                            note.style.marginBottom = '0.4rem';
                                        });
                                    }
                                }
                            });

                            const headerContainer = document.createElement('div');
                            headerContainer.className = 'subject-header-flex';
                            const title = document.createElement('h3');
                            title.textContent = 'Выписка оценок к диплому';
                            headerContainer.appendChild(title);

                            const capsule = document.createElement('div');
                            capsule.className = 'subject-score-capsule';
                            if (hasFail) { 
                                capsule.textContent = 'ЕСТЬ ДОЛГИ'; 
                                capsule.style.background = 'var(--color-red)'; 
                                capsule.style.color = '#fff'; 
                            } else if (count > 0) {
                                const avg = Math.round((sum / count) * 100) / 100;
                                capsule.textContent = `${avg} / 5`;
                                const p = (avg / 5) * 100;
                                if (p < 61) { capsule.style.background = 'var(--color-yellow)'; capsule.style.color = '#000'; }
                                else if (p < 81) { capsule.style.background = '#8BC34A'; capsule.style.color = '#fff'; }
                                else { capsule.style.background = 'var(--color-green)'; capsule.style.color = '#fff'; }
                                if (avg >= 4.75) capsule.style.boxShadow = '0 0 0 2px #FFD700'; // Красивый бордер для красного диплома
                            } else {
                                capsule.textContent = 'Нет оценок'; 
                                capsule.style.background = 'var(--color-highlight)'; 
                                capsule.style.color = 'var(--color-text-secondary)';
                            }
                            headerContainer.appendChild(capsule);
                            span9.insertBefore(headerContainer, wrapper);

                            // Оформление подвала с текстом
                            const footerP = span9.querySelector('p');
                            if (footerP && footerP.textContent.includes('Итоговая оценка по дисциплине')) {
                                const infoBox = document.createElement('div');
                                infoBox.style.cssText = `
                                    background: var(--color-card);
                                    border-radius: var(--radius-large) !important;
                                    box-shadow: var(--shadow-main);
                                    padding: 2.4rem !important;
                                    margin-top: 3rem;
                                    text-align: left !important;
                                    color: var(--color-text-primary);
                                    border: 1px solid var(--color-table-border);
                                `;

                                let rawHTML = footerP.innerHTML.replace(/&nbsp;/g, '').trim();
                                let cleanHTML = rawHTML.split(/<br\s*\/?>/i)
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0)
                                    .map(line => {
                                        line = line.replace(/<sup>\*<\/sup>/i, '');
                                        return `<p style="margin-bottom: 12px; line-height: 1.6; opacity: 0.9; font-size: 1.35rem;">${line}</p>`;
                                    }).join('');

                                infoBox.innerHTML = `
                                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                        <span class="material-icons" style="color:var(--color-accent); font-size: 24px;">info</span>
                                        Правила расчета
                                    </div>
                                    <div style="text-align: left !important;">
                                        ${cleanHTML}
                                    </div>
                                `;

                                footerP.replaceWith(infoBox);
                            }
                        }
                    }

                    // ОБРАБОТКА "ИТОГОВЫЙ РЕЙТИНГ"
                    const allTables = span9.querySelectorAll('table.common');
                    let ratingTable = null;

                    // Ищем таблицу рейтинга по заголовку
                    allTables.forEach(t => {
                        if (t.textContent.includes('Совокупность студентов')) ratingTable = t;
                    });

                    if (ratingTable) {
                        // Оборачиваем для скролла
                        if (!ratingTable.parentNode.classList.contains('wide-table-wrapper')) {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'wide-table-wrapper';
                            ratingTable.parentNode.insertBefore(wrapper, ratingTable);
                            wrapper.appendChild(ratingTable);
                        }
                        
                        // Принудительно растягиваем таблицу и убираем артефакты display: block
                        ratingTable.style.setProperty('display', 'table', 'important');
                        ratingTable.style.setProperty('width', '100%', 'important');
                        ratingTable.style.setProperty('min-width', '100%', 'important');

                        // --- ОФОРМЛЕНИЕ ЧИСЕЛ В КАПСУЛЫ ---
                        ratingTable.querySelectorAll('tr').forEach(row => {
                            const cells = row.querySelectorAll('td');
                            if (cells.length >= 2) {
                                const ratingCell = cells[cells.length - 1]; // Последняя ячейка
                                const text = ratingCell.textContent.trim();
                                const match = text.match(/(\d+)\s+из\s+(\d+)/);

                                if (match) {
                                    const current = parseInt(match[1], 10);
                                    const total = parseInt(match[2], 10);
                                    
                                    let bg = 'rgba(142, 142, 147, 0.15)'; // Дефолтный серый
                                    let color = 'var(--color-text-secondary)';
                                    
                                    if (current > 0) {
                                        // Чем ближе к 1 месту, тем "зеленее" процент
                                        // 1 место из 22 => 100%. 22 место из 22 => 0%.
                                        const p = total > 1 ? ((total - current) / (total - 1)) * 100 : 100;
                                        
                                        if (p < 30) { bg = 'rgba(255, 59, 48, 0.15)'; color = 'var(--color-red)'; }
                                        else if (p < 60) { bg = 'rgba(255, 149, 0, 0.15)'; color = 'var(--color-warning)'; }
                                        else if (p < 85) { bg = 'rgba(139, 195, 74, 0.15)'; color = '#8BC34A'; }
                                        else { bg = 'rgba(52, 199, 89, 0.15)'; color = 'var(--color-green)'; }
                                    }

                                    // Оборачиваем текст. pointer-events: none нужен, чтобы ховер шел сквозь капсулу на саму ячейку
                                    ratingCell.innerHTML = `<span style="background: ${bg}; color: ${color}; padding: 0.5rem 1.2rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; pointer-events: none;">${text}</span>`;
                                    ratingCell.style.textAlign = 'right';
                                    ratingCell.style.cursor = 'help';
                                }
                            }
                        });

                        // --- ОФОРМЛЕНИЕ ТЕКСТА СНИЗУ ---
                        const footerP = span9.querySelector('p');
                        if (footerP && footerP.textContent.includes('Показанные здесь оценки')) {
                            const infoBox = document.createElement('div');
                            
                            infoBox.style.cssText = `
                                background: var(--color-card);
                                border-radius: var(--radius-large) !important;
                                box-shadow: var(--shadow-main);
                                padding: 2.4rem !important;
                                margin-top: 3rem;
                                text-align: left !important;
                                color: var(--color-text-primary);
                                border: 1px solid var(--color-table-border);
                            `;
                            
                            // Очистка текста от мусора ЕТИСа
                            let rawHTML = footerP.innerHTML
                                .replace(/&nbsp;/g, '')
                                .trim();
                            
                            // Превращаем старые переносы в аккуратные абзацы
                            let cleanHTML = rawHTML.split(/<br\s*\/?>/i)
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .map(line => `<p style="margin-bottom: 12px; line-height: 1.6; opacity: 0.9; font-size: 1.35rem;">${line}</p>`)
                                .join('');
                            
                            infoBox.innerHTML = `
                                <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; color:var(--color-text-primary); font-weight:800; font-size:1.6rem;">
                                    <span class="material-icons" style="color:var(--color-accent); font-size: 24px;">info</span>
                                    Порядок уточнения оценок
                                </div>
                                <div style="text-align: left !important;">
                                    ${cleanHTML}
                                </div>
                            `;
                            
                            footerP.replaceWith(infoBox);
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
                        if (row.querySelector('th') || (rowText.includes('логин') && rowText.includes('пароль'))) {
                            row.remove();
                            return;
                        }

                        const cells = row.querySelectorAll('td');
                        if (cells.length === 3) {
                            addCopyLogic(cells[1]); 
                            addCopyLogic(cells[2]); 
                        } else if (cells.length === 2) {
                            addCopyLogic(cells[1]);
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

                        const text = document.createElement('span');
                        text.className = 'advice-label';
                        text.textContent = link.textContent.trim();

                        card.appendChild(icon);
                        card.appendChild(text);
                        container.appendChild(card);
                    });

                    adviceList.parentNode.replaceChild(container, adviceList);

                    const h2 = span9.querySelector('h2');
                    if (h2) h2.style.marginBottom = '0';

                    break;

                case 'stu.ses':
                    const allElements = Array.from(span9.childNodes);

                    const majorHeader = span9.querySelector('h2') || span9.querySelector('h3');
                    const majorName = majorHeader ? majorHeader.textContent.trim() : "";

                    const pdfElement = Array.from(span9.querySelectorAll('p, div, font')).find(el => el.textContent.includes('Текст стандарта'));
                    const pdfHTML = pdfElement ? pdfElement.innerHTML : "";

                    const competencyBlocks = [];
                    const headers = Array.from(span9.querySelectorAll('h3'));

                    headers.forEach(h => {
                        const title = h.textContent.trim();
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

                            let next = h.nextElementSibling;
                            while (next && next.tagName !== 'H3') {
                                const clone = next.cloneNode(true);
                                if (clone.style) clone.removeAttribute('style');
                                content.appendChild(clone);
                                next = next.nextElementSibling;
                            }
                            card.appendChild(content);
                            competencyBlocks.push(card);
                        }
                    });

                    span9.innerHTML = '';

                    const mainTitle = document.createElement('h2');
                    mainTitle.textContent = 'Компетенции выпускника';
                    mainTitle.style.marginBottom = '2.4rem';
                    span9.appendChild(mainTitle);

                    competencyBlocks.forEach(block => span9.appendChild(block));

                    if (majorName || pdfHTML) {
                        const footer = document.createElement('div');
                        footer.className = 'electr-description';
                        footer.style.marginTop = '4rem';
                        footer.style.textAlign = 'center';

                        if (majorName) {
                            const nameDiv = document.createElement('div');
                            nameDiv.style.fontWeight = 'bold';
                            nameDiv.style.marginBottom = '1rem';
                            nameDiv.style.color = 'var(--color-text-primary)';
                            nameDiv.textContent = majorName;
                            footer.appendChild(nameDiv);
                        }

                        if (pdfHTML) {
                            const linkDiv = document.createElement('div');
                            linkDiv.innerHTML = pdfHTML;
                            linkDiv.querySelectorAll('*').forEach(el => el.removeAttribute('style'));
                            footer.appendChild(linkDiv);
                        }

                        span9.appendChild(footer);
                    }
                    break;

                case 'stu.library': {
                    const pageMode = new URLSearchParams(window.location.search).get('p_mode');
                    const submenu = span9.querySelector('.submenu');

                    const libIntro = Array.from(span9.querySelectorAll('p')).find(p => p.textContent.includes('Для чтения полных текстов'));
                    if (libIntro) {
                        libIntro.className = 'electr-description';
                        libIntro.style.marginTop = '30px';
                        span9.appendChild(libIntro);
                    }

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
                    span9.querySelectorAll('script, style').forEach(el => el.remove());

                    if (!span9.querySelector('h2')) {
                        const pageTitle = document.createElement('h2');
                        pageTitle.textContent = 'Опросы и анкетирование';
                        pageTitle.style.marginBottom = '2.4rem';
                        span9.prepend(pageTitle);
                    }

                    let currentNode = span9.firstChild;
                    while (currentNode) {
                        if (currentNode.nodeType === Node.TEXT_NODE) {
                            let text = currentNode.textContent.trim();
                            if (text.length > 25 && !text.includes('FUNCTION')) {
                                const title = document.createElement('div');
                                title.className = 'survey-intro-text';
                                title.innerHTML = text.replace(/\n/g, '<br>');
                                span9.insertBefore(title, currentNode);
                                currentNode.textContent = '';
                            }
                        }
                        currentNode = currentNode.nextSibling;
                    }

                    const surveyBlocks = span9.querySelectorAll('.nav.answ, .nav.msg');

                    surveyBlocks.forEach(survey => {
                        survey.className = 'survey-card';

                        const headerLi = survey.querySelector('li:first-child');
                        const contentLi = survey.querySelector('li:nth-child(2)');

                        if (headerLi && contentLi) {
                            const updateArrow = () => {
                                headerLi.classList.toggle('is-open', !contentLi.classList.contains('hide_elem'));
                            };

                            updateArrow();
                            headerLi.addEventListener('click', () => {
                                setTimeout(updateArrow, 50);
                            });

                            const headerLink = headerLi.querySelector('a');
                            if (headerLink) headerLi.innerHTML = headerLink.innerHTML;

                            const headerFont = headerLi.querySelector('font');
                            if (headerFont) headerLi.innerHTML = headerFont.innerHTML;

                            headerLi.style.fontSize = '1.4rem';
                            headerLi.style.lineHeight = '1.5';
                            headerLi.style.fontWeight = '600';
                            headerLi.style.color = 'var(--color-text-primary)';
                        }

                        if (contentLi) {
                            const contentLink = contentLi.querySelector('a');
                            if (contentLink) {
                                contentLi.innerHTML = contentLink.innerHTML;
                            }

                            const rawHTML = contentLi.innerHTML;

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
                                return;
                            }

                            const cleanContent = document.createElement('div');

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

                            const temp = document.createElement('div');
                            temp.innerHTML = rawHTML;

                            const dateSpan = temp.querySelector('span[style*="color:#808080"]');
                            if (dateSpan) dateSpan.remove();

                            const boldQuestions = temp.querySelectorAll('b');
                            let items = [];

                            if (boldQuestions.length > 0) {
                                boldQuestions.forEach(b => {
                                    let q = b.textContent.replace(':', '').trim();
                                    let a = "";
                                    let next = b.nextSibling;

                                    while(next && next.nodeName !== 'B') {
                                        if (next.nodeName === 'SPAN' || next.nodeName === 'I' || (next.nodeType === Node.TEXT_NODE && next.textContent.trim().length > 2)) {
                                            a += next.textContent.trim() + " ";
                                        }
                                        next = next.nextSibling;
                                    }
                                    if (q) items.push({q, a: a.trim()});
                                });
                            }

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
                        const card = document.createElement('div');
                        card.className = 'review-card';

                        const newList = document.createElement('div');
                        newList.className = 'review-list';

                        listUl.querySelectorAll('li').forEach(li => {
                            const link = li.querySelector('a');
                            if (!link) return;

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

                    const emptySubmenu = reviewContainer.querySelector('.submenu');
                    if (emptySubmenu && !emptySubmenu.textContent.trim()) {
                        emptySubmenu.remove();
                    }

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
                        aboutContainer.className = 'about-card';

                        aboutContainer.querySelectorAll('*').forEach(el => {
                            el.removeAttribute('style');
                        });

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
                    const h2 = span9.querySelector('h2');
                    const contractLinks = Array.from(span9.querySelectorAll('a')); 

                    span9.innerHTML = '';
                    if (h2) span9.appendChild(h2);

                    const mainContainer = document.createElement('div');
                    mainContainer.className = 'contracts-container';

                    let instructionCard = null;

                    contractLinks.forEach(link => {
                        const text = link.textContent.trim();
                        const isInstruction = text.toLowerCase().includes('инструкция');

                        if (isInstruction) {
                            const card = document.createElement('a');
                            card.href = link.href;
                            card.className = 'contract-card instruction-footer';
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

                    span9.appendChild(mainContainer);
                    if (instructionCard) {
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

                        const match = fullText.match(/(№.*?от\s+\d{2}\.\d{2}\.\d{4})(?:[\.\s]*)(.*)/);

                        const meta = match ? match[1] : '';
                        const title = match ? match[2] : fullText;

                        let icon = 'assignment';
                        let type = 'default';
                        const lowerTitle = fullText.toLowerCase();

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
                    const sections = Array.from(span9.querySelectorAll('h3'));
                    const pageTitle = span9.querySelector('h2');
                    const data = [];

                    sections.forEach(h3 => {
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

                    span9.innerHTML = '';
                    if (pageTitle) span9.appendChild(pageTitle);

                    data.forEach(item => {
                        span9.appendChild(item.header);

                        const grid = document.createElement('div');
                        grid.className = 'forms-grid';

                        const items = item.list.querySelectorAll('li');
                        items.forEach(li => {
                            const links = Array.from(li.querySelectorAll('a'));
                            if (links.length === 0) return;

                            const primaryLink = links[0];
                            const href = primaryLink.getAttribute('href').toLowerCase();

                            const card = document.createElement('a');
                            card.className = 'form-card';
                            card.href = primaryLink.href;
                            card.target = '_blank';

                            let icon = 'description';
                            let typeClass = 'type-word';
                            if (href.includes('.xls')) { icon = 'table_chart'; typeClass = 'type-excel'; }
                            else if (href.includes('.pdf')) { icon = 'picture_as_pdf'; typeClass = 'type-pdf'; }

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

                    span9.querySelectorAll('br').forEach(br => br.remove());
                    break;
                }

                case 'stu.teacher_stats': {
                    const table = span9.querySelector('table.common');
                    if (table) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);

                        table.removeAttribute('border');
                        table.querySelectorAll('td, th').forEach(el => {
                            el.removeAttribute('align');
                            el.removeAttribute('valign');
                            if (el.textContent.trim() === '') el.classList.add('empty');
                        });
                    }

                    const span9Content = span9.innerHTML;
                    const footerText = span9.innerHTML.split('</table>')[1];
                    if (footerText) {
                        const footerDiv = document.createElement('div');
                        footerDiv.className = 'electr-description';
                        footerDiv.style.textAlign = 'left';
                        footerDiv.style.marginTop = '2rem';
                        footerDiv.innerHTML = footerText.replace(/<br>/g, '');

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

                    span9.innerHTML = '';

                    if (groupH3) {
                        const pageTitle = document.createElement('h2');
                        pageTitle.textContent = groupH3.textContent.trim();
                        pageTitle.style.marginBottom = '2.4rem';
                        span9.appendChild(pageTitle);
                    }

                    const container = document.createElement('div');
                    container.className = 'jour-container';

                    listItems.forEach(link => {
                        const text = link.textContent.trim();
                        const href = link.href;

                        let title = text;
                        let badge = '';
                        let icon = 'fact_check';
                        let typeClass = 'jour-badge-default';

                        const match = text.match(/(.*?)\s*\((лек|практ|лаб)\)$/i);
                        if (match) {
                            title = match[1];
                            badge = match[2].toLowerCase();

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
                            infoCard.innerHTML = `<h3 style="margin:0">${h4.textContent}</h3>`;
                        }

                        h4.parentNode.replaceChild(infoCard, h4);
                    }

                    const table = span9.querySelector('table.common');
                    if (table) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);

                        table.removeAttribute('style');
                        table.querySelectorAll('th, td').forEach(cell => {
                            cell.removeAttribute('style');
                        });
                    }

                    const btnWrapper = span9.querySelector('.button_gray');
                    if (btnWrapper) {
                        btnWrapper.className = 'jour-save-wrapper';
                        const btn = btnWrapper.querySelector('button');
                        if (btn) {
                            btn.className = 'answer-btn-custom';
                            btn.innerHTML = '<span class="material-icons" style="font-size:18px; margin-right:6px">save</span>' + btn.innerHTML;
                        }
                    }
                    break;
                }

                case 'est_pkg.show_list': {
                    const feedbackMsgs = span9.querySelectorAll('ul.nav.msg');

                    if (feedbackMsgs.length > 0) {
                        const container = document.createElement('div');
                        container.className = 'msg-container';

                        feedbackMsgs.forEach(msg => {
                            const li = msg.querySelector('li');
                            if (!li) return;

                            const clone = li.cloneNode(true);

                            if (li.hasAttribute('onclick')) {
                                const clickFunc = li.getAttribute('onclick');
                                if (clickFunc.includes('read')) {
                                    try { new Function(clickFunc)(); } catch(e) {}
                                }
                            }

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

                    const ratingTable = document.getElementById('rating');

                    if (ratingTable) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        ratingTable.parentNode.insertBefore(wrapper, ratingTable);
                        wrapper.appendChild(ratingTable);
                        ratingTable.removeAttribute('width');
                        ratingTable.classList.add('common');
                        ratingTable.querySelectorAll('tr').forEach(tr => {
                            tr.style.backgroundColor = '';
                        });
                    }

                    break;
                }

                case 'stu.absence': {
                    const table = span9.querySelector('table.slimtab_nice');
                    if (table) {
                        table.className = 'common absence-table';

                        const wrapper = document.createElement('div');
                        wrapper.className = 'wide-table-wrapper';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);

                        const firstTh = table.querySelector('th');
                        if (firstTh && firstTh.textContent.trim() === '') {
                            firstTh.textContent = '№';
                        }

                        table.querySelectorAll('tr').forEach(tr => {
                            const td = tr.querySelectorAll('td')[1];
                            if (td) {
                                const fonts = td.querySelectorAll('font');
                                if (fonts.length > 0) {
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

                                    td.innerHTML = '';
                                    td.appendChild(dateContainer);
                                }
                            }
                        });
                    }

                    let total = '0', valid = '0', invalid = '0';
                    let foundStats = false;

                    Array.from(span9.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const text = node.textContent;
                            if (text.includes('Всего пропущено занятий:')) {
                                total = text.replace(/\D/g, '');
                                foundStats = true;
                                node.textContent = '';
                            }
                            if (text.includes('Из них по уважительной причине:')) {
                                valid = text.replace(/\D/g, '');
                                node.textContent = '';
                            }
                        } else if (node.tagName === 'B' && node.textContent.includes('По неуважительной причине:')) {
                            invalid = node.textContent.replace(/\D/g, '');
                            node.remove();
                        }
                    });

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

                    span9.querySelectorAll('br').forEach(br => br.remove());
                    break;
                }
                }
            // --- ГЛОБАЛЬНЫЕ УЛУЧШЕНИЯ ДЛЯ ЛЮБЫХ СТРАНИЦ ---

            const queForms = document.querySelectorAll('form.que_form, form[name="estimate"]');
            queForms.forEach(form => {
                if (!span9.querySelector('h2')) {
                    const pageTitle = document.createElement('h2');
                    
                    if (form.getAttribute('name') === 'estimate') {
                        const origH3 = span9.querySelector('h3');
                        if (origH3) {
                            pageTitle.textContent = origH3.textContent.trim();
                            origH3.remove();
                        } else {
                            pageTitle.textContent = 'Оценить занятие';
                        }
                    } else {
                        pageTitle.textContent = 'Оставить отзыв';
                    }
                    
                    pageTitle.style.marginBottom = '2.4rem';
                    span9.insertBefore(pageTitle, form.closest('.review') || form);
                }

                const sendBtn = form.querySelector('#send_btn');
                if (sendBtn && !sendBtn.querySelector('.material-icons')) {
                    sendBtn.innerHTML = '<span class="material-icons" style="font-size: 2rem; margin-right: 0.8rem;">send</span>' + sendBtn.textContent;
                }
                
                const qTable = form.querySelector('table.question_table');
                if (qTable && !qTable.parentElement.classList.contains('question-table-wrapper')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'question-table-wrapper';
                    qTable.parentNode.insertBefore(wrapper, qTable);
                    wrapper.appendChild(qTable);
                }
            });
        }

        // --- УМНЫЙ СКРОЛЛ ДЛЯ ПОДВКЛАДОК И НЕДЕЛЬ ---
        function initSmartScroll() {
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

        initSmartScroll();

        document.querySelectorAll('.submenu a:not(.answer-btn-custom), .weeks a, .timetable-toolbar a.toolbar-item').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.includes('javascript:')) {
                    const menuBtn = document.querySelector('.mobile-menu-btn');
                    if (menuBtn) menuBtn.classList.add('is-loading');
                }
            });
        });

        if (page.includes('announces') || page.includes('teacher_notes')) {
            initEventLinks();
        }
    }
})();