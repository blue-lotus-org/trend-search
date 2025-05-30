
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '', isLoading }) => {
  const [query, setQuery] = useState(initialQuery);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);
  
  useEffect(() => {
    if (searchBarRef.current) {
      gsap.fromTo(searchBarRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div ref={searchBarRef} className="mb-8">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Explore internet trends..."
          className="flex-grow p-3 bg-slate-700/50 text-slate-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none placeholder-slate-400 transition-all duration-200 ease-in-out"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ease-in-out
                      ${isLoading 
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                        : 'bg-pink-600 hover:bg-pink-500 text-white focus:ring-2 focus:ring-pink-400 focus:outline-none transform hover:scale-105 active:scale-95'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
    