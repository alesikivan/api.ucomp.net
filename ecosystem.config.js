module.exports = {
  apps : [{
    script: './ucomp.server.js',
    env : {
      'PORT': 80,
      'NODE_ENV' : 'production'
    }
  }],

  deploy : {
    production : {
      user : 'root',
      host : ['45.93.136.98'],
      ref  : 'origin/main',
      repo : 'https://github.com/alesikivan/api.ucomp.net',
      path : '/root/apps/ucomp-api',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 delete ucomp.server && pm2 start ucomp.server.js --name ucomp.server && pm2 save --force',
      'pre-setup': ''
    }
  }
};
