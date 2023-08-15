"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const muhammara_1 = __importStar(require("muhammara"));
const puppeteer_1 = __importDefault(require("puppeteer"));
class HTML2PDF {
    constructor() {
        this.browser = null;
    }
    async createPDF(html, options) {
        if (this.browser === null) {
            await this.launchBrowser();
        }
        const page = await this.browser.newPage();
        await page.setContent(html);
        const optionsPDF = {
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
            await fs_1.promises.writeFile(options.filePath, pdfBuffer);
            return null;
        }
        const encryptedPDFBuffer = await this.encryptPDF(pdfBuffer, options.protect.password);
        if (!options.filePath) {
            return encryptedPDFBuffer;
        }
        await fs_1.promises.writeFile(options.filePath, encryptedPDFBuffer);
        return null;
    }
    async launchBrowser() {
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
                '--window-size=1920,1080',
            ],
        });
    }
    async encryptPDF(body, password) {
        return new Promise((resolve) => {
            const bufferHTML = new muhammara_1.PDFRStreamForBuffer(body);
            const outputHTML = new muhammara_1.PDFWStreamForBuffer();
            muhammara_1.default.recrypt(bufferHTML, outputHTML, {
                password,
                userPassword: password,
                ownerPassword: password,
                userProtectionFlag: 4,
            });
            resolve(outputHTML.buffer);
        });
    }
}
exports.default = HTML2PDF;
