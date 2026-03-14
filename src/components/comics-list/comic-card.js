import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

/**
 * ComicCard - Pure presentational component for comic list item
 * 
 * Displays a single comic card with thumbnail, title, and issue number.
 * Wraps content in Link for navigation. Calls onSaveScroll before navigation.
 */
const ComicCard = ({
  id,
  title,
  thumbnail,
  issueNumber,
  onSaveScroll,
}) => {
  return (
    <li className="comics__item">
      <Link to={`/comics/${id}`} onClick={onSaveScroll}>
        <img src={thumbnail} alt={title} className="comics__item-img" />
        <div className="comics__item-name">{title}</div>
        <div className="comics__item-price">Issue #{issueNumber}</div>
      </Link>
    </li>
  );
};

ComicCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  issueNumber: PropTypes.number.isRequired,
  onSaveScroll: PropTypes.func.isRequired,
};

export default ComicCard;
