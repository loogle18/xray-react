const http = require('http');

const server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});


const listen = function() {
  server.listen(9090, function (err) {
    console.log('listening http://localhost:9090/');
    console.log('pid is ' + process.pid);
  });
  
  process.on('SIGTERM', function () {
    console.log('SHUTDOWN');
    server.close(function () {
      process.exit(0);
    });
  });
};

listen();

// module.exports = {
//   server,
//   listen
// };
