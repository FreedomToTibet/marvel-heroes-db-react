import React, {useState, useEffect, useMemo} from 'react';
import {Link} from 'react-router-dom';

import ErrorMessage from '../error-message';
import Spinner from '../spinner';
import AppWrap from '../../wrapper/app-wrapper';

import useMarvelService from '../../services/marvel-service';

import './comics-list.scss';

const setContent = (process, Component, newItemLoading) => {
  switch (process) {
    case 'waiting':
      return <Spinner />;
    case 'loading':
      return newItemLoading ? <Component /> : <Spinner />;
    case 'confirmed':
      return <Component />;
    case 'error':
      return <ErrorMessage />;
    default:
      return null;
  }
};

const ComicsList = () => {
  const {getAllComics, process, setProcess} = useMarvelService();

  const storageComicsOffset = Number(sessionStorage.getItem('storageComicsOffset'));
  const storageComicsList = JSON.parse(sessionStorage.getItem('storageComicsList'));

  const [comicsList, setComicsList] = useState(
    !storageComicsList ? [] : storageComicsList,
  );
  const [newItemLoading, setnewItemLoading] = useState(false);
  const [offset, setOffset] = useState(!storageComicsOffset ? 0 : storageComicsOffset);
  const [comicsEnded, setComicsEnded] = useState(false);
	const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (storageComicsList && storageComicsList.length > 0) {
      setProcess('confirmed');
      setTimeout(() => {
        returnScrollPosition();
      }, 200);
    } else {
      // Otherwise, load comics for the first time
      onRequest(offset, true);
    }
    // eslint-disable-next-line
  }, []);

  const returnScrollPosition = () => {
    const savedScrollPosition = sessionStorage.getItem('scrollComicPosition');

    if (savedScrollPosition) {
      try {
        setTimeout(() => {
          const scrollY = parseInt(savedScrollPosition, 10);
          if (!isNaN(scrollY)) {
            window.scrollTo({
              top: scrollY,
              behavior: 'smooth',
            });
          }
        }, 100);
      } catch (e) {
        console.error('Scroll error:', e);
      }
    }
  };

	const saveScrollPosition = () => {
		const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 100;
		sessionStorage.setItem('scrollComicPosition', scrollPosition);
	};

  const onRequest = (offset, initial) => {
    initial ? setnewItemLoading(false) : setnewItemLoading(true);

    getAllComics(offset)
      .then(onComicsListLoaded)
      .then(() => setProcess('confirmed'))
			.then(() => {
				if (!initial && !initialLoad) {
					setTimeout(() => {
						window.scrollTo({
							top: document.documentElement.scrollHeight,
							behavior: 'smooth',
						});
					}, 100);
				}
				setInitialLoad(false);
			})
  };

  const onComicsListLoaded = (newComicsList) => {
    let ended = false;
    if (newComicsList.length < 8) {
      ended = true;
    }

		const updatedList = [...comicsList, ...newComicsList];
    setComicsList(updatedList);

    setnewItemLoading(false);

		const newOffset = offset + 9;
    setOffset(newOffset);

    sessionStorage.setItem('storageComicsOffset', newOffset);
    sessionStorage.setItem('storageComicsList', JSON.stringify(updatedList));

    setComicsEnded(ended);

		return newComicsList;
  };

  function renderItems(arr) {
    const items = arr.map((item, i) => {
      return (
        <li className="comics__item" key={`${i + item.id}`}>
          <Link 
						to={`/comics/${item.id}`}
						onClick={saveScrollPosition}
					>
            <img src={item.thumbnail} alt={item.title} className="comics__item-img" />
            <div className="comics__item-name">{item.title}</div>
            <div className="comics__item-price">{item.price}</div>
          </Link>
        </li>
      );
    });

    return <ul className="comics__grid">{items}</ul>;
  }

	const comicsListMemo = useMemo(() => {
    return setContent(process, () => renderItems(comicsList), newItemLoading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process]);

  return (
    <div className="comics__list">
      {comicsListMemo}
      <button
        disabled={newItemLoading}
        style={{display: comicsEnded ? 'none' : 'block'}}
        className="button button__main button__long"
        onClick={() => {
					onRequest(offset);
					saveScrollPosition();
				}}
      >
        <div className="inner">load more</div>
      </button>
    </div>
  );
};

export default AppWrap(ComicsList);
