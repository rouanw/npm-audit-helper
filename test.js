const test = require('tape');
const Help = require('./lib/help');

const advisories = {
  577: {
    id: 577,
    overview: 'avedep can tickle you',
    recommendation: 'upgrade avedep sometime please',
    severity: 'low',
  },
  123: {
    id: 123,
    overview: 'baddep2000 can DOS you',
    recommendation: 'upgrade baddep now please',
    severity: 'high',
  },
  456: {
    id: 456,
    overview: 'baddep3000 can DOS you',
    recommendation: 'upgrade baddep now please',
    severity: 'high',
  },
  999: {
    id: 999,
    overview: 'baddep4000 can DOS you',
    recommendation: 'upgrade baddep now please',
    severity: 'high',
  },
};

function anAction(overrides = {}) {
  const defaults = {
    action: 'review',
    module: 'somedep',
    resolves: [{
      id: 123,
      path: 'some-lib>another-lib>somedep',
    }],
  };
  return Object.assign({}, defaults, overrides);
}

function aResolve(overrides = {}) {
  const defaults = {
    id: 123,
    path: 'some-lib>another-lib>avedep',
    dev: false,
  };
  return Object.assign({}, defaults, overrides);
}

function oneResolve(overrides) {
  return [aResolve(overrides)];
}

const help = Help();

test('should filter output by severity', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 577 }),
      }),
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 123 }),
      }),
    ],
    advisories,
  });
  const { auditResult } = help(input);
  t.equal(auditResult.actions.length, 1);
  t.equal(auditResult.actions[0].resolves[0].id, 123);
  t.end();
});

test('should only include actions for review', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'update',
        resolves: oneResolve({ id: 999 }),
      }),
      anAction({
        action: 'install',
        resolves: oneResolve({ id: 456 }),
      }),
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 456 }),
      }),
    ],
    advisories,
  });
  const { auditResult } = help(input);
  t.equal(auditResult.actions.length, 1);
  t.equal(auditResult.actions[0].resolves[0].id, 456);
  t.end();
});

test('should move to the next severity if the highest severity has no actions for review', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 577 }),
      }),
      anAction({
        action: 'install',
        resolves: oneResolve({ id: 123 }),
      }),
    ],
    advisories,
  });
  const { auditResult } = help(input);
  t.equal(auditResult.actions.length, 1);
  t.equal(auditResult.actions[0].resolves[0].id, 577);
  t.end();
});

test('should return a count of auto fixes', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 577 }),
      }),
      anAction({
        action: 'install',
        resolves: oneResolve({ id: 123 }),
      }),
    ],
    advisories,
  });
  const { autoFixCount } = help(input);
  t.equal(autoFixCount, 1);
  t.end();
});

test('should not include major bumps in the auto fix count', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'install',
        isMajor: true,
        resolves: oneResolve({ id: 577 }),
      }),
      anAction({
        action: 'install',
        resolves: oneResolve({ id: 123 }),
      }),
    ],
    advisories,
  });
  const { autoFixCount } = help(input);
  t.equal(autoFixCount, 1);
  t.end();
});

test('should return the most problematic dependency', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 577, path: 'thislib>alib>vulnlib' }),
      }),
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 456, path: 'thislib>blib>vulnlib' }),
      }),
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 999, path: 'clib>vulnlib' }),
      }),
    ],
    advisories,
  });
  const { mostProblematicDependency } = help(input);
  t.equal(mostProblematicDependency.name, 'thislib');
  t.equal(mostProblematicDependency.count, 2);
  t.end();
});

test('should return a zero exit code if no actions remain', (t) => {
  const input = JSON.stringify({
    actions: [],
    advisories,
  });
  const { exitCode } = help(input);
  t.equal(exitCode, 0);
  t.end();
});

test('should return a non-zero exit code if some actions for review remain', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
      }),
    ],
    advisories,
  });
  const { exitCode } = help(input);
  t.equal(exitCode, 1);
  t.end();
});

test('should return a zero exit code if requested', (t) => {
  const helpWithZeroExit = Help({ 'exit-zero': true });
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'install',
      }),
    ],
    advisories,
  });
  const { exitCode } = helpWithZeroExit(input);
  t.equal(exitCode, 0);
  t.end();
});

test('should return a non-zero exit code if some non-review actions remain', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'install',
      }),
    ],
    advisories,
  });
  const { exitCode } = help(input);
  t.equal(exitCode, 1);
  t.end();
});

test('should ignore dev dependencies if requested', (t) => {
  const helpWithProdOnly = Help({ 'prod-only': true });
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
        resolves: oneResolve({ dev: true }),
      }),
      anAction({
        action: 'install',
        resolves: oneResolve({ dev: true }),
      }),
    ],
    advisories,
  });
  const { autoFixCount, auditResult, mostProblematicDependency } = helpWithProdOnly(input);
  t.equal(autoFixCount, 0);
  t.equal(auditResult.actions.length, 0);
  t.equal(mostProblematicDependency, undefined);
  t.end();
});

test('should only ignore dev dependencies', (t) => {
  const helpWithProdOnly = Help({ 'prod-only': true });
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'review',
        resolves: [aResolve({ dev: false }), aResolve({ dev: true })],
      }),
      anAction({
        action: 'install',
        resolves: [aResolve({ dev: false }), aResolve({ dev: true })],
      }),
    ],
    advisories,
  });
  const { autoFixCount, auditResult, mostProblematicDependency } = helpWithProdOnly(input);
  t.equal(autoFixCount, 1);
  t.equal(auditResult.actions.length, 1);
  t.notEqual(mostProblematicDependency, undefined);
  t.end();
});
