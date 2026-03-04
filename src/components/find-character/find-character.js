import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import useComicVineService from '../../services/comicvine-service';
import useDebounce from '../../hooks/debounce-hook';

import './find-character.scss';

const FindCharacter = ({onCharSelected}) => {
  const {getCharacterbyNameInput} = useComicVineService();
  const [dnone, setDnone] = useState(true);
  const [input, setInput] = useState('');
  const [data, setData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [emptyResults, setEmptyResults] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const clickInProgress = useRef(false);

  const debouncedData = useDebounce(input, 300);

  useEffect(() => {
    // Clear suggestions if input is less than 2 characters
    if (input.length < 2) {
      setData([]);
      setSearchLoading(false);
      setSearchError(null);
      setEmptyResults(false);
			return;
    }
    // Only trigger API call when debounced value has 2+ characters
    if (debouncedData && debouncedData.length >= 2) {
      loadCharacterbyName(debouncedData);
    }
    //eslint-disable-next-line
  }, [debouncedData, input]);

  // Show dropdown if there's content to display
  const shouldShowDropdown = !dnone && input.length >= 2 && (searchLoading || searchError || emptyResults || data.length > 0);

  // Calculate and set dropdown height whenever the dropdown is shown
  useEffect(() => {
    if (shouldShowDropdown && input && resultsRef.current) {
      calculateDropdownHeight();

      // Recalculate on window resize
      window.addEventListener('resize', calculateDropdownHeight);
      return () => window.removeEventListener('resize', calculateDropdownHeight);
    }
  }, [shouldShowDropdown, input, data.length, searchLoading, searchError, emptyResults]);

  // Function to calculate the available height
  const calculateDropdownHeight = () => {
    if (inputRef.current) {
      // Get the input's position relative to the viewport
      const inputRect = inputRef.current.getBoundingClientRect();

      // Calculate distance from input bottom to window bottom
      const distanceToBottom = window.innerHeight - inputRect.bottom - 20; // 20px buffer

      // Set a minimum height
      const minHeight = 100;
      const maxHeight = Math.max(minHeight, distanceToBottom);

      // Set the CSS variable
      document.documentElement.style.setProperty(
        '--dropdown-max-height',
        `${maxHeight}px`,
      );
    }
  };

  // off scroll when overlay is shown
  useEffect(() => {
    if (!dnone) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Get scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Add padding to body equal to scrollbar width to prevent content shifting
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      // Hide overflow but keep position
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'auto';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      // Cleanup function to restore normal scrolling when component unmounts
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [dnone]);

  const loadCharacterbyName = (name) => {
    if (!name || name.length < 2) {
      return;
    }
    
    // Set loading state before request
    setSearchLoading(true);
    setSearchError(null);
    setEmptyResults(false);
    
    getCharacterbyNameInput(name)
      .then(({results}) => {
        setData(results);
        // Distinguish empty results from API error
        if (results.length === 0) {
          setEmptyResults(true);
        } else {
          setEmptyResults(false);
        }
        setSearchLoading(false);
      })
      .catch((error) => {
        console.error('Error loading character data:', error);
        setSearchError('Search unavailable, please try again');
        setData([]);
        setEmptyResults(false);
        setSearchLoading(false);
      });
  };

  const onBlur = () => {
    if (clickInProgress.current) {
      return;
    }
    setTimeout(() => setDnone(true), 150);
  };

  const onFocus = () => {
    setDnone(false);
  };

  // Handle character selection
  const handleCharacterSelect = (id) => {
    clickInProgress.current = true;

    setDnone(true);
    setInput('');

		if (inputRef.current) {
			inputRef.current.blur();
		}

    setTimeout(() => {
      onCharSelected(id);
      sessionStorage.setItem('lastSelectedCharIndex', -1);
      // Reset flag after processing
      clickInProgress.current = false;
    }, 50);
  };

  const renderResults = data.map(({id, name, thumbnail}) => (
    <div
      className="findCharacter__results-wrapper"
      key={id}
			onMouseDown={(e) => {
        // Prevent the onBlur from firing
        e.preventDefault();
        handleCharacterSelect(id);
      }}
    >
      <img src={thumbnail} alt={name} />
      <div className="findCharacter__desc">{name}</div>
    </div>
  ));

  // Render dropdown content based on state
  const renderDropdownContent = () => {
    if (searchLoading) {
      return (
        <div className="findCharacter__status">
          <div style={{textAlign: 'center', padding: '20px'}}>
            Loading...
          </div>
        </div>
      );
    }
    
    if (searchError) {
      return (
        <div className="findCharacter__status">
          <div style={{textAlign: 'center', padding: '20px', color: '#d32f2f'}}>
            {searchError}
          </div>
        </div>
      );
    }
    
    if (emptyResults) {
      return (
        <div className="findCharacter__status">
          <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
            No characters found for '{input}'
          </div>
        </div>
      );
    }
    
    if (data.length > 0) {
      return renderResults;
    }
    
    return null;
  };

  // creating portal for overlay
  const renderOverlay = () => {
    if (dnone) return null;

    return ReactDOM.createPortal(
      <div className="global-overlay" onClick={() => setDnone(true)} />,
      document.body,
    );
  };

  return (
    <>
      <section className="findCharacter">
        <div className="container">
          <div className="findCharacter__block">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                name="find"
                type="text"
                autoComplete="off"
                placeholder="find your favorite HERO"
                disabled={searchLoading}
                style={{opacity: searchLoading ? 0.6 : 1}}
              />
              {shouldShowDropdown && (
                <div
                  ref={resultsRef}
                  className="findCharacter__results"
                  style={{animation: `fadeIn .4s`, display: 'block'}}
                >
                  {renderDropdownContent()}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
      {renderOverlay()}
    </>
  );
};

export default FindCharacter;
