# HTML2PDF-TS

#### NPM badges

<!-- [START badges] -->
[![NPM html2pdf-ts package](https://img.shields.io/npm/v/html2pdf-ts.svg)](https://npmjs.org/package/html2pdf-ts)
[![npm downloads](https://img.shields.io/npm/dm/html2pdf-ts.svg?maxAge=604800)](https://npm-stat.com/charts.html?package=html2pdf-ts&from=2017-01-1)
[![npm downloads](https://img.shields.io/npm/dt/html2pdf-ts.svg?maxAge=604800)](https://npm-stat.com/charts.html?package=html2pdf-ts&from=2017-01-1)
<!-- [END badges] -->

# Description

Simple lib to convert HTML to PDF, using puppeteer.

This package have the following features:

- [x] Create the PDF file and save.
- [x] Create the PDF buffer and return.
- [x] Create the PDF file with password and return.
- [x] Create the PDF buffer with password and return.

# Install

```javascript
npm  i  html2pdf-ts
```

```javacript
yarn add html2pdf-ts
```

# Example

To execute an example, just run:
  
```javascript
npm  run  start
```

or

```javascript
yarn  start
```

Using the package:
  
```javascript
import { promises  as  fs } from  'fs';
import { html2pdf } from  '../src/index';
import { HTML2PDFOptions } from  '../src/types';

const  example = async () => {
	const  html = await  fs.readFile('./example/page.html', 'utf-8');
	const  options: HTML2PDFOptions = {
		format:  'A4',
		filePath:  './example/lotr.pdf',
		landscape:  false,
		protect: {
			password:  '1234',
		},
		resolution: {
			height:  1920,
			width:  1080,
		},
	};

	await  html2pdf.createPDF(html, options);

	console.log('PDF Generated...');
};

example();
```

The example above create a PDF with password and save it.

To create the PDF without password, just remove the param **protect** from options, and to get only the buffer, remove the **filePath**.

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