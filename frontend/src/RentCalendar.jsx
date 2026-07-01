/* ── Rent Calendar ────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { api } from './api';

const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

/**
 * Availability calendar for a 'rent' listing. Fetches existing bookings for
 * this listing and greys them out; picking a free range and confirming
 * hits POST /api/bookings, where the actual overlap check happens
 * server-side — this component doesn't need to re-derive that logic, just
 * reflect what the backend already knows about.
 */
export function RentCalendar({ listing }) {
  const { user, navigate, toast } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState();
  const [submitting, setSubmitting] = useState(false);
  const [justBooked, setJustBooked] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.bookings.byListing(listing.id)
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => {}) // non-fatal — calendar just shows nothing disabled until reloaded
      .finally(() => setLoading(false));
  }, [listing.id]);

  const bookedRanges = bookings.map((b) => ({ from: new Date(b.startDate), to: new Date(b.endDate) }));

  const requestBooking = async () => {
    if (!user) { navigate('/login'); return; }
    if (!range?.from || !range?.to) return;
    setSubmitting(true);
    try {
      const { data } = await api.bookings.create(listing.id, range.from.toISOString(), range.to.toISOString());
      setBookings((prev) => [...prev, { startDate: data.booking.startDate, endDate: data.booking.endDate }]);
      setRange(undefined);
      setJustBooked(true);
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.message || 'Could not book those dates');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Ico n="calendar" c="w-5 h-5" /> Availability
      </h3>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Ico n="loader" c="w-5 h-5 spin" /></div>
      ) : (
        <div className="card rent-calendar" style={{ padding: 16 }}>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => { setRange(r); setJustBooked(false); }}
            disabled={[{ before: startOfToday() }, ...bookedRanges]}
          />
          {range?.from && (
            <p style={{ fontSize: '.85rem', color: 'var(--text-soft)', marginTop: 4 }}>
              {fmt(range.from)}{range.to ? ` → ${fmt(range.to)}` : ' — pick an end date'}
            </p>
          )}
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 12 }}
            onClick={requestBooking}
            disabled={submitting || !range?.from || !range?.to}
          >
            {submitting ? <Ico n="loader" c="w-4 h-4 spin" /> : user ? 'Request Booking' : 'Log in to book'}
          </button>
          {justBooked && (
            <p style={{ marginTop: 10, fontSize: '.85rem', fontWeight: 700, color: 'var(--teal)' }}>
              ✅ Booked! Those dates are now reserved for you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
