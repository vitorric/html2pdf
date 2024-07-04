import { promises as fs } from 'fs';

import { html2pdf } from '../src/index';
import { HTML2PDFOptions } from '../src/types';

const exampleSingleConversion = async () => {
  const html = await fs.readFile('./example/page.html', 'utf-8');
  const options: HTML2PDFOptions = {
    format: 'A4',
    filePath: './example/example.pdf',
    landscape: false,
    protect: {
      password: '1234',
    },
    resolution: {
      height: 1920,
      width: 1080,
    },
  };

  await html2pdf.createPDF(html, options);
  console.log('PDF Generated...');
};

const exampleMultipleConversion = async () => {
  const array = Array.from({ length: 51 }, (_, i) => i);
  const html = await fs.readFile('./example/page.html', 'utf-8');

  for await (const i of array) {
    const options: HTML2PDFOptions = {
      format: 'A4',
      filePath: `./example/multiples/example_${i}.pdf`,
      landscape: false,
      protect: {
        password: '1234',
      },
      resolution: {
        height: 1920,
        width: 1080,
      },
    };

    await html2pdf.addToQueue(html, options);
  }

  await html2pdf.createPDF(html, {
    format: 'A4',
    filePath: `./example/multiples/another.pdf`,
    landscape: false,
    protect: {
      password: '1234',
    },
    resolution: {
      height: 1920,
      width: 1080,
    },
  });
};

exampleSingleConversion();
exampleMultipleConversion();
