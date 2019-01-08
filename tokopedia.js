const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');
const Table = require('cli-table');

const searchKeyword = readline.question('Keyword: ').split(' ').join('+');

const url = `https://www.tokopedia.com/search?st=product&q=${searchKeyword}`;


(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://localhost:3000',
    defaultViewport: { width: 1920, height: 926 },
  });
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const pageContent = await page.content();

    const table = new Table({
      head: ['#', 'Product Name', 'Price'],
      colWidths: [5, 70, 20],
    });

    const $ = cheerio.load(pageContent);
    const productGrid = $('._33JN2R1i');

    productGrid.each((i, col) => {
      const productName = $('._18f-69Qp', col)[0].children[0].data;
      const productPrice = $('._3PlXink_', col)[0].children[0].children[0].data;
      table.push([i + 1, productName, productPrice]);
    });

    console.log(table.toString());
  } catch (err) {
    console.log(err);
  }
  await browser.close();
})();