const _ = require('lodash');

module.exports = (config = {}) => {
  function affectsProd(resolves) {
    return !(config['prod-only'] && _.every(resolves, { dev: true }));
  }

  function reviewOnly(auditResult) {
    const { actions, advisories } = auditResult;
    const reviewActions = actions.filter(({ action, resolves }) => action === 'review' && affectsProd(resolves));
    const reviewAdvisories = reviewActions.reduce((acc, { resolves }) => {
      const advisoriesToInclude = resolves.reduce((result, { id }) => Object.assign({}, result, { [id]: advisories[id] }), {});
      return Object.assign({}, acc, advisoriesToInclude);
    }, {});
    return { actions: reviewActions, advisories: reviewAdvisories };
  }

  function getHighestSeverity(advisories) {
    for (let severity of ['critical', 'high', 'moderate', 'low']) {
      if (_.find(advisories, { severity })) {
        return severity;
      }
    }
  }

  function highestSeverityOnly(auditResult) {
    const { actions, advisories } = reviewOnly(auditResult);
    const groupedAdvisories = _.groupBy(advisories, 'severity');
    const highestSeverity = getHighestSeverity(advisories);
    const highPriorityAdvisories = _.keyBy(groupedAdvisories[highestSeverity], 'id');
    const highPriorityActions = actions.reduce((acc, action) => {
      const resolvesSevereAdvisory = action.resolves.some(({ id }) => highPriorityAdvisories[id]);
      return resolvesSevereAdvisory ? [].concat(acc, action) : acc;
    }, []);
    return Object.assign({}, auditResult, { actions: highPriorityActions, advisories: highPriorityAdvisories });
  }

  function getAutoFixCount(auditResult) {
    return auditResult.actions.filter(({ action, resolves }) => action !== 'review' && affectsProd(resolves)).length;
  }

  function findRootLibs(resolves) {
    return resolves.reduce((acc, resolve) => {
      return [].concat(acc, resolve.path.split('>')[0]);
    }, []);
  }

  function getMostProblematicDependency(auditResult) {
    const { actions } = reviewOnly(auditResult);
    const rootLibraries = actions.reduce((libs, { resolves }) =>
      [].concat(libs, findRootLibs(resolves)), []);
    return _(rootLibraries)
      .countBy()
      .map((count, lib) => ({ count, name: lib }))
      .orderBy(({ count }) => count, ['desc'])
      .first();
  }

  return function help (npmAuditResultJson) {
    const npmAuditResult = JSON.parse(npmAuditResultJson);
    const auditResult = highestSeverityOnly(npmAuditResult);
    const autoFixCount = getAutoFixCount(npmAuditResult);
    const exitCode = config['exit-zero'] || (!auditResult.actions.length && !autoFixCount) ? 0 : 1;
    return {
      auditResult,
      autoFixCount,
      mostProblematicDependency: getMostProblematicDependency(npmAuditResult),
      exitCode,
    };
  };
};
