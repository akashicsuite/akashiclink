import { rest } from 'msw';

export const ownerUnauthorised = rest.get('/api/v0/owner/me', (_, res, ctx) => {
  return res(
    ctx.status(401),
    ctx.json({ message: 'Mocking an unauthorized user' })
  );
});
