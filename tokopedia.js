const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const readline = require('readline-sync');

const searchKeyword = readline.question('Keyword: ').split(' ').join('+');

const url = `https://www.tokopedia.com/search?st=product&q=${searchKeyword}`;


(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 926 });
  await page.goto(url);
  await page.content()
    .then((html) => {
      const $ = cheerio.load(html);
      const productGrid = $('._33JN2R1i');
      console.log(productGrid.length);
    })
    .catch((err) => {
      console.error(err);
    });
  await browser.close();
})();
