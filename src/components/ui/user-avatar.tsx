import React from 'react';
import { cn } from '@/lib/utils';
import { useAvatar } from '@/utils/avatarUtils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

/**
 * UserAvatar component with automatic fallback to initials
 * Handles placeholder URLs and network errors gracefully
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  alt,
  size = 'md',
  className,
}) => {
  const avatarProps = useAvatar(src, name);
  
  return (
    <img
      {...avatarProps}
      alt={alt || name || 'User avatar'}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
    />
  );
};

export default UserAvatar;
