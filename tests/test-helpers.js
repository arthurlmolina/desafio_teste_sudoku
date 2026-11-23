const { describe, test, beforeEach } = require('node:test');
Object.assign(global, { describe, test, beforeEach });
const assert = require('node:assert/strict');
function matcher(actual, negate = false) {
  const check = (fn) => { if (negate) { let failed=false; try { fn(); } catch (_) { failed=true; } assert.equal(failed, true, 'Expected assertion not to pass'); } else fn(); };
  return {
    toBe(expected) { check(() => assert.strictEqual(actual, expected)); },
    toEqual(expected) { check(() => assert.deepStrictEqual(actual, expected)); },
    toContain(expected) { check(() => assert.ok(actual.includes(expected))); },
    toContainEqual(expected) { check(() => assert.ok(actual.some(x => assert.deepStrictEqual(x, expected) === undefined))); },
    toHaveLength(expected) { check(() => assert.equal(actual.length, expected)); },
    toBeNull() { check(() => assert.strictEqual(actual, null)); },
    toBeDefined() { check(() => assert.notStrictEqual(actual, undefined)); },
    toThrow(expected) {
      const run = () => assert.throws(actual, (err) => {
        if (expected === undefined) return true;
        if (typeof expected === 'string') return String(err.message).includes(expected);
        if (typeof expected === 'function') return err instanceof expected;
        return false;
      });
      if (negate) assert.doesNotThrow(actual); else run();
    },
    get not() { return matcher(actual, !negate); }
  };
}
global.expect = (actual) => matcher(actual);
