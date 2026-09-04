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

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Airline Info */}
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
            {flight.airline ? flight.airline[0] : '✈'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base">{flight.airline}</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-semibold">
                {flight.flight_id}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                On Time
              </span>
              {flight.surge_applied_at && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⚡ Surge Fare
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Route Visual Timeline */}
        <div className="flex-2 flex items-center justify-center gap-4 py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-right min-w-[80px]">
            <div className="text-lg font-black text-slate-900 tracking-tight">
              {flight.departure_city}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Departure
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-2 min-w-[120px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>1h 45m</span>
            </div>

            <div className="w-full flex items-center gap-1">
              <div className="h-0.5 flex-1 bg-slate-300 rounded-full"></div>
              <div className="bg-slate-900 text-white rounded-full p-1 shadow-sm">
                <svg className="w-3 h-3 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="h-0.5 flex-1 bg-slate-300 rounded-full"></div>
            </div>

            <div className="text-[10px] text-emerald-700 font-bold mt-1">Non-Stop</div>
          </div>

          <div className="text-left min-w-[80px]">
            <div className="text-lg font-black text-slate-900 tracking-tight">
              {flight.arrival_city}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Arrival
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-5 flex-1">
          <div className="text-left lg:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Price</div>
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(flight.current_price).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Taxes & fees included</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold"
              title="Share Flight Info"
            >
              {copied ? 'Copied!' : 'Share'}
            </button>

            <button
              onClick={() => onBook(flight)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Book Ticket</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Accordion Toggle Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-4">
          <span>Cabin Bag: 7kg</span>
          <span>•</span>
          <span>Check-in: 15kg</span>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-700 font-bold hover:underline flex items-center gap-1"
        >
          <span>{showDetails ? 'Hide Details' : 'Flight Details'}</span>
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Flight Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              
              <div>
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">In-Flight Amenities</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white text-slate-700 rounded border border-slate-200">📶 Free Wi-Fi</span>
                  <span className="px-2 py-0.5 bg-white text-slate-700 rounded border border-slate-200">🍱 Complimentary Meals</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Cancellation Policy</div>
                <div className="mt-1.5 text-slate-600">
                  Refundable ticket up to 24h prior to departure. Zero convenience fee on wallet payments.
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Price Breakdown</div>
                <div className="mt-1.5 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span className="font-bold text-slate-800">₹{Number(flight.base_price || flight.current_price).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Discount:</span>
                    <span>Executive Offer</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
