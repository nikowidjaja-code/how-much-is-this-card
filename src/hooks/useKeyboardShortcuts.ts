import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutProps {
  onSearch?: () => void;
  onSort?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
}

export const useKeyboardShortcuts = ({
  onSearch,
  onSort,
  onNavigateNext,
  onNavigatePrev,
}: KeyboardShortcutProps) => {
  const router = useRouter();
  const isMetaPressed = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for meta key (Cmd on Mac, Ctrl on Windows)
      if (e.key === 'Meta' || e.key === 'Control') {
        isMetaPressed.current = true;
      }

      // Add new card: Cmd/Ctrl + A
      if (isMetaPressed.current && e.key === 'a') {
        e.preventDefault();
        router.push('/add');
      }

      // Focus search: Cmd/Ctrl + F
      if (isMetaPressed.current && e.key === 'f' && onSearch) {
        e.preventDefault();
        onSearch();
      }

      // Toggle sort: Cmd/Ctrl + S
      if (isMetaPressed.current && e.key === 's' && onSort) {
        e.preventDefault();
        onSort();
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowDown' && onNavigateNext) {
        onNavigateNext();
      }
      if (e.key === 'ArrowUp' && onNavigatePrev) {
        onNavigatePrev();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        isMetaPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [router, onSearch, onSort, onNavigateNext, onNavigatePrev]);
}; 