
import { test, expect } from '@playwright/test';

const booking = {
  code: 'P298QJ',
  status: 'confirmed',
  flight: {
    id: 'fl_1',
    flightNumber: 'SU1864',
    airline: { code: 'SU', name: 'Аэрофлот' },
    origin: { code: 'LED', name: 'Санкт-Петербург' },
    destination: { code: 'KGD', name: 'Калининград' },
    departureAt: '2026-11-30T16:00:00Z',
    arrivalAt: '2026-11-30T18:00:00Z',
    durationMinutes: 120,
    price: { amount: 3500, currency: 'RUB' },
    seatsAvailable: 10,
  },
  passengers: [
    {
      firstName: 'М',
      lastName: 'Осьмак',
      dateOfBirth: '1990-05-20',
      documentNumber: '4509123456',
    },
  ],
  contact: {
    email: 'test@example.com',
    phone: '+79991234567',
  },
  totalPrice: { amount: 3500, currency: 'RUB' },
  createdAt: '2026-11-12T10:00:00Z',
};

test('Открывает страницу поиска брони', async ({ page }) => {
  await page.goto('/lookup');

  await expect(page.getByTestId('booking-lookup-form')).toBeVisible();
  await expect(page.getByTestId('lookup-code')).toBeVisible();
  await expect(page.getByTestId('lookup-lastName')).toBeVisible();
});

test('На главной странице есть ссылка на мои брони', async ({ page }) => {
  await page.route('**/api/cities', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.route('**/api/flights?*', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.goto('/');

  await page.getByTestId('nav-lookup').click();

  await expect(page).toHaveURL(/\/lookup$/);
  await expect(page.getByTestId('booking-lookup-form')).toBeVisible();
});

test('Находит бронь по коду и фамилии', async ({ page }) => {
  await page.route('**/api/bookings/P298QJ?*', async (route) => {
    const url = new URL(route.request().url());

    expect(url.searchParams.get('lastName')).toBe('Осьмак');

    await route.fulfill({ json: booking });
  });

  await page.goto('/lookup');

  await page.getByTestId('lookup-code').fill('P298QJ');
  await page.getByTestId('lookup-lastName').fill('Осьмак');
  await page.getByTestId('lookup-submit').click();

  await expect(page.getByTestId('booking-details')).toBeVisible();
  await expect(page.getByTestId('booking-code')).toHaveText('P298QJ');

  await expect(page.getByTestId('booking-status')).toHaveAttribute(
    'data-status',
    'confirmed',
  );

  await expect(page.getByText('3500 RUB')).toBeVisible();
  await expect(page.getByTestId('cancel-booking')).toBeVisible();
});

test('Показывает сообщение, если бронь не найдена', async ({ page }) => {
  await page.route('**/api/bookings/UNKNOWN?*', (route) =>
    route.fulfill({
      status: 404,
      json: { code: 'not_found', message: 'Бронь не найдена' },
    }),
  );

  await page.goto('/lookup');

  await page.getByTestId('lookup-code').fill('UNKNOWN');
  await page.getByTestId('lookup-lastName').fill('Иванов');
  await page.getByTestId('lookup-submit').click();

  await expect(page.getByTestId('booking-not-found')).toBeVisible();
  await expect(page.getByTestId('booking-details')).toHaveCount(0);
});

test('Отменяет бронь и обновляет статус', async ({ page }) => {
  await page.route('**/api/bookings/P298QJ?*', (route) =>
    route.fulfill({ json: booking }),
  );

  await page.route('**/api/bookings/P298QJ/cancel', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      lastName: 'Осьмак',
    });

    await route.fulfill({
      json: { ...booking, status: 'cancelled' },
    });
  });

  await page.goto('/lookup');

  await page.getByTestId('lookup-code').fill('P298QJ');
  await page.getByTestId('lookup-lastName').fill('Осьмак');
  await page.getByTestId('lookup-submit').click();

  await page.getByTestId('cancel-booking').click();

  await expect(page.getByTestId('booking-status')).toHaveAttribute(
    'data-status',
    'cancelled',
  );

  await expect(page.getByTestId('cancel-booking')).toHaveCount(0);
});
