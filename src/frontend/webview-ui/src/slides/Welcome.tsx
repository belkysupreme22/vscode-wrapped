import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { getWelcomeMessage } from '../utils/formatters';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function WelcomeSlide({ metrics, isRoastMode, roast }: SlideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-24 h-24 bg-lunar-500 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(91,116,101,0.3)]"
      >
        <span className="text-4xl">🎁</span>
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-lunar-300">
          {getWelcomeMessage(metrics.daysOpened)}
        </h1>
        <p className="text-xl md:text-2xl text-lunar-400 font-medium tracking-wide">
          A retrospective of your coding journey
        </p>
      </div>

      {isRoastMode && roast && (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 italic text-lg"
        >
            "{roast}"
        </motion.div>
      )}
    </motion.div>
  );
}
