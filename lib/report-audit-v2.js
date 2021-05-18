const npmAuditReportV2 = require('npm-audit-report-v2');
const chalk = require('chalk');
const _ = require('lodash');

function automaticFixes(autoFixCount) {
  return autoFixCount
    ? `run ${chalk.yellow('`npm audit fix`')} to automatically fix ${chalk.yellow(autoFixCount)} issues. These should all be non-breaking upgrades, so don't stress.`
    : '';
}

function fixesToReview({ vulnerabilities }, highestSeverity) {
  const numberOfVulnerabilities = Object.keys(vulnerabilities).length;
  if (!numberOfVulnerabilities) {
    return '';
  }
  return `Resolve the ${chalk.green(numberOfVulnerabilities)} ${chalk.green(highestSeverity)} severity issues above and run this command again to move to the next severity.`;
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

function removeEffects(vulnerabilities) {
  return _(vulnerabilities)
    .map(({ effects, ...rest }) => ({ ...rest, effects: [] }))
    .keyBy('name')
    .value();
}

module.exports = async function printFullReport({ auditResult, autoFixCount, mostProblematicDependency, highestSeverity }) {
  const withoutEffects = {
    ...auditResult,
    vulnerabilities: removeEffects(auditResult.vulnerabilities),
  };
  const { report } = await npmAuditReportV2(withoutEffects, {
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
