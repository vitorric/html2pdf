import { PaperFormat } from 'puppeteer';

export type PDFVersion = '1.4';

export type HTML2PDFOptions = {
  format: PaperFormat;
  landscape: boolean;
  resolution: {
    width: number;
    height: number;
  };
  filePath?: string;
  protect?: {
    password: string;
  };
  setVersion?: PDFVersion;
  pageBreak?: {
    before?: string;
    after?: string;
  };
};
