import { rest } from 'msw';
import { quiz } from './questions';

export const handlers = [
  rest.get('/quiz', (req, res, ctx) => {
    // Check if the user is authenticated in this session
    //sessionStorage.setItem('is-authenticated', 'true');
    return res(ctx.status(200), ctx.json(quiz));
  }),
];
