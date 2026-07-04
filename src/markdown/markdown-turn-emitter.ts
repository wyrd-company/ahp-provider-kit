import type { StateAction } from '@microsoft/agent-host-protocol';

import type { AgentTurnSink } from '../sessions/agent-turn-sink.js';
import { markdownPart } from './markdown-part.js';
import { markdownPartId } from './markdown-part-id.js';

export class MarkdownTurnEmitter {
  private emitted = false;

  constructor(
    private readonly sink: AgentTurnSink,
    readonly turnId: string,
    readonly partId: string = markdownPartId(turnId),
  ) {}

  get partEmitted(): boolean {
    return this.emitted;
  }

  ensurePart(): void {
    if (this.emitted) {
      return;
    }
    this.emitted = true;
    this.sink.emit(markdownPart(this.turnId, this.partId));
  }

  emitDelta(content: string): void {
    if (!content) {
      return;
    }
    this.ensurePart();
    this.sink.emit({
      type: 'session/delta',
      turnId: this.turnId,
      partId: this.partId,
      content,
    } as StateAction);
  }

  complete(): void {
    this.ensurePart();
    this.sink.emit({
      type: 'session/turnComplete',
      turnId: this.turnId,
    } as StateAction);
  }
}
