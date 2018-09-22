#!/usr/bin/env node

const getStdin = require('get-stdin');
const options = require('minimist')(process.argv.slice(2));
const help = require('../lib/help');
const report = require('../lib/report');

const defaults = {
  'exit-zero': false,
  'prod-only': false,
};

const config = Object.assign({}, defaults, options);

getStdin()
  .then(help(config))
  .then((result) => {
    return report(result)
      .then((theReport) => {
        console.log(theReport);
        process.exit(result.exitCode);
      });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
