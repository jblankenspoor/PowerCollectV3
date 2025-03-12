import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import PiwikPro from '@piwikpro/react-piwik-pro'

/**
 * Initialize Piwik Pro analytics
 * @param {string} '3bde326f-e70c-4561-bd77-5de7a24b8637' - The container ID for tracking
 * @param {string} 'https://jacco.containers.piwik.pro' - The URL of the Piwik Pro instance
 */
PiwikPro.initialize('3bde326f-e70c-4561-bd77-5de7a24b8637', 'https://jacco.containers.piwik.pro');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
