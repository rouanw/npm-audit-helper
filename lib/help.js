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
  const groupedAdvisories = _.groupBy(advisories, 'severity');
  const highestSeverity = getHighestSeverity(advisories);
  const highPriorityAdvisories = _.keyBy(groupedAdvisories[highestSeverity], 'id');
  const highPriorityActions = actions.reduce((acc, action) => {
    const resolvesSevereAdvisory = action.resolves.some(({ id }) => highPriorityAdvisories[id]);
    return resolvesSevereAdvisory ? [].concat(acc, action) : acc;
  }, []);
  return Object.assign({}, auditResult, { actions: highPriorityActions, advisories: highPriorityAdvisories });
}

module.exports = function (npmAuditResultJson) {
  const auditResult = JSON.parse(npmAuditResultJson);
  return highestSeverityOnly(auditResult);
};
