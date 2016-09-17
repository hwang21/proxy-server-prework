let http = require('http')
let request = require('request')
let fs = require('fs')
let argv = require('yargs').argv   
let logStream = argv.logfile ? fs.createWriteStream(argv.logfile) : process.stdout
let scheme = 'http://'
let host = argv.host || '127.0.0.1'
let port = argv.port || (host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + host + ':' + port
console.log(argv)

let echoServer = http.createServer((req, res) => {
  console.log('echoServer')
  logStream.write('echoServer\n')
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
  console.log(req.headers)
  logStream.write(JSON.stringify(req.headers) + '\n')
  req.pipe(res)
}).listen(8000)

console.log('echoServer listening @ 127.0.0.1:8000')
logStream.write('echoServer listening @ 127.0.0.1:8000\n')

let proxyServer = http.createServer((req, res) => {
  console.log('proxyServer')
  console.log(req.headers)
  logStream.write('proxyServer\n')
  logStream.write(JSON.stringify(req.headers) + '\n')
  let url = destinationUrl
  if (req.headers['x-destination-url']) {
     url = 'http://' + req.headers['x-destination-url']
  }
  let options = {
      url: `${url}${req.url}`
  }
  let downstreamResponse = req.pipe(request(options))
   downstreamResponse.pipe(res)
}).listen(8001)

console.log('proxyServer listening @ 127.0.0.1:8001')
logStream.write('proxyServer listening @ 127.0.0.1:8001\n')