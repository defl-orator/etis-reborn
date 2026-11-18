// src/core/console-api.ts

export const targetWindow: any = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function consoleApiBoot(): void {
    targetWindow.etisDemo = (enable = true) => {
        if (enable) {
            sessionStorage.setItem('etis_demo_mode', 'true');
            sessionStorage.setItem('etis_demo_page', 'timetable');
        } else {
            sessionStorage.removeItem('etis_demo_mode');
            sessionStorage.removeItem('etis_demo_page');
            sessionStorage.removeItem('etis_pure_demo_mode');
        }
        window.location.reload();
    };

    targetWindow.etisExitDemo = () => {
        sessionStorage.removeItem('etis_demo_mode');
        sessionStorage.removeItem('etis_demo_page');
        sessionStorage.removeItem('etis_pure_demo_mode');
        window.location.reload();
    };

    targetWindow.devBeta = (enable = true) => {
        try {
            const cfg = JSON.parse(localStorage.getItem('etis_general_config') || '{}');
            cfg.betaFeaturesEnabled = enable;
            localStorage.setItem('etis_general_config', JSON.stringify(cfg));
        } catch (e) {}
        window.location.reload();
    };
}