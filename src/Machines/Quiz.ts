import { assign, createMachine } from 'xstate';
import fetchMachine from './FetchMachine';

/* const getQuiz = new Promise<Question[]>((resolve) => {
  setTimeout(() => {
    resolve(quiz.results);
  }, 300);
}); */

/* const testLightMachine = lightMachine.withContext({
  elapsed: 1000,
  direction: 'north'
}); */

const fetchQuizMachine = fetchMachine.withConfig({
  services: {
    fetchData: () => fetch('/quiz')
    .then(blob => blob.json())
    .then(data => {
      if (data.message) {
        return
      }
      return data
    })
    .catch(console.log)
  }
});
const allQuestionsAnswered = (context, event) => {
  return context.questions.length === context.answers.length;
};

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
          Fetch: { target: 'Ready' },
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
