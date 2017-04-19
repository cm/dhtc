const DHTC = require('../lib/dhtc')

const crawler = new DHTC({
  address: '0.0.0.0', 
  port: 6881
})

crawler.start(() => {
  console.log(`DHT crawler listening on 0.0.0.0:6881`)
})

crawler.on('infoHash', (hash, address, port) => {
  console.log(`${hash} from ${address}:${port}`)
})