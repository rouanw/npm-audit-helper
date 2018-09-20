const auditReport = require('npm-audit-report');
const chalk = require('chalk');

function automaticFixes(autoFixCount) {
  return autoFixCount
    ? `run ${chalk.yellow('`npm audit fix`')} to automatically fix ${chalk.yellow(autoFixCount)} issues. These should all be non-breaking upgrades, so don't stress.`
    : '';
}

function fixesToReview({ actions, advisories }) {
  const advisoryIds = Object.keys(advisories);
  if (!actions.length || !advisoryIds.length) {
    return '';
  }
  const { severity } = advisories[advisoryIds[0]];
  return `Resolve the ${chalk.green(actions.length)} ${chalk.green(severity)} severity issues above and run this command again to move to the next severity.`;
}

function mostProblematic(mostProblematicDependency) {
  if (!mostProblematicDependency) {
    return '';
  }
  const { name, count } = mostProblematicDependency;
  return `The most problematic dependency seems to be ${chalk.blue(name)} with ${chalk.blue(count)} issues to manually review.`;
}

module.exports = async function printFullReport ({ auditResult, autoFixCount, mostProblematicDependency }) {
  const { report } = await auditReport(auditResult, {
    reporter: 'detail',
    withColor: true,
    withUnicode: true,
  });

  const hints = []
    .concat(automaticFixes(autoFixCount))
    .concat(fixesToReview(auditResult))
    .concat(mostProblematic(mostProblematicDependency))
    .filter(Boolean);

  const help = hints.length
    ? `

    ${chalk.green('=== A little bit of help ===')}

    Where to start:
    ${hints.reduce((acc, hint) => `${acc}
    - ${hint}
    `, '')}
    `
    : '';

  return `${report}${help}`;
}
