# HTML2PDF-TS

#### NPM badges

<!-- [START badges] -->
[![NPM html2pdf-ts package](https://img.shields.io/npm/v/html2pdf-ts.svg)](https://npmjs.org/package/html2pdf-ts)
[![npm downloads](https://img.shields.io/npm/dm/html2pdf-ts.svg?maxAge=604800)](https://npm-stat.com/charts.html?package=html2pdf-ts&from=2017-01-1)
[![npm downloads](https://img.shields.io/npm/dt/html2pdf-ts.svg?maxAge=604800)](https://npm-stat.com/charts.html?package=html2pdf-ts&from=2017-01-1)
<!-- [END badges] -->


Simple lib to convert HTML to PDF, using puppeteer and [qpdf](https://github.com/qpdf/qpdf) to protect him with password.

This package have the following features:
  
- [x] Simple convert HTML to PDF;
- [x] Convert HTML to PDF and protect it with password;
- [x] Queue to convert HTML to PDF one per time, saving memory.

# Install

First of all, install [qpdf](https://github.com/qpdf/qpdf) in your OS.

```javascript
npm i html2pdf-ts
```

```javacript
yarn add html2pdf-ts
```

# Example

To execute an example, just run:
  
```javascript
npm run start
```

or

```javascript
yarn start
```

Using the package:

The example below is for executing just 1 conversion, and it happens immediately.

```javascript
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

exampleSingleConversion();
```

In this other example, the queue is already used to control the conversion of HTML's into PDF's

```javascript
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
```

To create the PDF without password, just remove the param **protect** from options.

In addition, you can read a html file and pass the content to create the PDF, or just pass a pure HTML as param.

# Tests

To execute tests run:
```
yarn test
``` 

With coverage:
```
yarn test:cov
``` 

# License

Released under the MIT License.