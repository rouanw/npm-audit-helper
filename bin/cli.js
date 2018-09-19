#!/usr/bin/env node

const getStdin = require('get-stdin');
const help = require('../lib/help');
const report = require('../lib/report');

getStdin()
  .then(help)
  .then((result) => {
    return report(result)
      .then((theReport) => {
        console.log(theReport);
        process.exit(result.exitCode);
      });
  })
  .catch(console.error);
