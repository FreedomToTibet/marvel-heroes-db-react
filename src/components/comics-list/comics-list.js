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

  // Page navigation state
  const [pageNumber, setPageNumber] = useState(1);
  const [jumpError, setJumpError] = useState('');
  const [inputValue, setInputValue] = useState('1');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [requestedPage, setRequestedPage] = useState(null);

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

  // Calculate page number based on offset
  useEffect(() => {
    if (!isInputFocused && !requestedPage) {
      const calculatedPage = Math.ceil(offset / 8); // Comics use 8 per page
      console.log(
        `Updating page number based on offset ${offset} => page ${calculatedPage}`,
      );

      if (calculatedPage > 0) {
        setPageNumber(calculatedPage);
        setInputValue(calculatedPage.toString());
      }
    }
  }, [offset, isInputFocused, requestedPage]);

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

  const onRequest = (offsetVal, initial) => {
    initial ? setnewItemLoading(false) : setnewItemLoading(true);

    if (!initial) {
      setRequestedPage(null);
    }

    getAllComics(offsetVal)
      .then((newComicsList) => {
        return onComicsListLoaded(newComicsList, offsetVal);
      })
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
      });
  };

  const onComicsListLoaded = (newComicsList, currentOffset) => {
    let ended = false;
    if (newComicsList.length < 8) {
      ended = true;
    }

    const updatedList = [...comicsList, ...newComicsList];
    setComicsList(updatedList);

    setnewItemLoading(false);

    const itemCount = newComicsList.length;
    const newOffset = currentOffset + itemCount;

    setOffset(newOffset);

    sessionStorage.setItem('storageComicsOffset', newOffset);
    sessionStorage.setItem('storageComicsList', JSON.stringify(updatedList));

    setComicsEnded(ended);

    return newComicsList;
  };

  const jumpToPage = () => {
    // Clear previous errors
    setJumpError('');

    // Validate page number
    if (pageNumber < 1) {
      setJumpError('Please enter a valid page number');
      return;
    }

    setRequestedPage(pageNumber);

    const newOffset = (pageNumber - 1) * 8;

    // Clear existing list and set new offset
    setComicsList([]);
    setComicsEnded(false);

    // Remove storage items to prevent issues with state management
    sessionStorage.removeItem('storageComicsList');
    sessionStorage.removeItem('storageComicsOffset');

    setOffset(newOffset);

    // Request comics from the new offset
    onRequest(newOffset, true);

    // Scroll to top of list
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // page input handling functions
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value === '') {
      setPageNumber(1);
    } else {
      setPageNumber(parseInt(e.target.value) || 1);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    setInputValue('');
  };

  const handleInputBlur = (e) => {
		// Check if the related target is the jump button
    if (e.relatedTarget && e.relatedTarget.classList.contains('comics__jump-btn')) {
      return; // Don't do anything if we're clicking the button
    }
    setIsInputFocused(false);
    if (inputValue === '') {
      setInputValue(pageNumber.toString());
    } else {
      const numValue = parseInt(inputValue) || 1;
      setPageNumber(numValue);
      setInputValue(numValue.toString());

      if (numValue !== pageNumber) {
        setRequestedPage(numValue);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      jumpToPage();
    }
  };

  function renderItems(arr) {
    const items = arr.map((item, i) => {
      return (
        <li className="comics__item" key={`${i + item.id}`}>
          <Link to={`/comics/${item.id}`} onClick={saveScrollPosition}>
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
    return setContent(process, () => renderItems(comicsList), newItemLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process]);

  return (
    <div className="comics__list">
      {comicsListMemo}

      <div className="comics__pagination">
        <div className="comics__jump-controls">
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder="Page #"
            className="comics__jump-input"
          />

          <button
            onClick={jumpToPage}
            disabled={newItemLoading}
            className="button button__secondary comics__jump-btn"
          >
            <div className="inner">Jump to page</div>
          </button>
        </div>
        {jumpError && <div className="comics__jump-error">{jumpError}</div>}
      </div>

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
