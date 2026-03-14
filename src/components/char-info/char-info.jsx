import React, {useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import setContent from '../../utils/set-content';
import useComicVineService from '../../services/comicvine-service';
import ImageViewer from '../ui/image-viewer';
import { isValidImage } from '../../utils/html-utils';

import './char-info.scss';

const CharInfo = ({charId}) => {
  const {getCharacter, clearError, process, setProcess} =
    useComicVineService();

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
  const {name, description, thumbnail, fullSizeImage, comics, powers, charId} = data;
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  let imgStyle = {objectFit: 'cover'};

	const saveScrollPosition = () => {
		const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 100;
		sessionStorage.setItem('scrollCharPosition', scrollPosition);
	};

  const openImageViewer = (e) => {
    e.preventDefault();
    if (fullSizeImage || !thumbnail.includes('placeholder')) {
      setIsImageViewerOpen(true);
    }
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };

	// if (!charId) {
	// 	charId = sessionStorage.getItem('lastCharId');
	// }

  // Use Comic Vine image validation instead of Marvel-specific checks
  if (!isValidImage(thumbnail)) {
    imgStyle = {objectFit: 'unset'};
  }

  return (
    <>
      <div className="char__basics">
			<Link 
				to={`/characters/${charId ? charId : sessionStorage.getItem('lastCharId')}`}
				onClick={saveScrollPosition}
			>
				<img 
          src={thumbnail} 
          alt={name} 
          style={{...imgStyle, cursor: fullSizeImage ? 'zoom-in' : 'pointer'}} 
          onClick={openImageViewer}
        />
      </Link>
        <div>
          <div className="char__info-name">{name}</div>
        </div>
      </div>
      <div className="char__descr">{description}</div>
      
      {/* Powers Section */}
      {powers && powers.length > 0 && (
        <>
          <div className="char__powers-label">Powers:</div>
          <ul className="char__powers-list">
            {powers.map((power) => (
              <li key={power} className="char__powers-item">
                {power}
              </li>
            ))}
          </ul>
        </>
      )}
      
      <div className="char__comics">Comics:</div>
      <ul className="char__comics-list">
        {!!comics.length ? null : "Oops! There're no comics with this hero."}
        {comics.slice(0, 10).map((item) => {
          // Comic Vine provides ID directly, no need to parse resourceURI
          const comicId = item.id || item.resourceURI?.split('/').pop();

          return (
            <Link 
						to={`/comics/${comicId}`} 
						key={comicId}
						onClick={saveScrollPosition}
					>
              <li className="char__comics-item">
                {item.name}
              </li>
            </Link>
          );
        })}
      </ul>

      <ImageViewer 
        src={fullSizeImage || thumbnail} 
        alt={name} 
        isOpen={isImageViewerOpen} 
        onClose={closeImageViewer} 
      />
    </>
  );
};

CharInfo.propTypes = {
  charId: PropTypes.number,
};

export default CharInfo;
