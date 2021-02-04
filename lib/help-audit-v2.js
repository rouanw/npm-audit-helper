function canAutoFix({ fixAvailable }) {
  return fixAvailable === true;
}

function getHighestSeverity({ vulnerabilities }) {
  for (const severity of ['critical', 'high', 'moderate', 'low']) {
    if (Object.keys(vulnerabilities).find((key) => !canAutoFix(vulnerabilities[key]) && vulnerabilities[key].severity === severity)) {
      return severity;
    }
  }
}

module.exports = () => function help(npmAuditResult) {
  const highestSeverity = getHighestSeverity(npmAuditResult);
  const vulnerabilities = Object.fromEntries(
    Object.entries(npmAuditResult.vulnerabilities)
      .filter(([, value]) => value.severity === highestSeverity && !canAutoFix(value))
  );
  const autoFixCount = Object.entries(npmAuditResult.vulnerabilities)
    .filter(([, value]) => canAutoFix(value))
    .length;

  return {
    auditResult: {
      vulnerabilities,
    },
    autoFixCount,
    mostProblematicDependency: undefined,
    highestSeverity,
    exitCode: 0,
  };
};
