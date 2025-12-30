import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';

interface SlideProps {
  metrics: AggregatedMetrics;
  activeSlide: number;
  isRoastMode: boolean;
  roasts: Record<number, string>;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

import Welcome from '../slides/Welcome';
import Time from '../slides/Time';
import Languages from '../slides/Languages';
import BentoSummary from '../slides/BentoSummary';
import Achievements from '../slides/Achievements';
import Productivity from '../slides/Productivity';
import Closing from '../slides/Closing';
import TopLanguage from '../slides/TopLanguage';
import Tools from '../slides/Tools';
import Debugging from '../slides/Debugging';
import Focus from '../slides/Focus';

export default function SlideContainer({ metrics, activeSlide, isRoastMode, roasts, timeRange }: SlideProps) {
  const SlideComponent = () => {
    const props = { metrics, isRoastMode, roast: roasts[activeSlide], timeRange };
    
    switch (activeSlide) {
      case 0: return <Welcome {...props} />;
      case 1: return <Time {...props} />;
      case 2: return <BentoSummary {...props} />;
      case 3: return <Languages {...props} />;
      case 4: return <TopLanguage {...props} />;
      case 5: return <Productivity {...props} />;
      case 6: return <Tools {...props} />;
      case 7: return <Debugging {...props} />;
      case 8: return <Focus {...props} />;
      case 9: return <Achievements {...props} />;
      case 10: return <Closing {...props} />;
      // Fallback for others while we build them
      default: return (
        <div className="text-center p-10 border-2 border-dashed border-lunar-800 rounded-3xl opacity-50">
          <h3 className="text-2xl font-bold text-lunar-300">Slide {activeSlide}</h3>
          <p className="text-lunar-500">Coming together piece by piece...</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[60vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full flex justify-center"
        >
          {SlideComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
