
# tokoscraper
Indonesia e-Commerce product scraper written in [Node.js](https://nodejs.org/).

### Prerequisites
* [Node.js](https://nodejs.org/) (version 8+)
* [Docker](https://docs.docker.com/)
* [Browserless](https://docs.browserless.io/docs/docker-quickstart.html)

### Dependencies
* [puppeteer](https://github.com/GoogleChrome/puppeteer)
* [cheerio](http://cheerio.js.org)
* [minimist](https://www.npmjs.com/package/minimist)

### Installation
##### Install prerequisites
1. Install Node.js.
2. Install Docker.
3. Pull Browserless docker image.
4. Run Browserless container on ``localhost:3000``.  Change ``"browserWSEndpoint"`` in ``vars.json`` if container is running on different ``IP_ADDR:PORT``. 

##### Install dependencies
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