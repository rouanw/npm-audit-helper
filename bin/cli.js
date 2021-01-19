#!/usr/bin/env node

const getStdin = require('get-stdin');
const options = require('minimist')(process.argv.slice(2));
const help = require('../lib/help');
const report = require('../lib/report');

const defaults = {
  'exit-zero': false,
  'prod-only': false,
};

const config = { ...defaults, ...options };

/* eslint-disable no-console */
(async function cli() {
  try {
    const stdin = await getStdin();
    const result = help(config)(stdin);
    const theReport = await report(result);
    console.log(theReport);
    process.exit(result.exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}());
/* eslint-enable no-console */
