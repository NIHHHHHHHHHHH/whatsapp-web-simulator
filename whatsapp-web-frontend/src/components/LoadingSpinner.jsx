import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', type = 'dots' }) => {
  // Size configurations
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  if (type === 'circular') {
    const circularSizes = {
      small: 'w-5 h-5 border-2',
      medium: 'w-8 h-8 border-2',
      large: 'w-12 h-12 border-3'
    };

    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className={`
          ${circularSizes[size]}
          border-gray-300 border-t-green-500 rounded-full animate-spin
        `}></div>
        {text && (
          <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
            {text}
          </p>
        )}
      </div>
    );
  }
};

export default LoadingSpinner;