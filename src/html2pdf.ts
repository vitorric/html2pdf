import puppeteer, { Browser, PDFOptions } from 'puppeteer';

import { HTML2PDFOptions } from './types';

export default class HTML2PDF {
  private browser: Browser = null;

  async createPDF(
    html: string,
    filePath: string,
    options?: HTML2PDFOptions
  ): Promise<void> {
    if (this.browser === null) {
      await this.launchBrowser();
    }
    const page = await this.browser.newPage();

    await page.setContent(html);

    const optionsPDF: PDFOptions = {
      ...options,
      path: filePath,
      printBackground: true,
      preferCSSPageSize: true,
    };

    await page.pdf(optionsPDF);

    await page.close();
  }

  async createPDFBuffer(
    html: string,
    options?: HTML2PDFOptions
  ): Promise<Buffer> {
    if (this.browser === null) {
      await this.launchBrowser();
    }
    const page = await this.browser.newPage();

    await page.setContent(html);

    const optionsPDF: PDFOptions = {
      ...options,
      printBackground: true,
      preferCSSPageSize: true,
    };

    const pdfBuffer = await page.pdf(optionsPDF);

    await page.close();

    return pdfBuffer;
  }

  private async launchBrowser(): Promise<void> {
    console.log('oi');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--headless=new',
        '--disabled-setupid-sandbox',
        '--single-process',
        '--no-zygote',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080',
      ],
    });
  }
}
