
import { useState, type FormEvent } from 'react';

import type { City, FlightSearchParams } from '../api/flights';

type Props = {
  cities: City[];
  initialParams: FlightSearchParams;
  onSearch: (params: FlightSearchParams) => void;
};

export function FlightSearchForm({
  cities,
  initialParams,
  onSearch,
}: Props) {
  const [origin, setOrigin] = useState(initialParams.origin);
  const [destination, setDestination] = useState(initialParams.destination);
  const [date, setDate] = useState(initialParams.date);
  const [passengers, setPassengers] = useState(
    initialParams.passengers,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSearch({
      origin,
      destination,
      date,
      passengers,
    });
  };

  return (
    <form data-testid="flight-search-form" onSubmit={handleSubmit}>
      <h2>Поиск авиабилетов</h2>

      <label htmlFor="origin">Откуда</label>
      <select
        id="origin"
        data-testid="search-origin"
        value={origin}
        onChange={(event) => setOrigin(event.target.value)}
        required
      >
        <option value="">Выберите город</option>
        {cities.map((city) => (
          <option key={city.code} value={city.code}>
            {city.name}
          </option>
        ))}
      </select>

      <label htmlFor="destination">Куда</label>
      <select
        id="destination"
        data-testid="search-destination"
        value={destination}
        onChange={(event) => setDestination(event.target.value)}
        required
      >
        <option value="">Выберите город</option>
        {cities.map((city) => (
          <option key={city.code} value={city.code}>
            {city.name}
          </option>
        ))}
      </select>

      <label htmlFor="date">Дата вылета</label>
      <input
        id="date"
        data-testid="search-date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />

      <label htmlFor="passengers">Пассажиры</label>
      <input
        id="passengers"
        data-testid="search-passengers"
        type="number"
        min="1"
        value={passengers}
        onChange={(event) =>
          setPassengers(Number(event.target.value))
        }
        required
      />

      <button type="submit" data-testid="search-submit">
        Найти
      </button>
    </form>
  );
}
