
export type City = {
  code: string;
  name: string;
  country: string;
};

export type Flight = {
  id: string;
  flightNumber: string;
  airline: {
    code: string;
    name: string;
  };
  origin: City;
  destination: City;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  price: {
    amount: number;
    currency: string;
  };
  seatsAvailable: number;
};

export type FlightSearchParams = {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
};

export async function getCities(): Promise<City[]> {
  const response = await fetch('/api/cities');

  if (!response.ok) {
    throw new Error('Не удалось загрузить города');
  }

  return response.json();
}

export async function searchFlights(
  params: FlightSearchParams,
): Promise<Flight[]> {
  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    passengers: String(params.passengers),
  });

  const response = await fetch(`/api/flights?${query}`);

  if (!response.ok) {
    throw new Error('Не удалось найти рейсы');
  }

  return response.json();
}

export async function getFlightById(
  id: string,
): Promise<Flight | null> {
  const response = await fetch(
    `/api/flights/${encodeURIComponent(id)}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Не удалось загрузить рейс');
  }

  return response.json();
}
