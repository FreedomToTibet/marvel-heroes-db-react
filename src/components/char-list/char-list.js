import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';

import Spinner from '../spinner';
import ErrorMessage from '../error-message';
import useMarvelService from '../../services/marvel-service';

import './char-list.scss';

const CharList = (props) => {
  const {loading, error, getAllCharacters} = useMarvelService();

	const [charList, setCharList] = useState([]);
	const [newItemsLoading, setNewItemLoading] = useState(false);
	const [offset, setOffset] = useState(210);
	const [charListEnded, setCharListEnded] = useState(false);

	useEffect(() => {
		onRequest(offset, true);
	}, []);


  const onRequest = (offset, initial) => {
		initial ? setNewItemLoading(false) : setNewItemLoading(true);

    getAllCharacters(offset)
      .then(onCharListLoaded);
  };

  const onCharListLoaded = (newCharList) => {
    let ended = false;
    if (newCharList.length < 9) {
      ended = true;
    }

		setCharList(charList => [...charList, ...newCharList]);
		setNewItemLoading(newItemsLoading => false);
		setOffset(offset => offset + 9);
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

    const items = renderItems(charList);

    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading && !newItemsLoading ? <Spinner /> : null;

    // const content = !(loading || error) ? items : null;

    return (
      <div className="char__list">
        {errorMessage}
        {spinner}
        {/* {content} */}
        {items}
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
