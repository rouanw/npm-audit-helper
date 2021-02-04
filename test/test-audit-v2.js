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

test('should return the most problematic dependency as the one with the most vulnerabilities', (t) => {
  const input = buildAuditResultFixture({
    handlebars: {
      name: 'handlebars',
      severity: 'high',
      via: [
        {
          source: 61,
          name: 'handlebars',
          dependency: 'handlebars',
          title: 'Cross-Site Scripting',
          url: 'https://npmjs.com/advisories/61',
          severity: 'high',
          range: '<4.0.0',
        },
        {
          source: 755,
          name: 'handlebars',
          dependency: 'handlebars',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/755',
          severity: 'high',
          range: '<=4.0.13 || >=4.1.0 <4.1.2',
        },
        'optimist',
      ],
      effects: [],
      range: '<=4.7.3',
      nodes: [
        'node_modules/handlebars',
      ],
      fixAvailable: {
        name: 'handlebars',
        version: '4.7.6',
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
      fixAvailable: {
        name: 'handlebars',
        version: '4.7.6',
        isSemVerMajor: true,
      },
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
        'node_modules/handlebars/node_modules/optimist',
      ],
      fixAvailable: {
        name: 'handlebars',
        version: '4.7.6',
        isSemVerMajor: true,
      },
    },
  });
  const { mostProblematicDependency } = help(input);
  t.equal(mostProblematicDependency.name, 'lodash');
  t.equal(mostProblematicDependency.count, 4);
  t.end();
});

test('should return the most problematic dependency as the one with the most vulnerabilities, irrespective of severity', (t) => {
  const input = buildAuditResultFixture({
    handlebars: {
      name: 'handlebars',
      severity: 'critical',
      via: [
        {
          source: 61,
          name: 'handlebars',
          dependency: 'handlebars',
          title: 'Cross-Site Scripting',
          url: 'https://npmjs.com/advisories/61',
          severity: 'critical',
          range: '<4.0.0',
        },
        {
          source: 755,
          name: 'handlebars',
          dependency: 'handlebars',
          title: 'Prototype Pollution',
          url: 'https://npmjs.com/advisories/755',
          severity: 'critical',
          range: '<=4.0.13 || >=4.1.0 <4.1.2',
        },
        'optimist',
      ],
      effects: [],
      range: '<=4.7.3',
      nodes: [
        'node_modules/handlebars',
      ],
      fixAvailable: {
        name: 'handlebars',
        version: '4.7.6',
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
      fixAvailable: {
        name: 'handlebars',
        version: '4.7.6',
        isSemVerMajor: true,
      },
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
        'node_modules/handlebars/node_modules/optimist',
      ],
      fixAvailable: {
        name: 'handlebars',
        version: '4.7.6',
        isSemVerMajor: true,
      },
    },
  });
  const { mostProblematicDependency } = help(input);
  t.equal(mostProblematicDependency.name, 'lodash');
  t.equal(mostProblematicDependency.count, 4);
  t.end();
});

test('should return a zero exit code if no actions remain', (t) => {
  const input = buildAuditResultFixture({});
  const { exitCode } = help(input);
  t.equal(exitCode, 0);
  t.end();
});

test('should return a non-zero exit code if some vulnerabilities remain', (t) => {
  const { exitCode } = help(exampleAuditJson);
  t.equal(exitCode, 1);
  t.end();
});

test('should return a zero exit code if requested', (t) => {
  const helpWithZeroExit = Help({ 'exit-zero': true });
  const { exitCode } = helpWithZeroExit(exampleAuditJson);
  t.equal(exitCode, 0);
  t.end();
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
