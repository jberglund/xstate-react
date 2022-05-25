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
