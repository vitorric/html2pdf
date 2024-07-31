"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const puppeteer_1 = __importDefault(require("puppeteer"));
class HTML2PDF {
    constructor() {
        this.browser = null;
        this.queue = [];
        this.processing = false;
        this.queue = [];
        this.processing = false;
    }
    async addToQueue(htmlPath, options) {
        if (this.browser === null) {
            this.browser = await this.launchBrowser();
        }
        this.queue.push({ htmlPath, options });
        if (!this.processing) {
            this.processQueue();
        }
    }
    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        this.processing = true;
        const { htmlPath, options } = this.queue.shift();
        await this.createPDF(htmlPath, options);
        this.processQueue();
    }
    async createPDF(html, options) {
        try {
            if (this.browser === null) {
                this.browser = await this.launchBrowser();
            }
            const page = await this.browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const optionsPDF = {
                format: options.format,
                landscape: options.landscape,
                height: options.resolution.height,
                width: options.resolution.width,
                printBackground: true,
                preferCSSPageSize: true,
            };
            await page.waitForFunction(() => !Array.from(document.querySelectorAll('img')).find((i) => !i.complete));
            const pdfBuffer = await page.pdf(optionsPDF);
            await page.close();
            await fs_1.promises.writeFile(options.filePath, pdfBuffer);
            if (!options.protect) {
                return;
            }
            await this.encryptPDF(options.filePath, options.protect.password, options.setVersion);
        }
        catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
    async launchBrowser() {
        return puppeteer_1.default.launch({
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
                        resolve(null);
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
