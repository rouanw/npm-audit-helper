#!/usr/bin/env node

const getStdin = require('get-stdin');
const options = require('minimist')(process.argv.slice(2));
const reportAuditV2 = require('../lib/report-audit');
const helpAuditV2 = require('../lib/help-audit');

const defaults = {
  'exit-zero': false,
  'prod-only': false,
};

const config = { ...defaults, ...options };

/* eslint-disable no-console */
(async function cli() {
  try {
    const stdin = await getStdin();
    const auditOutput = JSON.parse(stdin);
    const newTreeFormat = auditOutput.auditReportVersion && auditOutput.auditReportVersion >= 2;
    let reporter;
    let helper;

    if (newTreeFormat) {
      reporter = reportAuditV2;
      helper = helpAuditV2;
    } else {
      console.error('Versions <7 of npm are no longer supported. For npm 6 support, please use npm-audit-helper@3.1.1.');
      process.exit(1);
    }

    const result = helper(config)(auditOutput);
    const theReport = await reporter(result);
    console.log(theReport);
    process.exit(result.exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}());
/* eslint-enable no-console */
