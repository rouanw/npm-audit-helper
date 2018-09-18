const auditReport = require('npm-audit-report');

function automaticFixes(autoFixCount) {
  return autoFixCount
    ? `run \`npm audit fix\` to automatically fix ${autoFixCount} issues. These should all be non-breaking upgrades, so don't stress.`
    : '';
}

function fixesToReview({ actions, advisories }) {
  const advisoryIds = Object.keys(advisories);
  if (!actions.length || !advisoryIds.length) {
    return '';
  }
  const { severity } = advisories[advisoryIds[0]];
  return `Resolve the ${actions.length} ${severity} severity issues above and run this command again to move to the next severity`;
}

module.exports = async function printFullReport ({ auditResult, autoFixCount }) {
  const { report } = await auditReport(auditResult, {
    reporter: 'detail',
    withColor: true,
    withUnicode: true,
  });

  const hints = []
    .concat(automaticFixes(autoFixCount))
    .concat(fixesToReview(auditResult))
    .filter(Boolean);

  return `${report}

  === A little bit of help ===

  Where to start:
  ${hints.reduce((acc, hint) => `${acc}
  - ${hint}`, '')}
  `;
}
