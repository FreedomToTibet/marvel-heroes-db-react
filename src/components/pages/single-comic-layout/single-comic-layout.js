import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import ImageViewer from '../../ui/image-viewer';

import './single-comic-layout.scss';

const SingleComicLayout = ({data}) => { 
  const {title, description, pageCount, thumbnail, language, price} = data;
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

	const openImageViewer = () => {
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  return (
    <div className="single-comic">
			<Helmet>
				<meta
					name="description"
					content={description}
				/>
				<title>{title}</title>
			</Helmet>
      <img 
				src={thumbnail} alt={title} className="single-comic__img"
				onClick={openImageViewer}
        style={{ cursor: 'zoom-in' }}
			/>
      <div className="single-comic__info">
        <h2 className="single-comic__name">{title}</h2>
        <p className="single-comic__descr">{description}</p>
        <p className="single-comic__descr">{pageCount}</p>
        <p className="single-comic__descr">Language: {language}</p>
        <div className="single-comic__price">{price}</div>
      </div>
      <Link to="/comics" className="single-comic__back">
        Back to all
      </Link>

			<ImageViewer 
        src={thumbnail} 
        alt={title} 
        isOpen={isImageViewerOpen} 
        onClose={closeImageViewer} 
      />
    </div>
  );
};

export default SingleComicLayout;
