export const getSearchShortcutText = (): string => {
    const navAny = navigator as any;
    const isApple = /Mac|iPhone|iPad|iPod/i.test(navAny.userAgentData?.platform || navigator.platform || navigator.userAgent);
    return isApple ? 'Cmd + K' : 'Ctrl + K';
};

// Детектор iOS устройств
export const isIOS: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Детектор Safari на macOS
export const isMacSafari: boolean = !isIOS && navigator.userAgent.includes('Mac OS X') && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');

export function platformBoot(): void {
    if (isMacSafari) document.documentElement.classList.add('mac-safari');
}