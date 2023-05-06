import { promises as fs } from 'fs';

import { html2pdf } from '../src/index';
import { HTML2PDFOptions } from '../src/types';

const example = async () => {
  const html = await fs.readFile('./example/page.html', 'utf-8');
  const options: HTML2PDFOptions = {
    format: 'A4',
  };

  await html2pdf.createPDF(html, `./example/lotr.pdf`, options);
  console.log('PDF Generated...');
};

example();
