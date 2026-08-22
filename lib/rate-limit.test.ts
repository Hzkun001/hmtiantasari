import assert from 'node:assert/strict';
import test from 'node:test';
import { allowRequest } from './rate-limit.ts';

test('limits requests and resets after the window', () => {
    const key = crypto.randomUUID();
    assert.equal(allowRequest(key, 2, 100, 0), true);
    assert.equal(allowRequest(key, 2, 100, 1), true);
    assert.equal(allowRequest(key, 2, 100, 2), false);
    assert.equal(allowRequest(key, 2, 100, 100), true);
});
