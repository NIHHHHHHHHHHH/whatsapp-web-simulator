// Disable console.log in production
if (import.meta.env.PROD) {
  console.log = () => {};
}



import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(

  
  <StrictMode>
    <App />
  </StrictMode>,
)
