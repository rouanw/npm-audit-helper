const _ = require('lodash');

function devOnly({ resolves }) {
  return _.every(resolves, { dev: true });
}

const reviewOnly = (config) => (auditResult) => {
  const { actions, advisories } = auditResult;
  const reviewActions = actions.filter((action) =>
    action.action === 'review'
    && (!config['prod-only'] || !devOnly(action)));
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

const highestSeverityOnly = (config) => (auditResult) => {
  const { actions, advisories } = reviewOnly(config)(auditResult);
  const groupedAdvisories = _.groupBy(advisories, 'severity');
  const highestSeverity = getHighestSeverity(advisories);
  const highPriorityAdvisories = _.keyBy(groupedAdvisories[highestSeverity], 'id');
  const highPriorityActions = actions.reduce((acc, action) => {
    const resolvesSevereAdvisory = action.resolves.some(({ id }) => highPriorityAdvisories[id]);
    return resolvesSevereAdvisory ? [].concat(acc, action) : acc;
  }, []);
  return Object.assign({}, auditResult, { actions: highPriorityActions, advisories: highPriorityAdvisories });
}

const getAutoFixCount = (config) => (auditResult) => {
  return auditResult.actions.filter((action) =>
    action.action !== 'review'
    && (!config['prod-only'] || !devOnly(action))).length;
}

function findRootLibs(resolves) {
  return resolves.reduce((acc, resolve) => {
    return [].concat(acc, resolve.path.split('>')[0]);
  }, []);
}

const getMostProblematicDependency = (config  ) => (auditResult) => {
  const { actions } = reviewOnly(config)(auditResult);
  const rootLibraries = actions.reduce((libs, { resolves }) =>
    [].concat(libs, findRootLibs(resolves)), []);
  return _(rootLibraries)
    .countBy()
    .map((count, lib) => ({ count, name: lib }))
    .orderBy(({ count }) => count, ['desc'])
    .first();
}

module.exports = (config = {}) => (npmAuditResultJson) => {
  const npmAuditResult = JSON.parse(npmAuditResultJson);
  const auditResult = highestSeverityOnly(config)(npmAuditResult);
  const autoFixCount = getAutoFixCount(config)(npmAuditResult);
  const exitCode = config['exit-zero'] || (!auditResult.actions.length && !autoFixCount) ? 0 : 1;
  return {
    auditResult,
    autoFixCount,
    mostProblematicDependency: getMostProblematicDependency(config)(npmAuditResult),
    exitCode,
  };
};
