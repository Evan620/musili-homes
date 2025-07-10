/**
 * Avatar utility functions for handling user profile images
 */

/**
 * Default avatar SVG as base64 data URL
 * This is a simple user icon that works offline
 */
export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMkMyMi4yMDkxIDIyIDI0IDIwLjIwOTEgMjQgMThDMjQgMTUuNzkwOSAyMi4yMDkxIDE0IDIwIDE0QzE3Ljc5MDkgMTQgMTYgMTUuNzkwOSAxNiAxOEMxNiAyMC4yMDkxIDE3Ljc5MDkgMjIgMjAgMjJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMCAyNEMxNS41ODE3IDI0IDEyIDI3LjU4MTcgMTIgMzJIMjhDMjggMjcuNTgxNyAyNC40MTgzIDI0IDIwIDI0WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';

/**
 * Get a safe avatar URL with fallback
 * @param avatarUrl - The original avatar URL (can be null/undefined)
 * @param name - User's name for generating initials avatar
 * @returns A safe avatar URL that will always work
 */
export const getSafeAvatarUrl = (avatarUrl?: string | null, name?: string): string => {
  // If no avatar URL provided, return default
  if (!avatarUrl || avatarUrl.trim() === '') {
    return name ? generateInitialsAvatar(name) : DEFAULT_AVATAR;
  }

  // If it's a placeholder URL, return default
  if (avatarUrl.includes('placeholder.com') || avatarUrl.includes('via.placeholder')) {
    return name ? generateInitialsAvatar(name) : DEFAULT_AVATAR;
  }

  // Return the original URL (it will fallback to default if it fails to load)
  return avatarUrl;
};

/**
 * Generate an avatar with user's initials
 * @param name - User's full name
 * @returns A data URL with the user's initials
 */
export const generateInitialsAvatar = (name: string): string => {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${backgroundColor}"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="600">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') return 'U';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color based on the name
 * @param name - User's name
 * @returns A hex color string
 */
export const getColorFromName = (name: string): string => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1', // Indigo
  ];
  
  if (!name) return colors[0];
  
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Handle image error by setting fallback avatar
 * @param event - The error event from img element
 * @param name - User's name for generating initials
 */
export const handleAvatarError = (event: React.SyntheticEvent<HTMLImageElement>, name?: string) => {
  const img = event.target as HTMLImageElement;
  const fallbackUrl = name ? generateInitialsAvatar(name) : DEFAULT_AVATAR;
  
  // Prevent infinite loop if fallback also fails
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl;
  }
};

/**
 * React hook for avatar with fallback
 * @param avatarUrl - Original avatar URL
 * @param name - User's name
 * @returns Object with src and onError handler
 */
export const useAvatar = (avatarUrl?: string | null, name?: string) => {
  const safeSrc = getSafeAvatarUrl(avatarUrl, name);
  
  return {
    src: safeSrc,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => handleAvatarError(e, name),
  };
};
