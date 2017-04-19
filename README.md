# Distributed Hash Table Crawler

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Dependencies](https://david-dm.org/chrisburland/dhtc.svg)](https://david-dm.org/chrisburland/dhtc)

An event based BitTorrent DHT crawler.

## Usage

``` js
const DHTC = require('dhtc')

const crawler = new DHTC({
  address: '0.0.0.0', 
  port: 6881
})

crawler.start()

crawler.on('infoHash', (hash, address, port) => {
  console.log(`${hash} from ${address}:${port}`)
})
```