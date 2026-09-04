import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { searchFlights, bookFlight } from '../api';
import FlightCard from '../components/FlightCard';
import BookingModal from '../components/BookingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../components/NotificationSystem';

function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Search({ user, setUser }) {
  const [departureQuery, setDepartureQuery] = useState('');
  const [arrivalQuery, setArrivalQuery] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [tripType, setTripType] = useState('oneway');

  const debouncedDeparture = useDebounce(departureQuery, 400);
  const debouncedArrival = useDebounce(arrivalQuery, 400);

  const [flightsRaw, setFlightsRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [selectedAirline, setSelectedAirline] = useState('');
  const [selectedDepartureCity, setSelectedDepartureCity] = useState('');
  const [selectedArrivalCity, setSelectedArrivalCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minPrice, setMinPrice] = useState(0);
  const [sortBy, setSortBy] = useState('price_asc');

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const popularRoutes = [
    { from: 'Delhi', to: 'Mumbai', label: 'Delhi ➔ Mumbai' },
    { from: 'Bangalore', to: 'Goa', label: 'Bangalore ➔ Goa' },
    { from: 'Mumbai', to: 'Dubai', label: 'Mumbai ➔ Dubai' },
    { from: 'Chennai', to: 'Kolkata', label: 'Chennai ➔ Kolkata' }
  ];

  const swapLocations = () => {
    const temp = departureQuery;
    setDepartureQuery(arrivalQuery);
    setArrivalQuery(temp);
  };

  const fetchFlights = useCallback(async (dep = '', arr = '', date = '') => {
    setLoading(true);
    try {
      const data = await searchFlights({ departure: dep, arrival: arr, date });
      const normalized = (data || []).map(f => ({
        ...f,
        current_price: Number(f.current_price ?? f.base_price ?? 0),
        base_price: Number(f.base_price ?? f.current_price ?? 0)
      }));
      setFlightsRaw(normalized);
      const prices = normalized.map(f => f.current_price);
      if (prices.length) {
        setMaxPrice(Math.max(...prices));
        setMinPrice(Math.min(...prices));
      } else {
        setMaxPrice(15000);
        setMinPrice(0);
      }
    } catch (err) {
      console.error('Search error', err);
      notify('Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights(debouncedDeparture, debouncedArrival, travelDate);
  }, [debouncedDeparture, debouncedArrival, travelDate, fetchFlights]);

  const airlines = useMemo(() => {
    const s = new Set(flightsRaw.map(f => f.airline).filter(Boolean));
    return ['', ...Array.from(s).sort()];
  }, [flightsRaw]);

  const departureCities = useMemo(() => {
    const s = new Set(flightsRaw.map(f => f.departure_city).filter(Boolean));
    return ['', ...Array.from(s).sort()];
  }, [flightsRaw]);

  const arrivalCities = useMemo(() => {
    const s = new Set(flightsRaw.map(f => f.arrival_city).filter(Boolean));
    return ['', ...Array.from(s).sort()];
  }, [flightsRaw]);

  const flights = useMemo(() => {
    let out = flightsRaw.slice();

    if (selectedAirline) out = out.filter(f => f.airline === selectedAirline);
    if (selectedDepartureCity) out = out.filter(f => f.departure_city === selectedDepartureCity);
    if (selectedArrivalCity) out = out.filter(f => f.arrival_city === selectedArrivalCity);

    out = out.filter(f => {
      const price = Number(f.current_price ?? f.base_price ?? 0);
      return price >= minPrice && price <= maxPrice;
    });

    if (sortBy === 'price_asc') {
      out.sort((a, b) => (a.current_price ?? 0) - (b.current_price ?? 0));
    } else if (sortBy === 'price_desc') {
      out.sort((a, b) => (b.current_price ?? 0) - (a.current_price ?? 0));
    } else if (sortBy === 'airline_asc') {
      out.sort((a, b) => (a.airline || '').localeCompare(b.airline || ''));
    }

    return out;
  }, [flightsRaw, selectedAirline, selectedDepartureCity, selectedArrivalCity, minPrice, maxPrice, sortBy]);

  function openBooking(flight) {
    if (!user) {
      notify('warning', 'Please sign in to book your flight');
      navigate('/signin');
      return;
    }
    setSelectedFlight(flight);
    setModalOpen(true);
  }

  async function confirmBooking({ passengers, paymentMethod, paymentDetails }) {
    if (!user) {
      notify('warning', 'Please sign in to book tickets');
      return;
    }

    const passengerName = passengers.map(p => p.name).join(', ');

    try {
      const res = await bookFlight({
        flightId: selectedFlight.flight_id,
        passengerName,
        paymentMethod,
        paymentDetails
      });

      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
      notify('success', `Booking confirmed ✈️ (PNR: ${res.pnr})`);
      setModalOpen(false);
      navigate('/bookings');
    } catch (err) {
      console.error(err);
      notify('error', 'Booking failed. Please try again.');
    }
  }

  function clearFilters() {
    setDepartureQuery('');
    setArrivalQuery('');
    setTravelDate('');
    setSelectedAirline('');
    setSelectedDepartureCity('');
    setSelectedArrivalCity('');
    setSortBy('price_asc');
  }

  const handleChipClick = (route) => {
    setDepartureQuery(route.from);
    setArrivalQuery(route.to);
    fetchFlights(route.from, route.to, travelDate);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-4xl mx-auto space-y-5 text-center">
          
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 text-xs font-bold uppercase tracking-wider text-sky-400 border border-slate-700">
              ✈ Search 250+ Routes
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Find & Book Your Flight
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Real-time price comparisons, transparent fares, zero convenience charges, and instant ticket PDF generation.
          </p>

          {/* Quick Route Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Popular Routes:</span>
            {popularRoutes.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(r)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-blue-700 border border-slate-700 text-xs font-semibold text-white transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Search & Filter Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Search Panel (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Flight Search Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            
            {/* Trip Type Pills */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <button
                onClick={() => setTripType('oneway')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tripType === 'oneway' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                One Way
              </button>
              <button
                onClick={() => setTripType('roundtrip')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tripType === 'roundtrip' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Round Trip
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
              
              {/* Departure */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  From (Departure)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={departureQuery}
                  onChange={(e) => setDepartureQuery(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs font-semibold text-slate-900"
                />
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pb-0.5">
                <button
                  onClick={swapLocations}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                  title="Swap Origin & Destination"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              {/* Arrival */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  To (Destination)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={arrivalQuery}
                  onChange={(e) => setArrivalQuery(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs font-semibold text-slate-900"
                />
              </div>

              {/* Travel Date */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs font-semibold text-slate-900"
                />
              </div>

            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => fetchFlights(departureQuery, arrivalQuery, travelDate)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Search Flights
              </button>
            </div>

          </div>

          {/* Flights List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Available Flights <span className="text-slate-500 font-semibold">({flights.length})</span>
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="price_asc">Sort: Price Low ➔ High</option>
                <option value="price_desc">Sort: Price High ➔ Low</option>
                <option value="airline_asc">Sort: Airline A ➔ Z</option>
              </select>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <p className="mt-3 text-xs font-semibold text-slate-600">Loading flights...</p>
              </div>
            ) : flights.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto font-bold">
                  ✈
                </div>
                <h3 className="text-sm font-bold text-slate-900">No flights found</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Try searching for different cities or clear your filter parameters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((f) => (
                  <FlightCard key={f.flight_id} flight={f} onBook={openBooking} />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Filters Sidebar (1 Column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Filter Flights</span>
              <button onClick={clearFilters} className="text-[11px] text-blue-700 hover:underline">Reset</button>
            </h3>

            {/* Filter by Airline */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Filter by Airline
              </label>
              <select
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
              >
                {airlines.map((a) => (
                  <option key={a || 'all'} value={a}>
                    {a || 'All Airlines'}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Departure City
              </label>
              <select
                value={selectedDepartureCity}
                onChange={(e) => setSelectedDepartureCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
              >
                {departureCities.map((c) => (
                  <option key={c || 'all'} value={c}>
                    {c || 'All Departure Cities'}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                <span>Max Price</span>
                <span className="text-blue-800 font-extrabold">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <BookingModal
            flight={selectedFlight}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={confirmBooking}
            user={user}
            setUser={setUser}
          />
        )}
      </AnimatePresence>

    </div>
  );
}