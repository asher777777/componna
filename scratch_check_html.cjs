const https = require('https');

https.get('https://mlea.kosun.pro/kosass/srv-3', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    const matches = data.match(/\/assets\/[^\"]+\.js/g);
    console.log('SCRIPTS IN HTML:', matches);
  });
}).on('error', err => console.error(err));
