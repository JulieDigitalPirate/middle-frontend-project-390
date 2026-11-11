
import { test, expect } from '@playwright/test';

const cities = [
  { code: 'MOW', name: 'Москва', country: 'Россия' },
  { code: 'LED', name: 'Санкт-Петербург', country: 'Россия' },
];

const flight = {
  id: 'fl_1',
  flightNumber: 'SU1234',
  airline: { code: 'SU', name: 'Аэрофлот' },
  origin: cities[0],
  destination: cities[1],
  departureAt: '2026-11-20T08:00:00Z',
  arrivalAt: '2026-11-20T09:25:00Z',
  durationMinutes: 85,
  price: { amount: 5400, currency: 'RUB' },
  seatsAvailable: 42,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/cities', (route) =>
    route.fulfill({ json: cities }),
  );
});

test('Показывает рейсы при открытии страницы', async ({ page }) => {
  await page.route('**/api/flights?*', (route) =>
    route.fulfill({ json: [flight] }),
  );

  await page.goto('/');

  await expect(page.getByTestId('flight-search-form')).toBeVisible();
  await expect(page.getByTestId('flight-result-item')).toHaveCount(1);
  await expect(page.getByText('Аэрофлот')).toBeVisible();
  await expect(page.getByText('5400 RUB')).toBeVisible();

  await expect(page.getByTestId('book-flight')).toHaveAttribute(
    'href',
    '/booking/fl_1',
  );
});

test('Отправляет выбранные параметры поиска', async ({ page }) => {
  let searchUrl = '';

  await page.route('**/api/flights?*', (route) => {
    searchUrl = route.request().url();
    return route.fulfill({ json: [flight] });
  });

  await page.goto('/');

  await page.getByTestId('search-origin').selectOption('LED');
  await page.getByTestId('search-destination').selectOption('MOW');
  await page.getByTestId('search-date').fill('2026-11-20');
  await page.getByTestId('search-passengers').fill('2');
  await page.getByTestId('search-submit').click();

  await expect.poll(() => {
    if (!searchUrl) return '';
    return new URL(searchUrl).searchParams.get('origin');
  }).toBe('LED');

  const params = new URL(searchUrl).searchParams;

  expect(params.get('destination')).toBe('MOW');
  expect(params.get('date')).toBe('2026-11-20');
  expect(params.get('passengers')).toBe('2');
});

test('Показывает сообщение, если рейсов нет', async ({ page }) => {
  await page.route('**/api/flights?*', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.goto('/');

  await expect(page.getByTestId('flights-empty')).toBeVisible();
  await expect(page.getByTestId('flight-result-item')).toHaveCount(0);
});

test('Показывает ошибку при неудачном запросе', async ({ page }) => {
  await page.route('**/api/flights?*', (route) =>
    route.fulfill({
      status: 500,
      json: { message: 'Server error' },
    }),
  );

  await page.goto('/');

  await expect(page.getByTestId('flights-error')).toBeVisible();
});
