import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import ErrorMessage from '../error-message';
import Spinner from '../spinner';

import useMarvelService from '../../services/marvel-service';

import './comics-list.scss';

const ComicsList = () => {
  const {loading, error, getAllComics} = useMarvelService();

	const storageComicsOffset = Number(sessionStorage.getItem('storageComicsOffset'));
	const storageComicsList = JSON.parse(sessionStorage.getItem('storageComicsList'));

  const [comicsList, setComicsList] = useState(!storageComicsList ? [] : storageComicsList);
  const [newItemLoading, setnewItemLoading] = useState(false);
  const [offset, setOffset] = useState(!storageComicsOffset ? 0 : storageComicsOffset);
  const [comicsEnded, setComicsEnded] = useState(false);

  useEffect(() => {
    onRequest(offset, true);
  }, []);

  const onRequest = (offset, initial) => {
    initial ? setnewItemLoading(false) : setnewItemLoading(true);
		getAllComics(offset).then(onComicsListLoaded)
  };

  const onComicsListLoaded = (newComicsList) => {
    let ended = false;
    if (newComicsList.length < 8) {
      ended = true;
    }
    setComicsList([...comicsList, ...newComicsList]);
    setnewItemLoading(false);
    setOffset(offset + 8);
		sessionStorage.setItem('storageComicsOffset', offset);
		sessionStorage.setItem('storageComicsList', JSON.stringify(comicsList));
    setComicsEnded(ended);
  };

  function renderItems(arr) {
    const items = arr.map((item, i) => {
      return (
        <li className="comics__item" key={`${i+item.id}`}>
          <Link to={`/comics/${item.id}`}>
            <img src={item.thumbnail} alt={item.title} className="comics__item-img" />
            <div className="comics__item-name">{item.title}</div>
            <div className="comics__item-price">{item.price}</div>
          </Link>
        </li>
      );
    });

    return <ul className="comics__grid">{items}</ul>;
  }

  const items = renderItems(comicsList);

  const errorMessage = error ? <ErrorMessage /> : null;
  const spinner = loading && !newItemLoading ? <Spinner /> : null;

  return (
    <div className="comics__list">
      {errorMessage}
      {spinner}
      {items}
      <button
        disabled={newItemLoading}
        style={{display: comicsEnded ? 'none' : 'block'}}
        className="button button__main button__long"
        onClick={() => onRequest(offset)}
      >
        <div className="inner">load more</div>
      </button>
    </div>
  );
};

export default ComicsList;
