import { applySri } from './security';

function loadQRCodeLib(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof QRCode !== 'undefined') return resolve(QRCode);
        if (typeof (window as any).QRCode !== 'undefined') return resolve((window as any).QRCode);
        if (typeof (unsafeWindow as any)?.QRCode !== 'undefined') return resolve((unsafeWindow as any).QRCode);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        applySri(script);
        script.onload = () => resolve(typeof QRCode !== 'undefined' ? QRCode : (window as any).QRCode);
        script.onerror = () => reject(new Error('Не удалось загрузить QRCode.js'));
        (document.head || document.documentElement).appendChild(script);
    });
}

export async function getLocalQRCodeDataURL(text: string, size = 128): Promise<string> {
    try {
        const QR = await loadQRCodeLib();
        if (!QR) return '';

        const container = document.createElement('div');
        new QR(container, {
            text: text,
            width: size,
            height: size,
            correctLevel: 0
        });

        const canvas = container.querySelector('canvas');
        if (canvas) return canvas.toDataURL('image/png');
        const img = container.querySelector('img');
        if (img) return img.src;
        return '';
    } catch (e) {
        return '';
    }
}