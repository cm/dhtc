const bencode = require('bencode')
const crypto = require('crypto')
const dgram = require('dgram')
const events = require('events')

const BOOTSTRAP_NODES = [
  ['router.bittorrent.com', 6881],
  ['dht.transmissionbt.com', 6881],
  ['router.utorrent.com', 6881]
]
const TID_LENGTH = 4
const NODES_MAX_SIZE = 1000
const TOKEN_LENGTH = 2

const randomID = () => {
  return crypto.createHash('sha1').update(crypto.randomBytes(20)).digest()
}

const decodeNodes = (data) => {
  let nodes = []
  for (let i = 0; i + 26 <= data.length; i += 26) {
    nodes.push({
      nid: data.slice(i, i + 20),
      address: data[i + 20] + '.' + data[i + 21] + '.' + data[i + 22] + '.' + data[i + 23],
      port: data.readUInt16BE(i + 24)
    })
  }
  return nodes
}

const genNeighborID = (target, nid) => {
  return Buffer.concat([target.slice(0, 10), nid.slice(10)])
}

class KTable {
  constructor (maxsize) {
    this.nid = randomID()
    this.nodes = []
    this.maxsize = maxsize
  }

  push (node) {
    if (this.nodes.length >= this.maxsize) {
      return
    }
    this.nodes.push(node)
  }
}

class DHTC extends events.EventEmitter {
  constructor (options) {
    super()
    this.address = options.address
    this.port = options.port
    this.udp = dgram.createSocket('udp4')
    this.ktable = new KTable(NODES_MAX_SIZE)
  }

  sendKRPC (msg, rinfo) {
    let buf = bencode.encode(msg)
    this.udp.send(buf, 0, buf.length, rinfo.port, rinfo.address)
  }

  onFindNodeResponse (nodes) {
    var nodes = decodeNodes(nodes)
    nodes.forEach(function(node) {
      if (node.address != this.address && node.nid != this.ktable.nid && node.port < 65536 && node.port > 0) {
        this.ktable.push(node)
      }
    }.bind(this))
  }

  sendFindNodeRequest (rinfo, nid) {
    let _nid = nid != undefined ? genNeighborID(nid, this.ktable.nid) : this.ktable.nid
    let msg = {
      t: randomID().slice(0, TID_LENGTH),
      y: 'q',
      q: 'find_node',
      a: {
        id: _nid,
        target: randomID()
      }
    }
    this.sendKRPC(msg, rinfo)
  }

  joinDHTNetwork () {
    BOOTSTRAP_NODES.forEach(function (node) {
      this.sendFindNodeRequest({address: node[0], port: node[1]})
    }.bind(this))
  }

  makeNeighbours () {
    this.ktable.nodes.forEach(function (node) {
      this.sendFindNodeRequest({
        address: node.address,
        port: node.port
      }, node.nid)
    }.bind(this))
    this.ktable.nodes = []
  }

  onGetPeersRequest (msg, rinfo) {
    try {
      var infohash = msg.a.info_hash
      var tid = msg.t
      var nid = msg.a.id
      var token = infohash.slice(0, TOKEN_LENGTH)

      if (tid === undefined || infohash.length != 20 || nid.length != 20) {
        throw new Error
      }
    }
    catch (err) {
      return
    }
    this.sendKRPC({
      t: tid,
      y: 'r',
      r: {
        id: genNeighborID(infohash, this.ktable.nid),
        nodes: '',
        token: token
      }
    }, rinfo)
  }

  onAnnouncePeerRequest (msg, rinfo) {
    var port

    try {
      var infohash = msg.a.info_hash
      var token = msg.a.token
      var nid = msg.a.id
      var tid = msg.t

      if (tid == undefined) {
        throw new Error
      }
    }
    catch (err) {
      return
    }

    if (infohash.slice(0, TOKEN_LENGTH).toString() != token.toString()) {
      return
    }

    if (msg.a.implied_port != undefined && msg.a.implied_port != 0) {
      port = rinfo.port
    }
    else {
      port = msg.a.port || 0
    }

    if (port >= 65536 || port <= 0) {
      return
    }

    this.sendKRPC({
      t: tid,
      y: 'r',
      r: {
        id: genNeighborID(nid, this.ktable.nid)
      }
    }, rinfo)

    this.emit('infoHash', infohash.toString("hex"), rinfo.address, rinfo.port)
  }

  onMessage (msg, rinfo) {
    try {
      var msg = bencode.decode(msg)
      if (msg.y == 'r' && msg.r.nodes) {
        this.onFindNodeResponse(msg.r.nodes)
      }
      else if (msg.y == 'q' && msg.q == 'get_peers') {
        this.onGetPeersRequest(msg, rinfo)
      }
      else if (msg.y == 'q' && msg.q == 'announce_peer') {
        this.onAnnouncePeerRequest(msg, rinfo)
      }
    }
    catch (err) {
    }
  }

  start () {
    this.udp.bind(this.port, this.address)

    this.udp.on('listening', function() {
    }.bind(this))

    this.udp.on('message', function(msg, rinfo) {
      this.onMessage(msg, rinfo)
    }.bind(this))

    this.udp.on('error', function(err) {
    }.bind(this))

    setInterval(function() {
      this.joinDHTNetwork()
      this.makeNeighbours()
    }.bind(this), 1000)
  }
}

module.exports = DHTC