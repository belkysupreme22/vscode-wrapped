import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { Target, Timer } from 'lucide-react';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function FocusSlide({ metrics, isRoastMode, roast }: SlideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl space-y-12"
    >
      <div className="text-center space-y-2">
        <Target className="mx-auto text-lunar-500 w-12 h-12 mb-4" />
        <h2 className="text-4xl font-black text-white tracking-tight">The Flow State</h2>
        <p className="text-lunar-400 text-lg">When the world ceased to exist</p>
      </div>

      <div className="relative p-10 rounded-[3rem] bg-lunar-900/40 border border-lunar-700/50 backdrop-blur-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Timer size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-2">
            <span className="text-8xl font-mono font-bold text-lunar-50">{metrics.longestSessionMinutes}</span>
            <span className="text-xl uppercase font-bold tracking-[0.3em] text-lunar-500">Minutes of Pure Focus</span>
            <p className="text-lunar-300 mt-4 text-center max-w-xs font-medium italic">
                Your absolute peak performance.
            </p>
        </div>
      </div>

      <div className="bg-lunar-900/60 p-6 rounded-2xl flex justify-between items-center border border-lunar-800">
        <div className="flex flex-col">
            <span className="text-lunar-400 font-bold uppercase tracking-widest text-xs">Total Focus Blocks</span>
            <span className="text-[10px] text-lunar-600 font-medium">Deep work sessions &gt; 25 minutes</span>
        </div>
        <span className="text-3xl font-mono font-bold text-white">{metrics.totalFocusBlocks}</span>
      </div>

      {isRoastMode && roast && (
        <div className="text-center">
            <div className="inline-block px-4 py-1 bg-red-500 text-white font-black text-[10px] uppercase rounded-full mb-2">Reality Check</div>
            <p className="text-red-200 italic font-medium leading-relaxed">"{roast}"</p>
        </div>
      )}
    </motion.div>
  );
}
