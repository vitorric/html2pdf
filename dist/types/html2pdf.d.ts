import { HTML2PDFOptions } from './types';
export default class HTML2PDF {
    private browser;
    private queue;
    private itensInQueue;
    private MAX_PROCESS_QUEUE;
    constructor();
    addToQueue(html: string, options: HTML2PDFOptions): Promise<void>;
    processQueue(): Promise<void>;
    createPDF(html: string, options: HTML2PDFOptions): Promise<boolean>;
    launchBrowser(): Promise<void>;
    private restartBrowser;
    private isBrowserConnected;
    private encryptPDF;
    private getWeakConfigVersionPDF;
}
