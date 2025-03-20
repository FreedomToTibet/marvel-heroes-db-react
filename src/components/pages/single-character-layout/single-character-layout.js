import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import { Helmet } from 'react-helmet';

import ImageViewer from '../../ui/image-viewer';
import './single-character-layout.scss';

const SingleCharacterLayout = ({data}) => {
  const {name, description, thumbnail} = data;
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

	const openImageViewer = () => {
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };

	const charDescription = description ? description : 'There is no description for this character.';

  return (
    <div className="single-comic">
			<Helmet>
				<meta
					name="description"
					content={charDescription}
				/>
				<title>{name}</title>
			</Helmet>
      <img 
				src={thumbnail} 
				alt={name} className="single-comic__char-img"
				onClick={openImageViewer}
        style={{ cursor: 'zoom-in' }}
			/>
      <div className="single-comic__info">
        <h2 className="single-comic__name">{name}</h2>
        <p className="single-comic__descr">{description}</p>
      </div>
			
      <Link to="/" className="single-comic__back">
        Back to all
      </Link>

			<ImageViewer 
        src={thumbnail} 
        alt={name} 
        isOpen={isImageViewerOpen} 
        onClose={closeImageViewer} 
      />
    </div>
  );
};

export default SingleCharacterLayout;
