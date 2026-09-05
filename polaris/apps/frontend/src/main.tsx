import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      theme="dark" 
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          color: '#f1f5f9',
        },
      }}
    />
  </React.StrictMode>,
)
