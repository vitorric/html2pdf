import { promises as fs } from 'fs';
import muhammara, { PDFWStreamForBuffer, PDFRStreamForBuffer } from 'muhammara';
import puppeteer, { Browser, PDFOptions } from 'puppeteer';

import { HTML2PDFOptions } from './types';

export default class HTML2PDF {
  private browser: Browser = null;

  async createPDF(html: string, options: HTML2PDFOptions): Promise<Buffer> {
    try {
      if (this.browser === null) {
        await this.launchBrowser();
      }

      const page = await this.browser.newPage();

      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const optionsPDF: PDFOptions = {
        format: options.format,
        landscape: options.landscape,
        height: options.resolution.height,
        width: options.resolution.width,
        printBackground: true,
        preferCSSPageSize: true,
      };

      await page.waitForFunction(
        () =>
          ![...document.querySelectorAll('img')].find((i: any) => !i.complete)
      );

      const pdfBuffer = await page.pdf(optionsPDF);

      await page.close();
      await fs.writeFile(options.filePath, pdfBuffer);

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
      console.log(encryptedPDFBuffer);
      await fs.writeFile(options.filePath, encryptedPDFBuffer);
      return null;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    } finally {
      await this.browser.close();
    }
  }

  private async launchBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      devtools: false,
      handleSIGHUP: true,
      handleSIGTERM: true,
      handleSIGINT: true,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      args: [
        '--no-sandbox',
        '--disabled-setupid-sandbox',
        '--no-zygote',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });
  }

  private async encryptPDF(body: Buffer, password: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        console.log(body.length);
        const bufferHTML = new PDFRStreamForBuffer(body);
        const outputHTML = new PDFWStreamForBuffer();

        muhammara.recrypt(bufferHTML, outputHTML, {
          password,
          userPassword: password,
          ownerPassword: password,
          userProtectionFlag: 4,
        });
        resolve(outputHTML.buffer);
      } catch (e) {
        reject(e);
      }
    });
  }
}
