const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Table = require('cli-table');
const argv = require('minimist')(process.argv.slice(2));
const vars = require('./vars.json');


if (argv.keyword === undefined) {
  console.log('Usage: node tokopedia.js <keyword> [-p page]');
  process.exit(-1);
}

let url = `https://www.tokopedia.com/search?st=product&q=${argv.keyword}`;

if (argv.p !== undefined) {
  url = `${url}&page=${argv.p}`;
}
console.time('scrape time');
(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: vars.browserWSEndpoint,
  });
  const page = await browser.newPage();
  try {
    await page.goto(url);

    let pageUrl = page.url();
    if (pageUrl.indexOf('/p/') !== -1) {
      pageUrl = `${pageUrl}?page=`;
      await page.goto(pageUrl);
    }

    await page.setViewport({ width: 1200, height: 800 });

    await autoScroll(page);

    const pageContent = await page.content();

    const table = new Table({
      head: ['#', 'Product Name', 'Price'],
      colWidths: [5, 70, 20],
    });


    const $ = cheerio.load(pageContent);
    const productGrid = $(vars.tp.grid);
    productGrid.each((i, col) => {
      const productName = $(vars.tp.productName, col).text();
      const productPrice = $(vars.tp.productPrice, col).children().text();
      const productLink = $('a', col).attr('href');
      const productImage = $('img', col).attr('src');
      const shopName = $(vars.tp.shopName, col).text();
      const shopLocation = $(vars.tp.shopLocation, col).text();
      const reviewCount = $(vars.tp.reviewCount, col).text().slice(1, -1);

      let reviewStars;
      // console.log($(vars.tp.review5, col).attribs);
      // if ($(vars.tp.review5, col).length === 1) {
      //   reviewStars = 5;
      //   console.log('5 stars');
      // }

      table.push([i + 1, productName, productPrice]);
    });

    console.log(table.toString());
  } catch (err) {
    console.log(err);
  }
  await browser.close();
  console.timeEnd('scrape time');
})();

// Credit to chenxiaochun
// https://github.com/chenxiaochun/blog/issues/38
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
