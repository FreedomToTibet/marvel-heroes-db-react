import React, {useState, useEffect} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowCircleDown, faArrowCircleUp} from '@fortawesome/free-solid-svg-icons';

const AppWrap = (Component) =>
  function HOC() {
    const [isVisible, setIsVisible] = useState(false);
		const [isHoveredTop, setIsHoveredTop] = useState(false);
		const [isHoveredBottom, setIsHoveredBottom] = useState(false);

    useEffect(() => {
      const toggleVisibility = () => {
        if (window.scrollY > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      };

      window.addEventListener('scroll', toggleVisibility);

      return () => {
        window.removeEventListener('scroll', toggleVisibility);
      };
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    };

    return (
      <>
        <Component />
        {isVisible && (
          <div
            onClick={scrollToTop}
						onMouseEnter={() => setIsHoveredTop(true)}
            onMouseLeave={() => setIsHoveredTop(false)}
            style={{
              cursor: 'pointer',
              position: 'fixed',
              bottom: '60px',
              left: '85px',
							fontSize: '40px',
              visibility: isVisible ? 'visible' : 'hidden',
							transform: isHoveredTop ? 'scale(1.1)' : 'scale(1)',
  						transition: 'transform 0.2s ease-in-out',
            }}
          >
            <FontAwesomeIcon 
							icon={faArrowCircleUp} 
							color ='#9F0013'
						/>
          </div>
        )}

{isVisible && (
          <div
            onClick={scrollToBottom}
						onMouseEnter={() => setIsHoveredBottom(true)}
            onMouseLeave={() => setIsHoveredBottom(false)}
            style={{
              cursor: 'pointer',
              position: 'fixed',
              bottom: '10px',
              left: '85px',
							fontSize: '40px',
              visibility: isVisible ? 'visible' : 'hidden',
							transform: isHoveredBottom ? 'scale(1.1)' : 'scale(1)',
  						transition: 'transform 0.2s ease-in-out',
            }}
          >
            <FontAwesomeIcon 
							icon={faArrowCircleDown} 
							color ='#9F0013'
						/>
          </div>
        )}
      </>
    );
  };

export default AppWrap;
