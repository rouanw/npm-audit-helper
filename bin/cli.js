#!/usr/bin/env node

const getStdin = require('get-stdin');
const options = require('minimist')(process.argv.slice(2));
const npmAuditReportV2 = require('npm-audit-report-v2');
const helpAuditV1 = require('../lib/help');
const helpAuditV2 = require('../lib/help-audit-v2');
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
    const auditOutput = JSON.parse(stdin);
    const newTreeFormat = auditOutput.auditReportVersion && auditOutput.auditReportVersion >= 2;
    let reporter;
    let helper;

    if (newTreeFormat) {
      reporter = (({ auditResult }) => console.log('\n*** NPM v7 is not supported yet, below is the raw output from `npm audit` ***\n') || npmAuditReportV2(auditResult).report);
      helper = helpAuditV2;
    } else {
      reporter = report;
      helper = helpAuditV1;
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
