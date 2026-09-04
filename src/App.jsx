// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Search from './pages/Search';
import Register from './pages/Register';
import BookingHistory from './pages/BookingHistory';
import Signin from './pages/Signin';
import About from './pages/About';
import Contact from './pages/Contact';
import { NotificationProvider } from './components/NotificationSystem';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <NotificationProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
          <Navbar user={user} setUser={setUser} />

          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route
                path="/"
                element={<Search user={user} setUser={setUser} />}
              />

              <Route
                path="/bookings"
                element={<BookingHistory />}
              />

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/register" element={<Register />} />
              <Route path="/signin" element={<Signin setUser={setUser} />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </NotificationProvider>
  );
}
