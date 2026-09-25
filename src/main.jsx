import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BirthdayProvider } from './context/BirthdayContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BirthdayProvider>
      <App />
    </BirthdayProvider>
  </StrictMode>
);
