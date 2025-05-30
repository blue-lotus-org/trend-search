
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Trend } from '../types';

interface TrendItemProps {
  trend: Trend;
  onSelectTrend: (trendTitle: string) => void;
  index: number;
}

const TrendItem: React.FC<TrendItemProps> = ({ trend, onSelectTrend, index }) => {
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, delay: index * 0.05, ease: "power2.out" }
      );
    }
  }, [index]);
  
  return (
    <li ref={itemRef} className="py-2">
      <button
        onClick={() => onSelectTrend(trend.title)}
        className="w-full text-left px-3 py-2 rounded-md text-slate-300 hover:bg-purple-700/50 hover:text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-purple-700/60 transition-all duration-200 ease-in-out group"
      >
        <span className="truncate group-hover:animate-pulse">{trend.title}</span>
      </button>
    </li>
  );
};

export default TrendItem;
    