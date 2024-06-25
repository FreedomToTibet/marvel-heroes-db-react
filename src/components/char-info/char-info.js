import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import setContent from '../../utils/set-content';

import useMarvelService from '../../services/marvel-service';

import './char-info.scss';

const CharInfo = (props) => {
  const {getCharacter, clearError, process, setProcess} =
    useMarvelService();

  const [char, setChar] = useState(null);

  useEffect(() => {
    updateChar();
  }, [props.charId]);

  const updateChar = () => {
    const {charId} = props;
    if (!charId) return;

    clearError();

    getCharacter(charId)
      .then(onCharLoaded)
      .then(() => setProcess('confirmed'))
      .catch(() => setProcess('error'));
  };

  const onCharLoaded = (char) => {
    setChar(char);
  };

  

  return (
    <div className="char__info">
      {setContent(process, CharDetailsView, char)}
    </div>
  );
};

const CharDetailsView = ({data}) => {
  const {name, description, thumbnail, homepage, wiki, comics} = data;
  let imgStyle = {objectFit: 'cover'};

  if (
    thumbnail.includes('image_not_available') ||
    thumbnail.includes('4c002e0305708.gif')
  ) {
    imgStyle = {objectFit: 'unset'};
  }

  return (
    <>
      <div className="char__basics">
        <img src={thumbnail} alt={name} style={imgStyle} />
        <div>
          <div className="char__info-name">{name}</div>
          <div className="char__btns">
            <a
              href={homepage}
              target="_blank"
              rel="noreferrer"
              className="button button__main"
            >
              <div className="inner">homepage</div>
            </a>
            <a
              href={wiki}
              target="_blank"
              rel="noreferrer"
              className="button button__secondary"
            >
              <div className="inner">Wiki</div>
            </a>
          </div>
        </div>
      </div>
      <div className="char__descr">{description}</div>
      <div className="char__comics">Comics:</div>
      <ul className="char__comics-list">
        {!!comics.length ? null : "Oops! There're no any comics with this hero."}
        {comics.slice(0, 10).map((item, index) => {
          const comicId = item.resourceURI.substring(43);

          return (
            <Link to={`/comics/${comicId}`} key={`${index + comicId}`}>
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
