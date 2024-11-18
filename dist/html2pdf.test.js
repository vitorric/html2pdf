"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const puppeteer_1 = __importDefault(require("puppeteer"));
const html2pdf_1 = __importDefault(require("./html2pdf"));
describe('HTML2PDF: ', () => {
    const html2pdf = new html2pdf_1.default();
    const pdfOptions = {
        format: 'A4',
        landscape: false,
        resolution: {
            height: 10,
            width: 10,
        },
    };
    beforeEach(() => {
        html2pdf.browser = null;
    });
    const htmlPage = '<p>Hello World</p>';
    const launchBrowser = jest
        .spyOn(html2pdf_1.default.prototype, 'launchBrowser')
        .mockImplementation(() => {
        html2pdf.browser = {
            close: async () => Promise.resolve(),
            connected: true,
            newPage: async () => {
                return {
                    setContent: async () => Promise.resolve(),
                    pdf: async () => Buffer.alloc(4),
                    close: async () => Promise.resolve(),
                    on: async () => Promise.resolve(),
                    waitForFunction: async () => Promise.resolve(),
                    setRequestInterception: async () => Promise.resolve(),
                };
            },
        };
    });
    const encryptPDF = jest
        .spyOn(html2pdf_1.default.prototype, 'encryptPDF')
        .mockImplementation(() => true);
    const fsMock = jest
        .spyOn(fs_1.promises, 'writeFile')
        .mockImplementation(() => Promise.resolve());
    describe('createPDF: ', () => {
        it('should be launch the browser 1 time', async () => {
            await html2pdf.launchBrowser();
            await html2pdf.createPDF(htmlPage, pdfOptions);
            await html2pdf.createPDF(htmlPage, pdfOptions);
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
        });
        it('should be create the PDF unprotected', async () => {
            const pdfBuffer = await html2pdf.createPDF(htmlPage, Object.assign(Object.assign({}, pdfOptions), { filePath: './test.pdf' }));
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
            expect(encryptPDF).not.toHaveBeenCalled();
            expect(fsMock).toHaveBeenCalled();
            expect(pdfBuffer).toBe(true);
        });
        it('should be create the PDF protected', async () => {
            const pdfBuffer = await html2pdf.createPDF(htmlPage, Object.assign(Object.assign({}, pdfOptions), { filePath: './test.pdf', protect: {
                    password: '12345678',
                } }));
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
            expect(pdfBuffer).toEqual(true);
            expect(encryptPDF).toHaveBeenCalled();
            expect(fsMock).toHaveBeenCalled();
        });
    });
    describe('launchBrowser: ', () => {
        beforeAll(() => {
            jest.restoreAllMocks();
        });
        it('should be launch the browser', async () => {
            const puppeteerLaunch = jest
                .spyOn(puppeteer_1.default, 'launch')
                .mockImplementation(async () => Promise.resolve());
            html2pdf.launchBrowser();
            expect(puppeteerLaunch).toHaveBeenCalledTimes(1);
        });
    });
});
