import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  resolveSessionStorageDir,
  type AgentSessionContext,
  type SessionStorage,
} from '../src/index.js';

const activeClientToolSink: AgentSessionContext['activeClientToolSink'] = {
  async reportInvocation() {
    throw new Error('not used');
  },
};

function context(sessionUri: string): AgentSessionContext {
  return {
    sessionUri,
    providerId: 'test-provider',
    activeClientToolSink,
  };
}

test('resolveSessionStorageDir returns undefined for undefined storage', () => {
  assert.equal(resolveSessionStorageDir(undefined, context('ahp-session:/one')), undefined);
});

test('resolveSessionStorageDir returns function result verbatim', () => {
  const expected = 'file:///sessions/custom-dir';
  const sessionStorage: SessionStorage = receivedContext => {
    assert.equal(receivedContext.sessionUri, 'ahp-session:/one');
    return expected;
  };

  assert.equal(resolveSessionStorageDir(sessionStorage, context('ahp-session:/one')), expected);
});

test('resolveSessionStorageDir allows function storage to defer to SDK defaults per session', () => {
  assert.equal(resolveSessionStorageDir(() => undefined, context('ahp-session:/one')), undefined);
});

test('resolveSessionStorageDir derives deterministic per-session directories under a static root', () => {
  const root = 'file:///sessions/root';
  const firstContext = context('ahp-session:/one');
  const secondContext = context('ahp-session:/two');

  const first = resolveSessionStorageDir(root, firstContext);
  const firstAgain = resolveSessionStorageDir(root, firstContext);
  const second = resolveSessionStorageDir(root, secondContext);

  assert.equal(first, firstAgain);
  assert.notEqual(first, second);
  assert.ok(first?.startsWith(`${root}/`));
  assert.ok(second?.startsWith(`${root}/`));
});

test('resolveSessionStorageDir encodes hostile session URIs into one safe segment', () => {
  const root = 'file:///sessions/root/';
  const resolved = resolveSessionStorageDir(
    root,
    context('ahp-session:/../spaces and % signs/unicode-\u2603'),
  );

  assert.ok(resolved?.startsWith(root));
  const segment = resolved?.slice(root.length);

  assert.match(segment ?? '', /^[A-Za-z0-9._-]+$/);
  assert.doesNotMatch(segment ?? '', /%/);
  assert.doesNotMatch(segment ?? '', /\//);
  assert.doesNotMatch(segment ?? '', /\\/);
  assert.doesNotMatch(segment ?? '', /\s/);
  assert.notEqual(segment, '.');
  assert.notEqual(segment, '..');
  assert.ok(segment?.includes('_2F.._2Fspaces_20and_20_25_20signs_2Funicode-'));
});

test('resolveSessionStorageDir static file roots survive fileURLToPath round-trips', async () => {
  const { fileURLToPath } = await import('node:url');
  const resolved = resolveSessionStorageDir('file:///sessions/root', context('ahp-session:/one'));

  assert.ok(resolved);
  const path = fileURLToPath(resolved);
  assert.ok(path.startsWith('/sessions/root/session-'));
  assert.doesNotMatch(path.slice('/sessions/root/'.length), /\//);
});

test('resolveSessionStorageDir keeps special dot session URIs under the static root', () => {
  assert.equal(resolveSessionStorageDir('file:///sessions/root', context('.')), 'file:///sessions/root/session-.');
  assert.equal(resolveSessionStorageDir('file:///sessions/root', context('..')), 'file:///sessions/root/session-..');
});
