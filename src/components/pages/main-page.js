import {useState} from 'react';
import {Helmet} from 'react-helmet';
import AppWrap from '../../wrapper/app-wrapper';

import RandomChar from '../random-char';
import CharList from '../char-list';
import CharInfo from '../char-info';
import FindCharacter from '../find-character';
import ErrorBoundary from '../error-boundary';
import {CharacterProvider} from '../../context/character-context';

import decoration from '../../resources/img/vision.png';

const MainPage = () => {
  const [selectedChar, setSelectedChar] = useState(null);

  const onCharSelected = (id) => {
    setSelectedChar(id);
  };

  return (
    <CharacterProvider onCharSelected={onCharSelected}>
      <Helmet>
        <title>Marvel Universe</title>
        <meta name="description" content="Marvel Universe" />
      </Helmet>
      <ErrorBoundary>
        <RandomChar />
      </ErrorBoundary>
      <ErrorBoundary>
        <FindCharacter onCharSelected={onCharSelected} />
      </ErrorBoundary>
      <div className="char__content">
        <ErrorBoundary>
          <CharList onCharSelected={onCharSelected} />
        </ErrorBoundary>

        <ErrorBoundary>
          <CharInfo charId={selectedChar} />
        </ErrorBoundary>
      </div>
      <img className="bg-decoration" src={decoration} alt="vision" />
    </CharacterProvider>
  );
};

export default AppWrap(MainPage);
