import {NavLink, Link} from 'react-router-dom';

import './app-header.scss';

const AppHeader = () => {
	const saveScrollCharPosition = () => {
		const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 100;
		sessionStorage.setItem('scrollCharPosition', scrollPosition);
	};

	const saveScrollComicPosition = () => {
		const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 100;
		sessionStorage.setItem('scrollComicPosition', scrollPosition);
	};

  return (
    <header className="app__header">
      <h1 className="app__title">
        <Link 
					to="/"
					onClick={() => sessionStorage.setItem('scrollCharPosition', null)}
				>
          <span>Marvel</span> information portal
        </Link>
      </h1>
      <nav className="app__menu">
        <ul>
          <li>
            <NavLink
              style={({isActive}) => ({color: isActive ? '#9f0013' : 'inherit'})}
              to="/characters"
							onClick={saveScrollComicPosition}
            >
              Characters
            </NavLink>
          </li>
          <li>
            <NavLink
              style={({isActive}) => ({color: isActive ? '#9f0013' : 'inherit'})}
              to="/comics"
							onClick={saveScrollCharPosition}
            >
              Comics
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default AppHeader;
