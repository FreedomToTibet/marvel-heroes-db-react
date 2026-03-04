import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';

import './style/style.scss';

window._env_ = {
  REACT_APP_COMICVINE_API_KEY: process.env.REACT_APP_COMICVINE_API_KEY
};

ReactDOM.render(<App />, document.getElementById('root'));

