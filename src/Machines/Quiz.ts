import { assign, createMachine } from 'xstate';
import { quiz } from '../../mocks/questions';
import fetchMachine from './FetchMachine';

const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

const omgquiz = delay(500).then(() => quiz);

export interface SimpleDataFetchMachineContext {
  data?: Data;
  errorMessage?: string;
  endpoint: string;
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

const secretMachine = createMachine<
  SimpleDataFetchMachineContext,
  SimpleDataFetchMachineEvent
>(
  {
    id: 'secret',
    initial: 'fetching',
    context: {
      endpoint: 'omg',
      data: undefined,
    },
    states: {
      fetching: {
        on: {
          /* CANCEL: {
            target: 'idle',
          }, */
          RECEIVE_DATA: {
            target: 'success',
            actions: 'assignDataToContext',
          },
        },
        invoke: {
          src: 'fetchData',
          id: 'fetchInvokation',
          onDone: {
            target: 'success',
            actions: 'assignDataToContext',
          },
          onError: {
            target: 'errored',
            actions: 'assignErrorToContext',
          },
        },
      },
      errored: {
        type: 'final',
      },
      success: {
        type: 'final',
        data: {
          endpoint: (context, event) => context.endpoint,
        },
      },
    },
  },
  {
    services: {
      fetchData: (context) => omgquiz,
    },
    actions: {
      assignDataToContext: assign((context, event) => {
        //if (event.type !== 'RECEIVE_DATA') return {};
        console.log('lol', event.type);
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

export const quizMachine = createMachine(
  {
    id: 'Quiz',
    context: {
      //questions: [...quiz.results.slice(6)],
      questions: [],
      answers: [],
      currentQuestion: 0,
    },
    initial: 'Start',
    states: {
      Start: {
        type: 'atomic',
        on: {
          Fetch: { target: 'Fetch' },
        },
      },
      Fetch: {
        invoke: {
          src: secretMachine,
          data: {
            endpoint: 'https://opentdb.com/api.php?amount=10&category=9',
          },
          onDone: {
            target: 'Ready',
            actions: assign({
              questions: (context, event) => {
                // event is:
                // { type: 'done.invoke.secret', data: { secret: '42' } }
                console.log(event);
                return event.data.endpoint;
              },
            }),
          },
        },
      },
      Ready: {
        initial: 'Question',
        states: {
          Question: {
            on: {
              RESPOND: 'PostScript',
            },
          },
          PostScript: {
            on: {
              Next: [
                {
                  target: 'Question',
                  actions: 'Next question',
                  cond: 'More questions',
                },
                '#Quiz.Recap', // if conditions above are not met, this will run
              ],
            },
          },
        },
      },

      Recap: {
        on: {
          Reset: 'Start',
        },
        exit: 'Reset',
      },
    },
  },
  {
    guards: {
      'More questions': (ctx) => ctx.currentQuestion < ctx.questions.length,
      'All questions answered': (ctx) =>
        ctx.currentQuestion === ctx.questions.length,
    },
    actions: {
      Reset: assign({
        currentQuestion: (ctx) => (ctx.currentQuestion = 0),
      }),
      'Next question': assign({
        currentQuestion: (ctx) => ctx.currentQuestion + 1,
      }),
      'Reset quiz': assign({
        currentQuestion: (ctx) => ctx.currentQuestion + 1,
      }),
      /* 'Update answer': assign({
        currentQuestion: (ctx, event) => ctx.answers[ctx.currentQuestion] = event.selectedAnswer,
      }) */
    },
  }
);

//
