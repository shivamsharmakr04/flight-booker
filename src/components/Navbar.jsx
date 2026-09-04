import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate('/signin', { replace: true });
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Booking History',
      path: '/bookings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: 'About',
      path: '/about',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md'
            : 'bg-white border-b border-slate-200/80 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo Section */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavigation('/')}
            >
              <div className="bg-slate-900 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-md group-hover:bg-blue-800 transition-colors duration-300">
                <svg className="w-5 h-5 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>

              <div>
                <div className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  Flight Booker
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>Fast</span>
                  <span>•</span>
                  <span>Secure</span>
                  <span>•</span>
                  <span className="text-blue-700 font-extrabold">Executive</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* User & Wallet Section (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  
                  {/* Interactive Wallet Pill */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium cursor-pointer"
                    title="Available Wallet Balance"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm font-bold">
                      ₹
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wider leading-none">Wallet</span>
                      <span className="text-emerald-950 font-extrabold text-xs leading-none mt-0.5">
                        ₹{Number(user.wallet_balance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* User Profile Dropdown Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all text-xs font-semibold text-slate-800"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="font-bold text-slate-900 max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-slate-100">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email || 'Passenger'}</p>
                          </div>
                          
                          <button
                            onClick={() => handleNavigation('/bookings')}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                            </svg>
                            My Boarding Passes
                          </button>

                          <div className="my-1 border-t border-slate-100"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigation('/signin')}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Register</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-extrabold text-emerald-800">
                  ₹{Number(user.wallet_balance || 0).toLocaleString('en-IN')}
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 bg-white overflow-hidden shadow-xl"
            >
              <div className="px-4 py-4 space-y-3">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white font-bold shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          {item.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {user ? (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{user.name}</div>
                            <div className="text-[10px] text-slate-500">Passenger</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Balance</div>
                          <div className="text-xs font-extrabold text-emerald-700">
                            ₹{Number(user.wallet_balance || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full py-2 px-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleNavigation('/signin')}
                        className="w-full py-2 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold text-center"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleNavigation('/register')}
                        className="w-full py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center shadow-sm"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}