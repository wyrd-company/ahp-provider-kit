import type { ActiveClientTools } from './active-client-tools.js';
import type { ActiveClientToolSink } from './active-client-tool-sink.js';

export interface ActiveClientToolRouterOptions {
  readonly activeClientTools?: ActiveClientTools;
  readonly sink: ActiveClientToolSink;
}
