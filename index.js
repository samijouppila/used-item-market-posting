const server = require('./server');
const mode = process.env.MODE || 'production'
server.start(mode);