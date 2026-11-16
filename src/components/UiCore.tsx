import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

interface ExplorerButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const ExplorerButton: React.FC<ExplorerButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-b from-amber-300 to-yellow-500 border-amber-600 text-amber-950',
    secondary: 'bg-gradient-to-b from-orange-300 to-orange-500 border-orange-700 text-white',
    success: 'bg-gradient-to-b from-emerald-300 to-green-500 border-green-700 text-white',
    danger: 'bg-gradient-to-b from-rose-300 to-rose-500 border-rose-700 text-white',
    ghost: 'bg-white/50 border-stone-200 text-stone-600 border-b-2 active:border-b-0',
    glass: 'bg-white/90 backdrop-blur-md border-amber-100 text-amber-900 shadow-xs'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm md:text-base',
    lg: 'px-8 py-4 text-lg md:text-xl',
    icon: 'p-3'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'font-black uppercase tracking-wider rounded-2xl border-b-4 flex items-center justify-center gap-2 transition-all select-none touch-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

interface ExplorerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ExplorerCard: React.FC<ExplorerCardProps> = ({
  children,
  glass,
  padding = 'md',
  className,
  ...props
}) => {
  const paddingSizes = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12'
  };

  return (
    <div
      className={cn(
        'rounded-[40px] border-4 border-amber-200 shadow-soft-3d transition-all',
        glass ? 'bg-white/95 backdrop-blur-lg' : 'bg-white',
        paddingSizes[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const ProgressPill: React.FC<{ progress: number; color?: string }> = ({ progress, color = 'bg-amber-400' }) => (
  <div className="w-full h-4 bg-stone-100 rounded-full border-2 border-stone-200 overflow-hidden inner-shadow-subtle">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className={cn('h-full shadow-inner-soft', color)}
    />
  </div>
);

export const IconBadge: React.FC<{ icon: React.ReactNode; size?: 'sm' | 'md' | 'lg'; color?: string }> = ({
  icon,
  size = 'md',
  color = 'bg-amber-100 border-amber-300 text-amber-700'
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div className={cn(
      'rounded-2xl border-2 flex items-center justify-center shadow-md',
      color,
      sizes[size]
    )}>
      {icon}
    </div>
  );
};
