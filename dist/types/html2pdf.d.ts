/// <reference types="node" />
import { HTML2PDFOptions } from './types';
export default class HTML2PDF {
    private browser;
    createPDF(html: string, options: HTML2PDFOptions): Promise<Buffer>;
    private launchBrowser;
    private encryptPDF;
}
