import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedTextProps {
  text: string;
  className?: string;
  maxLines?: number;
  preserveWhitespace?: boolean;
}

/**
 * Component for displaying formatted text that preserves line breaks and paragraphs
 * Useful for property descriptions, user messages, and other multi-line content
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className,
  maxLines,
  preserveWhitespace = true
}) => {
  const baseClasses = preserveWhitespace ? 'whitespace-pre-wrap' : '';
  const lineClampClasses = maxLines ? `line-clamp-${maxLines}` : '';
  
  return (
    <div className={cn(baseClasses, lineClampClasses, className)}>
      {text}
    </div>
  );
};

interface PropertyDescriptionProps {
  description: string;
  className?: string;
  maxLines?: number;
  size?: 'sm' | 'base' | 'lg';
}

/**
 * Specialized component for displaying property descriptions with proper formatting
 */
export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
  className,
  maxLines,
  size = 'base'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  return (
    <FormattedText
      text={description}
      className={cn(
        'leading-relaxed text-slate-700',
        sizeClasses[size],
        className
      )}
      maxLines={maxLines}
      preserveWhitespace={true}
    />
  );
};

export default FormattedText;
