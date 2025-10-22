const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000,
  headers: {
    'User-Agent': 'Docker-Healthcheck/1.0'
  }
};

const healthCheck = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);

  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('timeout', () => {
  console.log('Health check timeout');
  healthCheck.destroy();
  process.exit(1);
});

healthCheck.on('error', (err) => {
  console.log('Health check error:', err.message);
  process.exit(1);
});

healthCheck.end();