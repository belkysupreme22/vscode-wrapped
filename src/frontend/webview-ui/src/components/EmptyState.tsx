import React from 'react';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-lunar-500 font-mono italic p-12 text-center border-2 border-dashed border-lunar-800 rounded-3xl w-full">
      {message}
    </div>
  );
}
