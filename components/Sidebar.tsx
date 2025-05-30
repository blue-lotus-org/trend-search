
import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Trend, GeminiServiceError, CategorizedTrends, TrendCategoryKey } from '../types';
import { fetchTopTrends } from '../services/geminiService';
import TrendItem from './TrendItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface SidebarProps {
  onSelectTrend: (trendTitle: string) => void;
}

const CATEGORY_DISPLAY_NAMES: Record<TrendCategoryKey, string> = {
  US: "United States",
  Canada: "Canada",
  EU: "European Union",
  Asia: "Asia",
  Worldwide: "Worldwide",
};

const Sidebar: React.FC<SidebarProps> = ({ onSelectTrend }) => {
  const [categorizedTrends, setCategorizedTrends] = useState<CategorizedTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTrends = async () => {
      setIsLoading(true);
      setError(null);
      const fetchedData = await fetchTopTrends();
      if (fetchedData && typeof fetchedData === 'object' && !('message' in fetchedData)) {
        setCategorizedTrends(fetchedData as CategorizedTrends);
      } else {
         setError((fetchedData as GeminiServiceError).message || "Failed to load trends.");
         setCategorizedTrends(null);
      }
      setIsLoading(false);
    };

    loadTrends();
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" });
    }
  }, []);


  return (
    <aside ref={sidebarRef} className="w-full md:w-72 lg:w-80 bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-2xl md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
      <h2 className="text-2xl font-bold text-pink-400 mb-6 border-b border-slate-700 pb-3">
        Top Trends
      </h2>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && !categorizedTrends && (
        <p className="text-slate-400">No trends available at the moment.</p>
      )}
      {!isLoading && !error && categorizedTrends && (
        <div>
          {(Object.keys(categorizedTrends) as TrendCategoryKey[]).map((categoryKey, catIndex) => {
            const trendTitles = categorizedTrends[categoryKey] || [];
            // Ensure consistent animation key for the div if trendTitles is empty
            const categoryDivKey = `category-section-${categoryKey}-${catIndex}`;
            return (
              <div key={categoryDivKey} className="mb-5">
                <h3 className="text-lg font-semibold text-teal-300 mb-2 sticky top-0 bg-slate-800/80 backdrop-blur-sm py-1.5 z-10 px-1 -mx-1 rounded-sm">
                  {CATEGORY_DISPLAY_NAMES[categoryKey]}
                </h3>
                {trendTitles.length > 0 ? (
                  <ul className="space-y-1 pl-2 border-l-2 border-purple-700/50">
                    {trendTitles.map((title, index) => (
                      <TrendItem
                        key={`${categoryKey}-${index}`}
                        trend={{ id: `${categoryKey}-${title.replace(/\s+/g, '-')}-${index}`, title }}
                        onSelectTrend={onSelectTrend}
                        index={index} 
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 pl-3 text-sm">No trends found for this region.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;