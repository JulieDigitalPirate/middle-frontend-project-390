
import type { Flight } from './flights';

export type Passenger = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  documentNumber: string;
};

export type Contact = {
  email: string;
  phone: string;
};

export type CreateBookingRequest = {
  flightId: string;
  contact: Contact;
  passengers: Passenger[];
};

export type Booking = {
  code: string;
  status: string;
  flight: Flight;
  passengers: Passenger[];
  contact: Contact;
  totalPrice: {
    amount: number;
    currency: string;
  };
  createdAt: string;
};

export async function createBooking(
  data: CreateBookingRequest,
): Promise<Booking> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: { message?: string } = await response
      .json()
      .catch(() => ({}));

    throw new Error(error.message || 'Не удалось создать бронирование');
  }

  return response.json();
}
