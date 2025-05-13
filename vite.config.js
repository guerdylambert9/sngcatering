import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: [
      // Add problematic dependencies here
      "@stripe/stripe-js", // Example for Stripe
      "chunk-UBDIXFPO"     // Use the chunk name from your error
    ]
  },
  plugins: [react()],
})
