import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { getLanguageIcon } from '../utils/formatters';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function LanguagesSlide({ metrics, isRoastMode, roast }: SlideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-lunar-100 mb-2">Your Linguistic DNA</h2>
        <p className="text-lunar-400">The tools you mastered this year</p>
      </div>

      {/* Static Grid of Languages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
        {metrics.topLanguages.map((lang, i) => (
          <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-lunar-900/40 border border-lunar-800 px-6 py-4 rounded-2xl backdrop-blur-sm hover:border-lunar-600 transition-colors"
          >
            <span className="text-3xl">{getLanguageIcon(lang.language)}</span>
            <div className="flex flex-col">
              <span className="text-lunar-50 font-bold capitalize">{lang.language}</span>
              <span className="text-lunar-500 text-xs font-mono font-bold">{lang.count} edits</span>
            </div>
          </motion.div>
        ))}
      </div>

      {isRoastMode && roast && (
        <div className="text-center text-red-300 font-bold bg-red-500/10 p-4 rounded-lg border border-red-500/20">
          ☠️ {roast}
        </div>
      )}
    </motion.div>
  );
}
