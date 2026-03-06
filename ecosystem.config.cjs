const path = require('path');

module.exports = {
  apps: [
    {
      name: 'lumenleaf-dashboard',
      script: 'index.js',
      cwd: path.join(__dirname, 'server'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
