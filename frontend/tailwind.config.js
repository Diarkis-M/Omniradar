/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        'godrej-sky': '#5BC8FF',
        'godrej-blue': '#2B95DA',
        'godrej-green': '#5FB233',
        'godrej-magenta': '#BD1362',
      },
      fontFamily: {
        display: ['Fraunces', 'Times New Roman', 'serif'],
        body: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        editorial: '2px',
      },
      maxWidth: {
        content: '1320px',
      },
    },
  },
  plugins: [],
};
