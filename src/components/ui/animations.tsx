import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Animation variants
export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
  fadeInDown: 'animate-in fade-in slide-in-from-top-4 duration-500',
  fadeInLeft: 'animate-in fade-in slide-in-from-left-4 duration-500',
  fadeInRight: 'animate-in fade-in slide-in-from-right-4 duration-500',

  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-300',
  scaleOut: 'animate-out zoom-out-95 duration-300',
  
  // Slide animations
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  slideInRight: 'animate-in slide-in-from-right duration-300',
  slideInUp: 'animate-in slide-in-from-bottom duration-300',
  slideInDown: 'animate-in slide-in-from-top duration-300',

  // Bounce animations
  bounceIn: 'animate-bounce',
  pulse: 'animate-pulse',
  
  // Spin animations
  spin: 'animate-spin',
  ping: 'animate-ping',

  // Custom transitions
  smooth: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
} as const;

// Animated container component
interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: keyof typeof animations;
  delay?: number;
  className?: string;
  trigger?: 'mount' | 'hover' | 'focus' | 'visible';
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  className = '',
  trigger = 'mount'
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'mount');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 'visible') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }
  }, [trigger]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsVisible(false);
  };

  const handleFocus = () => {
    if (trigger === 'focus') setIsVisible(true);
  };

  const handleBlur = () => {
    if (trigger === 'focus') setIsVisible(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? animations[animation] : 'opacity-0',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </div>
  );
};

// Staggered animation for lists
interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animation?: keyof typeof animations;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  animation = 'fadeInUp',
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          trigger="visible"
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
};

// Hover animation wrapper
interface HoverAnimationProps {
  children: React.ReactNode;
  scale?: number;
  lift?: boolean;
  glow?: boolean;
  className?: string;
}

export const HoverAnimation: React.FC<HoverAnimationProps> = ({
  children,
  scale = 1.05,
  lift = false,
  glow = false,
  className = ''
}) => {
  const hoverClasses = [
    'transition-all duration-300 ease-in-out',
    `hover:scale-${Math.round(scale * 100)}`,
    lift && 'hover:shadow-lg hover:-translate-y-1',
    glow && 'hover:shadow-xl hover:shadow-blue-500/25',
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(hoverClasses, className)}>
      {children}
    </div>
  );
};

// Loading animation component
interface LoadingAnimationProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  switch (type) {
    case 'spinner':
      return (
        <div className={cn(
          'border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin',
          sizeClasses[size],
          className
        )} />
      );

    case 'dots':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-blue-600 rounded-full animate-bounce',
                size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      );

    case 'pulse':
      return (
        <div className={cn(
          'bg-blue-600 rounded-full animate-pulse',
          sizeClasses[size],
          className
        )} />
      );

    case 'bars':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-blue-600 animate-pulse',
                size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-1 h-6' : 'w-2 h-8'
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      );

    default:
      return null;
  }
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={cn(
      'animate-in fade-in slide-in-from-bottom-4 duration-500',
      className
    )}>
      {children}
    </div>
  );
};

// Modal animation wrapper
interface ModalAnimationProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export const ModalAnimation: React.FC<ModalAnimationProps> = ({
  children,
  isOpen,
  className = ''
}) => {
  return (
    <div className={cn(
      'transition-all duration-300',
      isOpen 
        ? 'animate-in fade-in zoom-in-95 duration-300' 
        : 'animate-out fade-out zoom-out-95 duration-300',
      className
    )}>
      {children}
    </div>
  );
};

// Slide animation for carousels
interface SlideAnimationProps {
  children: React.ReactNode;
  direction: 'left' | 'right';
  className?: string;
}

export const SlideAnimation: React.FC<SlideAnimationProps> = ({
  children,
  direction,
  className = ''
}) => {
  const slideClass = direction === 'left' 
    ? 'animate-in slide-in-from-right duration-300'
    : 'animate-in slide-in-from-left duration-300';

  return (
    <div className={cn(slideClass, className)}>
      {children}
    </div>
  );
};

// Notification animation
interface NotificationAnimationProps {
  children: React.ReactNode;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const NotificationAnimation: React.FC<NotificationAnimationProps> = ({
  children,
  isVisible,
  position = 'top',
  className = ''
}) => {
  const animationClasses = {
    top: isVisible 
      ? 'animate-in slide-in-from-top duration-300' 
      : 'animate-out slide-out-to-top duration-300',
    bottom: isVisible 
      ? 'animate-in slide-in-from-bottom duration-300' 
      : 'animate-out slide-out-to-bottom duration-300',
    left: isVisible 
      ? 'animate-in slide-in-from-left duration-300' 
      : 'animate-out slide-out-to-left duration-300',
    right: isVisible 
      ? 'animate-in slide-in-from-right duration-300' 
      : 'animate-out slide-out-to-right duration-300',
  };

  return (
    <div className={cn(animationClasses[position], className)}>
      {children}
    </div>
  );
};

// Parallax scroll effect
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className = ''
}) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={cn('transform transition-transform', className)}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
};

// Typewriter effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  className = '',
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={cn('inline-block', className)}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Count up animation
interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 2000,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const increment = (end - start) / (duration / 16);
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment;
        if (next >= end) {
          clearInterval(timer);
          return end;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [end, start, duration]);

  return (
    <span className={className}>
      {prefix}{Math.floor(count)}{suffix}
    </span>
  );
};
