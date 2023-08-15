"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const muhammara_1 = __importDefault(require("muhammara"));
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
            newPage: async () => {
                return {
                    setContent: async () => Promise.resolve(),
                    pdf: async () => Buffer.alloc(4),
                    close: async () => Promise.resolve(),
                };
            },
        };
    });
    const encryptPDF = jest
        .spyOn(html2pdf_1.default.prototype, 'encryptPDF')
        .mockImplementation(() => Buffer.alloc(4));
    const fsMock = jest
        .spyOn(fs_1.promises, 'writeFile')
        .mockImplementation(() => Promise.resolve());
    describe('createPDF: ', () => {
        it('should be launch the browser 1 time', async () => {
            await html2pdf.createPDF(htmlPage, pdfOptions);
            await html2pdf.createPDF(htmlPage, pdfOptions);
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
        });
        it('should be create the PDF unprotected and without path', async () => {
            const pdfBuffer = await html2pdf.createPDF(htmlPage, pdfOptions);
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
            expect(pdfBuffer === null || pdfBuffer === void 0 ? void 0 : pdfBuffer.length).toEqual(4);
        });
        it('should be create the PDF unprotected and with path', async () => {
            const pdfBuffer = await html2pdf.createPDF(htmlPage, Object.assign(Object.assign({}, pdfOptions), { filePath: './test.pdf' }));
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
            expect(pdfBuffer).toEqual(null);
            expect(fsMock).toHaveBeenCalled();
        });
        it('should be create the PDF protected and without path', async () => {
            const pdfBuffer = await html2pdf.createPDF(htmlPage, Object.assign(Object.assign({}, pdfOptions), { protect: {
                    password: '12345678',
                } }));
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
            expect(pdfBuffer === null || pdfBuffer === void 0 ? void 0 : pdfBuffer.length).toEqual(4);
            expect(encryptPDF).toHaveBeenCalled();
        });
        it('should be create the PDF protected and with path', async () => {
            const pdfBuffer = await html2pdf.createPDF(htmlPage, Object.assign(Object.assign({}, pdfOptions), { filePath: './test.pdf', protect: {
                    password: '12345678',
                } }));
            expect(launchBrowser).toHaveBeenCalled();
            expect(launchBrowser).toHaveBeenCalledTimes(1);
            expect(pdfBuffer).toEqual(null);
            expect(encryptPDF).toHaveBeenCalled();
            expect(fsMock).toHaveBeenCalled();
        });
    });
    describe('encryptPDF: ', () => {
        beforeAll(() => {
            jest.restoreAllMocks();
        });
        it('should be set password to PDF', async () => {
            const encryptPDFMock = jest
                .spyOn(muhammara_1.default, 'recrypt')
                .mockImplementation(() => Promise.resolve());
            html2pdf.encryptPDF(Buffer.alloc(4), '12345678');
            expect(encryptPDFMock).toHaveBeenCalledTimes(1);
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
