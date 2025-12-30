import { useState, useEffect } from 'react';

declare const acquireVsCodeApi: any;

let vscode: any;
try {
    vscode = acquireVsCodeApi();
} catch (e) {
    // Fallback for browser testing
    vscode = {
        postMessage: (msg: any) => console.log('VS Code PostMessage:', msg),
        setState: (state: any) => console.log('VS Code SetState:', state),
        getState: () => ({})
    };
}

export function useVsCodeApi() {
    return vscode;
}

export function useVsCodeMessages<T>(command: string, callback: (data: T) => void) {
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === command) {
                callback(message.data);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [command, callback]);
}
