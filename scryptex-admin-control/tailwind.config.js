
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Admin dark theme colors
        background: 'hsl(222, 84%, 4.9%)', // #0a0f1c
        foreground: 'hsl(210, 40%, 98%)', // #fafbfc
        card: 'hsl(222, 47%, 11%)', // #0f1419
        'card-foreground': 'hsl(210, 40%, 98%)',
        popover: 'hsl(222, 47%, 11%)',
        'popover-foreground': 'hsl(210, 40%, 98%)',
        primary: 'hsl(217, 91%, 60%)', // #3b82f6
        'primary-foreground': 'hsl(222, 84%, 4.9%)',
        secondary: 'hsl(217, 32%, 17%)', // #1e293b
        'secondary-foreground': 'hsl(210, 40%, 98%)',
        muted: 'hsl(215, 27%, 17%)', // #1e293b
        'muted-foreground': 'hsl(215, 20%, 65%)', // #94a3b8
        accent: 'hsl(215, 27%, 17%)',
        'accent-foreground': 'hsl(210, 40%, 98%)',
        destructive: 'hsl(0, 72%, 51%)', // #dc2626
        'destructive-foreground': 'hsl(210, 40%, 98%)',
        success: 'hsl(142, 76%, 36%)', // #16a34a
        'success-foreground': 'hsl(210, 40%, 98%)',
        warning: 'hsl(32, 95%, 44%)', // #ea580c
        'warning-foreground': 'hsl(210, 40%, 98%)',
        info: 'hsl(204, 100%, 40%)', // #0066cc
        'info-foreground': 'hsl(210, 40%, 98%)',
        border: 'hsl(215, 27%, 17%)',
        input: 'hsl(215, 27%, 17%)',
        ring: 'hsl(217, 91%, 60%)',
        // Admin specific colors
        'admin-primary': '#1a1a2e',
        'admin-secondary': '#16213e',
        'admin-accent': '#0f3460',
        'admin-success': '#00ff88',
        'admin-warning': '#ffb800',
        'admin-danger': '#ff4757',
        'admin-info': '#00d4ff',
        'admin-text': '#ffffff',
        'admin-text-secondary': '#b8bcc8',
        'admin-border': '#2c3e50'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'admin': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'admin-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
