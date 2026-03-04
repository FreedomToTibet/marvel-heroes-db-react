import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import ImageViewer from '../../ui/image-viewer';

import './single-comic-layout.scss';

const SingleComicLayout = ({data}) => { 
  const {title, description, thumbnail, fullSizeImage, issueNumber, volume, coverDate, storeDate} = data;
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

	// Truncate description for SEO meta tag (160 chars max)
	const metaDescription = description.slice(0, 160).trimEnd() + (description.length > 160 ? '...' : '');

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
					content={metaDescription}
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
        <p className="single-comic__info-item">
          <span className="single-comic__info-label">Issue Number:</span> {issueNumber}
        </p>
        <p className="single-comic__info-item">
          <span className="single-comic__info-label">Series:</span> {volume}
        </p>
        <div className="single-comic__date">Cover Date: {coverDate}</div>
        <div className="single-comic__date">Store Date: {storeDate || 'N/A'}</div>
      </div>
      <Link to="/comics" className="single-comic__back">
        Back to all
      </Link>

			<ImageViewer 
        src={fullSizeImage || thumbnail} 
        alt={title} 
        isOpen={isImageViewerOpen} 
        onClose={closeImageViewer} 
      />
    </div>
  );
};

export default SingleComicLayout;
