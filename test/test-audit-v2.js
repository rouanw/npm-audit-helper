const test = require('tape');
const Help = require('../lib/help-audit-v2');

const help = Help();

const auditJson = {
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

test('should filter output by severity', (t) => {
  const input = { ...auditJson };
  const { auditResult } = help(input);
  t.equal(Object.keys(auditResult.vulnerabilities).length, 1);
  t.ok(auditResult.vulnerabilities.lodash);
  t.end();
});

/* eslint-disable no-unused-vars */
test.skip('should not include actions for update or install', (t) => {
});

test.skip('should include actions for update or install when they include major semver bumps', (t) => {
});

test.skip('should move to the next severity if the highest severity has no actions for review', (t) => {
});

test.skip('should not throw away advisories for lower priority resolves in actions that resolve other high priority advisories', (t) => {
});

test.skip('should return a count of auto fixes', (t) => {
});

test.skip('should not include major bumps in the auto fix count', (t) => {
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

test.skip('should return the highest severity', (t) => {
});
