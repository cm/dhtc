A [BitTorrent](http://www.bittorrent.org/) DHT crawler for [Node.js](https://nodejs.org).

[![npm version](https://badge.fury.io/js/dhtc.svg)](https://badge.fury.io/js/dhtc)
[![Dependencies](https://david-dm.org/chrisburland/dhtc.svg)](https://david-dm.org/chrisburland/dhtc)
[![Code Climate](https://codeclimate.com/github/chrisburland/dhtc/badges/gpa.svg)](https://codeclimate.com/github/chrisburland/dhtc)

## Installation

**Requires:** [Node.js](https://nodejs.org) 6.4.0 or greater.

``` bash
$ npm install dhtc
```

## Features

  * Simple API.
  * Node.js event emmiter based interface.
  * Discover infohashes on the DHT network.

## Usage

**Note:** it make take several minuets for the crawler to find any infohashes.

``` js
const Crawler = require('dhtc')

const crawler = new Crawler({
  address: '0.0.0.0', 
  port: 6881
})

crawler.start()

crawler.on('infoHash', (hash, address, port) => {
  console.log(`${hash} from ${address}:${port}`)
})
```

## License

[MIT](https://github.com/chrisburland/dhtc/blob/master/LICENSE)
