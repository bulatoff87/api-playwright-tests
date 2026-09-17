import { test, expect } from '@playwright/test';
import { newId, status, cleanup } from './helpers';

test.describe('Store @store @regression', () => {
  test('inventory contains nonnegative integer counts @smoke', async ({ request }) => {
    const response = await request.get('store/inventory');
    await status(response, 200);
    const inventory = await response.json();
    expect(inventory).toBeTruthy();
    expect(typeof inventory).toBe('object');
    expect(Array.isArray(inventory)).toBe(false);
    for (const count of Object.values(inventory)) {
      expect(Number.isInteger(count)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
  for (const orderStatus of ['placed', 'approved', 'delivered']) {
    test(`order lifecycle ${orderStatus}`, async ({ request }) => {
      const order = { id: newId(), petId: newId(), quantity: 2, status: orderStatus, complete: false };
      try {
        const created = await request.post('store/order', { data: order });
        await status(created, 200);
        expect(await created.json()).toMatchObject(order);
        const read = await request.get(`store/order/${order.id}`);
        await status(read, 200);
        expect(await read.json()).toMatchObject(order);
        await status(await request.delete(`store/order/${order.id}`), 200);
        await status(await request.get(`store/order/${order.id}`), 404);
      } finally { await cleanup(request, `store/order/${order.id}`); }
    });
  }
  test('missing order returns 404', async ({ request }) => {
    await status(await request.get(`store/order/${newId()}`), 404);
  });
  test('invalid order ID returns 400', async ({ request }) => {
    await status(await request.get('store/order/not-an-integer'), 400);
  });
});
