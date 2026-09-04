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
  const [tripType, setTripType] = useState('oneway'); // oneway or roundtrip

  const debouncedDeparture = useDebounce(departureQuery, 400);
  const debouncedArrival = useDebounce(arrivalQuery, 400);

  const [flightsRaw, setFlightsRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotify();

  // Filters & sorting
  const [selectedAirline, setSelectedAirline] = useState('');
  const [selectedDepartureCity, setSelectedDepartureCity] = useState('');
  const [selectedArrivalCity, setSelectedArrivalCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minPrice, setMinPrice] = useState(0);
  const [sortBy, setSortBy] = useState('price_asc');

  // Booking modal
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Popular routes for quick search chips
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

  async function confirmBooking({ passengers, paymentMethod }) {
    if (!user) {
      notify('warning', 'Please sign in to book tickets');
      return;
    }

    const passengerName = passengers.map(p => p.name).join(', ');

    try {
      const res = await bookFlight({
        flightId: selectedFlight.flight_id,
        passengerName,
        paymentMethod
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
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center">
          
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase text-sky-300 border border-white/10">
              ✈ Explore 250+ Global Routes
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-sky-100 to-blue-200 bg-clip-text text-transparent"
          >
            Fly Anywhere. Pay Less.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto"
          >
            Real-time price comparisons, instant ticket downloads, zero hidden fees, and seamless wallet payments.
          </motion.p>

          {/* Quick Route Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Trending Routes:</span>
            {popularRoutes.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(r)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition-all transform hover:scale-105"
              >
                {r.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Main Search & Filter Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Search Panel (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Flight Search Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-900/5 space-y-5"
          >
            {/* Trip Type Pills */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <button
                onClick={() => setTripType('oneway')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  tripType === 'oneway' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                One Way
              </button>
              <button
                onClick={() => setTripType('roundtrip')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  tripType === 'roundtrip' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Round Trip
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
              
              {/* Departure */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  From (Departure)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={departureQuery}
                  onChange={(e) => setDepartureQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pb-1">
                <motion.button
                  whileHover={{ rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={swapLocations}
                  className="p-3 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors"
                  title="Swap Origin & Destination"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </motion.button>
              </div>

              {/* Arrival */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  To (Destination)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={arrivalQuery}
                  onChange={(e) => setArrivalQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Travel Date */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-slate-800"
                />
              </div>

            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => fetchFlights(departureQuery, arrivalQuery, travelDate)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all"
              >
                Search Available Flights
              </button>
            </div>

          </motion.div>

          {/* Flights List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold text-slate-800">
                Available Flights <span className="text-slate-400 font-normal">({flights.length})</span>
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="price_asc">Sort: Price Low ➔ High</option>
                <option value="price_desc">Sort: Price High ➔ Low</option>
                <option value="airline_asc">Sort: Airline A ➔ Z</option>
              </select>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="mt-3 text-sm text-slate-500 font-medium">Fetching real-time flights...</p>
              </div>
            ) : flights.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800">No flights found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try searching for different cities or clear your filter criteria to see available flights.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {flights.map((f) => (
                  <FlightCard key={f.flight_id} flight={f} onBook={openBooking} />
                ))}
              </AnimatePresence>
            )}
          </div>

        </div>

        {/* Filters Sidebar (1 Column) */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-900/5 space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Filter Flights</span>
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Reset</button>
            </h3>

            {/* Filter by Airline */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Filter by Airline
              </label>
              <select
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Departure City
              </label>
              <select
                value={selectedDepartureCity}
                onChange={(e) => setSelectedDepartureCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
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
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <span>Max Price</span>
                <span className="text-blue-600 font-extrabold">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
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
          />
        )}
      </AnimatePresence>

    </div>
  );
}