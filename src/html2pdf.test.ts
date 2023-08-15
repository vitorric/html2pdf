import { promises as fs } from 'fs';
import muhammara from 'muhammara';
import puppeteer from 'puppeteer';

import HTML2PDF from './html2pdf';
import { HTML2PDFOptions } from './types';

describe('HTML2PDF: ', () => {
  const html2pdf = new HTML2PDF();
  const pdfOptions: HTML2PDFOptions = {
    format: 'A4',
    landscape: false,
    resolution: {
      height: 10,
      width: 10,
    },
  };

  beforeEach(() => {
    (html2pdf as any).browser = null;
  });

  const htmlPage = '<p>Hello World</p>';

  const launchBrowser = jest
    .spyOn(HTML2PDF.prototype as any, 'launchBrowser')
    .mockImplementation(() => {
      (html2pdf as any).browser = {
        newPage: async (): Promise<any> => {
          return {
            setContent: async () => Promise.resolve(),
            pdf: async () => Buffer.alloc(4),
            close: async () => Promise.resolve(),
          };
        },
      };
    });

  const encryptPDF = jest
    .spyOn(HTML2PDF.prototype as any, 'encryptPDF')
    .mockImplementation((): any => Buffer.alloc(4));

  const fsMock = jest
    .spyOn(fs, 'writeFile')
    .mockImplementation((): any => Promise.resolve());

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
      expect(pdfBuffer?.length).toEqual(4);
    });

    it('should be create the PDF unprotected and with path', async () => {
      const pdfBuffer = await html2pdf.createPDF(htmlPage, {
        ...pdfOptions,
        filePath: './test.pdf',
      });

      expect(launchBrowser).toHaveBeenCalled();
      expect(launchBrowser).toHaveBeenCalledTimes(1);
      expect(pdfBuffer).toEqual(null);
      expect(fsMock).toHaveBeenCalled();
    });

    it('should be create the PDF protected and without path', async () => {
      const pdfBuffer = await html2pdf.createPDF(htmlPage, {
        ...pdfOptions,
        protect: {
          password: '12345678',
        },
      });

      expect(launchBrowser).toHaveBeenCalled();
      expect(launchBrowser).toHaveBeenCalledTimes(1);
      expect(pdfBuffer?.length).toEqual(4);
      expect(encryptPDF).toHaveBeenCalled();
    });

    it('should be create the PDF protected and with path', async () => {
      const pdfBuffer = await html2pdf.createPDF(htmlPage, {
        ...pdfOptions,
        filePath: './test.pdf',
        protect: {
          password: '12345678',
        },
      });

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
        .spyOn(muhammara, 'recrypt')
        .mockImplementation((): any => Promise.resolve());

      (html2pdf as any).encryptPDF(Buffer.alloc(4), '12345678');

      expect(encryptPDFMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('launchBrowser: ', () => {
    beforeAll(() => {
      jest.restoreAllMocks();
    });

    it('should be launch the browser', async () => {
      const puppeteerLaunch = jest
        .spyOn(puppeteer, 'launch')
        .mockImplementation(async (): Promise<any> => Promise.resolve());

      (html2pdf as any).launchBrowser();

      expect(puppeteerLaunch).toHaveBeenCalledTimes(1);
    });
  });
});
