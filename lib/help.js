const _ = require('lodash');

function reviewOnly(auditResult) {
  const { actions, advisories } = auditResult;
  const reviewActions = actions.filter(({ action }) => action === 'review');
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
  return auditResult.actions.filter(({ action }) => action !== 'review').length;
}

function getMostProblematicDependency(auditResult) {
  const { actions } = reviewOnly(auditResult);
  const rootLibraries = actions.reduce((libs, { resolves }) =>
    [].concat(
      libs, resolves.reduce((acc, resolve) => {
        return [].concat(acc, resolve.path.split('>')[0]);
      }, [])
    ), [])
  const counts = _(rootLibraries).countBy().map((count, lib) => ({ count, name: lib })).value();
  const sorted = _.orderBy(counts, ({ count }) => count, ['desc']);
  return sorted[0];
}

module.exports = function (npmAuditResultJson) {
  const auditResult = JSON.parse(npmAuditResultJson);
  return {
    auditResult: highestSeverityOnly(auditResult),
    autoFixCount: getAutoFixCount(auditResult),
    mostProblematicDependency: getMostProblematicDependency(auditResult),
  };
};
