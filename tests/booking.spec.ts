
import { test, expect } from '@playwright/test';

const flight = {
  id: 'fl_1',
  flightNumber: 'SU1234',
  airline: { code: 'SU', name: 'Аэрофлот' },
  origin: { code: 'MOW', name: 'Москва', country: 'Россия' },
  destination: {
    code: 'LED',
    name: 'Санкт-Петербург',
    country: 'Россия',
  },
  departureAt: '2026-07-01T08:00:00Z',
  arrivalAt: '2026-07-01T09:25:00Z',
  durationMinutes: 85,
  price: { amount: 5400, currency: 'RUB' },
  seatsAvailable: 42,
};

const fillPassenger = async (
  page: import('@playwright/test').Page,
  index: number,
) => {
  await page.getByTestId(`passenger-${index}-firstName`).fill('Иван');
  await page.getByTestId(`passenger-${index}-lastName`).fill('Петров');
  await page.getByTestId(`passenger-${index}-dob`).fill('1990-05-20');
  await page.getByTestId(`passenger-${index}-document`).fill('4509123456');
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/cities', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.route('**/api/flights?*', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.route('**/api/flights/fl_1', (route) =>
    route.fulfill({ json: flight }),
  );
});

test('Открывает выбранный рейс по прямой ссылке', async ({ page }) => {
  await page.goto('/booking/fl_1');

  await expect(page.getByTestId('booking-flight')).toBeVisible();
  await expect(page.getByText('SU1234')).toBeVisible();
  await expect(page.getByTestId('booking-form')).toBeVisible();
});

test('Не отправляет пустую форму', async ({ page }) => {
  let requests = 0;

  await page.route('**/api/bookings', (route) => {
    requests += 1;
    return route.fulfill({ status: 201, json: {} });
  });

  await page.goto('/booking/fl_1');
  await expect(page.getByTestId('booking-form')).toBeVisible();

  await page.getByTestId('booking-submit').click();

  expect(requests).toBe(0);
  await expect(page.getByTestId('booking-success')).toHaveCount(0);
});

test('Добавляет второго пассажира', async ({ page }) => {
  await page.goto('/booking/fl_1');

  await page.getByTestId('add-passenger').click();

  await expect(
    page.getByTestId('passenger-1-firstName'),
  ).toBeVisible();

  await expect(
    page.getByTestId('passenger-1-document'),
  ).toBeVisible();
});

test('Успешно создаёт бронь', async ({ page }) => {
  let requestBody: Record<string, unknown> | undefined;

  await page.route('**/api/bookings', async (route) => {
    requestBody = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      json: {
        code: 'AB1234',
        status: 'confirmed',
        flight,
        passengers: [],
        contact: {
          email: 'test@example.com',
          phone: '+79991234567',
        },
        totalPrice: { amount: 5400, currency: 'RUB' },
        createdAt: '2026-07-01T10:00:00Z',
      },
    });
  });

  await page.goto('/booking/fl_1');

  await page.getByTestId('contact-email').fill('test@example.com');
  await page.getByTestId('contact-phone').fill('+79991234567');
  await fillPassenger(page, 0);

  await page.getByTestId('booking-submit').click();

  await expect(page.getByTestId('booking-success')).toBeVisible();
  await expect(page.getByTestId('booking-code')).toHaveText('AB1234');

  expect(requestBody).toMatchObject({
    flightId: 'fl_1',
    contact: {
      email: 'test@example.com',
      phone: '+79991234567',
    },
    passengers: [
      {
        firstName: 'Иван',
        lastName: 'Петров',
        dateOfBirth: '1990-05-20',
        documentNumber: '4509123456',
      },
    ],
  });
});

test('Показывает ошибку валидации сервера', async ({ page }) => {
  await page.route('**/api/bookings', (route) =>
    route.fulfill({
      status: 400,
      json: {
        code: 'validation_error',
        message: 'Некорректные данные пассажира',
      },
    }),
  );

  await page.goto('/booking/fl_1');

  await page.getByTestId('contact-email').fill('test@example.com');
  await page.getByTestId('contact-phone').fill('+79991234567');
  await fillPassenger(page, 0);

  await page.getByTestId('booking-submit').click();

  await expect(page.getByTestId('booking-error')).toHaveText(
    'Некорректные данные пассажира',
  );
});

test('Показывает сообщение для неизвестного рейса', async ({ page }) => {
  await page.route('**/api/flights/unknown', (route) =>
    route.fulfill({
      status: 404,
      json: { code: 'not_found', message: 'Рейс не найден' },
    }),
  );

  await page.goto('/booking/unknown');

  await expect(page.getByTestId('flight-not-found')).toBeVisible();
  await expect(page.getByTestId('booking-form')).toHaveCount(0);
});
