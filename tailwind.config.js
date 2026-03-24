/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        urgent: '#dc2626',
        invoice: '#ea580c',
        customer: '#b45309',
        internal: '#2563eb',
        followup: '#eab308',
        lowpriority: '#6b7280',
      },
    },
  },
  plugins: [],
};
