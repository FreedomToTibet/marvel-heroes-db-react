import {useHttp} from '../hooks/http-hook';

const useComicVineService = () => {
  const {request, clearError, process, setProcess} = useHttp();

  const _apiBase = '/api/vine';
  const _apiKey = window._env_?.REACT_APP_COMICVINE_API_KEY || process.env.REACT_APP_COMICVINE_API_KEY;
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
    const res = await request(`${_apiBase}/characters?filter=name:${name}&${_getAuthParams()}`);
    return res.results.map(_transformCharacter);
  };

  const getCharacterbyNameInput = async (pers) => {
    const res = await request(`${_apiBase}/characters?filter=name:${pers}&${_getAuthParams()}`);
    return res.results.map(_transformCharacter);
  };

  const getCharacter = async (id) => {
    const result = await request(`${_apiBase}/character/4005-${id}?${_getAuthParams()}`);
    return _transformCharacter(result.results);
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
      comics: char.volume_credits?.slice(0, 10) || [],
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
  };
};

export default useComicVineService;
