import { assign, createMachine } from 'xstate';

type Quiz = {
  response_code: number;
  results: Question[];
};

type AnswersAndAnswers = string | 'False' | 'True';

type Question = {
  category: string;
  correct_answer: AnswersAndAnswers;
  difficulty: 'easy' | 'medium' | 'hard';
  incorrect_answers: AnswersAndAnswers[];
  question: string;
  type: 'multiple' | 'boolean';
};

// https://opentdb.com/api_config.php
const quiz: Quiz = {
  response_code: 0,
  results: [
    {
      category: 'Entertainment: Video Games',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'The main character in the &quot;Half-Life&quot; franchise is named Morgan Freeman.',
      correct_answer: 'False',
      incorrect_answers: ['True'],
    },
    {
      category: 'Science: Mathematics',
      type: 'boolean',
      difficulty: 'hard',
      question:
        'If you could fold a piece of paper in half 50 times, its&#039; thickness will be 3/4th the distance from the Earth to the Sun.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'Entertainment: Video Games',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'In Team Fortress 2, being disguised as a scout or medic results in a speed boost.',
      correct_answer: 'False',
      incorrect_answers: ['True'],
    },
    {
      category: 'Vehicles',
      type: 'boolean',
      difficulty: 'medium',
      question: 'Arriva is owned by the Deutsche Bahn.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'Geography',
      type: 'boolean',
      difficulty: 'medium',
      question: 'Liechtenstein does not have an airport.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'Animals',
      type: 'boolean',
      difficulty: 'easy',
      question: 'The Killer Whale is considered a type of dolphin.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'Science & Nature',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'Celiac Disease is a disease that effects the heart, causing those effected to be unable to eat meat.',
      correct_answer: 'False',
      incorrect_answers: ['True'],
    },
    {
      category: 'Entertainment: Music',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'The 2011 movie &quot;The Adventures of Tintin&quot; was directed by Steven Spielberg.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'Geography',
      type: 'boolean',
      difficulty: 'hard',
      question: 'Only one country in the world starts with the letter Q.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'Entertainment: Books',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'Shub-Niggurath is a creature that was created by \tJ. R. R. Tolkien in his novel &quot;The Lord of The Rings&quot;.',
      correct_answer: 'False',
      incorrect_answers: ['True'],
    },
  ],
};

const getQuiz = new Promise<Question[]>((resolve) => {
  setTimeout(() => {
    resolve(quiz.results);
  }, 300);
});

const allQuestionsAnswered = (context, event) => {
  return context.questions.length === context.answers.length;
};

export const quizMachine = createMachine(
  {
    id: 'Quiz',
    context: {
      questions: [...quiz.results.slice(6)],
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
        initial: 'Preamble',
        states: {
          Preamble: {
            on: {
              Start: 'Question',
            },
          },
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
