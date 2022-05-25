import { decode } from 'html-entities';

type Question = {
  category: string;
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  incorrect_answers: string[];
  question: string;
  type: 'multiple' | 'boolean';
};

type Quiz = {
  response_code: number;
  results: Question[];
};

import { assign, createMachine } from 'xstate';

const getQuestion = (d: Question) => decode(d.question);

function getQuiz(context) {
  return fetch(
    `https://opentdb.com/api.php?amount=5&category=29&difficulty=easy`
  ).then(async (response) => {
    const res = (await response.json()) as Quiz;
    return res.results.map((i) => {
      return {
        ...i,
        question: getQuestion(i),
      };
    });
  });
}

const runningQuizMachine = {
  Quiz: {
    initial: 'Preamble',
    states: {
      Preamble: {
        on: {
          NEXT: 'Question',
        },
        always: {
          cond: 'No preamble',
          target: 'Question',
        },
      },
      Question: {
        on: {
          RESPOND: 'PostScript',
        },
      },
      PostScript: {
        on: {
          NEXT: [
            {
              target: 'Preamble',
              actions: 'Next question',
              cond: 'More questions',
            },
            '#Recap',
          ],
        },
        always: [
          {
            cond: 'No postscript, More questions',
            target: 'Preamble',
            actions: 'Next question',
          },
          {
            cond: 'No postscript',
            target: '#Recap',
          },
        ],
      },
    },
  },
};

export const quizMachine = createMachine({
  id: 'quiz',
  context: { questions: [], answers: [], remaining: null },
  initial: 'LOADING',
  states: {
    LOADING: {
      invoke: {
        src: getQuiz,
        onDone: {
          target: 'Ready',
          actions: assign({
            questions: (context, event) => event.data,
            remaining: (context, event) => event.data.length,
          }),
        },
        onError: {
          target: 'ERROR',
        },
      },
    },

    ERROR: {
      on: {
        RETRY: 'LOADING',
      },
    },

    Ready: {
      initial: 'Preamble',
      states: {
        Preamble: {
          on: {
            NEXT: 'Question',
          },
        },
        Question: {
          on: {
            RESPOND: 'PostScript',
          },
        },
        PostScript: {},
      },
    },
  },
});
