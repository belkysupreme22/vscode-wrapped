import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { getLanguageIcon, formatNumber } from '../utils/formatters';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function TopLanguageSlide({ metrics, isRoastMode, roast }: SlideProps) {
  const topLang = metrics.topLanguages[0];

  if (!topLang) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-lunar-400 uppercase tracking-widest text-sm font-bold">Your Primary Talent</h2>
        <motion.div 
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10 }}
            className="text-9xl mb-4"
        >
            {getLanguageIcon(topLang.language)}
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black text-white capitalize tracking-tighter">
            {topLang.language}
        </h1>
        <p className="text-2xl text-lunar-200 font-bold">
            {formatNumber(topLang.count)} contributions
        </p>
      </div>

      {isRoastMode && roast && (
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 italic shadow-lg">
          "{roast}"
        </div>
      )}
    </motion.div>
  );
}
