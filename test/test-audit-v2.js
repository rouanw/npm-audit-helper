const test = require('tape');
const Help = require('../lib/help-audit-v2');

const help = Help();

const exampleAuditJson = {
  vulnerabilities: {
    joi: {
      name: 'joi',
      severity: 'moderate',
      via: [
        'hoek',
      ],
      effects: [],
      range: '0.0.2 - 8.0.5',
      nodes: [
        'node_modules/joi',
      ],
      fixAvailable: {
        name: 'joi',
        version: '17.3.0',
        isSemVerMajor: true,
      },
    },
    lodash: {
      name: 'lodash',
      severity: 'high',
      via: [
        {
          source: 1065,
          name: 'lodash',
          dependency: 'lodash',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/1065',
          severity: 'high',
          range: '<4.17.12',
        },
        {
          source: 1523,
          name: 'lodash',
          dependency: 'lodash',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/1523',
          severity: 'low',
          range: '<4.17.19',
        },
        {
          source: 577,
          name: 'lodash',
          dependency: 'lodash',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/577',
          severity: 'low',
          range: '<4.17.5',
        },
        {
          source: 782,
          name: 'lodash',
          dependency: 'lodash',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/782',
          severity: 'high',
          range: '<4.17.11',
        },
      ],
      effects: [],
      range: '<=4.17.18',
      nodes: [
        'node_modules/lodash',
      ],
      fixAvailable: {
        name: 'lodash',
        version: '4.17.20',
        isSemVerMajor: true,
      },
    },
  },
};

const buildAuditResultFixture = (vulnerabilities) => ({ vulnerabilities });

test('should filter output by severity', (t) => {
  const input = { ...exampleAuditJson };
  const { auditResult } = help(input);
  t.equal(Object.keys(auditResult.vulnerabilities).length, 1);
  t.ok(auditResult.vulnerabilities.lodash);
  t.end();
});

test('should not include vulnerabilities that can be fixed with npm audit fix', (t) => {
  const input = buildAuditResultFixture({
    minimist: {
      name: 'minimist',
      severity: 'low',
      via: [
        {
          source: 1179,
          name: 'minimist',
          dependency: 'minimist',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/1179',
          severity: 'low',
          range: '<0.2.1 || >=1.0.0 <1.2.3',
        },
      ],
      effects: [
        'optimist',
      ],
      range: '<0.2.1 || >=1.0.0 <1.2.3',
      nodes: [
        'node_modules/minimist',
      ],
      fixAvailable: true,
    },
    optimist: {
      name: 'optimist',
      severity: 'low',
      via: [
        'minimist',
      ],
      effects: [
        'handlebars',
      ],
      range: '>=0.6.0',
      nodes: [
        'node_modules/optimist',
      ],
      fixAvailable: true,
    },
    joi: {
      name: 'joi',
      severity: 'low',
      via: [
        'hoek',
      ],
      effects: [],
      range: '0.0.2 - 8.0.5',
      nodes: [
        'node_modules/joi',
      ],
      fixAvailable: {
        name: 'joi',
        version: '17.3.0',
        isSemVerMajor: true,
      },
    },
  });
  const { auditResult } = help(input);
  t.equal(Object.keys(auditResult.vulnerabilities).length, 1);
  t.notOk(auditResult.vulnerabilities.optimist);
  t.notOk(auditResult.vulnerabilities.minimist);
  t.ok(auditResult.vulnerabilities.joi);
  t.end();
});

/* eslint-disable no-unused-vars */
test.skip('should include actions for update or install when they include major semver bumps', (t) => {
});

test('should move to the next severity if the highest severity has no actions for review', (t) => {
  const input = buildAuditResultFixture({
    minimist: {
      name: 'minimist',
      severity: 'high',
      via: [
        {
          source: 1179,
          name: 'minimist',
          dependency: 'minimist',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/1179',
          severity: 'high',
          range: '<0.2.1 || >=1.0.0 <1.2.3',
        },
      ],
      effects: [
        'optimist',
      ],
      range: '<0.2.1 || >=1.0.0 <1.2.3',
      nodes: [
        'node_modules/minimist',
      ],
      fixAvailable: true,
    },
    optimist: {
      name: 'optimist',
      severity: 'high',
      via: [
        'minimist',
      ],
      effects: [
        'handlebars',
      ],
      range: '>=0.6.0',
      nodes: [
        'node_modules/optimist',
      ],
      fixAvailable: true,
    },
    joi: {
      name: 'joi',
      severity: 'low',
      via: [
        'hoek',
      ],
      effects: [],
      range: '0.0.2 - 8.0.5',
      nodes: [
        'node_modules/joi',
      ],
      fixAvailable: {
        name: 'joi',
        version: '17.3.0',
        isSemVerMajor: true,
      },
    },
  });
  const { auditResult } = help(input);
  t.equal(Object.keys(auditResult.vulnerabilities).length, 1);
  t.notOk(auditResult.vulnerabilities.optimist);
  t.notOk(auditResult.vulnerabilities.minimist);
  t.ok(auditResult.vulnerabilities.joi);
  t.end();
});

test('should return a count of auto fixes', (t) => {
  const input = buildAuditResultFixture({
    minimist: {
      name: 'minimist',
      severity: 'high',
      via: [
        {
          source: 1179,
          name: 'minimist',
          dependency: 'minimist',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/1179',
          severity: 'high',
          range: '<0.2.1 || >=1.0.0 <1.2.3',
        },
      ],
      effects: [
        'optimist',
      ],
      range: '<0.2.1 || >=1.0.0 <1.2.3',
      nodes: [
        'node_modules/minimist',
      ],
      fixAvailable: true,
    },
    optimist: {
      name: 'optimist',
      severity: 'high',
      via: [
        'minimist',
      ],
      effects: [
        'handlebars',
      ],
      range: '>=0.6.0',
      nodes: [
        'node_modules/optimist',
      ],
      fixAvailable: true,
    },
    joi: {
      name: 'joi',
      severity: 'low',
      via: [
        'hoek',
      ],
      effects: [],
      range: '0.0.2 - 8.0.5',
      nodes: [
        'node_modules/joi',
      ],
      fixAvailable: {
        name: 'joi',
        version: '17.3.0',
        isSemVerMajor: true,
      },
    },
  });
  const { autoFixCount } = help(input);
  t.equal(autoFixCount, 2);
  t.end();
});

test.skip('should return the most problematic dependency', (t) => {
});

test.skip('should not include actions for update or install when calculating the most problematic dependency', (t) => {
});

test.skip('should include actions for major bumps when calculating the most problematic dependency', (t) => {
});

test.skip('should return a zero exit code if no actions remain', (t) => {
});

test.skip('should return a non-zero exit code if some actions for review remain', (t) => {
});

test.skip('should return a zero exit code if requested', (t) => {
});

test.skip('should return a non-zero exit code if some non-review actions remain', (t) => {
});

test.skip('should ignore dev dependencies if requested', (t) => {
});

test.skip('should only ignore dev dependencies', (t) => {
});

test('should return the highest severity', (t) => {
  const input = buildAuditResultFixture({
    minimist: {
      name: 'minimist',
      severity: 'high',
      via: [
        {
          source: 1179,
          name: 'minimist',
          dependency: 'minimist',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/1179',
          severity: 'high',
          range: '<0.2.1 || >=1.0.0 <1.2.3',
        },
      ],
      effects: [
        'optimist',
      ],
      range: '<0.2.1 || >=1.0.0 <1.2.3',
      nodes: [
        'node_modules/minimist',
      ],
      fixAvailable: true,
    },
    optimist: {
      name: 'optimist',
      severity: 'high',
      via: [
        'minimist',
      ],
      effects: [
        'handlebars',
      ],
      range: '>=0.6.0',
      nodes: [
        'node_modules/optimist',
      ],
      fixAvailable: true,
    },
    joi: {
      name: 'joi',
      severity: 'low',
      via: [
        'hoek',
      ],
      effects: [],
      range: '0.0.2 - 8.0.5',
      nodes: [
        'node_modules/joi',
      ],
      fixAvailable: {
        name: 'joi',
        version: '17.3.0',
        isSemVerMajor: true,
      },
    },
  });
  const { highestSeverity } = help(input);
  t.equal(highestSeverity, 'low');
  t.end();
});
