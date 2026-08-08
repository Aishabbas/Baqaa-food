const http = require('http');

const platforms = ['Swiggy', 'Zomato'];
const itemsList = ['Chicken Burger', 'Peri Peri Fries', 'Virgin Mojito', 'Mexican Chicken Wrap', 'Dynamite Chicken'];
const customers = ['Rahul Sharma', 'Sneha Patel', 'Amit Kumar', 'Priya Singh'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const payload = JSON.stringify({
  platform: getRandom(platforms),
  customer_name: getRandom(customers),
  items: [getRandom(itemsList), getRandom(itemsList)],
  total: Math.floor(Math.random() * 500) + 150
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhooks/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Webhook sent! Server responded with: ${res.statusCode}`);
    console.log(data);
  });
});

req.on('error', error => console.error(error));
req.write(payload);
req.end();
