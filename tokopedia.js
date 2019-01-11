const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const argv = require('minimist')(process.argv.slice(2));
const vars = require('./vars.json');


if (argv.q === undefined) {
  console.log('Usage: node tokopedia.js -q <keyword> [-p page] [--sc filter] [--ob sort by] [--cond condition]');
  process.exit(-1);
}

let url = `https://www.tokopedia.com/search?st=product&q=${argv.q.split(' ').join('%20')}`;
url = formatUrl(url);

(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: vars.browserWSEndpoint,
  });
  const page = await browser.newPage();
  try {
    await page.goto(url);

    url = page.url();
    if (url.indexOf('/p/') !== -1) {
      if (url.split('/').length === 5) {
        console.log('Error: Vague keyword');
        browser.close();
        process.exit(-1);
      }

      const newUrl = formatUrl(url);
      await page.goto(newUrl);
    }

    await page.setViewport({ width: 1200, height: 800 });

    await autoScroll(page);

    const pageContent = await page.content();

    const $ = cheerio.load(pageContent);

    if ($('#promo-not-found').length === 1) {
      console.log('Error: No result');
      browser.close();
      process.exit(-1);
    }

    const jsonObj = {
      products: [],
      filters: {},
      sortBy: {},
    };

    const productGrid = $(vars.tp.grid);
    jsonObj.products = getProducts($, productGrid);

    const searchFilters = $(vars.tp.filters);
    jsonObj.filters = getFilters(searchFilters);

    const searchSortBy = $('[name=ob]');
    jsonObj.sortBy = getSortBy(searchSortBy);

    console.log(JSON.stringify(jsonObj));
  } catch (err) {
    console.log(err);
  }
  await browser.close();
})();

function getProducts($, productGrid) {
  const products = [];
  productGrid.each((i, col) => {
    const productName = $(vars.tp.productName, col).text();

    let productPrice = $(vars.tp.productPrice, col).children().text();
    productPrice = unformatMoney(productPrice);

    const productLink = $('a', col).attr('href');
    const productImage = $('img', col).attr('src');
    const shopName = $(vars.tp.shopName, col).text();
    const shopLocation = $(vars.tp.shopLocation, col).text();

    let reviewCount = $(vars.tp.reviewCount, col).text().slice(1, -1);
    reviewCount = Number(reviewCount);

    let reviewStars;
    if ($('i', col).is(vars.tp.review5)) {
      reviewStars = 5;
    } else if ($('i', col).is(vars.tp.review4)) {
      reviewStars = 4;
    } else if ($('i', col).is(vars.tp.review3)) {
      reviewStars = 3;
    } else if ($('i', col).is(vars.tp.review2)) {
      reviewStars = 2;
    } else if ($('i', col).is(vars.tp.review1)) {
      reviewStars = 1;
    } else {
      reviewStars = null;
    }

    const colData = {
      productName,
      productPrice,
      productLink,
      productImage,
      shopName,
      shopLocation,
      reviewCount,
      reviewStars,
    };

    products.push(colData);
  });
  return products;
}

function getFilters(searchFilters) {
  const filters = {};
  searchFilters.each((i, filter) => {
    const categoryName = filter.children[0].data;
    const sc = filter.children[1].attribs.value;
    filters[`${categoryName}`] = Number(sc);
  });
  return filters;
}

function getSortBy(searchSortBy) {
  const options = {};
  searchSortBy.children('option').each((i, ob) => {
    const option = ob.children[0].data;
    const { value } = ob.attribs;
    options[`${option}`] = Number(value);
  });
  return options;
}

// Credit to chenxiaochun
// https://github.com/chenxiaochun/blog/issues/38
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
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

function formatUrl(currentUrl) {
  let newUrl = currentUrl;
  if (argv.p !== undefined) {
    newUrl = `${currentUrl}&page=${argv.p}`;
  }
  if (argv.sc !== undefined) {
    newUrl = `${currentUrl}&sc=${argv.sc}`;
  }
  if (argv.ob !== undefined) {
    newUrl = `${currentUrl}&ob=${argv.ob}`;
  }
  if (argv.cond !== undefined) {
    newUrl = `${currentUrl}&condition=${argv.cond}`;
  }
  return newUrl;
}

function unformatMoney(money) {
  let num = money;
  num = num.split(' ').pop();
  num = num.split('.');
  return Number(num.join(''));
}
