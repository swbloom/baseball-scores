http = require('http');

const config = {
  url: 'localhost',
  port: 8080,
  path: '/scrape',
  method: 'GET'
};

module.exports = {
  request: function() {
    http.request(config, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    }).end();
  }
}