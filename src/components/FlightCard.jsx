import React from 'react';
import { motion } from 'framer-motion';

export default function FlightCard({ flight, onBook }) {
  return (
    <motion.div
      layout
      whileHover={{ translateY: -6, boxShadow: '0 8px 30px rgba(2,6,23,0.12)' }}
      className="bg-white rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border"
    >
      <div>
        <div className="text-sm text-slate-500">{flight.airline} • <span className="font-mono text-xs">{flight.flight_id}</span></div>
        <div className="mt-2 font-semibold text-lg">{flight.departure_city} → {flight.arrival_city}</div>
        <div className="text-sm text-slate-500 mt-1">Seats: Available • Duration: 1h 30m</div>
      </div>

      <div className="hidden sm:block text-center">
        <div className="text-xs text-slate-500">Price</div>
        <div className="mt-2 text-2xl font-bold">₹{flight.current_price}</div>
        <div className="text-xs text-amber-600 mt-1">{flight.surge_applied_at ? 'Surge pricing active' : 'Standard price'}</div>
      </div>

      <div className="flex justify-between sm:justify-end items-center gap-3">
        <button onClick={() => onBook(flight)} className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow hover:scale-[1.01] transition">Book</button>
        <button onClick={() => {
          // simple share/copy PNR or flight info
          navigator.clipboard?.writeText(`${flight.airline} ${flight.flight_id} ${flight.departure_city}-${flight.arrival_city}`);
          alert('Flight info copied to clipboard');
        }} className="px-3 py-2 rounded border text-sm">Share</button>
      </div>

      {/* mobile price row */}
      <div className="sm:hidden col-span-3 flex items-center justify-between pt-2">
        <div className="text-sm text-slate-500">Price</div>
        <div className="text-lg font-semibold">₹{flight.current_price}</div>
      </div>
    </motion.div>
  );
}
