import React, {useState} from 'react';

import AppHeader from '../app-header';
import RandomChar from '../random-char';
import CharList from '../char-list';
import CharInfo from '../char-info';
import ErrorBoundary from '../error-boundary';
import AppBanner from '../app-banner';

import decoration from '../../resources/img/vision.png';
import ComicsList from '../comics-list/comics-list';


const App = () => {
  const [selectedChar, setSelectedChar] = useState(null);

  const onCharSelected = (id) => {
    setSelectedChar(id);
  };

  return (
    <div className="app">
      <AppHeader />
      <main>
        {/* <ErrorBoundary>
          <RandomChar />
        </ErrorBoundary>

        <div className="char__content">
          <ErrorBoundary>
            <CharList onCharSelected={onCharSelected} />
          </ErrorBoundary>

          <ErrorBoundary>
            <CharInfo charId={selectedChar} />
          </ErrorBoundary>
        </div>
        <img className="bg-decoration" src={decoration} alt="vision" /> */}
				<AppBanner />
				<ComicsList />
      </main>
    </div>
  );
};

export default App;
