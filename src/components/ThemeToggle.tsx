
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  // Theme toggle is disabled - always light mode
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      aria-label="Light theme (dark mode disabled)"
      className="rounded-full text-gray-800 opacity-50 cursor-not-allowed"
      title="Dark mode disabled - using light theme only"
    >
      <Sun className="h-5 w-5" />
    </Button>
  );
};

export default ThemeToggle;
