import { randomInt, randomUUID } from 'node:crypto';
import { expect, type APIResponse, type APIRequestContext } from '@playwright/test';

export const newId = () => randomInt(1_000_000_000, 2_000_000_000);
export const newPet = () => ({ id: newId(), name: `qa-${randomUUID()}`, photoUrls: ['https://example.com/pet.png'], status: 'available', tags: [{ id: 1, name: `qa-${randomUUID()}` }] });
export const newUser = () => ({ id: newId(), username: `qa-${randomUUID()}`, firstName: 'API', lastName: 'Test', email: 'qa@example.com', password: randomUUID(), phone: '123456789', userStatus: 1 });
export async function status(response: APIResponse, expected: number) {
  expect(response.status(), `${response.url()}\n${await response.text()}`).toBe(expected);
}

// A cleanup failure must be visible without replacing the original assertion error.
export async function cleanup(request: APIRequestContext, path: string) {
  try {
    const response = await request.delete(path, { timeout: 10_000 });
    expect.soft([200, 404], `Cleanup ${path}: ${response.status()} ${await response.text()}`).toContain(response.status());
  } catch (error) {
    expect.soft(false, `Cleanup ${path}: ${String(error)}`).toBe(true);
  }
}
