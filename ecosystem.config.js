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
      host : ['77.37.49.238'],
      ref  : 'origin/main',
      repo : 'https://github.com/alesikivan/api.ucomp.net',
      path : '/root/apps/api.ucomp.net',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 delete ucomp.server && pm2 start ucomp.server.js --name ucomp.server && pm2 save --force',
      'pre-setup': ''
    }
  }
};
