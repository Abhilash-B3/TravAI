import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, User, Shield, Compass, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { apiClient } from '../../api/client';

/**
 * Design System & Core UX: Authoritative Global Search Dialog
 * Dispatches real ILIKE queries to /api/v1/search against database entities.
 * Strictly ZERO simulated or hardcoded records.
 */
export function SearchDialog({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient('/api/v1/search', {
          params: { q: query.trim() },
        });
        setResults(res.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item) => {
    onClose();
    if (item.path) {
      if (onNavigate) {
        onNavigate(item.path);
      } else {
        window.history.pushState({}, '', item.path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Property':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'Organization':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'Identity & RBAC':
        return <User className="w-4 h-4 text-indigo-400" />;
      case 'Security':
        return <Shield className="w-4 h-4 text-amber-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-200">
          <Search className="w-4 h-4 text-indigo-400" />
          <span>Database Global Search</span>
        </div>
      }
      subtitle="Queries PostgreSQL tables in real-time across properties, organizations, and identities"
      size="lg"
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search database (e.g., Grand Resort, Acme, Sarah, Security)..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-indigo-400 animate-spin" />
          )}
        </div>

        {/* Results List or Empty State */}
        <div className="min-h-[220px] max-h-[360px] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Type at least 1 character to query PostgreSQL database tables in real-time.
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5" role="listbox">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-slate-100'
                        : 'bg-slate-950/40 border border-transparent hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800/80 flex items-center justify-center">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-medium text-slate-100 flex items-center gap-2">
                          <span>{item.title}</span>
                          <Badge size="xs" variant="default">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.subtitle}</div>
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-indigo-400 transform translate-x-1'
                          : 'text-slate-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            !loading && (
              <EmptyState
                title="No database records found"
                description={`Zero records match '${query}' in the authoritative PostgreSQL database.`}
                icon={Search}
              />
            )
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">ESC</kbd> to close</span>
          </div>
          <span className="font-mono text-[10px]">AUTH: RLS_ENFORCED</span>
        </div>
      </div>
    </Modal>
  );
}
