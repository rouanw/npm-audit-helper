function canAutoFix({ fixAvailable }) {
  return fixAvailable === true;
}

function getHighestSeverity(vulnerabilities) {
  for (const severity of ['critical', 'high', 'moderate', 'low']) {
    if (Object.keys(vulnerabilities).find((key) => vulnerabilities[key].severity === severity)) {
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

function exitCode(vulnerabilities, config) {
  return config['exit-zero'] || !Object.keys(vulnerabilities).length ? 0 : 1;
}

module.exports = (config = {}) => function help(npmAuditResult) {
  const { vulnerabilities, metadata } = npmAuditResult;
  const autoFixCount = Object.entries(vulnerabilities)
    .filter(([, value]) => canAutoFix(value))
    .length;
  const requireAttention = Object.fromEntries(
    Object.entries(vulnerabilities)
      .filter(([, value]) => !canAutoFix(value))
  );
  const highestSeverity = getHighestSeverity(requireAttention);
  const highestSeverityVulnerabilities = Object.fromEntries(
    Object.entries(requireAttention)
      .filter(([, value]) => value.severity === highestSeverity)
  );

  return {
    auditResult: {
      vulnerabilities: highestSeverityVulnerabilities,
      metadata,
    },
    autoFixCount,
    mostProblematicDependency: getMostProblematicDependency(vulnerabilities),
    highestSeverity,
    exitCode: exitCode(vulnerabilities, config),
  };
};
