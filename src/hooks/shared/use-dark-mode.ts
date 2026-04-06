'use client';

// ==========================================
// useDarkMode
// Sync isDark state dengan document class via MutationObserver
// Toggle dark/light + persist ke localStorage
//
// Nama: useDarkMode (bukan useTheme — hindari konflik next-themes)
// Dipakai di: dashboard-sidebar, mobile-navbar,
//             admin-sidebar, admin-mobile-navbar
// ==========================================

import { useEffect, useState } from 'react';

interface UseDarkModeReturn {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export function useDarkMode(): UseDarkModeReturn {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return { isDark, toggleDarkMode };
}