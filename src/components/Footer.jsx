import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotify } from './NotificationSystem';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { notify } = useNotify();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    notify('success', 'Subscribed to flight price drop notifications!');
    setEmail('');
  };

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                ✈
              </div>
              <span>Flight Booker</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Book domestic & international flights with real-time fare updates, instant PDF boarding passes, and zero convenience fees.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Quick Links</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Search Flights</Link></li>
              <li><Link to="/bookings" className="hover:text-white transition-colors">My Boarding Passes</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help & Contact</Link></li>
            </ul>
          </div>

          {/* Top Routes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Popular Routes</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Delhi ➔ Mumbai</li>
              <li>Bangalore ➔ Goa</li>
              <li>Mumbai ➔ Dubai</li>
              <li>Chennai ➔ Kolkata</li>
            </ul>
          </div>

          {/* Price Drop Alerts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Price Drop Alerts</h3>
            <p className="text-xs text-slate-400">Subscribe for exclusive discount offers & flight fare drop updates.</p>
            
            <form onSubmit={handleSubscribe} className="flex gap-1.5">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Flight Booker Inc. All rights reserved.</p>
          <p className="text-slate-400 font-medium">Executive Classic Theme • Fast & Secure</p>
        </div>

      </div>
    </footer>
  );
}
