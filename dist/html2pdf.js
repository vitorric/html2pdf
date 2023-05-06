"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
class HTML2PDF {
    constructor() {
        this.browser = null;
    }
    async createPDF(html, filePath, options) {
        try {
            await this.launchBrowser(options.resolution);
            const page = await this.browser.newPage();
            await page.setContent(html);
            const optionsPDF = Object.assign(Object.assign({}, options), { path: filePath, printBackground: true, preferCSSPageSize: true });
            await page.pdf(optionsPDF);
            await page.close();
        }
        catch (err) {
            console.log('ERROR CREATE PDF', err);
        }
    }
    async launchBrowser(resolution) {
        var _a, _b;
        if (this.browser === null) {
            this.browser = await puppeteer_1.default.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--headless=new',
                    '--disabled-setupid-sandbox',
                    '--single-process',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    `--window-size=${(_a = resolution === null || resolution === void 0 ? void 0 : resolution.width) !== null && _a !== void 0 ? _a : 1920},${(_b = resolution === null || resolution === void 0 ? void 0 : resolution.height) !== null && _b !== void 0 ? _b : 1080}`
                ]
            });
        }
    }
}
exports.default = HTML2PDF;
