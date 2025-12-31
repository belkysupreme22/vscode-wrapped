import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { useVsCodeApi } from '../hooks/useVsCodeApi';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function ClosingSlide({ metrics, isRoastMode, roast }: SlideProps) {
  const vscode = useVsCodeApi();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-12"
    >
      <div className="space-y-4">
        <motion.h2 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-7xl font-black text-white italic tracking-tighter"
        >
            THAT'S A WRAP.
        </motion.h2>
        <p className="text-lunar-400 text-xl font-medium">
            {new Date().getMonth() === 11 
              ? `Keep breaking things in ${new Date().getFullYear() + 1}.` 
              : "Keep building your momentum."}
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-lunar-900/40 border-2 border-lunar-800 backdrop-blur-xl max-w-md mx-auto relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-lunar-500/10 to-transparent pointer-events-none" />
        <p className="text-lunar-100 text-lg leading-relaxed relative z-10 font-medium">
          Whether it was a midnight bug hunt or a clean refactor, you've made your mark on the codebase.
        </p>
      </div>

      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <button 
           onClick={() => {
               vscode.postMessage({ 
                   command: 'downloadStory',
                   data: metrics
               });
               window.print();
           }}
           className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-lunar-50 transition-colors shadow-xl"
        >
            Download Story
        </button>
      </motion.div>

      {isRoastMode && roast && (
        <div className="max-w-sm mx-auto p-4 bg-red-900/20 border border-red-500/40 rounded-xl">
            <span className="text-red-500 font-bold uppercase text-[10px] tracking-widest block mb-1">Parting Shot</span>
            <p className="text-red-200 italic">"{roast}"</p>
        </div>
      )}
    </motion.div>
  );
}
