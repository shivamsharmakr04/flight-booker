import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotify } from './NotificationSystem';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { notify } = useNotify();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    notify('success', 'Subscribed to flight price alerts! ✈️');
    setEmail('');
  };

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-300 overflow-hidden border-t border-slate-800">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-md">
                ✈
              </div>
              <span>Flight Booker</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Book domestic & international flights smarter with real-time fare updates, instant PDF boarding passes, and zero payment processing fees.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">Search Flights</Link></li>
              <li><Link to="/bookings" className="hover:text-sky-400 transition-colors">My Boarding Passes</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Help & Contact</Link></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Top Routes</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Delhi ➔ Mumbai</li>
              <li>Bangalore ➔ Goa</li>
              <li>Mumbai ➔ Dubai</li>
              <li>Chennai ➔ Kolkata</li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Price Drop Alerts</h3>
            <p className="text-xs text-slate-400">Subscribe for exclusive discount codes & flight price drop notifications.</p>
            
            <form onSubmit={handleSubscribe} className="flex gap-1.5">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Flight Booker Inc. All rights reserved.</p>
          <p className="text-slate-400">Designed with SkyPass Glassmorphism & Framer Motion ✨</p>
        </div>

      </div>
    </footer>
  );
}
