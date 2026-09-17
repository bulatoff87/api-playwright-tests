import { randomInt } from 'node:crypto';
import { test, expect } from '@playwright/test';

test('GET /pet/{petId}: возвращает созданного питомца @pet @regression', async ({ request }) => {
  const pet = {
    id: randomInt(1_000_000_000_000, 281_474_976_710_655),
    name: 'Test pet',
    photoUrls: [],
  };

  const created = await request.post('pet', { data: pet });
  expect(created.status()).toBe(200);

  try {
    const response = await request.get(`pet/${pet.id}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(pet.id);
    expect(body.name).toBe(pet.name);
  } finally {
    // Удаляем питомца, даже если проверка GET завершилась ошибкой.
    const deleted = await request.delete(`pet/${pet.id}`);
    expect(deleted.status()).toBe(200);
  }
});

test('GET /pet/{petId}: возвращает 404 для отсутствующего питомца @pet @regression', async ({ request }) => {
  const missingPetId = -randomInt(1_000_000_000_000, 281_474_976_710_655);
  const response = await request.get(`pet/${missingPetId}`);

  expect(response.status()).toBe(404);
});
