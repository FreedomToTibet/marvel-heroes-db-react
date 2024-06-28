import {useState} from 'react';
import {Helmet} from 'react-helmet';

import RandomChar from '../random-char';
import CharList from '../char-list';
import CharInfo from '../char-info';
import ErrorBoundary from '../error-boundary';

import decoration from '../../resources/img/vision.png';

const MainPage = () => {
  const [selectedChar, setChar] = useState(null);

  const onCharSelected = (id) => {
    setChar(id);
  };

  return (
    <>
      <Helmet>
        <title>Marvel Universe</title>
        <meta name="description" content="Marvel Universe" />
      </Helmet>
      <ErrorBoundary>
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
      <img className="bg-decoration" src={decoration} alt="vision" />
    </>
  );
};

export default MainPage;
