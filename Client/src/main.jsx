import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import '../src/styles/index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ToastContainer />
    <App />
  </QueryClientProvider>
  // </React.StrictMode>
);
