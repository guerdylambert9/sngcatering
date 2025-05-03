/* import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' */
//import './index.css'
//import App from './App.jsx'

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './context/CartContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);


/* createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
) */
