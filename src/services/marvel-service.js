import {useHttp} from '../hooks/http-hook';

// Cache version for API migration - invalidates old Marvel API cache
const CACHE_VERSION = 'cv_v1';

// SessionStorage cache keys used by this service
const CACHE_KEYS = [
  'storageCharList',
  'storageCharOffset',
  'storageComicsList',
  'storageComicsOffset',
  'lastSelectedCharIndex',
  'scrollCharPosition',
  'scrollComicPosition'
];

// Flag to ensure cache validation runs only once per app session
let cacheValidated = false;

/**
 * Validates cache version and clears old Marvel API cache if needed.
 * This function runs once on first service initialization to ensure
 * old Marvel-structured cache doesn't break the migrated Comic Vine app.
 */
const validateAndClearOldCache = () => {
  const storedVersion = sessionStorage.getItem('apiCacheVersion');
  
  if (storedVersion !== CACHE_VERSION) {
    // Clear all API-related cache keys
    CACHE_KEYS.forEach(key => sessionStorage.removeItem(key));
    
    // Set new cache version
    sessionStorage.setItem('apiCacheVersion', CACHE_VERSION);
    
    console.log(`Cache cleared: migrated from ${storedVersion || 'Marvel API'} to ${CACHE_VERSION}`);
  }
};

const useMarvelService = () => {
  // Validate and clear old cache once on first initialization
  if (!cacheValidated) {
    validateAndClearOldCache();
    cacheValidated = true;
  }

  const {request, clearError, process, setProcess} = useHttp();

	const _apiBase = 'https://gateway.marvel.com/v1/public/';
  const _publicKey = window._env_?.REACT_APP_MARVEL_PUBLIC_KEY;
  const _privateKey = window._env_?.REACT_APP_MARVEL_PRIVATE_KEY;
  const _baseOffset = 210;

	const _getAuthParams = () => {
    const ts = 1;
    const hash = md5(ts + _privateKey + _publicKey);
    return `ts=${ts}&apikey=${_publicKey}&hash=${hash}`;
  };

  const getAllCharacters = async (offset = _baseOffset) => {
    const result = await request(
      `${_apiBase}characters?limit=9&offset=${offset}&${_getAuthParams()}`,
    );
    return result.data.results.map(_transformCharacter);
  };

	const getCharacterByName = async (name) => {
		const res = await request(`${_apiBase}characters?name=${name}&${_getAuthParams()}`);
		return res.data.results.map(_transformCharacter);
	};

	const getCharacterbyNameInput = async (pers) => {
		const res = await request(`${_apiBase}characters?nameStartsWith=${pers}&orderBy=name&${_getAuthParams()}`);
		return res.data.results.map(_transformCharacter);
	};

  const getCharacter = async (id) => {
    const result = await request(`${_apiBase}characters/${id}?${_getAuthParams()}`);
    return _transformCharacter(result.data.results[0]);
  };

  const getAllComics = async (offset = 0) => {
    const res = await request(
      `${_apiBase}comics?orderBy=issueNumber&limit=8&offset=${offset}&${_getAuthParams()}`,
    );
    return res.data.results.map(_transformComic);
  };

  const getComic = async (id) => {
    const res = await request(`${_apiBase}comics/${id}?${_getAuthParams()}`);
    return _transformComic(res.data.results[0]);
  };

  const _transformCharacter = (char) => {
    return {
      id: char.id,
      name: char.name,
      description: char.description
        ? `${char.description.slice(0, 200)}...`
        : (char.description = 'Character has no description'),
      thumbnail: char.thumbnail.path + '.' + char.thumbnail.extension,
      comics: char.comics.items,
    };
  };

  const _transformComic = (comics) => {
    return {
      id: comics.id,
      title: comics.title,
      description: comics.description || 'There is no description',
      pageCount: comics.pageCount
        ? `${comics.pageCount} p.`
        : 'No information about the number of pages',
      thumbnail: comics.thumbnail.path + '.' + comics.thumbnail.extension,
      language: comics.textObjects[0]?.language || 'en-us',
      // optional chaining operator
      price: comics.prices[0].price ? `${comics.prices[0].price}$` : 'not available',
    };
  };

  return {
    clearError,
		process,
		setProcess,
    getAllCharacters,
		getCharacterByName,
		getCharacterbyNameInput,
    getCharacter,
    getAllComics,
    getComic,
  };
};

export default useMarvelService;
