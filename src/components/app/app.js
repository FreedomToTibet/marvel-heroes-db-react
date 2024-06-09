import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';

import AppHeader from '../app-header';
import SinglePage from '../pages/single-page';

import Spinner from '../spinner';

const Page404 = lazy(() => import('../pages/404'));
const MainPage = lazy(() => import('../pages/main-page'));
const ComicsPage = lazy(() => import('../pages/comics-page'));
const SingleComicLayout = lazy(() => import('../pages/single-comic-layout/single-comic-layout'));
const SingleCharacterLayout = lazy(() => import('../pages/single-character-layout/single-character-layout'));

const App = () => {
  return (
    <Router>
      <div className="app">
        <AppHeader />
        <main>
          <Suspense fallback={<Spinner/>}>
            <Routes>
              <Route path="/" element={<Navigate replace to="/characters" />} />
              <Route path="/characters" element={<MainPage />} />
              <Route path="/comics" element={<ComicsPage />} />
							<Route path="/comics/:id" element={<SinglePage Component={SingleComicLayout} dataType='comic'/>} />
							<Route path="/characters/:id" element={<SinglePage Component={SingleCharacterLayout} dataType='character'/>} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default App;
