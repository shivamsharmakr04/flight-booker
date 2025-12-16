import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Flight icon with animation */}
      <div className="text-center mb-8">
        <div className="inline-block bg-blue-100 rounded-full p-4 mb-4 animate-bounce">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">About Flight Booker</h1>
        <p className="text-gray-600 text-lg animate-fade-in" style={{animationDelay: '0.2s'}}>Your trusted partner for seamless flight bookings</p>
      </div>

      {/* Flight image banner */}
      <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 mx-4">
        <img 
         
          alt="Flight booking" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold">Experience the Journey</h3>
          <p className="text-sm">Book your next adventure with ease</p>
        </div>
      </div>

      <div className="space-y-6 text-gray-700 max-w-4xl mx-auto px-4">
        <div className="animate-slide-up">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="leading-relaxed">
            At Flight Booker, we're committed to making air travel accessible, affordable, and hassle-free. 
            We believe that everyone deserves the opportunity to explore the world, and we're here to make that journey smooth and enjoyable.
          </p>
        </div>

        <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-semibold mb-3">What We Offer</h2>
          <ul className="space-y-2">
            <li className="flex items-start group hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hover:text-blue-600 transition-colors duration-300">Wide selection of domestic and international flights</span>
            </li>
            <li className="flex items-start group hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hover:text-blue-600 transition-colors duration-300">Competitive prices and exclusive deals</span>
            </li>
            <li className="flex items-start group hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hover:text-blue-600 transition-colors duration-300">Secure payment options and wallet integration</span>
            </li>
            <li className="flex items-start group hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hover:text-blue-600 transition-colors duration-300">24/7 customer support and booking assistance</span>
            </li>
          </ul>
        </div>

        <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-semibold mb-3">Our Team</h2>
          <p className="leading-relaxed">
            We're a passionate team of travel enthusiasts, tech experts, and customer service professionals 
            dedicated to revolutionizing the way you book flights. With years of experience in the travel industry, 
            we understand your needs and are committed to providing the best service possible.
          </p>
        </div>

        {/* Team members with images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img 
             
              alt="Team member" 
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
            />
            <h4 className="font-semibold">John Doe</h4>
            <p className="text-sm text-gray-600">CEO & Founder</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img 
               
              alt="Team member" 
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
            />
            <h4 className="font-semibold">Jane Smith</h4>
            <p className="text-sm text-gray-600">CTO</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img 
              
              alt="Team member" 
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
            />
            <h4 className="font-semibold">Mike Johnson</h4>
            <p className="text-sm text-gray-600">Head of Design</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mt-8 animate-slide-up" style={{animationDelay: '0.8s'}}>
          <h3 className="text-xl font-semibold mb-2 text-blue-900">Ready to start your journey?</h3>
          <p className="text-blue-700 mb-4">Join thousands of satisfied travelers who trust Flight Booker for their flight needs.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up:nth-child(1) { animation-delay: 0.1s; }
        .animate-slide-up:nth-child(2) { animation-delay: 0.2s; }
        .animate-slide-up:nth-child(3) { animation-delay: 0.4s; }
        .animate-slide-up:nth-child(4) { animation-delay: 0.6s; }
        .animate-slide-up:nth-child(5) { animation-delay: 0.8s; }
      `}</style>
    </div>
  );
}