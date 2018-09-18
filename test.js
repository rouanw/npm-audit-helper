const test = require('tape');
const help = require('./lib/help');

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

function oneResolve(overrides = {}) {
  const defaults = {
    id: 123,
    path: 'some-lib>another-lib>avedep',
  };
  return [Object.assign({}, defaults, overrides)];
}

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
  const result = help(input);
  t.equal(result.actions.length, 1);
  t.equal(result.actions[0].resolves[0].id, 123);
  t.end();
});

test('should only include actions for review', (t) => {
  const input = JSON.stringify({
    actions: [
      anAction({
        action: 'update',
        resolves: oneResolve(),
      }),
      anAction({
        action: 'install',
        resolves: oneResolve(),
      }),
      anAction({
        action: 'review',
        resolves: oneResolve({ id: 456 }),
      }),
    ],
    advisories,
  });
  const result = help(input);
  t.equal(result.actions.length, 1);
  t.equal(result.actions[0].resolves[0].id, 456);
  t.end();
});
