import { exec } from 'child_process';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import puppeteer, { Browser, PDFOptions } from 'puppeteer';

import { Queue } from './queue';
import { HTML2PDFOptions, PDFVersion } from './types';

export default class HTML2PDF {
  private browser: Browser = null;

  private queue: Queue = null;

  private itensInQueue = 0;

  private MAX_PROCESS_QUEUE = 5;

  constructor() {
    this.queue = new Queue();
    this.itensInQueue = 0;
  }

  async addToQueue(html: string, options: HTML2PDFOptions): Promise<void> {
    if (this.browser === null || !this.isBrowserConnected()) {
      await this.launchBrowser();
    }

    this.queue.enqueue({ id: randomUUID(), html2pdf: { html, options } });

    if (this.itensInQueue < this.MAX_PROCESS_QUEUE) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    if (
      this.queue.size() === 0 ||
      this.itensInQueue >= this.MAX_PROCESS_QUEUE
    ) {
      return;
    }

    this.itensInQueue += 1;

    const itemQueue = this.queue.peek();

    try {
      const pdfCreated = await this.createPDF(
        itemQueue.html2pdf.html,
        itemQueue.html2pdf.options
      );

      if (pdfCreated) {
        this.itensInQueue -= 1;
      }
    } catch (error) {
      console.error('Error processing PDF from queue:', error);
      await this.restartBrowser();
      this.queue.enqueue(itemQueue);
    } finally {
      this.processQueue();
    }
  }

  async createPDF(html: string, options: HTML2PDFOptions): Promise<boolean> {
    if (this.browser === null || !this.isBrowserConnected()) {
      await this.launchBrowser();
    }

    const page = await this.browser.newPage();

    try {
      await page.setContent(html, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      await page.setRequestInterception(true);

      page.on('request', (req) => {
        if (['script'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

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
          ),
        { timeout: 60000 }
      );

      const pdfBuffer = await page.pdf(optionsPDF);

      await fs.writeFile(options.filePath, pdfBuffer);

      await page.close();

      if (!options.protect) {
        return true;
      }

      return this.encryptPDF(
        options.filePath,
        options.protect.password,
        options.setVersion
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      await this.restartBrowser();
      await this.addToQueue(html, options);
      return false;
    }
  }

  public async launchBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      devtools: false,
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

  private async restartBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.error('Error closing the browser during restart:', error);
      } finally {
        this.browser = null;
        await this.launchBrowser();
      }
    }
  }

  private isBrowserConnected(): boolean {
    return this.browser && this.browser.connected;
  }

  private async encryptPDF(
    filePath: string,
    password: string,
    version?: PDFVersion
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const { encryption, forceVersion } =
          this.getWeakConfigVersionPDF(version);
        const qpdfCommand = `qpdf ${forceVersion}--encrypt ${password} ${password} ${encryption} -- ${filePath} --replace-input`;
        exec(qpdfCommand, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
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
