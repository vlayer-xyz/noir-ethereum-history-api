import { PublicClient } from 'viem';

type CallWithResultPromise = {
  method: string;
  arguments: object[];
  result: Promise<object>;
};

export type Call = {
  method: string;
  arguments: object[];
  result: object;
};

export type GetCalls = { getCalls: () => Promise<Call[]> };

export const createRecordingClient = (client: PublicClient): PublicClient & GetCalls => createLoggingProxy(client);

function createLoggingProxy<T extends object>(target: T): T & GetCalls {
  const handler: ProxyHandler<T> & { _calls: CallWithResultPromise[] } = {
    _calls: [],

    get(target: T, prop: string, receiver) {
      if (prop === 'getCalls') {
        return async () => sequenceResultPromises(this._calls);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const origMethod = (target as any)[prop];
      if (typeof origMethod === 'function' && prop.startsWith('get')) {
        return async (...args: object[]): Promise<object> => {
          const result = origMethod.apply(target, args);
          this._calls.push({
            method: prop,
            arguments: args,
            result: result as Promise<object>
          });
          return result;
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  };

  return new Proxy(target, handler) as T & GetCalls;
}

async function sequenceResultPromises(entries: CallWithResultPromise[]): Promise<Call[]> {
  return Promise.all(entries.map(async (entry) => ({ ...entry, result: await entry.result })));
}