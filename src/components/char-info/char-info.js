import React, {useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import setContent from '../../utils/set-content';
import useMarvelService from '../../services/marvel-service';

import './char-info.scss';

const CharInfo = ({charId}) => {
  const {getCharacter, clearError, process, setProcess} =
    useMarvelService();

  const [char, setChar] = useState(null);

  // useEffect(() => {
  //   updateChar();
	// 	// eslint-disable-next-line
  // }, [charId]);

	useEffect(() => {
    const savedCharId = sessionStorage.getItem('lastCharId');
    const idToLoad = charId || savedCharId;
    if (idToLoad) {
      updateChar(idToLoad);
    }
    // eslint-disable-next-line
  }, [charId]);

	useEffect(() => {
    if (charId) {
      sessionStorage.setItem('lastCharId', charId);
    }
  }, [charId]);

  const updateChar = (charId) => {
    if (!charId) return;

    clearError();

    getCharacter(charId)
      .then(onCharLoaded)
      .then(() => setProcess('confirmed'))
      .catch(() => setProcess('error'));
  };

  const onCharLoaded = (char) => {
    setChar({...char, charId});
  };

	const charInfoMemo = useMemo(() => {
		return setContent(process, CharDetailsView, char);
		// eslint-disable-next-line
	}, [process]);

  return (
    <div className="char__info">
      {charInfoMemo}
    </div>
  );
};

const CharDetailsView = ({data}) => {
  const {name, description, thumbnail, comics, charId} = data;
  let imgStyle = {objectFit: 'cover'};

	const saveScrollPosition = () => {
		const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 100;
		sessionStorage.setItem('scrollCharPosition', scrollPosition);
	};

	// if (!charId) {
	// 	charId = sessionStorage.getItem('lastCharId');
	// }

  if (
    thumbnail.includes('image_not_available') ||
    thumbnail.includes('4c002e0305708.gif')
  ) {
    imgStyle = {objectFit: 'unset'};
  }

  return (
    <>
      <div className="char__basics">
			<Link 
				to={`/characters/${charId ? charId : sessionStorage.getItem('lastCharId')}`}
				onClick={saveScrollPosition}
			>
				<img src={thumbnail} alt={name} style={imgStyle} />
      </Link>
        <div>
          <div className="char__info-name">{name}</div>
        </div>
      </div>
      <div className="char__descr">{description}</div>
      <div className="char__comics">Comics:</div>
      <ul className="char__comics-list">
        {!!comics.length ? null : "Oops! There're no any comics with this hero."}
        {comics.slice(0, 10).map((item, index) => {
          // const comicId = item.resourceURI.substring(43);
          const comicId = item.resourceURI.split('/').pop();

          return (
            <Link 
							to={`/comics/${comicId}`} 
							key={`${index + comicId}`}
							onClick={saveScrollPosition}
						>
              <li key={index} className="char__comics-item">
                {item.name}
              </li>
            </Link>
          );
        })}
      </ul>
    </>
  );
};

CharInfo.propTypes = {
  charId: PropTypes.number,
};

export default CharInfo;
