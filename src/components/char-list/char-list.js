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

	const [charList, setCharList] = useState(!storageCharList ? [] : storageCharList);
	const [newItemsLoading, setNewItemLoading] = useState(false);
	const [offset, setOffset] = useState(!storageCharOffset ? 210 : storageCharOffset);
	const [charListEnded, setCharListEnded] = useState(false);

	useEffect(() => {
		onRequest(offset, true);
	}, []);


  const onRequest = (offset, initial) => {
		initial ? setNewItemLoading(false) : setNewItemLoading(true);

    getAllCharacters(offset)
      .then(onCharListLoaded)
			.then(() => setProcess('confirmed'));
  };

  const onCharListLoaded = (newCharList) => {
    let ended = false;
    if (newCharList.length < 9) {
      ended = true;
    }

		setCharList(charList => [...charList, ...newCharList]);
		setNewItemLoading(newItemsLoading => false);
		setOffset(offset => offset + 9);
		sessionStorage.setItem('storageCharOffset', offset);
		sessionStorage.setItem('storageCharList', JSON.stringify(charList));
		setCharListEnded(charListEnded => ended);
  };

  const itemRefs = useRef([]);

  const focusOnItem = (id) => {
    itemRefs.current.forEach((item) => item.classList.remove('char__item_selected'));
    itemRefs.current[id].classList.add('char__item_selected');
    itemRefs.current[id].focus();
  };

  function renderItems (arr) {
    const items = arr.map((item, i) => {
      let imgStyle = {objectFit: 'cover'};

      if (
        item.thumbnail.includes('image_not_available') ||
        item.thumbnail.includes('4c002e0305708.gif')
      ) {
        imgStyle = {objectFit: 'unset'};
      }

      return (
        <li
          className="char__item"
          key={item.id}
          tabIndex={0}
          ref={element => itemRefs.current[i] = element}
          onClick={() => {
            props.onCharSelected(item.id);
            focusOnItem(i);
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              props.onCharSelected(item.id);
              focusOnItem(i);
            }
          }}
        >
          <img src={item.thumbnail} alt={item.name} style={imgStyle} />
          <div className="char__name">{item.name}</div>
        </li>
      );
    });

    return <ul className="char__grid">{items}</ul>;
  };

	const charListMemo = useMemo(() => {
		return setContent(process, () => renderItems(charList), newItemsLoading)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [process])

    return (
      <div className="char__list">
        {charListMemo}
        <button
          className="button button__main button__long"
          disabled={newItemsLoading}
          style={{display: charListEnded ? 'none' : 'block'}}
          onClick={() => onRequest(offset)}
        >
          <div className="inner">load more</div>
        </button>
      </div>
    );
}

CharList.propTypes = {
  onCharSelected: PropTypes.func.isRequired,
};

export default CharList;
