const auditReport = require('npm-audit-report');

module.exports = async function printFullReport (auditResult) {
  const { report } = await auditReport(auditResult, {
    reporter: 'detail',
    withColor: true,
    withUnicode: true,
  });
  return report;
}
