import { PaperFormat } from 'puppeteer';

export type HTML2PDFOptions = {
  format: PaperFormat;
  landscape?: boolean;
  resolution?: {
    width: number;
    height: number;
  };
};
