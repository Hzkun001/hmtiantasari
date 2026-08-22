import assert from 'node:assert/strict';
import test from 'node:test';
import { getSupabaseAuthConfig, isAdmin } from './auth.ts';

test('only a server-controlled admin role is authorized', () => {
    assert.equal(isAdmin(null), false);
    assert.equal(isAdmin({ role: 'member' }), false);
    assert.equal(isAdmin({ role: 'admin' }), true);
});

test('auth routes fail closed when Supabase configuration is missing', () => {
    assert.equal(getSupabaseAuthConfig(undefined, 'anon-key'), null);
    assert.equal(getSupabaseAuthConfig('https://example.supabase.co', '  '), null);
    assert.deepEqual(
        getSupabaseAuthConfig('https://example.supabase.co', 'anon-key'),
        {
            supabaseUrl: 'https://example.supabase.co',
            supabaseAnonKey: 'anon-key',
        },
    );
});
