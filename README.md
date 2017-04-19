# Distributed Hash Table Crawler

[![npm version](https://badge.fury.io/js/dhtc.svg)](https://badge.fury.io/js/dhtc)
[![Dependencies](https://david-dm.org/chrisburland/dhtc.svg)](https://david-dm.org/chrisburland/dhtc)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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