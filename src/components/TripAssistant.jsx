import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { streamTripAssistant } from '../api';

const initialMessage = {
  role: 'assistant',
  content: 'Hi! Tell me where you want to go and what matters most—like the lowest fare or a specific airline. I can search our available flights and help you choose.',
};

const suggestions = [
  'Find the cheapest flights from Delhi to Mumbai',
  'What flights are available from Chennai to Kolkata?',
];

export default function TripAssistant({ onSearch, openOnMount = false }) {
  const [isOpen, setIsOpen] = useState(openOnMount);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeRequestRef = useRef(null);
  const pendingTextRef = useRef('');
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (openOnMount) setIsOpen(true);
  }, [openOnMount]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isSending ? 'auto' : 'smooth' });
  }, [messages, isSending]);

  useEffect(() => () => {
    activeRequestRef.current?.abort();
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  function flushStreamedText(messageIndex) {
    const text = pendingTextRef.current;
    pendingTextRef.current = '';
    if (!text) return;

    setMessages((current) => current.map((item, index) => (
      index === messageIndex ? { ...item, content: item.content + text } : item
    )));
  }

  async function sendMessage(event, message = input) {
    event?.preventDefault();
    const content = message.trim();
    if (!content || activeRequestRef.current) return;

    const nextMessages = [...messages, { role: 'user', content }];
    const assistantIndex = nextMessages.length;
    setMessages([...nextMessages, { role: 'assistant', content: '', streaming: true }]);
    setInput('');
    setIsSending(true);

    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      await streamTripAssistant(
        nextMessages.slice(-10).map(({ role, content: text }) => ({ role, content: text })),
        {
          signal: controller.signal,
          onToken: (text) => {
            pendingTextRef.current += text;
            if (animationFrameRef.current === null) {
              animationFrameRef.current = window.requestAnimationFrame(() => {
                animationFrameRef.current = null;
                flushStreamedText(assistantIndex);
              });
            }
          },
          onSearch: (search) => {
            setMessages((current) => current.map((item, index) => (
              index === assistantIndex ? { ...item, search } : item
            )));
          },
        },
      );
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      flushStreamedText(assistantIndex);
      setMessages((current) => current.map((item, index) => (
        index === assistantIndex ? { ...item, streaming: false } : item
      )));
    } catch (error) {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      flushStreamedText(assistantIndex);
      if (error.name !== 'AbortError') {
        const messageText = error.message
          || 'The trip assistant could not respond right now. Please try again shortly.';
        setMessages((current) => current.map((item, index) => (
          index === assistantIndex
            ? {
                ...item,
                content: `${item.content}${item.content ? '\n\n' : ''}${messageText}`,
                isError: true,
                streaming: false,
              }
            : item
        )));
      }
    } finally {
      if (activeRequestRef.current === controller) activeRequestRef.current = null;
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            aria-label="AI trip planner"
            className="absolute bottom-16 right-0 flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">AI Trip Planner</h2>
                  <p className="text-xs text-slate-300">Flight recommendations, made easy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close trip planner"
                className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
              role="log"
              aria-label="Trip planner conversation"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      item.role === 'user'
                        ? 'rounded-br-md bg-slate-900 text-white'
                        : item.isError
                          ? 'rounded-bl-md border border-rose-200 bg-rose-50 text-rose-800'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {item.content}
                      {item.streaming && !item.content && (
                        <span className="text-slate-400" role="status">Thinking…</span>
                      )}
                    </p>
                    {item.streaming && item.content && (
                      <span className="ml-0.5 inline-block h-3 w-1 animate-pulse rounded bg-blue-600" aria-label="Generating reply" />
                    )}
                    {item.search?.departure && item.search?.arrival && (
                      <button
                        type="button"
                        onClick={() => {
                          onSearch(item.search);
                          setIsOpen(false);
                        }}
                        className="mt-3 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
                      >
                        View matching flights
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={(event) => sendMessage(event, suggestion)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-800"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3">
              <label htmlFor="trip-assistant-message" className="sr-only">Message the AI trip planner</label>
              <div className="flex items-end gap-2">
                <textarea
                  id="trip-assistant-message"
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(event);
                    }
                  }}
                  maxLength={1000}
                  rows={1}
                  placeholder={isSending ? 'Generating a reply…' : 'Ask about a route or budget…'}
                  className="max-h-24 min-h-10 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Recommendations use our listed flights. Schedules and dates are not currently available.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close AI trip planner' : 'Open AI trip planner'}
        className="flex h-14 items-center gap-2 rounded-full bg-blue-700 px-5 font-bold text-white shadow-xl transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        {isOpen ? <X size={19} aria-hidden="true" /> : <MessageCircle size={19} aria-hidden="true" />}
        <span className="text-sm">AI Trip Planner</span>
      </button>
    </div>
  );
}
