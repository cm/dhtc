const DHTCrawler = require('../index')

const crawler = new DHTCrawler({ address: '0.0.0.0', port: 6881 })

crawler.on('infohash', (infohash, address, port) => {
  console.log(`${infohash} from ${address}:${port}`)
})

crawler.start()