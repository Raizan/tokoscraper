# tokoscraper
Indonesia e-Commerce product scraper written in [Node.js](https://nodejs.org/).

### Dependencies
* [puppeteer](https://github.com/GoogleChrome/puppeteer)
* [cheerio](http://cheerio.js.org)
* [minimist](https://www.npmjs.com/package/minimist)

### Installation
Install the dependencies.
```sh
$ git clone https://github.com/Raizan/tokoscraper.git
$ cd tokoscraper
$ npm install
```

### Usage
```sh
# Tokopedia
$ node tokopedia.js --keyword <keyword> [-p page] [--sc filter] [--ob sort by]
# Output: JSON string
```