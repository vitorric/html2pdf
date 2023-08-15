import { promises as fs } from 'fs';
import muhammara, { PDFWStreamForBuffer, PDFRStreamForBuffer } from 'muhammara';
import puppeteer, { Browser, PDFOptions } from 'puppeteer';

import { HTML2PDFOptions } from './types';

export default class HTML2PDF {
  private browser: Browser = null;

  async createPDF(html: string, options: HTML2PDFOptions): Promise<Buffer> {
    if (this.browser === null) {
      await this.launchBrowser();
    }
    const page = await this.browser.newPage();

    await page.setContent(html);

    const optionsPDF: PDFOptions = {
      format: options.format,
      landscape: options.landscape,
      height: options.resolution.height,
      width: options.resolution.width,
      printBackground: true,
      preferCSSPageSize: true,
    };

    const pdfBuffer = await page.pdf(optionsPDF);

    await page.close();

    if (!options.protect) {
      if (!options.filePath) {
        return pdfBuffer;
      }
      await fs.writeFile(options.filePath, pdfBuffer);
      return null;
    }

    const encryptedPDFBuffer = await this.encryptPDF(
      pdfBuffer,
      options.protect.password
    );

    if (!options.filePath) {
      return encryptedPDFBuffer;
    }
    await fs.writeFile(options.filePath, encryptedPDFBuffer);
    return null;
  }

  private async launchBrowser(): Promise<void> {
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

  private async encryptPDF(body: Buffer, password: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const bufferHTML = new PDFRStreamForBuffer(body);
      const outputHTML = new PDFWStreamForBuffer();

      muhammara.recrypt(bufferHTML, outputHTML, {
        password,
        userPassword: password,
        ownerPassword: password,
        userProtectionFlag: 4,
      });
      resolve(outputHTML.buffer);
    });
  }
}
