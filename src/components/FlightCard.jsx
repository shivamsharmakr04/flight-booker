import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlightCard({ flight, onBook }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    const flightInfo = `✈️ ${flight.airline} (${flight.flight_id}): ${flight.departure_city} ➔ ${flight.arrival_city} at ₹${flight.current_price}`;
    navigator.clipboard?.writeText(flightInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate airline badge color based on airline name
  const getAirlineColor = (name = '') => {
    if (name.includes('IndiGo')) return 'from-indigo-600 to-blue-700';
    if (name.includes('Air India')) return 'from-rose-600 to-red-700';
    if (name.includes('SpiceJet')) return 'from-amber-500 to-orange-600';
    if (name.includes('Vistara')) return 'from-purple-600 to-indigo-800';
    if (name.includes('Akasa')) return 'from-amber-600 to-yellow-600';
    return 'from-blue-600 to-cyan-600';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Airline Info & Flight Header */}
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAirlineColor(flight.airline)} text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform`}>
            {flight.airline ? flight.airline[0] : '✈'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-base">{flight.airline}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-mono text-xs font-semibold">
                {flight.flight_id}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                On Time
              </span>
              {flight.surge_applied_at && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  ⚡ Surge Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Route Timeline Graphic */}
        <div className="flex-2 flex items-center justify-center gap-4 py-2 px-4 bg-slate-50/80 rounded-xl border border-slate-100">
          {/* Departure */}
          <div className="text-right min-w-[80px]">
            <div className="text-xl font-black text-slate-800 tracking-tight">
              {flight.departure_city}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Departure
            </div>
          </div>

          {/* Animated Flight Path Icon */}
          <div className="flex-1 flex flex-col items-center px-2 min-w-[120px]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>1h 45m</span>
            </div>

            <div className="w-full flex items-center gap-1 relative">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 rounded-full"></div>
              <div className="bg-blue-600 text-white rounded-full p-1 shadow-md shadow-blue-500/30 transform hover:scale-125 transition-transform">
                <svg className="w-3.5 h-3.5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-400 rounded-full"></div>
            </div>

            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Direct Flight</div>
          </div>

          {/* Arrival */}
          <div className="text-left min-w-[80px]">
            <div className="text-xl font-black text-slate-800 tracking-tight">
              {flight.arrival_city}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Arrival
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between lg:justify-end gap-6 flex-1">
          <div className="text-left lg:text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Price</div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              ₹{Number(flight.current_price).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Includes taxes & fees</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 transition-all text-xs font-semibold flex items-center gap-1 shadow-sm"
              title="Share Flight Info"
            >
              {copied ? (
                <span className="text-emerald-600 font-bold text-xs">Copied!</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onBook(flight)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 shimmer-btn"
            >
              <span>Book Ticket</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </div>
        </div>

      </div>

      {/* Accordion Toggle Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Cabin Bag: 7kg
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Check-in: 15kg
          </span>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>{showDetails ? 'Hide Details' : 'Flight Details'}</span>
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Flight Details Accordion */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In-Flight Amenities</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-white text-slate-700 text-[11px] rounded-md border border-slate-200">📶 Free Wi-Fi</span>
                  <span className="px-2 py-0.5 bg-white text-slate-700 text-[11px] rounded-md border border-slate-200">🍱 Complimentary Meals</span>
                  <span className="px-2 py-0.5 bg-white text-slate-700 text-[11px] rounded-md border border-slate-200">🔌 USB Power</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cancellation Policy</div>
                <div className="mt-1.5 text-xs text-slate-600">
                  Refundable ticket up to 24h prior to departure. Zero convenience fee on wallet payments.
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price Breakdown</div>
                <div className="mt-1.5 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span className="font-semibold">₹{Number(flight.base_price || flight.current_price).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">SkyPass Special</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
