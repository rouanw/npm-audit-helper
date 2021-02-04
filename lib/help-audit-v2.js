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

function getMostProblematicDependency(vulnerabilities) {
  const counts = Object.entries(vulnerabilities)
    .map(([name, value]) => ({ name, count: value.via ? value.via.length : 0 }));
  return counts.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }
    if (a.count < b.count) {
      return 1;
    }
    return 0;
  })[0];
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
    mostProblematicDependency: getMostProblematicDependency(vulnerabilities),
    highestSeverity,
    exitCode: 0,
  };
};
