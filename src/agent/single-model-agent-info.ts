import type { AgentInfo } from '@microsoft/agent-host-protocol';

import type { SingleModelAgentInfoOptions } from './single-model-agent-info-options.js';

export function singleModelAgentInfo(options: SingleModelAgentInfoOptions): AgentInfo {
  return {
    provider: options.providerId,
    displayName: options.displayName,
    description: options.description,
    models: [
      {
        id: options.defaultModel,
        provider: options.providerId,
        name: options.defaultModel,
      },
    ],
  };
}
