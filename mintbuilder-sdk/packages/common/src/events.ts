export type Empty = {}

export interface EventInstance<Args extends object, Result> {
  readonly event: ReturnType<typeof Event<Args, Result>>;
  readonly args: Args;
  result: Result | undefined;
  canceled: boolean;
}

export type EventHandler<Args extends object, Result> = (e: EventInstance<Args, Result>) => void | Promise<void>;

export function Event<Args extends object, Result = void>() {
  const handlers = new Set<EventHandler<Args, Result>>();
  
  /** Register a new event handler to be called whenever an event is emitted. Returns its own unregistering function. */
  const register = (handler: EventHandler<Args, Result>) => {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    }
  }
  
  /** Execute the given `handler` exactly once upon the next emitted event. */
  register.once = (handler: EventHandler<Args, Result>) => {
    const unregister = register((e) => {
      unregister();
      handler(e);
    });
    return unregister;
  }
  
  /** Execute the given `handler` exactly once, but only if the event matches the given `pred`. */
  register.oncePred = (handler: EventHandler<Args, Result>, pred: (e: EventInstance<Args, Result>) => boolean) => {
    const unregister = register((e) => {
      if (pred(e)) {
        unregister();
        handler(e);
      }
    });
    return unregister;
  }
  
  /** Emit an event. */
  register.emit = async (args: Args, result?: Result) => {
    const event: EventInstance<Args, Result> = {
      event: register,
      args,
      result,
      canceled: false,
    };
    for (const handler of handlers) {
      await handler(event);
    }
    return event;
  };
  
  return register;
}

Event.TwoPhase = <Args extends object, Result = void>() => {
  return Object.assign(
    Event<Args, Result>(),
    {
      before: Event<Args>(),
    }
  );
}
