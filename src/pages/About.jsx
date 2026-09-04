import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Happy Passengers', val: '500,000+' },
    { label: 'Partner Airlines', val: '45+' },
    { label: 'Global Cities', val: '250+' },
    { label: 'Booking Uptime', val: '99.9%' }
  ];

  const coreValues = [
    { title: 'Transparent Pricing', desc: 'No hidden taxes or booking surcharges. What you see is what you pay.' },
    { title: 'Instant E-Tickets', desc: 'Download PDF boarding passes right from your account dashboard.' },
    { title: 'Secure SkyWallet', desc: 'Instant refund processing and one-click flight checkout.' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 text-xs font-bold uppercase tracking-wider">
          ✈ Revolutionizing Air Travel
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          About Flight Booker
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          We combine real-time flight search algorithms with intuitive glassmorphic design to make flight reservations fast, secure, and delightful.
        </p>
      </motion.div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-md text-center"
          >
            <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {s.val}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Core Values */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 text-center">Why Travelers Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreValues.map((v, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
                ✓
              </div>
              <h3 className="text-base font-bold text-slate-800">{v.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white text-center space-y-4 shadow-2xl">
        <h3 className="text-2xl font-black">Ready to Take Flight?</h3>
        <p className="text-xs text-blue-200 max-w-md mx-auto">
          Search over 250+ domestic and international flight routes with zero convenience fees.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-sky-50 transition-all"
        >
          Explore Flights Now
        </button>
      </div>

    </div>
  );
}