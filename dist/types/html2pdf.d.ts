import { HTML2PDFOptions } from './types';
export default class HTML2PDF {
    private browser;
    createPDF(html: string, filePath: string, options: HTML2PDFOptions): Promise<void>;
    private launchBrowser;
}
