const _ = require('lodash');

function getHighestSeverity(advisories) {
  for (let severity of ['critical', 'high', 'moderate', 'low']) {
    if (_.find(advisories, { severity })) {
      return severity;
    }
  }
}

function highestSeverityOnly(auditResult) {
  const { actions, advisories } = auditResult;
  const reviewActions = actions.filter(({ action }) => action === 'review');
  const reviewAdvisories = reviewActions.reduce((acc, { resolves }) => {
    const advisoriesToInclude = resolves.reduce((result, { id }) => Object.assign({}, result, { [id]: advisories[id] }), {});
    return Object.assign({}, acc, advisoriesToInclude);
  }, {});
  const groupedAdvisories = _.groupBy(reviewAdvisories, 'severity');
  const highestSeverity = getHighestSeverity(reviewAdvisories);
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

module.exports = function (npmAuditResultJson) {
  const auditResult = JSON.parse(npmAuditResultJson);
  return {
    auditResult: highestSeverityOnly(auditResult),
    autoFixCount: getAutoFixCount(auditResult),
  };
};
