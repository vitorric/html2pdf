
# Retorno CNAB

  

#### NPM badges

  

<!-- [START badges] -->

[![NPM html2pdf package](https://img.shields.io/npm/v/html2pdf.svg)](https://npmjs.org/package/html2pdf)

[![npm downloads](https://img.shields.io/npm/dm/html2pdf.svg?maxAge=604800)](https://npm-stat.com/charts.html?package=html2pdf&from=2017-01-1)

[![npm downloads](https://img.shields.io/npm/dt/html2pdf.svg?maxAge=604800)](https://npm-stat.com/charts.html?package=html2pdf&from=2017-01-1)

<!-- [END badges] -->

  

# Description

  

Simple lib to convert HTML to PDF, using puppeteer.

  

# Install

  

```javascript
npm  i  html2pdf
```

  

```javacript
yarn add html2pdf
```

  

# Example

  To execute an example, just run:

```javascript
npm  run  start
```

ou 


```javascript
yarn start
```

Using the package:

```javascript
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


```

You can read a html file and pass the content to create the PDF, or you can pass a pure HTML as param.
  

# License

Released under the MIT License.