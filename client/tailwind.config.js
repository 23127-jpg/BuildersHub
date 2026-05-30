/** @type {import('tailwindcss').Config} */
export default {
  // Scan all React source files for class names
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  // Dark mode is controlled by a class on <html> (light-mode toggle)
  // Default is dark — no class needed for dark, add .light-mode for light
  darkMode: 'class',

  theme: {
    extend: {
      // ─── BuildersHub Design Tokens ───────────────────────────────────────
      colors: {
        // Dark theme (default)
        bg: '#0d0d0d',
        surface: '#1a1a1a',
        accent: '#7c3aed',
        'accent-hover': '#6d28d9',
        'accent-light': '#ede9fe',
        'text-primary': '#f5f5f5',
        'text-muted': '#a1a1aa',
        border: '#2a2a2a',

        // Light theme overrides (applied via .light-mode class)
        'bg-light': '#ffffff',
        'surface-light': '#f4f4f5',
        'text-primary-light': '#09090b',
        'text-muted-light': '#71717a',
        'border-light': '#e4e4e7',

        // Post type badge colors
        'badge-update': '#3b82f6',    // blue
        'badge-question': '#eab308',  // yellow
        'badge-resource': '#22c55e',  // green
        'badge-poll': '#7c3aed',      // purple (accent)
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ─── Border radius ───────────────────────────────────────────────────
      borderRadius: {
        pill: '9999px',   // pill-shaped buttons, nav links, tag chips
        card: '12px',     // glassmorphism cards
        badge: '6px',     // post type badges
      },

      // ─── Box shadows ─────────────────────────────────────────────────────
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(124, 58, 237, 0.15)',
        glow: '0 0 20px rgba(124, 58, 237, 0.3)',
      },

      // ─── Backdrop blur ───────────────────────────────────────────────────
      backdropBlur: {
        card: '12px',
      },

      // ─── Transitions ─────────────────────────────────────────────────────
      transitionProperty: {
        DEFAULT: 'all',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },

      // ─── Spacing / sizing ────────────────────────────────────────────────
      spacing: {
        sidebar: '240px',   // left sidebar width
        'sidebar-sm': '64px', // collapsed sidebar width
      },

      // ─── Z-index ─────────────────────────────────────────────────────────
      zIndex: {
        navbar: '100',
        modal: '200',
        toast: '300',
      },
    },
  },

  plugins: [],
};
