
import { useEffect, useState } from 'react';
import { BookingForm } from './BookingForm';
import { getFlightById, type Flight } from '../api/flights';

type Props = {
  flightId: string;
};

export function BookingPage({ flightId }: Props) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getFlightById(flightId)
      .then((result) => {
        if (cancelled) return;

        if (result === null) {
          setNotFound(true);
        } else {
          setFlight(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Не удалось загрузить рейс');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [flightId]);

  if (loading) {
    return <p>Загрузка рейса...</p>;
  }

  if (notFound) {
    return (
      <main>
        <h1 data-testid="flight-not-found">Рейс не найден</h1>
        <a href="/">Вернуться к поиску</a>
      </main>
    );
  }

  if (error || !flight) {
    return (
      <main>
        <h1>Оформление бронирования</h1>
        <p role="alert">{error || 'Не удалось загрузить рейс'}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Оформление бронирования</h1>

      <section data-testid="booking-flight">
        <h2>
          {flight.origin.name} → {flight.destination.name}
        </h2>

        <p>
          {flight.airline.name} · {flight.flightNumber}
        </p>

        <p>
          Вылет: {new Date(flight.departureAt).toLocaleString('ru-RU')}
        </p>

        <p>
          Прилёт: {new Date(flight.arrivalAt).toLocaleString('ru-RU')}
        </p>

        <p>
          Цена: {flight.price.amount} {flight.price.currency}
        </p>
      </section>
      <BookingForm flightId={flight.id} />
    </main>
  );
}
