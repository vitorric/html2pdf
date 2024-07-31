import { exec } from 'child_process';
import { promises as fs } from 'fs';
import puppeteer, { Browser, PDFOptions } from 'puppeteer';

import { HTML2PDFOptions, PDFVersion } from './types';

export default class HTML2PDF {
  private browser: Browser = null;

  private queue = [];

  private processing = false;

  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async addToQueue(htmlPath: string, options: HTML2PDFOptions): Promise<void> {
    if (this.browser === null) {
      this.browser = await this.launchBrowser();
    }

    this.queue.push({ htmlPath, options });

    if (!this.processing) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const { htmlPath, options } = this.queue.shift();
    await this.createPDF(htmlPath, options);
    this.processQueue();
  }

  async createPDF(html: string, options: HTML2PDFOptions): Promise<void> {
    try {
      if (this.browser === null) {
        this.browser = await this.launchBrowser();
      }

      const page = await this.browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });

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
          !Array.from(document.querySelectorAll('img')).find(
            (i: any) => !i.complete
          )
      );

      const pdfBuffer = await page.pdf(optionsPDF);

      await page.close();

      await fs.writeFile(options.filePath, pdfBuffer);

      if (!options.protect) {
        return;
      }

      await this.encryptPDF(
        options.filePath,
        options.protect.password,
        options.setVersion
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  private async launchBrowser(): Promise<Browser> {
    return puppeteer.launch({
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

  private async encryptPDF(
    filePath: string,
    password: string,
    version?: PDFVersion
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const { encryption, forceVersion } =
          this.getWeakConfigVersionPDF(version);
        const qpdfCommand = `qpdf ${forceVersion}--encrypt ${password} ${password} ${encryption} -- ${filePath} --replace-input`;
        exec(qpdfCommand, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private getWeakConfigVersionPDF(version?: PDFVersion): {
    encryption: string;
    forceVersion: string;
  } {
    if (version === '1.4') {
      return {
        encryption: '128',
        forceVersion: '--allow-weak-crypto --force-version=1.4 ',
      };
    }

    return {
      encryption: '256',
      forceVersion: '',
    };
  }
}
