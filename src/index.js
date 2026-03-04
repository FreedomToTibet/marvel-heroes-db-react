import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/app';

import './style/style.scss';

window._env_ = {
  REACT_APP_COMICVINE_API_KEY: process.env.REACT_APP_COMICVINE_API_KEY
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

