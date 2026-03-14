import React, {useEffect, useState, useContext} from 'react';

import useComicVineService from '../../services/comicvine-service';
import setContent from '../../utils/set-content';
import {CharacterContext} from '../../context/character-context';
import { isValidImage } from '../../utils/html-utils';

import './random-char.scss';
import mjolnir from '../../resources/img/mjolnir.png';

const RandomChar = () => {
  const [char, setChar] = useState(null);
  const {getRandomCharacter, clearError, process, setProcess} = useComicVineService();

  useEffect(() => {
    updateChar();
    const timerId = setInterval(updateChar, 6000000);

    return () => {
      clearInterval(timerId);
    };
		// eslint-disable-next-line
  }, []);

  const onCharLoaded = (char) => {
    setChar({...char, id: char.id});
  };

  const updateChar = () => {
    clearError();
    // Use Comic Vine's random character method (single request with random offset)
    getRandomCharacter()
      .then(onCharLoaded)
      .then(() => setProcess('confirmed'));
  };

  return (
    <div className="randomchar">
      {setContent(process, CharView, char)}
      <div className="randomchar__static">
        <p className="randomchar__title">
          Random character for today!
          <br />
          Do you want to get to know him better?
        </p>
        <p className="randomchar__title">Or choose another one</p>
        <button className="button button__main" onClick={updateChar}>
          <div className="inner">try it</div>
        </button>
        <img src={mjolnir} alt="mjolnir" className="randomchar__decoration" />
      </div>
    </div>
  );
};

const CharView = ({data}) => {
  const {name, description, thumbnail, id} = data;
	const {onCharSelected} = useContext(CharacterContext);

  // Use Comic Vine image validation (inverted: true when image is NOT available)
  const imgAvailable = !isValidImage(thumbnail);

	const handleCharacterSelect = () => {
    onCharSelected(id);
    
    const charContent = document.querySelector('.char__content');
    if (charContent) {
      setTimeout(() => {
        charContent.scrollIntoView({
          behavior: 'smooth', 
          block: 'start'
        });
      }, 50);
    }
    
    // Clear any previous selections
    sessionStorage.setItem('lastSelectedCharIndex', -1);
  };

  return (
    <div className="randomchar__block">
			<div 
				onClick={handleCharacterSelect}
        style={{cursor: 'pointer'}}
			>
			<img
        src={thumbnail}
        alt="Random character"
        className="randomchar__img"
        style={{objectFit: imgAvailable ? 'contain' : 'cover'}}
      />
      </div>
      <div className="randomchar__info">
        <p className="randomchar__name">{name}</p>
        <p className="randomchar__descr">{description}</p>
      </div>
    </div>
  );
};

export default RandomChar;
