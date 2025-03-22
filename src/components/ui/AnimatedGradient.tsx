
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ 
  className, 
  children, 
  variant = 'primary' 
}) => {
  const getGradientClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200';
      case 'accent':
        return 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10';
      default:
        return 'bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20';
    }
  };

  return (
    <div className={cn(
      'absolute inset-0 -z-10 animate-gradient-shift bg-[length:200%_200%]',
      getGradientClasses(),
      className
    )}>
      {children}
    </div>
  );
};

export default AnimatedGradient;
