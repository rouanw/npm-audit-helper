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

test('should filter output by severity', (t) => {
  const input = JSON.stringify({
    actions: [
      {
        action: 'review',
        module: 'avedep',
        resolves: [
          {
            id: 577,
            path: 'some-lib>another-lib>avedep',
            dev: false,
            optional: false,
            bundled: false,
          },
        ],
      },
      {
        action: 'review',
        module: 'baddep',
        resolves: [
          {
            id: 123,
            path: 'some-lib>another-lib>baddep',
            dev: false,
            optional: false,
            bundled: false,
          },
        ],
      },
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
      {
        action: 'update',
        module: 'avedep',
        resolves: [
          {
            id: 123,
            path: 'some-lib>another-lib>avedep',
            dev: false,
            optional: false,
            bundled: false,
          },
        ],
      },
      {
        action: 'install',
        module: 'anotherdep',
        resolves: [
          {
            id: 999,
            path: 'some-lib>another-lib>anotherdep',
            dev: false,
            optional: false,
            bundled: false,
          },
        ],
      },
      {
        action: 'review',
        module: 'baddep',
        resolves: [
          {
            id: 456,
            path: 'some-lib>another-lib>baddep',
            dev: false,
            optional: false,
            bundled: false,
          },
        ],
      },
    ],
    advisories,
  });
  const result = help(input);
  t.equal(result.actions.length, 1);
  t.equal(result.actions[0].resolves[0].id, 456);
  t.end();
});
