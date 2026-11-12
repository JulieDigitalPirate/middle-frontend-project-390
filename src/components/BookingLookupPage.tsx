
import { useState, type FormEvent } from 'react';

import {
  getBooking,
  cancelBooking,
  type Booking,
} from '../api/bookings';

export function BookingLookupPage() {
  const [code, setCode] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotFound(false);
    setBooking(null);

    try {
      const result = await getBooking(code.trim(), lastName.trim());

      if (result) {
        setBooking(result);
      } else {
        setNotFound(true);
      }
    } catch {
      setError('Не удалось найти бронирование');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setLoading(true);
    setError('');

    try {
      const result = await cancelBooking(code.trim(), lastName.trim());
      setBooking(result);
    } catch {
      setError('Не удалось отменить бронирование');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Мои брони</h1>

      <form data-testid="booking-lookup-form" onSubmit={handleSearch}>
        <label htmlFor="lookup-code">Код бронирования</label>
        <input
          id="lookup-code"
          data-testid="lookup-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />

        <label htmlFor="lookup-lastName">Фамилия</label>
        <input
          id="lookup-lastName"
          data-testid="lookup-lastName"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
        />

        <button
          type="submit"
          data-testid="lookup-submit"
          disabled={loading}
        >
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </form>

      {notFound && (
        <p data-testid="booking-not-found">
          Бронь не найдена. Проверьте код и фамилию.
        </p>
      )}

      {error && <p role="alert">{error}</p>}

      {booking && (
        <section data-testid="booking-details">
          <h2>Информация о бронировании</h2>

          <p>
            Код: <strong data-testid="booking-code">{booking.code}</strong>
          </p>

          <p>
            Статус:{' '}
            <strong
              data-testid="booking-status"
              data-status={booking.status}
            >
              {booking.status === 'confirmed'
                ? 'Подтверждено'
                : 'Отменено'}
            </strong>
          </p>

          <h3>Рейс</h3>
          <p>
            {booking.flight.origin.name} →{' '}
            {booking.flight.destination.name}
          </p>
          <p>
            {booking.flight.airline.name} ·{' '}
            {booking.flight.flightNumber}
          </p>
          <p>
            Вылет:{' '}
            {new Date(booking.flight.departureAt).toLocaleString('ru-RU')}
          </p>

          <h3>Пассажиры</h3>
          {booking.passengers.map((passenger, index) => (
            <p key={index}>
              {passenger.firstName} {passenger.lastName}
            </p>
          ))}

          <h3>Итоговая стоимость</h3>
          <p>
            {booking.totalPrice.amount}{' '}
            {booking.totalPrice.currency}
          </p>

          {booking.status === 'confirmed' && (
            <button
              type="button"
              data-testid="cancel-booking"
              onClick={handleCancel}
              disabled={loading}
            >
              Отменить бронирование
            </button>
          )}
        </section>
      )}
    </main>
  );
}
