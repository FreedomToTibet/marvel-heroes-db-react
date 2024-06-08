import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';

import AppHeader from '../app-header';

import Spinner from '../spinner';
import { SingleCharacterPage } from '../pages';

const Page404 = lazy(() => import('../pages/404'));
const MainPage = lazy(() => import('../pages/main-page'));
const ComicsPage = lazy(() => import('../pages/comics-page'));
const SingleComicPage = lazy(() => import('../pages/single-comic-page'));

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
              <Route path="/comics/:comicId" element={<SingleComicPage />} />
							<Route path="/characters/:id" element={<SingleCharacterPage/>} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default App;
