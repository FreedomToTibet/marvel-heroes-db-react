import React from 'react';
import PropTypes from 'prop-types';
import { isValidImage } from '../../utils/html-utils';

/**
 * CharCard - Pure presentational component for character list item
 * 
 * Displays a single character card with thumbnail, name, and selection state.
 * Delegates all logic (selection, focus, sessionStorage) to parent component.
 */
const CharCard = ({
  id,
  name,
  thumbnail,
  index,
  selected,
  onSelect,
  itemRef,
}) => {
  // Use Comic Vine image validation instead of Marvel-specific checks
  const imgStyle = isValidImage(thumbnail)
    ? { objectFit: 'cover' }
    : { objectFit: 'unset' };

  const className = selected ? 'char__item char__item_selected' : 'char__item';

  return (
    <li
      className={className}
      tabIndex={0}
      ref={itemRef}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          onSelect();
        }
      }}
    >
      <img src={thumbnail} alt={name} style={imgStyle} />
      <div className="char__name">{name}</div>
    </li>
  );
};

CharCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  itemRef: PropTypes.func.isRequired,
};

export default CharCard;
