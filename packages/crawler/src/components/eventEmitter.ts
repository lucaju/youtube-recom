/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'node:events';

export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.emitter.on(eventName, handler as any);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.emitter.off(eventName, handler as any);
  }

  removeAllListeners() {
    this.emitter.removeAllListeners();
  }
}
