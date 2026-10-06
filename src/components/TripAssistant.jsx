import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X, RotateCcw, Plane, Search, Square } from 'lucide-react';
import { streamTripAssistant } from '../api';

const initialMessage = {
  role: 'assistant',
  content: 'Hi! Tell me your travel route and budget (e.g. "Delhi to Mumbai under ₹3000"). I will search our live flight inventory and find the best fares for you.',
};

const suggestions = [
  '⚡ Cheapest flights Delhi to Mumbai',
  '🌴 Bangalore to Goa flights',
  '🛫 Chennai to Kolkata options',
  '💰 Any flights under ₹2,500',
];

function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
        const cleanLine = isBullet ? trimmed.slice(2) : line;

        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <div className="flex-1 text-slate-700">{formattedLine}</div>
            </div>
          );
        }

        return <div key={idx} className="text-slate-700">{formattedLine}</div>;
      })}
    </div>
  );
}

export default function TripAssistant({ onSearch, openOnMount = false, isOpen: controlledOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(openOnMount);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val) => {
    const next = typeof val === 'function' ? val(isOpen) : val;
    setInternalOpen(next);
    onToggle?.(next);
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeRequestRef = useRef(null);
  const pendingTextRef = useRef('');
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (openOnMount) {
      setInternalOpen(true);
      onToggle?.(true);
    }
  }, [openOnMount]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
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

  function handleResetChat() {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setIsSending(false);
    pendingTextRef.current = '';
    setMessages([initialMessage]);
  }

  function handleStop() {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setIsSending(false);
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
          onSearching: (criteria) => {
            setMessages((current) => current.map((item, index) => (
              index === assistantIndex ? { ...item, isSearching: criteria } : item
            )));
          },
          onSearch: (search) => {
            setMessages((current) => current.map((item, index) => (
              index === assistantIndex ? { ...item, search, isSearching: null } : item
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
        index === assistantIndex ? { ...item, streaming: false, isSearching: null } : item
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
                isSearching: null,
              }
            : item
        )));
      } else {
        setMessages((current) => current.map((item, index) => (
          index === assistantIndex ? { ...item, streaming: false, isSearching: null } : item
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
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            aria-label="AI trip planner"
            className="absolute bottom-16 right-0 flex h-[min(580px,calc(100dvh-6rem))] w-[min(410px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-500/30">
                  <Sparkles size={16} className="text-white" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight text-white">AI Trip Planner</h2>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">Fast flight recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Start new conversation"
                    aria-label="Clear chat conversation"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close trip planner"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            </header>

            {/* Messages Body */}
            <div
              className="flex-1 space-y-3.5 overflow-y-auto bg-slate-50/70 p-4"
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
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      item.role === 'user'
                        ? 'rounded-br-sm bg-slate-900 text-white'
                        : item.isError
                          ? 'rounded-bl-sm border border-rose-200 bg-rose-50 text-rose-800'
                          : 'rounded-bl-sm border border-slate-200/80 bg-white text-slate-800 shadow-sm'
                    }`}
                  >
                    {item.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{item.content}</p>
                    ) : (
                      <>
                        <FormattedMessage text={item.content} />
                        {item.streaming && !item.content && (
                          <div className="flex items-center gap-2 py-0.5 text-xs text-slate-400 font-medium" role="status">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                            <span>Thinking & analyzing…</span>
                          </div>
                        )}
                        {item.streaming && item.content && (
                          <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded bg-blue-600 align-middle" aria-label="Generating reply" />
                        )}
                      </>
                    )}

                    {/* Searching inventory indicator */}
                    {item.isSearching && (
                      <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs text-blue-700 animate-pulse">
                        <Search size={13} className="text-blue-600 shrink-0" />
                        <span>Searching flights: <strong>{item.isSearching.departure} ➔ {item.isSearching.arrival}</strong></span>
                      </div>
                    )}

                    {/* Quick Flight Search Action Button */}
                    {item.search?.departure && item.search?.arrival && (
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            onSearch(item.search);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                        >
                          <Plane size={13} className="rotate-45" />
                          <span>View {item.search.departure} ➔ {item.search.arrival} Flights</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Popular queries</p>
                  <div className="flex flex-col gap-1.5">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={(event) => sendMessage(event, suggestion.replace(/^[^\w\s]+\s*/, ''))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
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
                  placeholder={isSending ? 'AI is generating reply…' : 'E.g. Delhi to Mumbai under ₹3000…'}
                  className="max-h-24 min-h-10 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {isSending ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    title="Stop generating"
                    aria-label="Stop generating"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-rose-600"
                  >
                    <Square size={14} className="fill-current" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <Send size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Responses are generated live from our flight inventory. Instant booking available on flight cards.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close AI trip planner' : 'Open AI trip planner'}
        className="flex h-13 items-center gap-2.5 rounded-full bg-blue-600 px-4.5 py-3 font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95"
      >
        {isOpen ? <X size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
        <span className="text-sm">AI Assistant</span>
      </button>
    </div>
  );
}
