#!/usr/bin/env node

const getStdin = require('get-stdin');
const help = require('../lib/help');
const report = require('../lib/report');
 
getStdin()
  .then(help)
  .then(report)
  .then(console.log)
  .catch(console.error);
