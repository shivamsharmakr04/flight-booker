import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((type, message, options = {}) => {
    const id = Date.now();
    const duration = options.duration ?? 3000;

    setNotifications(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="fixed top-5 right-5 z-[9999] space-y-3">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`min-w-[280px] rounded-xl px-4 py-3 shadow-xl text-white flex items-start gap-3 ${
                n.type === 'success'
                  ? 'bg-green-600'
                  : n.type === 'error'
                  ? 'bg-red-600'
                  : n.type === 'warning'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-indigo-600'
              }`}
            >
              <span className="text-lg">{getIcon(n.type)}</span>
              <div className="flex-1">
                <p className="font-medium">{n.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotify must be used inside NotificationProvider');
  }
  return ctx;
}

function getIcon(type) {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
}
