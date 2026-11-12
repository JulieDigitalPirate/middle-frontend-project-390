
import { useState, type FormEvent } from 'react';

import {
  createBooking,
  type Booking,
  type Passenger,
} from '../api/bookings';

type Props = {
  flightId: string;
};

const emptyPassenger = (): Passenger => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  documentNumber: '',
});

export function BookingForm({ flightId }: Props) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passengers, setPassengers] = useState<Passenger[]>([
    emptyPassenger(),
  ]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    setPassengers((current) =>
      current.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createBooking({
        flightId,
        contact: { email, phone },
        passengers,
      });

      setBooking(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось создать бронирование',
      );
    } finally {
      setLoading(false);
    }
  };

  if (booking) {
    return (
      <section data-testid="booking-success">
        <h2>Бронирование успешно оформлено!</h2>
        <p>
          Код бронирования:{' '}
          <strong data-testid="booking-code">{booking.code}</strong>
        </p>
      </section>
    );
  }

  return (
    <form data-testid="booking-form" onSubmit={handleSubmit}>
      <h2>Контактные данные</h2>

      <label htmlFor="contact-email">Email</label>
      <input
        id="contact-email"
        data-testid="contact-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label htmlFor="contact-phone">Телефон</label>
      <input
        id="contact-phone"
        data-testid="contact-phone"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        required
      />

      {passengers.map((passenger, index) => (
        <fieldset key={index}>
          <legend>Пассажир {index + 1}</legend>

          <label htmlFor={`firstName-${index}`}>Имя</label>
          <input
            id={`firstName-${index}`}
            data-testid={`passenger-${index}-firstName`}
            value={passenger.firstName}
            onChange={(event) =>
              updatePassenger(index, 'firstName', event.target.value)
            }
            required
          />

          <label htmlFor={`lastName-${index}`}>Фамилия</label>
          <input
            id={`lastName-${index}`}
            data-testid={`passenger-${index}-lastName`}
            value={passenger.lastName}
            onChange={(event) =>
              updatePassenger(index, 'lastName', event.target.value)
            }
            required
          />

          <label htmlFor={`dob-${index}`}>Дата рождения</label>
          <input
            id={`dob-${index}`}
            data-testid={`passenger-${index}-dob`}
            type="date"
            value={passenger.dateOfBirth}
            onChange={(event) =>
              updatePassenger(index, 'dateOfBirth', event.target.value)
            }
            required
          />

          <label htmlFor={`document-${index}`}>Документ</label>
          <input
            id={`document-${index}`}
            data-testid={`passenger-${index}-document`}
            value={passenger.documentNumber}
            onChange={(event) =>
              updatePassenger(index, 'documentNumber', event.target.value)
            }
            required
          />
        </fieldset>
      ))}

      <button
        type="button"
        data-testid="add-passenger"
        onClick={() =>
          setPassengers((current) => [...current, emptyPassenger()])
        }
      >
        Добавить пассажира
      </button>

      {error && (
        <p role="alert" data-testid="booking-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        data-testid="booking-submit"
        disabled={loading}
      >
        {loading ? 'Оформление...' : 'Оформить бронирование'}
      </button>
    </form>
  );
}
