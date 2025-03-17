import React, {useState, useEffect, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';

import useMarvelService from '../../services/marvel-service';
import Spinner from '../spinner';
import ErrorMessage from '../error-message';

import './char-list.scss';

const setContent = (process, Component, newItemsLoading) => {
  switch (process) {
    case 'waiting':
      return <Spinner />;
    case 'loading':
      return newItemsLoading ? <Component /> : <Spinner />;
    case 'confirmed':
      return <Component />;
    case 'error':
      return <ErrorMessage />;
    default:
      return null;
  }
};

const CharList = (props) => {
  const {getAllCharacters, process, setProcess} = useMarvelService();

  const storageCharOffset = Number(sessionStorage.getItem('storageCharOffset'));
  const storageCharList = JSON.parse(sessionStorage.getItem('storageCharList'));
  const lastIndex = parseInt(sessionStorage.getItem('lastSelectedCharIndex'));

  const [charList, setCharList] = useState(!storageCharList ? [] : storageCharList);
  const [newItemsLoading, setNewItemLoading] = useState(false);
  const [offset, setOffset] = useState(!storageCharOffset ? 0 : storageCharOffset);

  const [charListEnded, setCharListEnded] = useState(false);

  const [initialLoad, setInitialLoad] = useState(true);

  const [pageNumber, setPageNumber] = useState(1);
  const [jumpError, setJumpError] = useState('');

  const [inputValue, setInputValue] = useState(pageNumber);
  const [isInputFocused, setIsInputFocused] = useState(false);

	const [requestedPage, setRequestedPage] = useState(null);

  useEffect(() => {
    if (storageCharList && storageCharList.length > 0) {
      setProcess('confirmed');
      setTimeout(() => {
        returnScrollPosition();
      }, 200);
    } else {
      // Otherwise, load characters for the first time
      onRequest(offset, true);
    }
    // eslint-disable-next-line
  }, []);

	useEffect(() => {
		if (!isInputFocused && !requestedPage) {
			const calculatedPage = Math.ceil(offset / 9);
			
			if (calculatedPage > 0) {
				setPageNumber(calculatedPage);
				setInputValue(calculatedPage.toString());
			}
		}
	}, [offset, isInputFocused, requestedPage]);

  const returnScrollPosition = () => {
    const savedScrollPosition = sessionStorage.getItem('scrollCharPosition');
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
    sessionStorage.setItem('scrollCharPosition', scrollPosition);
  };

  const onRequest = (offsetVal, initial) => {

    initial ? setNewItemLoading(false) : setNewItemLoading(true);

		if (!initial) {
			setRequestedPage(null);
		}

    getAllCharacters(offsetVal)
      .then(newCharList => {
				return onCharListLoaded(newCharList, offsetVal);
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

  const onCharListLoaded = (newCharList, currentOffset) => {
    let ended = false;
    if (newCharList.length < 9) {
      ended = true;
    }

    const updatedList = [...charList, ...newCharList];
    setCharList(updatedList);

    setNewItemLoading(false);

    const itemCount = newCharList.length;
  	const newOffset = currentOffset + itemCount;

  setOffset(newOffset);

    sessionStorage.setItem('storageCharOffset', newOffset);
    sessionStorage.setItem('storageCharList', JSON.stringify(updatedList));

    setCharListEnded(ended);

    return newCharList;
  };

  const jumpToPage = () => {

    setJumpError('');

    if (pageNumber < 1) {
      setJumpError('Please enter a valid page number');
      return;
    }

		setRequestedPage(pageNumber);

    const newOffset = (pageNumber - 1) * 9;

    setCharList([]);
    setCharListEnded(false);

    sessionStorage.removeItem('storageCharList');
    sessionStorage.removeItem('storageCharOffset');
    sessionStorage.removeItem('lastSelectedCharIndex');

		setOffset(newOffset);

		onRequest(newOffset, true);

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

  const handleInputBlur = () => {
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

  const itemRefs = useRef([]);

  const focusOnItem = (id) => {
    itemRefs.current.forEach((item) => item.classList.remove('char__item_selected'));
    itemRefs.current[id].classList.add('char__item_selected');
    itemRefs.current[id].focus();
  };

  function renderItems(arr) {
    const items = arr.map((item, i) => {
      let imgStyle = {objectFit: 'cover'};

      if (
        item.thumbnail.includes('image_not_available') ||
        item.thumbnail.includes('4c002e0305708.gif')
      ) {
        imgStyle = {objectFit: 'unset'};
      }

      const initialClass =
        lastIndex === i ? 'char__item char__item_selected' : 'char__item';

      return (
        <li
          className={initialClass}
          key={item.id}
          tabIndex={0}
          ref={(element) => (itemRefs.current[i] = element)}
          onClick={() => {
            props.onCharSelected(item.id);
            focusOnItem(i);
            sessionStorage.setItem('lastSelectedCharIndex', i);
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              props.onCharSelected(item.id);
              focusOnItem(i);
              sessionStorage.setItem('lastSelectedCharIndex', i);
            }
          }}
        >
          <img src={item.thumbnail} alt={item.name} style={imgStyle} />
          <div className="char__name">{item.name}</div>
        </li>
      );
    });

    return <ul className="char__grid">{items}</ul>;
  }

  const charListMemo = useMemo(() => {
    return setContent(process, () => renderItems(charList), newItemsLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process]);

  return (
    <div className="char__list">
      {charListMemo}
      <div className="char__pagination">
        <div className="char__jump-controls">
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder="Page #"
            className="char__jump-input"
          />
          <button
            onClick={jumpToPage}
            disabled={newItemsLoading}
            className="button button__secondary char__jump-btn"
          >
            <div className="inner">Jump to page</div>
          </button>
        </div>
        {jumpError && <div className="char__jump-error">{jumpError}</div>}
      </div>

      <button
        className="button button__main button__long"
        disabled={newItemsLoading}
        style={{display: charListEnded ? 'none' : 'block'}}
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

CharList.propTypes = {
  onCharSelected: PropTypes.func.isRequired,
};

export default CharList;
