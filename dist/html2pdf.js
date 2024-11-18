"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const puppeteer_1 = __importDefault(require("puppeteer"));
const queue_1 = require("./queue");
class HTML2PDF {
    constructor() {
        this.browser = null;
        this.queue = null;
        this.itensInQueue = 0;
        this.MAX_PROCESS_QUEUE = 5;
        this.queue = new queue_1.Queue();
        this.itensInQueue = 0;
    }
    async addToQueue(html, options) {
        if (this.browser === null || !this.isBrowserConnected()) {
            await this.launchBrowser();
        }
        this.queue.enqueue({ id: (0, crypto_1.randomUUID)(), html2pdf: { html, options } });
        if (this.itensInQueue < this.MAX_PROCESS_QUEUE) {
            this.processQueue();
        }
    }
    async processQueue() {
        if (this.queue.size() === 0 ||
            this.itensInQueue >= this.MAX_PROCESS_QUEUE) {
            return;
        }
        this.itensInQueue += 1;
        const itemQueue = this.queue.peek();
        try {
            const pdfCreated = await this.createPDF(itemQueue.html2pdf.html, itemQueue.html2pdf.options);
            if (pdfCreated) {
                this.itensInQueue -= 1;
            }
        }
        catch (error) {
            console.error('Error processing PDF from queue:', error);
            await this.restartBrowser();
            this.queue.enqueue(itemQueue);
        }
        finally {
            this.processQueue();
        }
    }
    async createPDF(html, options) {
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
                }
                else {
                    req.continue();
                }
            });
            const optionsPDF = {
                format: options.format,
                landscape: options.landscape,
                height: options.resolution.height,
                width: options.resolution.width,
                printBackground: true,
                preferCSSPageSize: true,
            };
            await page.waitForFunction(() => !Array.from(document.querySelectorAll('img')).find((i) => !i.complete), { timeout: 60000 });
            const pdfBuffer = await page.pdf(optionsPDF);
            await fs_1.promises.writeFile(options.filePath, pdfBuffer);
            await page.close();
            if (!options.protect) {
                return true;
            }
            return this.encryptPDF(options.filePath, options.protect.password, options.setVersion);
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            await this.restartBrowser();
            await this.addToQueue(html, options);
            return false;
        }
    }
    async launchBrowser() {
        this.browser = await puppeteer_1.default.launch({
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
    async restartBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
            }
            catch (error) {
                console.error('Error closing the browser during restart:', error);
            }
            finally {
                this.browser = null;
                await this.launchBrowser();
            }
        }
    }
    isBrowserConnected() {
        return this.browser && this.browser.connected;
    }
    async encryptPDF(filePath, password, version) {
        return new Promise((resolve, reject) => {
            try {
                const { encryption, forceVersion } = this.getWeakConfigVersionPDF(version);
                const qpdfCommand = `qpdf ${forceVersion}--encrypt ${password} ${password} ${encryption} -- ${filePath} --replace-input`;
                (0, child_process_1.exec)(qpdfCommand, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getWeakConfigVersionPDF(version) {
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
exports.default = HTML2PDF;
