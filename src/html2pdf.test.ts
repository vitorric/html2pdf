import puppeteer from 'puppeteer';

import HTML2PDF from './html2pdf';

describe('HTML2PDF: ', () => {
  const html2pdf = new HTML2PDF();

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

  describe('createPDF: ', () => {
    it('should be create the PDF using HTML without option', async () => {
      await html2pdf.createPDF(htmlPage, './test.pdf');
      await html2pdf.createPDF(htmlPage, './test.pdf');

      expect(launchBrowser).toHaveBeenCalled();
      expect(launchBrowser).toHaveBeenCalledTimes(1);
    });

    it('should be create the PDF using HTML with option', async () => {
      await html2pdf.createPDF(htmlPage, './test.pdf', {
        format: 'A4',
        resolution: {
          height: 10,
          width: 10,
        },
      });
      await html2pdf.createPDF(htmlPage, './test.pdf', {
        format: 'A4',
        resolution: {
          height: 10,
          width: 10,
        },
      });

      expect(launchBrowser).toHaveBeenCalled();
      expect(launchBrowser).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPDFBuffer: ', () => {
    it('should be create the buffer of PDF using HTML', async () => {
      await html2pdf.createPDFBuffer(htmlPage);
      const buffer = await html2pdf.createPDFBuffer(htmlPage);

      expect(launchBrowser).toHaveBeenCalled();
      expect(launchBrowser).toHaveBeenCalledTimes(1);
      expect(buffer.length).toEqual(4);
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
