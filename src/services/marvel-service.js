import {useHttp} from '../hooks/http-hook';
import md5 from 'md5';

const useMarvelService = () => {
  const {request, clearError, process, setProcess} = useHttp();

	const _apiBase = 'https://gateway.marvel.com/v1/public/';
  const _publicKey = '09914633d73cae02fd803d05314996ce';
  const _privateKey = '1d3dafa314cc3f241f57f34acfe8db519328b47c';
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
