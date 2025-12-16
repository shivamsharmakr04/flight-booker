import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { searchFlights, bookFlight, getUser } from '../api';
import FlightCard from '../components/FlightCard';
import BookingModal from '../components/BookingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../components/NotificationSystem';

// simple debounce
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
  const debouncedDeparture = useDebounce(departureQuery, 400);
  const debouncedArrival = useDebounce(arrivalQuery, 400);

  const [flightsRaw, setFlightsRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotify();

  // filters & sort state
  const [selectedAirline, setSelectedAirline] = useState('');
  const [selectedDepartureCity, setSelectedDepartureCity] = useState('');
  const [selectedArrivalCity, setSelectedArrivalCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minPrice, setMinPrice] = useState(0);
  const [sortBy, setSortBy] = useState('price_asc'); // price_asc, price_desc, airline_asc, dep_asc

  // booking modal
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Swap origin and destination
  const swapLocations = () => {
    setDepartureQuery(arrivalQuery);
    setArrivalQuery(departureQuery);
  };

  // Fetch flights from server (by departure/arrival)
  const fetchFlights = useCallback(async (dep = '', arr = '', date = '') => {
    setLoading(true);
    try {
      const data = await searchFlights({ departure: dep, arrival: arr, date });
      // ensure numeric price fields exist and set defaults
      const normalized = (data || []).map(f => ({
        ...f,
        current_price: Number(f.current_price ?? f.base_price ?? 0),
        base_price: Number(f.base_price ?? f.current_price ?? 0)
      }));
      setFlightsRaw(normalized);
      // update price slider bounds based on returned flights
      const prices = normalized.map(f => f.current_price);
      if (prices.length) {
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        setMaxPrice(max); // default to max (user can lower)
        setMinPrice(min); // default min
      } else {
        setMaxPrice(10000);
        setMinPrice(0);
      }
    } catch (err) {
      console.error('Search error', err);
      notify('Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  }, []);

  // refetch when debounced queries change
  useEffect(() => {
    fetchFlights(debouncedDeparture, debouncedArrival, travelDate);
  }, [debouncedDeparture, debouncedArrival, travelDate, fetchFlights]);

  // derived lists for filter dropdowns
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

  // apply filters & sorting client-side
  const flights = useMemo(() => {
    let out = flightsRaw.slice();

    // filter by selected airline / cities
    if (selectedAirline) out = out.filter(f => f.airline === selectedAirline);
    if (selectedDepartureCity) out = out.filter(f => f.departure_city === selectedDepartureCity);
    if (selectedArrivalCity) out = out.filter(f => f.arrival_city === selectedArrivalCity);

    // filter by price range (minPrice and maxPrice are controlled; treat user maxPrice as upper bound)
    out = out.filter(f => {
      const price = Number(f.current_price ?? f.base_price ?? 0);
      return price >= minPrice && price <= maxPrice;
    });

    // sort
    if (sortBy === 'price_asc') {
      out.sort((a, b) => (a.current_price ?? 0) - (b.current_price ?? 0));
    } else if (sortBy === 'price_desc') {
      out.sort((a, b) => (b.current_price ?? 0) - (a.current_price ?? 0));
    } else if (sortBy === 'airline_asc') {
      out.sort((a, b) => (a.airline || '').localeCompare(b.airline || ''));
    } else if (sortBy === 'dep_asc') {
      out.sort((a, b) => (a.departure_city || '').localeCompare(b.departure_city || ''));
    }

    return out;
  }, [flightsRaw, selectedAirline, selectedDepartureCity, selectedArrivalCity, minPrice, maxPrice, sortBy]);

  // open booking modal
  function openBooking(flight) {
    setSelectedFlight(flight);
    setModalOpen(true);
  }

  // confirm booking -> call backend bookFlight and update user
  async function confirmBooking({ passengers, paymentMethod }) {
    if (!user) {
      alert('Please sign in to book tickets');
      return;
    }

    const passengerName = passengers.map(p => p.name).join(', ');

    try {
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        await new Promise(res => setTimeout(res, 1000));
      }

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
  console.log("FULL ERROR OBJECT:", err);

  if (err.response) {
    console.log("STATUS:", err.response.status);
    console.log("DATA:", err.response.data);
    notify('error', `Booking failed: ${JSON.stringify(err.response.data)}`);
  } else if (err.request) {
    console.log("NO RESPONSE FROM SERVER:", err.request);
    notify('error', "Server not responding (backend not reachable)");
  } else {
    console.log("JS ERROR:", err.message);
    notify('error', err.message);
  }
}

  }
  function clearFilters() {
    setDepartureQuery('');
    setArrivalQuery('');
    setTravelDate('');
    setSelectedAirline('');
    setSelectedDepartureCity('');
    setSelectedArrivalCity('');
    // recompute price bounds from flightsRaw (if available)
    const prices = flightsRaw.map(f => f.current_price);
    if (prices.length) {
      setMaxPrice(Math.max(...prices));
      setMinPrice(Math.min(...prices));
    } else {
      setMaxPrice(10000);
      setMinPrice(0);
    }
    setSortBy('price_asc');
  }

  function handleSearch() {
    fetchFlights(departureQuery, arrivalQuery, travelDate);
  }

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Search Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Find Your Perfect Flight</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Departure Input */}
            <div className="flex-1 relative">
              <label className="text-sm text-slate-600 font-medium">From</label>
              <input 
                value={departureQuery} 
                onChange={(e) => setDepartureQuery(e.target.value)}
                placeholder="e.g. Delhi" 
                className="w-full rounded-lg border border-gray-300 p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Swap Button */}
            <motion.button
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="self-center md:self-start mt-8 md:mt-16"
              onClick={swapLocations}
              aria-label="Swap locations"
            >
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </motion.button>

            {/* Arrival Input */}
            <div className="flex-1 relative">
              <label className="text-sm text-slate-600 font-medium">To</label>
              <input 
                value={arrivalQuery} 
                onChange={(e) => setArrivalQuery(e.target.value)}
                placeholder="e.g. Mumbai" 
                className="w-full rounded-lg border border-gray-300 p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Date Picker */}
            <div className="flex-1 relative">
              <label className="text-sm text-slate-600 font-medium">Travel Date</label>
              <input 
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                Search
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Clear
              </motion.button>
            </div>
          </div>

          {/* Filters Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="text-xs text-slate-600 font-medium">Airline</label>
              <select 
                value={selectedAirline} 
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {airlines.map(a => (
                  <option key={a || 'all'} value={a}>{a || 'All airlines'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium">Departure city</label>
              <select 
                value={selectedDepartureCity} 
                onChange={(e) => setSelectedDepartureCity(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {departureCities.map(c => (
                  <option key={c || 'all'} value={c}>{c || 'Any'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium">Arrival city</label>
              <select 
                value={selectedArrivalCity} 
                onChange={(e) => setSelectedArrivalCity(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {arrivalCities.map(c => (
                  <option key={c || 'all'} value={c}>{c || 'Any'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium">Sort by</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="airline_asc">Airline: A → Z</option>
                <option value="dep_asc">Departure: A → Z</option>
              </select>
            </div>
          </motion.div>

          {/* Price Range */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <label className="text-xs text-slate-600 font-medium">Price range (₹)</label>
            <div className="mt-2 flex gap-2 items-center">
              <input 
                type="number" 
                value={minPrice} 
                onChange={(e) => setMinPrice(Number(e.target.value || 0))}
                className="w-24 rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-sm text-slate-500">to</div>
              <input 
                type="number" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value || 0))}
                className="w-28 rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="ml-4 text-sm text-slate-500">({flights.length} results)</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Flights List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid gap-4"
        >
          {loading ? (
            <div className="text-center p-12 bg-white rounded-2xl shadow-lg">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading flights...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl shadow-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600">No flights found — try different filters</p>
            </div>
          ) : (
            <AnimatePresence>
              {flights.map((f, index) => (
                <motion.div
                  key={f.flight_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <FlightCard flight={f} onBook={openBooking} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Booking Modal */}
        <AnimatePresence>
          {selectedFlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BookingModal 
                flight={selectedFlight} 
                open={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onConfirm={confirmBooking} 
                user={user} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}