import { rest } from 'msw';
import { quiz } from './questions';

export const handlers = [
  rest.post('/login', (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true');
    return res(
      // Respond with a 200 status code
      ctx.status(200)
    );
  }),
  rest.get('/quiz', (req, res, ctx) => {
    // Check if the user is authenticated in this session
    return res(ctx.status(200), ctx.json(quiz));
  }),
];
