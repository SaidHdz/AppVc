/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1976D2', // Azul Médico (Confianza)
        alert: '#D32F2F',   // Rojo (Peligro)
        status: '#4CAF50',  // Verde (Seguro)
        background: '#F5F7FA', // Gris muy claro (Fondo)
      }
    },
  },
  plugins: [],
}