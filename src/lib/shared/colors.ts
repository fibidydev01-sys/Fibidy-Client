// ==========================================
// THEME COLOR UTILITIES
// ==========================================

interface ThemeColor {
  light: string;
  dark: string;
}

const THEME_OKLCH_MAP: Record<string, ThemeColor> = {
  '#0ea5e9': { light: 'oklch(0.685 0.169 237.323)', dark: 'oklch(0.746 0.16 232.661)' },
  '#10b981': { light: 'oklch(0.696 0.17 162.48)', dark: 'oklch(0.765 0.177 163.223)' },
  '#f43f5e': { light: 'oklch(0.645 0.246 16.439)', dark: 'oklch(0.712 0.194 13.428)' },
  '#f59e0b': { light: 'oklch(0.769 0.188 70.08)', dark: 'oklch(0.822 0.165 68.293)' },
  '#8b5cf6': { light: 'oklch(0.606 0.25 292.717)', dark: 'oklch(0.702 0.183 293.541)' },
  '#f97316': { light: 'oklch(0.705 0.213 47.604)', dark: 'oklch(0.762 0.182 50.939)' },
};

// Enam warna pilihan seller di THEME_COLORS adalah DATA SELLER, bukan warna
// merek — mereka tidak ikut berubah saat sistem desain platform berganti, dan
// memang tidak boleh: toko yang sudah memilih Emerald tetap Emerald.
//
// Yang berubah cuma jatuh-baliknya. Sebelum ini toko tanpa pilihan warna
// mewarisi merah muda platform; sekarang ia mewarisi voltase merek yang baru
// — hitam murni di terang, membalik jadi putih di gelap dengan aturan inversi
// yang sama seperti :root.
const DEFAULT_THEME: ThemeColor = {
  light: '#000000',
  dark: '#ffffff',
};

function getThemeColors(hexColor?: string): ThemeColor {
  if (!hexColor) return DEFAULT_THEME;
  const normalizedHex = hexColor.toLowerCase();
  return THEME_OKLCH_MAP[normalizedHex] || DEFAULT_THEME;
}

export function generateThemeCSS(hexColor?: string): string {
  const themeColors = getThemeColors(hexColor);
  return `
    /* Light Mode */
    .tenant-theme {
      --primary: ${themeColors.light};
      --ring: ${themeColors.light};
      --sidebar-primary: ${themeColors.light};
      --sidebar-ring: ${themeColors.light};
      --chart-1: ${themeColors.light};
    }

    /* Dark Mode */
    .dark .tenant-theme,
    .tenant-theme.dark {
      --primary: ${themeColors.dark};
      --ring: ${themeColors.dark};
      --sidebar-primary: ${themeColors.dark};
      --sidebar-ring: ${themeColors.dark};
      --chart-1: ${themeColors.dark};
    }
  `;
}
