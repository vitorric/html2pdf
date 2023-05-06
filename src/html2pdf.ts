import puppeteer, { Browser, PDFOptions } from 'puppeteer';

import { HTML2PDFOptions } from './types';

export default class HTML2PDF {
  private browser: Browser = null;

  async createPDF(
    html: string,
    filePath: string,
    options: HTML2PDFOptions
  ): Promise<void> {
    try {
      await this.launchBrowser(options.resolution);
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
    } catch (err: any) {
      console.log('ERROR CREATE PDF', err);
    }
  }

  private async launchBrowser(resolution: { width: number; height: number }) {
    if (this.browser === null) {
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
          `--window-size=${resolution?.width ?? 1920},${
            resolution?.height ?? 1080
          }`,
        ],
      });
    }
  }
}
