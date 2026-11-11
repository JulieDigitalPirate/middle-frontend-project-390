import { useEffect, useState } from 'react';
import { FlightCard } from './components/FlightCard';
import {
  getCities,
  searchFlights,
  type City,
  type Flight,
  type FlightSearchParams,
} from './api/flights';
import { FlightSearchForm } from './components/FlightSearchForm';

const initialParams: FlightSearchParams = {
  origin: 'MOW',
  destination: 'LED',
  date: new Date().toLocaleDateString('en-CA'),
  passengers: 1,
};

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCities()
      .then(setCities)
      .catch(() => setError('Не удалось загрузить города'));
  }, []);

  const handleSearch = async (params: FlightSearchParams) => {
    setLoading(true);
    setError('');

    try {
      const result = await searchFlights(params);
      setFlights(result);
    } catch {
      setError('Не удалось загрузить рейсы');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  let cancelled = false;

  searchFlights(initialParams)
    .then((result) => {
      if (!cancelled) {
        setFlights(result);
      }
    })
    .catch(() => {
      if (!cancelled) {
        setError('Не удалось загрузить рейсы');
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
}, []);

  return (
    <main>
      <h1>Поиск авиабилетов</h1>

      <FlightSearchForm
        cities={cities}
        initialParams={initialParams}
        onSearch={handleSearch}
      />

      <section aria-label="Результаты поиска">
        <h2>Найденные рейсы</h2>

        {loading && <p>Загрузка рейсов...</p>}

        {error && (
          <p role="alert" data-testid="flights-error">
            {error}
          </p>
        )}

        {!loading && !error && flights.length === 0 && (
          <p data-testid="flights-empty">Рейсов не найдено</p>
        )}

        {!loading && !error && flights.length > 0 && (
          <div data-testid="flight-results">
            {flights.map((flight) => (
  <FlightCard key={flight.id} flight={flight} />
))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
