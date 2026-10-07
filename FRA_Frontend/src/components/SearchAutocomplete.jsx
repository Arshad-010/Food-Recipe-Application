import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Star, X, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Search recipes by name or ingredient...',
  className = '',
  inputClassName = '',
}) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Debounced suggestion fetch
  useEffect(() => {
    const trimmed = (value || '').trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/recipes/search?suggest=true&q=${encodeURIComponent(trimmed)}`);
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          setIsOpen(res.suggestions.length > 0);
        }
      } catch (err) {
        // Silently swallow search suggestion errors
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (id) => {
    setIsOpen(false);
    navigate(`/recipes/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center w-full">
        <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-11 pr-10 py-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-800 transition-all ${inputClassName}`}
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
          <div className="p-2 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3">
            <span>Instant Suggestions</span>
            <span>{suggestions.length} dishes found</span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectSuggestion(item.id)}
                className="p-3 flex items-center gap-3.5 hover:bg-amber-50/60 dark:hover:bg-stone-800/80 cursor-pointer transition-colors group"
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{item.cuisine}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {item.cookTime}m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating ? item.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>

          <div
            onClick={onSearch}
            className="p-2.5 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/80 text-center text-xs font-bold text-amber-600 dark:text-amber-400 cursor-pointer transition-colors border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5"
          >
            <span>View all search results for "{value}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}
