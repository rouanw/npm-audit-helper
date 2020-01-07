const _ = require('lodash');

module.exports = (config = {}) => {
  function affectsProd(resolves) {
    return !(config['prod-only'] && resolves.every(({ dev }) => dev));
  }

  function requireAttention(auditResult) {
    const { actions, advisories } = auditResult;
    const reviewActions = actions.filter(({ action, resolves, isMajor }) => (action === 'review' || isMajor) && affectsProd(resolves));
    const reviewAdvisories = reviewActions.reduce((acc, { resolves }) => {
      const advisoriesToInclude = resolves.reduce((result, { id }) => ({ ...result, [id]: advisories[id] }), {});
      return { ...acc, ...advisoriesToInclude };
    }, {});
    return { ...auditResult, actions: reviewActions, advisories: reviewAdvisories };
  }

  function getHighestSeverity({ advisories }) {
    for (const severity of ['critical', 'high', 'moderate', 'low']) {
      if (Object.keys(advisories).find((key) => advisories[key].severity === severity)) {
        return severity;
      }
    }
  }

  function filterAuditResultsBySeverity(auditResult, highestSeverity) {
    const { actions, advisories } = auditResult;
    const groupedAdvisories = _.groupBy(advisories, 'severity');
    const advisoriesForSeverity = _.keyBy(groupedAdvisories[highestSeverity], 'id');
    const actionsForSeverity = actions.reduce((acc, action) => {
      const resolvesSevereAdvisory = action.resolves.some(({ id }) => advisoriesForSeverity[id]);
      return resolvesSevereAdvisory ? [].concat(acc, action) : acc;
    }, []);
    return { ...auditResult, actions: actionsForSeverity, advisories };
  }

  function getAutoFixCount(auditResult) {
    return auditResult.actions.filter(({ action, resolves, isMajor }) => action !== 'review'
      && !isMajor
      && affectsProd(resolves)).length;
  }

  function findRootLibs(resolves) {
    return resolves.reduce((acc, resolve) => [].concat(acc, resolve.path.split('>')[0]), []);
  }

  function getMostProblematicDependency({ actions }) {
    const rootLibraries = actions.reduce((libs, { resolves }) => [].concat(libs, findRootLibs(resolves)), []);
    return _(rootLibraries)
      .countBy()
      .map((count, lib) => ({ count, name: lib }))
      .orderBy(({ count }) => count, ['desc'])
      .first();
  }

  return function help(npmAuditResultJson) {
    const npmAuditResult = JSON.parse(npmAuditResultJson);
    const resultsThatRequireAttention = requireAttention(npmAuditResult);
    const highestSeverity = getHighestSeverity(resultsThatRequireAttention);
    const auditResult = filterAuditResultsBySeverity(resultsThatRequireAttention, highestSeverity);
    const autoFixCount = getAutoFixCount(npmAuditResult);
    const exitCode = config['exit-zero'] || (!auditResult.actions.length && !autoFixCount) ? 0 : 1;
    return {
      auditResult,
      autoFixCount,
      mostProblematicDependency: getMostProblematicDependency(resultsThatRequireAttention),
      highestSeverity,
      exitCode,
    };
  };
};
