const http = require('http');

const port = 8080;
const version = '1.2';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Hello World ${version}\n`);
});

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});