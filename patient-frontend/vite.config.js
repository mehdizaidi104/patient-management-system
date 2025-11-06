import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- ADD THIS IMPORT

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({ // <-- ADD THE PLUGIN
      // This tells Tailwind where to look for classes
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
    }),
  ],
})