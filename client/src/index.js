import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
<<<<<<< HEAD

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
=======
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
>>>>>>> Inventory
);