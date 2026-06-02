import { useState, useRef, useEffect, useCallback } from 'react';
import { places } from '../services/api';

export default function SearchInput({ value, onChange, placeholder, className = '' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await places.autocomplete(q.trim(), controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(data.predictions || []);
        setOpen(true);
        setActiveIdx(-1);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSuggestions([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    onChange(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), 200);
  }, [onChange, fetchSuggestions]);

  const handleSelect = useCallback((suggestion) => {
    onChange(suggestion.description);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    if (abortRef.current) abortRef.current.abort();
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }, [open, suggestions, activeIdx, handleSelect]);

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const showDropdown = open && suggestions.length > 0;

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <div className="relative">
        <input
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border focus:ring-2 focus:ring-brand/30 focus:border-transparent transition-all pr-8"
        />
        {loading && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <span className="block w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            ref={listRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-line rounded-xl shadow-soft-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.place_id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`px-3.5 py-2.5 text-sm flex flex-col ${
                  i === activeIdx ? 'bg-brand-light/30' : 'hover:bg-line/40'
                } ${i !== suggestions.length - 1 ? 'border-b border-line/40' : ''}`}
              >
                <span className="font-medium text-heading truncate">{s.main_text}</span>
                {s.secondary_text && (
                  <span className="text-[11px] text-muted truncate">{s.secondary_text}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
