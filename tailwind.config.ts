/* eslint-disable */
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1080px',
      xl: '1366px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: {
          DEFAULT: 'var(--background)',
          starry: 'var(--background-starry)',
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        comic: {
          darkblue: '#1E3A8A', // Deeper, more professional blue
          red: '#DC2626', // More muted red
          blue: '#4FC3F7', // Light bright blue
          yellow: {
            DEFAULT: '#FFD700', // Bright but light yellow
            light: '#FFE44D', // Lighter yellow
            dark: '#B89B00', // Darker yellow
            pale: '#FFF4B8', // Very light yellow
            vivid: '#FFD000', // More saturated yellow
          },
          green: '#34d399', // Light emerald green
          purple: '#7C3AED', // Rich purple
          white: '#FFFFFF',
          black: '#000000',
          transparent: '#00000000',
        },
        pink: '#DB2777', // Professional magenta pink
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: 'calc(var(--radius) - 5px)',
        xxs: 'calc(var(--radius) - 8px)',
      },
      fontFamily: {
        comic: ['Comic Neue', 'cursive'],
      },
      boxShadow: {
        comic: '5px 5px 0px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  //
  plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar')],
} satisfies Config;
