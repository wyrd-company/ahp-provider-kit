import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { StateAction, ToolCallResult, ToolResultContent } from '@microsoft/agent-host-protocol';

import {
  ActiveClientToolRouter,
  MarkdownTurnEmitter,
  type ProviderResumeState,
  resolveModelId,
  singleModelAgentInfo,
  uriToPath,
  type ActiveClientToolInvocation,
  type ResumableAgentProvider,
} from '../src/index.js';

test('builds single-model agent metadata', () => {
  assert.deepEqual(singleModelAgentInfo({
    providerId: 'codex',
    displayName: 'Codex',
    description: 'Codex provider',
    defaultModel: 'gpt-5',
  }), {
    provider: 'codex',
    displayName: 'Codex',
    description: 'Codex provider',
    models: [{
      id: 'gpt-5',
      provider: 'codex',
      name: 'gpt-5',
    }],
  });
});

test('resolves explicit and fallback model ids', () => {
  assert.equal(resolveModelId({ id: 'custom-model' }, 'fallback'), 'custom-model');
  assert.equal(resolveModelId(undefined, 'fallback'), 'fallback');
});

test('converts file URIs to local paths', () => {
  assert.equal(uriToPath('file:///workspaces/project'), '/workspaces/project');
  assert.equal(uriToPath('ahp-session:/abc'), 'ahp-session:/abc');
});

test('emits markdown turn actions once per turn', () => {
  const actions: StateAction[] = [];
  const emitter = new MarkdownTurnEmitter({
    emit(action) {
      actions.push(action);
    },
    fail(error) {
      throw error;
    },
  }, 'turn-1');

  emitter.emitDelta('hello');
  emitter.emitDelta(' world');
  emitter.complete();

  assert.deepEqual(actions.map(action => action.type), [
    'session/responsePart',
    'session/delta',
    'session/delta',
    'session/turnComplete',
  ]);
});

test('routes active-client tool invocations with inferred display names', async () => {
  let reported: ActiveClientToolInvocation | undefined;
  const expected: ToolCallResult = {
    success: true,
    pastTenseMessage: 'Searched',
    content: [{ type: 'text', text: 'done' } as ToolResultContent],
  };
  const router = new ActiveClientToolRouter({
    activeClientTools: {
      clientId: 'client-1',
      tools: [{
        name: 'searchWorkspace',
        title: 'Search Workspace',
        inputSchema: { type: 'object' },
      }],
    },
    sink: {
      async reportInvocation(invocation) {
        reported = invocation;
        return expected;
      },
    },
  });

  assert.equal(router.findTool('searchWorkspace')?.title, 'Search Workspace');
  assert.equal(await router.reportInvocation({
    turnId: 'turn-1',
    toolCallId: 'tool-call-1',
    toolName: 'searchWorkspace',
  }), expected);
  assert.deepEqual(reported, {
    turnId: 'turn-1',
    toolCallId: 'tool-call-1',
    toolName: 'searchWorkspace',
    displayName: 'Search Workspace',
    invocationMessage: 'Search Workspace',
    toolInput: undefined,
  });
});

test('defines a resumable provider contract with persisted AHP and provider-native session state', async () => {
  const resumeState: ProviderResumeState = { nativeSessionId: 'native-session-1' };
  const provider: ResumableAgentProvider = {
    agent: singleModelAgentInfo({
      providerId: 'resumable',
      displayName: 'Resumable',
      description: 'Resumable test provider',
      defaultModel: 'test-model',
    }),
    createSession() {
      return {
        async sendUserMessage() {},
      };
    },
    resumeSession(context) {
      assert.equal(context.state.summary.resource, context.sessionUri);
      assert.equal(context.state.summary.provider, context.providerId);
      assert.equal(context.resumeState?.nativeSessionId, 'native-session-1');
      return {
        async sendUserMessage() {},
        getResumeState() {
          return resumeState;
        },
      };
    },
  };

  const resumed = provider.resumeSession({
    sessionUri: 'ahp-session:/resumable',
    providerId: 'resumable',
    activeClientToolSink: {
      async reportInvocation() {
        throw new Error('not used');
      },
    },
    state: {
      summary: {
        resource: 'ahp-session:/resumable',
        provider: 'resumable',
        title: 'Resumable',
        status: 1,
        createdAt: 1,
        modifiedAt: 1,
      },
      lifecycle: 'ready' as never,
      turns: [],
    },
    resumeState,
  });

  assert.equal(provider.agent.provider, 'resumable');
  assert.deepEqual((await resumed).getResumeState?.(), resumeState);
});
