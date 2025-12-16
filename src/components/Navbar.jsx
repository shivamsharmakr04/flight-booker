import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

   const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsMenuOpen(false);
    navigate('/signin', { replace: true });
  };

  return (
    <nav className={`bg-white/90 backdrop-blur-md border-b sticky top-0 z-40 transition-all duration-500 ${
      isScrolled ? 'shadow-2xl' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-125 hover:rotate-12 cursor-pointer animate-pulse-slow">
              ✈
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-800 transition-all duration-300 hover:text-blue-600 cursor-pointer hover:translate-x-1" onClick={() => handleNavigation('/')}>
                Flight Booker
              </div>
              <div className="text-xs text-slate-500 animate-float">Fast • Secure • Simple</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => handleNavigation('/')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 relative group"
            >
              Home
              <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-blue-600 transition-all duration-400 group-hover:w-full group-hover:scale-x-100"></span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/about')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 relative group"
            >
              About
              <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-blue-600 transition-all duration-400 group-hover:w-full group-hover:scale-x-100"></span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/contact')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 relative group"
            >
              Contact
              <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-blue-600 transition-all duration-400 group-hover:w-full group-hover:scale-x-100"></span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/bookings')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 relative group"
            >
              Booking History
              <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-blue-600 transition-all duration-400 group-hover:w-full group-hover:scale-x-100"></span>
            </button>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
              {user ? (
  <div className="flex items-center gap-3">
    <span className="px-3 py-1 bg-slate-100 rounded text-sm font-medium">
      Hi, <span className="text-blue-600">{user.name}</span>
    </span>

    <div className="px-3 py-1 bg-slate-100 rounded text-sm transition-all duration-300 hover:bg-slate-200 hover:scale-105 transform-gpu">
      Wallet: <strong className="text-blue-600">₹{user.wallet_balance}</strong>
    </div>

    <button 
      onClick={handleLogout}
      className="text-sm text-rose-600 font-medium transition-all duration-300 hover:text-rose-700 hover:scale-110 hover:rotate-1 transform-gpu"
    >
      Logout
    </button>
  </div>
) : (

              <button 
                onClick={() => handleNavigation('/signin')}
                className="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium transition-all duration-300 hover:scale-110 hover:shadow-xl transform-gpu hover:rotate-1"
              >
                Signin
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-125 transform-gpu"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 animate-slide-down">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleNavigation('/')}
                className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 hover:scale-105 transform-gpu"
              >
                Home
              </button>
              
              <button 
                onClick={() => handleNavigation('/about')}
                className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 hover:scale-105 transform-gpu"
              >
                About
              </button>
              
              <button 
                onClick={() => handleNavigation('/contact')}
                className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 hover:scale-105 transform-gpu"
              >
                Contact
              </button>
              
              <button 
                onClick={() => handleNavigation('/signin')}
                className="text-left px-4 py-2 rounded bg-gradient-to-r from-green-500 to-emerald-600 text-white transition-all duration-300 hover:scale-110 hover:shadow-xl transform-gpu"
              >
                Signin
              </button>
              
              <button 
                onClick={() => handleNavigation('/booking-history')}
                className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 hover:scale-105 transform-gpu"
              >
                Booking History
              </button>
              
              {user && (
                <>
                  <div className="px-4 py-2 bg-slate-100 rounded text-sm transition-all duration-300 hover:bg-slate-200 hover:scale-105 transform-gpu">
                    Wallet: <strong className="text-blue-600">₹{user.wallet_balance}</strong>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-left px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-all duration-300 hover:scale-110 hover:rotate-1 transform-gpu"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000;
        }
        
        .hover\:rotate-1:hover {
          transform: rotate(1deg);
        }
        
        .hover\:rotate-12:hover {
          transform: rotate(12deg);
        }
      `}</style>
    </nav>
  );
}