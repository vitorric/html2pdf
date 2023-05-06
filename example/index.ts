import { promises as fs } from 'fs';

import HTML2PDF from '../src/index';
import { HTML2PDFOptions } from '../src/types';

const example = async () => {
  const html2pdf: HTML2PDF = new HTML2PDF();

  const html = await fs.readFile('./example/page.html', 'utf-8');
  const options: HTML2PDFOptions = {
    format: 'A4',
  };

  await html2pdf.createPDF(html, `./example/lotr.pdf`, options);
  console.log('PDF Generated...');
};

example();
