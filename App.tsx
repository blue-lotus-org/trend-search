
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { fetchSearchResults } from './services/geminiService';
import { SearchResult, GeminiServiceError } from './types';
import { SEARCH_TREND_DETAIL_PROMPT_PREFIX } from './constants';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentDisplayQuery, setCurrentDisplayQuery] = useState<string>(''); // For showing in "no results for X"
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const appRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (appRef.current) {
      gsap.fromTo(appRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.inOut" });
    }
  }, []);

  const handleSearch = useCallback(async (query: string, displayQuery?: string) => {
    if (!query) return;
    
    // Use displayQuery if provided (e.g. original trend title), otherwise use the actual query
    const queryToShow = displayQuery || query; 
    setCurrentDisplayQuery(queryToShow); 
    
    // Set search term for the SearchBar input, usually the raw trend title or user input
    // If a detailed prompt is used, we still want the simpler version in the search bar
    setSearchTerm(displayQuery || query);


    setIsLoading(true);
    setError(null);

    const animateOutAndFetch = async () => {
      const result = await fetchSearchResults(query);
      if ('message' in result) { 
        setError((result as GeminiServiceError).message);
        setSearchResults(null);
      } else {
        setSearchResults(result as SearchResult);
      }
      setIsLoading(false);
    };

    const resultsDisplayElement = mainContentRef.current?.querySelector('.results-container > div[class*="bg-slate-800"]');
    if (resultsDisplayElement) {
        gsap.to(resultsDisplayElement, { 
            opacity: 0, 
            y: 20, 
            duration: 0.3, 
            ease: "power1.in",
            onComplete: () => {
                setSearchResults(null); 
                animateOutAndFetch();
            }
        });
    } else { 
        setSearchResults(null); 
        animateOutAndFetch();
    }

  }, []);

  const handleSelectTrend = useCallback((trendTitle: string) => {
    const detailedQuery = `${SEARCH_TREND_DETAIL_PROMPT_PREFIX}"${trendTitle}"`;
    // Pass original trendTitle as displayQuery so "No results for [trendTitle]" is clean
    handleSearch(detailedQuery, trendTitle); 
  }, [handleSearch]);

  return (
    <div ref={appRef} className="min-h-screen flex flex-col md:flex-row gap-6 p-4 sm:p-6">
      <Sidebar onSelectTrend={handleSelectTrend} />
      <main ref={mainContentRef} className="flex-1 flex flex-col min-w-0">
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 pb-2">
            Internet Trends Explorer
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Discover what's trending with the power of AI.</p>
        </header>
        <SearchBar onSearch={(query) => handleSearch(query, query)} initialQuery={searchTerm} isLoading={isLoading} />
        
        <div className="results-container flex-grow">
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorMessage message={error} />}
          {!isLoading && !error && searchResults && <ResultsDisplay results={searchResults} />}
          {!isLoading && !error && !searchResults && !currentDisplayQuery && ( // Initial state before any search
             <div className="text-center p-8 text-slate-400 bg-slate-800/50 rounded-xl shadow-lg">
                <p className="text-lg">Welcome!</p>
                <p>Select a trend from the sidebar or enter your own query above to get started.</p>
             </div>
          )}
           {!isLoading && !error && !searchResults && currentDisplayQuery && ( // Searched but no results
             <div className="text-center p-8 text-slate-400 bg-slate-800/50 rounded-xl shadow-lg">
                <p className="text-lg">No results found for "{currentDisplayQuery}".</p>
                <p>Try a different query or check back later.</p>
             </div>
          )}
        </div>
         <footer className="mt-auto pt-8 text-center text-xs text-slate-500">
            <p>
              <a 
                href="https://lotuschain.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-pink-400 transition-colors duration-200 ease-in-out"
              >
                Lotus Trends
              </a> - 2023 - {currentYear}
            </p>
            <p>Powered by Gemini AI.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;