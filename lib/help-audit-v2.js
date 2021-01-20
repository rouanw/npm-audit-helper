function getHighestSeverity({ vulnerabilities }) {
  for (const severity of ['critical', 'high', 'moderate', 'low']) {
    if (Object.keys(vulnerabilities).find((key) => vulnerabilities[key].severity === severity)) {
      return severity;
    }
  }
}

function notFixable({ fixAvailable }) {
  return fixAvailable !== true;
}

module.exports = () => function help(npmAuditResult) {
  const highestSeverity = getHighestSeverity(npmAuditResult);
  const vulnerabilities = Object.fromEntries(
    Object.entries(npmAuditResult.vulnerabilities)
      .filter(([, value]) => value.severity === highestSeverity && notFixable(value))
  );

  return {
    auditResult: {
      vulnerabilities,
    },
    autoFixCount: 0,
    mostProblematicDependency: undefined,
    highestSeverity: 'low',
    exitCode: 0,
  };
};
