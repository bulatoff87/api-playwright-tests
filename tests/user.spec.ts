import { test, expect } from '@playwright/test';
import { newUser, status, cleanup } from './helpers';

test.describe('User @user @regression', () => {
  test('create, read and delete @smoke', async ({ request }) => {
    const user = newUser();
    try {
      await status(await request.post('user', { data: user }), 200);
      const read = await request.get(`user/${user.username}`);
      await status(read, 200);
      expect(await read.json()).toMatchObject({ id: user.id, username: user.username, email: user.email });
      await status(await request.delete(`user/${user.username}`), 200);
      await status(await request.get(`user/${user.username}`), 404);
    } finally { await cleanup(request, `user/${user.username}`); }
  });
  test('update persists profile fields', async ({ request }) => {
    const user = newUser();
    try {
      await status(await request.post('user', { data: user }), 200);
      const updated = { ...user, firstName: 'Updated', email: 'updated@example.com' };
      await status(await request.put(`user/${user.username}`, { data: updated }), 200);
      const read = await request.get(`user/${user.username}`);
      await status(read, 200);
      expect(await read.json()).toMatchObject({ firstName: updated.firstName, email: updated.email });
    } finally { await cleanup(request, `user/${user.username}`); }
  });
  test('create users with list', async ({ request }) => {
    const users = [newUser(), newUser()];
    try {
      await status(await request.post('user/createWithList', { data: users }), 200);
      for (const user of users) {
        const response = await request.get(`user/${user.username}`);
        await status(response, 200);
        expect(await response.json()).toMatchObject({ id: user.id, username: user.username });
      }
    } finally {
      for (const user of users) await cleanup(request, `user/${user.username}`);
    }
  });
  test('login and logout', async ({ request }) => {
    const user = newUser();
    try {
      await status(await request.post('user', { data: user }), 200);
      const login = await request.get('user/login', { params: { username: user.username, password: user.password } });
      await status(login, 200);
      expect(await login.text()).not.toBe('');
      await status(await request.get('user/logout'), 200);
    } finally { await cleanup(request, `user/${user.username}`); }
  });
  test('missing user returns 404', async ({ request }) => {
    await status(await request.get(`user/${newUser().username}`), 404);
  });
});
