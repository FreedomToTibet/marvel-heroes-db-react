import {useState, useMemo, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import ReactDOM from 'react-dom';

import useMarvelService from '../../services/marvel-service';
import useDebounce from '../../hooks/debounce.hook';

import './find-character.scss';

const FindCharacter = () => {
  const {loading, error, getCharacterbyNameInput} = useMarvelService();
  const [dnone, setDnone] = useState(true);
  const [input, setInput] = useState('');
  const [data, setData] = useState([]);
	const inputRef = useRef(null);
	const resultsRef = useRef(null);

  const debouncedData = useDebounce(input, 400);

  useEffect(() => {
    if (input === '') {
      setData([]);
    }
    loadCharacterbyName(debouncedData);
    //eslint-disable-next-line
  }, [debouncedData]);

	// Calculate and set dropdown height whenever the dropdown is shown
  useEffect(() => {
    if (!dnone && input && resultsRef.current) {
      calculateDropdownHeight();
      
      // Recalculate on window resize
      window.addEventListener('resize', calculateDropdownHeight);
      return () => window.removeEventListener('resize', calculateDropdownHeight);
    }
  }, [dnone, input, data.length]);

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
      document.documentElement.style.setProperty('--dropdown-max-height', `${maxHeight}px`);
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
    if (!name) {
      return;
    }
    getCharacterbyNameInput(name).then((data) => setData(data));
  };

  const onBlur = () => {
    setTimeout(() => setDnone(true), 150);
  };

  const onFocus = () => {
    setDnone(false);
  };

  const renderResults = useMemo(
    () =>
      data.map(({id, name, thumbnail}) => (
        <Link to={`${id}`} key={name}>
          <div className="findCharacter__results-wrapper">
            <img src={thumbnail} alt={name} />
            <div className="findCharacter__desc">{name}</div>
          </div>
        </Link>
      )),
    [data],
  );

  const noDisplay = dnone || !input ? 'none' : 'block';

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
            <form>
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
              />
              {data.length === 0 ? null : (
                <div
									ref={resultsRef}
                  className="findCharacter__results"
                  style={{animation: `fadeIn .4s`, display: noDisplay}}
                >
                  {loading ? 'loading ...' : renderResults}
                </div>
              )}
            </form>
          </div>
          {error ? (
            <div style={{fontWeight: 'bold', color: 'red'}}>
              Unknow error, try search again
            </div>
          ) : null}
        </div>
        {/* {dnone ? null : <div className="findCharacter__overlay"></div>} */}
      </section>
      {renderOverlay()}
    </>
  );
};

export default FindCharacter;
