import {useHttp} from '../hooks/http-hook';

const _apiKey = process.env.REACT_APP_COMICVINE_API_KEY;

const useComicVineService = () => {
  const {request, clearError, process, setProcess} = useHttp();
  const _apiBase = '/api/vine';
  const _baseOffset = 0;

  const _getAuthParams = () => {
    return `api_key=${_apiKey}&format=json`;
  };

  const getAllCharacters = async (offset = _baseOffset) => {
    const result = await request(
      `${_apiBase}/characters?limit=9&offset=${offset}&${_getAuthParams()}`,
    );
    return result.results.map(_transformCharacter);
  };

  const getCharacterByName = async (name) => {
    const res = await request(`${_apiBase}/characters?filter=name:${encodeURIComponent(name)}&${_getAuthParams()}`);
    return res.results.map(_transformCharacter);
  };

  const getCharacterbyNameInput = async (pers) => {
    const res = await request(`${_apiBase}/characters?filter=name:${encodeURIComponent(pers)}&${_getAuthParams()}`);
    return res.results.map(_transformCharacter);
  };

  const getCharacter = async (id) => {
    const result = await request(`${_apiBase}/character/4005-${id}?${_getAuthParams()}`);
    return _transformCharacter(result.results);
  };

  const getAllComics = async (offset = _baseOffset) => {
    const res = await request(
      `${_apiBase}/issues?limit=8&offset=${offset}&${_getAuthParams()}`,
    );
    return res.results.map(_transformComic);
  };

  const getComic = async (id) => {
    const res = await request(`${_apiBase}/issue/4000-${id}?${_getAuthParams()}`);
    return _transformComic(res.results);
  };

  const _transformCharacter = (char) => {
    return {
      id: char.id,
      name: char.name,
      description: char.deck
        ? `${char.deck.slice(0, 200)}...`
        : 'Character has no description',
      thumbnail: char.image?.original_url || char.image?.medium_url || 'https://via.placeholder.com/200x200?text=No+Image',
      homepage: char.site_detail_url || '',
      wiki: char.site_detail_url || '',
      comics: char.issue_credits?.slice(0, 10) || [],
    };
  };

  const _stripHtml = (html) => {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch (e) {
      return html;
    }
  };

  const _transformComic = (comic) => {
    const seriesName = comic.volume?.name || '';
    const issueNum = comic.issue_number ? ` #${comic.issue_number}` : '';
    const title = comic.name || `${seriesName}${issueNum}` || 'Unknown Title';
    const rawDescription = comic.description || comic.deck || '';
    return {
      id: comic.id,
      title,
      description: rawDescription
        ? _stripHtml(rawDescription).slice(0, 300) || 'There is no description'
        : 'There is no description',
      pageCount: 'No information about the number of pages',
      thumbnail: comic.image?.original_url || comic.image?.medium_url || 'https://via.placeholder.com/200x300?text=No+Image',
      language: 'en-us',
      price: 'not available',
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

export default useComicVineService;
