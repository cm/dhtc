const DHTC = require('../index')

const crawler = new DHTC({ address: '0.0.0.0', port: 6881 })

crawler.on('infohash', (infohash, address, port) => {
  console.log(`${infohash} from ${address}:${port}`)
})

crawler.start()