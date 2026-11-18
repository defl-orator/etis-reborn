/// <reference types="tampermonkey" />

declare module '*?tpl' {
    const content: string;
    export default content;
}

declare const unsafeWindow: Window & typeof globalThis & Record<string, any>;
declare function GM_registerMenuCommand(caption: string, onClick: () => void, accessKey?: string): number;
declare function GM_xmlhttpRequest(details: any): any;
declare function GM_getValue<T>(key: string, defaultValue?: T): T;
declare function GM_setValue<T>(key: string, value: T): void;
declare const GM_info: any;

declare const mammoth: any;
declare const QRCode: any;
declare const html2canvas: any;
declare const Chart: any;
declare const $: any;