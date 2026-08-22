import assert from 'node:assert/strict';
import test from 'node:test';
import { isAdmin } from './auth.ts';

test('only a server-controlled admin role is authorized', () => {
    assert.equal(isAdmin(null), false);
    assert.equal(isAdmin({ role: 'member' }), false);
    assert.equal(isAdmin({ role: 'admin' }), true);
});
