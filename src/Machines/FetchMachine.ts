import { assign, createMachine } from 'xstate';

export interface SimpleDataFetchMachineContext {
  data?: Data;
  errorMessage?: string;
}

interface Variables {
  id: string;
}

interface Data {
  name: string;
}

export type SimpleDataFetchMachineEvent =
  | {
      type: 'FETCH';
      variables: Variables;
    }
  | {
      type: 'RECEIVE_DATA';
      data: Data;
    }
  | {
      type: 'CANCEL';
    };

const fetchMachine = createMachine<
  SimpleDataFetchMachineContext,
  SimpleDataFetchMachineEvent
>(
  {
    id: 'simpleDataFetch',
    initial: 'idle',
    context: { data: undefined },
    states: {
      idle: {
        on: {
          FETCH: {
            target: 'fetching',
          },
        },
        initial: 'noError',
        states: {
          noError: {
            entry: ['clearErrorMessage'],
          },
          errored: {},
        },
      },
      fetching: {
        on: {
          FETCH: {
            target: 'fetching',
          },
          CANCEL: {
            target: 'idle',
          },
          RECEIVE_DATA: {
            target: 'success',
            actions: 'assignDataToContext',
          },
        },
        invoke: {
          src: 'fetchData',
          onError: {
            target: 'idle.errored',
            actions: 'assignErrorToContext',
          },
        },
      },
      success: {
        type: 'final',
        data: {
          data: (context) => context.data,
        },
      },
    },
  },
  {
    services: {
      fetchData: () => () => {
        data: 'hey';
      },
    },
    actions: {
      assignDataToContext: assign((context, event) => {
        if (event.type !== 'RECEIVE_DATA') return {};
        return {
          data: event.data,
        };
      }),
      clearErrorMessage: assign({
        errorMessage: undefined,
      }),
      assignErrorToContext: assign((context, event: any) => {
        return {
          errorMessage: event.data?.message || 'An unknown error occurred',
        };
      }),
    },
  }
);

export default fetchMachine;
