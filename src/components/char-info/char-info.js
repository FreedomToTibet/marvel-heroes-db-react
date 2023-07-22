import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Spinner from '../spinner';
import ErrorMessage from '../error-message';
import Skeleton from '../skeleton';

import useMarvelService from '../../services/marvel-service';

import './char-info.scss';

const CharInfo = (props) => {
  const {loading, error, getCharacter, clearError} = useMarvelService();

  const [char, setChar] = useState(null);

  useEffect(() => {
    updateChar();
  }, [props.charId]);

  const updateChar = () => {
    const {charId} = props;
    if (!charId) return;

    clearError();

    getCharacter(charId).then(onCharLoaded);
  };

  const onCharLoaded = (char) => {
    setChar(char);
  };

  const skeleton = char || loading || error ? null : <Skeleton />;

  const spinner = loading ? <Spinner /> : null;
  const errorMessage = error ? <ErrorMessage /> : null;
  const content = !(loading || error || !char) ? <CharDetailsView char={char} /> : null;

  return (
    <div className="char__info">
      {skeleton}
      {errorMessage}
      {spinner}
      {content}
    </div>
  );
};

const CharDetailsView = ({char}) => {
  const {name, description, thumbnail, homepage, wiki, comics} = char;
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
					console.log(comicId);

          return (
            <Link to={`comics/${comicId}`} key={`${index + comicId}`}>
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
