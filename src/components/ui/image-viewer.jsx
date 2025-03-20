import React, { useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';
import './image-viewer.scss';

const ANIMATION_DURATION = 300;

const ImageViewer = ({ src, alt, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(isOpen);
  const [fullSize, setFullSize] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowViewer(true);
      // Reset to fit-to-screen mode when opening
      setFullSize(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (fullSize) {
          // If in full-size mode, first go back to fit mode
          setFullSize(false);
        } else {
          // Otherwise close the viewer
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        // Toggle full-size mode with F key
        setFullSize(prev => !prev);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, fullSize]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleClose = () => {
    if (fullSize) {
      setFullSize(false);
    } else {
      onClose();
    }
  };

  const toggleFullSize = (e) => {
    e.stopPropagation();
    setFullSize(prev => !prev);
  };

  const handleExited = () => {
    setShowViewer(false);
  };

  if (!showViewer) return null;

  return (
    <Transition
      in={isOpen}
      timeout={ANIMATION_DURATION}
      onExited={handleExited}
      unmountOnExit={false}
    >
      {(state) => (
        <div 
          className={`image-viewer ${state} ${fullSize ? 'image-viewer--full-size' : ''}`} 
          onClick={handleClose}
        >
          <div 
            className="image-viewer__content" 
            onClick={(e) => e.stopPropagation()}
          >
            {loading && <div className="image-viewer__loading">Loading...</div>}
            <img 
              src={src} 
              alt={alt} 
              className="image-viewer__img" 
              onLoad={handleImageLoad}
              style={{ 
                display: loading ? 'none' : 'block',
                cursor: fullSize ? 'zoom-out' : 'zoom-in' 
              }}
              onClick={toggleFullSize}
            />
          </div>
        </div>
      )}
    </Transition>
  );
};

export default ImageViewer;