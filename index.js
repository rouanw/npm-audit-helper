const getStdin = require('get-stdin');
const help = require('./lib/help');
 
getStdin().then(help).then(console.log);
