import { test, expect } from '@playwright/test';
import { newPet, status, cleanup } from './helpers';

test.describe('Pet @pet @regression', () => {
  test('create, read and delete @smoke', async ({ request }) => {
    const pet = newPet();
    try {
      const created = await request.post('pet', { data: pet });
      await status(created, 200);
      expect(await created.json()).toMatchObject(pet);
      const read = await request.get(`pet/${pet.id}`);
      await status(read, 200);
      expect(await read.json()).toMatchObject(pet);
      await status(await request.delete(`pet/${pet.id}`), 200);
      await status(await request.get(`pet/${pet.id}`), 404);
    } finally { await cleanup(request, `pet/${pet.id}`); }
  });

  test('update with PUT persists fields', async ({ request }) => {
    const pet = newPet();
    try {
      await status(await request.post('pet', { data: pet }), 200);
      const updated = { ...pet, name: 'Updated pet', status: 'sold' };
      await status(await request.put('pet', { data: updated }), 200);
      const read = await request.get(`pet/${pet.id}`);
      await status(read, 200);
      expect(await read.json()).toMatchObject(updated);
    } finally { await cleanup(request, `pet/${pet.id}`); }
  });

  test('update using query parameters persists fields', async ({ request }) => {
    const pet = newPet();
    try {
      await status(await request.post('pet', { data: pet }), 200);
      await status(await request.post(`pet/${pet.id}`, { params: { name: 'Form pet', status: 'pending' } }), 200);
      const read = await request.get(`pet/${pet.id}`);
      await status(read, 200);
      expect(await read.json()).toMatchObject({ id: pet.id, name: 'Form pet', status: 'pending' });
    } finally { await cleanup(request, `pet/${pet.id}`); }
  });

  for (const petStatus of ['available', 'pending', 'sold']) {
    test(`find by status ${petStatus}`, async ({ request }) => {
      const pet = { ...newPet(), status: petStatus };
      try {
        await status(await request.post('pet', { data: pet }), 200);
        const response = await request.get('pet/findByStatus', { params: { status: petStatus } });
        await status(response, 200);
        const pets = await response.json();
        expect(Array.isArray(pets)).toBe(true);
        expect(pets).toEqual(expect.arrayContaining([expect.objectContaining({ id: pet.id, status: petStatus })]));
        for (const item of pets) expect(item.status).toBe(petStatus);
      } finally { await cleanup(request, `pet/${pet.id}`); }
    });
  }

  test('find by unique tag', async ({ request }) => {
    const pet = newPet();
    try {
      await status(await request.post('pet', { data: pet }), 200);
      const response = await request.get('pet/findByTags', { params: { tags: pet.tags[0].name } });
      await status(response, 200);
      expect(await response.json()).toEqual(expect.arrayContaining([expect.objectContaining({ id: pet.id })]));
    } finally { await cleanup(request, `pet/${pet.id}`); }
  });

  test('upload PNG image', async ({ request }) => {
    const pet = newPet();
    try {
      await status(await request.post('pet', { data: pet }), 200);
      const response = await request.post(`pet/${pet.id}/uploadImage`, {
        headers: { 'Content-Type': 'application/octet-stream' },
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
      });
      await status(response, 200);
      const body = await response.json();
      expect(body).toBeTruthy();
      expect(typeof body).toBe('object');
      // ApiResponse properties are optional in OpenAPI; do not invent required fields.
      if ('code' in body) expect(Number.isInteger(body.code)).toBe(true);
      if ('message' in body) expect(typeof body.message).toBe('string');
      if ('type' in body) expect(typeof body.type).toBe('string');
      const read = await request.get(`pet/${pet.id}`);
      await status(read, 200);
      expect((await read.json()).photoUrls.length).toBeGreaterThan(pet.photoUrls.length);
    } finally { await cleanup(request, `pet/${pet.id}`); }
  });

  test('invalid status returns 400', async ({ request }) => {
    await status(await request.get('pet/findByStatus', { params: { status: 'invalid-status' } }), 400);
  });
  test('invalid pet ID returns 400', async ({ request }) => {
    await status(await request.get('pet/not-an-integer'), 400);
  });
});
