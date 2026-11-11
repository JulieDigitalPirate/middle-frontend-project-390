
import type { Flight } from '../api/flights';

type Props = {
  flight: Flight;
};

export function FlightCard({ flight }: Props) {
  return (
    <article data-testid="flight-result-item">
      <h3>{flight.airline.name}</h3>

      <p>Рейс: {flight.flightNumber}</p>

      <p>
        {flight.origin.name} → {flight.destination.name}
      </p>

      <p>
        Вылет:{' '}
        {new Date(flight.departureAt).toLocaleString('ru-RU')}
      </p>

      <p>
        Прилёт:{' '}
        {new Date(flight.arrivalAt).toLocaleString('ru-RU')}
      </p>

      <p>
        Цена: {flight.price.amount} {flight.price.currency}
      </p>

      <a
        href={`/booking/${flight.id}`}
        data-testid="book-flight"
      >
        Забронировать
      </a>
    </article>
  );
}
