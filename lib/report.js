const auditReport = require('npm-audit-report');
const chalk = require('chalk');

function automaticFixes(autoFixCount) {
  return autoFixCount
    ? `run ${chalk.yellow('`npm audit fix`')} to automatically fix ${chalk.yellow(autoFixCount)} issues. These should all be non-breaking upgrades, so don't stress.`
    : '';
}

function fixesToReview({ actions, advisories }, highestSeverity) {
  const advisoryIds = Object.keys(advisories);
  if (!actions.length || !advisoryIds.length) {
    return '';
  }
  return `Resolve the ${chalk.green(actions.length)} ${chalk.green(highestSeverity)} severity issues above and run this command again to move to the next severity.`;
}

function mostProblematic(mostProblematicDependency) {
  if (!mostProblematicDependency) {
    return '';
  }
  const { name, count } = mostProblematicDependency;
  return count && count > 2
    ? `The most problematic dependency seems to be ${chalk.blue(name)} with ${chalk.blue(count)} issue${count ? 's' : ''} that need your attention.`
    : '';
}

module.exports = async function printFullReport({ auditResult, autoFixCount, mostProblematicDependency, highestSeverity }) {
  const { report } = await auditReport(auditResult, {
    reporter: 'detail',
    withColor: true,
    withUnicode: true,
  });

  const hints = []
    .concat(automaticFixes(autoFixCount))
    .concat(fixesToReview(auditResult, highestSeverity))
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
};
