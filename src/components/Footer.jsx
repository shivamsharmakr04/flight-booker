import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative mt-16 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-slate-200 overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">✈ Flight Booker</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Book flights smarter with real-time prices, secure payments, and instant ticket downloads.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/search', 'Search Flights'], ['/bookings', 'My Bookings'], ['/about', 'About Us']].map(
                ([to, label]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="hover:text-indigo-400 transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              {[['/contact', 'Contact Us'], ['#', 'Help Center'], ['#', 'Privacy Policy'], ['#', 'Terms & Conditions']].map(
                ([to, label]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="hover:text-indigo-400 transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {["facebook", "twitter", "instagram", "linkedin"].map(icon => (
                <a
                  key={icon}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-indigo-500 hover:scale-110 transition-all duration-300"
                  aria-label={icon}
                >
                  <span className="capitalize text-sm">{icon[0]}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Flight Booker. All rights reserved.</p>
          <p className="hover:text-indigo-400 transition-colors duration-300">
            Designed for a smooth travel experience ✨
          </p>
        </div>
      </div>
    </footer>
  );
}
