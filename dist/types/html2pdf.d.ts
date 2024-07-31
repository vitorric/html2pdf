import { HTML2PDFOptions } from './types';
export default class HTML2PDF {
    private browser;
    private queue;
    private processing;
    constructor();
    addToQueue(htmlPath: string, options: HTML2PDFOptions): Promise<void>;
    processQueue(): Promise<void>;
    createPDF(html: string, options: HTML2PDFOptions): Promise<void>;
    private launchBrowser;
    private encryptPDF;
    private getWeakConfigVersionPDF;
}
