module.exports = () => function help(npmAuditResult) {
  return {
    auditResult: npmAuditResult,
    autoFixCount: 0,
    mostProblematicDependency: undefined,
    highestSeverity: 'low',
    exitCode: 0,
  };
};
