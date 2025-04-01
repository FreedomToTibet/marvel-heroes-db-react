import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';

import './style/style.scss';

window._env_ = {
  REACT_APP_MARVEL_PUBLIC_KEY: process.env.REACT_APP_MARVEL_PUBLIC_KEY,
  REACT_APP_MARVEL_PRIVATE_KEY: process.env.REACT_APP_MARVEL_PRIVATE_KEY
};

ReactDOM.render(<App />, document.getElementById('root'));

